# GOAL — CLE3 수렴 루프 시스템 도입

## 목표
CLE3 파이프라인에 Search → Evaluate → Converge 폐루프를 내장하여, 특히 Phase 4(이미지 생성)의 패널 품질과 완료율을 획기적으로 개선한다.

## 가치 가설
- 사용자 가치: 에피소드 완성률 향상(현재 EP001 35%, EP002 53% → 90% 이상), 패널 품질 편차 감소
- 기본 목표: Phase 4 마이크로 루프 도입으로 EP001 Act 3 잔여 32패널 생성 돌파
- 도전 목표: 5개 에피소드 전체 Phase 4 완료 + QA 통과 수준으로 품질 수렴

## 성공 기준 (Definition of Done)
- [ ] ② 선호 메모리 스키마 구현 — preference-memory.json + 승인 패널 레퍼런스 체인 작동
- [ ] ③ Phase 4 마이크로 루프 스크립트 구현 — 패널당 2~3변형 생성 → 비교 → 진단 → 재생성 사이클
- [ ] ① 비교평가 루브릭 적용 — evaluation-rubric.md A/B 비교 방식으로 개정
- [ ] ④ 목표 공동 진화 메커니즘 — 에피소드 완료 후 선호 회고 기록 + 다음 에피소드 활성화
- [ ] ⑤ Evaluator 캘리브레이션 — 사람 샘플링 점검 스텝 + calibration-log.json 구현
- [ ] EP001 49/49 패널 생성 완료 (마이크로 루프로 돌파)

## 범위
### 포함 (In Scope)
- CLE3 evaluation-rubric.md 전면 개정
- Phase 4 IMAGE-WORKFLOW.md 및 run-panel-jobs.js 개편
- preference-memory.json, calibration-log.json 새 스키마
- AI-COLLABORATION-PROTOCOL.md 선호 회고 섹션 추가
- EP001/EP002 잔여 패널 생성 (루프 시스템 검증)

### 제외 (Out of Scope)
- CLE3 Phase 1~3 (스토리/캐릭터/스토리보드) 구조 변경
- 새로운 에피소드(EP006+) 창작
- 이미지 생성 모델 자체(gpt-image-2) 교체

## 관련 이슈
- GitHub Issue: #54
- CLE2-ID: 20

## 담당자
- 대구루 (설계 + 구현)
