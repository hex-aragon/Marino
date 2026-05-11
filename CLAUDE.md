# 🚢 Marino — Maritime AI Agent Platform
## Claude Code 통합 개발 계획서 v2.0

> 전 세계 어느 항구에서도 AI 에이전트가 선박을 모니터링하고,
> 선원과 선사가 Solana USDC로 즉시 결제하며,
> 에이전트끼리 x402로 자율 거래하는 해양 특화 플랫폼

---

## 📌 프로젝트 핵심 3줄

```
1. 선사/선원: AI가 24시간 선박 모니터링 → 이상 감지 → 즉시 알림
2. 선원 마켓: 항구에서 선원끼리 물품·서비스를 USDC로 P2P 거래
3. 에이전트: x402로 AI끼리 자율 계약·결제·정산 (사람 개입 없음)
```

---

## 🏗️ 기술 스택

```
Frontend + Backend  Next.js 14 App Router (TypeScript)
스타일              Tailwind CSS + shadcn/ui
지도                Leaflet.js (react-leaflet) — SSR 비활성화 필수
배포                Vercel (icn1 한국 리전)
AI 에이전트         Anthropic Claude API claude-sonnet-4-20250514
블록체인            Solana (devnet 우선 → mainnet)
결제 표준           Solana Pay + USDC + x402 HTTP Payment Protocol
에이전트 통신       x402 프로토콜 (HTTP 402 → 자동 USDC 결제 → 재요청)
AIS 데이터          aisstream.io WebSocket (무료)
해양 기상           Open-Meteo Marine API (무료, 키 불필요)
캐시                Vercel KV (Redis, 무료 티어)
이메일              Resend API (무료 3,000건/월)
```

---

## 📁 전체 디렉토리 구조

```
marino/
├── CLAUDE.md
├── app/
│   ├── page.tsx                     ← 랜딩 페이지
│   ├── dashboard/page.tsx           ← 메인 모니터링 대시보드
│   ├── marketplace/
│   │   ├── page.tsx                 ← 선원 P2P 마켓플레이스
│   │   └── [id]/page.tsx            ← 상품 상세
│   ├── agent/page.tsx               ← AI 에이전트 채팅
│   ├── satellite/page.tsx           ← 위성·공공 해양 데이터 뷰어
│   └── api/
│       ├── ais/route.ts             ← AIS 선박 위치
│       ├── weather/
│       │   ├── route.ts             ← 무료 해양 기상
│       │   └── premium/route.ts     ← x402 유료 72h 기상 리포트
│       ├── agent/
│       │   ├── analyze/route.ts     ← AI 이상 감지 분석
│       │   └── chat/route.ts        ← AI 에이전트 채팅 streaming
│       ├── marketplace/
│       │   ├── items/route.ts       ← 상품 목록/등록
│       │   └── purchase/route.ts    ← 구매 + 에스크로 생성
│       ├── payment/
│       │   ├── create/route.ts      ← Solana Pay QR 생성
│       │   ├── verify/route.ts      ← 결제 검증
│       │   └── escrow/route.ts      ← 에스크로 lock/release/refund
│       └── x402/
│           ├── middleware.ts        ← x402 결제 미들웨어
│           └── verify/route.ts      ← 트랜잭션 헤더 검증
├── components/
│   ├── MaritimeMap.tsx              ← Leaflet 선박 지도
│   ├── AgentAlertPanel.tsx          ← AI 알림 패널
│   ├── ShipCard.tsx                 ← 선박 정보 카드
│   ├── MarketItem.tsx               ← 마켓 상품 카드
│   ├── AgentChat.tsx                ← AI 에이전트 채팅 UI
│   ├── PaymentModal.tsx             ← Solana Pay QR 결제
│   ├── EscrowStatus.tsx             ← 에스크로 상태 표시
│   └── SatelliteViewer.tsx          ← 위성 데이터 뷰어
├── lib/
│   ├── ais.ts                       ← aisstream.io WebSocket 클라이언트
│   ├── weather.ts                   ← Open-Meteo Marine API
│   ├── agent.ts                     ← Claude AI 에이전트 핵심 로직
│   ├── solana.ts                    ← Solana Pay + USDC 유틸
│   ├── escrow.ts                    ← 에스크로 로직 (서버 사이드)
│   ├── x402.ts                      ← x402 미들웨어 + 에이전트 결제
│   └── alerts.ts                    ← 알림 발송 (Resend)
├── hooks/
│   ├── useShips.ts                  ← 선박 데이터 실시간 (SWR)
│   ├── useAgent.ts                  ← AI 에이전트 상태
│   ├── usePayment.ts                ← Solana Pay 결제 훅
│   ├── useMarket.ts                 ← 마켓플레이스 데이터
│   └── useEscrow.ts                 ← 에스크로 상태 추적
├── types/index.ts                   ← 공통 TypeScript 타입
└── .env.local
```

