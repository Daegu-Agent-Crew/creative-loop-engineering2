# DECISIONS — 삼체 연재 만화 창작 시스템 (CLE3)

## 결정 로그

### 2026-07-06
- 결정: CLE3의 공식 기준 이슈는 `#24 / [CLE2-9]`로 본다.
- 이유: `#17 / CLE2-7`은 운영 레이어와 초기 STUDIO 시스템을 다룬 선행 작업이고, `#24`는 이를 포함하는 더 상위의 창작 시스템 요구사항이기 때문이다.
- 영향: 앞으로 CLE3 관련 새 문서와 진행 추적은 `tasks/CLE2-9/...` 기준으로 누적한다.

### 2026-07-06
- 결정: `CLE2-7`은 선행 운영 시스템, `CLE2-9`는 상위 창작 시스템으로 분리한다.
- 이유: 둘을 같은 단위로 다루면 STUDIO 운영 개선과 창작 시스템 설계가 다시 혼용된다.
- 영향: `CLE2-7`에서 정리한 자산은 재사용하되, CLE3의 목표/범위는 `CLE2-9`에서 별도 관리한다.

### 2026-07-06
- 결정: 다른 AI에게 받은 CLE3 컨설팅 자료는 `tasks/CLE2-9/three-body-cle3/research/`에 원본 문서로 보관하고, 핵심 반영점만 이슈 댓글과 DECISIONS/PLAN에 요약한다.
- 이유: 이슈 댓글만으로는 장문 분석과 실행 가이드를 지속적으로 참조하기 어렵고, 문서만 두면 타임라인과 알림이 끊긴다.
- 영향: 장기 지식 자산은 저장소 안에서 유지하고, GitHub 이슈는 요약·합의·알림 채널로 사용한다.

### 2026-07-06
- 결정: TB/HM 원리는 참고용 부록으로 두지 않고 CLE3 객체 모델에 직접 매핑한다.
- 이유: CLE3가 실제 제작 시스템이 되려면, 삼체 매력 요소와 흥행 만화 구조가 Story/Episode/Panel/Review 수준의 필드와 검토 규칙으로 내려와야 한다.
- 영향: `OBJECT-MODEL.md`를 기준으로 Story, StylePack, CharacterSheet, Episode, Scene, Panel, ReviewNote, Release, Results 객체가 정의되며, 이후 UI/검토 자동화도 이 객체를 기준으로 쪼갠다.

### 2026-07-06
- 결정: 정합성 린트와 Vision QA는 `CLE2-9` 본체에 섞지 않고 후속 구현 이슈로 분리한다.
- 이유: 정합성 린트는 규칙 기반 점검 시스템이고, Vision QA는 시각 결과 승인/반려 흐름이어서 책임과 검증 방식이 다르다.
- 영향: `CLE2-9`는 상위 설계 태스크로 유지하고, 구현은 `FOLLOW-UP-ISSUES.md` 기준으로 별도 태스크로 분해한다.

## 열린 쟁점
- [ ] CLE3 전용 상세 탭이 CLE2 UI에 추가로 필요한지 검토
- [ ] STUDIO 보드를 CLE3 하위 기능으로 흡수할지, CLE2-7에 남겨둘지 결정 필요
- [ ] `three-body-comic`의 EP003~EP005 공개 뷰어와 CLE3 우선순위 관계 정리 필요
- [ ] 후속 이슈 번호를 `CLE2-10~12`로 바로 고정할지, 생성 시점에 순번을 다시 잡을지 결정 필요

## 참고 링크
- GitHub Issue: #24
- 선행 이슈: #17
- 관련 저장소: `three-body-comic`
- 리서치 문서: `research/00-cle3-analysis-report.md`, `research/01-knowledge-integration-guide.md`, `research/02-three-body-appeal.md`, `research/03-hit-manga-structure-patterns.md`
