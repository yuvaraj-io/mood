# Mood Calendar — Vision & Moodboard

A modern, responsive Mood Calendar app built with React, Vite, Tailwind CSS, and Firebase Firestore.

## ✨ Features
- 🎨 **7 Dynamic Themes**: Sunshine ☀️, Forest 🌲, Ocean 🌊, Sunset 🌅, Emerald 💎, Midnight 🌙, Snow ❄️ (with matching Dark mode variants).
- 📅 **Enlarged Interactive Calendar**: Click any date to view day details or tap the ✏️ edit icon.
- 📊 **Mood Analytics & Charts**: Top-bar insights tracking emoji frequency, streak counters, and color palettes across Month, Year, and All Time.
- 📝 **Daily Journal Notes & Descriptions**: Add optional descriptions to any day.
- 🔍 **Emoji Filters**: Filter calendar days by specific moods.
- 🔒 **Google Sign-In & Guest Mode**: Offline-first with localStorage fallback and cloud syncing to Firebase Firestore.

---

## 🌐 VPS Webhook Auto-Deployment

This repository includes a standalone webhook server (`webhook-server.js`) and deployment script (`deploy.sh`) to automatically pull and deploy when code is pushed to `master`.

### Step 1: Start the Webhook Server on your VPS
On your VPS, clone the repo and start the webhook server (using PM2 or Node):

```bash
# Using Node directly:
WEBHOOK_SECRET="your_secret_here" PORT=9000 node webhook-server.js

# Or using PM2 (recommended for background persistence):
npm install -g pm2
WEBHOOK_SECRET="your_secret_here" PORT=9000 pm2 start webhook-server.js --name "mood-webhook"
pm2 save
```

### Step 2: Configure Webhook Trigger

#### Method A: Direct GitHub Webhook (Simplest)
1. In your GitHub repo, go to **Settings** → **Webhooks** → **Add webhook**.
2. **Payload URL**: `http://<YOUR_VPS_IP>:9000/deploy`
3. **Content type**: `application/json`
4. **Secret**: `your_secret_here` (matching `WEBHOOK_SECRET`)
5. **Which events?**: Select **Just the push event**.
6. Click **Add webhook**.

#### Method B: Trigger via GitHub Actions
In your GitHub repo **Settings** → **Secrets and variables** → **Actions**, add:
- `VPS_WEBHOOK_URL`: `http://<YOUR_VPS_IP>:9000/deploy`
- `VPS_WEBHOOK_SECRET`: `your_secret_here`

Now, whenever code is pushed or merged to `master`, the webhook triggers `./deploy.sh --vps` to pull and build automatically!

---

## 🚀 Manual & Local Deployment via `deploy.sh`

```bash
# Run on VPS to pull and build:
./deploy.sh --vps

# Build, push to Git, and deploy to Firebase:
./deploy.sh

# Or push to GitHub only:
./deploy.sh --git-only
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```
