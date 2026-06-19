param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [string]$Container = "erp-system-postgres-1",
  [string]$Database = "prime_erp_restore_drill",
  [string]$User = "prime_admin"
)

$ErrorActionPreference = "Stop"

# 1. Validate BackupFile exists
if (-not (Test-Path $BackupFile)) {
  Write-Error "Backup file $BackupFile does not exist."
  exit 1
}

# 2. Check if container is running
$containerState = docker inspect --format='{{.State.Running}}' $Container 2>$null
if ($LASTEXITCODE -ne 0 -or $containerState -ne "true") {
  Write-Error "Container $Container is not running or does not exist."
  exit 1
}

Write-Output "Preparing restore drill on database: $Database..."

# Drop the database if it exists to ensure a clean slate
Write-Output "Dropping old restore drill database if it exists..."
docker exec $Container dropdb -U $User --if-exists $Database

# Create the database fresh
Write-Output "Creating clean database $Database..."
docker exec $Container createdb -U $User $Database
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to create database $Database"
  exit 1
}

# Restore the backup file
Write-Output "Restoring backup from $BackupFile..."
Get-Content -Encoding Byte -Path $BackupFile | docker exec -i $Container pg_restore -U $User -d $Database --clean --if-exists
if ($LASTEXITCODE -ne 0) {
  Write-Error "pg_restore failed with exit code $LASTEXITCODE"
  exit 1
}

# Verify the restore
Write-Output "Verifying restored database..."
$verify = docker exec $Container psql -U $User -d $Database -c "select now() as restore_verified_at;"
if ($LASTEXITCODE -ne 0) {
  Write-Error "Verification query failed."
  exit 1
}

Write-Output "Restore verification output:"
Write-Output $verify
Write-Output "Restore drill completed successfully!"
exit 0
