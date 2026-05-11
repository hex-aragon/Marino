# Marino Submission Guide

## 1. Vercel Deploy (Fastest Path)

### 1-1. Import Project on Vercel

1. Go to https://vercel.com/new (sign in with GitHub)
2. **Import Git Repository** → select `hex-aragon/marino`
3. On the **Configure Project** screen:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### 1-2. Environment Variables

**Required (without these, the app runs in mock mode):**

| Key | Value | Notes |
|-----|-------|-------|
| `AISSTREAM_API_KEY` | `53856cc910261136304f9fb4f677323377c92d6c` | Key from CLAUDE.md |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Issue at https://console.anthropic.com |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` | Use devnet for the demo |
| `NEXT_PUBLIC_MERCHANT_WALLET` | (your Solana wallet address) | Phantom / Solflare wallet |

**Optional (the app still works without these):**

| Key | Value |
|-----|-------|
| `SOLANA_FEE_PAYER_PRIVATE_KEY` | (optional) base58 private key |
| `KV_REST_API_URL` | Auto-injected after creating Vercel Storage > KV |
| `KV_REST_API_TOKEN` | Auto-injected after creating Vercel Storage > KV |
| `RESEND_API_KEY` | Free signup at https://resend.com |

### 1-3. Click Deploy

- Takes 1–2 minutes
- You'll receive a `https://marino-xxxx.vercel.app` URL
- Paste this URL into the **"Live product link"** field on the Colosseum submission form

### 1-4. Add Vercel KV (Optional, for caching)

After deploy: Vercel Dashboard → Storage → Create Database → choose KV. Env vars are auto-injected. Not required for the demo.

---

## 2. Filling Out the Colosseum Submission Form

### Step 2: Media and Code

| Field | Value |
|-------|-------|
| **Project logo or graphic** | Upload `public/logo.png` (already 1024x1024 PNG) |
| **GitHub link** | `https://github.com/hex-aragon/marino` |
| **GitHub repo context** | Copy text below ↓ |
| **Product demo video** | Record on Loom, paste URL (script below) |
| **Demo video visibility** | ✅ Public |
| **Live product link** | Your Vercel URL |
| **Access instructions** | Copy text below ↓ |
| **Pitch video** | Record on Loom, paste URL (script below) |

### GitHub repo context (copy & paste)

```
- /lib/agent.ts — Claude maritime safety prompt + streaming logic
- /lib/x402.ts — x402 middleware and agent payment client
- /lib/escrow.ts — server-side USDC escrow (MVP; Anchor program planned for v2)
- /app/api/x402/* — paid endpoints demonstrating HTTP 402 → USDC → retry
- /app/api/agent/analyze — Claude vessel anomaly detection (drift/weather/route/congestion)
- aisstream.io WebSocket requires Node.js runtime, not Edge (configured in vercel.json)
- Solana network defaults to devnet; switch via NEXT_PUBLIC_SOLANA_NETWORK env var
- Mock data fallbacks exist for all external APIs so the demo works without keys
```

### Access instructions (copy & paste)

```
1. Open the live URL — landing page loads with hero, features, pricing.
2. Click "View Dashboard" → /dashboard shows live Busan vessels via aisstream.io WebSocket.
3. Wait ~15 seconds for Claude AI to analyze ships; red/orange markers and the right panel will populate with alerts.
4. Toggle between Busan / Incheon tabs (top-left of map) to switch ports.
5. Click any ship marker for popup details (speed, heading, destination, alert).
6. Click Market (top-right) → /marketplace lists USDC-priced items; click "Buy with USDC" on any item to open the Solana Pay QR escrow modal.
7. Click Agent → /agent opens streaming Claude chat. Try: "Give me a 72-hour premium forecast for Busan" — agent uses x402 to autopay 2 USDC for the premium endpoint.
8. For payment demo: connect Phantom wallet on Solana devnet, get devnet USDC from https://faucet.circle.com, then scan QR.
9. /satellite shows NASA Worldview iframe + density heatmap + public-data source cards.

Notes:
- No login required.
- If ANTHROPIC_API_KEY is unset in production, agent alerts fall back to rule-based mock analysis (still demonstrates the UX).
- All Solana transactions are on devnet — no real money involved.
```

