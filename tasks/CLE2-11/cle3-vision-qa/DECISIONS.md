# DECISIONS — CLE3 Vision QA / 결과 검수 시스템

## 결정 로그

### 2026-07-06
- 결정: Vision QA는 정합성 린트와 분리된 후속 태스크로 `CLE2-11`에서 관리한다.
- 이유: 정합성 린트는 규칙 점검이고, Vision QA는 시각 결과 해석과 승인 흐름이 중심이기 때문이다.
- 영향: CLE2-11은 `Panel.selectedResult`, ReviewNote, 승인 흐름에 집중한다.

### 2026-07-06
- 결정: Vision QA 평가는 `Intent Fidelity`, `Clarity`, `Composition`, `Emotion`, `Readiness` 5축으로 시작한다.
- 이유: 단순 미감 평가가 아니라 장면 목적 전달과 연재 컷의 기능을 함께 보려면 최소 이 정도 축이 필요하다.
- 영향: `VISION-QA-RUBRIC.md`의 점수 체계를 기준으로 승인 상태를 판정한다.

### 2026-07-06
- 결정: Vision QA는 lint 통과 이후 단계로 두고, `critical` 없음 / `major` 1건 이하 / 메타데이터 누락 없음`을 기본 handoff 기준으로 삼는다.
- 이유: 정합성 문제가 큰 상태에서 시각 검수까지 같이 하면 리뷰 비용이 커지고 판단 기준이 흐려진다.
- 영향: CLE2-10은 사전 게이트, CLE2-11은 장면 전달력과 승인 판단 단계로 역할이 분리된다.

## 열린 쟁점
- [ ] Vision QA를 에피소드 단위로 묶어 볼지, 패널 단위 우선으로 볼지 결정 필요
- [ ] `conditional` 상태를 몇 라운드까지 허용할지 운영 규칙 결정 필요

## 참고 링크
- 상위 태스크: `CLE2-9`
- GitHub Issue: `#27`
- 관련 문서: `tasks/CLE2-9/three-body-cle3/OBJECT-MODEL.md`
- 선행 규격: `tasks/CLE2-10/cle3-consistency-lint/LINT-SPEC.md`
- 세부 규격: `tasks/CLE2-11/cle3-vision-qa/VISION-QA-RUBRIC.md`
