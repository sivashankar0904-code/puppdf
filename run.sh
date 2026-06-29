#!/usr/bin/env bash
# puppdf launcher for Bash (Mac / Linux / Git Bash on Windows)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check for Node.js
if ! command -v node &>/dev/null; then
  echo "[puppdf] Error: Node.js is not installed or not on PATH."
  echo "  Install it from https://nodejs.org (v18+) and re-run."
  exit 1
fi

NODE_VERSION=$(node -e "process.stdout.write(process.version.slice(1).split('.')[0])")
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "[puppdf] Error: Node.js v18+ required (found v${NODE_VERSION})."
  exit 1
fi

# Auto-install dependencies if node_modules is missing
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo "[puppdf] Installing dependencies..."
  (cd "$SCRIPT_DIR" && npm install --silent)
fi

exec node "$SCRIPT_DIR/index.js" "$@"
