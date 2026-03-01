#!/usr/bin/env bash
# Daily MongoDB backup. Usage: ./backup-db.sh
# Set MONGODB_URI in .env or environment.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_ROOT="${BACKUP_ROOT:-$BACKEND_DIR/backups}"
DATE=$(date +%Y%m%d)
BACKUP_DIR="$BACKUP_ROOT/$DATE"

mkdir -p "$BACKUP_DIR"
if [ -f "$BACKEND_DIR/.env" ]; then
  set -a
  source "$BACKEND_DIR/.env"
  set +a
fi

URI="${MONGODB_URI:-mongodb://localhost:27017/restro-os}"
echo "Backing up to $BACKUP_DIR ..."
mongodump --uri="$URI" --out="$BACKUP_DIR" --gzip 2>/dev/null || mongodump --uri="$URI" --out="$BACKUP_DIR"
echo "Done: $BACKUP_DIR"
