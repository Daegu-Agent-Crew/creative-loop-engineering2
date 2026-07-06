# LINT SPEC — CLE3 정합성 린트 시스템

## 목적
- CLE3의 `CharacterSheet`, `StylePack`, `Panel` 객체를 기준으로 정합성 위반을 자동 또는 반자동으로 감지한다.
- 결과는 단순 경고에 그치지 않고 `ReviewNote(category=consistency)`로 연결되어 수정 흐름에 편입되어야 한다.

## 린트 대상

### 1. CharacterSheet
- 점검 목적:
  - 캐릭터가 회차/장면/패널을 거치며 외형, 역할, 말투, 감정축을 깨지 않는지 확인
- 핵심 필드:
  - `name`
  - `role`
  - `motivation`
  - `emotionalAxis`
  - `visualTraits`
  - `speechTone`
  - `doNotBreak`

### 2. StylePack
- 점검 목적:
  - 작화 기준, 색/명암/질감/샷 언어가 장면 목적과 맞으면서도 일관성을 유지하는지 확인
- 핵심 필드:
  - `visualIntent`
  - `palette`
  - `lightingRules`
  - `shotLanguage`
  - `negativeExamples`
  - `consistencyRules`

### 3. Panel
- 점검 목적:
  - 실제 생성/선택된 컷이 의도, 메타데이터, 캐릭터/스타일 기준과 충돌하지 않는지 확인
- 핵심 필드:
  - `panelId`
  - `panelIntent`
  - `camera`
  - `composition`
  - `dialogue`
  - `subtext`
  - `imagePrompt`
  - `selectedResult`

## 린트 범주

### A. Character Consistency
- 코드 prefix: `CHAR`
- 설명:
  - 캐릭터 외형, 역할, 말투, 감정축, 금지 규칙 위반
- 예시 규칙:
  - `CHAR-001`: `visualTraits`와 다른 외형 요소가 반복적으로 관찰됨
  - `CHAR-002`: `speechTone`과 맞지 않는 대사 톤이 사용됨
  - `CHAR-003`: `doNotBreak`에 정의된 금지 요소가 패널에 등장함

### B. Style Drift
- 코드 prefix: `STYLE`
- 설명:
  - StylePack 기준과 어긋나는 색감, 명암, 질감, 구도 언어, 샷 사용
- 예시 규칙:
  - `STYLE-001`: `palette` 허용 범위를 벗어나는 색 사용
  - `STYLE-002`: `lightingRules`와 충돌하는 조명 방향/분위기
  - `STYLE-003`: `negativeExamples`에 포함된 금지 스타일 특징 감지

### C. Panel Metadata Completeness
- 코드 prefix: `PANEL`
- 설명:
  - 컷 생성/검토에 필요한 필수 메타데이터 누락
- 예시 규칙:
  - `PANEL-001`: `panelIntent` 누락
  - `PANEL-002`: `camera` 또는 `composition` 누락
  - `PANEL-003`: `selectedResult`가 없는데 검토 단계로 이동함

### D. Cross-Object Contradiction
- 코드 prefix: `CROSS`
- 설명:
  - CharacterSheet, StylePack, Panel 사이의 상호 모순
- 예시 규칙:
  - `CROSS-001`: 패널의 캐릭터 표현이 CharacterSheet와 충돌
  - `CROSS-002`: 패널 구도가 StylePack의 `shotLanguage`와 반복 충돌
  - `CROSS-003`: dialogue/subtext가 장면 목적과 맞지 않음

## 심각도 기준
- `critical`
  - 공개/승인 전에 반드시 수정해야 하는 위반
  - 예: 캐릭터 오인 가능 수준의 외형 붕괴, 핵심 금지 규칙 위반
- `major`
  - 스타일 일관성이나 장면 전달력에 큰 영향을 주는 위반
  - 예: 조명 규칙 위반, 핵심 메타데이터 누락
- `minor`
  - 수정 권장 수준이나 다음 라운드로 넘길 수 있는 위반
  - 예: 경미한 색 편차, 일부 부연 설명 부족
- `info`
  - 참고용 메모, 패턴 누적 관찰

## 입력 포맷 초안

```json
{
  "storyId": "TB-S1",
  "episodeId": "EP002",
  "sceneId": "SC003",
  "panelId": "P05",
  "characterSheets": [
    {
      "name": "Ye Wenjie",
      "visualTraits": ["short hair", "calm gaze"],
      "speechTone": "measured",
      "doNotBreak": ["cartoonish exaggeration"]
    }
  ],
  "stylePack": {
    "visualIntent": "cold cosmic dread",
    "palette": ["desaturated blue", "gray", "black"],
    "lightingRules": ["hard backlight", "low ambient fill"],
    "negativeExamples": ["warm cheerful sitcom lighting"]
  },
  "panel": {
    "panelIntent": "alienation and controlled fear",
    "camera": "medium close-up",
    "composition": "off-center subject",
    "dialogue": "We were never alone.",
    "subtext": "intellectual terror",
    "selectedResult": "panels/EP002/P05/v3.png"
  }
}
```

## 출력 포맷 초안

```json
{
  "targetType": "panel",
  "targetId": "EP002/SC003/P05",
  "summary": {
    "critical": 0,
    "major": 2,
    "minor": 1,
    "info": 0
  },
  "findings": [
    {
      "ruleId": "STYLE-002",
      "severity": "major",
      "message": "lightingRules와 다른 고채도 전면 조명 경향이 감지됨",
      "evidence": ["selectedResult=v3.png"],
      "suggestedAction": "backlight ratio를 높이고 ambient fill을 낮춘 후보 재생성"
    },
    {
      "ruleId": "PANEL-002",
      "severity": "major",
      "message": "composition 메타데이터가 누락되었음",
      "evidence": [],
      "suggestedAction": "panel composition 필드를 보완 후 재검토"
    }
  ]
}
```

## ReviewNote 변환 규칙
- 린트 결과 1건은 기본적으로 ReviewNote 1건으로 환산한다.
- 공통 매핑:
  - `targetType` -> `ReviewNote.targetType`
  - `targetId` -> `ReviewNote.targetId`
  - `severity` -> `ReviewNote.severity`
  - `message` -> `ReviewNote.comment`
  - `suggestedAction` -> `ReviewNote.actionRequired`
  - `category`는 항상 `consistency`
- reviewer 값:
  - 자동 린트면 `CLE3-LINT`
  - 사람 검토 보강이면 실제 검토자 이름

## 운영 규칙
- `critical`, `major`가 1건 이상이면 해당 패널은 Vision QA 이전에 수정 라운드로 되돌린다.
- `minor`, `info`만 있으면 Vision QA로 넘길 수 있다.
- 같은 `ruleId`가 같은 에피소드에서 반복되면 Episode 단위 개선 과제로 승격한다.
- 린트는 승인 시스템을 대체하지 않는다. 최종 승인 책임은 Vision QA에 있다.

## CLE2 / three-body-comic 연결 기준
- CLE2에서는 lint summary를 태스크/리뷰 맥락에 보여준다.
- `three-body-comic`에서는 episode/panel 산출물 옆에 lint result json 또는 md를 두는 구조가 자연스럽다.
- 초기 단계에서는 완전 자동 실행보다, 사람이 입력 구조를 채우고 lint 결과를 ReviewNote로 옮기는 반자동 흐름이 현실적이다.
