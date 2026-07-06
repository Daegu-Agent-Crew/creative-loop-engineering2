# DECISIONS — CLE3 Episode Workspace / 에피소드 작업 뷰

## 결정 로그

### 2026-07-06
- 결정: Episode Workspace는 후속 구현 태스크로 분리해 `CLE2-12`에서 관리한다.
- 이유: 객체 모델 정의(CLE2-9)와 실제 작업 화면 구조 정의는 구현 관심사가 다르다.
- 영향: CLE2-12는 Episode 중심 화면과 `three-body-comic` 구조 매핑에 집중한다.

### 2026-07-06
- 결정: Episode Workspace의 기본 단위는 `Episode`이며, 내부에서 `Story -> Scene -> Panel -> Review -> Results` 흐름을 보여준다.
- 이유: 파일 기준으로는 `script/storyboard/results/panels`가 흩어져 있지만, 사용자는 회차 단위로 목적과 진행을 읽는 편이 자연스럽다.
- 영향: 화면 정보 구조는 파일 종류보다 회차 중심으로 조직된다.

## 열린 쟁점
- [ ] Episode Workspace를 CLE2 안에 둘지, `three-body-comic` 보조 뷰로 둘지 결정 필요
- [ ] panels 하위 폴더 구조가 확정되면 selectedResult/lint/vision-qa 파일 위치를 화면 모델에 어떻게 반영할지 결정 필요

## 참고 링크
- 상위 태스크: `CLE2-9`
- 선행 기반 태스크: `CLE2-7`
- GitHub Issue: `#28`
- 관련 문서: `tasks/CLE2-9/three-body-cle3/OBJECT-MODEL.md`
- 정보 구조: `tasks/CLE2-12/cle3-episode-workspace/INFORMATION-ARCHITECTURE.md`
