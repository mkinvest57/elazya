#!/bin/sh
# Elazya VM init script — runs inside the Linux VM at boot.
# Starts the Node.js agent gateway and opens a vsock listener for
# host↔VM JSON-RPC communication.

set -eu

echo "[elazya-vm] Booting Elazya sandbox VM..."

# Mount shared config from host (read-only)
mkdir -p /config
if ! mountpoint -q /config 2>/dev/null; then
    mount -t virtiofs config /config 2>/dev/null || echo "[elazya-vm] Warning: shared config not mounted"
fi

# Set up environment from host config
export HOME=/root
export NODE_ENV=production
export ELAZYA_VM_MODE=1

# Load API keys from shared config if present
if [ -f /config/env ]; then
    echo "[elazya-vm] Loading environment from host config..."
    set -a
    . /config/env
    set +a
fi

# Start the vsock JSON-RPC listener (port 5000)
# This accepts commands from the host Swift app
echo "[elazya-vm] Starting vsock bridge on port 5000..."
node /app/dist/vm-bridge-listener.js &
BRIDGE_PID=$!

# Start the Node.js gateway
echo "[elazya-vm] Starting agent gateway..."
node /app/dist/index.js gateway --bind 0.0.0.0 --port 18789 &
GATEWAY_PID=$!

echo "[elazya-vm] VM ready. Gateway PID=$GATEWAY_PID, Bridge PID=$BRIDGE_PID"

# Wait for any child to exit, then cleanup
wait -n "$BRIDGE_PID" "$GATEWAY_PID" 2>/dev/null || true
echo "[elazya-vm] A child process exited, shutting down..."

kill "$BRIDGE_PID" "$GATEWAY_PID" 2>/dev/null || true
wait 2>/dev/null

echo "[elazya-vm] VM shutdown complete."
