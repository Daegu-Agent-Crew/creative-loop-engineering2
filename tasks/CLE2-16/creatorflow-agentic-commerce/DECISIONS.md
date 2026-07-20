# DECISIONS — CreatorFlow Agentic Creator Commerce

## 결정 로그

### 2026-07-20 · YouTube 단일 채널

- 결정: Instagram 대신 YouTube 크리에이터 워크플로우를 MVP로 사용한다.
- 이유: 공개 영상 상태와 조회수를 공식 API에서 검증할 수 있고, KPI 지급 근거를 제3자가 재확인하기 쉽다.
- 근거: YouTube Data API 공식 문서와 해커톤의 verifiable commerce 요구
- 확신도: high
- 불확실성: 공개 전환 및 조회수 반영 지연
- 대안: Instagram API, 완전 mock KPI
- 사람 승인: approved

### 2026-07-20 · OpenClaw Agent가 웹 UI 직접 조작

- 결정: Brand/Creator OpenClaw Agent가 CreatorFlow의 역할별 웹페이지에 직접 접속한다.
- 이유: 심사위원에게 Agent가 제안, 수락, 검수와 지급을 실제 수행하는 장면을 보여준다.
- 확신도: high
- 불확실성: 브라우저/OAuth/Wallet 자동화 안정성
- 대안: 백엔드 Agent API만 호출, 사람이 UI 조작
- 사람 승인: approved

### 2026-07-20 · Gemini를 OpenClaw 두뇌로 사용

- 결정: 별도 Google Cloud 백엔드는 필수로 두지 않고 OpenClaw Agent의 추론 모델로 Gemini를 사용한다.
- 이유: Pages + Cloudflare 구조를 유지하면서 해커톤의 Gemini 활용을 실제 협상·검수 로그로 증명할 수 있다.
- 확신도: medium
- 불확실성: Google Cloud 인프라 사용을 추가했을 때의 심사 가점
- 대안: Cloud Run/Vertex AI 전체 이전, Gemini 미사용
- 사람 승인: approved

### 2026-07-20 · Agent 자율 등록과 Wallet 신원

- 결정: Agent 이름과 외부 ID는 스스로 제출하되 내부 ID는 서버가 생성하고, 신원은 Solana Wallet challenge 서명으로 증명한다.
- 이유: 문자열 ID 사칭을 막고 Agent가 독립적으로 온보딩하도록 한다.
- 확신도: high
- 불확실성: OpenClaw Wallet tool 배포 방식
- 대안: workspace 경로 등록, 사람이 Agent 계정을 수동 생성
- 사람 승인: approved
- 영향: Workspace 경로는 서비스에 저장하지 않는다.

### 2026-07-20 · 역할별 등록 정책

- 결정: Brand Agent는 1회용 초대가 있어야 등록하고, Creator Agent는 Wallet 서명으로 공개 등록한다.
- 이유: Brand Agent는 Treasury delegate 권한을 받지만 Creator Agent는 공개 마켓 참여자이기 때문이다.
- 확신도: high
- 사람 승인: approved

### 2026-07-20 · Devnet USDC 지급 계약

- 결정: 공식 Circle Devnet USDC를 사용해 선금 0.02, 잔금 0.03, KPI 보너스 0.01을 지급하고 allowance는 0.10으로 제한한다.
- 이유: 20 USDC 테스트 잔액으로 많은 재시도가 가능하고 원래 2:3:1 지급 비율을 유지한다.
- 근거: Devnet RPC로 Treasury 잔액과 공식 mint 확인
- 확신도: high
- 불확실성: Creator 수령 Wallet 미확정
- 사람 승인: approved

### 2026-07-20 · 새 저장소와 기존 Pages 경로

- 결정: 소스는 `creatorflow-solana`에 두고 빌드 결과는 기존 `ai-solana-agent/creatorflow/`로 배포한다.
- 이유: 해커톤 프로젝트의 저장소 경계를 분리하면서 기존 DApp Hub 주소를 유지한다.
- 확신도: high
- 불확실성: cross-repo 배포 인증을 PAT로 할지 GitHub App으로 할지
- 사람 승인: approved

## 열린 쟁점

- [ ] Creator Agent 수령 Wallet
- [ ] YouTube 데모 채널, OAuth Client와 영상
- [ ] OpenClaw Wallet tool 및 private key secret 저장 방식
- [ ] cross-repo Actions 최소 권한 방식

## 참고 링크

- GitHub Issue: #42
- 관련 태스크: CLE2-13, CLE2-14
- 관련 문서: [DEVELOPMENT-SPEC.md](./DEVELOPMENT-SPEC.md)
