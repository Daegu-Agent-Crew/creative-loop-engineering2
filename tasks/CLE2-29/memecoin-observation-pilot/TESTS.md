# TESTS — 밈코인 관측 파일럿 (CLE2-29)

> **판정 검증 기준은 [PRE-REGISTRATION.md @ 05cb20f](https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/blob/05cb20f8540c4e29bffc75be84c3c7b8f42ef237/tasks/CLE2-29/memecoin-observation-pilot/PRE-REGISTRATION.md)에 있다.** 이 문서는 운영 검증 항목만 둔다. 판정 규칙을 여기에 다시 쓰지 않는다.
>
> 검증 등급: L1 정적·모형 / L2 실브라우저 자동 검사 / L3 스크린샷 첨부. L2 미만은 "오류 없음"이 아니라 "미검증(L1)"으로 적는다.

## 운영 검증
| # | 항목 | 방법 | 결과 | 등급 | 통과 |
|---|------|------|------|------|------|
| 1 | 수집기 쓰기 메서드 차단 | `census-collector.py` 금지 RPC 목록(sendTransaction·sign·airdrop·transfer 등) 코드 확인 | 금지 목록 존재 — 허용 목록 방식 아님, 읽기 전용 보장은 아님 (2026-09-28) | L1 | ✅ |
| 2 | 스모크 테스트 | dry-run + 실측 8코인 | PASS, 서명/발송 0건 (2026-09-26) | L1 | ✅ |
| 3 | 판정 파일 변경 감지 | `FROZEN.sha256` + `freeze-guard.yml` CI (ai-solana-agent PR #11 머지) | 도입 — 같은 계정은 해시와 CI를 함께 고쳐 우회 가능 (C2 전 한계) | L1 | ✅ |
| 4 | 관측 누락 경보 | `deadman-observation.yml` (ai-solana-agent) | 도입, 테스트 마커로 경로 확인 (2026-09-28) | L1 | ✅ |
| 5 | 대시보드 수치 = 데이터 JSON | `census-smoke.yml` (census/·easy/) | 도입 — 실패 사례 재현 확인 전 | L1 | ⬜ |
| 6 | 최종 판정 절차 | PRE-REG 규칙대로 판정(유보·판정 불가 포함), 초안 → 회장님 확인 후 공개 | 2026-10-03 예정 | — | ⬜ |

## 검증 결과
- **검증 일자**: 2026-09-28 (중간)
- **검증자**: 대구루 (agent:daeguru)
- **결과**: 부분 통과 (6항 중 4항)
- **근거 링크**: ai-solana-agent PR #11, #12
