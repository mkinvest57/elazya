import Foundation
import Virtualization

/// Hardware and resource configuration for the Elazya persistent sandbox VM.
///
/// Uses Apple Virtualization Framework (macOS 13+, Apple Silicon).
/// The VM is **persistent** — its disk image, learned data, CRM state, and
/// agent memory survive between app launches. Created once on first boot,
/// reused on every subsequent launch.
@MainActor
struct VMConfiguration {

    // MARK: - Hardware Defaults

    /// CPU cores for the VM. Uses half of host cores (min 2, max 4).
    static var cpuCount: Int {
        let host = ProcessInfo.processInfo.processorCount
        return max(2, min(4, host / 2))
    }

    /// RAM in bytes. Uses 1/4 of host RAM (min 2GB, max 8GB).
    static var memorySize: UInt64 {
        let hostRAM = ProcessInfo.processInfo.physicalMemory
        let quarter = hostRAM / 4
        let twoGB: UInt64 = 2 * 1024 * 1024 * 1024
        let eightGB: UInt64 = 8 * 1024 * 1024 * 1024
        return max(twoGB, min(eightGB, quarter))
    }

    /// Disk image size for initial creation (20 GB sparse — only uses actual space).
    static let initialDiskSize: UInt64 = 20 * 1024 * 1024 * 1024

    // MARK: - Paths

    /// Root directory for all VM files (persistent across launches).
    static var vmDirectory: URL {
        let appSupport = FileManager.default.urls(
            for: .applicationSupportDirectory, in: .userDomainMask
        ).first!
        return appSupport.appendingPathComponent("Elazya/VM", isDirectory: true)
    }

    static var kernelPath: URL { vmDirectory.appendingPathComponent("vmlinuz") }
    static var initrdPath: URL { vmDirectory.appendingPathComponent("initrd") }

    /// Persistent disk image — agent data, CRM, memory, learned patterns live here.
    static var diskImagePath: URL { vmDirectory.appendingPathComponent("elazya-rootfs.img") }

    /// Machine identifier file — stable across reboots for licensing/telemetry.
    static var machineIdentifierPath: URL { vmDirectory.appendingPathComponent("machine-id.bin") }

    /// Host config shared into VM (API keys, user prefs) — read-only mount.
    static var sharedConfigDirectory: URL {
        let home = FileManager.default.homeDirectoryForCurrentUser
        return home.appendingPathComponent(".elazya", isDirectory: true)
    }

    /// Shared data directory — read-write, for files the VM produces and host consumes
    /// (generated PDFs, exported CSVs, reports).
    static var sharedDataDirectory: URL {
        let home = FileManager.default.homeDirectoryForCurrentUser
        return home.appendingPathComponent("Elazya", isDirectory: true)
    }

    // MARK: - VM State Detection

    /// Returns `true` if a VM has been provisioned before (disk image exists).
    static var isProvisioned: Bool {
        FileManager.default.fileExists(atPath: diskImagePath.path)
    }

    /// Returns `true` if all boot files are present.
    static var isBootable: Bool {
        let fm = FileManager.default
        return [kernelPath, initrdPath, diskImagePath].allSatisfy {
            fm.fileExists(atPath: $0.path)
        }
    }

    // MARK: - First-Time Provisioning

    /// Creates the VM directory structure and an empty sparse disk image.
    /// Called only on first launch — subsequent launches reuse the existing image.
    static func provision() throws {
        let fm = FileManager.default

        // Create all directories
        for dir in [vmDirectory, sharedConfigDirectory, sharedDataDirectory] {
            if !fm.fileExists(atPath: dir.path) {
                try fm.createDirectory(at: dir, withIntermediateDirectories: true)
            }
        }

        // Create sparse disk image if it doesn't exist
        if !fm.fileExists(atPath: diskImagePath.path) {
            try createSparseDiskImage(at: diskImagePath, size: initialDiskSize)
        }

        // Generate stable machine identifier if needed
        if !fm.fileExists(atPath: machineIdentifierPath.path) {
            let id = VZGenericMachineIdentifier()
            try id.dataRepresentation.write(to: machineIdentifierPath)
        }
    }

    /// Creates a sparse disk image (only uses actual written space on host).
    private static func createSparseDiskImage(at url: URL, size: UInt64) throws {
        let handle = try FileHandle(forWritingTo: url)
        // ftruncate creates a sparse file — 20GB logical but 0 physical until written
        try handle.truncate(atOffset: size)
        try handle.close()
    }

    // MARK: - Configuration Builder

    /// Creates a `VZVirtualMachineConfiguration` for the persistent VM.
    static func makeConfiguration() throws -> VZVirtualMachineConfiguration {
        let config = VZVirtualMachineConfiguration()

        // --- CPU & Memory (scales with host) ---
        config.cpuCount = min(cpuCount, VZVirtualMachineConfiguration.maximumAllowedCPUCount)
        config.memorySize = max(memorySize, VZVirtualMachineConfiguration.minimumAllowedMemorySize)

        // --- Linux Boot Loader ---
        let bootLoader = VZLinuxBootLoader(kernelURL: kernelPath)
        bootLoader.initialRamdiskURL = initrdPath
        bootLoader.commandLine = [
            "console=hvc0",
            "root=/dev/vda",
            "rw",                     // read-write — persistent!
            "quiet",
            "net.ifnames=0",          // predictable network name (eth0)
            "elazya.persistent=1",    // kernel param flag for init.sh
        ].joined(separator: " ")
        config.bootLoader = bootLoader

        // --- Serial Console (debug) ---
        let serialPort = VZVirtioConsoleDeviceSerialPortConfiguration()
        serialPort.attachment = VZFileHandleSerialPortAttachment(
            fileHandleForReading: FileHandle.nullDevice,
            fileHandleForWriting: FileHandle.standardError
        )
        config.serialPorts = [serialPort]

        // --- Persistent Root Filesystem ---
        let diskAttachment = try VZDiskImageStorageDeviceAttachment(
            url: diskImagePath,
            readOnly: false       // read-write — data persists!
        )
        config.storageDevices = [VZVirtioBlockDeviceConfiguration(attachment: diskAttachment)]

        // --- Network (NAT — internet via host, no host LAN access) ---
        let networkDevice = VZVirtioNetworkDeviceConfiguration()
        networkDevice.attachment = VZNATNetworkDeviceAttachment()
        config.networkDevices = [networkDevice]

        // --- Shared Directories ---
        // 1. Host config → VM /config (read-only: API keys, user prefs)
        let configShare = VZSingleDirectoryShare(
            directory: VZSharedDirectory(url: sharedConfigDirectory, readOnly: true)
        )
        let configDevice = VZVirtioFileSystemDeviceConfiguration(tag: "config")
        configDevice.share = configShare

        // 2. Shared data → VM /data (read-write: generated files)
        let dataShare = VZSingleDirectoryShare(
            directory: VZSharedDirectory(url: sharedDataDirectory, readOnly: false)
        )
        let dataDevice = VZVirtioFileSystemDeviceConfiguration(tag: "data")
        dataDevice.share = dataShare

        config.directorySharingDevices = [configDevice, dataDevice]

        // --- vsock (host↔VM communication) ---
        config.socketDevices = [VZVirtioSocketDeviceConfiguration()]

        // --- Entropy (for /dev/random) ---
        config.entropyDevices = [VZVirtioEntropyDeviceConfiguration()]

        // --- Validate ---
        try config.validate()
        return config
    }
}
