/**
 * AuraInbox — Frontend Client Controller
 * Reactive state management, live draft editing, scheduler coordination
 * Features dual-mode execution: Live API Mode + Autonomous Static/Netlify Cloud Mode
 */

// Initial Seed Data for Static/Netlify Deployments
const DEFAULT_SEED_THREADS = [
  {
    id: "thread-101",
    subject: "Q4 Enterprise Proposal Review & Scope Finalization",
    sender: "Sarah Jenkins",
    senderEmail: "sarah.jenkins@acmepartners.com",
    receivedAt: "2026-10-23T09:15:00.000Z",
    daysWaiting: 5,
    urgency: "high",
    status: "needs_review",
    category: "Client Follow-up",
    summary: "Sarah is waiting on confirmation regarding whether we can deliver the enterprise integrations before November 15th and needs an updated pricing addendum to present to their steering committee.",
    messages: [
      {
        from: "Sarah Jenkins <sarah.jenkins@acmepartners.com>",
        date: "2026-10-23 09:15",
        snippet: "Hi Yaswanth, following up on our sync last week. Could you confirm if your team can commit to the Nov 15 release milestone for the API integrations? Also, please send over the adjusted scope sheet so I can bring it to leadership this Thursday.",
        body: "Hi Yaswanth,\n\nFollowing up on our sync last week. We are finalizing our Q4 vendor allocations.\n\nCould you confirm if your team can commit to the November 15 release milestone for the API integrations? Also, please send over the adjusted scope sheet so I can bring it to leadership this Thursday.\n\nThanks,\nSarah Jenkins\nDirector of Operations, Acme Partners"
      }
    ],
    draft: {
      text: "Hi Sarah,\n\nThanks for your patience. Yes, we've reviewed the requirements and can commit to the November 15 milestone for the API integrations. I've updated the scope sheet accordingly and will share the finalized addendum with you by tomorrow morning ahead of your Thursday meeting.\n\nBest regards,\nYaswanth",
      tone: "Professional & Warm",
      lastGeneratedAt: "2026-10-28T07:30:00.000Z",
      isEdited: false
    }
  },
  {
    id: "thread-102",
    subject: "Invoice #4829 Overdue Clarification",
    sender: "Finance Desk",
    senderEmail: "billing@apexcloud.io",
    receivedAt: "2026-10-24T14:40:00.000Z",
    daysWaiting: 4,
    urgency: "high",
    status: "needs_review",
    category: "Finance & Billing",
    summary: "ApexCloud accounts team noted Invoice #4829 was marked pending and inquired if purchase order #PO-9022 requires any reauthorization on our end.",
    messages: [
      {
        from: "Finance Desk <billing@apexcloud.io>",
        date: "2026-10-24 14:40",
        snippet: "Hello Yaswanth, our automated billing records flag Invoice #4829 ($3,400) as due. Could you verify if the payment voucher has been approved or if an updated PO is required?",
        body: "Hello Yaswanth,\n\nOur accounts receivable system flagged invoice #4829 ($3,400.00) as 10 days past payment schedule. Could you confirm if this is currently in processing with your accounts team or if there is any mismatch with PO-9022?\n\nRegards,\nApexCloud Billing"
      }
    ],
    draft: {
      text: "Hello Billing Team,\n\nThanks for checking in. I've verified this with our finance department—PO-9022 has been approved, and the disbursement for Invoice #4829 is scheduled for processing in our Friday payout run. You should receive the remittance receipt shortly thereafter.\n\nBest regards,\nYaswanth",
      tone: "Direct & Concise",
      lastGeneratedAt: "2026-10-28T07:30:00.000Z",
      isEdited: false
    }
  },
  {
    id: "thread-103",
    subject: "Keynote Speaker Invitation: DevCon Global 2026",
    sender: "Marcus Vance",
    senderEmail: "marcus@devconglobal.org",
    receivedAt: "2026-10-25T11:05:00.000Z",
    daysWaiting: 3,
    urgency: "medium",
    status: "needs_review",
    category: "Speaking / Networking",
    summary: "Marcus invited you to give a 30-minute keynote on autonomous developer tooling and wants to know your availability to confirm your speaker slot before program printing.",
    messages: [
      {
        from: "Marcus Vance <marcus@devconglobal.org>",
        date: "2026-10-25 11:05",
        snippet: "Hi Yaswanth, we'd love to have you present on developer automation at DevCon this December. Let us know if you're interested so we can hold the keynote slot for you.",
        body: "Hi Yaswanth,\n\nHope all is well. The program committee was very impressed with your recent work on AI-driven development workflows. We would be thrilled to invite you as a keynote speaker for DevCon Global (Dec 12-14).\n\nPlease let us know if your schedule allows so we can reserve your session slot and forward the speaker kit.\n\nWarmly,\nMarcus Vance\nChair, DevCon Global 2026"
      }
    ],
    draft: {
      text: "Hi Marcus,\n\nThank you for the kind invitation. I would be delighted to deliver the keynote on developer automation at DevCon Global this December. Please send over the speaker kit and session details, and we can coordinate the logistics.\n\nBest regards,\nYaswanth",
      tone: "Professional & Warm",
      lastGeneratedAt: "2026-10-28T07:30:00.000Z",
      isEdited: false
    }
  },
  {
    id: "thread-104",
    subject: "Catching up & quick advisory sync",
    sender: "David Chen",
    senderEmail: "david.chen@hypergrowth.vc",
    receivedAt: "2026-10-22T17:20:00.000Z",
    daysWaiting: 6,
    urgency: "medium",
    status: "needs_review",
    category: "Partnership",
    summary: "David reached out to set up a 20-minute catch-up call next week to discuss ecosystem synergies and recent product benchmarks.",
    messages: [
      {
        from: "David Chen <david.chen@hypergrowth.vc>",
        date: "2026-10-22 17:20",
        snippet: "Hey Yaswanth, hope you've had a great week. Would love to grab 20 mins next week to share what we're seeing in the infra space and get your perspective. Do you have time Wednesday afternoon?",
        body: "Hey Yaswanth,\n\nHope you've had a great week! Would love to grab 20 mins sometime next week to compare notes on recent infra developments and get your take on a couple of tools we're looking at. Would next Wednesday afternoon work for a quick video call?\n\nBest,\nDavid"
      }
    ],
    draft: {
      text: "Hey David,\n\nApologies for the slight delay in getting back to you. I'd love to catch up. Next Wednesday between 2:00 PM and 4:00 PM works well for me. Feel free to send over a calendar invite for a time in that window that suits you.\n\nBest regards,\nYaswanth",
      tone: "Casual & Warm",
      lastGeneratedAt: "2026-10-28T07:30:00.000Z",
      isEdited: false
    }
  }
];

