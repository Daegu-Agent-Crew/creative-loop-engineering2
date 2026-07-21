# DECISIONS — CreatorFlow2

## 2026-07-22

- 결정: Creator AI와 브랜드 담당자를 일상 워크플로우에서 제외하고 브랜드 AI, 사람 크리에이터, 시스템의 3자 구조로 단순화한다.
- 이유: 크리에이터는 수락과 제출만 수행하고, AI가 마케팅 판단과 결제에 실제 참여해야 해커톤 목적과 사용 편의가 함께 살아난다.
- 확신도: high
- 사람 승인: approved

- 결정: 브랜드 AI는 캠페인 생성, 크리에이터 분석, 개별 금액 제안, 콘텐츠 판단과 결제 서명을 담당한다.
- 이유: AI의 역할을 마케팅 판단과 자금 승인으로 명확히 하고 객관 검증과 집행은 시스템에 분리한다.
- 확신도: high
- 사람 승인: approved

- 결정: 시스템은 YouTube·성과·예산·서명·중복을 검증하고, 서명된 USDC 거래를 전송·확인·기록한다.
- 이유: AI가 자기 판단을 스스로 검증하거나 무제한 송금하지 못하게 한다.
- 확신도: high
- 사람 승인: approved

- 결정: 브랜드 지갑과 AI 지갑은 같은 키를 쓰지 않는다. 브랜드 지갑이 소유권을 유지하고 AI 지갑에는 소액 delegate allowance만 부여한다.
- 이유: AI 키 분실 시 브랜드 자금은 남고, revoke 후 새 AI 지갑으로 교체할 수 있다.
- 확신도: high
- 사람 승인: approved

- 결정: 수락과 영상 제출은 별도 상태로 유지한다.
- 이유: 제작 전에 조건과 금액을 확정하고, 이후 실제 결과물을 별도로 증명해야 한다.
- 확신도: high
- 사람 승인: approved

- 결정: UI는 여러 크리에이터 파이프라인 시안을 채택하되 단일 캠페인 시안처럼 여백이 많고 다음 행동 하나만 강조한다.
- 이유: 확장 가능한 운영 화면과 해커톤 데모의 단순성을 함께 확보한다.
- 근거: `references/creatorflow2-pipeline-concept.png`
- 확신도: high
- 사람 승인: approved

- 결정: MVP 지급액은 AI 적합도 0~59=0.01, 60~79=0.02, 80~89=0.03, 90~100=0.05 Devnet USDC의 네 구간으로 제한한다.
- 이유: 크리에이터별 차등 지급은 유지하면서 AI가 임의 금액을 만들지 못하게 한다.
- 확신도: high
- 사람 승인: delegated to Codex

- 결정: 기존 CreatorFlow는 그대로 유지하고 CreatorFlow2는 별도 저장소, Worker, D1, Pages `/creatorflow2/` 경로로 운영한다.
- 이유: 새 워크플로우의 실험과 데이터 변경이 기존 서비스에 영향을 주지 않게 한다.
- 확신도: high
- 사람 승인: approved

- 결정: 시스템 hard cap은 캠페인당 0.30 USDC, 브랜드 AI 일일 0.10 USDC로 시작한다.
- 이유: 지급 정책과 온체인 allowance를 작은 테스트 금액으로 일치시킨다.
- 확신도: high
- 사람 승인: delegated to Codex

- 결정: MVP는 SPL Token delegate를 사용하고, 수신자·금액·예산·중복·메모는 Worker가 별도로 검증한다.
- 이유: 별도 Solana 프로그램 없이도 AI 결제 참여와 통제 가능성을 데모할 수 있다.
- 확신도: medium
- 사람 승인: delegated to Codex

## 열린 쟁점

- [ ] 해커톤 이후 수신자·만료를 온체인에서 강제하는 Solana 프로그램으로 확장할지
- [ ] 실제 운영 전 조회수·난이도·과거 성과를 지급 점수에 추가할지

## 참고 링크

- GitHub Issue: #46
- 관련 태스크: CLE2-16
- UI 레퍼런스: `references/creatorflow2-pipeline-concept.png`
- CreatorFlow2 서비스: <https://daegu-agent-crew.github.io/ai-solana-agent/creatorflow2/>
- CreatorFlow2 소스: <https://github.com/Daegu-Agent-Crew/creatorflow2-solana>
