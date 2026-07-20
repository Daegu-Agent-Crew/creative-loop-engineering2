# CreatorFlow 개발 사양서

## 1. 제품 계약

CreatorFlow는 OpenClaw Gemini 기반 Brand Agent와 Creator Agent가 YouTube 크리에이터 협업을 협상하고, 검증된 작업 이벤트에 따라 Solana Devnet USDC를 자동 지급하는 웹서비스다.

사람은 캠페인 정책과 최대 지급 한도를 한 번 설정한다. Agent는 그 범위 안에서 제안, 반대 제안, 수락, 콘텐츠 검수, 공개 확인과 KPI 지급을 처리한다.

### 데모 지급 계약

| 마일스톤 | 조건 | 금액 |
|---|---|---:|
| `DEAL_ACCEPTED` | Creator Agent가 최종 오퍼 수락 | 0.02 USDC |
| `VIDEO_PUBLIC` | 등록 채널 영상이 public | 0.03 USDC |
| `KPI_VERIFIED` | 공개 조회수가 설정 KPI 이상 | 0.01 USDC |

- 캠페인 allowance: 0.10 USDC
- 한 캠페인 지급 합계: 0.06 USDC
- 자산: Circle 공식 Solana Devnet USDC
- mint: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

Devnet USDC에는 실가치가 없다. 화면과 문서에서 테스트 자산임을 항상 표시한다.

## 2. 시스템 경계

```text
Treasury Owner
  └─ Phantom으로 캠페인 생성 및 delegate 0.10 USDC 승인

OpenClaw Brand Agent (Gemini + Agent Wallet)
  └─ /creatorflow/brand-agent/ 브라우저 조작
          │
          ▼
GitHub Pages UI ───── Cloudflare Worker ───── D1
          │              │                     │
          │              ├─ challenge/auth     ├─ agents
          │              ├─ policy/idempotency ├─ campaigns
          │              ├─ YouTube verifier   ├─ negotiations
          │              └─ audit API          ├─ milestones
          │                                    ├─ payments
          │                                    └─ audit_events
          ▼
OpenClaw Creator Agent (Gemini + payout Wallet)
  └─ /creatorflow/creator-agent/ 브라우저 조작

Brand Agent Wallet ── signed USDC transfer ──► Creator payout Wallet
          │
          └─ Treasury USDC Token Account가 delegate 0.10 허용
```

### 컴포넌트 책임

| 컴포넌트 | 책임 | 가지면 안 되는 것 |
|---|---|---|
| GitHub Pages | UI, Phantom owner approve/revoke, Agent 작업 화면 | API key, OAuth secret, private key |
| Cloudflare Worker | 인증, 정책, 상태 전이, YouTube 조회, 감사 로그 | Treasury private key, Agent private key |
| D1 | 공유 상태, nonce, idempotency, tx 결과 | private key, raw OAuth client secret |
| OpenClaw Brand Agent | Gemini 협상·검수, 브라우저 작업, Agent Wallet 서명 | Treasury private key |
| OpenClaw Creator Agent | Gemini 반대 제안·수락, 영상 URL 제출, payout Wallet 서명 | Brand Agent key |
| Treasury Owner | allowance approve/revoke | Agent 운영 비밀 |

## 3. Agent 등록

### 공통 규칙

- Agent가 제출하는 이름은 표시용이다.
- CreatorFlow 내부 ID는 Worker가 생성한다.
- OpenClaw 외부 agent ID는 선택 메타데이터다.
- Workspace 경로는 수집하지 않는다.
- 인증의 기준은 Agent Wallet의 Ed25519 서명이다.

### Brand Agent

1. Owner가 10분 유효한 1회용 Brand 초대를 만든다.
2. Agent가 등록 페이지에서 이름, Wallet 공개키와 초대를 제출한다.
3. Worker가 action, role, wallet, timestamp, nonce가 포함된 challenge를 반환한다.
4. Agent Wallet이 challenge를 서명한다.
5. Worker가 서명, 만료, nonce와 초대를 검증하고 Brand 역할을 발급한다.
6. Owner가 이 Wallet을 Treasury USDC Token Account의 delegate로 승인한다.

