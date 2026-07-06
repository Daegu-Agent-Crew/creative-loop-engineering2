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

## 열린 쟁점
- [ ] CLE3 전용 상세 탭이 CLE2 UI에 추가로 필요한지 검토
- [ ] STUDIO 보드를 CLE3 하위 기능으로 흡수할지, CLE2-7에 남겨둘지 결정 필요
- [ ] `three-body-comic`의 EP003~EP005 공개 뷰어와 CLE3 우선순위 관계 정리 필요

## 참고 링크
- GitHub Issue: #24
- 선행 이슈: #17
- 관련 저장소: `three-body-comic`
- 리서치 문서: `research/00-cle3-analysis-report.md`, `research/01-knowledge-integration-guide.md`, `research/02-three-body-appeal.md`, `research/03-hit-manga-structure-patterns.md`
