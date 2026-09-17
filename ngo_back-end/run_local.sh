#!/usr/bin/env bash
set -euo pipefail

backend_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
venv_python="$backend_dir/.venv/bin/python"
mongo_bin="${MONGOD_BIN:-$(command -v mongod || true)}"
mongo_shell="${MONGOSH_BIN:-$(command -v mongosh || true)}"
mongo_data_dir="$backend_dir/data/local-db"
mongo_log="$backend_dir/data/local-mongod.log"
mongo_pid="$backend_dir/data/local-mongod.pid"

if [[ ! -x "$venv_python" ]]; then
  echo "Run ./setup_local.sh first."
  exit 1
fi

if [[ -z "$mongo_bin" || -z "$mongo_shell" ]]; then
  echo "MongoDB server and mongosh are required."
  exit 1
fi

mkdir -p "$mongo_data_dir"

if ! "$mongo_shell" --quiet --host 127.0.0.1 --port 27017 --eval "quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)" >/dev/null 2>&1; then
  "$mongo_bin" \
    --dbpath "$mongo_data_dir" \
    --bind_ip 127.0.0.1 \
    --port 27017 \
    --fork \
    --logpath "$mongo_log" \
    --pidfilepath "$mongo_pid"
fi

if [[ "${SEED_LOCAL_ADMIN:-true}" == "true" ]]; then
  "$venv_python" "$backend_dir/seed_local.py"
fi

export HOST="${HOST:-127.0.0.1}"
export PORT="${PORT:-5001}"
export FLASK_DEBUG="${FLASK_DEBUG:-true}"
export AWS_ENABLED="${AWS_ENABLED:-false}"

cd "$backend_dir"
exec "$venv_python" app.py
