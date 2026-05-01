import "dotenv/config";
import axios from "axios";
import { SocksProxyAgent } from "socks-proxy-agent";
import fs from "fs-extra";
import crypto from "crypto";
import chalk from "chalk";
import { execSync } from "child_process";

// ==================== TOR SETUP ====================
class TorManager {
  constructor() {
    this.torProxy = "socks5h://127.0.0.1:9050";
    this.agent = new SocksProxyAgent(this.torProxy);
  }

  checkTor() {
    try {
      execSync("which tor", { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }

  async newIdentity() {
    try {
      const net = await import("net");
      const client = new net.Socket();
      await new Promise((resolve) => {
        const timeout = setTimeout(() => { client.destroy(); resolve(); }, 4000);
        client.connect(9051, "127.0.0.1", () => {
          client.write('AUTHENTICATE\r\n');
          client.write('SIGNAL NEWNYM\r\n');
          client.write('QUIT\r\n');
          clearTimeout(timeout);
          setTimeout(() => { client.destroy(); resolve(); }, 500);
        });
        client.on("error", () => { clearTimeout(timeout); client.destroy(); resolve(); });
      });
      this.agent = new SocksProxyAgent(this.torProxy);
      console.log(chalk.dim("[TOR] 🔄 New identity"));
    } catch {
      console.log(chalk.yellow("[TOR] ⚠️ Identity refresh skipped"));
    }
  }
}

// ==================== LAYER 1: FOUNDATION & RECON ====================
class ReconLayer {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.anonKey = process.env.SUPABASE_ANON_KEY;
    this.appUrl = process.env.APP_URL;
    this.endpoints = {
      telegramAuth: `${this.supabaseUrl}/functions/v1/telegram-auth`,
      nexaRpc: `${this.supabaseUrl}/functions/v1/nexa-rpc`,
      adsStart: `${this.supabaseUrl}/functions/v1/ads-start`,
      adsCredit: `${this.supabaseUrl}/functions/v1/ads-credit`,
    };
  }
}

// ==================== LAYER 2: IDENTITY & STEALTH ====================
class StealthLayer {
  constructor() {
    this.userAgents = [
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    ];
  }

  getHeaders() {
    return {
      "User-Agent": this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
      "sec-ch-ua": '"Chromium";v="131", "Not?A_Brand";v="99"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "Accept": "*/*",
      "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      "Origin": process.env.APP_URL,
      "Referer": `${process.env.APP_URL}/spin`,
    };
  }
}

// ==================== LAYER 3: BEHAVIORAL MIMICRY ====================
class MimicryLayer {
  async humanDelay(base = 2500) {
    const jitter = Math.random() * 2000 + (Math.random() > 0.25 ? 0 : Math.random() * 4000);
    return new Promise(r => setTimeout(r, base + jitter));
  }
  adWatchDuration() { return Math.floor(Math.random() * 6000) + 17000; }
  randomVariance(base, variance = 0.25) { return base * (1 + (Math.random() * 2 - 1) * variance); }
  spinJitter() { return Math.floor(Math.random() * 4000) + 3000; }
}

// ==================== LAYER 4: ANTI-DETECTION & EVASION ====================
class EvasionLayer {
  constructor() {
    this.rateLimitDelay = 3000;
  }

  async adaptiveRequest(fn) {
    for (let i = 0; i < 5; i++) {
      try {
        return await fn();
      } catch (err) {
        if (err.response?.status === 429) {
          this.rateLimitDelay = Math.min(45000, this.rateLimitDelay * 1.75);
          console.log(chalk.yellow(`[EVASION] 429 — ${Math.round(this.rateLimitDelay / 1000)}s`));
          await new Promise(r => setTimeout(r, this.rateLimitDelay));
        } else if (err.response?.status === 403) {
          console.log(chalk.yellow("[EVASION] 403 — need new identity"));
          return { status: 403, data: null };
        } else {
          throw err;
        }
      }
    }
    throw new Error("Rate limit wall hit");
  }
}

// ==================== LAYER 5: RESILIENCE & RECOVERY ====================
class ResilienceLayer {
  constructor() {
    this.stateFile = process.env.STATE_FILE || "./state.json";
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(this.stateFile)) return fs.readJsonSync(this.stateFile);
    } catch {}
    return {
      spinsToday: 0,
      lastSessionTs: 0,
      authToken: null,
      tokenExpiry: 0,
      dailyResetDate: null,
    };
  }

  saveState() {
    try { fs.writeJsonSync(this.stateFile, this.state, { spaces: 2 }); } catch {}
  }

