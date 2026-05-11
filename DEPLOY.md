# SeaWatch 제출 가이드

## 1. Vercel 배포 (가장 빠른 길)

### 1-1. Vercel에서 프로젝트 Import

1. https://vercel.com/new 접속 (GitHub 로그인)
2. **Import Git Repository** → `hex-aragon/seawatch` 선택
3. **Configure Project** 화면에서:
   - Framework Preset: **Next.js** (자동 감지)
   - Root Directory: `./` (기본값)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)

### 1-2. 환경 변수 입력 (Environment Variables 섹션)

**필수 (없으면 목업 모드로 동작):**

| Key | Value | 비고 |
|-----|-------|------|
| `AISSTREAM_API_KEY` | `53856cc910261136304f9fb4f677323377c92d6c` | CLAUDE.md에 있는 키 |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | https://console.anthropic.com 에서 발급 |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` | devnet 으로 데모 |
| `NEXT_PUBLIC_MERCHANT_WALLET` | (본인 Solana 지갑 주소) | Phantom/Solflare 지갑 |

**선택 (없어도 동작):**

| Key | Value |
|-----|-------|
| `SOLANA_FEE_PAYER_PRIVATE_KEY` | (선택) base58 개인키 |
| `KV_REST_API_URL` | Vercel Storage > KV 생성 후 자동 주입 |
| `KV_REST_API_TOKEN` | Vercel Storage > KV 생성 후 자동 주입 |
| `RESEND_API_KEY` | https://resend.com 무료 가입 |

### 1-3. Deploy 클릭

- 1~2분 소요
- 배포 완료되면 `https://seawatch-xxxx.vercel.app` URL 발급
- 이 URL을 **Colosseum 제출의 "Live product link"** 에 입력

### 1-4. Vercel KV 추가 (선택, 캐싱용)

배포 후 Vercel 대시보드 → Storage → Create Database → KV 선택 → 자동으로 환경변수 주입됨.
없어도 데모 가능.

---

## 2. Colosseum 제출 폼 채우기

### Step 2: Media and Code

| 필드 | 입력값 |
|------|-------|
| **Project logo or graphic** | `public/logo.png` 파일 업로드 (이미 1024x1024 PNG로 생성됨) |
| **GitHub link** | `https://github.com/hex-aragon/seawatch` |
| **GitHub repo context** | 아래 텍스트 복붙 ↓ |
| **Product demo video** | Loom 녹화 후 URL (아래 스크립트 사용) |
| **Demo video visibility** | ✅ Public |
| **Live product link** | Vercel 배포 URL |
| **Access instructions** | 아래 텍스트 복붙 ↓ |
| **Pitch video** | Loom 녹화 후 URL (아래 스크립트 사용) |

### GitHub repo context 복붙용

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

### Access instructions 복붙용

```
1. Open the live URL — landing page loads with hero, features, pricing.
2. Click "대시보드 보기" → /dashboard shows live Busan vessels via aisstream.io WebSocket.
3. Wait ~15 seconds for Claude AI to analyze ships; red/orange markers and the right panel will populate with Korean-language alerts.
4. Toggle between 부산 / 인천 tabs (top-left of map) to switch ports.
5. Click any ship marker for popup details (speed, heading, destination, alert).
6. Click 마켓 (top-right) → /marketplace lists USDC-priced items; click "USDC로 구매" on any item to open the Solana Pay QR escrow modal.
7. Click 에이전트 → /agent opens streaming Claude chat. Try: "Give me a 72-hour premium forecast for Busan" — agent uses x402 to autopay 2 USDC for the premium endpoint.
8. For payment demo: connect Phantom wallet on Solana devnet, get devnet USDC from https://faucet.circle.com, then scan QR.
9. /satellite shows NASA Worldview iframe + density heatmap + public-data source cards.

Notes:
- No login required.
- If ANTHROPIC_API_KEY is unset in production, agent alerts fall back to rule-based mock analysis (still demonstrates the UX).
- All Solana transactions are on devnet — no real money involved.
```

---

## 3. 데모 영상 녹화 (3분, Loom 추천)

### 준비

1. https://loom.com 가입 (무료, 25개 영상까지)
2. Chrome 확장 또는 데스크톱 앱 설치
3. 배포된 Vercel URL 열어두기
4. 마이크/화면 권한 허용

### 녹화 스크립트 (90초 단축판)

> 한글로 녹화하고 영문 자막을 Loom에서 추가하거나, 영어로 그대로 녹화

