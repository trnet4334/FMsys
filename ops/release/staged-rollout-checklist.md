# Staged Rollout Checklist

## Stage 1: Manual snapshots only
- Enable `POST /api/snapshot/trigger` for internal users.
- Verify snapshot creation and diff persistence.
- Validate rollback path by disabling trigger endpoint.

## Stage 2: Scheduled snapshots
- Enable weekly/monthly schedule jobs.
- Monitor failure rate and dead-letter depth.
- Execute rollback by pausing schedulers and replaying last successful snapshot.

## Stage 3: Notifications
- Enable email/report delivery for pilot users.
- Verify opt-out and duplicate suppression.
- Rollback by disabling notification dispatch and keeping report archival active.
