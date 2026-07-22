# DISCOVERY — CreatorFlow2

## 작업 맥락

- 사용자/운영자: 브랜드 AI와 협업하는 YouTube 크리에이터
- 실제 문제: 기존 CreatorFlow의 두 Agent 등록·협상·사람 Phantom 지급 절차가 데모와 실제 사용 모두 복잡하다.
- 기대 가치: 브랜드 AI가 운영과 결제 판단에 참여하면서도 사람 크리에이터는 최소 행동만 수행한다.
- 관련 시스템/코드/데이터: CLE2-16, `creatorflow-solana`, `ai-solana-agent/creatorflow`, OpenClaw, Cloudflare Worker/D1, Solana Devnet

## Unknown Map

### Known Known

- 제품 역할은 브랜드 AI, 사람 크리에이터, 검증·집행 시스템으로 확정했다.
- 파이프라인은 `제안 → 수락 → 영상 제출 → 검증 → 지급`이다.
- 크리에이터별 지급 금액은 달라지며 브랜드 AI가 예산 범위 안에서 제안한다.
- 브랜드 사람 지갑은 USDC를 소유하고 AI 지갑에는 제한 금액만 delegate한다.
- UI는 여러 크리에이터 파이프라인 구조를 유지하되 단일 캠페인 화면처럼 심플하게 만든다.

### Known Unknown

- [ ] OpenClaw에서 AI 결제 키를 저장·회전하는 구체적인 secret adapter
- [ ] 크리에이터 점수와 제안 금액의 초기 계산식
- [ ] YouTube Data API/OAuth 자격 증명의 운영 준비 상태
- [ ] SPL delegate만 사용할지, 만료·수신자 제한을 위한 프로그램 escrow까지 구현할지

### Unknown Known

- [ ] CLE2-16 운영 데이터 중 CreatorFlow2로 안전하게 승계할 캠페인·크리에이터 기록
- [ ] OpenClaw의 기존 Wallet 도구가 지원하는 Solana raw transaction 서명 형태

### Unknown Unknown 후보

- [ ] AI 키 탈취 후 revoke 전 잔여 allowance 오용
- [ ] YouTube 지표 갱신 지연과 AI 판단 시점 불일치
- [ ] 여러 크리에이터 동시 지급의 RPC·D1 경쟁 조건

## 탐색 활동

- 13개 크리에이터 관리 서비스의 발굴·제안·콘텐츠·성과·지급 흐름 비교
- CreatorIQ, GRIN, Aspire, Modash, Upfluence, impact.com 등의 공통 패턴 검토
- Solana Token delegate 승인·제한 금액·revoke 공식 동작 확인
- CreatorFlow 운영 서비스와 Devnet USDC 자산·기존 영상 흐름 검증

## 도구 확인

| 도구/데이터 | 목적 | 상태 | 제한/대안 |
|---|---|---|---|
| OpenClaw + Gemini | 브랜드 판단과 결제 서명 | setup-needed | 계약 테스트용 로컬 signer |
| CreatorFlow Worker/D1 | 상태·정책·감사 로그 | available | 기존 CLE2-16 기반 확장 |
| YouTube Data API | 영상·채널·성과 검증 | setup-needed | 공개 데이터 검증 fallback |
| Solana Devnet | delegate·USDC 지급 증빙 | verified | 공식 Devnet mint만 허용 |
| GitHub Pages | 파이프라인·크리에이터 UI | available | 기존 creatorflow 경로 유지 |

## 실행 전 판단

- 계속 진행 가능한 가정: Devnet에서 캠페인별 정확한 소액 allowance를 부여하고 지급 후 revoke한다.
- 사람 결정 필요: 초기 지급액 계산식과 캠페인 총예산.
- 에스컬레이션 조건: 실제 가치 자산, Mainnet, allowance 확대, 새로운 외부 수신 주소.

## 도전 목표

- 기존 트레이드오프: 사람 Phantom 승인은 안전하지만 AI 결제 참여가 약하고 반복 작업이 많다.
- AI/자동화 가설: 브랜드 소유권은 유지하면서 한도 위임·AI 서명·시스템 검증을 결합하면 자율성과 안전성을 함께 보여줄 수 있다.