---

## 3. Demo Video Recording (3 min, Loom recommended)

### Prep

1. Sign up at https://loom.com (free, up to 25 videos)
2. Install the Chrome extension or desktop app
3. Keep your deployed Vercel URL open in a tab
4. Allow mic and screen permissions

### Recording Script (90-second short version)

```
[0:00-0:10] 🎬 Intro
"Hi, Marino is a Solana-based maritime AI agent platform.
Let me show you three core features in 90 seconds."

→ Navigate to /dashboard

[0:10-0:35] 🚢 Dashboard
"These are real vessels in Busan Port, tracked live via AISStream.
Red markers are ships the Claude AI agent flagged as risky.
The right panel auto-generates alerts: drift suspected, weather risk, and more.
HIGH-severity alerts ship to the operations email within 4 seconds."

→ Click the Market button

[0:35-1:00] 🛒 Marketplace
"Sailors at the port trade food, parts, and services in USDC.
For example — a ramen box for 12 USDC. Click 'Buy' and a Solana Pay QR pops up.
After payment, the USDC is locked in escrow,
and only released once the sailor confirms delivery."

→ Navigate to /agent

[1:00-1:30] 🤖 x402 (the key part)
"This is what makes Marino unique.
Ask the AI agent for a 72-hour premium weather forecast and
the agent hits a paid API → server returns 402 → agent autopays 2 USDC → data arrives.
Zero human intervention. The agent works at 3 a.m. too."

[1:30-1:40] 🌍 Closing
"100,000+ vessels, 1.89M sailors, 800+ ports worldwide.
All settled on Solana. Thank you."
```

---

## 4. Pitch Video Recording (2 min, Loom)

### Script

```
[0:00-0:15] 👋 Hello
"Hi, I'm [your name], the builder of Marino.
My background: [one line — e.g., full-stack developer who grew up in Busan]."

[0:15-0:45] 💔 Problem
"Shipping is a $14 trillion industry but still runs paperwork over fax,
and ships are monitored by humans in 24-hour rotations.
Sailors in foreign ports sometimes can't even pay for a meal because their cards are blocked.
I wanted to fix this."

[0:45-1:15] 💡 Solution
"Marino combines three things.
First, Claude AI monitors AIS data 24/7 and flags risk.
Second, sailors trade P2P in USDC through an on-chain escrow market.
Third — and most importantly — x402 lets AI agents pay autonomously.
Even when nobody is awake, the agent economy keeps running."

[1:15-1:35] ⏰ Why Now
"In 2026, three things finally aligned:
AIS data is freely available, Claude is strong enough to reason about maritime data,
and the x402 launch made agent-native payments real."

[1:35-1:55] 📈 Market + Vision
"100,000+ commercial vessels, 1.89M sailors, 800+ ports worldwide.
Starting in Busan, expanding across Southeast Asian ports.
Targeting $35M ARR via 29 USDC/month carrier subscriptions."

[1:55-2:00] 🙏 Closing
"Reviewers, please support Marino. Thank you."
```

---

## 5. Final Checklist

- [ ] Get the Vercel deploy URL
- [ ] Make `https://github.com/hex-aragon/marino` public OR invite hackathon@colosseum.org
- [ ] Download `public/logo.png` and upload to Colosseum
- [ ] Record demo video on Loom (≤3 min) → set to Public
- [ ] Record pitch video on Loom (≤2 min) → set to Public
- [ ] Fill out every field on the Colosseum form
- [ ] Write the Team Background (0xaragon) section yourself
- [ ] Continue to final survey → submit

About 15 hours remaining. Recording the videos only takes 30–60 minutes.

Let's ship it! 🚢