  checkDailyReset() {
    const today = new Date().toDateString();
    if (this.state.dailyResetDate !== today) {
      this.state.spinsToday = 0;
      this.state.dailyResetDate = today;
      this.saveState();
      console.log(chalk.green("[DAILY] 🆕 New day — counter reset"));
    }
  }

  async withRetry(fn, maxRetries = 4) {
    let lastErr;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        const backoff = Math.min(45000, 1500 * Math.pow(2, i) + Math.random() * 1500);
        console.log(chalk.red(`[RETRY ${i + 1}/${maxRetries}] ${err.message?.slice(0, 60)}`));
        await new Promise(r => setTimeout(r, backoff));
      }
    }
    throw lastErr;
  }
}

// ==================== MAIN BOT ENGINE ====================
class NexGramTorBot {
  constructor() {
    this.tor = new TorManager();
    this.recon = new ReconLayer();
    this.stealth = new StealthLayer();
    this.mimicry = new MimicryLayer();
    this.evasion = new EvasionLayer();
    this.resilience = new ResilienceLayer();
    this.authToken = null;
    this.dailyLimit = parseInt(process.env.DAILY_SPIN_LIMIT || 50);
    this.currentBalance = 0;
    this.lastWinAmount = 0;
  }

  async init() {
    console.log(chalk.cyan.bold("\n🔥 ASUR NEXGRAM TOR BOT — 5 LAYERS + TOR ARMOR 🔥\n"));

    if (!this.tor.checkTor()) {
      console.log(chalk.red("[FATAL] Tor install nahi hai! 'pkg install tor -y' karo"));
      process.exit(1);
    }
    console.log(chalk.green("[TOR] ✅ Tor detected & ready"));

    this.resilience.checkDailyReset();
    await this.authenticate();
    await this.fetchBalance();
  }

  // ==================== AUTHENTICATION ====================
  async authenticate() {
    const state = this.resilience.state;

    if (state.authToken && state.tokenExpiry > Date.now() + 120000) {
      this.authToken = state.authToken;
      console.log(chalk.green("[AUTH] ✅ Existing token still valid"));
      return;
    }

    console.log(chalk.yellow("[AUTH] 🔐 Getting new token via Tor..."));
    const initData = process.env.TG_INIT_DATA;
    const payload = {
      initData,
      initDataUnsafe: this.parseInitData(initData),
    };

    const response = await this.resilience.withRetry(() =>
      axios.post(this.recon.endpoints.telegramAuth, payload, {
        httpsAgent: this.tor.agent,
        httpAgent: this.tor.agent,
        timeout: 25000,
        headers: {
          ...this.stealth.getHeaders(),
          "apikey": process.env.SUPABASE_ANON_KEY,
          "authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          "content-type": "application/json",
        },
      })
    );

    const data = response.data;
    this.authToken = data.token || data.access_token || data.session?.access_token;

    if (!this.authToken) {
      console.log(chalk.red("[AUTH] Full response:"), JSON.stringify(data).slice(0, 300));
      throw new Error("No auth token in response");
    }

    state.authToken = this.authToken;
    state.tokenExpiry = Date.now() + 50 * 60 * 1000;
    this.resilience.saveState();
    console.log(chalk.green(`[AUTH] ✅ Token obtained: ${this.authToken.slice(0, 25)}...`));
  }

  parseInitData(raw) {
    const params = new URLSearchParams(raw);
    const userStr = params.get("user");
    return { user: userStr ? JSON.parse(decodeURIComponent(userStr)) : {} };
  }

  // ==================== AXIOS CONFIG BUILDER ====================
  getAxiosConfig() {
    return {
      httpsAgent: this.tor.agent,
      httpAgent: this.tor.agent,
      timeout: 25000,
      headers: {
        ...this.stealth.getHeaders(),
        "apikey": process.env.SUPABASE_ANON_KEY,
        "authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        "x-nexa-token": this.authToken,
        "x-client-info": "supabase-js-web/2.104.0",
        "content-type": "application/json",
      },
    };
  }

  // ==================== RPC CALL HELPER ====================
  async rpcCall(op, payload = {}) {
    await this.authenticate();
    return this.evasion.adaptiveRequest(() =>
      axios.post(this.recon.endpoints.nexaRpc, { op, ...payload }, this.getAxiosConfig())
    );
  }

