# GOAL — CLE3 수렴 루프 시스템 도입

## 목표
CLE3 파이프라인에 Search → Evaluate → Converge 폐루프를 내장하여, 특히 Phase 4(이미지 생성)의 패널 품질과 완료율을 획기적으로 개선한다.

## 가치 가설
- 사용자 가치: 에피소드 완성률 향상 → 90% 이상
- 기본 목표: Phase 4 마이크로 루프 도입으로 EP001 잔여 패널 생성 돌파
- 도전 목표: 5개 에피소드 전체 Phase 4 완료 + QA 통과 수준으로 품질 수렴

## 실제 자산 기준선 (2026-08-14 재기준화)

| 항목 | EP001 | EP002 |
|------|-------|-------|
| generated (원본 패널 이미지) | 16/49 | 10/57 (비정규 경로 `cle5-ep002/images/`) |
| qa_approved (QA 통과) | 미정 | 미정 |
| published_final (오버레이+공개) | 0 | 0 |

> 이전 GOAL의 "EP001 17/49, EP002 30/57"은 실제 파일과 불일치. 3단계 진행률 분리 적용.

## 성공 기준 (Definition of Done)
- [ ] 비교·선택 데이터 스키마 설계 — candidates/comparison-result JSON Schema
- [ ] A/B/C Evaluator + 절대 품질 게이트 구현 — both_bad/tie/절대통과 포함
- [ ] Panel Runner(후보 생성 실행기) 구현 — 실제 imagegen 호출, 참조 전달, 후보 저장, 결과 수집
- [ ] 선호 메모리 & 레퍼런스 체인 — preference-memory.json + 승인 패널 레퍼런스 작동
- [ ] 단일 패널 end-to-end 검증 — 후보 2× 최대 2회, 사람 블라인드 선호 비교
- [ ] EP001 패널 생성률 49/49 달성 (루프 시스템으로 돌파)
- [ ] Phase 4 / Phase 5 평가 범위 분리 (캐릭터·구도 vs 대사·가독성)
- [ ] 에피소드 회고 + Evaluator 캘리브레이션 (중장기)

## 범위
### 포함 (In Scope)
- 비교·선택 스키마, Evaluator, Panel Runner **신규 설계 및 구현**
- preference-memory.json, calibration-log.json 새 스키마
- EP001 잔여 패널 생성 (루프 시스템 검증)

### 제외 (Out of Scope)
- CLE3 Phase 1~3 (스토리/캐릭터/스토리보드) 구조 변경
- 새로운 에피소드(EP006+) 창작
- 이미지 생성 모델 자체(gpt-image-2) 교체

## 관련 이슈
- GitHub Issue: #54
- CLE2-ID: 20

## 담당자
- 대구루 (설계 + 구현)
