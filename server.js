const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const GmailService = require('./services/gmailService');
const SchedulerService = require('./services/schedulerService');
const { generateSummary, generateDraft } = require('./services/aiDraftService');

const app = express();
const PORT = process.env.PORT || 3456;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// File paths
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');
const THREADS_FILE = path.join(__dirname, 'data', 'threads.json');
const LOGS_FILE = path.join(__dirname, 'data', 'logs.json');

// Helpers for data persistence
function loadJson(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

function saveJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

function addLog({ type, message, details = '' }) {
  const logs = loadJson(LOGS_FILE, []);
  logs.unshift({
    timestamp: new Date().toISOString(),
    type,
    message,
    details
  });
  // Keep last 100 logs
  if (logs.length > 100) logs.pop();
  saveJson(LOGS_FILE, logs);
}

// Services initialization
let settings = loadJson(SETTINGS_FILE, {});
const gmailService = new GmailService(settings.gmail || {});

// Define scan logic
async function runScan({ isScheduled = false } = {}) {
  const currentSettings = loadJson(SETTINGS_FILE, {});
  const threads = loadJson(THREADS_FILE, []);
  let newThreadsFound = 0;

  addLog({
    type: 'SCAN_STARTED',
    message: isScheduled ? 'Scheduled inbox scan initiated' : 'Manual inbox scan triggered',
    details: `Lookback: ${currentSettings.scheduler?.checkRangeDays || 7} days`
  });

  if (!currentSettings.demoMode && currentSettings.gmail?.user && currentSettings.gmail?.appPassword) {
    try {
      const liveThreads = await gmailService.fetchOverdueThreads({
        lookbackDays: currentSettings.scheduler?.checkRangeDays || 7,
        minDaysWaiting: currentSettings.prioritization?.minOverdueDays || 3,
        ignoreKeywords: currentSettings.prioritization?.ignoreKeywords || []
      });

      for (const lt of liveThreads) {
        const existingIdx = threads.findIndex(t => t.id === lt.id || t.subject === lt.subject);
        if (existingIdx === -1) {
          // Generate AI Summary and Draft
          const summary = generateSummary(lt.messages, lt.subject);
          const draftText = generateDraft({
            messages: lt.messages,
            subject: lt.subject,
            senderName: lt.sender,
            tone: currentSettings.voiceProfile?.preferredTone || 'Professional & Warm',
            userVoice: currentSettings.voiceProfile
          });

          lt.summary = summary;
          lt.draft = {
            text: draftText,
            tone: currentSettings.voiceProfile?.preferredTone || 'Professional & Warm',
            lastGeneratedAt: new Date().toISOString(),
            isEdited: false
          };
          threads.unshift(lt);
          newThreadsFound++;
        }
      }
    } catch (err) {
      console.error('[Scan] Gmail scan error:', err);
      addLog({
        type: 'SCAN_ERROR',
        message: 'Live Gmail scan encountered an error',
        details: err.message
      });
    }
  } else {
    // In Demo Mode, ensure seed drafts are fresh and generated if missing
    for (const thread of threads) {
      if (!thread.draft || !thread.draft.text) {
        const draftText = generateDraft({
          messages: thread.messages,
          subject: thread.subject,
          senderName: thread.sender,
          tone: currentSettings.voiceProfile?.preferredTone || 'Professional & Warm',
          userVoice: currentSettings.voiceProfile
        });
        thread.draft = {
          text: draftText,
          tone: currentSettings.voiceProfile?.preferredTone || 'Professional & Warm',
          lastGeneratedAt: new Date().toISOString(),
          isEdited: false
        };
        newThreadsFound++;
      }
    }
  }

  saveJson(THREADS_FILE, threads);

  addLog({
    type: 'SCAN_COMPLETED',
    message: `Inbox scan completed. ${newThreadsFound > 0 ? `${newThreadsFound} new drafts generated.` : 'No new overdue threads.'}`,
    details: `Total active drafts in queue: ${threads.filter(t => t.status === 'needs_review').length}`
  });

  return { success: true, newThreadsFound, total: threads.length };
}

// Scheduler initialization
const schedulerService = new SchedulerService({
  onScanTrigger: runScan,
  getSettings: () => loadJson(SETTINGS_FILE, {}),
  updateSettings: (newSettings) => saveJson(SETTINGS_FILE, newSettings),
  addLog
});
schedulerService.init();

// REST API Endpoints

// 1. Get system status & dashboard counts
app.get('/api/status', (req, res) => {
  const currentSettings = loadJson(SETTINGS_FILE, {});
  const threads = loadJson(THREADS_FILE, []);
  
  const needsReview = threads.filter(t => t.status === 'needs_review').length;
  const approved = threads.filter(t => t.status === 'approved' || t.status === 'sent').length;
  const dismissed = threads.filter(t => t.status === 'dismissed').length;
  const overdueUrgent = threads.filter(t => t.status === 'needs_review' && t.urgency === 'high').length;

  res.json({
    scheduler: schedulerService.getStatus(),
    gmailConnected: !!(currentSettings.gmail?.user && currentSettings.gmail?.appPassword),
    demoMode: currentSettings.demoMode ?? true,
    userVoice: currentSettings.voiceProfile,
    counts: {
      total: threads.length,
      needsReview,
      approved,
      dismissed,
      overdueUrgent
    }
  });
});

// 2. Get threads with optional filter
app.get('/api/threads', (req, res) => {
  const threads = loadJson(THREADS_FILE, []);
  const { status, filter } = req.query;

  let filtered = threads;
  if (status && status !== 'all') {
    filtered = filtered.filter(t => t.status === status);
  }

  if (filter === 'urgent') {
    filtered = filtered.filter(t => t.urgency === 'high');
  }

  res.json(filtered);
});

// 3. Trigger manual scan
app.post('/api/scan', async (req, res) => {
  try {
    const result = await runScan({ isScheduled: false });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Update manual draft text
app.post('/api/draft/update', (req, res) => {
  const { threadId, text } = req.body;
  if (!threadId) return res.status(400).json({ error: 'Missing threadId' });

  const threads = loadJson(THREADS_FILE, []);
  const thread = threads.find(t => t.id === threadId);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });

  if (!thread.draft) thread.draft = {};
  thread.draft.text = text;
  thread.draft.isEdited = true;
  thread.draft.lastGeneratedAt = new Date().toISOString();

  saveJson(THREADS_FILE, threads);
  res.json({ success: true, draft: thread.draft });
});

// 5. Regenerate draft with new tone or custom instruction
app.post('/api/draft/regenerate', (req, res) => {
  const { threadId, tone, customPrompt } = req.body;
  if (!threadId) return res.status(400).json({ error: 'Missing threadId' });

  const currentSettings = loadJson(SETTINGS_FILE, {});
  const threads = loadJson(THREADS_FILE, []);
  const thread = threads.find(t => t.id === threadId);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });

  const selectedTone = tone || thread.draft?.tone || currentSettings.voiceProfile?.preferredTone || 'Professional & Warm';

  const newDraftText = generateDraft({
    messages: thread.messages,
    subject: thread.subject,
    senderName: thread.sender,
    tone: selectedTone,
    userVoice: currentSettings.voiceProfile,
    customPrompt
  });

  thread.draft = {
    text: newDraftText,
    tone: selectedTone,
    lastGeneratedAt: new Date().toISOString(),
    isEdited: false
  };

  saveJson(THREADS_FILE, threads);

  addLog({
    type: 'DRAFT_REGENERATED',
    message: `Draft regenerated for "${thread.subject}"`,
    details: `Tone: ${selectedTone} | Instructions: "${customPrompt || 'None'}"`
  });

  res.json({ success: true, draft: thread.draft });
});

