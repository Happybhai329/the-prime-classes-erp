param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [string]$Container = "erp-system-postgres-1",
  [string]$Database = "prime_erp_restore_drill",
  [string]$User = "prime_admin"
)

docker exec $Container createdb -U $User $Database 2>$null
Get-Content -Encoding Byte -Path $BackupFile | docker exec -i $Container pg_restore -U $User -d $Database --clean --if-exists
docker exec $Container psql -U $User -d $Database -c "select now() as restore_verified_at;"
