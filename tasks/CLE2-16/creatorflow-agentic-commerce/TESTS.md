# TESTS — CreatorFlow Agentic Creator Commerce

## 기능 테스트

| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|---|---|---|---|
| 1 | Brand Agent 등록 | 초대 + Wallet challenge E2E | 유효한 초대와 서명만 Brand 역할 획득 | ⬜ |
| 2 | Creator Agent 등록 | 공개 등록 + Wallet challenge E2E | 서명 Wallet이 payout Wallet로 등록 | ⬜ |
| 3 | Agent 사칭 차단 | 다른 Wallet로 challenge 재사용 | 401/409로 거절 | ⬜ |
| 4 | 협상 | 제안→반대 제안→수락 | 합의 조건과 Agent 실행 기록 저장 | ✅ |
| 5 | 영상 제출 | unlisted URL 등록 | 등록 채널과 video channel이 일치 | ⬜ |
| 6 | 공개 상태 확인 | `videos.list` 실행 | public 전환 후 잔금 조건 충족 | ⬜ |
| 7 | KPI 확인 | statistics 조회 | 기준 조회수 이상일 때 보너스 조건 충족 | ⬜ |
| 8 | 감사 로그 | 캠페인 생성→제안→수락 조회 | Agent, 조건, 상태 전이가 시간순으로 연결 | ✅ |

## Solana 지급 테스트

| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|---|---|---|---|
| 1 | Treasury 자산 | Devnet RPC | 공식 USDC 20, 약 4.956 SOL 확인 | ✅ |
| 2 | delegate approve | Token Account 조회 | Brand Agent와 0.10 allowance 확인 | ⬜ |
| 3 | 선금 | accepted 이벤트 | Creator Wallet에 0.02 USDC 1회 지급 | ⬜ |
| 4 | 잔금 | public 이벤트 | Creator Wallet에 0.03 USDC 1회 지급 | ⬜ |
| 5 | 보너스 | KPI 이벤트 | Creator Wallet에 0.01 USDC 1회 지급 | ⬜ |
| 6 | 중복 지급 차단 | 같은 milestone 재실행 | 새 tx가 생성되지 않고 기존 결과 반환 | ⬜ |
| 7 | 화이트리스트 | 다른 Wallet 지급 시도 | 정책 오류로 거절 | ⬜ |
| 8 | allowance 초과 | 0.10 초과 시도 | 클라이언트와 온체인에서 실패 | ⬜ |
| 9 | revoke | owner revoke 후 지급 시도 | delegate 제거, 이후 지급 실패 | ⬜ |

## 보안 테스트

| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|---|---|---|---|
| 1 | 비밀값 스캔 | 저장소 패턴 검사 | private key, OAuth secret, API key 없음 | ⬜ |
| 2 | challenge 만료 | 만료 timestamp 서명 | 401 거절 | ⬜ |
| 3 | nonce 재사용 | 동일 nonce 두 번 제출 | 두 번째 요청 409 | ⬜ |
| 4 | 역할 권한 | Creator가 Brand endpoint 호출 | 403 거절 | ⬜ |
| 5 | CORS | 허용되지 않은 origin | 쓰기 요청 거절 | ⬜ |
| 6 | idempotency 경합 | 병렬 milestone 호출 | DB unique constraint로 한 건만 성공 | ⬜ |

## 배포·데모 테스트

| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|---|---|---|---|
| 1 | 새 저장소 CI | lint/typecheck/test/build | 현재 구현 범위 lint/build 통과 | ✅ |
| 2 | cross-repo 배포 | PR + Pages Actions 실행 | 기존 Hub의 `creatorflow/` 갱신 | ✅ |
| 3 | 모바일/데스크톱 | 375/768/1280 화면 | 주요 흐름 사용 가능 | ⬜ |
| 4 | 공개 Worker | health/campaign API smoke test | 2xx와 올바른 CORS | ✅ |
| 5 | 3분 데모 | 리허설 3회 | 각 회차 180초 이내, 지급 3건 확인 | ⬜ |
| 6 | 제출물 | 체크리스트 검토 | 소개서, GitHub, 영상, endpoint, tx 링크 완비 | ⬜ |

## 자동화 테스트 예정 명령

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## 검증 결과

- 검증 일자: 2026-07-20
- 검증자: Codex
- 결과: Phase 3 구현 통과. Agent 등록·세션·협상·감사 API, 중복 수락 차단, 공개 Worker/Pages 검증 완료. OpenClaw 두 실지갑 서명 E2E는 Phase 6 검증으로 남음
- 근거: Issue #42, Solana Devnet RPC, `creatorflow-solana` PR #3와 CI run #29748767826, `ai-solana-agent` PR #4와 Pages run #29749046279, Worker version `5e92a274-ae50-4187-be71-e251f069fb98`

## 인계 확인

- Treasury Owner는 Agent에게 얼마까지 허용하며 언제 권한을 없앨 수 있는가?
- Agent 이름이 아니라 무엇이 Agent 신원을 증명하는가?
- 같은 milestone 지급 요청이 두 번 와도 한 번만 지급되는 근거는 무엇인가?
