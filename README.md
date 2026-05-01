# Nex-graM-app
telegram-bot tor proxy nodejs automation spin-bot  adsgram supabase anti-detection termux


## 🔥 NexGram Auto Spin Bot — GitHub Upload Guide

---

### 📁 रिपो फाइल स्ट्रक्चर

```
NexGram-Auto-Spin-Bot/
├── .gitignore
├── README.md
├── package.json
├── .env.example
├── bot.js
└── setup.sh
```

---

### 1. `.gitignore` बनाना

```
node_modules/
.env
state.json
*.log
```

---

### 2. `.env.example` बनाना (असली .env अपलोड मत करना)

```env
# ============================================
# 🔥 NEXGRAM AUTO SPIN BOT — CONFIG
# ============================================

# Telegram Mini App Init Data (24hr expiry, roj nikalna padega)
TG_INIT_DATA=query_id=AA...&user=%7B%22id%22%3A...%7D&auth_date=...&hash=...

# Supabase Backend (change mat karna)
SUPABASE_URL=https://bakjryqlybbopkspkrtl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJha2pyeXFseWJib3Brc3BrcnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjQ4MjMsImV4cCI6MjA5MjIwMDgyM30.xF4es4cM3Gu5R6Ij0Hc845gqc6xbfP7uuMlA37mKXj0

# App URL
APP_URL=https://nexgramapp.lovable.app

# Spin Settings
DAILY_SPIN_LIMIT=50
SPINS_PER_SESSION=5
SESSION_COOLDOWN_SEC=300
AD_WATCH_DURATION_MIN=17
AD_WATCH_DURATION_MAX=22

# State File
STATE_FILE=./state.json
```

---

### 3. `setup.sh` बनाना (Termux ऑटो सेटअप)

```bash
#!/bin/bash
echo "========================================="
echo " 🔥 NEXGRAM AUTO SPIN BOT SETUP 🔥"
echo "========================================="
echo ""

# Update packages
echo "[*] Updating packages..."
pkg update -y && pkg upgrade -y

# Install dependencies
echo "[*] Installing Node.js..."
pkg install nodejs -y

echo "[*] Installing Tor..."
pkg install tor -y

# Start Tor
echo "[*] Starting Tor..."
tor &
sleep 3

# Check Tor
if nc -z 127.0.0.1 9050 2>/dev/null; then
    echo "[✓] Tor running on 127.0.0.1:9050"
else
    echo "[!] Tor failed to start, trying again..."
    killall tor 2>/dev/null
    tor &
    sleep 5
fi

# Install npm packages
echo "[*] Installing npm dependencies..."
npm install

# Setup .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo "[✓] .env created from .env.example"
    echo "[!] IMPORTANT: Edit .env and add your TG_INIT_DATA"
else
    echo "[✓] .env already exists"
fi

echo ""
echo "========================================="
echo " ✅ SETUP COMPLETE"
echo "========================================="
echo ""
echo " Steps to run:"
echo "  1. Edit .env file: nano .env"
echo "  2. Add your TG_INIT_DATA"
echo "  3. Run: node bot.js"
echo ""
```

---

### 4. `README.md` बनाना

```markdown
# 🔥 NexGram Auto Spin Bot

> **Tor-powered, 5-layer anti-detection bot for automated ad watching & spinning on NexGramApp Telegram Mini App.**

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-green" alt="Node.js">
  <img src="https://img.shields.io/badge/Tor-Required-purple" alt="Tor">
  <img src="https://img.shields.io/badge/Platform-Termux%20%7C%20Linux-lightgrey" alt="Platform">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

---

## ⚠️ DISCLAIMER

**For Educational Purposes Only.** Use at your own risk. The author is not responsible for any account bans or legal consequences. This tool is meant for learning about anti-detection techniques, proxy chaining, and API reverse engineering.

---

## 🧅 FEATURES

| Feature | Description |
|---------|-------------|
| **5-Layer Anti-Detection** | Recon → Stealth → Mimicry → Evasion → Resilience |
| **Tor Network Routing** | All traffic routed through Tor (socks5h://127.0.0.1:9050) |
| **Auto Ad Watching** | Watches AdsGram ads automatically (17-22s duration) |
| **Auto Spin** | Executes spins after ad credit |
| **Daily Limit** | Configurable daily spin cap (default: 50) |
| **Balance Tracking** | Fetches & displays total NGX balance after every spin |
| **Auto Session Recovery** | Handles JWT expiry, 429 rate limits, 403 blocks |
| **Tor Identity Rotation** | New Tor circuit every session |
| **Session Persistence** | Saves state to `state.json`, resumes after crash |
| **Human-like Behavior** | Random delays, jitter, varying user agents |

---

## 🏗️ ARCHITECTURE (5 Layers)

```
┌──────────────────────────────────────┐
│ LAYER 1: FOUNDATION & RECON          │
│  - OSINT, Endpoint mapping            │
│  - WAF/CAPTCHA detection              │
│  - Rate limit identification          │
├──────────────────────────────────────┤
│ LAYER 2: IDENTITY & STEALTH          │
│  - Tor SOCKS5 proxy routing           │
│  - User-Agent rotation (4 agents)    │
│  - Header obfuscation                 │
├──────────────────────────────────────┤
│ LAYER 3: BEHAVIORAL MIMICRY          │
│  - Random delays (2-6s)              │
│  - Ad watch jitter (17-22s)          │
│  - Human-like spin intervals         │
├──────────────────────────────────────┤
│ LAYER 4: ANTI-DETECTION & EVASION    │
│  - Dynamic rate limit adaptation      │
│  - 429/403 auto-handling              │
│  - Tor identity rotation on block     │
├──────────────────────────────────────┤
│ LAYER 5: RESILIENCE & RECOVERY       │
│  - Exponential backoff retry (4x)    │
│  - JWT auto-refresh                   │
│  - State persistence & crash recovery │
│  - Daily counter auto-reset           │
└──────────────────────────────────────┘
```

---

## 📋 REQUIREMENTS

- **Android/Termux** or **Linux** (any distro)
- **Node.js 18+**
- **Tor** (SOCKS5 proxy on `127.0.0.1:9050`)
- **Telegram Mini App Init Data** (24hr expiry)

---

## 🚀 QUICK START (Termux)

### Step 1: Clone & Setup
```bash
git clone https://github.com/YOUR_USERNAME/NexGram-Auto-Spin-Bot.git
cd NexGram-Auto-Spin-Bot
chmod +x setup.sh
./setup.sh
```

### Step 2: Get TG_INIT_DATA
1. Open Telegram on your phone/desktop
2. Open the NexGram Mini App
3. Use **Daitya Sniffer** Chrome extension or any traffic sniffer
4. Copy the full URL starting with `tgWebAppData=...`
5. Paste into `.env`:
```bash
nano .env
```

### Step 3: Run
```bash
node bot.js
```

---

## 📦 MANUAL SETUP (Linux)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Install Tor
sudo apt install tor -y
sudo systemctl start tor

# Clone & install
git clone https://github.com/YOUR_USERNAME/NexGram-Auto-Spin-Bot.git
cd NexGram-Auto-Spin-Bot
npm install
cp .env.example .env
# Edit .env with your TG_INIT_DATA
node bot.js
```