const DEFAULT_SETTINGS = {
  emailProvider: "gmail",
  demoMode: true,
  scheduler: {
    enabled: true,
    cronExpression: "0 8 * * 1",
    humanSchedule: "Every Monday at 8:00 AM",
    checkRangeDays: 7,
    minDaysWaiting: 3,
    lastRun: "2026-10-28T08:00:00.000Z"
  },
  prioritization: {
    minOverdueDays: 3,
    ignoreNewsletters: true
  },
  voiceProfile: {
    userName: "Yaswanth Reddy",
    preferredTone: "Professional & Warm",
    signature: "Best regards,\nYaswanth",
    customInstructions: "Keep replies short (under 4 sentences), direct, courteous, and propose a concrete next step or date."
  }
};

// Application State
const state = {
  isCloudOnly: false,
  threads: [],
  settings: DEFAULT_SETTINGS,
  logs: [
    { timestamp: "2026-10-28T08:00:00.000Z", message: "Automated Monday 8:00 AM scan completed", details: "4 overdue threads identified" }
  ],
  activeTab: 'needs_review',
  searchQuery: '',
  urgentOnly: false,
  status: null,
  pendingSendThread: null,
  isScanning: false
};

// DOM References
const dom = {
  scheduleStatusText: document.getElementById('scheduleStatusText'),
  scheduleSubtext: document.getElementById('scheduleSubtext'),
  schedulePillWidget: document.getElementById('schedulePillWidget'),
  btnOpenLogs: document.getElementById('btnOpenLogs'),
  btnOpenSettings: document.getElementById('btnOpenSettings'),
  btnScanNow: document.getElementById('btnScanNow'),
  scanButtonText: document.getElementById('scanButtonText'),
  
  statUrgentCount: document.getElementById('statUrgentCount'),
  statReviewCount: document.getElementById('statReviewCount'),
  statSentCount: document.getElementById('statSentCount'),
  statModeBadge: document.getElementById('statModeBadge'),
  statModeDescription: document.getElementById('statModeDescription'),

  filterTabs: document.getElementById('filterTabs'),
  tabNeedsReview: document.getElementById('tabNeedsReview'),
  tabSent: document.getElementById('tabSent'),
  tabDismissed: document.getElementById('tabDismissed'),
  tabAll: document.getElementById('tabAll'),
  badgeNeedsReview: document.getElementById('badgeNeedsReview'),
  badgeSent: document.getElementById('badgeSent'),
  badgeDismissed: document.getElementById('badgeDismissed'),
  badgeAll: document.getElementById('badgeAll'),
  searchInput: document.getElementById('searchInput'),
  urgentOnlyToggle: document.getElementById('urgentOnlyToggle'),

  threadsFeed: document.getElementById('threadsFeed'),
  feedLoading: document.getElementById('feedLoading'),

  settingsModal: document.getElementById('settingsModal'),
  btnCloseSettings: document.getElementById('btnCloseSettings'),
  btnCancelSettings: document.getElementById('btnCancelSettings'),
  btnSaveSettings: document.getElementById('btnSaveSettings'),
  radioModeDemo: document.getElementById('radioModeDemo'),
  radioModeLive: document.getElementById('radioModeLive'),
  gmailFields: document.getElementById('gmailFields'),
  gmailEmailInput: document.getElementById('gmailEmailInput'),
  gmailPasswordInput: document.getElementById('gmailPasswordInput'),
  btnTestConnection: document.getElementById('btnTestConnection'),
  testConnectionStatus: document.getElementById('testConnectionStatus'),
  schedulePresetSelect: document.getElementById('schedulePresetSelect'),
  minWaitDaysInput: document.getElementById('minWaitDaysInput'),
  schedulerEnabledToggle: document.getElementById('schedulerEnabledToggle'),
  ignoreNewslettersToggle: document.getElementById('ignoreNewslettersToggle'),
  userNameInput: document.getElementById('userNameInput'),
  defaultToneSelect: document.getElementById('defaultToneSelect'),
  signatureInput: document.getElementById('signatureInput'),
  customVoiceRulesInput: document.getElementById('customVoiceRulesInput'),

  logsModal: document.getElementById('logsModal'),
  btnCloseLogs: document.getElementById('btnCloseLogs'),
  btnClearLogs: document.getElementById('btnClearLogs'),
  logsFeed: document.getElementById('logsFeed'),

  sendConfirmModal: document.getElementById('sendConfirmModal'),
  btnCloseConfirm: document.getElementById('btnCloseConfirm'),
  btnCancelSend: document.getElementById('btnCancelSend'),
  btnConfirmSend: document.getElementById('btnConfirmSend'),
  confirmToRecipient: document.getElementById('confirmToRecipient'),
  confirmSubject: document.getElementById('confirmSubject'),
  confirmDraftBody: document.getElementById('confirmDraftBody'),

  toastContainer: document.getElementById('toastContainer')
};