---

## 🔑 환경변수 (.env.local)

```bash
AISSTREAM_API_KEY=53856cc910261136304f9fb4f677323377c92d6c
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SOLANA_NETWORK=devnet
SOLANA_FEE_PAYER_PRIVATE_KEY=base58_인코딩_개인키
NEXT_PUBLIC_MERCHANT_WALLET=솔라나_지갑_주소
KV_REST_API_URL=
KV_REST_API_TOKEN=
RESEND_API_KEY=re_...
```

---

## 📐 공통 타입 정의 (types/index.ts)

```typescript
export interface ShipData {
  mmsi: string
  shipname: string
  lat: number
  lon: number
  sog: number          // 속도 knots
  cog: number          // 방향 degrees
  destination: string
  shiptype: number
  timestamp: string
  status: number       // 0=항해중 1=정박 5=계류
}

export interface AgentAlert {
  mmsi: string
  shipname: string
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  type: 'DRIFT' | 'WEATHER' | 'ROUTE' | 'CONGESTION'
  message: string      // 한국어 50자 이내
  action: string
  createdAt: string
}

export interface WeatherData {
  area: 'busan' | 'incheon'
  waveHeight: number
  waveDirection: number
  wavePeriod: number
  riskLevel: 'SAFE' | 'CAUTION' | 'DANGER'
  updatedAt: string
}

export interface MarketItem {
  id: string
  title: string
  description: string
  category: 'food' | 'parts' | 'service' | 'info' | 'exchange'
  price: number        // USDC
  sellerWallet: string
  sellerName: string
  sellerRating: number
  port: 'busan' | 'incheon' | 'any'
  deliveryTime: string
  stock: number
  createdAt: string
}

export interface Escrow {
  id: string
  itemId: string
  buyerWallet: string
  sellerWallet: string
  amount: number       // USDC
  txHash: string
  status: 'locked' | 'released' | 'refunded'
  createdAt: string
}
```

---

## 💡 x402 프로토콜 동작 원리

```
[선원/선사 AI 에이전트]
    ↓ GET /api/weather/premium
[Marino API 서버]
    ↓ 402 Payment Required
      X-Payment-Required: USDC 2 solana:devnet
[에이전트 자동으로]
    ↓ Solana USDC 트랜잭션 생성 + 전송 (~200ms)
    ↓ GET /api/weather/premium
      X-Payment-Tx: <txHash>
[서버 검증 후]
    ↓ 200 OK + 72h 기상 데이터
    → 사람이 자는 새벽에도 에이전트 자율 운영 완료
```

---

## 🗺️ 화면 구성 (5개 페이지)

```
/              랜딩 페이지 (소개 + 가격)
/dashboard     해양 모니터링 대시보드 (핵심)
/marketplace   선원 P2P 마켓플레이스
/agent         AI 에이전트 채팅
/satellite     위성·공공 데이터 뷰어
```

---

## 📋 개발 태스크 목록

---

### TASK 1 — 프로젝트 초기화

```
Next.js 14 App Router 프로젝트를 초기화해줘.

설치 패키지:
tailwindcss, @shadcn/ui, react-leaflet, leaflet,
@solana/web3.js, @solana/pay, swr,
resend, @vercel/kv, qrcode.react, date-fns

shadcn 컴포넌트:
card, button, badge, dialog, scroll-area,
separator, toast, input, tabs, sheet

tsconfig.json: strict false
next.config.js:
- webpack fallback: { crypto: false, stream: false, buffer: true }
- transpilePackages: ['@solana/web3.js']
- images.domains: ['tile.openstreetmap.org']

types/index.ts: 위 공통 타입 전부 작성
```

---

### TASK 2 — AIS 선박 데이터 (aisstream.io WebSocket)

