import cron from 'node-cron';
import { createWeeklyPlatformBackupSnapshot } from '../controllers/backup.controller';
import { logger } from '../utils/logger';

let scheduled = false;

/**
 * Schedule weekly full-platform backups.
 *
 * Runs every Sunday at 03:00 server time.
 * Each run stores one full snapshot in BackupSnapshot collection.
 * Old snapshots auto-expire via TTL index (6 months).
 */
export function scheduleWeeklyBackups() {
  if (scheduled) return;
  scheduled = true;

  try {
    // ─ Cron expression: "0 3 * * 0" → 03:00 every Sunday
    cron.schedule('0 3 * * 0', async () => {
      logger.info('Weekly backup job started');
      await createWeeklyPlatformBackupSnapshot();
      logger.info('Weekly backup job finished');
    });
    logger.info('Weekly backup scheduler initialised (runs Sunday 03:00)');
  } catch (err: any) {
    logger.error('Failed to schedule weekly backups', { error: err?.message });
  }
}

