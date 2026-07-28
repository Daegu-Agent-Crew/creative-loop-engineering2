# GOAL — CreatorFlow2 원자적 결제 — 온체인 에스크로 컨트랙트 구현

## 목표
Solana 스마트 컨트랙트(Program)를 배포하여 CreatorFlow2의 영상 등록 → 에이전트 협상 → USDC 결제 흐름을 하나의 원자적 트랜잭션으로 실행한다.

## 가치 가설
- 사용자 가치: 크리에이터와 브랜드 간 결제 무결성이 온체인에서 보장되어 중간 실패 시 자금이 안전하게 보존됨
- 기본 목표: 온체인 에스크로 컨트랙트를 devnet에 배포하고, CreatorFlow2에서 결제를 원자적으로 처리
- 도전 목표: 다중 크리에이터 분할 정산, 조건부 결제 확장이 가능한 범용 에스크로 설계

## 성공 기준 (Definition of Done)
- [ ] Solana Program(Anchor 프레임워크)로 에스크로 컨트랙트 작성 완료
- [ ] devnet에 프로그램 배포 및 Program ID 확보
- [ ] 영상 서명 검증 + USDC 정산을 단일 트랜잭션으로 실행
- [ ] CreatorFlow2 프론트엔드에 컨트랙트 호출 통합
- [ ] Solscan에서 트랜잭션 확인 가능
- [ ] 중간 실패 시 롤백(자금 보존) 검증 테스트 통과

## 범위
### 포함 (In Scope)
- Anchor 기반 에스크로 Program 설계 및 구현
- devnet 배포 및 테스트
- CreatorFlow2 (creatorflow2-solana) 프론트엔드 연동
- 기존 Token Program/Memo 조합 방식에서 마이그레이션

### 제외 (Out of Scope)
- mainnet 배포 (해커톤 이후 검토)
- 다중 크리에이터 분할 정산 (후속 과제)
- 크로스체인 지원

## 관련 이슈
- GitHub Issue: #48
- CLE2-ID: 18

## 담당자
- 대구루 (AI 에이전트)