```
lib/ais.ts와 app/api/ais/route.ts를 만들어줘.

aisstream.io WebSocket:
URL: wss://stream.aisstream.io/v0/stream
연결 즉시 구독:
{
  "APIKey": process.env.AISSTREAM_API_KEY,
  "BoundingBoxes": [
    [[34.8, 128.8], [35.2, 129.3]],  // 부산
    [[37.2, 126.3], [37.6, 126.8]]   // 인천
  ],
  "FilterMessageTypes": ["PositionReport", "ShipStaticData"]
}

수신 → ShipData 타입으로 정규화
Node.js global singleton WebSocket 연결 유지
최신 데이터를 Map<mmsi, ShipData>에 저장
Vercel KV에 30초마다 스냅샷

GET /api/ais?area=busan  → 부산 선박 배열
GET /api/ais?area=incheon → 인천 선박 배열

키 없을 때: 목업 10척 반환 (부산항 35.1, 129.0 근처)
```

---

### TASK 3 — 해양 기상 API

```
lib/weather.ts와 app/api/weather/route.ts를 만들어줘.

Open-Meteo Marine API (무료, 키 불필요):
https://marine-api.open-meteo.com/v1/marine

부산: lat=35.1, lon=129.0
인천: lat=37.45, lon=126.6

hourly: wave_height, wave_direction, wave_period,
        wind_wave_height, swell_wave_height

위험 기준:
SAFE    < 1.5m
CAUTION 1.5 ~ 2.5m
DANGER  > 2.5m

반환: WeatherData 타입
캐시: Vercel KV 1시간

app/api/weather/premium/route.ts:
x402 미들웨어 적용 (2 USDC)
72시간 상세 예보 + 항로별 분석
```

---

### TASK 4 — Claude AI 에이전트

```
lib/agent.ts와 app/api/agent/analyze/route.ts를 만들어줘.

POST /api/agent/analyze
입력: { ships: ShipData[], weather: WeatherData, area: string }

Claude API:
모델: claude-sonnet-4-20250514
max_tokens: 1000
stream: true

시스템 프롬프트:
"당신은 해양 안전 전문 AI 에이전트입니다.
선박 AIS 데이터와 기상 데이터를 분석해서
위험 상황을 감지하고 한국어로 알림을 생성합니다.

감지 규칙:
1. SOG=0이고 status=0(항해중) → 표류 의심
2. 파고 > 2.5m 해역 진입 → 기상 위험
3. COG가 항로에서 15도 이상 이탈 → 항로 이탈
4. 반경 0.5해리 내 3척 이상 → 밀집 위험

JSON만 반환:
{
  alerts: [{ mmsi, shipname, level, type, message, action }],
  summary: string
}"

HIGH 레벨 → Resend 이메일 자동 발송
결과 Vercel KV 저장 (중복 방지 5분)

app/api/agent/chat/route.ts:
streaming 채팅 API
컨텍스트: 현재 선박 상태 + 날씨 + 최근 알림
에이전트 능력: 마켓 주문, 날씨 조회, 연료 예약 실행 가능
```

---

### TASK 5 — x402 에이전트 자율 결제

```
lib/x402.ts와 app/api/x402/를 만들어줘.

x402 흐름:
1. 에이전트가 유료 API 호출
2. 서버 → 402 반환
   헤더: X-Payment-Required: USDC 2 solana:devnet
3. 에이전트 → Solana 트랜잭션 전송
4. 트랜잭션 헤더 포함 재호출
   헤더: X-Payment-Tx: <txHash>
5. 서버 검증 → 데이터 반환

lib/x402.ts:
- x402Middleware(price: number): Next.js 미들웨어 함수
- verifyPaymentHeader(txHash, expectedAmount): boolean
- createPaymentRequest(amount, memo): string

app/api/x402/verify/route.ts:
POST { txHash, expectedAmount }
→ Solana RPC 검증
→ KV에 사용 기록 저장 (재사용 방지)

x402 적용 유료 API:
/api/weather/premium → 2 USDC
/api/agent/analyze/premium → 5 USDC
/api/route/optimize → 3 USDC
```

---

### TASK 6 — Solana Pay + 에스크로

