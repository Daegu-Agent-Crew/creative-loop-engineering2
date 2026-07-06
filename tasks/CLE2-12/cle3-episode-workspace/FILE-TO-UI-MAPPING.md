# FILE TO UI MAPPING — CLE3 Episode Workspace / 에피소드 작업 뷰

## 목적
- `three-body-comic/episodes/EPxxx/`의 실제 파일을 Episode Workspace 화면 요소에 1:1로 대응시킨다.
- 구현 시 어떤 문서에서 어떤 필드를 읽어 어떤 카드/섹션에 보여줄지 기준을 고정한다.

## 실제 파일 구조 기준

### Episode 루트
- `episodes/EPxxx/script.md`
- `episodes/EPxxx/storyboard.md`
- `episodes/EPxxx/results.md`
- `episodes/EPxxx/panels/`

### 관찰 메모
- `script.md`
  - 에피소드 메타
  - 가설 할당
  - 로그라인
  - Scene/Panel 단위 내용
- `storyboard.md`
  - 페이지 구성
  - 컷 설계
  - ACT 톤 가이드
- `results.md`
  - 배포 대상
  - 정량/정성 지표
  - 가설 판정
  - 다음 액션
- `panels/`
  - 실제 선택/후보 이미지
  - `MANIFEST.md`

## 화면 섹션별 매핑

### 1. Episode Header
- 데이터 출처:
  - `script.md`의 `에피소드 메타`
  - `results.md`의 `기본 정보`
- 표시 필드:
  - `episodeId`
  - 제목 / 로그라인
  - 상태
  - 주요 등장인물
  - primary hypothesis
  - owner

### 2. Story Summary Card
- 데이터 출처:
  - `script.md`의 `에피소드 개요 (로그라인)`
  - `가설 할당`
- 표시 필드:
  - 로그라인
  - 주 가설 / 부 가설
  - 테스트 방법
  - target mystery/emotion 메모

### 3. Scene Outline Lane
- 데이터 출처:
  - `script.md`의 `장별 대본`
- 표시 필드:
  - Scene 제목
  - 장소 / 시간 / 등장인물
  - 분위기 / 화풍
  - 패널 수
- 구현 메모:
  - `### ACT ...` 아래 `#### Scene ...` 구조를 읽어 scene card를 구성

### 4. Storyboard Lane
- 데이터 출처:
  - `storyboard.md`
- 표시 필드:
  - 페이지 번호
  - 컷 수
  - 화각
  - 장면 목적
  - 감정 키워드
- 구현 메모:
  - 콘티가 아직 템플릿 상태인 회차는 "storyboard incomplete" 상태를 표시

### 5. Panel Strip
- 데이터 출처:
  - `panels/` 폴더
  - `script.md` 패널 표
  - 향후 `lint.json`, `vision-qa.json`
- 표시 필드:
  - `panelId`
  - 썸네일
  - panel intent 한 줄
  - selected result 여부
  - lint status
  - Vision QA status
- 구현 메모:
  - 현재 EP001은 `ep001-p01...png` 형식 파일명이므로, 파일명에서 panel 번호를 추출해 panel card와 연결

### 6. Results Lane
- 데이터 출처:
  - `results.md`
  - 향후 `Vision QA Summary`, `Consistency Lint Summary`
- 표시 필드:
  - 정량 지표
  - 정성 지표
  - hypothesis verdict
  - next actions
  - frequent issues

## EP001 기준 예시 매핑

### Episode Header
- `script.md`
  - 제목: `태초의 밤`
  - 원작 대응
  - 페이지 수
  - 주요 등장인물
- `results.md`
  - status: `pending`
  - primary hypothesis: `H6`
  - owner: `레노버`

### Scene Outline
- `Scene 1: 밤하늘`
  - 장소: `청쑤 대학 기숙사 옥상`
  - 분위기: `고요한 밤, 따뜻하고 경건함`
- `Scene 2: 붉은 날`
  - 분위기: `압도적 위협, 붉은 색 지배`
- 이런 식으로 scene card를 만든다.

### Panel Strip
- `panels/ep001-p01-starry-night...png`
  - `script.md` 패널 1과 연결
- `panels/ep001-p23-signal...png`
  - `script.md` 패널 23과 연결
- `panels/ep001-p67-cliffhanger...png`
  - 엔딩 훅 카드로 강조 가능

### Results Lane
- `results.md`
  - pageviews, avg_session_time, bounce_rate, return_rate
  - fun_score, anticipation_score, memorable_scene
  - H6 / H2 verdict
  - next actions checklist

## 구현 우선순위
1. Episode Header
2. Scene Outline
3. Panel Strip
4. Results Lane
5. Storyboard Lane 상세

## 불완전 데이터 처리 규칙
- `storyboard.md`가 템플릿 수준이면 placeholder 표시
- panel 이미지가 일부만 존재하면 missing panel 상태 표시
- `results.md` 값이 `TBD`면 metric pending 상태 표시
- lint/vision qa 파일이 없으면 not-reviewed 상태 표시

## STUDIO와의 역할 분담
- STUDIO는 "누가 무엇을 맡고 있는가"를 보여준다.
- Episode Workspace는 "이 회차가 어떤 서사/연출/결과 흐름을 갖는가"를 보여준다.
- 동일한 패널을 보더라도:
  - STUDIO: 상태/담당/큐
  - Workspace: 의도/결과/검수

## 다음 단계
- `EP002~EP005`에도 동일한 매핑이 무리 없이 적용되는지 확인
- panel 파일명 규칙이 회차마다 일관한지 검사
- results.md 템플릿에 lint / Vision QA summary 섹션을 추가할지 결정
