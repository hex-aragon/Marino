# 🚢 SeaWatch — Maritime AI Agent Platform

> From any port in the world, AI agents monitor vessels, sailors and operators settle instantly in Solana USDC, and agents trade autonomously over x402 — a maritime-focused platform.

Three core pillars:

1. **Operators & sailors** — AI monitors vessels 24/7 and sends instant alerts the moment an anomaly is detected.
2. **Sailor marketplace** — Sailors trade goods and services P2P at the port, paid in USDC.
3. **Agent economy** — Agents contract, pay, and settle autonomously over the x402 HTTP payment protocol.

## Tech Stack

Next.js 14 App Router · TypeScript · Tailwind · shadcn/ui · Leaflet · Anthropic Claude (`claude-sonnet-4-20250514`) · Solana Pay + USDC · x402 · aisstream.io · Open-Meteo Marine · Vercel KV · Resend.

## Getting Started

```bash
cp env.local.example .env.local    # Fill in env vars (note the leading dot)
npm install
npm run dev                        # http://localhost:3000
```

Build:

```bash
npm run build
npm start
```

## Environment Variables

| Key | Description | Where to get it |
| --- | --- | --- |
| `AISSTREAM_API_KEY` | Real-time AIS WebSocket | https://aisstream.io (free sign up) |
| `ANTHROPIC_API_KEY` | Claude API | https://console.anthropic.com |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` or `mainnet-beta` | — |
| `SOLANA_FEE_PAYER_PRIVATE_KEY` | base58-encoded private key (optional, for development) | `solana-keygen new` |
| `NEXT_PUBLIC_MERCHANT_WALLET` | Solana wallet address to receive payments | Your own Phantom/Solflare |
| `KV_REST_API_URL` | Vercel KV (Redis) URL — optional | Vercel Storage dashboard |
| `KV_REST_API_TOKEN` | Vercel KV token — optional | Vercel Storage dashboard |
| `RESEND_API_KEY` | Email alerts — optional | https://resend.com |

If keys are missing, the app falls back to mock data and fallback logic, so demos still work.

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing (features, pricing, stats) |
| `/dashboard` | Real-time monitoring + AI alerts |
| `/marketplace` | Sailor P2P USDC marketplace |
| `/agent` | Claude agent chat |
| `/satellite` | NASA Worldview + public data viewer |

## API

`/api/ais` · `/api/weather` · `/api/weather/premium` (x402) · `/api/agent/analyze` · `/api/agent/chat` · `/api/marketplace/items` · `/api/marketplace/purchase` · `/api/payment/{create,verify,escrow}` · `/api/x402/verify`.

## Deploy (Vercel)

1. Import the project into Vercel and register all environment variables above.
2. Region is `icn1` (Seoul) — already configured in `vercel.json`.
3. aisstream WebSocket does not support the Edge Runtime, so related API routes are pinned to the Node.js runtime.
4. Premium API and agent analysis routes are configured with `maxDuration` of 30 seconds.

```bash
npm i -g vercel
vercel link
vercel env pull   # Pull env vars locally
vercel --prod
```

## License

For demo / hackathon use. SeaWatch © 2026.