```
lib/solana.ts, lib/escrow.ts,
app/api/payment/ 라우트를 만들어줘.

lib/solana.ts:
- createSolanaPayQR(amount, memo, reference): { url, qrData }
  devnet USDC: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
  mainnet USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
- verifyTransaction(reference): TxDetails | null
- transferUSDC(fromKey, toWallet, amount): txHash

lib/escrow.ts (MVP: 서버 에스크로):
- lockFunds(buyerWallet, sellerWallet, amount, itemId): Escrow
  → 구매자 USDC → 플랫폼 지갑으로 + KV에 잠금 기록
- releaseFunds(escrowId): txHash
  → 판매자에게 전송 (플랫폼 수수료 1% 차감)
- refundFunds(escrowId): txHash

app/api/payment/create/route.ts:
POST { type: 'subscription'|'market', amount, meta }
플랜: basic 9 USDC/월, premium 29 USDC/월

app/api/payment/verify/route.ts:
GET { reference } → 5초 폴링으로 확인

app/api/payment/escrow/route.ts:
POST { action: 'lock'|'release'|'refund', escrowId }
```

---

### TASK 7 — 커스텀 훅 5개

```
hooks/ 폴더에 5개 훅을 만들어줘.

1. useShips.ts
반환: { ships, isLoading, area, setArea, stoppedShips, dangerShips }
SWR로 /api/ais 30초 폴링

2. useAgent.ts
반환: { alerts, summary, isAnalyzing, lastUpdated, triggerAnalysis }
30초마다 /api/agent/analyze 자동 호출
streaming 응답 처리
HIGH 알림 → 브라우저 Notification API

3. usePayment.ts
반환: { createPayment, verifyPayment, isLoading, isPaid, qrData, txHash }
QR 생성 → 5초마다 결제 확인 폴링

4. useMarket.ts
반환: { items, isLoading, createItem, purchaseItem, area, setArea, category, setCategory }
SWR 폴링 + 카테고리/항구 필터링

5. useEscrow.ts
반환: { escrow, confirmDelivery, requestRefund, isLoading }
에스크로 상태 실시간 추적
```

---

### TASK 8 — Leaflet 지도 컴포넌트

```
components/MaritimeMap.tsx를 만들어줘.
'use client' + dynamic import (ssr: false) 필수.

Leaflet 설정:
타일: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
초기 중심: 부산항 (35.098, 129.035), zoom 9

선박 마커:
항해중: 파란 ▲ (COG 방향으로 rotate)
정박: 회색 ●
HIGH 이상: 빨간 ⚠️ + 깜빡임 애니메이션
MEDIUM 이상: 주황 !

클릭 팝업: 선박명 / MMSI / 속도 / 방향 / 목적지 / 상태

기상 위험 Circle 오버레이:
CAUTION: 노란 반투명 (fillOpacity 0.15)
DANGER: 빨간 반투명 (fillOpacity 0.2)

항구 마커: 부산항 ⚓ / 인천항 ⚓

UI 컨트롤:
좌상단: 부산/인천 토글
우상단: 선박 수 + 기상 상태 뱃지
좌하단: 범례

props:
ships: ShipData[]
alerts: AgentAlert[]
weather: WeatherData | null
onShipClick: (ship: ShipData) => void
```

---

### TASK 9 — AI 에이전트 알림 패널

```
components/AgentAlertPanel.tsx를 만들어줘.

헤더: "AI 해양 에이전트" + 상태 표시 + 분석 시각
요약 카드: summary + 위험 레벨별 배경색

알림 카드:
HIGH:   빨간 왼쪽 보더 + ⚠️
MEDIUM: 주황 왼쪽 보더
LOW:    파란 왼쪽 보더

카드 내용:
선박명 + MMSI / 알림 메시지(한국어) / 권장 조치 /
발생 시각 / "지도에서 보기" 버튼

하단:
무료: "프리미엄 업그레이드 (29 USDC/월)" 버튼
프리미엄: 일일 알림 카운터

props:
alerts, summary, isAnalyzing, onShipFocus, onPayClick, isPremium
```

---

### TASK 10 — 선원 P2P 마켓플레이스

