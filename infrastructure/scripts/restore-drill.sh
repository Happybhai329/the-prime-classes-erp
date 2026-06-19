#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE=${1:?Error: Backup file must be specified as first argument}
CONTAINER=${2:-"erp-system-postgres-1"}
DATABASE=${3:-"prime_erp_restore_drill"}
USER=${4:-"prime_admin"}

# 1. Validate BackupFile exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file $BACKUP_FILE does not exist." >&2
  exit 1
fi

# 2. Check if container is running
if ! docker inspect --format='{{.State.Running}}' "$CONTAINER" &>/dev/null; then
  echo "Error: Container $CONTAINER is not running or does not exist." >&2
  exit 1
fi

echo "Preparing restore drill on database: $DATABASE..."

# Drop the database if it exists to ensure a clean slate
echo "Dropping old restore drill database if it exists..."
docker exec "$CONTAINER" dropdb -U "$USER" --if-exists "$DATABASE"

# Create the database fresh
echo "Creating clean database $DATABASE..."
if ! docker exec "$CONTAINER" createdb -U "$USER" "$DATABASE"; then
  echo "Error: Failed to create database $DATABASE" >&2
  exit 1
fi

# Restore the backup file
echo "Restoring backup from $BACKUP_FILE..."
if ! docker exec -i "$CONTAINER" pg_restore -U "$USER" -d "$DATABASE" --clean --if-exists < "$BACKUP_FILE"; then
  echo "Error: pg_restore failed." >&2
  exit 1
fi

# Verify the restore
echo "Verifying restored database..."
if ! docker exec "$CONTAINER" psql -U "$USER" -d "$DATABASE" -c "select now() as restore_verified_at;"; then
  echo "Error: Verification query failed." >&2
  exit 1
fi

echo "Restore drill completed successfully!"
exit 0
