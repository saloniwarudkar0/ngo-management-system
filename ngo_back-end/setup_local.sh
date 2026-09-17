#!/usr/bin/env bash
set -euo pipefail

backend_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python_bin="${PYTHON_BIN:-/opt/homebrew/bin/python3.12}"

if [[ ! -x "$python_bin" ]]; then
  python_bin="$(command -v python3)"
fi

if [[ ! -x "$backend_dir/.venv/bin/python" ]]; then
  "$python_bin" -m venv "$backend_dir/.venv"
fi

"$backend_dir/.venv/bin/python" -m pip install --upgrade pip
"$backend_dir/.venv/bin/python" -m pip install -r "$backend_dir/requirements.txt"

echo "Local backend dependencies are ready."
