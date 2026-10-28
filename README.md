# AuraInbox — AI Personal Inbox Assistant

A local, private, and automated personal inbox assistant that monitors your Gmail on a recurring schedule, crafts natural response drafts, and holds each draft for your manual review and approval before anything is sent.

## Features

- **Recurring Background Schedule**: Automatically scans your inbox every Monday at 8:00 AM (or custom intervals like daily, hourly, or every 15 minutes) using background cron timers.
- **Intelligent Contextual Drafts**: Summarizes thread context and writes natural, ready-to-send replies matching your personal voice and sign-off signature.
- **Tone & Voice Customization**: Switch between *Professional & Warm*, *Casual & Warm*, or *Direct & Concise* in 1 click, or instruct the assistant with custom prompts (e.g. *"Tell them I'll be in New York on Tuesday"*).
- **Thread-by-Thread Review & Safety Lock**: Holds each draft for your approval. View original email threads side-by-side with proposed drafts, edit inline, and 1-click send.
-"Live Gmail & Demo Sandbox Modes":
  - "Demo Sandbox Mode": Pre-loaded with realistic client, invoice, networking, and partner threads for instant testing.
  - "Live Gmail Mode": Connects securely via IMAP/SMTP using standard 16-character Google App Passwords.
- "Activity & Audit History": Full audit trail of every scan run, draft generated, review action, and email sent.

## Dashboard URL

Once the server is running, open your browser to:
((https://verdant-sable-2b4e30.netlify.app/))

## Quick Start Commands

```powershell
# Navigate to the project directory
cd "C:\Users\Pallavi\.gemini\antigravity-ide\scratch\inbox-assistant"

# Install dependencies (already installed)
npm install

# Start the assistant server
npm start
```

## Connecting Your Live Gmail Account

1. Open the dashboard at [('https://verdant-sable-2b4e30.netlify.app/')].
2. Click "Settings & Rules" in the top right.
3. Select "Live Gmail Account".
4. Enter your Gmail address and a 16-character Google App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security).
   - Ensure 2-Step Verification is enabled.
   - Search for "App Passwords", generate one named "Mail", and paste the 16 characters.
5. Click "Test Gmail Connection" to verify.
6. Click "Save Preferences".
