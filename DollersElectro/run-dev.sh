#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PORT=5001
FRONTEND_PORT=3000
MONGO_PORT=27017

BACKEND_LOG="$ROOT_DIR/backend-dev.log"
FRONTEND_LOG="$ROOT_DIR/frontend-dev.log"

LOCK_FILE="$ROOT_DIR/run-dev.lock"

backend_pid=""
frontend_pid=""

log() {
  printf "%s %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

acquire_lock() {
  if [[ -f "$LOCK_FILE" ]]; then
    local existing_pid
    existing_pid=$(cat "$LOCK_FILE" 2>/dev/null || true)
    if [[ -n "$existing_pid" ]] && kill -0 "$existing_pid" >/dev/null 2>&1; then
      log "run-dev.sh is already running (PID: $existing_pid)."
      log "Stop it first or use that running window."
      exit 0
    fi
    rm -f "$LOCK_FILE" >/dev/null 2>&1 || true
  fi

  echo "$$" >"$LOCK_FILE"
}

check_cmd() {
  command -v "$1" >/dev/null 2>&1
}

port_open() {
  local port="$1"
  lsof -i ":$port" >/dev/null 2>&1
}

http_ok() {
  local url="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)
  if [[ "$code" =~ ^2|3 ]]; then
    return 0
  fi
  return 1
}

start_mongo() {
  if port_open "$MONGO_PORT"; then
    return 0
  fi
  if check_cmd brew; then
    log "MongoDB not detected. Attempting to start via brew services..."
    brew services start mongodb-community >/dev/null 2>&1 || true
  fi
  for _ in {1..10}; do
    if port_open "$MONGO_PORT"; then
      log "MongoDB is running."
      return 0
    fi
    sleep 1
  done
  log "MongoDB is not running on port $MONGO_PORT. Please start it and this script will retry."
  return 1
}

start_backend() {
  log "Starting backend..."
  (cd "$BACKEND_DIR" && npm run dev) >"$BACKEND_LOG" 2>&1 &
  backend_pid=$!
  sleep 2
  log "Backend PID: $backend_pid (logs: $BACKEND_LOG)"
}

start_frontend() {
  log "Starting frontend..."
  (cd "$FRONTEND_DIR" && npm start) >"$FRONTEND_LOG" 2>&1 &
  frontend_pid=$!
  sleep 2
  log "Frontend PID: $frontend_pid (logs: $FRONTEND_LOG)"
}

stop_child() {
  local pid="$1"
  if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
    kill "$pid" >/dev/null 2>&1 || true
  fi
}

cleanup() {
  log "Stopping services..."
  stop_child "$backend_pid"
  stop_child "$frontend_pid"
  rm -f "$LOCK_FILE" >/dev/null 2>&1 || true
  exit 0
}

trap cleanup INT TERM

if ! check_cmd npm || ! check_cmd lsof || ! check_cmd curl; then
  log "Missing required tools: npm, lsof, or curl. Please install them and retry."
  exit 1
fi

acquire_lock

log "Watching and auto-restarting frontend/backend. Press Ctrl+C to stop."

while true; do
  start_mongo || true

  if [[ -z "$backend_pid" ]] || ! kill -0 "$backend_pid" >/dev/null 2>&1; then
    start_backend
  fi
  if ! http_ok "http://localhost:$BACKEND_PORT/api/health"; then
    log "Backend health check failed. Restarting backend..."
    stop_child "$backend_pid"
    backend_pid=""
    start_backend
  fi

  if [[ -z "$frontend_pid" ]] || ! kill -0 "$frontend_pid" >/dev/null 2>&1; then
    start_frontend
  fi
  if ! http_ok "http://localhost:$FRONTEND_PORT"; then
    log "Frontend health check failed. Restarting frontend..."
    stop_child "$frontend_pid"
    frontend_pid=""
    start_frontend
  fi

  sleep 5
done
