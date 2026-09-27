# OWNERS — 소유권·운영 규칙 (DRAFT)

> **⚠️ 회장님 승인 전 초안 (draft)입니다.** 승인 전까지 아래 할당은 합의된 것이 아니며, 각 주체는 현행 운영 관행을 따른다.

## 리포·영역 소유자

| 대상 | 소유자 | 범위·조건 |
|---|---|---|
| `ai-solana-agent` → `dapp4`, `dapp4-pipeline` | **dg1 (대구루)** | 전체. 단 `verdict-v2.py`는 **10/3까지 동결** — 소유자는 dg1이지만 기간 내 수정 금지 (FROZEN.sha256 CI 보호) |
| `creative-loop-engineering2` 허브 | **dg2 (대구루2)** | ROADMAP·OPERATING·승인 큐. 단 `tasks/CLE2-29/*` → **dg1** |
| team-memory `context/agents-board` | **dg1** | 크론 `dg1-agents-board-feed-scan`으로 운영. 현재 CLE2-27 동결로 **10/3까지 비활성** |

## 크론 규칙
- 이름 접두사: `dg1-` / `dg2-` — **각자 자기 접두사 크론만 수정·삭제**한다.
- 크론 목록 스냅샷을 `ops/` 디렉터리에 주기 커밋한다. (예: [ops/cron-snapshot-2026-09-28.md](ops/cron-snapshot-2026-09-28.md))

## Git 규칙
- 브랜치 접두사: `dg1-` / `dg2-`.
- 푸시 전 `git pull --rebase`.
- **main force push 금지** — org ruleset 강제 제안. ※ org 관리자 권한이 필요해 **회장님 건의 사항**으로 남긴다.

## RPC 일일 할당 (정적, 합계 400)
| 소비자 | 할당 |
|---|---|
| dg1 | 250 |
| dg2 | 100 |
| Actions 폴백 | 50 |

- 소비자별 append-only 로그: `~/.rpc/<KST날짜>.<소비자>.log`

---
attribution: 🤖 agent:daeguru

Co-authored-by: 대구루 <daeguru@daegu-agent-crew.github.io>