```
[0:00-0:10] 🎬 인트로
"안녕하세요. SeaWatch는 솔라나 기반 해양 AI 에이전트 플랫폼입니다.
지금부터 핵심 3가지를 90초 안에 보여드리겠습니다."

→ /dashboard 로 이동

[0:10-0:35] 🚢 대시보드
"부산항의 실제 선박들입니다. AISStream으로 실시간 추적됩니다.
빨간 마커는 Claude AI 에이전트가 위험으로 분류한 선박입니다.
오른쪽 패널에서 표류 의심, 기상 위험 등 한국어 알림을 자동 생성합니다.
HIGH 등급은 운항관리자 이메일로 4초 안에 발송됩니다."

→ 마켓 버튼 클릭

[0:35-1:00] 🛒 마켓플레이스
"항구에 있는 선원들이 식품, 부품, 서비스를 USDC로 거래합니다.
예시 — 라면 박스 12 USDC. '구매' 클릭 → Solana Pay QR이 뜹니다.
스캔하면 결제 USDC가 에스크로에 잠기고,
선원이 수령 확인을 눌러야 판매자에게 전송됩니다."

→ /agent 로 이동

[1:00-1:30] 🤖 x402 (핵심)
"SeaWatch가 가장 특별한 부분입니다.
AI 에이전트에게 72시간 프리미엄 기상 예보를 요청하면,
에이전트가 유료 API에 접근 → 서버가 402 응답 → 자동으로 2 USDC를 지불 → 데이터를 받아옵니다.
사람 개입은 0%. 새벽 3시에도 에이전트는 작동합니다."

[1:30-1:40] 🌍 클로징
"전 세계 선박 10만 척, 선원 189만 명, 항구 800개.
모두 Solana에서 결제됩니다. 감사합니다."
```

---

## 4. Pitch 영상 녹화 (2분, Loom)

### 스크립트

```
[0:00-0:15] 👋 인사
"안녕하세요. SeaWatch 만든 [본인 이름]입니다.
저는 [백그라운드 한 줄 — 예: 부산에서 자란 풀스택 개발자]입니다."

[0:15-0:45] 💔 문제
"해운업은 14조 달러 산업이지만 여전히 팩스로 서류를 주고받고,
선박 모니터링은 사람이 24시간 교대로 합니다.
선원들은 외국 항구에서 결제가 막혀 라면 살 돈을 빌리기도 합니다.
이걸 풀어야겠다고 생각했습니다."

[0:45-1:15] 💡 솔루션
"SeaWatch는 세 가지를 합칩니다.
첫째, Claude AI가 AIS 데이터를 분석해 24시간 선박을 모니터링합니다.
둘째, 선원끼리 USDC로 P2P 거래하는 에스크로 마켓을 엽니다.
셋째, 가장 중요한 x402로 AI 에이전트가 자율 결제합니다.
사람이 없을 때도 에이전트 경제가 돌아갑니다."

[1:15-1:35] ⏰ 왜 지금
"2026년 시점에 세 가지가 정렬됐습니다.
AIS 데이터가 무료로 풀렸고, Claude가 해양 추론을 충분히 잘하고,
x402가 출시되면서 에이전트가 실제 결제를 할 수 있게 됐습니다."

[1:35-1:55] 📈 시장 + 비전
"전 세계 상선 10만 척, 선원 189만 명, 항구 800개.
부산에서 시작해 동남아 항구로 확장합니다.
선사 월 29 USDC 구독으로 ARR 3,500만 달러를 노립니다."

[1:55-2:00] 🙏 클로징
"심사관님, SeaWatch를 응원해주세요. 감사합니다."
```

---

## 5. 마지막 체크리스트

- [ ] Vercel 배포 URL 받기
- [ ] `https://github.com/hex-aragon/seawatch` 공개 또는 hackathon@colosseum.org 초대
- [ ] `public/logo.png` 다운로드 후 Colosseum 업로드
- [ ] Loom으로 데모 영상 (3분 이내) 녹화 → Public 설정
- [ ] Loom으로 Pitch 영상 (2분 이내) 녹화 → Public 설정
- [ ] Colosseum 폼 모든 필드 입력
- [ ] Team Background (0xaragon) 섹션 본인이 직접 작성
- [ ] Continue to final survey → 제출

남은 시간: 약 15시간. 영상 녹화만 30~60분이면 충분합니다.

화이팅! 🚢