---

## ⚙️ CONFIGURATION (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `TG_INIT_DATA` | (required) | Telegram Mini App init data string |
| `SUPABASE_URL` | bakjryqlybbopkspkrtl.supabase.co | Backend URL |
| `SUPABASE_ANON_KEY` | (fixed) | Public anon key |
| `APP_URL` | nexgramapp.lovable.app | Frontend URL |
| `DAILY_SPIN_LIMIT` | 50 | Max spins per day |
| `SPINS_PER_SESSION` | 5 | Spins per cooldown cycle |
| `SESSION_COOLDOWN_SEC` | 300 | Cooldown between sessions (seconds) |
| `AD_WATCH_DURATION_MIN` | 17 | Min ad watch time (seconds) |
| `AD_WATCH_DURATION_MAX` | 22 | Max ad watch time (seconds) |
| `STATE_FILE` | ./state.json | Session state persistence |

---

## 📊 SAMPLE OUTPUT

```
🔥 ASUR NEXGRAM TOR BOT — 5 LAYERS + TOR ARMOR 🔥

[TOR] ✅ Tor detected & ready
[AUTH] ✅ Token obtained: eyJhbGciOiJIUzI1NiIs...

💰 TOTAL BALANCE: 5 NGX  |  🎯 Spins: 0/50 (50 left)

=== 🚀 SESSION START — 5 spins ===

🎯 Spin 1/50
[AD] 📺 Watching via Tor...
[AD] ⏱️ 20s
[AD] ✅ Credited
[SPIN] 🎰 Executing...

🎉🎉 WINNER! 5 NGX (+5 NGX) 🎉🎉

💰 TOTAL BALANCE: 10 NGX  |  🎯 Spins: 1/50 (49 left)
```

---

## 🔧 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| `Tor not found` | `pkg install tor -y && tor &` |
| `No auth token` | TG_INIT_DATA expired, get fresh from Telegram |
| `429 errors` | Bot auto-handles, wait for cooldown |
| `Balance shows 0` | May need `me` RPC response update |
| `Tor identity stuck` | `killall tor && tor &` restart Tor |
| `JWT expired` | Bot auto-refreshes |

---

## 🤖 AUTO-LOGIN (Planned)

Currently, TG_INIT_DATA must be manually refreshed every 24 hours.
A future update will add Telegram session auto-login to fetch init data automatically.

---

## 👨‍💻 AUTHOR

**Daitya King** (@Daityaking)

---

## 📜 LICENSE

MIT License — See [LICENSE](LICENSE) file

---

## ⭐ STAR HISTORY

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/NexGram-Auto-Spin-Bot&type=Date)](https://star-history.com/#YOUR_USERNAME/NexGram-Auto-Spin-Bot&Date)

---

**🎯 Made with 🔥 by Daitya King | Asur Tech**
```

---

### 5. GitHub पर अपलोड करने के स्टेप्स

```bash
# Termux में Git सेटअप (पहली बार)
pkg install git -y
git config --global user.name "Daityaking"
git config --global user.email "your-email@example.com"

# रिपो फोल्डर में जाओ
cd NexGram-Auto-Spin-Bot

# Git init
git init
git add .
git commit -m "🔥 Initial commit: NexGram Auto Spin Bot v1.0"

# GitHub पर रिपो बनाकर:
git remote add origin https://github.com/Daityaking/NexGram-Auto-Spin-Bot.git
git branch -M main
git push -u origin main
```

---

### 6. GitHub पर जाकर क्या-क्या करना

1. **About Section** में डाल:
   ```
   Tor-powered auto spin bot for NexGramApp Telegram Mini App. 
   5-layer anti-detection, balance tracking, daily limit management.
   ```

2. **Topics/Tags** ऐड कर:
   ```
   telegram-bot tor proxy nodejs automation spin-bot 
   adsgram supabase anti-detection termux
   ```

3. **License** — MIT चुन ले

4. **Releases** — v1.0.0 टैग कर

---

**बस, तेरा रिपो रेडी!** 🚀🔥
