#!/usr/bin/env bash
set -euo pipefail

CONTAINER=${1:-"erp-system-postgres-1"}
DATABASE=${2:-"prime_erp"}
USER=${3:-"prime_admin"}
OUTPUT_DIR=${4:-"./backups/postgres"}
KEEP_MAX=${5:-7}

# 1. Check if container is running
if ! docker inspect --format='{{.State.Running}}' "$CONTAINER" &>/dev/null; then
  echo "Error: Container $CONTAINER is not running or does not exist." >&2
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
mkdir -p "$OUTPUT_DIR"
OUTPUT="$OUTPUT_DIR/$DATABASE-$TIMESTAMP.dump"

echo "Starting backup of $DATABASE from container $CONTAINER..."

# Run pg_dump
if ! docker exec "$CONTAINER" pg_dump -U "$USER" -Fc "$DATABASE" > "$OUTPUT"; then
  echo "Error: pg_dump failed." >&2
  rm -f "$OUTPUT"
  exit 1
fi

# 2. Validation check: does the file exist and is size > 0?
if [ ! -f "$OUTPUT" ]; then
  echo "Error: Backup file $OUTPUT was not created." >&2
  exit 1
fi

FILE_SIZE=$(wc -c < "$OUTPUT")
if [ "$FILE_SIZE" -le 0 ]; then
  echo "Error: Backup file $OUTPUT is empty." >&2
  rm -f "$OUTPUT"
  exit 1
fi

echo "Backup successfully verified: $OUTPUT (Size: $FILE_SIZE bytes)"

# 3. Rotation limit
# Find matching backups, sort chronologically, and delete older ones
# We filter only files in that output directory matching DATABASE-*.dump
# Read elements into an array safely
IFS=$'\n' sorted_backups=($(find "$OUTPUT_DIR" -maxdepth 1 -name "$DATABASE-*.dump" -type f | sort))
unset IFS

COUNT=${#sorted_backups[@]}

if [ "$COUNT" -gt "$KEEP_MAX" ]; then
  DELETE_COUNT=$((COUNT - KEEP_MAX))
  echo "Found $COUNT backups, keeping max $KEEP_MAX. Deleting oldest $DELETE_COUNT backup(s)..."
  for ((i=0; i<DELETE_COUNT; i++)); do
    echo "Deleting old backup: ${sorted_backups[i]}"
    rm -f "${sorted_backups[i]}"
  done
fi

echo "Backup operation completed successfully."
exit 0
