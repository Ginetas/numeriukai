#!/usr/bin/env bash
set -euo pipefail

echo "[precommit] Checking for merge conflict markers..."
if git grep -nE '^(<<<<<<<|=======|>>>>>>>)( .*)?$' -- ':!scripts/precommit-check.sh' ':!.git/*' ':!**/node_modules/*' >/dev/null 2>&1; then
  echo "[precommit] Merge conflict markers found. Please resolve before committing." >&2
  git grep -nE '^(<<<<<<<|=======|>>>>>>>)( .*)?$' -- ':!scripts/precommit-check.sh' ':!.git/*' ':!**/node_modules/*'
  exit 1
fi

echo "[precommit] Verifying line endings are LF for tracked text files..."
if command -v file >/dev/null 2>&1; then
  problem_files=$(git ls-files -z | xargs -0 file | grep CRLF || true)
  if [[ -n "$problem_files" ]]; then
    echo "[precommit] Files with CRLF detected:" >&2
    echo "$problem_files" >&2
    echo "Run: git add --renormalize ." >&2
    exit 1
  fi
else
  echo "[precommit] 'file' utility not available; skipping CRLF scan." >&2
fi

echo "[precommit] Running docker-compose config validation..."
if command -v docker-compose >/dev/null 2>&1; then
  docker-compose config >/dev/null
else
  echo "[precommit] docker-compose not installed; skipping config validation." >&2
fi

echo "[precommit] OK"