```
app/marketplace/page.tsx와 관련 컴포넌트를 만들어줘.

레이아웃:
헤더: "항구 마켓" + 부산/인천 탭
검색바 + 카테고리 필터 칩
상품 그리드 2열
우측 하단: + 판매 등록 플로팅 버튼

카테고리: 전체 / 식품 / 부품 / 서비스 / 정보 / 환전

상품 카드:
카테고리 이모지 / 상품명+설명 / 판매자+별점 /
가격(USDC) + 배달 시간 / "USDC로 구매" 버튼

구매 플로우:
1. 구매 클릭 → 에스크로 안내 모달
2. Solana Pay QR 결제
3. 결제 확인 → 에스크로 잠금
4. 판매자 이메일 알림
5. 구매자 "수령 확인" → 에스크로 해제
6. 판매자 USDC 자동 전송 (수수료 1% 차감)

판매 등록 (shadcn Sheet):
제목 / 설명 / 카테고리 / 가격(USDC) / 배달 시간 / 지갑 주소

API:
GET/POST /api/marketplace/items
POST /api/marketplace/purchase → 에스크로 생성 + QR 반환
```

---

### TASK 11 — AI 에이전트 채팅 UI

```
app/agent/page.tsx와 components/AgentChat.tsx를 만들어줘.

채팅 레이아웃:
헤더: "Marino 에이전트" + 온라인 상태
메시지 스크롤 영역
입력창 + 전송 버튼

메시지:
AI: 왼쪽, 회색 배경, 둥근 모서리
사용자: 오른쪽, 파란 배경

액션 칩 (AI 메시지 아래):
"날씨 확인" / "연료 예약" / "마켓 열기" / "항로 분석" 등

에이전트 능력:
1. 현재 선박 상태 조회
2. 기상 정보 요약(무료) / 상세(x402 2 USDC)
3. 마켓 상품 검색·추천
4. 연료·선용품 자동 예약 (USDC 에스크로)
5. 항로 이탈 상세 분석 (x402 5 USDC)
6. 입항 수수료 계산

초기 메시지:
"안녕하세요 선장님. 현재 부산항 입항 예정 선박 [N]척을
모니터링 중입니다. 파고 [X]m로 [상태]입니다."

API: POST /api/agent/chat (streaming)
```

---

### TASK 12 — Solana Pay 결제 모달

```
components/PaymentModal.tsx를 만들어줘.
shadcn Dialog + usePayment 훅.

화면 1 — 플랜 선택:
Basic 9 USDC/월 / Premium 29 USDC/월
이메일 입력

화면 2 — QR 결제:
qrcode.react로 Solana Pay QR
"5초마다 자동 확인 중..." 애니메이션
"devnet 테스트 안내" 접기 패널

화면 3 — 완료:
트랜잭션 해시 (Solana Explorer 링크)
구독 유효기간
"대시보드로 이동" 버튼

마켓 구매 모달 (별도 컴포넌트):
상품명 + 가격 + "에스크로 안전 결제" 안내
완료 시: "판매자에게 알림을 보냈습니다"
```

---

### TASK 13 — 메인 대시보드 페이지

```
app/dashboard/page.tsx를 만들어줘.

레이아웃 (100vh):
┌─────────────────────────────────────────┐
│ 헤더 (전체 너비)                          │
├──────────────────────────┬──────────────┤
│  MaritimeMap (flex:1)    │ AgentAlert   │
│                          │ Panel (280px)│
├──────────────────────────┴──────────────┤
│ 통계 바 (전체 너비)                       │
└─────────────────────────────────────────┘

헤더:
🚢 Marino 로고 / 부산|인천 탭 /
선박 수 뱃지 / 기상 상태 뱃지 /
마켓 버튼 / 에이전트 버튼 / 프리미엄 버튼

통계 바:
모니터링 N척 | 이상 N건 | 파고 Xm | 업데이트 N초 전

모바일:
지도 전체화면 + 알림 하단 슬라이드업 Sheet

훅 연결: useShips, useAgent, usePayment
```

---

### TASK 14 — 위성·공공 데이터 뷰어

```
app/satellite/page.tsx를 만들어줘.

섹션 1: 한국 해역 현황 카드 그리드
부산/인천 파고·수온·풍속 (1시간 갱신)

섹션 2: 선박 밀집도 히트맵
Leaflet + Leaflet.heat (AIS 데이터)

섹션 3: NASA 위성 이미지
iframe: https://worldview.earthdata.nasa.gov
파라미터: 한국 해역 좌표 + 최근 날짜

섹션 4: 공공 데이터 출처 카드
AISStream / Open-Meteo / NASA Worldview /
국가해양위성센터 / 해양수산부 / Copernicus
```

---

