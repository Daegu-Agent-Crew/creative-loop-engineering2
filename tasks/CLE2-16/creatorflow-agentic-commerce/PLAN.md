# PLAN — CreatorFlow Agentic Creator Commerce

## 실행 계획

### Phase 1: CLE2 개발 문서와 실행 계약

- **담당**: Codex
- **입력**: 해커톤 기획안, 기존 DApp 검토, 사용자 결정, 공개 RPC 검증
- **출력**: GOAL, DISCOVERY, PLAN, STATUS, TESTS, DECISIONS, 개발 사양, API와 Agent 등록 가이드
- **상태**: 완료

### Phase 2: 저장소와 Pages UI

- **담당**: Codex
- **입력**: 개발 사양서와 CLE2-16 Issue
- **출력**: `creatorflow-solana` 저장소, 캠페인/Brand Agent/Creator Agent/감사 로그 화면
- **완료 조건**: 정적 빌드와 기본 라우팅 테스트 통과
- **상태**: 완료. 공개 Pages와 Hub 카드 배포, CI와 브라우저 검증 통과

### Phase 3: Agent 등록·협상·감사 API

- **담당**: Codex + OpenClaw Agent
- **입력**: Agent Wallet 공개키, Brand 초대 정책
- **출력**: Worker/D1, challenge 서명 등록, 역할 권한, 오퍼 상태 머신, audit event
- **완료 조건**: 두 Agent가 웹에서 등록하고 오퍼를 수락하는 브라우저 E2E 통과
- **상태**: 완료. Worker/D1 운영 배포, 0.10 USDC 상한과 중복 수락 차단, 로컬 두 역할 E2E 및 공개 UI/API 검증 통과. OpenClaw 실지갑 E2E는 Phase 6에서 수행

### Phase 4: YouTube 실제 데이터 검증

- **담당**: Codex
- **입력**: YouTube API key, OAuth Client, 데모 채널과 영상
- **출력**: 채널 소유권, video channel/status/statistics 검증, KPI 스냅샷
- **완료 조건**: unlisted 제출, 공개 전환, 조회수 KPI 감지 E2E 통과
- **상태**: 진행 중

### Phase 5: USDC delegate와 3단계 지급

- **담당**: Codex + Brand OpenClaw Agent
- **입력**: Treasury, Brand Agent Wallet, Creator Wallet, 공식 Devnet USDC mint
- **출력**: approve 0.10, transfer 0.02/0.03/0.01, revoke, Explorer 링크, idempotency
- **완료 조건**: 단계별 한 번만 지급되고 재실행 시 중복 지급되지 않음

### Phase 6: OpenClaw E2E·배포·제출

- **담당**: Codex + OpenClaw Brand/Creator Agent
- **입력**: 완성된 UI/API/YouTube/Solana 흐름
- **출력**: 기존 Pages 하위 배포, 3분 데모, 소개서, README, 실행 로그
- **완료 조건**: 공개 URL, 영상, GitHub, 온체인 증빙이 제출 체크리스트 통과

## 의존성

- CLE2-13: Unknown과 사람 승인 게이트 기록 방식
- CLE2-14 / `ai-solana-agent`: Solana·Phantom·Pages 선행 PoC와 배포 허브
- Google/YouTube: Gemini API 및 YouTube Data API credentials
- Cloudflare: Worker, D1, secrets
- GitHub: 새 저장소와 기존 Pages 저장소에 대한 Actions 권한

## 도구 및 접근

| 도구/데이터 | 목적 | 접근 상태 | 대안 |
|---|---|---|---|
| GitHub CLI/API | 저장소·Issue·PR·Actions | available | GitHub App |
| OpenClaw | Gemini Agent와 브라우저 실행 | setup-needed | 로컬 브라우저 자동화로 계약 테스트 |
| Cloudflare Worker/D1 | API와 공유 상태 | available | Cloud Run/Firestore |
| YouTube Data API | 채널·상태·조회수 | credentials-needed | API 준비 전 계약 fixture |
| Solana Devnet RPC | 토큰과 트랜잭션 | verified | 보조 Devnet RPC |

## 사람 승인 게이트

| 게이트 | 승인 대상 | 승인자 | 기준 |
|---|---|---|---|
| G1 | Brand Agent Wallet delegate 0.10 USDC | Treasury Owner | 공개키와 금액 확인 후 Phantom 서명 |
| G2 | Creator Agent 수령 Wallet | Creator/운영자 | Wallet 서명 등록 완료 |
| G3 | YouTube OAuth | 채널 Owner | 최소 scope와 데모 영상 확인 |
| G4 | 기존 Pages 저장소 배포 권한 | 저장소 Owner | build artifact 경로와 최소 쓰기 권한 확인 |
| G5 | 해커톤 제출 | sfex11 | 3분 데모, GitHub, 소개서, tx 증빙 확인 |

## 리스크

- Agent Wallet 키 노출: OpenClaw secret store만 사용하고 Pages/D1/log에는 공개키만 저장한다.
- 중복 지급: `campaignId:creatorId:milestone` unique key와 DB transaction을 사용한다.
- 오프체인 정책 우회: allowance 자체를 0.10으로 제한하고 지급 전후 온체인 상태를 재검증한다.
- YouTube API 지연: 데모 영상과 KPI를 사전 검증하고 조회 결과 시각을 로그에 남긴다.
- cross-repo 배포 token 과다 권한: 대상 저장소 contents write로 제한하거나 GitHub App을 사용한다.
