# PLAN — CreatorFlow2

## 실행 계획

### Phase 1: Goal·UX·정책 계약
- **담당**: Codex + sfex11
- **입력**: CLE2-16 운영 결과, 제품 대화, 경쟁 서비스 조사, 선택한 파이프라인 시안
- **출력**: CLE2-17 문서, UI 워크플로우, 상태·권한·지급 정책
- **상태**: 진행 중

### Phase 2: 데이터 모델과 시스템 정책
- **담당**: Codex
- **입력**: Phase 1 산출물
- **출력**: creator offer, submission, verification, payment authorization, wallet delegation 모델과 Worker/D1 API
- **완료 조건**: 역할 경계, 상태 전이, 중복·한도 검사가 자동 테스트를 통과한다.

### Phase 3: 심플한 파이프라인 UI
- **담당**: Codex
- **입력**: 선택한 UI 시안과 API 계약
- **출력**: 여러 크리에이터 파이프라인, 카드 상세, 사람 크리에이터 수락·제출 화면
- **완료 조건**: 데스크톱·모바일에서 다음 행동이 하나만 강조되고 기술 정보는 상세에 숨는다.

### Phase 4: 브랜드 AI 판단과 Wallet 위임
- **담당**: Codex + OpenClaw Brand AI
- **입력**: 캠페인 예산, 크리에이터 데이터, 브랜드 지갑 allowance
- **출력**: 개별 금액 제안, 콘텐츠 판단, AI 결제 서명, revoke·키 교체 흐름
- **완료 조건**: AI가 허용 금액만 서명하고 초과·오수신·재지급은 시스템이 거부한다.

### Phase 5: YouTube·Solana E2E와 배포
- **담당**: Codex
- **입력**: 실제 공개 영상, Devnet USDC, 완성 UI/API
- **출력**: 검증 → AI 서명 → USDC 지급 → Explorer·감사 로그, Pages 배포와 3분 데모
- **완료 조건**: 공개 서비스에서 여러 크리에이터 중 한 건의 전체 흐름과 실패 경로가 재현된다.

## 의존성

- CLE2-16 CreatorFlow 운영 코드와 데이터
- OpenClaw Gemini Agent의 Solana signing 도구와 secret 저장소
- 브랜드 Phantom 지갑의 최초 approve/revoke 서명
- YouTube Data API 또는 신뢰 가능한 공개 영상 검증 방식

## 사람 승인 게이트

| 게이트 | 승인 대상 | 승인자 | 기준 |
|---|---|---|---|
| G1 | AI 지갑 delegate | 브랜드 지갑 소유자 | AI 공개키, 정확한 캠페인 allowance와 Devnet 확인 |
| G2 | 지급 정책 | sfex11 | 개별 금액식, 캠페인·일일 상한 확정 |
| G3 | 공개 배포 | sfex11 | 테스트, Devnet 증빙, 비밀정보 비노출 확인 |

## 리스크

- AI 키 분실: 브랜드 지갑이 revoke하고 새 AI 공개키에 새 allowance를 부여한다.
- AI 키 탈취: 캠페인별 정확한 소액만 위임하고 지급 직후 revoke한다.
- AI 판단 오류: 시스템이 객관 조건과 hard cap을 검증하며 판단 근거를 저장한다.
- 중복 지급: campaign·creator·milestone unique key와 온체인 memo/idempotency를 사용한다.
- UI 복잡성: 카드에는 이름·채널·금액·현재 할 일만 표시한다.