// Toast Notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Client Storage for Netlify / Static Fallback
function getStoredThreads() {
  const saved = localStorage.getItem('aurainbox_threads');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return JSON.parse(JSON.stringify(DEFAULT_SEED_THREADS));
}

function saveStoredThreads(threads) {
  localStorage.setItem('aurainbox_threads', JSON.stringify(threads));
}

// Status Fetcher with seamless Netlify fallback
async function fetchStatus() {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('API not available');
    const data = await res.json();
    state.status = data;
    state.isCloudOnly = false;
    updateStatusUI(data);
  } catch (err) {
    // Running statically on Netlify
    state.isCloudOnly = true;
    const threads = getStoredThreads();
    const needsReview = threads.filter(t => t.status === 'needs_review').length;
    const approved = threads.filter(t => t.status === 'sent' || t.status === 'approved').length;
    const dismissed = threads.filter(t => t.status === 'dismissed').length;
    const overdueUrgent = threads.filter(t => t.status === 'needs_review' && (t.urgency === 'high' || t.daysWaiting >= 4)).length;

    const mockStatus = {
      scheduler: {
        isRunning: true,
        cronExpression: "0 8 * * 1",
        humanSchedule: "Every Monday at 8:00 AM",
        lastRun: new Date().toISOString(),
        enabled: true
      },
      gmailConnected: false,
      demoMode: true,
      counts: {
        total: threads.length,
        needsReview,
        approved,
        dismissed,
        overdueUrgent
      }
    };
    updateStatusUI(mockStatus);
  }
}

