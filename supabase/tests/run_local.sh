#!/usr/bin/env bash
# Spin up a throwaway Postgres, apply bootstrap + migrations, run RLS tests.
# Usage: supabase/tests/run_local.sh [data_dir] [port]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
DATA="${1:-/tmp/cockpit-pg}"
PORT="${2:-54329}"
BIN="$(ls -d /usr/lib/postgresql/*/bin | tail -1)"
RUNAS=""
[ "$(id -u)" = "0" ] && RUNAS="runuser -u postgres --"
rm -rf "$DATA" && mkdir -p "$DATA" && chown -R postgres "$DATA" 2>/dev/null || true
$RUNAS "$BIN/initdb" -D "$DATA" -U postgres -A trust -E UTF8 --locale=C.UTF-8 >/dev/null
$RUNAS "$BIN/pg_ctl" -D "$DATA" -o "-p $PORT -k /tmp" -l "$DATA/log" start >/dev/null
trap '$RUNAS "$BIN/pg_ctl" -D "$DATA" stop -m fast >/dev/null' EXIT
PSQL=(psql -h /tmp -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q)
"${PSQL[@]}" -c "create database cockpit"
"${PSQL[@]}" -d cockpit -f "$HERE/bootstrap_local.sql"
for f in "$ROOT"/migrations/*.sql; do echo "apply $(basename "$f")"; "${PSQL[@]}" -d cockpit -f "$f"; done
"${PSQL[@]}" -d cockpit -f "$HERE/rls_test.sql"
if [ "${KEEP:-0}" = "1" ]; then trap - EXIT; echo "postgres left running on port $PORT (data $DATA)"; fi