// 6. Approve and Send real or simulated draft
app.post('/api/draft/approve-send', async (req, res) => {
  const { threadId } = req.body;
  if (!threadId) return res.status(400).json({ error: 'Missing threadId' });

  const currentSettings = loadJson(SETTINGS_FILE, {});
  const threads = loadJson(THREADS_FILE, []);
  const thread = threads.find(t => t.id === threadId);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });

  let sendResult = { simulated: true };

  // If live Gmail mode is active, send via SMTP
  if (!currentSettings.demoMode && currentSettings.gmail?.user && currentSettings.gmail?.appPassword) {
    try {
      sendResult = await gmailService.sendEmail({
        to: thread.senderEmail,
        subject: thread.subject,
        body: thread.draft?.text || ''
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: `SMTP Send Error: ${err.message}` });
    }
  }

  thread.status = 'sent';
  thread.sentAt = new Date().toISOString();
  saveJson(THREADS_FILE, threads);

  addLog({
    type: 'EMAIL_SENT',
    message: `Reply sent to ${thread.sender} (${thread.senderEmail})`,
    details: `Subject: "${thread.subject}" | Mode: ${sendResult.simulated ? 'Simulated Approval' : 'Live Gmail Sent'}`
  });

  res.json({ success: true, message: 'Email reply sent successfully!', status: 'sent' });
});