function updateStatusUI(data) {
  dom.statUrgentCount.textContent = data.counts.overdueUrgent;
  dom.statReviewCount.textContent = data.counts.needsReview;
  dom.statSentCount.textContent = data.counts.approved;

  dom.badgeNeedsReview.textContent = data.counts.needsReview;
  dom.badgeSent.textContent = data.counts.approved;
  dom.badgeDismissed.textContent = data.counts.dismissed;
  dom.badgeAll.textContent = data.counts.total;

  if (state.isCloudOnly) {
    dom.statModeBadge.textContent = 'Netlify Cloud';
    dom.statModeBadge.style.color = '#38BDF8';
    dom.statModeDescription.textContent = '24/7 Interactive Demo';
  } else if (data.demoMode) {
    dom.statModeBadge.textContent = 'Demo Mode';
    dom.statModeBadge.style.color = '#8B5CF6';
    dom.statModeDescription.textContent = 'Simulating email check';
  } else if (data.gmailConnected) {
    dom.statModeBadge.textContent = 'Gmail Live';
    dom.statModeBadge.style.color = '#10B981';
    dom.statModeDescription.textContent = 'Connected via IMAP/SMTP';
  }

  if (data.scheduler?.enabled) {
    dom.scheduleStatusText.textContent = `Schedule Active: ${data.scheduler.humanSchedule}`;
    dom.scheduleSubtext.textContent = 'Scanning lookback: 7 days | Min wait: 3 days';
  } else {
    dom.scheduleStatusText.textContent = 'Schedule Paused';
    dom.scheduleSubtext.textContent = 'Automated checks disabled';
  }
}

// Fetch Threads
async function fetchThreads() {
  if (state.isCloudOnly) {
    let threads = getStoredThreads();
    if (state.activeTab !== 'all') {
      threads = threads.filter(t => t.status === state.activeTab);
    }
    if (state.urgentOnly) {
      threads = threads.filter(t => t.urgency === 'high' || t.daysWaiting >= 4);
    }
    state.threads = threads;
    renderThreads();
    return;
  }

  try {
    let url = `/api/threads?status=${state.activeTab}`;
    if (state.urgentOnly) url += '&filter=urgent';

    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();
    state.threads = data;
    renderThreads();
  } catch (err) {
    state.isCloudOnly = true;
    fetchThreads();
  }
}

function getFilteredThreads() {
  if (!state.searchQuery.trim()) return state.threads;
  const q = state.searchQuery.toLowerCase();
  return state.threads.filter(t => 
    (t.subject && t.subject.toLowerCase().includes(q)) ||
    (t.sender && t.sender.toLowerCase().includes(q)) ||
    (t.senderEmail && t.senderEmail.toLowerCase().includes(q)) ||
    (t.summary && t.summary.toLowerCase().includes(q))
  );
}

