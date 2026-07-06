# INFORMATION ARCHITECTURE — CLE3 Episode Workspace / 에피소드 작업 뷰

## 목적
- `three-body-comic`의 실제 회차 구조를 바탕으로, Episode 단위 창작 객체를 한 화면 흐름으로 묶는 작업 뷰의 정보 구조를 정의한다.
- STUDIO 보드가 운영/큐 중심이라면, Episode Workspace는 창작 의도와 결과물을 한 눈에 읽는 작업 표면이어야 한다.

## 기본 원칙
- Episode Workspace의 기본 단위는 `Episode`다.
- 한 Episode 안에서 `Story -> Scene -> Panel -> Review -> Results`가 연결되어 보여야 한다.
- 파일 시스템 구조와 UI 구조가 완전히 같을 필요는 없지만, 사용자가 서로를 쉽게 매핑할 수 있어야 한다.

## 실제 저장소 매핑

### 회차 루트
- 실제 위치:
  - `episodes/EPxxx/`
- 핵심 파일:
  - `script.md`
  - `storyboard.md`
  - `results.md`
  - `panels/`

### Episode Workspace에서의 대응
- `Episode Header`
  - Episode ID
  - 한 줄 목표
  - 현재 상태
- `Script Summary`
  - `script.md` 요약
  - 장면 비트
- `Storyboard Summary`
  - `storyboard.md`의 컷 계획
  - 패널 의도 리스트
- `Panel Strip`
  - 패널 상태
  - selectedResult
  - lint / Vision QA 상태
- `Results Summary`
  - `results.md`의 회차 학습 포인트
  - 실험/가설 연결

## 권장 화면 구조

### 1. Episode Header
- 목적:
  - 지금 이 회차가 무엇을 목표로 하는지 바로 보여준다.
- 포함 항목:
  - `episodeId`
  - `episodeGoal`
  - 현재 단계
  - review/lint/qa 집계

### 2. Story & Script Lane
- 목적:
  - 왜 이 회차가 존재하는지, 어떤 정보와 감정을 전달해야 하는지 보여준다.
- 포함 항목:
  - premise 연결
  - 회차 훅
  - 핵심 비트
  - targetEmotion

### 3. Storyboard & Scene Lane
- 목적:
  - 장면 전환과 컷 설계를 읽게 한다.
- 포함 항목:
  - Scene 리스트
  - 각 Scene purpose
  - revealLevel
  - tensionMode

### 4. Panel Workspace Lane
- 목적:
  - 실제 패널 제작과 검수 흐름을 한 곳에 모은다.
- 포함 항목:
  - `panelId`
  - `panelIntent`
  - candidate / selectedResult
  - lint status
  - Vision QA status

### 5. Review & Results Lane
- 목적:
  - 수정 요청과 회차 학습 결과를 연결한다.
- 포함 항목:
  - unresolved ReviewNote
  - frequent lint rules
  - Vision QA summary
  - nextExperiment

## 화면에 꼭 보여야 하는 요약값
- 패널 수 / 검수 완료 수
- lint `critical`, `major` 잔여 개수
- Vision QA 승인 상태 분포
- 가장 많이 반복된 문제 카테고리
- 회차 결과에서 다음 라운드로 넘어갈 핵심 3개

## 사용자 질문 기준
- "이 회차는 지금 어느 단계인가?"
- "어떤 장면이 막히고 있는가?"
- "어떤 패널이 아직 선택되지 않았는가?"
- "지금 수정해야 할 문제가 정합성 문제인가, 전달력 문제인가?"
- "이 회차에서 배운 것을 다음 회차에 어떻게 반영할 것인가?"

## CLE2-7 STUDIO와의 경계
- STUDIO:
  - 운영 큐
  - 소유자
  - 상태 추적
  - 작업 분배
- Episode Workspace:
  - 회차 목적
  - 장면/패널 의도
  - lint / Vision QA 결과
  - 회차 학습 포인트

## CLE2 UI 반영 기준
- 초기 단계에서는 `CLE2-12` 상세 문서와 `CLE2-7 STUDIO`를 서로 링크하는 수준으로 시작해도 된다.
- 이후 실제 UI 구현 시에는:
  - 좌측: Episode/Scene 구조
  - 중앙: Panel strip
  - 우측: Review/Results 요약
  구조가 자연스럽다.

## 다음 단계
- 실제 `script.md`, `storyboard.md`, `results.md`에서 어떤 필드를 뽑아 카드화할지 정의
- `panels/` 하위 구조가 확정되면 selectedResult / lint / vision-qa 파일 위치까지 함께 고정
