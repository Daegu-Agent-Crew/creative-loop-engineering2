# DECISIONS — CLE3 정합성 린트 시스템

## 결정 로그

### 2026-07-06
- 결정: CLE3 정합성 린트는 후속 구현 태스크로 분리해 `CLE2-10`에서 관리한다.
- 이유: 객체 모델 정의(CLE2-9)와 규칙 기반 품질 점검 구현은 성격이 다르다.
- 영향: CLE2-9는 상위 설계 문서로 유지하고, 린트 규칙은 CLE2-10에서 구체화한다.

### 2026-07-06
- 결정: 초기 린트 범주는 `Character Consistency`, `Style Drift`, `Panel Metadata Completeness`, `Cross-Object Contradiction` 4개로 시작한다.
- 이유: 너무 많은 규칙으로 출발하면 운영이 무거워지고, 반대로 너무 적으면 실제 품질 문제를 잡아내기 어렵다.
- 영향: `LINT-SPEC.md` 기준으로 ruleId와 severity 체계를 먼저 고정하고, 이후 세부 규칙을 늘린다.

### 2026-07-06
- 결정: 린트 결과는 `ReviewNote(category=consistency)`로 환산되는 것을 기본 규칙으로 삼는다.
- 이유: 별도 품질 로그만 쌓으면 실제 수정 흐름과 분리되기 쉽다.
- 영향: lint result는 최종적으로 패널/장면/에피소드 리뷰 큐에 들어갈 수 있어야 한다.

### 2026-07-06
- 결정: `three-body-comic`에서는 패널 단위 lint 결과는 `episodes/EPxxx/panels/Pyy/` 근처에 두고, 회차 요약은 `episodes/EPxxx/results.md`에 누적한다.
- 이유: 실제 산출물 가까이 있는 세부 로그와, 회차 단위로 읽는 요약 로그를 분리해야 수정과 회고가 모두 편해진다.
- 영향: lint는 패널 수정 라운드와 회차 retrospective 양쪽에 동시에 연결된다.

### 2026-07-06
- 결정: lint는 Vision QA 이전 게이트로 동작시키고, `critical/major` 기준에 따라 handoff 여부를 통제한다.
- 이유: 정합성 문제가 큰 상태로 Vision QA에 넘기면 사람 검수 비용이 낭비된다.
- 영향: CLE2-11은 lint 통과 이후의 시각 품질/의도 전달 검토에 집중한다.

## 열린 쟁점
- [ ] 린트 규칙을 문서 기반으로만 둘지, 구조화된 JSON 형태까지 내릴지 결정 필요
- [ ] selectedResult 이미지 자체를 어디까지 자동 판정 대상으로 볼지 결정 필요

## 참고 링크
- 상위 태스크: `CLE2-9`
- GitHub Issue: `#26`
- 관련 문서: `tasks/CLE2-9/three-body-cle3/OBJECT-MODEL.md`
- 세부 규격: `tasks/CLE2-10/cle3-consistency-lint/LINT-SPEC.md`
