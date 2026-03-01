# Disaster Recovery & Backup

## Backup Strategy

### Daily DB backup (MongoDB)

Run daily via cron or scheduler:

```bash
# From project root
./backend/scripts/backup-db.sh
```

Or manually:

```bash
mongodump --uri="$MONGODB_URI" --out=./backups/$(date +%Y%m%d) --gzip
```

Store backups off-server (S3, another machine, or backup service). Retain at least 7 daily backups.

### What gets backed up

- All MongoDB collections (restaurants, users, orders, menu, bookings, subscriptions, audit logs, etc.)

## Restore

### From a backup directory

```bash
# Restore from a specific backup folder (e.g. 20250301)
mongorestore --uri="$MONGODB_URI" --drop ./backups/20250301
```

Use `--drop` only when you intend to replace the current database. For partial restore, omit `--drop` and target specific collections.

### Restore script

A restore script is provided:

```bash
./backend/scripts/restore-db.sh 20250301
```

(Requires `MONGODB_URI` in environment or `.env`.)

## Recovery steps (high level)

1. **DB loss**: Restore latest backup with `mongorestore`; restart backend/frontend.
2. **App crash / bad deploy**: Roll back to previous image/commit; restart services.
3. **Data corruption**: Restore from last known good backup; fix application bug; redeploy.

## Environment

- Keep `.env` and secrets in a secure store (e.g. vault). Back them up separately from code.
- Document `MONGODB_URI`, `JWT_SECRET`, and any payment keys in a secure runbook so recovery can be done without guessing.
