# VISION — Daegu-Agent-Crew 최종 목표

> 확정: 2026-10-13 회장님 ("승인 and 확정", Discord #ai-news) · 초안 제안 2026-10-04
> 작성: 레노버(AI) · 근거: org 리포 README·[ROADMAP.md](ROADMAP.md)·[OPERATING.md](OPERATING.md) 조회

## 목표 문장

**Daegu-Agent-Crew는 AI 에이전트들이 기억을 공유하며 협업해, 사람들이 실제로 만족하는 결과물을 만들고, 그 반응으로 스스로 개선하는 조직이다. 사람은 방향과 거부권만 쥔다.**

목표 문장의 세 단어는 아래처럼 측정한다. 측정하지 않으면 "열심히"는 증명해도 "만족"은 증명하지 못한다.

| 단어 | 뜻 | 측정 신호 (최소 1개) |
|---|---|---|
| 협업 | 한 에이전트의 산출물을 다른 에이전트가 검증하거나 이어받는다 | 에이전트 간 인계·검증 건수 (team-memory agents-board, 이슈 교차 코멘트) |
| 만족 | 결과물이 사람에게 실제로 쓰인다 | Discord 반응·재요청·실사용 여부 (결과물별 기록) |
| 성장 | 같은 실패가 반복되지 않고, 사람 개입이 줄어든다 | 사람 개입 횟수, 동일 실패 재발 수, cron 소요 시간 추세 |

## 4개 축과 리포 배치

ROADMAP의 활성 리포를 목표 기준으로 다시 묶은 것이다. 리포 상태(활성·보류·완결)는 ROADMAP이 기준이다.

| 축 | 역할 | 리포 |
|---|---|---|
| 기억 | 세션을 넘어 맥락을 잇고, 승인된 것만 기억으로 승격 | team-memory, creative-loop-engineering5(-private) |
| 통제 | 사람이 방향과 거부권을 쥐는 장치 | creative-loop-engineering2 (OPERATING 승인 큐·approval-critical·자율 권한 목록) |
| 산출 | 사람에게 전달되는 실제 결과물 — 목표의 검증 현장 | ai-agent-news, creative-loop-engineering3·cle33(만화), ai-solana-agent |
| 확산 | 이 운영 방식을 커뮤니티 표준 키트로 공개 | agent_builder_public |

산출 축의 리포는 목표 자체가 아니라 **목표가 작동하는지 확인하는 시험장**이다. 결과물이 줄어도 "스스로 돌아가는 구조"가 늘었다면 전진으로 본다.

## 에이전트 역할

| 에이전트 | 주 담당 | 근거 |
|---|---|---|
| 대구루 (dg1) | ai-solana-agent dapp4, team-memory agents-board | [OWNERS.md](OWNERS.md) (초안) |
| 대구루2 (dg2) | CLE2 허브 — ROADMAP·OPERATING·승인 큐 | [OWNERS.md](OWNERS.md) (초안) |
| 레노버 | ai-agent-news 수집·위키·브리핑, CLE Issue Poller | 레노버 cron 운영 |
| 샤오미1·라이카 | _작성 필요 — 각 에이전트가 직접 보완_ | — |

## 첫 실행 (2026-10-13 착수)

- [x] ai-agent-news 위키 롤링 아카이브 — 위키 비대화로 갱신 작업이 timeout을 넘던 문제 대응 (성장 신호: wiki-update 소요 시간)
- [x] 뉴스 인포그래픽 생성을 별도 후속 단계로 분리, codex 하드 시간 상한 적용 (성장 신호: 이미지 첨부율)
- [ ] 결과물 반응 주간 집계 — 만족 신호의 첫 측정
- [ ] 샤오미1·라이카 역할 보완

판정 기준: 1주 뒤 wiki-update 10분 이하, 뉴스 이미지 첨부율 100%면 첫 실행 성공.
