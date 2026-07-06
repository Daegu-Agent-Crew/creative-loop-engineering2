# OBJECT MODEL — 삼체 연재 만화 창작 시스템 (CLE3)

## 목적
- CLE3를 단순 문서 묶음이 아니라, 실제 `three-body-comic` 제작 흐름과 연결되는 객체 기반 시스템으로 정리한다.
- 외부 리서치 문서에서 정리된 삼체 매력 원리(TB)와 흥행 만화 구조 패턴(HM)을 각 객체의 필수 속성, 검토 기준, 산출물 규칙으로 직접 연결한다.

## 핵심 객체

### 1. Story
- 역할: 작품 전체의 방향, 시즌 단위 아크, 세계관 질문, 독자 진입점 정의
- 주요 필드:
  - `premise`
  - `coreQuestions`
  - `readerHook`
  - `mysteryLayers`
  - `arcMap`
  - `knowledgeAnchors`
- 연결 원리:
  - TB-01: 거대한 질문과 경외감은 `coreQuestions`, `mysteryLayers`에 반영
  - TB-02: 과학적 사고/문명 충돌은 `knowledgeAnchors`, `arcMap`에 반영
  - HM-01: 첫 진입 훅은 `readerHook`에 반영
  - HM-02: 장기 떡밥과 회수 계획은 `arcMap`에 반영

### 2. StylePack
- 역할: 작화 분위기, 색, 명암, 질감, 연출 레퍼런스의 기준 묶음
- 주요 필드:
  - `visualIntent`
  - `palette`
  - `lightingRules`
  - `shotLanguage`
  - `negativeExamples`
  - `consistencyRules`
- 연결 원리:
  - TB-03: 차갑고 거대한 우주적 감각은 `visualIntent`, `lightingRules`에 반영
  - HM-05: 장면 목적에 맞는 시각적 리듬은 `shotLanguage`에 반영
  - HM-08: 스타일 드리프트 방지는 `consistencyRules`에 반영

### 3. CharacterSheet
- 역할: 캐릭터별 외형, 감정축, 행동논리, 장면별 금지 왜곡 기준 관리
- 주요 필드:
  - `name`
  - `role`
  - `motivation`
  - `emotionalAxis`
  - `visualTraits`
  - `speechTone`
  - `doNotBreak`
- 연결 원리:
  - TB-04: 인물은 아이디어의 전달체이면서도 감정선이 있어야 하므로 `motivation`, `emotionalAxis`에 반영
  - HM-04: 독자가 붙잡을 감정 고리는 `speechTone`, `emotionalAxis`에 반영
  - HM-08: 캐릭터 붕괴 방지는 `doNotBreak`에 반영

### 4. Episode
- 역할: 회차 단위 목표, 핵심 사건, 공개 범위, 결과 측정 가설 정의
- 주요 필드:
  - `episodeId`
  - `episodeGoal`
  - `hookOpen`
  - `hookClose`
  - `beats`
  - `targetEmotion`
  - `linkedHypotheses`
  - `releasePlan`
- 연결 원리:
  - HM-01: 회차 시작 훅은 `hookOpen`
  - HM-03: 끝맺음 당김은 `hookClose`
  - HM-06: 회차당 감정 곡선은 `beats`, `targetEmotion`
  - TB-05: 설명보다 체험되는 전개는 `episodeGoal`, `beats`

### 5. Scene
- 역할: 회차 내부의 장면 목적, 정보 공개량, 긴장 상태, 전환 리듬 관리
- 주요 필드:
  - `sceneId`
  - `purpose`
  - `revealLevel`
  - `tensionMode`
  - `knowledgePayload`
  - `transitionType`
- 연결 원리:
  - TB-06: 정보는 층위별로 드러나야 하므로 `revealLevel`, `knowledgePayload`
  - HM-05: 장면 리듬은 `transitionType`, `tensionMode`
  - HM-07: 과설명 방지는 `purpose`와 `knowledgePayload` 검토 규칙으로 연결

### 6. Panel
- 역할: 실제 컷 단위 연출, 구도, 대사, 시선 흐름, 생성 결과 후보 관리
- 주요 필드:
  - `panelId`
  - `panelIntent`
  - `camera`
  - `composition`
  - `dialogue`
  - `subtext`
  - `imagePrompt`
  - `reviewStatus`
  - `selectedResult`
- 연결 원리:
  - HM-05: 페이지/컷 리듬은 `camera`, `composition`
  - HM-07: 말보다 이미지가 먼저 전달되어야 하므로 `panelIntent`, `subtext`
  - TB-07: 압도감/낯섦/공포 같은 감각은 `panelIntent`, `selectedResult` 평가 기준

### 7. ReviewNote
- 역할: 사람/AI 리뷰 피드백, 수정 요청, 정합성 체크 결과 축적
- 주요 필드:
  - `targetType`
  - `targetId`
  - `reviewer`
  - `category`
  - `severity`
  - `comment`
  - `actionRequired`
  - `resolved`
- 연결 원리:
  - HM-08: 캐릭터/스타일 정합성 린트는 `category=consistency`
  - HM-09: 독자 시선과 이해도 점검은 `category=clarity`
  - TB/HM 기반 점검표를 리뷰 항목의 기본 카테고리로 사용

### 8. Release
- 역할: GitHub Pages 공개 단위, 공개 버전, 설명 문구, 채널 전파 관리
- 주요 필드:
  - `releaseId`
  - `episodeId`
  - `publishTarget`
  - `summary`
  - `spoilerPolicy`
  - `notificationTargets`
  - `releaseStatus`
- 연결 원리:
  - HM-10: 공개 시 다음 회차 기대를 남기는 구조를 `summary`, `notificationTargets`에 반영
  - TB-01/TB-06: 스포일러 통제와 미스터리 유지가 `spoilerPolicy`에 반영

### 9. Results
- 역할: 공개 후 반응, 가설 검증, 다음 수정 포인트 정리
- 주요 필드:
  - `episodeId`
  - `hypothesisId`
  - `signal`
  - `interpretation`
  - `followUpDecision`
  - `nextExperiment`
- 연결 원리:
  - HM/TB 원리가 실제로 독자 반응에 작동했는지 `signal`, `interpretation`으로 검증
  - 다음 회차/수정 루프는 `followUpDecision`, `nextExperiment`로 연결

## 객체 간 관계
- Story 1:N Episode
- Story 1:N CharacterSheet
- Story 1:N StylePack
- Episode 1:N Scene
- Scene 1:N Panel
- Episode 1:N Release
- Episode 1:N Results
- ReviewNote N:1 (Story | StylePack | CharacterSheet | Episode | Scene | Panel | Release)

## CLE2-7과의 경계
- `CLE2-7`: 운영 시스템, 생산 파이프라인, 보드/큐/상태 추적, 이미지 생성 실행 표준
- `CLE2-9 / CLE3`: 창작 객체, 서사/연출 기준, 원리 기반 리뷰, 공개/관측까지의 창작 시스템

## 후속 구현 힌트
- CLE2 UI에서는 위 객체를 곧바로 전부 화면화하기보다, 먼저 `Story / Episode / Panel / ReviewNote / Results` 5축으로 보여주는 편이 현실적이다.
- 정합성 린트는 `CharacterSheet`, `StylePack`, `Panel` 기준으로 자동 점검 규칙을 붙이기 좋다.
- Vision QA는 `Panel.selectedResult`와 `ReviewNote`를 중심으로 후속 이슈로 분리하는 편이 구현 단위가 깔끔하다.
