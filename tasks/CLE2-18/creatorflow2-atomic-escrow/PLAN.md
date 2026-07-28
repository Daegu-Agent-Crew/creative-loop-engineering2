# PLAN — CreatorFlow2 원자적 결제 — 온체인 에스크로 컨트랙트 구현

## 실행 계획

### Phase 1: 컨트랙트 설계 및 Anchor 프로젝트 셋업
- **담당**: 대구루
- **입력**: CreatorFlow2 기존 결제 흐름 (solanaPayment.ts), USDC Token Program 스펙
- **출력**: Anchor 프로젝트 구조, IDL, 에스크로 명령어 설계서
- **예상 시간**: 1~2일

**세부 작업:**
1. Anchor CLI 설치 및 프로젝트 초기화 (`anchor init creatorflow-escrow`)
2. 에스크로 컨트랙트 명령어 설계
   - `initialize_escrow(sender, recipient, mint, amount, deadline)` — 에스크로 계정 생성, USDC 잠금
   - `execute_payment(signer, escrow, video_signature)` — 조건 검증 후 수신자에게 USDC 정산
   - `cancel_escrow(sender, escrow)` — 송신자가 취소, 잠긴 USDC 환불
   - `refund_expired(escrow)` — 데드라인 경과 시 자동 환불
3. 계정 구조 정의
   - EscrowAccount PDA: `sender`, `recipient`, `mint`, `amount`, `video_hash`, `status`, `deadline`
4. 로컬넷에서 컴파일 및 기본 동작 확인 (`anchor test`)

### Phase 2: devnet 배포 및 단위 테스트
- **담당**: 대구루
- **입력**: Phase 1 산출물 (컴파일된 Program)
- **출력**: devnet Program ID, 배포 스크립트, 단위 테스트 결과
- **예상 시간**: 1일

**세부 작업:**
1. devnet keypair 생성 및 SOL 에어드랍
2. `anchor deploy --provider.cluster devnet` 배포
3. Program ID 기록
4. TypeScript 단위 테스트 작성
   - 정상: 에스크로 생성 → 조건 충족 → 정산 완료
   - 실패: 조건 불충족 시 정산 거부
   - 취소: 송신자 환불
   - 만료: 데드라인 경과 후 환불
5. Solscan devnet에서 트랜잭션 확인

### Phase 3: CreatorFlow2 프론트엔드 연동
- **담당**: 대구루
- **입력**: Phase 2 Program ID, IDL, creatorflow2-solana 소스
- **출력**: 컨트랙트 연동 프론트엔드, 통합 결제 흐름
- **예상 시간**: 1~2일

**세부 작업:**
1. `creatorflow2-solana` 리포에 Anchor client 통합
2. 기존 `solanaPayment.ts`의 `sendDevnetUsdcPayment`를 에스크로 컨트랙트 호출로 교체
3. 결제 흐름 변경:
   - 기존: approve → transfer → memo (3 tx)
   - 신규: initialize_escrow → execute_payment (1~2 tx, 원자적)
4. 프론트엔드 UI 업데이트 (에스크로 상태 표시, 정산/환불 버튼)
5. `source.json` 업데이트 및 Pages 배포

### Phase 4: 통합 테스트 및 문서화
- **담당**: 대구루
- **입력**: Phase 3 통합 결과
- **출력**: E2E 테스트 결과, Solscan 검증 캡처, README 업데이트
- **예상 시간**: 1일

**세부 작업:**
1. End-to-End 시나리오 테스트
   - 브랜드 지갑 → 에스크로 잠금 → 크리에이터 정산 전체 흐름
   - 중간 실패 시나리오 (잘못된 서명, 잔액 부족)
2. Solscan devnet 링크 캡처 및 기록
3. Program ID, IDL을 README에 문서화
4. ai-solana-agent Hub 페이지에 컨트랙트 정보 추가

## 의존성
- Solana CLI, Anchor CLI 로컬 설치 필요
- creatorflow2-solana 리소스 (api.ts, solanaPayment.ts)
- devnet SOL (에어드랍 또는 기존 보유)
- 기존 CreatorFlow2 Cloudflare Worker API

## 도구 및 접근
| 도구/데이터 | 목적 | 접근 상태 | 대안 |
|---|---|---|---|
| Anchor CLI | Solana Program 개발 프레임워크 | missing — 설치 필요 | Native @solana/web3.js (복잡도 증가) |
| Solana CLI | devnet 배포 및 관리 | missing — 설치 필요 | Solana Playground (브라우저) |
| creatorflow2-solana 리포 | 프론트엔드 연동 대상 | available | — |
| GitHub Actions CI | 자동 배포 파이프라인 | available | 수동 배포 |
| Phantom 지갑 | 트랜잭션 서ign | available | Solflare |

## 사람 승인 게이트
| 게이트 | 승인 대상 | 승인자 | 기준 |
|---|---|---|---|
| Phase 1 → 2 | 에스크로 설계 확정 | 회장님 | 명령어 구조 및 계정 모델 검토 |
| Phase 2 → 3 | devnet 배포 결과 | 회장님 | Program ID 정상 배포, 단위 테스트 통과 |
| Phase 3 → 4 | 프론트엔드 연동 | 회장님 | 결제 흐름 정상 동작 확인 |

## 리스크
- **Anchor 학습 곡선**: Anchor/Rust 처음 사용 시 시간 지연 가능 → Solana Playground로 프로토타입 먼저
- **devnet 불안정**: devnet RPC 지연/실패 → 재시도 로직 및 대보넷 fallback
- **계정 크기 계산 오류**: Anchor 계정 rent 계산 실수 → `anchor test` 로컬넷에서 사전 검증
- **기존 결제 흐름 호환성**: CreatorFlow2 기존 API와 충돌 → feature flag로 구/신 결제 전환 가능하도록 설계
