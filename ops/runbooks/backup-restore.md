# Backup and Restore Runbook

## Backup
- Schedule daily PostgreSQL snapshot backups.
- Retain backups for 30 days.
- Replicate backup objects to a secondary region.

## Restore
- Stop write traffic to API and worker.
- Restore latest verified snapshot to staging first.
- Run consistency checks on `snapshots`, `snapshot_holdings`, `snapshot_diffs`.
- Promote restored database and re-enable write traffic.

## Rollback
- Repoint API to previous primary instance.
- Re-run failed jobs from queue dead-letter with manual approval.
