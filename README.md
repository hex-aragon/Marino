# 🚢 SeaWatch — Maritime AI Agent Platform

> 전 세계 어느 항구에서도 AI 에이전트가 선박을 모니터링하고, 선원과 선사가 Solana USDC로 즉시 결제하며, 에이전트끼리 x402로 자율 거래하는 해양 특화 플랫폼.

세 가지 핵심:

1. **선사/선원** — AI가 24시간 선박을 모니터링하고 이상을 감지하면 즉시 알림을 보냅니다.
2. **선원 마켓** — 항구에서 선원끼리 물품·서비스를 USDC로 P2P 거래합니다.
3. **에이전트 경제** — x402 HTTP 결제 프로토콜로 AI끼리 자율 계약·결제·정산이 일어납니다.

## 기술 스택

Next.js 14 App Router · TypeScript · Tailwind · shadcn/ui · Leaflet · Anthropic Claude (`claude-sonnet-4-20250514`) · Solana Pay + USDC · x402 · aisstream.io · Open-Meteo Marine · Vercel KV · Resend.

## 시작하기

```bash
cp env.local.example .env.local    # 환경 변수 입력 (파일명에 . 추가)
npm install
npm run dev                        # http://localhost:3000
```

빌드:

```bash
npm run build
npm start
```

## 환경 변수

| 키 | 설명 | 발급처 |
| --- | --- | --- |
| `AISSTREAM_API_KEY` | 실시간 AIS WebSocket | https://aisstream.io (무료 가입) |
| `ANTHROPIC_API_KEY` | Claude API | https://console.anthropic.com |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` 또는 `mainnet-beta` | — |
| `SOLANA_FEE_PAYER_PRIVATE_KEY` | base58 인코딩 개인키 (선택, 개발용) | `solana-keygen new` |
| `NEXT_PUBLIC_MERCHANT_WALLET` | 결제 수신 Solana 지갑 주소 | 본인 Phantom/Solflare |
| `KV_REST_API_URL` | Vercel KV (Redis) URL — 선택 | Vercel Storage 대시보드 |
| `KV_REST_API_TOKEN` | Vercel KV 토큰 — 선택 | Vercel Storage 대시보드 |
| `RESEND_API_KEY` | 이메일 알림 — 선택 | https://resend.com |

키가 없으면 목업 데이터와 폴백 로직으로 동작하므로 데모에는 문제가 없습니다.

## 페이지

| 경로 | 설명 |
| --- | --- |
| `/` | 랜딩 (기능·가격·통계) |
| `/dashboard` | 실시간 모니터링 + AI 알림 |
| `/marketplace` | 선원 P2P USDC 마켓 |
| `/agent` | Claude 에이전트 채팅 |
| `/satellite` | NASA Worldview + 공공 데이터 뷰어 |

## API

`/api/ais` · `/api/weather` · `/api/weather/premium` (x402) · `/api/agent/analyze` · `/api/agent/chat` · `/api/marketplace/items` · `/api/marketplace/purchase` · `/api/payment/{create,verify,escrow}` · `/api/x402/verify`.

## 배포 (Vercel)

1. Vercel에 import한 뒤 위 환경 변수를 모두 등록합니다.
2. Region은 `icn1` (Seoul) — `vercel.json`에 이미 설정되어 있습니다.
3. aisstream WebSocket은 Edge Runtime을 지원하지 않으므로 관련 API 라우트는 Node.js 런타임으로 고정되어 있습니다.
4. Premium API와 에이전트 분석 라우트는 `maxDuration` 30초로 설정됩니다.

```bash
npm i -g vercel
vercel link
vercel env pull   # 로컬로 끌어오기
vercel --prod
```

## 라이선스

데모 / 해커톤용. SeaWatch © 2026.
