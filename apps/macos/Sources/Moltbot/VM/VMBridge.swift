import Foundation
import Virtualization
import os.log

private let logger = Logger(subsystem: "com.elazya.app", category: "VMBridge")

/// JSON-RPC bridge between the host Swift app and the persistent sandbox VM
/// via virtio socket (vsock).
///
/// All agent operations go through this bridge — the host macOS app never
/// runs agent code directly. The VM persists data between launches.
@MainActor
final class VMBridge {

    static let shared = VMBridge()

    /// vsock port the VM-side listener binds to.
    private let vsockPort: UInt32 = 5000

    /// Timeout for RPC calls.
    private let callTimeout: TimeInterval = 30

    // MARK: - JSON-RPC Types

    struct RPCRequest: Codable {
        let jsonrpc: String
        let id: Int
        let method: String
        let params: [String: String]?

        init(method: String, params: [String: String]? = nil) {
            self.jsonrpc = "2.0"
            self.id = Int.random(in: 1...999_999)
            self.method = method
            self.params = params
        }
    }

    struct RPCResponse: Codable {
        let jsonrpc: String
        let id: Int?
        let result: RPCResult?
        let error: RPCError?

        struct RPCResult: Codable {
            let ok: Bool?
            let status: String?
            let pid: Int?
            let uptime: Double?
            let message: String?
            // Catch-all for extra fields
            let data: [String: String]?
        }

        struct RPCError: Codable {
            let code: Int
            let message: String
        }

        var isSuccess: Bool { error == nil }
    }

    // MARK: - Low-Level RPC

    /// Sends a JSON-RPC call to the VM and returns the parsed response.
    func call(method: String, params: [String: String]? = nil) async throws -> RPCResponse {
        guard VMManager.shared.state == .running else {
            throw BridgeError.vmNotRunning
        }
        guard let device = VMManager.shared.vsockDevice else {
            throw BridgeError.noSocketDevice
        }

        let request = RPCRequest(method: method, params: params)
        let requestData = try JSONEncoder().encode(request)

        logger.debug("RPC → \(method)")

        // Connect via vsock
        let connection = try await device.connect(toPort: vsockPort)

        // Write request
        let fd = connection.fileDescriptor
        let bytes = [UInt8](requestData) + [0x0A] // newline-delimited JSON
        
        let written = bytes.withUnsafeBytes { ptr -> Int in
            return write(fd, ptr.baseAddress, ptr.count)
        }

        guard written == bytes.count else {
            close(fd)
            throw BridgeError.writeFailed
        }

        // Read response
        var responseData = Data()
        let bufferSize = 65536
        let buffer = UnsafeMutablePointer<UInt8>.allocate(capacity: bufferSize)
        defer { buffer.deallocate() }

        let bytesRead = read(fd, buffer, bufferSize)
        close(fd)

        guard bytesRead > 0 else {
            throw BridgeError.readFailed
        }
        responseData.append(buffer, count: bytesRead)

        let response = try JSONDecoder().decode(RPCResponse.self, from: responseData)

        if let rpcError = response.error {
            logger.error("RPC error [\(method)]: \(rpcError.message)")
            throw BridgeError.rpcError(code: rpcError.code, message: rpcError.message)
        }

        logger.debug("RPC ← \(method) OK")
        return response
    }

    // MARK: - Gateway Commands

    /// Starts the Node.js agent gateway inside the VM.
    func startGateway() async throws {
        _ = try await call(method: "gateway.start")
    }

    /// Stops the gateway (agents stop, but VM stays running with data intact).
    func stopGateway() async throws {
        _ = try await call(method: "gateway.stop")
    }

    /// Restarts the gateway without rebooting the VM.
    func restartGateway() async throws {
        _ = try await call(method: "gateway.restart")
    }

    // MARK: - Agent Commands

    /// Gets status of all running agents.
    func agentStatus() async throws -> RPCResponse {
        try await call(method: "agent.status")
    }

    /// Sends a message/command to a specific agent.
    func sendToAgent(_ agent: String, message: String) async throws -> RPCResponse {
        try await call(method: "agent.message", params: [
            "agent": agent,
            "message": message,
        ])
    }

    /// Lists all available agents.
    func listAgents() async throws -> RPCResponse {
        try await call(method: "agent.list")
    }

    // MARK: - VM Health

    /// Gets VM health metrics.
    func healthCheck() async throws -> RPCResponse {
        try await call(method: "vm.health")
    }

    /// Gets disk usage inside the VM.
    func diskUsage() async throws -> RPCResponse {
        try await call(method: "vm.disk")
    }

    /// Checks if the bridge listener is alive (fast ping).
    func ping() async -> Bool {
        do {
            _ = try await call(method: "vm.ping")
            return true
        } catch {
            return false
        }
    }

    // MARK: - Data Management

    /// Triggers a backup of agent data inside the VM to the shared data dir.
    func backupData() async throws -> RPCResponse {
        try await call(method: "data.backup")
    }

    /// Gets info about persistent data (CRM records, memory, learned patterns).
    func dataInfo() async throws -> RPCResponse {
        try await call(method: "data.info")
    }

    // MARK: - Errors

    enum BridgeError: Error, LocalizedError {
        case vmNotRunning
        case noSocketDevice
        case writeFailed
        case readFailed
        case rpcError(code: Int, message: String)
        case timeout

        var errorDescription: String? {
            switch self {
            case .vmNotRunning:
                return "VM is not running. Start Elazya first."
            case .noSocketDevice:
                return "No vsock device available."
            case .writeFailed:
                return "Failed to send command to VM."
            case .readFailed:
                return "Failed to read response from VM."
            case .rpcError(let code, let message):
                return "VM error (\(code)): \(message)"
            case .timeout:
                return "VM did not respond in time."
            }
        }
    }
}
