# FOLLOW-UP ISSUES — 삼체 연재 만화 창작 시스템 (CLE3)

## 목적
- `CLE2-9`를 상위 설계 태스크로 유지하면서, 실제 구현은 후속 이슈로 분리해 CLE2에서 추적 가능하게 만든다.
- 설계/정의 작업과 구현/검증 작업이 한 이슈에 섞이지 않도록 기준을 고정한다.

## 분해 원칙
- `CLE2-9`는 CLE3의 경계, 객체 모델, 협업 루프, 연동 기준을 다루는 상위 태스크다.
- 후속 이슈는 "하나의 구현 책임 + 하나의 검증 기준"을 갖도록 나눈다.
- 후속 이슈는 모두 `CLE2-9`를 상위 기반 태스크로 참조한다.

## 우선 분해 후보

### 후보 1. CLE3 정합성 린트 시스템
- 태스크: `CLE2-10`
- GitHub Issue: `#26`
- 목적:
  - CharacterSheet, StylePack, Panel 기준으로 정합성 위반을 자동 점검한다.
- 핵심 범위:
  - 캐릭터 외형/말투/역할 일관성 체크
  - StylePack 대비 색감/구도/질감 드리프트 체크
  - Panel 메타데이터 누락 체크
  - ReviewNote에 `consistency` 카테고리로 결과 연결
- 산출물:
  - 린트 규칙 문서
  - 입력/출력 포맷 정의
  - CLE2 또는 `three-body-comic` 연결 방식 초안

### 후보 2. CLE3 Vision QA / 결과 검수 시스템
- 태스크: `CLE2-11`
- GitHub Issue: `#27`
- 목적:
  - 생성된 패널 후보를 시각적으로 검수하고 승인/반려/수정 요청 흐름을 정리한다.
- 핵심 범위:
  - `Panel.selectedResult` 선택 기준 정의
  - 장면 목적과 실제 시각 결과의 일치 여부 검토
  - ReviewNote에 `clarity`, `composition`, `emotion` 카테고리 연결
  - 사람 승인 포인트와 AI 재시도 포인트 분리
- 산출물:
  - Vision QA 루브릭
  - 승인 상태 모델
  - 예시 리뷰 플로우

### 후보 3. CLE3 Episode Workspace / 에피소드 작업 뷰
- 태스크: `CLE2-12`
- GitHub Issue: `#28`
- 목적:
  - Story/Episode/Scene/Panel/Results를 한 화면 흐름으로 묶는 작업 뷰 기준을 정리한다.
- 핵심 범위:
  - 회차별 객체 연결 구조
  - script / storyboard / panels / release / results 연결
  - CLE2-7 STUDIO와의 경계 표시

## CLE2 화면에서의 표현 기준
- `CLE2-9`: 상위 설계 태스크
- `CLE2-10~12`: 하위 구현 태스크
- 상세 화면에서:
  - `CLE2-9`는 "후속 구현 태스크" 목록을 가진다.
  - 하위 태스크는 "상위 기반 태스크: CLE2-9"를 가진다.

## 생성 순서 제안
1. `CLE2-10` 정합성 린트
2. `CLE2-11` Vision QA
3. `CLE2-12` Episode Workspace

## 비고
- 정합성 린트와 Vision QA는 둘 다 품질 관리이지만, 전자는 규칙 점검이고 후자는 결과 해석/승인 흐름이므로 분리하는 편이 맞다.
- 이후 실제 GitHub 이슈를 만들 때는 본 문서를 초기 템플릿으로 삼아도 된다.