  // ==================== BALANCE FETCH (MULTI-SOURCE FIX) ====================
  async fetchBalance() {
    try {
      // Source 1: 'me' RPC
      const meRes = await this.rpcCall("me");
      const meD = meRes.data?.data || meRes.data || {};

      // Source 2: 'spin.state' RPC
      const stateRes = await this.rpcCall("spin.state");
      const stateD = stateRes.data?.data || stateRes.data || {};

      // Check all possible balance fields
      const candidates = [
        meD?.balance, meD?.coins, meD?.points,
        meD?.wallet?.balance, meD?.profile?.balance,
        meD?.ngx, meD?.token_balance,
        stateD?.balance, stateD?.coins, stateD?.total_coins,
        stateD?.ngx, stateD?.total_ngx,
        stateD?.user?.balance, stateD?.user?.coins, stateD?.user?.ngx,
        stateD?.profile?.balance, stateD?.wallet?.balance,
      ];

      const valid = candidates.find(v => v !== undefined && v !== null && typeof v === 'number');
      if (valid !== undefined && valid > 0) {
        this.currentBalance = valid;
      }

      // Fallback: regex search on raw responses
      if (!this.currentBalance || this.currentBalance === 0) {
        for (const raw of [
          JSON.stringify(meRes.data),
          JSON.stringify(stateRes.data),
        ]) {
          const match = raw.match(/"balance"?\s*:\s*(\d+)/);
          if (match && parseInt(match[1]) > 0) {
            this.currentBalance = parseInt(match[1]);
            break;
          }
        }
      }

      this.currentBalance = Number(this.currentBalance) || 0;
    } catch (err) {
      console.log(chalk.dim(`[BALANCE] Fetch warning: ${err.message?.slice(0, 50)}`));
    }
    return this.currentBalance;
  }

  // ==================== WATCH AD ====================
  async watchAd() {
    console.log(chalk.blue("[AD] 📺 Watching via Tor..."));

    let startRes = await this.evasion.adaptiveRequest(() =>
      axios.post(
        this.recon.endpoints.adsStart,
        { provider: "adsgram", context: "spin" },
        this.getAxiosConfig()
      )
    );

    if (startRes.status === 403) {
      await this.tor.newIdentity();
      throw new Error("403 on ad start");
    }

    const adData = startRes.data?.data || startRes.data || {};
    const ticket = adData.ticket || adData.ad_ticket;

    if (!ticket) {
      console.log(chalk.yellow("[AD] ⚠️ No ticket, skipping credit"));
      return null;
    }

    const watchMs = this.mimicry.adWatchDuration();
    console.log(chalk.dim(`[AD] ⏱️ ${Math.round(watchMs / 1000)}s`));
    await new Promise(r => setTimeout(r, watchMs));

    await this.evasion.adaptiveRequest(() =>
      axios.post(
        this.recon.endpoints.adsCredit,
        { provider: "adsgram", context: "spin", ticket },
        this.getAxiosConfig()
      )
    );

    console.log(chalk.green("[AD] ✅ Credited"));
  }

  // ==================== EXECUTE SPIN (WINNER FIX) ====================
  async executeSpin() {
    const nonce = crypto.randomUUID();
    console.log(chalk.magenta("[SPIN] 🎰 Executing..."));

    const res = await this.rpcCall("spin.execute", {
      client_nonce: nonce,
      paid: false,
    });

    const full = res.data;
    const data = full?.data || full || {};

    // WINNER DETECTION — multiple possible locations
    const winner =
      data?.winner ||
      data?.prize ||
      data?.reward ||
      data?.result ||
      full?.winner ||
      full?.prize ||
      null;

    if (winner && winner?.amount > 0) {
      const winAmt = Number(winner.amount);
      const currency = winner.currency || "NGX";
      const label = winner.label || winner.name || `${winAmt} ${currency}`;

      console.log(chalk.green.bold(`\n🎉🎉 WINNER! ${label} (+${winAmt} ${currency}) 🎉🎉\n`));

      this.lastWinAmount = winAmt;
      this.currentBalance += winAmt;

      // Try to sync with server balance
      await this.fetchBalance();

      return { won: true, amount: winAmt, currency, label };
    }

    // Winner object exists but amount is 0 or missing
    if (winner) {
      console.log(chalk.yellow(`[SPIN] 🎰 Result: ${JSON.stringify(winner).slice(0, 120)}`));
    }
    // No winner at all
    else if (data?.ok === true) {
      console.log(chalk.yellow(`[SPIN] 🎰 Better luck next time`));
    }
    // Unknown response
    else {
      console.log(chalk.dim(`[DEBUG] Raw response: ${JSON.stringify(full).slice(0, 300)}`));
    }

    this.lastWinAmount = 0;
    return { won: false };
  }

  // ==================== SHOW BALANCE ====================
  async showBalance() {
    await this.fetchBalance();
    const s = this.resilience.state;
    const left = this.dailyLimit - s.spinsToday;
    const bal = this.currentBalance.toLocaleString();

    console.log(
      chalk.green.bold(`\n💰 TOTAL BALANCE: ${bal} NGX`) +
        chalk.white(`  |  🎯 Spins: ${s.spinsToday}/${this.dailyLimit} (${left} left)\n`)
    );
  }

