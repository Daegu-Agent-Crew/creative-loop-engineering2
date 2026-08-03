# GOAL — CreatorFlow Agentic Creator Commerce

## 목표

OpenClaw Gemini 기반 Brand Agent와 Creator Agent가 CreatorFlow 웹페이지에서 YouTube 크리에이터 협업을 제안·협상·검수하고, Solana Devnet USDC를 위임 한도 안에서 자동 정산하는 해커톤 MVP를 만든다.

## 가치 가설

- 사용자 가치: 브랜드는 캠페인 조건만 설정하고, 크리에이터는 창작과 최종 수락에 집중하며, 정산은 증빙 가능한 이벤트로 자동 완료된다.
- 기본 목표: Agent 브라우저 협상, YouTube 실제 데이터 검증, 3단계 Devnet USDC 지급을 한 흐름으로 시연한다.
- 도전 목표: 사람 승인 없는 A2A 협상과 지급을 유지하면서 Wallet 서명, allowance, idempotency, revoke로 안전성을 증명한다.

## 성공 기준 (Definition of Done)

- [ ] Brand/Creator OpenClaw Agent가 웹에서 지갑 서명으로 등록한다.
- [ ] Brand Agent는 초대받은 Wallet만 등록되고 Creator Agent는 공개 등록할 수 있다.
- [ ] 두 Agent가 오퍼를 제안·반대 제안·수락하고 전체 이벤트가 감사 로그에 남는다.
- [ ] YouTube 영상의 채널, 공개 상태와 조회수를 실제 API 데이터로 검증한다.
- [ ] 사용자가 Circle 공식 Devnet USDC Token Account에 0.10 USDC delegate allowance를 설정하고 revoke할 수 있다.
- [ ] 선금 0.02, 잔금 0.03, KPI 보너스 0.01 USDC가 단계당 한 번만 지급된다.
- [x] 새 저장소 빌드가 `ai-solana-agent/creatorflow/`에 배포된다.
- [ ] 3분 데모 영상, GitHub 저장소, 소개서와 Explorer 증빙을 제출할 수 있다.

## 범위

### 포함 (In Scope)

- 새 저장소 `Daegu-Agent-Crew/creatorflow-solana`
- 기존 GitHub Pages 허브 하위 `creatorflow/` 배포
- OpenClaw Gemini 기반 Brand/Creator Agent
- Agent Wallet 생성, challenge 서명과 자율 등록
- Cloudflare Worker, D1, 필요 시 KV
- YouTube Data API와 채널 소유권 확인용 OAuth
- Solana Devnet 공식 USDC delegate, transfer, revoke
- 정책 검사, 상태 머신, idempotency와 감사 로그
- 해커톤용 3분 데모와 제출 증빙

### 제외 (Out of Scope)

- Solana Mainnet과 실가치 USDC
- YouTube API를 통한 영상 업로드
- Instagram 및 다중 소셜 채널
- 범용 크리에이터 검색·추천 마켓플레이스
- 법률 계약, 원천징수, 세금계산서와 분쟁 중재

## 관련 이슈

- GitHub Issue: #42
- CLE2-ID: CLE2-16

## 담당자

- 제품 결정: sfex11
- 구현·문서·검증: Codex
- 실행 Agent: OpenClaw Brand Agent / Creator Agent
