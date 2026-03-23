import Foundation
import Observation
import Virtualization
import os.log

private let logger = Logger(subsystem: "com.elazya.app", category: "VMManager")

/// Manages the lifecycle of the persistent Elazya sandbox VM.
///
/// The VM is **persistent** — created once on first launch, reused on every
/// subsequent launch. Agent data, CRM state, learned patterns, and memory
/// all survive between restarts.
///
/// Lifecycle:
///   First launch:  provision() → start() → running
///   Normal launch: start() → running (reuses existing disk)
///   App quit:      stop() → stopped (VM data preserved on disk)
///   Crash:         delegate detects → auto-restart
@MainActor
@Observable
final class VMManager: NSObject {

    // MARK: - Singleton

    static let shared = VMManager()

    // MARK: - State

    enum State: String, Sendable, CustomStringConvertible {
        case unprovisioned      // First launch, no VM image yet
        case stopped            // VM exists but not running
        case provisioning       // Creating VM image for first time
        case starting           // Booting the VM
        case running            // VM is up and agents are active
        case stopping           // Graceful shutdown in progress
        case error              // Something went wrong

        var description: String { rawValue }
    }

    private(set) var state: State = .stopped
    private(set) var lastError: String?
    private(set) var bootTime: Date?
    private(set) var isFirstLaunch: Bool = false

    private var virtualMachine: VZVirtualMachine?
    private var socketDevice: VZVirtioSocketDevice?
    private var autoRestartCount: Int = 0
    private let maxAutoRestarts = 3

    // MARK: - Initialization

    private override init() {
        super.init()
        // Detect initial state
        if VMConfiguration.isProvisioned {
            state = .stopped
        } else {
            state = .unprovisioned
            isFirstLaunch = true
        }
    }

    // MARK: - Main Lifecycle

    /// Boots the VM. On first launch, provisions the disk image first.
    /// On subsequent launches, reuses the existing persistent image.
    func boot() async {
        switch state {
        case .running, .starting, .provisioning:
            logger.info("VM already \(self.state.rawValue), skipping boot")
            return
        case .unprovisioned:
            await provisionAndStart()
        case .stopped, .error:
            await start()
        case .stopping:
            logger.warning("VM is stopping, cannot boot yet")
            return
        }
    }

    /// First-time setup: create disk image, then start.
    private func provisionAndStart() async {
        state = .provisioning
        lastError = nil
        logger.info("First launch — provisioning VM...")

        do {
            // Create directories and sparse disk image
            try VMConfiguration.provision()
            logger.info("VM provisioned at \(VMConfiguration.vmDirectory.path)")

            // Check if kernel/initrd are present (user needs to build VM image)
            guard VMConfiguration.isBootable else {
                state = .error
                lastError = "VM image not built yet. Run: make -C vm all install"
                logger.error("Missing kernel/initrd. User needs to build VM image.")
                return
            }

            isFirstLaunch = true
            await start()
        } catch {
            state = .error
            lastError = "Provisioning failed: \(error.localizedDescription)"
            logger.error("Provisioning failed: \(error.localizedDescription)")
        }
    }

    /// Starts the VM from existing persistent disk image.
    private func start() async {
        state = .starting
        lastError = nil
        logger.info("Starting VM (CPUs: \(VMConfiguration.cpuCount), RAM: \(VMConfiguration.memorySize / 1024 / 1024)MB)")

        guard VMConfiguration.isBootable else {
            state = .error
            lastError = "VM image files not found. Run: make -C vm all install"
            return
        }

        // Build VM configuration
        let config: VZVirtualMachineConfiguration
        do {
            config = try VMConfiguration.makeConfiguration()
        } catch {
            state = .error
            lastError = "VM config error: \(error.localizedDescription)"
            logger.error("Config error: \(error.localizedDescription)")
            return
        }

        // Create and boot
        let vm = VZVirtualMachine(configuration: config)
        vm.delegate = self
        self.virtualMachine = vm
        self.socketDevice = vm.socketDevices.first as? VZVirtioSocketDevice

        do {
            try await vm.start()
            state = .running
            bootTime = Date()
            autoRestartCount = 0
            logger.info("VM running. Boot time: \(Date())")
        } catch {
            state = .error
            lastError = "Boot failed: \(error.localizedDescription)"
            logger.error("Boot failed: \(error.localizedDescription)")
            virtualMachine = nil
            socketDevice = nil
        }
    }