### TASK 15 — 랜딩 페이지

```
app/page.tsx를 만들어줘.
다크 해양 테마: navy #0a1628 배경, 청록 #00d4aa 포인트

히어로:
헤드라인: "전 세계 어느 항구에서도"
서브: "AI 에이전트가 24시간 선박을 감시하고
     Solana USDC로 3초 안에 결제합니다"
CTA: "대시보드 보기" / "에이전트 채팅"

기능 소개 3열:
1. 실시간 위성 AIS 모니터링
2. AI 이상 감지 에이전트
3. Solana 즉시 결제 + x402

가격 카드:
Free 0 / Basic 9 USDC/월 / Premium 29 USDC/월

하단 통계 (카운터 애니메이션):
선박 100,000+ / 선원 1,890,000+ / 항구 800+

푸터: Marino © 2026 | Powered by Solana + Claude AI
```

---

### TASK 16 — Vercel 배포

```
vercel.json:
{
  "framework": "nextjs",
  "regions": ["icn1"],
  "functions": {
    "app/api/agent/**": { "maxDuration": 30 },
    "app/api/ais/**": { "maxDuration": 10 }
  }
}

next.config.js 최종 설정 (webpack fallback 포함)
.gitignore 확인 (.env.local 포함)
README.md: 환경변수 가이드 + aisstream.io 가입 방법
Vercel 환경변수 목록 정리
```

---

## ⚡ 실행 순서

```bash
# 데이터 레이어
claude "TASK 1 실행"
claude "TASK 2 실행"
claude "TASK 3 실행"

# 핵심 로직
claude "TASK 4 실행"
claude "TASK 5 실행"
claude "TASK 6 실행"

# 훅
claude "TASK 7 실행"

# UI
claude "TASK 8,9,10,11,12 순서대로 실행"

# 페이지
claude "TASK 13,14,15 순서대로 실행"

# 배포
claude "TASK 16 실행"
```

---

## 🎪 해커톤 2분 피칭 스크립트

```
[대시보드]
"부산항과 인천항의 실제 선박을 AI가 24시간 모니터링합니다."

[빨간 마커 클릭]
"기상 위험 구역 진입을 AI가 자동 감지해서
 선사 담당자에게 즉시 알림을 보냈습니다."

[마켓플레이스]
"선원들은 항구에서 물품과 서비스를
 USDC로 직접 거래합니다.
 에스크로로 안전하게 보호됩니다."

[x402 설명]
"가장 혁신적인 부분입니다.
 AI 에이전트가 기상 데이터가 필요할 때
 x402로 자동 USDC 결제하고 데이터를 받습니다.
 새벽에 사람이 자는 동안에도 에이전트가
 스스로 결제하고 분석을 완료합니다."

[QR]
"전 세계 어느 항구에서도 3초 안에 결제됩니다.
 선박 10만 척, 선원 189만 명이 잠재 고객입니다."
```

---

## ⚠️ 개발 주의사항

```
Leaflet SSR 비활성화 필수:
const Map = dynamic(() => import('@/components/MaritimeMap'), { ssr: false })

Solana 브라우저 에러 방지 (next.config.js):
webpack.fallback: { crypto: false, stream: false, buffer: true }

aisstream.io WebSocket은 Vercel Edge Function 불가
→ Node.js Runtime 사용

x402는 MVP에서 헤더 기반 단순 구현으로 충분

에스크로는 MVP에서 서버 에스크로
→ 프로덕션에서 Anchor 스마트 컨트랙트로 교체

devnet USDC는 실제 돈이 아님 (해커톤 데모 전용)
```

---

## 🏁 시간 부족 시 MVP 우선순위

```
필수 (4시간):  TASK 1,2,3,4,8,13   → 지도 + AI 알림
차별점 (2시간): TASK 5,6,12         → x402 + 결제
완성도 (2시간): TASK 10,11,15,16    → 마켓 + 배포
```

---

## 📊 코딩 규칙

```
TypeScript strict: OFF
컴포넌트: 함수형만
상태관리: useState + SWR
스타일: Tailwind만
API 에러: try-catch + 목업 폴백
Claude API: zod 스키마 검증
주석: 복잡한 로직만 한국어
```

---

*Marino v2.0 | Next.js + Solana + Claude AI + x402*
*부산항·인천항 → 글로벌 확장 | Maritime Hackathon 2026*

