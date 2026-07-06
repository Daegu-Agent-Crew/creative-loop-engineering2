# STUDIO BOUNDARY AND LAYOUT — CLE3 Episode Workspace / 에피소드 작업 뷰

## 목적
- `CLE2-7 STUDIO`와 `CLE2-12 Episode Workspace`의 역할 차이를 분명히 하고, CLE2 화면에서 둘을 어떻게 배치할지 기준을 정한다.
- 운영 보드와 창작 작업 뷰가 다시 섞이지 않도록 화면 책임을 고정한다.

## 핵심 구분

### CLE2-7 STUDIO가 답하는 질문
- 지금 누가 어떤 작업을 맡고 있는가?
- 어떤 패널이 생성 대기, 리뷰 대기, 수정 중인가?
- 어떤 가설/실험이 진행 중인가?
- 운영상 병목은 어디인가?

### CLE2-12 Episode Workspace가 답하는 질문
- 이 회차는 무엇을 전달하려 하는가?
- 각 Scene과 Panel은 어떤 의도를 갖는가?
- 어떤 패널이 selectedResult로 굳어지고 있는가?
- lint / Vision QA / results 관점에서 회차는 어떤 상태인가?

## 역할 경계

### STUDIO
- 1차 책임:
  - 운영 큐
  - 담당자
  - 상태 전이
  - 병렬 처리
- 주 표현 단위:
  - Episode status
  - Panel status
  - queue item
  - hypothesis queue

### Episode Workspace
- 1차 책임:
  - 회차 목적
  - Scene/Panel 의도
  - selected result
  - lint / Vision QA / results
- 주 표현 단위:
  - Episode Header
  - Scene outline
  - Panel strip
  - Review/Results lane

## 같은 객체를 다르게 보는 방식

### Panel
- STUDIO에서:
  - `owner`
  - `status`
  - `attempts`
  - `queue`
- Workspace에서:
  - `panelIntent`
  - `selectedResult`
  - lint status
  - Vision QA status
  - 핵심 피드백

### Episode
- STUDIO에서:
  - 단계 상태 (`script`, `storyboard`, `render`, `review`, `publish`, `observe`)
  - 진행률
- Workspace에서:
  - 로그라인
  - Scene 구성
  - 회차 학습 포인트
  - results 요약

## CLE2 화면 배치 기준

### 옵션 A. 링크형 공존
- 방식:
  - `CLE2-7` 상세에서 STUDIO 보드 유지
  - `CLE2-12` 상세에서 Workspace 문서/요약 유지
  - 둘 사이를 `관련 태스크`로 왕복
- 장점:
  - 기존 화면 수정이 적다
  - 운영/창작 분리가 명확하다
- 단점:
  - 한 화면에서 전체 상황을 보긴 어렵다

### 옵션 B. 상하 분할형
- 방식:
  - 상단: Episode Workspace 요약
  - 하단: STUDIO 작업 상태
- 장점:
  - 회차 맥락과 운영 상태를 한 페이지에서 볼 수 있다
- 단점:
  - 한 화면 책임이 커지면 다시 혼용될 수 있다

### 옵션 C. 3열 작업형
- 방식:
  - 좌측: Scene / Script
  - 중앙: Panel strip
  - 우측: Review / Results
  - STUDIO는 별도 탭 또는 하단 링크
- 장점:
  - 창작 작업 표면으로 가장 자연스럽다
- 단점:
  - 구현 난이도가 높다

## 현재 추천
- 1단계:
  - 옵션 A로 시작
  - `CLE2-12` 상세 문서 안에 Workspace 기준을 축적
  - `CLE2-7` STUDIO는 현 운영 보드 역할 유지
- 2단계:
  - 문서와 데이터가 쌓이면 옵션 C 방향으로 확장

## 최소 UI 반영 항목
- `CLE2-12` 상세에서 문서 목록:
  - Information Architecture
  - File to UI Mapping
  - Studio Boundary and Layout
- `CLE2-7` 상세에서는:
  - "운영 보드"
- `CLE2-12` 상세에서는:
  - "창작 작업 뷰 기준"

## 혼용 방지 체크리스트
- STUDIO에 로그라인/감정선 설명을 넣지 않는다.
- Workspace에 owner/queue 중심 작업표를 주 구조로 넣지 않는다.
- lint / Vision QA 결과는 Workspace 우선, 단 상태 반영만 STUDIO에 요약한다.
- 담당자 변경/병목 해소는 STUDIO, 패널 의도/선택 이유는 Workspace에서 본다.

## 완료 기준
- 사용자가 `운영 상태를 보려면 어디로`, `창작 의도를 보려면 어디로` 가야 하는지 헷갈리지 않는다.
- EP001~EP005가 늘어나도 STUDIO와 Workspace가 서로 대체하려 들지 않는다.
