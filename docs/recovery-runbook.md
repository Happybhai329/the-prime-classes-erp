# Disaster Recovery & Backup Runbook

This document defines the procedures for backup operations, validation checks, automated rotations, and restore testing (restoration drills) for both the PostgreSQL relational database and the MinIO object storage services.

---

## 1. Overview & Strategy

The Prime Classes ERP infrastructure relies on two primary stateful storage engines:
1. **PostgreSQL**: Stores relational database tables (students, marks, attendance, parent details, tenants).
2. **MinIO**: Stores files, attachments, and unstructured tenant assets.

Our recovery strategy is built on:
- **Consistent Backups**: Daily database dumps and incremental object mirrors.
- **Strict Validation**: All backup procedures verify backup existence and check for non-zero file sizes.
- **Automatic Rotation**: Locally kept backups are limited to the last 7 occurrences to manage local storage footprint.
- **Regular Verification (Restore Drills)**: Automated restoration validation on secondary databases or test instances.

---

## 2. Backup Procedures

We provide scripts for both **PowerShell (Windows)** and **Bash (Linux/Unix)** environments.

### 2.1 PostgreSQL Database Backups
PostgreSQL backups are executed using a custom script which inspects container health, runs `pg_dump` with custom-format archive compression (`-Fc`), validates file creation/non-empty size, and rotates old dumps.

#### PowerShell (Windows)
```powershell
.\infrastructure\scripts\backup-postgres.ps1 -Container "erp-system-postgres-1" -Database "prime_erp" -User "prime_admin" -OutputDir ".\backups\postgres" -KeepMax 7
```

#### Bash (Linux)
```bash
./infrastructure/scripts/backup-postgres.sh "erp-system-postgres-1" "prime_erp" "prime_admin" "./backups/postgres" 7
```

### 2.2 MinIO Storage Backups
MinIO backups are executed using a script that creates a point-in-time incremental copy of the underlying docker volume (`rsync`), packages a compressed archive, and performs retention rotation on archives.

#### Bash (Linux)
```bash
./infrastructure/scripts/backup-minio.sh "erp-system_minio_data" "./backups/minio" 7
```

---

## 3. Restore & Disaster Recovery Drills

Testing backups is critical. Follow these instructions to run a mock recovery check.

### 3.1 PostgreSQL Database Restoration Drill
The restoration drill drops any existing drill database (`prime_erp_restore_drill`), creates a clean target database, performs a restoration from a custom backup file, and validates that a connection/timestamp query runs successfully.

#### PowerShell (Windows)
```powershell
.\infrastructure\scripts\restore-drill.ps1 -BackupFile ".\backups\postgres\prime_erp-20260619-120000.dump" -Container "erp-system-postgres-1" -Database "prime_erp_restore_drill"
```

#### Bash (Linux)
```bash
./infrastructure/scripts/restore-drill.sh "./backups/postgres/prime_erp-20260619-120000.dump" "erp-system-postgres-1" "prime_erp_restore_drill" "prime_admin"
```

### 3.2 MinIO Storage Restoration Drill
To restore the MinIO storage from a backup archive:

1. Identify the target volume (e.g. `erp-system_minio_data`).
2. Run a temporary helper container to extract the backup archive directly into the volume.
3. Restart the MinIO container to load the restored data.

**Example Command (Linux)**:
```bash
# 1. Stop MinIO service to prevent lock issues
docker-compose stop minio

# 2. Extract files from the desired tarball into the volume
docker run --rm \
  -v "erp-system_minio_data:/target_data" \
  -v "$(pwd)/backups/minio/archives:/backup_src:ro" \
  alpine sh -c "rm -rf /target_data/* && tar -xzf /backup_src/minio-20260619-120000.tar.gz -C /target_data"

# 3. Start MinIO service
docker-compose start minio
```

---

## 4. Verification Checklists

### Backup Verification Checklist
- [ ] Script prints `Backup successfully verified`.
- [ ] The backup file exists in the designated output folder.
- [ ] File size is greater than 0 bytes (e.g., database dumps should generally be >100KB, MinIO backups vary by contents).
- [ ] The number of total files in the backup directory matches the retention limit (does not exceed `KeepMax`).

### Restore Verification Checklist
- [ ] The database recreation step completes without error.
- [ ] `pg_restore` outputs exit code `0` (or `restore-drill` logs `Restore drill completed successfully!`).
- [ ] Running a verification query returns the current timestamp.
- [ ] (MinIO) Log files of the MinIO container show clean starts and buckets can be traversed in the administrator console.

---

## 5. Troubleshooting & FAQ

### Symptom: Container is not running or does not exist
- **Reason**: The Docker container target name (e.g., `erp-system-postgres-1` or `erp-system_postgres_1`) does not match the active running container naming pattern.
- **Fix**: Run `docker ps` to find the exact name of the PostgreSQL container, then pass it as a parameter:
  ```bash
  ./backup-postgres.sh "my-custom-postgres-container-name"
  ```

### Symptom: Backup file is empty (0 bytes)
- **Reason**: Authentication failures, invalid user names, or incorrect database target parameters.
- **Fix**: Verify your environment secrets (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`). Make sure the user has access permissions to run `pg_dump` on the database.

### Symptom: Disk space allocation issues
- **Reason**: Multiple daily archives exceed storage threshold.
- **Fix**: Check `KeepMax` config. If local storage is insufficient, lower the local retention limit (e.g., to 3 or 5) and schedule upload to secure cloud objects (e.g., AWS S3, Google Cloud Storage) with lifecycle expiration policies.
