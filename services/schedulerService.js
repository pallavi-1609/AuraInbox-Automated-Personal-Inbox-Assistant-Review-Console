/**
 * Scheduler Service
 * Manages recurring background scans according to configured schedule
 */

const cron = require('node-cron');

class SchedulerService {
  constructor({ onScanTrigger, getSettings, updateSettings, addLog }) {
    this.onScanTrigger = onScanTrigger;
    this.getSettings = getSettings;
    this.updateSettings = updateSettings;
    this.addLog = addLog;
    this.cronTask = null;
    this.nextRunDate = null;
  }

  init() {
    const settings = this.getSettings();
    if (settings.scheduler && settings.scheduler.enabled) {
      this.start(settings.scheduler.cronExpression);
    }
  }

  start(cronExpression = '0 8 * * 1') {
    this.stop();

    if (!cron.validate(cronExpression)) {
      console.warn(`[Scheduler] Invalid cron expression: "${cronExpression}". Defaulting to "0 8 * * 1".`);
      cronExpression = '0 8 * * 1';
    }

    try {
      this.cronTask = cron.schedule(cronExpression, async () => {
        console.log(`[Scheduler] Cron triggered at ${new Date().toISOString()}`);
        this.addLog({
          type: 'SCHEDULER_RUN',
          message: 'Automated recurring scan triggered by scheduler',
          details: `Cron: ${cronExpression}`
        });

        if (this.onScanTrigger) {
          try {
            await this.onScanTrigger({ isScheduled: true });
          } catch (err) {
            console.error('[Scheduler] Error running scheduled scan:', err);
          }
        }

        this.updateRunTimestamps();
      });

      this.updateRunTimestamps();
      console.log(`[Scheduler] Started recurring schedule with expression: "${cronExpression}"`);
    } catch (e) {
      console.error('[Scheduler] Failed to initialize cron task:', e);
    }
  }

  stop() {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
      console.log('[Scheduler] Cron task stopped.');
    }
  }

  updateRunTimestamps() {
    const settings = this.getSettings();
    const now = new Date();
    
    // Estimate next run (rough estimate for display)
    const next = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.nextRunDate = next.toISOString();

    if (settings.scheduler) {
      settings.scheduler.lastRun = now.toISOString();
      settings.scheduler.nextRun = this.nextRunDate;
      this.updateSettings(settings);
    }
  }

  getStatus() {
    const settings = this.getSettings();
    return {
      isRunning: !!this.cronTask,
      cronExpression: settings.scheduler?.cronExpression || '0 8 * * 1',
      humanSchedule: settings.scheduler?.humanSchedule || 'Every Monday at 8:00 AM',
      lastRun: settings.scheduler?.lastRun || null,
      nextRun: settings.scheduler?.nextRun || null,
      enabled: settings.scheduler?.enabled ?? true
    };
  }
}

module.exports = SchedulerService;