  // ==================== RUN ONE SESSION ====================
  async runSession() {
    this.resilience.checkDailyReset();
    const s = this.resilience.state;

    // Daily limit check
    if (s.spinsToday >= this.dailyLimit) {
      console.log(chalk.yellow(`\n[LIMIT] 🛑 Daily limit reached (${s.spinsToday}/${this.dailyLimit})`));
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const waitMs = tomorrow - now;
      console.log(
        chalk.yellow(
          `[LIMIT] Resets in ${Math.round(waitMs / 3600000)}h ${Math.round((waitMs % 3600000) / 60000)}m\n`
        )
      );
      return waitMs;
    }

    // Show starting balance
    await this.showBalance();

    const left = this.dailyLimit - s.spinsToday;
    const spinsSession = Math.min(parseInt(process.env.SPINS_PER_SESSION || 5), left);

    console.log(chalk.cyan.bold(`\n=== 🚀 SESSION START — ${spinsSession} spins ===\n`));

    for (let i = 0; i < spinsSession; i++) {
      const cur = s.spinsToday + 1;
      console.log(chalk.white.bold(`🎯 Spin ${cur}/${this.dailyLimit}`));

      try {
        // Human delay before ad
        await this.mimicry.humanDelay(2000);

        // Watch ad
        await this.resilience.withRetry(() => this.watchAd());

        // Human delay before spin
        await this.mimicry.humanDelay(this.mimicry.spinJitter());

        // Execute spin
        await this.resilience.withRetry(() => this.executeSpin());

        // Increment counter
        s.spinsToday++;
        this.resilience.saveState();

        // Show updated balance
        await this.mimicry.humanDelay(1000);
        await this.showBalance();

        // Extra delay between spins
        await this.mimicry.humanDelay(1500);
      } catch (err) {
        console.log(chalk.red(`[ERROR] Spin ${cur}: ${err.message?.slice(0, 80)}`));

        // Handle auth failures
        if (err.message.includes("401") || err.message.includes("JWT") || err.message.includes("token")) {
          this.authToken = null;
          s.authToken = null;
          this.resilience.saveState();
          await this.authenticate();
        }

        // Handle Tor blocks
        if (err.message.includes("403")) {
          await this.tor.newIdentity();
        }

        // Still count failed spins to avoid getting stuck
        s.spinsToday++;
        this.resilience.saveState();
      }
    }

    s.lastSessionTs = Date.now();
    this.resilience.saveState();

    // Final summary
    console.log(chalk.green.bold(`\n${"=".repeat(48)}`));
    await this.showBalance();
    console.log(chalk.green.bold(`✅ SESSION COMPLETE — Today: ${s.spinsToday}/${this.dailyLimit}`));
    console.log(chalk.green.bold(`${"=".repeat(48)}\n`));

    return 0;
  }

  // ==================== MAIN LOOP ====================
  async loop() {
    while (true) {
      try {
        const waitMs = await this.runSession();
        const s = this.resilience.state;

        // If daily limit reached, sleep until reset
        if (s.spinsToday >= this.dailyLimit && waitMs > 0) {
          console.log(chalk.dim(`[SLEEP] Daily cap hit, sleeping 1h then checking...`));
          await new Promise(r => setTimeout(r, Math.min(waitMs, 3600000)));
          continue;
        }

        // Normal cooldown between sessions
        const cooldown = parseInt(process.env.SESSION_COOLDOWN_SEC || 300) * 1000;
        const jittered = this.mimicry.randomVariance(cooldown, 0.3);
        console.log(chalk.dim(`\n[COOLDOWN] ${Math.round(jittered / 1000)}s till next session...\n`));

        // New Tor identity
        await this.tor.newIdentity();
        await new Promise(r => setTimeout(r, jittered));
      } catch (err) {
        console.log(chalk.red(`[FATAL] ${err.message?.slice(0, 100)}`));
        await this.tor.newIdentity();
        await new Promise(r => setTimeout(r, 30000));
      }
    }
  }
}

// ==================== BOOT ====================
console.log(chalk.cyan("🔍 Checking Tor installation..."));
try {
  const bot = new NexGramTorBot();
  await bot.init();
  console.log(chalk.green.bold("\n⚡ ALL SYSTEMS GO — BOT STARTING ⚡\n"));
  await bot.loop();
} catch (err) {
  console.log(chalk.red(`\n[CRASH] ${err.message}`));
  console.log(chalk.yellow("\n💡 FIXES:"));
  console.log("  1. Tor install karo:  pkg install tor -y && tor &");
  console.log("  2. Fresh TG_INIT_DATA lo Telegram Web se");
  console.log("  3. .env file check karo\n");
  process.exit(1);
}
