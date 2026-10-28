/**
 * Gmail Integration Service
 * Uses ImapFlow for secure IMAP reading and Nodemailer for SMTP sending
 */

const { ImapFlow } = require('imapflow');
const nodemailer = require('nodemailer');
const { simpleParser } = require('mailparser');

class GmailService {
  constructor(config = {}) {
    this.user = config.user || '';
    this.appPassword = config.appPassword || '';
    this.host = config.host || 'imap.gmail.com';
    this.port = config.port || 993;
    this.smtpHost = config.smtpHost || 'smtp.gmail.com';
    this.smtpPort = config.smtpPort || 465;
  }

  updateConfig(config = {}) {
    this.user = config.user || this.user;
    this.appPassword = config.appPassword || this.appPassword;
    this.host = config.host || this.host;
    this.port = config.port || this.port;
    this.smtpHost = config.smtpHost || this.smtpHost;
    this.smtpPort = config.smtpPort || this.smtpPort;
  }

  async testConnection() {
    if (!this.user || !this.appPassword) {
      return { success: false, message: 'Gmail address and App Password are required.' };
    }

    try {
      const client = new ImapFlow({
        host: this.host,
        port: this.port,
        secure: true,
        auth: {
          user: this.user,
          pass: this.appPassword
        },
        logger: false
      });

      await client.connect();
      await client.logout();
      return { success: true, message: 'Successfully connected to Gmail IMAP server!' };
    } catch (err) {
      return { 
        success: false, 
        message: `Failed to connect to Gmail: ${err.message}. Make sure 2-Step Verification is ON and you are using a 16-character Google App Password.` 
      };
    }
  }

  async fetchOverdueThreads(options = {}) {
    const { lookbackDays = 7, minDaysWaiting = 3, ignoreKeywords = [] } = options;

    if (!this.user || !this.appPassword) {
      throw new Error('Gmail credentials not configured.');
    }

    const client = new ImapFlow({
      host: this.host,
      port: this.port,
      secure: true,
      auth: {
        user: this.user,
        pass: this.appPassword
      },
      logger: false
    });

    const results = [];
    const now = new Date();
    const sinceDate = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);

    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');

      try {
        // Search messages since lookback date
        const messages = client.fetch({ since: sinceDate }, { envelope: true, source: true });

        for await (const msg of messages) {
          const envelope = msg.envelope;
          const subject = envelope.subject || '(No Subject)';
          const fromAddress = envelope.from && envelope.from[0] ? envelope.from[0].address : '';
          const fromName = envelope.from && envelope.from[0] ? (envelope.from[0].name || envelope.from[0].address) : 'Sender';
          const msgDate = new Date(envelope.date || now);

          // Check if it's sent from self
          if (fromAddress.toLowerCase() === this.user.toLowerCase()) {
            continue;
          }

          // Check ignore patterns
          const fullTextToCheck = `${subject} ${fromAddress}`.toLowerCase();
          const shouldIgnore = ignoreKeywords.some(keyword => fullTextToCheck.includes(keyword.toLowerCase()));
          if (shouldIgnore) {
            continue;
          }

          // Calculate waiting days
          const diffMs = now - msgDate;
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          if (diffDays >= minDaysWaiting) {
            let bodyText = '';
            if (msg.source) {
              try {
                const parsed = await simpleParser(msg.source);
                bodyText = parsed.text || parsed.html || '';
              } catch (e) {
                bodyText = '';
              }
            }

            results.push({
              id: `gmail-${msg.uid || Date.now()}-${Math.random().toString(36).substring(7)}`,
              subject,
              sender: fromName,
              senderEmail: fromAddress,
              receivedAt: msgDate.toISOString(),
              daysWaiting: diffDays,
              urgency: diffDays >= 5 ? 'high' : 'medium',
              status: 'needs_review',
              category: 'Inbox Thread',
              messages: [
                {
                  from: `${fromName} <${fromAddress}>`,
                  date: msgDate.toLocaleString(),
                  snippet: bodyText ? bodyText.slice(0, 150) + '...' : '(Email snippet unavailable)',
                  body: bodyText || '(Full email content)'
                }
              ]
            });
          }
        }
      } finally {
        lock.release();
      }

      await client.logout();
      return results;
    } catch (err) {
      try { await client.logout(); } catch (e) {}
      throw err;
    }
  }

  async sendEmail({ to, subject, body }) {
    if (!this.user || !this.appPassword) {
      throw new Error('Gmail credentials not configured.');
    }

    const transporter = nodemailer.createTransport({
      host: this.smtpHost,
      port: this.smtpPort,
      secure: true,
      auth: {
        user: this.user,
        pass: this.appPassword
      }
    });

    const replySubject = subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`;

    const info = await transporter.sendMail({
      from: `"${this.user}" <${this.user}>`,
      to,
      subject: replySubject,
      text: body
    });

    return { success: true, messageId: info.messageId };
  }
}

module.exports = GmailService;
