# DISCOVERY — CLE3 수렴 루프 시스템 도입

## 실제 자산 기준선 (2026-08-14 API 조회)

### three-body-comic repo `origin/main`

| 항목 | EP001 | EP002 | 비고 |
|------|-------|-------|------|
| 패널 이미지 파일 | 16개 | 0개 (`episodes/EP002/panels/` = `.gitkeep`만) | EP002는 `cle5-ep002/images/`에 10개 실험 이미지 |
| docs/ 미러 | 16개 | 0개 | `docs/episodes/EP001/panels/` 동일 16개 |
| 오버레이/최종본 | 0개 | 0개 | `docs/episodes/*/pages/` = `.gitkeep`만 |
| panels.json | 존재 안 함 | 존재 안 함 | |
| state.json | 존재 안 함 | 존재 안 함 | |
| gates.json | 존재 안 함 | 존재 안 함 | |

### EP001 생성된 패널 (16/49)
p01, p05, p06, p10, p13, p18, p19, p23, p25, p30, p37, p39, p50, p62, p65, p67

### EP002 실험 이미지 (10개, `cle5-ep002/images/`)
p1-3, p2-3, p4-2, p4-3, p6-1, p9-3, p11-1, p12-1, p15-3, p16-1
(이미지가 `episodes/EP002/panels/`가 아닌 `cle5-ep002/images/`에 있음 — 경로 정규화 필요)

### 핵심 스크립트/문서 존재 여부

| 파일 | 존재 | 비고 |
|------|------|------|
| `scripts/run-panel-jobs.js` | ❌ | PLAN이 "전면 개편" 대상으로 지정했으나 원본이 없음 |
| `evaluation-rubric.md` | ❌ | GOAL이 "전면 개정" 대상으로 지정했으나 원본이 없음 |
| `IMAGE-WORKFLOW.md` | ❌ | 동일 |
| `AI-COLLABORATION-PROTOCOL.md` | ❌ | 동일 |
| `scripts/sync_episode_assets.sh` | ✅ | EP001 패널을 docs/로 미러링 |
| `docs/IMAGE-GENERATION-GUIDE.md` | ✅ | gpt-image-2 + codex exec 방식, 캐릭터 프롬프트 블록 포함 |
| `styles/prompt-guide-v2.md` | ✅ | 화풍 프롬프트 가이드 |

## Unknown Map

### 알고 있는 것
- 이미지 생성은 `codex exec --full-auto` + OpenAI Images API (gpt-image-2)로 수행
- 출력 사이즈: 1024×1536 (세로)
- EP001 화풍: 수채화풍 (s1)
- 패널 번호 체계: `ep{NNN}-p{번호}-{slug}.png`
- `docs/IMAGE-GENERATION-GUIDE.md`에 캐릭터 프롬프트 블록이 정리되어 있음

### 모르는 것 (검증 필요)
- **gpt-image-2가 레퍼런스 이미지 입력을 지원하는가?** — 이미지 투 이미지(Img2Img) 또는 스타일 참조 기능 확인 필요
- **이전에 사용된 생성→평가 워크플로우의 실제 구체적 절차** — 문서화된 적이 없음, 구두/세션 기록에만 존재 추정
- **EP002 패널이 `cle5-ep002/images/`에만 있는 이유** — CLE5 파이프라인 실험의 잔류물로 보임
- **총 패널 수(49, 57)의 출처** — storyboard.md 또는 script.md에서 비롯된 것으로 추정되나 확인 필요

### 숨겨진 전제
- GOAL/PLAN은 `run-panel-jobs.js`가 "개편" 대상이라고 가정했지만, 실제로는 **새로 작성**해야 함
- 마찬가지로 `evaluation-rubric.md`, `IMAGE-WORKFLOW.md`도 신규 작성
- "오버레이 17개"라고 했으나 실제로는 0개 — 오버레이 워크플로우 자체가 문서화되지 않음

## 도구 및 접근성

| 도구 | 접근 | 비고 |
|------|------|------|
| three-body-comic repo | ✅ GitHub API | private, GITHUB_TOKEN으로 접근 |
| gpt-image-2 API | ✅ codex exec | OPENAI_API_KEY 환경변수 필요 |
| CLE2 Pages (app.js) | ✅ 편집 가능 | TASKS_DATA 하드코딩 + 동적 머지 |
| image_generate (OpenClaw 툴) | ✅ 사용 가능 | 그러나 IMAGE-GENERATION-GUIDE가 명시적으로 ❌로 지정 |

## 사람 결정 필요 항목

| # | 결정 사항 | 이유 | 권장 |
|---|----------|------|------|
| 1 | 총 패널 수 확정 (49? 그 이상?) | GOAL의 "49/49" 기준이 어디서 비롯됐는지 확인 필요 | storyboard.md에서 페이지/패널 분할 기준 확인 |
| 2 | EP002 패널 경로 정규화 | `cle5-ep002/images/` → `episodes/EP002/panels/` 이관 여부 | 정규화 권장 |
| 3 | 이미지 레퍼런스 주입 방식 | gpt-image-2의 img2img 지원 여부에 따라 접근이 달라짐 | API 스펙 확인 선행 |
| 4 | 오버레이(대사 합성) 워크플로우 | 현재 0개, 어떻게 만들었는지 기록 없음 | Phase 4와 Phase 5 분리 설계에 반영 |

## 레퍼런스

- [이슈 #54 — CLE2-20 원본 요구사항](https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/issues/54)
- [sfex11 코멘트 — 실체 대조 검토 및 재기준화 제안](https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/issues/54#issuecomment-...)
- [three-body-comic repo](https://github.com/Daegu-Agent-Crew/three-body-comic)
- IMAGE-GENERATION-GUIDE.md (three-body-comic/docs/)
- prompt-guide-v2.md (three-body-comic/styles/)
