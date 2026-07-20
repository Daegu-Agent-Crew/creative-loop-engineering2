# CreatorFlow Worker API Reference

## 기본 규칙

- Base URL: 배포 후 결정
- Content-Type: `application/json`
- 시간: ISO-8601 UTC
- Wallet signature: base64
- 공개키: Solana base58
- 쓰기 요청은 `Idempotency-Key`를 지원한다.
- 오류 응답: `{ "success": false, "code": "...", "error": "..." }`

## 인증

### Challenge 발급

`POST /api/auth/challenge`

```json
{
  "action": "register-agent",
  "role": "brand",
  "wallet": "AgentWalletBase58",
  "inviteCode": "brand-only-one-time-code"
}
```

응답은 `challengeId`, canonical `message`, `expiresAt`을 반환한다. challenge는 5분 이내, nonce는 한 번만 사용할 수 있다.

### Agent 등록

`POST /api/agents/register`

```json
{
  "challengeId": "uuid",
  "name": "Brand Negotiator",
  "role": "brand",
  "wallet": "AgentWalletBase58",
  "openClawAgentId": "optional-external-id",
  "modelProvider": "gemini",
  "signature": "base64"
}
```

Worker는 내부 `agentId`를 생성한다. 이름과 OpenClaw ID는 신원 근거가 아니다.

## 캠페인

### 생성

`POST /api/campaigns`

Owner Wallet 인증이 필요하다.

```json
{
  "title": "CreatorFlow Launch Video",
  "budgetUsdc": "0.10",
  "depositUsdc": "0.02",
  "balanceUsdc": "0.03",
  "bonusUsdc": "0.01",
  "kpi": { "type": "youtube_views", "threshold": 100 },
  "brandAgentId": "agent_uuid"
}
```

금액은 부동소수점이 아니라 decimal string으로 받으며 내부에서 6-decimal base units로 변환한다.

### 목록·상세

- `GET /api/campaigns?agentId=...`
- `GET /api/campaigns/:campaignId`

## 협상

### 오퍼 또는 반대 제안

`POST /api/campaigns/:campaignId/offers`

```json
{
  "agentId": "agent_uuid",
  "kind": "offer",
  "deliverable": "YouTube branded video",
  "deadline": "2026-07-30T12:00:00Z",
  "amounts": { "deposit": "0.02", "balance": "0.03", "bonus": "0.01" },
  "kpi": { "type": "youtube_views", "threshold": 100 },
  "geminiRunId": "audit_uuid"
}
```

`kind`는 `offer|counter`다. 서버는 합의 가능한 금액 cap과 campaign state를 검사한다.

### 수락·거절

- `POST /api/offers/:offerId/accept`
- `POST /api/offers/:offerId/reject`

수락 요청에는 Creator Agent Wallet 서명이 필요하다. 성공하면 `DEAL_ACCEPTED` milestone이 생성된다.

## YouTube

### 영상 제출

`POST /api/campaigns/:campaignId/youtube-video`

```json
{
  "creatorAgentId": "agent_uuid",
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

서버는 video ID, channel ID, privacy status와 view count를 저장한다.

### 상태 재검증

`POST /api/campaigns/:campaignId/youtube-video/verify`

응답:

```json
{
  "success": true,
  "videoId": "VIDEO_ID",
  "channelMatch": true,
  "privacyStatus": "public",
  "viewCount": "123",
  "verifiedAt": "2026-07-20T00:00:00Z"
}
```

## 지급

### 정책 사전 검사

`POST /api/campaigns/:campaignId/payments/:milestone/check`

`milestone`은 `deposit|balance|bonus`다. 각 정책 결과와 온체인 allowance 상태를 반환한다.

### 서명할 트랜잭션 요청

`POST /api/campaigns/:campaignId/payments/:milestone/transaction`

서버는 검증된 source Token Account, creator ATA, mint, amount와 blockhash를 사용해 unsigned transaction 또는 instruction contract를 반환한다. Brand Agent는 자신의 Wallet으로 서명한다.

### 제출 결과 기록

`POST /api/campaigns/:campaignId/payments/:milestone/confirm`

```json
{
  "signature": "SolanaTxSignature",
  "idempotencyKey": "campaign:creator:deposit"
}
```

Worker가 RPC에서 mint, source, destination, amount, delegate signer와 성공 상태를 재검증한 뒤 confirmed로 기록한다. 클라이언트가 보낸 signature를 그대로 신뢰하지 않는다.

## 감사 로그

- `GET /api/campaigns/:campaignId/audit`
- `POST /api/audit/gemini-run`

감사 이벤트는 append-only다. 비밀값과 전체 내부 추론은 저장하지 않는다.

## 주요 오류 코드

| Code | HTTP | 의미 |
|---|---:|---|
| `CHALLENGE_EXPIRED` | 401 | challenge 만료 |
| `SIGNATURE_INVALID` | 401 | Wallet 서명 불일치 |
| `NONCE_REUSED` | 409 | challenge 재사용 |
| `INVITE_REQUIRED` | 403 | Brand 초대 없음 |
| `ROLE_FORBIDDEN` | 403 | 역할 권한 없음 |
| `STATE_CONFLICT` | 409 | 허용되지 않은 상태 전이 |
| `VIDEO_CHANNEL_MISMATCH` | 422 | 등록 YouTube 채널과 영상 불일치 |
| `POLICY_BLOCKED` | 422 | 예산, cap, whitelist 또는 선행 조건 실패 |
| `ALLOWANCE_INSUFFICIENT` | 422 | on-chain delegated amount 부족 |
| `PAYMENT_EXISTS` | 200 | 동일 idempotency key의 기존 지급 반환 |
| `TX_NOT_CONFIRMED` | 422 | RPC에서 지급 트랜잭션 검증 실패 |
