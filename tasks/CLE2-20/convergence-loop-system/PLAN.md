# PLAN — CLE3 수렴 루프 시스템 도입

## 실행 계획 (재구조화 — sfex11 코멘트 + CLE3 실체 반영)

> 기존 파일들이 존재하므로 "신규 작성"이 아닌 "개편"이 기준. 단, 비교 스키마 등 신규 파일은 추가.

### Phase 0: 기준선 확정 및 문서 보완 (P0)
- **담당**: 대구루
- **세부 작업**:
  - [x] 실제 자산 대조 — CLE3 리포(creative-loop-engineering3) 기준
  - [x] DISCOVERY.md 정정 작성
  - [x] DECISIONS.md 정정 작성 (D-001~D-008)
  - [x] GOAL/STATUS 재기준화
  - [x] CLE2 Pages TASKS_DATA 등록
- **예상 시간**: 0.5일 (잔류 항목)

### Phase 1: 비교·선택 데이터 스키마 (P1)
- **담당**: 대구루
- **출력**: 후보와 비교 결과를 함께 관리하는 `schemas/candidates-schema.json` (신규)
- **세부 작업**:
  - [x] 후보 메타데이터 스키마 (panel_id, variant, prompt, output_path, reference_assets, created_at)
  - [x] 비교 결과 스키마 (winner, reason, absolute_scores, verdict: winner/tie/both_bad)
  - [x] 루프 이터레이션 로깅 스키마 + 예제 + 검증기
- **예상 시간**: 0.5일

### Phase 2: A/B/C Evaluator + 절대 게이트 (P2)
- **담당**: 대구루
- **입력**: P1 스키마, 기존 `evaluation-rubric.md` (50점 만점)
- **출력**: `evaluation-rubric.md` 개정, evaluator 로직
- **세부 작업**:
  - [x] 기존 루브릭 분석 — 50점 체계와 생성 정책 충돌 확인
  - [x] 비교 평가 축 정의: 캐릭터, 스토리보드, 구도, 화풍, 장면 연속성
  - [x] 절대 품질 게이트 정의 (35 미만 재생성, 35~41 검토, 42 이상 승인 가능)
  - [x] A/B/C 비교 판정: winner/tie/both_bad
  - [x] Phase 5 분리: 대사·가독성 평가를 Phase 5로 이관
- **예상 시간**: 1.5일

### Phase 3: run-panel-jobs.js 확장 (P3)
- **담당**: 대구루
- **입력**: P1 스키마, P2 Evaluator, 기존 `scripts/run-panel-jobs.js` (172라인)
- **출력**: 개편된 `run-panel-jobs.js`, `IMAGE-WORKFLOW.md` 개정
- **세부 작업**:
  - [x] `--variants N` 옵션 추가 (패널당 N개 변형 생성)
  - [x] GPT Image 2 이미지 입력으로 레퍼런스 전달 (`codex -i` 명령 생성)
  - [x] 후보 파일 저장 (`.candidates/{episode}/{panel}/iteration-NN/`)
  - [x] 블라인드 Evaluator 명령과 구조화 결과 경로 생성
  - [x] 2회차부터 이전 평가 `--diagnosis` 입력 강제
  - [ ] 선택본 승격: 후보 → `panels/assets/`
  - [x] IMAGE-WORKFLOW.md 개정 — 마이크로 루프와 실행 예시 추가
- **예상 시간**: 2일

### Phase 4: 선호 메모리 & 레퍼런스 체인 (P4)
- **담당**: 대구루
- **입력**: P3에서 승격된 패널
- **출력**: `schemas/preference-memory.json`, 레퍼런스 체인 로직
- **세부 작업**:
  - [ ] preference-memory.json 스키마 (캐릭터별/장면별/스타일 앵커)
  - [ ] 승인 패널에서 스타일 앵커 자동 등록
  - [ ] GPT Image 2 이미지 입력으로 레퍼런스 자동 주입 (D-008)
  - [ ] "Example > Description" 원칙 적용
- **예상 시간**: 1.5일

### Phase 5: 단일 패널 end-to-end 검증 (P5)
- **담당**: 대구루 + 회장님 (블라인드 선호 평가)
- **세부 작업**:
  - [x] 대표 패널 3개 선정 (`p2-3`, `p15-3`, `p6-1`)
  - [ ] 후보 2× 최대 2회 end-to-end 실행
  - [ ] 회장님 블라인드 선호 평가
  - [ ] 일치율 및 품질 개선 정도 측정
- **예상 시간**: 1일

### Phase 6: `p8-1` 생성 + EP001 확대 적용 (P6)
- **담당**: 대구루
- **세부 작업**:
  - [x] `p8-1` 재생성 (유일한 missing)
  - [x] `p8-1` 자막 후처리로 EP001 오버레이 17→18
  - [ ] 승인 패널 5~10개 단위 체크포인트
- **예상 시간**: 2~3일

### Phase 7: 목표 공동 진화 + 캘리브레이션 (P7, 중장기)
- **담당**: 대구루 + 회장님
- **세부 작업**:
  - [ ] preference-retrospective.json 스키마 설계
  - [ ] rollback 이력 → 구조적 학습 데이터 변환 (수채화→닥터슬럼프풍 등)
  - [ ] calibration-log.json — 사람 vs AI 평가 일치율 추적
- **예상 시간**: 3일

## 의존성
```
P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7(중장기)
```

## 리스크
- **변형 생성 비용**: 패널당 2~3후보 × 2~3회. P5에서 효과 검증 후 확대.
- **기존 워크플로우 호환성**: run-panel-jobs.js 개편 시 기존 기능이 깨지지 않도록 주의.
- **state.json 동기화**: 생성된 이미지(48/49)와 state.json(17/49)의 기준 차이를 명확히 해야 함.