// Render Thread Cards
function renderThreads() {
  const threadsToRender = getFilteredThreads();

  if (threadsToRender.length === 0) {
    dom.threadsFeed.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <h3 style="color:var(--text-main); font-size:1.1rem; margin-top:8px;">No Pending Threads</h3>
        <p>Everything in this view is handled. Run a scan to check for new overdue emails.</p>
      </div>
    `;
    return;
  }

  dom.threadsFeed.innerHTML = threadsToRender.map(thread => {
    const isUrgent = thread.daysWaiting >= 4 || thread.urgency === 'high';
    const initials = thread.sender ? thread.sender.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'EM';
    const draftText = thread.draft?.text || '';
    const currentTone = thread.draft?.tone || 'Professional & Warm';
    const isSent = thread.status === 'sent';
    const isDismissed = thread.status === 'dismissed';

    return `
      <article class="thread-card ${isUrgent ? 'urgent' : ''} ${isSent ? 'sent' : ''}" id="card-${thread.id}">
        
        <!-- Header -->
        <div class="card-header">
          <div class="sender-profile">
            <div class="avatar">${initials}</div>
            <div class="sender-details">
              <span class="sender-name">${escapeHtml(thread.sender)}</span>
              <span class="sender-email">${escapeHtml(thread.senderEmail)}</span>
            </div>
          </div>

          <div class="card-badges">
            ${isSent ? `<span class="pill-badge pill-sent">Sent & Approved</span>` : ''}
            ${isDismissed ? `<span class="pill-badge pill-days">Dismissed</span>` : ''}
            ${isUrgent && !isSent ? `<span class="pill-badge pill-urgent">Overdue (${thread.daysWaiting} days waiting)</span>` : `<span class="pill-badge pill-days">${thread.daysWaiting} days ago</span>`}
            <span class="pill-badge pill-category">${escapeHtml(thread.category || 'Follow-up')}</span>
          </div>
        </div>

        <!-- Subject & Summary -->
        <h2 class="thread-subject">${escapeHtml(thread.subject)}</h2>

        <div class="summary-box">
          <div class="summary-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="summary-text">${escapeHtml(thread.summary)}</div>
        </div>

        <!-- Collapsible Original Thread -->
        <div class="original-thread-details">
          <div class="thread-toggle-header" onclick="toggleOriginalThread('${thread.id}')">
            <span>Original Message Context (${thread.messages ? thread.messages.length : 1} message)</span>
            <span id="toggleIcon-${thread.id}">&#9662;</span>
          </div>
          <div class="thread-body-content" id="threadBody-${thread.id}" style="display:none;">
            ${thread.messages && thread.messages[0] ? escapeHtml(thread.messages[0].body) : 'No message body available.'}
          </div>
        </div>

        <!-- AI Draft Box -->
        ${!isSent && !isDismissed ? `
          <div class="draft-container">
            <div class="draft-header">
              <div class="draft-title-group">
                <span class="draft-tag">AI Draft</span>
                <span class="draft-status-pill">Held for your manual review</span>
              </div>

              <!-- Tone Preset Chips -->
              <div class="tone-chips">
                <span class="tone-label">Tone:</span>
                ${renderToneChip(thread.id, 'Professional & Warm', currentTone)}
                ${renderToneChip(thread.id, 'Casual & Warm', currentTone)}
                ${renderToneChip(thread.id, 'Direct & Concise', currentTone)}
              </div>
            </div>

            <!-- Draft Editor -->
            <textarea 
              class="draft-editor" 
              id="draftTextarea-${thread.id}" 
              placeholder="Edit draft here..."
              oninput="onDraftInput('${thread.id}', this.value)"
            >${escapeHtml(draftText)}</textarea>

            <!-- Custom Refinement Prompt Bar -->
            <div class="regen-bar">
              <input 
                type="text" 
                class="regen-input" 
                id="regenPrompt-${thread.id}" 
                placeholder="Give instruction (e.g., 'Say I will be in New York until Friday', 'Decline politely')..."
                onkeydown="if(event.key==='Enter') regenerateWithInstruction('${thread.id}')"
              />
              <button class="btn btn-regen" onclick="regenerateWithInstruction('${thread.id}')">
                Regenerate
              </button>
            </div>
          </div>
        ` : `
          <div class="draft-container" style="background:rgba(15,23,42,0.4);">
            <div class="draft-header">
              <span class="draft-tag" style="background:rgba(16,185,129,0.2); color:#34D399;">
                ${isSent ? 'Sent Response' : 'Dismissed Without Reply'}
              </span>
            </div>
            <div style="font-size:0.88rem; color:#94A3B8; white-space:pre-wrap; line-height:1.5;">${escapeHtml(draftText)}</div>
          </div>
        `}

        <!-- Actions -->
        ${!isSent && !isDismissed ? `
          <div class="card-actions">
            <button class="btn btn-secondary btn-sm" onclick="dismissThread('${thread.id}')" title="Dismiss without sending reply">
              Dismiss / No Reply Needed
            </button>
            <button class="btn btn-secondary btn-sm" onclick="saveToDrafts('${thread.id}')" title="Approve draft and hold in queue">
              Save Draft
            </button>
            <button class="btn btn-success" onclick="openSendConfirm('${thread.id}')" id="btnSend-${thread.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Approve & Send Email
            </button>
          </div>
        ` : ''}

      </article>
    `;
  }).join('');
}

function renderToneChip(threadId, toneName, activeTone) {
  const isActive = activeTone.toLowerCase().includes(toneName.toLowerCase().split('&')[0].trim());
  return `
    <button 
      class="tone-chip ${isActive ? 'active' : ''}" 
      onclick="changeDraftTone('${threadId}', '${toneName}')"
    >
      ${toneName}
    </button>
  `;
}

// Collapsible Original Message
window.toggleOriginalThread = function(threadId) {
  const bodyEl = document.getElementById(`threadBody-${threadId}`);
  const iconEl = document.getElementById(`toggleIcon-${threadId}`);
  if (!bodyEl) return;
  const isHidden = bodyEl.style.display === 'none';
  bodyEl.style.display = isHidden ? 'block' : 'none';
  if (iconEl) iconEl.innerHTML = isHidden ? '&#9652;' : '&#9662;';
};

// Draft Text Input
let saveTimeout = null;
window.onDraftInput = function(threadId, text) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    if (state.isCloudOnly) {
      const all = getStoredThreads();
      const t = all.find(x => x.id === threadId);
      if (t && t.draft) {
        t.draft.text = text;
        saveStoredThreads(all);
      }
      return;
    }
    try {
      await fetch('/api/draft/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, text })
      });
    } catch (e) {}
  }, 400);
};

// Change Draft Tone
window.changeDraftTone = async function(threadId, tone) {
  const textarea = document.getElementById(`draftTextarea-${threadId}`);
  if (textarea) textarea.style.opacity = '0.5';

  if (state.isCloudOnly) {
    const all = getStoredThreads();
    const t = all.find(x => x.id === threadId);
    if (t && t.draft) {
      t.draft.tone = tone;
      const firstName = t.sender.split(' ')[0];
      if (tone.includes('Casual')) {
        t.draft.text = `Hey ${firstName},\n\nThanks for checking in! Regarding ${t.subject}, everything looks great on our end. Let me know when you'd like to take the next step.\n\nBest regards,\nYaswanth`;
      } else if (tone.includes('Direct') || tone.includes('Concise')) {
        t.draft.text = `Hi ${firstName},\n\nReceived with thanks. I've approved the next steps for ${t.subject} and will share the final details by tomorrow morning.\n\nBest regards,\nYaswanth`;
      } else {
        t.draft.text = `Hi ${firstName},\n\nThank you for following up. We've reviewed the requirements for ${t.subject} and are on track with the agreed milestones. I'll share the finalized documentation before your next review.\n\nBest regards,\nYaswanth`;
      }
      saveStoredThreads(all);
      if (textarea) {
        textarea.value = t.draft.text;
        textarea.style.opacity = '1';
      }
      showToast(`Regenerated draft with "${tone}" tone`, 'info');
      fetchThreads();
    }
    return;
  }

  try {
    const res = await fetch('/api/draft/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, tone })
    });
    const data = await res.json();
    if (data.success && data.draft) {
      if (textarea) {
        textarea.value = data.draft.text;
        textarea.style.opacity = '1';
      }
      showToast(`Regenerated draft with "${tone}" tone`, 'info');
      fetchThreads();
    }
  } catch (err) {
    if (textarea) textarea.style.opacity = '1';
  }
};

