# TESTS — CreatorFlow2 원자적 결제 — 온체인 에스크로 컨트랙트 구현

## 검증 기준

### 기능 테스트
| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|------------|------|-----------|------|
| 1 | 에스크로 생성 — 정상 | `initialize_escrow` 호출, USDC 잠금 | EscrowAccount PDA 생성, 잔액 차감 확인 | ⬜ |
| 2 | 에스크로 정산 — 조건 충족 | 올바른 video_signature로 `execute_payment` | 수신자 ATA에 USDC 입금, EscrowAccount closed | ⬜ |
| 3 | 에스크로 정산 — 조건 불충족 | 잘못된 video_signature로 `execute_payment` | 트랜잭션 revert, 자금 유지 | ⬜ |
| 4 | 에스크로 취소 — 송신자 | `cancel_escrow` 호출 | 송신자에게 USDC 환불, EscrowAccount closed | ⬜ |
| 5 | 에스크로 만료 환불 | 데드라인 경과 후 `refund_expired` | 송신자에게 USDC 환불 | ⬜ |
| 6 | 권한 없는 정산 시도 | 제3자가 `execute_payment` 호출 | 트랜잭션 거부 (unauthorized) | ⬜ |
| 7 | 권한 없는 취소 시도 | 제3자가 `cancel_escrow` 호출 | 트랜잭션 거부 (unauthorized) | ⬜ |
| 8 | 이중 정산 방지 | 이미 정산된 에스크로에 재호출 | 트랜잭션 거부 (already settled) | ⬜ |
| 9 | 잔액 부족 에스크로 | 잔액 < 요청 금액 | `initialize_escrow` 실패 (insufficient funds) | ⬜ |

### 통합 테스트 (CreatorFlow2)
| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|------------|------|-----------|------|
| 10 | E2E 결제 흐름 | 브랜드 로그인 → 영상 서명 → 에스크로 결제 | 전체 흐름 1 tx로 완료, 영수증 표시 | ⬜ |
| 11 | E2E 결제 실패 | 잘못된 서명으로 결제 시도 | 결제 거부, 에러 메시지 표시, 자금 보존 | ⬜ |
| 12 | Phantom 서명 | Phantom 지갑으로 트랜잭션 서명 | 정상 서명 및 브로드캐스트 | ⬜ |
| 13 | 기존 결제 호환 | 구 방식(Token transfer)과 신 방식(에스크로) 공존 | 두 방식 모두 정상 동작 | ⬜ |

### 비기능 테스트
| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|------------|------|-----------|------|
| 14 | Program 배포 크기 | `solana program show` | 계정 rent 부담 가능 수준 (< 1 SOL) | ⬜ |
| 15 | 트랜잭션 확정 시간 | Solscan에서 확인 | 400ms~2초 내 확정 | ⬜ |
| 16 | Solscan 가시성 | Program ID로 Solscan 검색 | 트랜잭션 내역 정상 표시 | ⬜ |
| 17 | devnet 안정성 | 10회 연속 테스트 | 실패율 0% (RPC 오류 제외) | ⬜ |

### 자동화 테스트
```bash
# Anchor 단위 테스트 (로컬넷)
cd programs/creatorflow-escrow
anchor test

# devnet 통합 테스트
anchor test --provider.cluster devnet

# 프론트엔드 E2E (CreatorFlow2)
cd creatorflow2-solana
npm run test:integration
```

## 검증 결과
- **검증 일자**: 미정
- **검증자**: 대구루
- **결과**: 대기
- **근거 링크**: (테스트 완료 후 추가)

## 인계 확인 (Quiz Me)
- 에스크로 컨트랙트의 정산 조건은 무엇인가? → video_signature 검증 통과 시
- 에스크로 실패 시 자금은 어떻게 보존되는가? → 트랜잭션이 revert 되어 잠긴 USDC가 에스크로 계정에 그대로 남음
- Program ID는 어디서 확인 가능한가? → README 및 Solscan devnet

## 비고
- 모든 테스트는 devnet 기준, mainnet 배포 전 별도 보안 감사 필요
- video_signature 검증 로직은 Phase 1 설계에서 구체화 예정