// 7. Save draft to Gmail without sending
app.post('/api/draft/save-draft', (req, res) => {
  const { threadId } = req.body;
  const threads = loadJson(THREADS_FILE, []);
  const thread = threads.find(t => t.id === threadId);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });

  thread.status = 'approved';
  thread.approvedAt = new Date().toISOString();
  saveJson(THREADS_FILE, threads);

  addLog({
    type: 'DRAFT_APPROVED',
    message: `Draft approved & held for manual sending: "${thread.subject}"`,
    details: `Sender: ${thread.sender}`
  });

  res.json({ success: true, message: 'Draft marked as approved and held in queue.' });
});

// 8. Dismiss thread (no reply required)
app.post('/api/draft/dismiss', (req, res) => {
  const { threadId } = req.body;
  const threads = loadJson(THREADS_FILE, []);
  const thread = threads.find(t => t.id === threadId);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });

  thread.status = 'dismissed';
  thread.dismissedAt = new Date().toISOString();
  saveJson(THREADS_FILE, threads);

  addLog({
    type: 'THREAD_DISMISSED',
    message: `Thread dismissed: "${thread.subject}"`,
    details: `No reply sent to ${thread.sender}`
  });

  res.json({ success: true, message: 'Thread marked as dismissed.' });
});

// 9. Settings management
app.get('/api/settings', (req, res) => {
  const currentSettings = loadJson(SETTINGS_FILE, {});
  // Mask app password for security
  const safe = JSON.parse(JSON.stringify(currentSettings));
  if (safe.gmail?.appPassword) {
    safe.gmail.appPassword = '••••••••••••••••';
  }
  res.json(safe);
});

app.post('/api/settings', (req, res) => {
  const updated = req.body;
  const currentSettings = loadJson(SETTINGS_FILE, {});

  // Preserve existing password if masked
  if (updated.gmail?.appPassword && updated.gmail.appPassword.includes('••••')) {
    updated.gmail.appPassword = currentSettings.gmail?.appPassword || '';
  }

  saveJson(SETTINGS_FILE, updated);
  gmailService.updateConfig(updated.gmail || {});

  // Restart scheduler with new schedule
  if (updated.scheduler?.enabled) {
    schedulerService.start(updated.scheduler.cronExpression || '0 8 * * 1');
  } else {
    schedulerService.stop();
  }

  addLog({
    type: 'SETTINGS_UPDATED',
    message: 'User settings and prioritization rules updated',
    details: `Schedule: ${updated.scheduler?.humanSchedule || 'Updated'}`
  });

  res.json({ success: true, settings: updated });
});

// 10. Test live Gmail connection
app.post('/api/settings/test-connection', async (req, res) => {
  const { user, appPassword } = req.body;
  const currentSettings = loadJson(SETTINGS_FILE, {});

  const testUser = user || currentSettings.gmail?.user;
  let testPass = appPassword;
  if (!testPass || testPass.includes('••••')) {
    testPass = currentSettings.gmail?.appPassword;
  }

  const testService = new GmailService({ user: testUser, appPassword: testPass });
  const result = await testService.testConnection();
  res.json(result);
});

// 11. Activity logs
app.get('/api/logs', (req, res) => {
  const logs = loadJson(LOGS_FILE, []);
  res.json(logs);
});

app.post('/api/logs/clear', (req, res) => {
  saveJson(LOGS_FILE, []);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` AuraInbox Personal Assistant running on port ${PORT}`);
  console.log(` Dashboard URL: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