### Creator Agent

1. Agent가 공개 등록 페이지에서 이름과 payout Wallet을 제출한다.
2. Worker challenge를 Wallet으로 서명한다.
3. Worker가 Creator ID를 발급한다.
4. YouTube OAuth로 채널 소유권을 연결한다.

## 4. 상태 머신

### 캠페인

```text
DRAFT
  → OPEN
  → NEGOTIATING
  → DEAL_ACCEPTED
  → CONTENT_SUBMITTED
  → CONTENT_APPROVED
  → VIDEO_PUBLIC
  → KPI_VERIFIED
  → SETTLED

모든 활성 상태 → PAUSED → 재개 또는 CANCELLED
```

상태 전이는 Worker가 현재 상태와 actor role을 검사한 후 원자적으로 기록한다. 클라이언트가 다음 상태를 임의로 지정할 수 없다.

### 협상

```text
OFFERED ↔ COUNTERED → ACCEPTED
                  └→ REJECTED / EXPIRED
```

오퍼에는 다음 값이 고정되어야 한다.

- `campaignId`
- `creatorAgentId`
- deliverable과 YouTube 채널
- `depositAmount`, `balanceAmount`, `bonusAmount`
- KPI type, threshold와 deadline
- 합의 버전 hash

### 지급

```text
PENDING → POLICY_APPROVED → SIGNED → SUBMITTED → CONFIRMED
   └──────────────→ BLOCKED / FAILED ──→ RETRYABLE
```

`campaignId:creatorAgentId:milestone`을 idempotency key로 사용한다. D1에 unique constraint를 두고, 같은 key 요청에는 새 트랜잭션 대신 기존 결과를 반환한다.

## 5. 정책 엔진

지급 전 다음을 모두 검사한다.

1. 캠페인이 paused/cancelled가 아니다.
2. 요청 actor가 등록된 Brand Agent다.
3. milestone의 선행 상태가 완료됐다.
4. Creator payout Wallet이 합의 오퍼와 일치한다.
5. 동일 milestone payment가 없다.
6. 캠페인 잔여 예산이 충분하다.
7. Creator cap을 넘지 않는다.
8. Treasury USDC balance가 충분하다.
9. 현재 delegate가 Brand Agent Wallet과 일치한다.
10. on-chain delegated amount가 지급액 이상이다.

Policy Engine은 안전 설명과 사용자 경험을 제공하지만 bare SPL delegate가 온체인에서 강제하는 값은 총 delegated amount다. 일일 한도, milestone과 whitelist는 Worker/D1이 강제한다. 그래서 allowance 자체도 0.10 USDC로 작게 제한한다.

## 6. Solana 지급

### 확인된 Treasury