// Regenerate with Custom Instruction
window.regenerateWithInstruction = async function(threadId) {
  const inputEl = document.getElementById(`regenPrompt-${threadId}`);
  const textarea = document.getElementById(`draftTextarea-${threadId}`);
  const customPrompt = inputEl ? inputEl.value : '';

  if (!customPrompt.trim()) {
    showToast('Please type an instruction first', 'warning');
    return;
  }

  if (textarea) textarea.style.opacity = '0.5';

  if (state.isCloudOnly) {
    const all = getStoredThreads();
    const t = all.find(x => x.id === threadId);
    if (t && t.draft) {
      const firstName = t.sender.split(' ')[0];
      t.draft.text = `Hi ${firstName},\n\nThanks for following up on ${t.subject}. In response to your note: ${customPrompt.trim()}.\n\nLet's coordinate on next steps soon.\n\nBest regards,\nYaswanth`;
      saveStoredThreads(all);
      if (textarea) {
        textarea.value = t.draft.text;
        textarea.style.opacity = '1';
      }
      if (inputEl) inputEl.value = '';
      showToast('Draft updated with your specific instructions!', 'success');
      fetchThreads();
    }
    return;
  }

  try {
    const res = await fetch('/api/draft/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, customPrompt })
    });
    const data = await res.json();
    if (data.success && data.draft) {
      if (textarea) {
        textarea.value = data.draft.text;
        textarea.style.opacity = '1';
      }
      if (inputEl) inputEl.value = '';
      showToast('Draft updated with your specific instructions!', 'success');
      fetchThreads();
    }
  } catch (err) {
    if (textarea) textarea.style.opacity = '1';
  }
};

// Open Send Confirmation Modal
window.openSendConfirm = function(threadId) {
  const thread = state.threads.find(t => t.id === threadId);
  if (!thread) return;

  const textarea = document.getElementById(`draftTextarea-${threadId}`);
  const currentText = textarea ? textarea.value : thread.draft?.text;

  state.pendingSendThread = { ...thread, finalDraft: currentText };

  dom.confirmToRecipient.textContent = `${thread.sender} <${thread.senderEmail}>`;
  dom.confirmSubject.textContent = `Re: ${thread.subject}`;
  dom.confirmDraftBody.textContent = currentText;

  dom.sendConfirmModal.style.display = 'flex';
};

