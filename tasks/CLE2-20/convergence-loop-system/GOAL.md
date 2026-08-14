# GOAL — CLE3 수렴 루프 시스템 도입

## 목표
CLE3 파이프라인에 Search → Evaluate → Converge 폐루프를 내장하여, 특히 Phase 4(이미지 생성)의 패널 품질과 완료율을 획기적으로 개선한다.

## 가치 가설
- 사용자 가치: 에피소드 완성률 향상 → 90% 이상
- 기본 목표: Phase 4 마이크로 루프 도입으로 패널 품질 수렴 및 `p8-1` 생성, 오버레이 완료율 향상
- 도전 목표: 5개 에피소드 전체 Phase 4 + QA 통과 수준으로 품질 수렴

## 실제 자산 기준선 (2026-08-14 — creative-loop-engineering3 기준)

| 단계 | EP001 | EP002 |
|------|-------|-------|
| generated (원본 패널 이미지) | 48/49 (`p8-1` 누락) | 30/57 |
| overlay_complete (대사 오버레이) | 17/49 | 0/57 |
| qa_approved (QA 통과) | 미정 | 미정 |

> 정정: 1차 조사에서 잘못된 리포(three-body-comic)를 참조하여 "EP001 16개, EP002 10개"로 기재했음. 실제 CLE3 리포에서는 위 수치가 정확.

## 성공 기준 (Definition of Done)
- [ ] 비교·선택 데이터 스키마 설계 — candidates/comparison-result JSON Schema
- [ ] A/B/C Evaluator + 절대 품질 게이트 구현 — both_bad/tie/절대통과 포함, 기존 evaluation-rubric.md 개편
- [ ] run-panel-jobs.js 확장 — `--variants` 옵션, 실제 imagegen 호출, 레퍼런스 이미지 전달, 후보 저장
- [ ] 선호 메모리 & 레퍼런스 체인 — preference-memory.json + 승인 패널 레퍼런스 (GPT Image 2 이미지 입력 활용)
- [ ] 단일 패널 end-to-end 검증 — 후보 2× 최대 2회, 사람 블라인드 선호 비교
- [ ] `p8-1` 생성 + EP001 오버레이 완료율 향상
- [ ] Phase 4 / Phase 5 평가 범위 분리 (캐릭터·구도·감정·화풍 vs 대사·가독성)
- [ ] 에피소드 회고 + Evaluator 캘리브레이션 (중장기)

## 범위
### 포함 (In Scope)
- 기존 `evaluation-rubric.md`, `run-panel-jobs.js`, `IMAGE-WORKFLOW.md` **개편**
- 비교·선택 스키마, preference-memory.json, calibration-log.json **신규 추가**
- EP001 `p8-1` 생성 및 수렴 루프 검증

### 제외 (Out of Scope)
- CLE3 Phase 1~3 (스토리/캐릭터/스토리보드) 구조 변경
- 새로운 에피소드(EP006+) 창작
- 이미지 생성 모델 자체(gpt-image-2) 교체

## 관련 이슈
- GitHub Issue: #54
- CLE2-ID: 20

## 담당자
- 대구루 (설계 + 구현)
