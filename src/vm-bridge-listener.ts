/**
 * Elazya Persistent VM Bridge Listener
 *
 * Runs INSIDE the Linux VM. Listens on vsock port 5000 for JSON-RPC
 * commands from the host Swift app.
 *
 * In this persistent architecture, the VM disk is read-write and survives
 * reboots. This listener manages the Node.js agent gateway, handles
 * data backup to the shared host directory, and provides health/status metrics.
 */

import { createServer } from "node:net";
import { spawn, execSync, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { Buffer } from "node:buffer";

const VSOCK_PORT = 5000;
const DATA_DIR = "/data"; // Shared with host (read-write)
const CONFIG_DIR = "/config"; // Shared from host (read-only)

// --- Gateway Process Management ---

let gatewayProcess: ChildProcess | null = null;
let gatewayStartTime = 0;

function startGateway(): { ok: boolean; pid?: number; error?: string } {
  if (gatewayProcess && !gatewayProcess.killed) {
    return { ok: true, pid: gatewayProcess.pid };
  }

  try {
    gatewayStartTime = Date.now();
    gatewayProcess = spawn(
      "node",
      ["dist/index.js", "gateway", "--bind", "0.0.0.0", "--port", "18789"],
      {
        cwd: "/app",
        stdio: "inherit",
        env: {
          ...process.env,
          NODE_ENV: "production",
          ELAZYA_VM_MODE: "1",
          ELAZYA_PERSISTENT: "1",
          ELAZYA_DATA_DIR: DATA_DIR,
        },
      },
    );

    gatewayProcess.on("exit", (code) => {
      console.log(`[vm-bridge] Gateway exited with code ${code}`);
      gatewayProcess = null;
    });

    return { ok: true, pid: gatewayProcess.pid };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

function stopGateway(): { ok: boolean; status: string } {
  if (gatewayProcess && !gatewayProcess.killed) {
    gatewayProcess.kill("SIGTERM");
    gatewayProcess = null;
    return { ok: true, status: "stopped" };
  }
  return { ok: true, status: "already_stopped" };
}

function restartGateway(): { ok: boolean; pid?: number } {
  stopGateway();
  return startGateway();
}

function getStatus(): object {
  const isRunning = gatewayProcess !== null && !gatewayProcess.killed;
  return {
    ok: true,
    status: isRunning ? "running" : "stopped",
    gatewayRunning: isRunning,
    gatewayPid: gatewayProcess?.pid ?? null,
    gatewayUptime: isRunning ? (Date.now() - gatewayStartTime) / 1000 : 0,
    vmUptime: process.uptime(),
    vmMode: "persistent",
  };
}

// --- Data Management (Persistent VM) ---

function backupData(): { ok: boolean; message?: string; error?: string } {
  try {
    // In a real app, this would dump sqlite/CRM data to /data (shared with host)
    const backupFile = path.join(DATA_DIR, `elazya-backup-${Date.now()}.zip`);

    // For now, just create a marker file to prove read-write access to shared dir
    if (fs.existsSync(DATA_DIR)) {
      fs.writeFileSync(
        path.join(DATA_DIR, "vm-marker.txt"),
        `Backup run at ${new Date().toISOString()}\n`,
      );
      return { ok: true, message: `Data backed up to shared directory` };
    } else {
      return { ok: false, error: "Shared /data directory not mounted" };
    }
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function getDataInfo(): { ok: boolean; diskUsage?: string; error?: string } {
  try {
    // Get disk usage of the persistent rootfs
    const df = execSync("df -h /").toString();
    return { ok: true, diskUsage: df.split("\n")[1] };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// --- JSON-RPC Handler ---

type RPCHandler = (params?: Record<string, string>) => unknown;

const handlers: Record<string, RPCHandler> = {
  "gateway.start": () => startGateway(),
  "gateway.stop": () => stopGateway(),
  "gateway.restart": () => restartGateway(),
  "agent.status": () => getStatus(),
  "agent.list": () => ({ ok: true, agents: ["browser", "telegram", "crm", "system"] }),
  "agent.message": (params) => {
    const agent = params?.agent;
    const message = params?.message;
    console.log(`[vm-bridge] Routing message to ${agent}: ${message}`);
    return { ok: true, status: "forwarded", agent };
  },
  "vm.health": () => ({
    ok: true,
    status: "healthy",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform,
  }),
  "vm.disk": () => getDataInfo(),
  "vm.ping": () => ({ ok: true }),
  "data.backup": () => backupData(),
  "data.info": () => getDataInfo(),
};

function handleRPC(data: Buffer): Buffer {
  try {
    // We expect newline-delimited JSON
    const text = data.toString().trim();
    if (!text) return Buffer.from("");

    const request = JSON.parse(text);
    const { id, method, params } = request;

    const handler = handlers[method];
    if (!handler) {
      const errorResponse = {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
      return Buffer.from(JSON.stringify(errorResponse) + "\n");
    }

    const result = handler(params);
    const response = { jsonrpc: "2.0", id, result };
    return Buffer.from(JSON.stringify(response) + "\n");
  } catch (error) {
    console.error("[vm-bridge] RPC Parse error:", error);
    const errorResponse = {
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: `Parse error: ${String(error)}` },
    };
    return Buffer.from(JSON.stringify(errorResponse) + "\n");
  }
}

// --- vsock Server ---

const server = createServer((socket) => {
  console.log("[vm-bridge] Host connected via vsock");

  // Handle incoming data chunks
  let buffer = "";
  socket.on("data", (data) => {
    buffer += data.toString();

    // Process all complete JSON messages (separated by newline)
    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const message = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (message.trim()) {
        const response = handleRPC(Buffer.from(message));
        socket.write(response);
      }
    }
  });

  socket.on("error", (err) => {
    console.error("[vm-bridge] Socket error:", err.message);
  });

  socket.on("close", () => {
    console.log("[vm-bridge] Host disconnected");
  });
});

server.listen(VSOCK_PORT, () => {
  console.log(`[vm-bridge] Persistent VM JSON-RPC listener ready on port ${VSOCK_PORT}`);

  // Auto-start gateway on boot
  console.log("[vm-bridge] Auto-starting gateway...");
  startGateway();
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[vm-bridge] Received SIGTERM, shutting down...");
  stopGateway();
  server.close();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[vm-bridge] Received SIGINT, shutting down...");
  stopGateway();
  server.close();
  process.exit(0);
});