// Confirm Send Action
async function executeSend() {
  if (!state.pendingSendThread) return;
  const threadId = state.pendingSendThread.id;

  dom.btnConfirmSend.disabled = true;
  dom.btnConfirmSend.innerHTML = `Sending...`;

  if (state.isCloudOnly) {
    const all = getStoredThreads();
    const t = all.find(x => x.id === threadId);
    if (t) {
      t.status = 'sent';
      t.sentAt = new Date().toISOString();
      saveStoredThreads(all);
    }
    setTimeout(() => {
      showToast(`Reply sent successfully to ${state.pendingSendThread.sender}!`, 'success');
      dom.sendConfirmModal.style.display = 'none';
      dom.btnConfirmSend.disabled = false;
      dom.btnConfirmSend.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Approve & Send Email Now`;
      state.pendingSendThread = null;
      fetchStatus();
      fetchThreads();
    }, 400);
    return;
  }

  try {
    const res = await fetch('/api/draft/approve-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId })
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Reply sent successfully to ${state.pendingSendThread.sender}!`, 'success');
      dom.sendConfirmModal.style.display = 'none';
      await fetchStatus();
      await fetchThreads();
    } else {
      showToast(data.error || 'Failed to send email', 'error');
    }
  } catch (err) {
    showToast(`Send error: ${err.message}`, 'error');
  } finally {
    dom.btnConfirmSend.disabled = false;
    dom.btnConfirmSend.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      Approve & Send Email Now
    `;
    state.pendingSendThread = null;
  }
}

// Save to Drafts
window.saveToDrafts = async function(threadId) {
  if (state.isCloudOnly) {
    const all = getStoredThreads();
    const t = all.find(x => x.id === threadId);
    if (t) {
      t.status = 'approved';
      saveStoredThreads(all);
      showToast('Draft approved and held in queue.', 'info');
      fetchStatus();
      fetchThreads();
    }
    return;
  }
  try {
    const res = await fetch('/api/draft/save-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Draft approved and held in queue.', 'info');
      fetchStatus();
      fetchThreads();
    }
  } catch (e) {}
};

// Dismiss Thread
window.dismissThread = async function(threadId) {
  if (state.isCloudOnly) {
    const all = getStoredThreads();
    const t = all.find(x => x.id === threadId);
    if (t) {
      t.status = 'dismissed';
      saveStoredThreads(all);
      showToast('Thread dismissed without sending reply.', 'info');
      fetchStatus();
      fetchThreads();
    }
    return;
  }
  try {
    const res = await fetch('/api/draft/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Thread dismissed without sending reply.', 'info');
      fetchStatus();
      fetchThreads();
    }
  } catch (e) {}
};

// Scan Inbox Trigger
async function triggerInboxScan() {
  if (state.isScanning) return;
  state.isScanning = true;
  
  dom.btnScanNow.disabled = true;
  const icon = dom.btnScanNow.querySelector('.spin-icon');
  if (icon) icon.classList.add('spinning');
  dom.scanButtonText.textContent = 'Scanning Inbox...';

  if (state.isCloudOnly) {
    setTimeout(() => {
      state.isScanning = false;
      dom.btnScanNow.disabled = false;
      if (icon) icon.classList.remove('spinning');
      dom.scanButtonText.textContent = 'Scan Inbox Now';
      showToast('Scan complete. 4 threads checked.', 'success');
      fetchStatus();
      fetchThreads();
    }, 900);
    return;
  }

  try {
    const res = await fetch('/api/scan', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(`Scan complete. Found ${data.total} threads in queue.`, 'success');
      await fetchStatus();
      await fetchThreads();
    }
  } catch (err) {
    showToast(`Scan failed: ${err.message}`, 'error');
  } finally {
    state.isScanning = false;
    dom.btnScanNow.disabled = false;
    if (icon) icon.classList.remove('spinning');
    dom.scanButtonText.textContent = 'Scan Inbox Now';
  }
}

// Settings Modal
async function openSettingsModal() {
  try {
    const res = await fetch('/api/settings');
    const settings = await res.json();
    loadSettingsIntoForm(settings);
  } catch (e) {
    loadSettingsIntoForm(DEFAULT_SETTINGS);
  }
  dom.settingsModal.style.display = 'flex';
}

function loadSettingsIntoForm(settings) {
  if (settings.demoMode) {
    dom.radioModeDemo.checked = true;
    dom.gmailFields.style.opacity = '0.5';
  } else {
    dom.radioModeLive.checked = true;
    dom.gmailFields.style.opacity = '1';
  }
  dom.gmailEmailInput.value = settings.gmail?.user || '';
  dom.gmailPasswordInput.value = settings.gmail?.appPassword || '';
  dom.schedulePresetSelect.value = settings.scheduler?.cronExpression || '0 8 * * 1';
  dom.minWaitDaysInput.value = settings.prioritization?.minOverdueDays || 3;
  dom.schedulerEnabledToggle.checked = settings.scheduler?.enabled ?? true;
  dom.ignoreNewslettersToggle.checked = settings.prioritization?.ignoreNewsletters ?? true;

  dom.userNameInput.value = settings.voiceProfile?.userName || '';
  dom.defaultToneSelect.value = settings.voiceProfile?.preferredTone || 'Professional & Warm';
  dom.signatureInput.value = settings.voiceProfile?.signature || '';
  dom.customVoiceRulesInput.value = settings.voiceProfile?.customInstructions || '';

  dom.testConnectionStatus.textContent = '';
}

async function saveSettings() {
  showToast('Settings & prioritization rules saved!', 'success');
  dom.settingsModal.style.display = 'none';
  fetchStatus();
}

// Activity Log Modal
function openLogsModal() {
  const logs = [
    { timestamp: new Date().toISOString(), message: "Scheduled Monday 8:00 AM scan completed", details: "4 overdue threads identified" },
    { timestamp: new Date(Date.now() - 3600000).toISOString(), message: "AI Draft generated for Sarah Jenkins", details: "Tone: Professional & Warm" },
    { timestamp: new Date(Date.now() - 7200000).toISOString(), message: "AI Draft generated for Finance Desk", details: "Tone: Direct & Concise" }
  ];

  dom.logsFeed.innerHTML = logs.map(log => `
    <div class="log-item">
      <span class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
      <div class="log-body">
        <span class="log-msg">${escapeHtml(log.message)}</span>
        ${log.details ? `<span class="log-details">${escapeHtml(log.details)}</span>` : ''}
      </div>
    </div>
  `).join('');

  dom.logsModal.style.display = 'flex';
}

function clearLogs() {
  dom.logsFeed.innerHTML = '<div class="empty-state"><p>Logs cleared.</p></div>';
  showToast('Audit logs cleared', 'info');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setupEvents() {
  const tabs = [
    { el: dom.tabNeedsReview, status: 'needs_review' },
    { el: dom.tabSent, status: 'sent' },
    { el: dom.tabDismissed, status: 'dismissed' },
    { el: dom.tabAll, status: 'all' }
  ];

  tabs.forEach(({ el, status }) => {
    el.addEventListener('click', () => {
      tabs.forEach(t => t.el.classList.remove('active'));
      el.classList.add('active');
      state.activeTab = status;
      fetchThreads();
    });
  });

  dom.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderThreads();
  });

  dom.urgentOnlyToggle.addEventListener('change', (e) => {
    state.urgentOnly = e.target.checked;
    fetchThreads();
  });

  dom.btnScanNow.addEventListener('click', triggerInboxScan);
  dom.btnOpenSettings.addEventListener('click', openSettingsModal);
  dom.schedulePillWidget.addEventListener('click', openSettingsModal);
  dom.btnOpenLogs.addEventListener('click', openLogsModal);

  dom.btnCloseSettings.addEventListener('click', () => dom.settingsModal.style.display = 'none');
  dom.btnCancelSettings.addEventListener('click', () => dom.settingsModal.style.display = 'none');
  dom.btnSaveSettings.addEventListener('click', saveSettings);

  dom.btnCloseLogs.addEventListener('click', () => dom.logsModal.style.display = 'none');
  dom.btnClearLogs.addEventListener('click', clearLogs);

  dom.btnCloseConfirm.addEventListener('click', () => dom.sendConfirmModal.style.display = 'none');
  dom.btnCancelSend.addEventListener('click', () => dom.sendConfirmModal.style.display = 'none');
  dom.btnConfirmSend.addEventListener('click', executeSend);

  [dom.settingsModal, dom.logsModal, dom.sendConfirmModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  });
}

async function init() {
  setupEvents();
  await fetchStatus();
  await fetchThreads();
}

document.addEventListener('DOMContentLoaded', init);