| 항목 | 값 |
|---|---|
| Owner | `FWmGGKtczrdtWQJNdimApAfzBxEKdoDFwCFQtP9DEB5i` |
| Devnet SOL | 약 4.956 SOL |
| 공식 USDC balance | 20 USDC |
| USDC Token Account | `HHxjRNC6KZHqpk5c4tGzxUqzbSahz8Tby7BWdcsE5GfK` |
| USDC mint | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` |
| decimals | 6 |

### approve

Owner는 Pages에서 Phantom으로 `ApproveChecked` 계열 instruction을 서명한다. delegate는 등록된 Brand Agent Wallet이고 amount는 `100000` base units, 즉 0.10 USDC다.

### transfer

Brand Agent Wallet이 delegate authority로 Treasury USDC Token Account에서 Creator의 USDC associated token account로 `TransferChecked`를 서명한다.

Creator ATA가 없으면 생성 instruction을 같은 트랜잭션에 포함할 수 있다. 이 경우 fee payer와 rent 부담 주체를 로그에 명시한다.

### revoke

Owner는 언제든 Phantom으로 revoke를 서명한다. revoke 후 Worker는 다음 payment를 blocked로 기록하고 Agent는 새 transfer를 보내지 않는다.

## 7. YouTube 검증

### 채널 연결

- OAuth `channels.list?mine=true` 결과로 채널 ID를 얻는다.
- OAuth token은 Worker Secret 또는 암호화된 저장소에 보관하고 D1에 평문으로 저장하지 않는다.
- MVP scope는 채널 확인과 영상 상태 변경에 필요한 최소 범위로 제한한다.

### 영상 제출

- Creator는 YouTube Studio에서 unlisted 영상을 직접 업로드한다.
- Creator Agent가 video URL을 제출한다.
- Worker는 video ID를 추출하고 `videos.list(part=snippet,status,statistics)`로 확인한다.
- `snippet.channelId`가 등록 채널과 일치하지 않으면 거절한다.

### 공개와 KPI

- public 전환은 우선 Creator가 Studio에서 수행한다.
- OAuth `videos.update` 자동 전환은 실테스트가 통과한 뒤 선택 기능으로 둔다.
- 잔금 직전 `status.privacyStatus === public`을 다시 확인한다.
- 보너스 직전 `statistics.viewCount >= threshold`를 확인한다.
- 모든 조회 결과에 video ID, channel ID, privacy status, view count, 조회 시각을 저장한다.

## 8. Gemini 사용 증빙

OpenClaw 두 Agent의 모델 provider를 Gemini로 설정한다. 다음 결과만 감사 로그에 남긴다.

- model 식별자
- action type
- 입력 요약 hash
- 구조화 결과: 제안, 반대 제안, 검수 항목과 결정
- 실행 시각과 latency
- tool call 결과

비공개 내부 추론 전체와 API key는 저장하지 않는다. 지급 정책은 Gemini 출력만 믿지 않고 결정론적 Policy Engine이 다시 검사한다.

## 9. 저장소와 배포

### 소스 저장소

`Daegu-Agent-Crew/creatorflow-solana`

권장 구조:

```text
creatorflow-solana/
├── src/                    # Pages UI
├── worker/                 # Cloudflare Worker
│   ├── src/
│   └── migrations/
├── openclaw/               # Agent onboarding와 wallet tool 문서/스크립트
├── tests/
├── docs/
└── .github/workflows/
```

### 공개 Pages

`creatorflow-solana`의 build artifact를 `ai-solana-agent/creatorflow/`에 동기화한다. 기존 Hub에 CreatorFlow 카드를 추가한다.

cross-repo credential은 다음 중 하나를 사용한다.

1. `ai-solana-agent` 한 저장소에만 contents write가 가능한 fine-grained token
2. 두 저장소에 설치된 GitHub App token

일반 `repo` 전체 권한 PAT는 피한다.

## 10. 3분 데모

| 시간 | 장면 | 증빙 |
|---|---|---|
| 0:00–0:20 | 문제와 캠페인 조건 | 0.10 allowance, 3개 지급액 |
| 0:20–0:45 | Owner approve | Phantom 서명, delegate on-chain 상태 |
| 0:45–1:20 | 두 Agent 협상 | Gemini 구조화 오퍼와 최종 수락 |
| 1:20–1:40 | 선금 | 0.02 tx와 Explorer |
| 1:40–2:05 | YouTube 제출·공개 확인 | channel/status 실제 API 스냅샷 |
| 2:05–2:25 | 잔금·KPI | 0.03, view count, 0.01 tx |
| 2:25–2:45 | 감사 로그 | 정책 10개 검사와 idempotency |
| 2:45–3:00 | revoke와 마무리 | delegate 제거 후 지급 차단 |

데모 영상은 이미 KPI를 충족한 실제 영상을 사용한다. Verifier가 현재 조회수를 읽어 조건을 충족하는 모습을 라이브로 보여준다.

## 11. 완료 증빙

- 공개 CreatorFlow URL
- 두 OpenClaw Agent 등록 public key
- Gemini agent action 로그
- YouTube video/channel/status/statistics 스냅샷
- approve/delegate 상태
- 선금, 잔금, 보너스 tx signature
- 중복 요청이 기존 tx를 반환한 로그
- revoke 후 차단 로그
- CI와 Pages 배포 실행
- 3분 데모 영상
