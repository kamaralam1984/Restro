#!/usr/bin/env bash
# Restore MongoDB from a backup. Usage: ./restore-db.sh YYYYMMDD
# Example: ./restore-db.sh 20250301

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_ROOT="${BACKUP_ROOT:-$BACKEND_DIR/backups}"
DATE="${1:?Usage: $0 YYYYMMDD}"
BACKUP_DIR="$BACKUP_ROOT/$DATE"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "Backup not found: $BACKUP_DIR"
  exit 1
fi

if [ -f "$BACKEND_DIR/.env" ]; then
  set -a
  source "$BACKEND_DIR/.env"
  set +a
fi

URI="${MONGODB_URI:-mongodb://localhost:27017/restro-os}"
echo "Restoring from $BACKUP_DIR (--drop will replace current DB)"
read -p "Continue? [y/N] " -n 1 -r; echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then exit 0; fi

mongorestore --uri="$URI" --drop "$BACKUP_DIR"
echo "Done."
