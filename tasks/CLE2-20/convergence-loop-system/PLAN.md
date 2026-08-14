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
  - [ ] CLE2 Pages TASKS_DATA 등록
- **예상 시간**: 0.5일 (잔류 항목)

### Phase 1: 비교·선택 데이터 스키마 (P1)
- **담당**: 대구루
- **출력**: `schemas/candidates-schema.json`, `schemas/comparison-result-schema.json` (신규)
- **세부 작업**:
  - [ ] 후보 메타데이터 스키마 (panel_id, variant_id, prompt, params, seed, created_at)
  - [ ] 비교 결과 스키마 (candidates[], winner, reasoning, absolute_scores, verdict: better/worse/tie/both_bad)
  - [ ] 루프 이터레이션 로깅 스키마
- **예상 시간**: 0.5일

### Phase 2: A/B/C Evaluator + 절대 게이트 (P2)
- **담당**: 대구루
- **입력**: P1 스키마, 기존 `evaluation-rubric.md` (50점 만점, 40점 통과)
- **출력**: `evaluation-rubric.md` 개정, evaluator 로직
- **세부 작업**:
  - [ ] 기존 루브릭 분석 — 닥터슬럼프풍 50점 체계 파악
  - [ ] 비교 평가 축 정의: 캐릭터 일관성, 구도, 감정 연출, 화풍 일관성, 장면 연속성 (Phase 4)
  - [ ] 절대 품질 게이트 정의 (기존 40점 기준 유지)
  - [ ] A/B 비교 로직: better/worse/tie/both_bad 판정
  - [ ] Phase 5 분리: 대사·가독성 평가를 Phase 5로 이관
- **예상 시간**: 1.5일

### Phase 3: run-panel-jobs.js 확장 (P3)
- **담당**: 대구루
- **입력**: P1 스키마, P2 Evaluator, 기존 `scripts/run-panel-jobs.js` (172라인)
- **출력**: 개편된 `run-panel-jobs.js`, `IMAGE-WORKFLOW.md` 개정
- **세부 작업**:
  - [ ] `--variants N` 옵션 추가 (패널당 N개 변형 생성)
  - [ ] GPT Image 2 이미지 입력으로 레퍼런스 전달 (기존 `references_used` → 실제 첨부로 승격)
  - [ ] 후보 파일 저장 (`tmp/candidates/` 또는 `panels/generated/` 확장)
  - [ ] Evaluator 호출 → 결과 수집
  - [ ] 선택본 승격: 후보 → `panels/assets/`
  - [ ] IMAGE-WORKFLOW.md 개정 — 마이크로 루프 D→E→F→G 사이클 추가
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
  - [ ] 대표 패널 3개 선정 (단인물, 다인물, 풀페이지/고난도)
  - [ ] 후보 2× 최대 2회 end-to-end 실행
  - [ ] 회장님 블라인드 선호 평가
  - [ ] 일치율 및 품질 개선 정도 측정
- **예상 시간**: 1일

### Phase 6: `p8-1` 생성 + EP001 확대 적용 (P6)
- **담당**: 대구루
- **세부 작업**:
  - [ ] `p8-1` 재생성 (유일한 missing)
  - [ ] EP001 오버레이 완료율 향상 (현재 17/49)
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
