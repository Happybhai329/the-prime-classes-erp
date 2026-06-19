param(
  [string]$Container = "erp-system-postgres-1",
  [string]$Database = "prime_erp",
  [string]$User = "prime_admin",
  [string]$OutputDir = ".\backups\postgres",
  [int]$KeepMax = 7
)

$ErrorActionPreference = "Stop"

# 1. Check if docker is running and container exists
$containerState = docker inspect --format='{{.State.Running}}' $Container 2>$null
if ($LASTEXITCODE -ne 0 -or $containerState -ne "true") {
  Write-Error "Container $Container is not running or does not exist."
  exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$absoluteOutputDir = Resolve-Path -Path $OutputDir -ErrorAction SilentlyContinue
if ($null -eq $absoluteOutputDir) {
  # If it doesn't exist, we create it
  New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
  $absoluteOutputDir = Resolve-Path -Path $OutputDir
}
$output = Join-Path $absoluteOutputDir.Path "$Database-$timestamp.dump"

Write-Output "Starting backup of $Database from container $Container..."

# Run pg_dump and stream to file
docker exec $Container pg_dump -U $User -Fc $Database | Set-Content -Encoding Byte -Path $output

if ($LASTEXITCODE -ne 0) {
  Write-Error "pg_dump failed with exit code $LASTEXITCODE"
  if (Test-Path $output) { Remove-Item $output }
  exit 1
}

# 2. Validation check: does the file exist and is size > 0?
if (-not (Test-Path $output)) {
  Write-Error "Backup file $output was not created."
  exit 1
}

$fileInfo = Get-Item $output
if ($fileInfo.Length -le 0) {
  Write-Error "Backup file $output is empty."
  Remove-Item $output
  exit 1
}

Write-Output "Backup successfully verified: $output (Size: $($fileInfo.Length) bytes)"

# 3. Rotation limit
$backups = Get-ChildItem -Path $absoluteOutputDir.Path -Filter "$Database-*.dump" | Sort-Object LastWriteTime
if ($backups.Count -gt $KeepMax) {
  $deleteCount = $backups.Count - $KeepMax
  Write-Output "Found $($backups.Count) backups, keeping max $KeepMax. Deleting oldest $deleteCount backup(s)..."
  for ($i = 0; $i -lt $deleteCount; $i++) {
    Write-Output "Deleting old backup: $($backups[$i].FullName)"
    Remove-Item $backups[$i].FullName
  }
}

Write-Output "Backup operation completed successfully."
exit 0