    /// Gracefully shuts down the VM, preserving all data on disk.
    func shutdown() async {
        guard state == .running, let vm = virtualMachine else {
            state = .stopped
            return
        }

        state = .stopping
        logger.info("Shutting down VM gracefully (data will persist)...")

        // Try graceful shutdown first (sends ACPI shutdown)
        do {
            try await vm.stop()
            logger.info("VM stopped gracefully")
        } catch {
            // Fall back to force stop
            logger.warning("Graceful shutdown failed, forcing: \(error.localizedDescription)")
            try? vm.requestStop()
        }

        virtualMachine = nil
        socketDevice = nil
        bootTime = nil
        state = .stopped
    }

    /// Force-kills the VM immediately (data written before this point is preserved).
    func forceKill() {
        logger.warning("Force-killing VM")
        if let vm = virtualMachine {
            try? vm.requestStop()
        }
        virtualMachine = nil
        socketDevice = nil
        bootTime = nil
        state = .stopped
    }

    /// Restarts the VM (shutdown → boot).
    func restart() async {
        logger.info("Restarting VM...")
        await shutdown()
        // Small delay to ensure clean state
        try? await Task.sleep(nanoseconds: 500_000_000)
        await boot()
    }

    // MARK: - Auto-Restart on Crash

    private func handleCrash(error: Error?) async {
        let errorMsg = error?.localizedDescription ?? "unknown"
        logger.error("VM crashed: \(errorMsg)")
        lastError = "VM crashed: \(errorMsg)"

        virtualMachine = nil
        socketDevice = nil
        bootTime = nil

        // Auto-restart up to N times
        autoRestartCount += 1
        if autoRestartCount <= maxAutoRestarts {
            logger.info("Auto-restarting VM (attempt \(self.autoRestartCount)/\(self.maxAutoRestarts))...")
            state = .stopped
            try? await Task.sleep(nanoseconds: 2_000_000_000) // 2s delay
            await boot()
        } else {
            state = .error
            lastError = "VM crashed \(maxAutoRestarts) times. Manual restart required."
            logger.error("Max auto-restarts reached.")
        }
    }

    // MARK: - Status

    /// How long the VM has been running.
    var uptime: TimeInterval? {
        guard let bootTime, state == .running else { return nil }
        return Date().timeIntervalSince(bootTime)
    }

    /// Human-readable uptime string.
    var uptimeString: String {
        guard let uptime else { return "—" }
        let hours = Int(uptime) / 3600
        let minutes = (Int(uptime) % 3600) / 60
        if hours > 0 { return "\(hours)h \(minutes)m" }
        return "\(minutes)m"
    }

    /// The vsock device for VMBridge communication.
    var vsockDevice: VZVirtioSocketDevice? { socketDevice }

    /// Size of the persistent disk image on host.
    var diskUsage: String {
        guard let attrs = try? FileManager.default.attributesOfItem(
            atPath: VMConfiguration.diskImagePath.path
        ), let size = attrs[.size] as? UInt64 else {
            return "—"
        }
        let formatter = ByteCountFormatter()
        formatter.countStyle = .file
        return formatter.string(fromByteCount: Int64(size))
    }
}

// MARK: - VZVirtualMachineDelegate

extension VMManager: VZVirtualMachineDelegate {
    nonisolated func virtualMachine(
        _ virtualMachine: VZVirtualMachine,
        didStopWithError error: any Error
    ) {
        Task { @MainActor in
            await self.handleCrash(error: error)
        }
    }

    nonisolated func guestDidStop(_ virtualMachine: VZVirtualMachine) {
        Task { @MainActor in
            logger.info("Guest OS stopped normally")
            self.state = .stopped
            self.virtualMachine = nil
            self.socketDevice = nil
            self.bootTime = nil
        }
    }
}
