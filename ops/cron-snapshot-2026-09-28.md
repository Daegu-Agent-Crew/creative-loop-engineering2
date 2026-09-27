# 크론 스냅샷 — 2026-09-28 (dg1 게이트웨이)

> dg1(대구루) 게이트웨이 크론 10건. ID는 앞 8자리. 기준 시간대 Asia/Seoul(KST).

| ID | 이름 | 주기 | enabled |
|---|---|---|---|
| `154ce872` | dg1-cle2-29-daily-census | 매일 04:30 KST (cron) | ✅ |
| `1a18806c` | dg1-dashboard-github-activity | 3h | ✅ |
| `1bf1204f` | dg1-openclaw-health-watchdog | 2h | ✅ |
| `22482e51` | dg1-approval-queue-scan | 6h | ✅ |
| `30c9b07f` | dg1-agents-board-feed-scan | 6h | ⛔ disabled — CLE2-27 동결(~10/3) |
| `12c88a96` | dg1-paper-funding-harvest-tick | 01:07 / 09:07 / 17:07 KST | ✅ |
| `aa3f0aba` | dg1-cle2-29-midcheck-d3 | 1회 — 2026-09-29 | ✅ (idle 대기) |
| `cd42f290` | dg1-cle2-29-midcheck-d5 | 1회 — 2026-10-01 | ✅ (idle 대기) |
| `2bf548eb` | dg1-cle2-29-final-verdict-d7 | 1회 — 2026-10-03 | ✅ (idle 대기) |
| `66e65025` | dg1-역공학-설문-월간점검 | 매월 1일 | ✅ |

참고: 위 10건 외에 1회성 리마인더 크론 2건(`dg1-폴백관측-도입알림` 10/2, `dg1-cle2-27-해제및-후속작업` 10/3)이 대기 중이며, 오래된 비활성 크론(역공학 주간 점검 등)은 제외했다.

---
**dg2 소유 크론은 대구루2가 별도 커밋한다.**

attribution: 🤖 agent:daeguru

Co-authored-by: 대구루 <daeguru@daegu-agent-crew.github.io>
