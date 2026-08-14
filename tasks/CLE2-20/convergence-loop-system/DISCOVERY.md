# DISCOVERY — CLE3 수렴 루프 시스템 도입

## 실제 자산 기준선 (2026-08-14 — creative-loop-engineering3 리포 기준)

> ⚠️ 정정: 1차 조사에서 잘못된 리포(three-body-comic)를 참조함. 아래는 정확한 CLE3 리포(creative-loop-engineering3) 기준.

### creative-loop-engineering3 repo `origin/main`

| 항목 | EP001 | EP002 | 비고 |
|------|-------|-------|------|
| 패널 이미지 (`panels/assets/`) | 49개(중복 포함) → 48개 (`p8-1` 누락) | 30개 | `panels.json` 기준 49/57패널 |
| `generation_status` | 48 generated, 1 missing (`p8-1`) | 30 generated | |
| 최종 오버레이 (`panels/final/`) | 17개 (SVG) | 0개 | |
| `panels.json` 총 패널 수 | 49 | 57 | `storyboard.json` 기반 |
| `generation-jobs.json` | 16개 잡 | 있음 | 페이지 단위 큐 |

### EP001 상세
- `panels/assets/`: 패널별 PNG 파일 (48개, `p8-1`만 누락)
- `panels/generated/`: 9개 (page 10-12 영역, 신규 생성분)
- `panels/final/`: 17개 SVG (대사 오버레이 완료된 최종본)
- `state.json`: phase4 active, "17/49 패널 생성. Act 3(pages 10-16) 0%"
  - 실제로는 48/49가 이미지로 존재하지만, state.json의 17/49은 **최종 승인된 패널 기준**으로 추정
- `panels/panels.json`: 49패널의 메타데이터 (panel_id, generation_status, characters_in_frame, reference_assets 등)

### EP002 상세
- `panels/assets/`: 30개 PNG
- `state.json`: phase4 active, "30/57 패널 생성"
- `panels/final/`: 없음
- `generation-jobs.json`: 있음

### 핵심 스크립트/문서 존재 여부 (전부 존재 ✅)

| 파일 | 위치 | 상태 |
|------|------|------|
| `scripts/run-panel-jobs.js` | CLE3 루트 | ✅ 172라인, planner+validator |
| `evaluation-rubric.md` | CLE3 루트 | ✅ 닥터슬럼프풍 v2, 50점 만점 |
| `docs/IMAGE-WORKFLOW.md` | CLE3 docs | ✅ 4단계 (A화풍→B캐릭터→C슬롯→D큐→E생성→F후처리) |
| `docs/AI-COLLABORATION-PROTOCOL.md` | CLE3 docs | ✅ 운영 루프 6원칙 |
| `state.json` | CLE3 루트 | ✅ EP001/EP002 상태 추적 중 |
| `scripts/build-panel-jobs.js` | CLE3 scripts | ✅ |
| `scripts/check-panel-assets.js` | CLE3 scripts | ✅ |
| `scripts/render-panel-overlays.js` | CLE3 scripts | ✅ |

### run-panel-jobs.js 실제 기능
- planner+validator 역할: 작업 선택, 입력 검증, codex exec 명령 출력
- `--episode`, `--maxJobs`, `--dry-run`, `--write-plan` 옵션 지원
- `--variants` 옵션 **미지원** (수렴 루프용 확장 필요)
- 이미지 생성 자체는 수행하지 않음 — Codex imagegen 명령을 출력만 함
- `references_used`는 기록하지만 생성 명령에 참조 이미지를 실제 첨부하지 않음

### GPT Image 2 기능
- **이미지 입력(Img2Img) 및 편집 지원** ✅
- 레퍼런스 이미지 기반 스타일 전달 가능
- 공식 문서: <https://developers.openai.com/api/docs/models/gpt-image-2>

## Unknown Map

### 알고 있는 것
- EP001: 48/49 패널 이미지 존재 (`p8-1`만 missing)
- EP002: 30/57 패널 이미지 존재
- state.json의 "17/49"은 최종 승인/오버레이 기준 (이미지 생성 자체는 거의 완료)
- run-panel-jobs.js는 planner이고 실제 생성은 codex exec로 수행
- GPT Image 2는 이미지 입력 지원 → 레퍼런스 체인 구현 가능

### 모르는 것 (검증 필요)
- **state.json의 "17/49"과 실제 48개 이미지의 차이가 정확히 무엇인가** — 최종 승인? 오버레이? QA 통과?
- **`panels/generated/`의 9개가 `panels/assets/`와 중복되는가, 아니면 후보인가**
- **evaluation-rubric.md의 현재 평가가 자동화되어 있는가, 수동인가**

## 사람 결정 필요 항목

| # | 결정 사항 | 이유 | 상태 |
|---|----------|------|------|
| 1 | `p8-1` 누락 원인 및 재생성 여부 | 유일한 missing 패널 | 즉시 가능 |
| 2 | state.json 진행률 기준 재정의 | 17/49 vs 48/49의 의미 차이 | 확인 필요 |

## 레퍼런스
- [이슈 #54 — CLE2-20 원본 요구사항](https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/issues/54)
- [sfex11 코멘트 — 실체 대조 검토 및 재기준화 제안](https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/issues/54#issuecomment-3083457760)
- [CLE3 리포 (creative-loop-engineering3)](https://github.com/Daegu-Agent-Crew/creative-loop-engineering3)
- [GPT Image 2 모델 문서](https://developers.openai.com/api/docs/models/gpt-image-2)
