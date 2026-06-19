#!/usr/bin/env bash
set -euo pipefail

VOLUME_NAME=${1:-"erp-system_minio_data"}
OUTPUT_DIR=${2:-"./backups/minio"}
KEEP_MAX=${3:-7}

# 1. Check if the docker volume exists
if ! docker volume inspect "$VOLUME_NAME" &>/dev/null; then
  echo "Error: Docker volume $VOLUME_NAME does not exist." >&2
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
mkdir -p "$OUTPUT_DIR/incremental"
mkdir -p "$OUTPUT_DIR/archives"

echo "Starting incremental volume mirroring for $VOLUME_NAME..."

# Mirror the volume to the incremental directory using rsync in a temporary alpine container
# This is safe and performs a true incremental sync.
if ! docker run --rm \
  -v "$VOLUME_NAME:/source_data:ro" \
  -v "$(pwd)/$OUTPUT_DIR/incremental:/target_data" \
  alpine sh -c "apk add --no-cache rsync && rsync -av --delete /source_data/ /target_data/"; then
  echo "Error: Incremental sync failed." >&2
  exit 1
fi

# Create a tar.gz archive of this point-in-time backup
ARCHIVE_FILE="$OUTPUT_DIR/archives/minio-$TIMESTAMP.tar.gz"
echo "Creating point-in-time archive: $ARCHIVE_FILE..."

if ! tar -czf "$ARCHIVE_FILE" -C "$OUTPUT_DIR/incremental" .; then
  echo "Error: Failed to create archive." >&2
  rm -f "$ARCHIVE_FILE"
  exit 1
fi

# Validation: Verify archive exists and is not empty
if [ ! -f "$ARCHIVE_FILE" ] || [ ! -s "$ARCHIVE_FILE" ]; then
  echo "Error: Archive file is missing or empty." >&2
  exit 1
fi

FILE_SIZE=$(wc -c < "$ARCHIVE_FILE")
echo "Backup successfully verified: $ARCHIVE_FILE (Size: $FILE_SIZE bytes)"

# Rotate archives
IFS=$'\n' sorted_archives=($(find "$OUTPUT_DIR/archives" -maxdepth 1 -name "minio-*.tar.gz" -type f | sort))
unset IFS

COUNT=${#sorted_archives[@]}
if [ "$COUNT" -gt "$KEEP_MAX" ]; then
  DELETE_COUNT=$((COUNT - KEEP_MAX))
  echo "Found $COUNT archives, keeping max $KEEP_MAX. Deleting oldest $DELETE_COUNT archive(s)..."
  for ((i=0; i<DELETE_COUNT; i++)); do
    echo "Deleting old archive: ${sorted_archives[i]}"
    rm -f "${sorted_archives[i]}"
  done
fi

echo "MinIO backup completed successfully."
exit 0
