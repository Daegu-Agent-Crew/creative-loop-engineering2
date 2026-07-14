# DECISIONS — CLE3 Episode Workspace / 에피소드 작업 뷰

## 결정 로그

### 2026-07-14
- 결정: Episode Workspace에 Discovery 전용 탭과 개요 요약을 추가한다.
- 이유: Phase 산출물뿐 아니라 작업 전 Unknown, 도구, 가정, 사람 결정과 승인 상태를 같은 에피소드 맥락에서 검토해야 한다.
- 근거 및 사용한 레퍼런스: CLE2-13 / #29, CLE3 governance JSON과 브라우저 검증
- 확신도: high
- 남아 있는 불확실성: 브라우저에서 변경한 승인 상태를 Git 원본으로 확정하는 저장 방식
- 검토한 대안: QA 탭에 모두 합치기, 별도 운영 대시보드 만들기
- 사람 승인: approved
- 영향: EP001~EP005에 Discovery 탭과 세 운영 데이터 링크를 노출한다.

### 2026-07-06
- 결정: Episode Workspace는 후속 구현 태스크로 분리해 `CLE2-12`에서 관리한다.
- 이유: 객체 모델 정의(CLE2-9)와 실제 작업 화면 구조 정의는 구현 관심사가 다르다.
- 영향: CLE2-12는 Episode 중심 화면과 `three-body-comic` 구조 매핑에 집중한다.

### 2026-07-06
- 결정: Episode Workspace의 기본 단위는 `Episode`이며, 내부에서 `Story -> Scene -> Panel -> Review -> Results` 흐름을 보여준다.
- 이유: 파일 기준으로는 `script/storyboard/results/panels`가 흩어져 있지만, 사용자는 회차 단위로 목적과 진행을 읽는 편이 자연스럽다.
- 영향: 화면 정보 구조는 파일 종류보다 회차 중심으로 조직된다.

### 2026-07-06
- 결정: 실제 저장소 매핑의 기준 회차는 우선 `EP001`로 삼고, `script.md / storyboard.md / results.md / panels/`를 화면 섹션으로 대응시킨다.
- 이유: EP001이 현재 가장 구체적인 실제 파일 묶음을 가지고 있어 초기 매핑 기준으로 쓰기 적합하다.
- 영향: `FILE-TO-UI-MAPPING.md`를 기준으로 이후 EP002~EP005에도 같은 규칙이 유지되는지 검증한다.

### 2026-07-07
- 결정: STUDIO와 Episode Workspace는 통합 화면보다 역할 분리된 링크형 공존으로 먼저 간다.
- 이유: 지금 단계에서 운영 보드와 창작 작업 뷰를 한 화면 책임으로 묶으면 다시 혼용될 가능성이 높다.
- 영향: 초기 CLE2 반영은 `CLE2-7`과 `CLE2-12`를 관련 태스크로 연결하고, 이후 데이터가 쌓이면 3열 작업형으로 확장한다.

## 열린 쟁점
- [ ] Episode Workspace를 CLE2 안에 둘지, `three-body-comic` 보조 뷰로 둘지 결정 필요
- [ ] panels 하위 폴더 구조가 확정되면 selectedResult/lint/vision-qa 파일 위치를 화면 모델에 어떻게 반영할지 결정 필요

## 참고 링크
- 상위 태스크: `CLE2-9`
- 선행 기반 태스크: `CLE2-7`
- GitHub Issue: `#28`
- 관련 문서: `tasks/CLE2-9/three-body-cle3/OBJECT-MODEL.md`
- 정보 구조: `tasks/CLE2-12/cle3-episode-workspace/INFORMATION-ARCHITECTURE.md`
- 파일 매핑: `tasks/CLE2-12/cle3-episode-workspace/FILE-TO-UI-MAPPING.md`
- 경계/배치: `tasks/CLE2-12/cle3-episode-workspace/STUDIO-BOUNDARY-AND-LAYOUT.md`
