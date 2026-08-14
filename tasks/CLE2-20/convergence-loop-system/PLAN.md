# PLAN — CLE3 수렴 루프 시스템 도입

## 실행 계획 (재구조화 — sfex11 코멘트 반영)

> 원안 대비 변경: Evaluator를 루프보다 먼저 구현. "개편"이 아닌 "신규 작성"으로 명확화.

### Phase 0: 기준선 확정 및 문서 보완 (P0)
- **담당**: 대구루
- **세부 작업**:
  - [x] 실제 자산 대조 (EP001 16개, EP002 10개 비정규 경로)
  - [x] DISCOVERY.md 작성
  - [x] DECISIONS.md 작성
  - [x] GOAL/STATUS/TESTS 재기준화
  - [ ] CLE2 Pages TASKS_DATA 등록
  - [ ] 총 패널 수 확정 (storyboard.md 확인)
  - [ ] gpt-image-2 API img2img 지원 여부 확인
- **예상 시간**: 0.5일 (잔류 항목)

### Phase 1: 비교·선택 데이터 스키마 (P1)
- **담당**: 대구루
- **입력**: 없음 (신규 설계)
- **출력**: candidates.json, comparison-result.json JSON Schema
- **세부 작업**:
  - [ ] 후보 메타데이터 스키마 (panel_id, variant_id, prompt, params, seed, created_at)
  - [ ] 비교 결과 스키마 (candidates[], winner, reasoning, absolute_scores, verdict: better/worse/tie/both_bad)
  - [ ] 루프 이터레이션 로깅 스키마 (iteration, prompts_used, evaluator_result, action_taken)
- **예상 시간**: 0.5일

### Phase 2: A/B/C Evaluator + 절대 게이트 (P2)
- **담당**: 대구루
- **입력**: P1 스키마, 기존 `docs/IMAGE-GENERATION-GUIDE.md` 캐릭터 기준
- **출력**: evaluator 모듈, evaluation-rubric.md (신규)
- **세부 작업**:
  - [ ] 평가 축 정의: 캐릭터 일관성, 구도, 감정 연출, 화풍 일관성, 장면 연속성 (Phase 4)
  - [ ] 절대 품질 게이트 정의 (각 축 최소 기준)
  - [ ] A/B 비교 로직: 후보 쌍에 대해 better/worse/tie/both_bad 판정
  - [ ] 선택 이유 텍스트 생성 (다음 생성에 반영 가능한 형태)
  - [ ] evaluation-rubric.md 작성 — Phase 4(캐릭터·구도·감정·화풍) / Phase 5(대사·가독성) 분리
- **예상 시간**: 1.5일

### Phase 3: Panel Runner — 후보 생성 실행기 (P3)
- **담당**: 대구루
- **입력**: P1 스키마, P2 Evaluator
- **출력**: panel-runner.js (신규), IMAGE-WORKFLOW.md (신규)
- **세부 작업**:
  - [ ] Panel Runner 인터페이스 정의: `generate(panel_id, prompt, variants, references) → candidates[]`
  - [ ] 실제 imagegen 호출 (gpt-image-2 또는 codex exec 방식)
  - [ ] 참조 이미지 전달 로직 (P-1 결정에 따라 방식 확정)
  - [ ] 후보 파일 저장 (`tmp/candidates/{episode}/{panel}/`)
  - [ ] Evaluator 호출 → 결과 수집
  - [ ] 선택본 승격: `tmp/candidates/` → `episodes/*/panels/`
  - [ ] IMAGE-WORKFLOW.md 작성 — 마이크로 루프 D→E→F→G 사이클 문서화
- **예상 시간**: 2일

### Phase 4: 선호 메모리 & 레퍼런스 체인 (P4)
- **담당**: 대구루
- **입력**: P3에서 승격된 패널
- **출력**: preference-memory.json, 레퍼런스 체인 로직
- **세부 작업**:
  - [ ] preference-memory.json 스키마 (캐릭터별/장면별/스타일 앵커)
  - [ ] 승인 패널에서 스타일 앵커 자동 등록
  - [ ] 다음 패널 생성 시 레퍼런스 자동 주입 (Panel Runner와 연동)
  - [ ] "Example > Description" 원칙 — 텍스트 프롬프트 보강이 아닌 이미지 참조 우선
- **예상 시간**: 1.5일

### Phase 5: 단일 패널 end-to-end 검증 (P5)
- **담당**: 대구루 + 회장님 (블라인드 선호 평가)
- **입력**: P1~P4 완성, 대표 패널 3개
- **출력**: 검증 결과 보고서
- **세부 작업**:
  - [ ] 대표 패널 3개 선정 (단인물, 다인물, 풀페이지/고난도)
  - [ ] 각 패널에 대해 후보 2× 최대 2회 end-to-end 실행
  - [ ] 회장님 블라인드 선호 평가 (AI가 선택한 것과 비교)
  - [ ] 일치율 및 품질 개선 정도 측정
  - [ ] 통과 시 EP001 잔여 패널로 확대
- **예상 시간**: 1일

### Phase 6: EP001 확대 적용 (P6)
- **담당**: 대구루
- **세부 작업**:
  - [ ] EP001 잔여 패널 (49 - 16 = 33개)에 수렴 루프 적용
  - [ ] 승인 패널 5~10개 단위 체크포인트 + push
  - [ ] 패널당 평균 생성 횟수, 품질 추이 추적
- **예상 시간**: 3~5일 (패널 품질에 따라 변동)

### Phase 7: 목표 공동 진화 + 캘리브레이션 (P7, 중장기)
- **담당**: 대구루 + 회장님
- **세부 작업**:
  - [ ] preference-retrospective.json 스키마 설계
  - [ ] 에피소드 완료 후 선호 회고 자동 생성
  - [ ] rollback 이력 → 구조적 학습 데이터 변환
  - [ ] calibration-log.json — 사람 vs AI 평가 일치율 추적
  - [ ] 캘리브레이션 샘플링 프로세스 (에피소드당 5패널 무작위)
- **예상 시간**: 3일

## 의존성
```
P0 → P1 → P2 → P3 → P4 → P5 → P6
                                    ↘
                                      P7 (중장기)
```
- P2는 P1 스키마에 의존
- P3는 P2 Evaluator에 의존 (루프 종료 조건)
- P4는 P3 승격 패널에 의존
- P5는 P1~P4 모두 완료 후 실행
- P7은 P5~P6 데이터 누적 후 의미 있음

## 리스크
- **변형 생성 비용**: 잔여 33패널 × 2후보 × 2회 = 132회 최소 (실패 시 최대 297회). P5에서 효과 검증 후 확대.
- **gpt-image-2 레퍼런스 입력 미지원**: img2img가 안 되면 텍스트 프롬프트 기반으로 회귀 (P-1).
- **"신규 작성" 작업량**: run-panel-jobs.js, evaluation-rubric.md, IMAGE-WORKFLOW.md 모두 처음부터 만들어야 함.
