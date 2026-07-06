# DECISIONS — 삼체 연재 만화 프로젝트 전용 관리 시스템

## 결정 로그

### 2026-06-24
- 결정: `creative-loop-engineering2`는 운영 레이어, `three-body-comic`은 실제 제작/배포 레이어로 분리 유지한다.
- 이유: 운영 상태 관리와 실제 산출물 저장소의 관심사를 나눠야 시스템이 단순해진다.
- 영향: CLE2는 STUDIO 보드와 handoff를 맡고, 실제 에피소드/패널/Pages는 `three-body-comic`에서 관리한다.

### 2026-06-24
- 결정: 에피소드 상태와 패널 상태는 각각 별도 상태 모델로 관리한다.
- 이유: 회차 수준 진행과 패널 수준 품질 문제를 같은 단계로 다루면 병목 원인이 흐려진다.
- 영향: `script → storyboard → render → review → publish → observe`와 패널 상태 칩을 분리 운영한다.

### 2026-06-24
- 결정: GitHub PAT는 공개 프런트엔드에 하드코딩하지 않고 각 브라우저의 localStorage에서만 다룬다.
- 이유: GitHub Pages 정적 배포에서 `.env` 기반 쓰기 권한 관리는 맞지 않고 보안상 취약하다.
- 영향: CLE2 설정 화면은 저장/테스트/제거 흐름을 localStorage 기준으로 제공한다.

### 2026-07-06
- 결정: 추가 자료와 장기 참조 의견은 `DECISIONS.md`에 누적하고, 짧은 논의는 GitHub Issue 댓글에 남긴다.
- 이유: 이슈 댓글만으로는 의사결정 추적이 어렵고, 문서만으로는 짧은 논의 타임라인이 끊긴다.
- 영향: CLE2 UI에서 각 요구사항별 `DECISIONS.md`를 바로 조회할 수 있도록 한다.

## 열린 쟁점
- [ ] STUDIO 상태와 `three-body-comic/episodes` 실제 파일 상태를 어느 단위까지 동기화할지 결정 필요
- [ ] EP003~EP005 공개 뷰어를 수동 작성할지 템플릿/생성 방식으로 전환할지 결정 필요
- [ ] 관측 데이터(GA/Forms)를 results 기록과 어떻게 연결할지 운영 기준 보강 필요

## 참고 링크
- GitHub Issue: #17
- 관련 저장소: `three-body-comic`
- 관련 문서: `docs/SYSTEM-OVERVIEW.md`, `docs/EPISODE-PIPELINE.md`
