param(
  [string]$Container = "erp-system-postgres-1",
  [string]$Database = "prime_erp",
  [string]$User = "prime_admin",
  [string]$OutputDir = ".\backups\postgres"
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$output = Join-Path $OutputDir "$Database-$timestamp.dump"

docker exec $Container pg_dump -U $User -Fc $Database | Set-Content -Encoding Byte -Path $output
Write-Output "Backup written to $output"
