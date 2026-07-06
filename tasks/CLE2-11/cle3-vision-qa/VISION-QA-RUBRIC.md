# VISION QA RUBRIC — CLE3 Vision QA / 결과 검수 시스템

## 목적
- lint를 통과한 패널 후보가 실제로 장면 의도, 감정 전달, 시선 흐름, 정보 명확성을 만족하는지 사람 중심으로 검수한다.
- Vision QA는 규칙 위반 탐지보다 "이 컷이 독자에게 어떻게 읽히는가"를 평가하는 단계다.

## 입력 조건
- `CLE2-10` lint 결과가 존재한다.
- `selectedResult` 후보가 최소 1개 정리되어 있다.
- `panelIntent`, `camera`, `composition`, `dialogue`, `subtext`가 준비되어 있다.

## lint와의 경계
- lint는 정합성 위반을 잡는다.
- Vision QA는 정합성 통과 이후에도 남는 전달력, 감정선, 연출 적합성을 검수한다.
- `critical` 또는 다수 `major`가 남은 상태는 Vision QA 입력으로 받지 않는다.

## 평가 축

### 1. Intent Fidelity
- 질문:
  - 이 패널이 `panelIntent`를 실제로 전달하는가?
  - 장면의 핵심 감정이나 정보가 한 컷 안에서 읽히는가?
- 실패 예:
  - 의도는 공포인데 결과는 단순 정보 컷처럼 보임
  - 의도는 압도감인데 구도상 평면적이라 무게가 전달되지 않음

### 2. Clarity
- 질문:
  - 독자가 무엇을 먼저 봐야 하는지 명확한가?
  - 누가 무엇을 하고 있는지 혼동 없이 읽히는가?
- 실패 예:
  - 시선 유도가 분산됨
  - 대사/표정/배경 정보가 동시에 경쟁함

### 3. Composition
- 질문:
  - 프레이밍, 거리감, 피사체 배치가 장면 목적에 맞는가?
  - 컷 내부 리듬이 storyboard 의도와 충돌하지 않는가?
- 실패 예:
  - 중요한 인물이 지나치게 작거나 가려짐
  - 클로즈업이어야 하는 장면이 롱샷처럼 느껴짐

### 4. Emotion
- 질문:
  - 인물 감정과 장면 정서가 설득력 있게 전달되는가?
  - 삼체 특유의 차가움, 경외감, 지적 공포가 필요한 경우 살아 있는가?
- 실패 예:
  - 표정은 평온한데 상황은 극단적 긴장을 요구함
  - 장면의 정서가 지나치게 가볍거나 과장됨

### 5. Readiness
- 질문:
  - 이 컷을 다음 단계로 넘겨도 되는가?
  - 수정 비용 대비 현재 후보가 충분히 강한가?
- 실패 예:
  - 기술적으로는 무난하지만 대표 컷으로 선택하기엔 약함
  - 다음 패널과 연결했을 때 흐름이 끊김

## 평가 점수
- 각 축은 0~2점으로 기록
  - `0`: 실패
  - `1`: 조건부 통과
  - `2`: 명확히 통과
- 총점 범위: 0~10

## 승인 상태 모델
- `approved`
  - 총점 8점 이상
  - `Intent Fidelity`, `Clarity`가 모두 2점
  - 치명적 우려 없음
- `conditional`
  - 총점 6~7점
  - 다음 라운드 전에 반영할 수정 요청이 명확함
- `revision-required`
  - 총점 4~5점
  - 구도, 감정, 시선 흐름 중 하나 이상이 부족함
- `rejected`
  - 총점 0~3점
  - 장면 목적 전달 실패 또는 재생성 필요

## ReviewNote 연결 규칙
- Vision QA 결과는 `ReviewNote`로 남긴다.
- 권장 카테고리:
  - `clarity`
  - `composition`
  - `emotion`
  - 필요 시 `intent`
- reviewer 값:
  - 사람 검수자 이름
  - 에이전트 보조 검수면 `CLE3-VISION-QA`

## 출력 포맷 예시

```json
{
  "targetType": "panel",
  "targetId": "EP002/SC003/P05",
  "selectedResult": "panels/EP002/P05/v3.png",
  "score": {
    "intentFidelity": 2,
    "clarity": 1,
    "composition": 2,
    "emotion": 1,
    "readiness": 1,
    "total": 7
  },
  "status": "conditional",
  "notes": [
    {
      "category": "clarity",
      "severity": "major",
      "comment": "배경 정보가 전면으로 튀어 인물 시선이 약해짐",
      "actionRequired": "배경 대비를 낮추고 얼굴 주변 밝기 집중"
    },
    {
      "category": "emotion",
      "severity": "minor",
      "comment": "의도한 지적 공포보다 당혹감 쪽으로 읽힘",
      "actionRequired": "표정 미세 조정 또는 시선 각도 보정"
    }
  ]
}
```

## three-body-comic 연결 기준
- 패널 단위 QA 결과:
  - `episodes/EPxxx/panels/Pyy/vision-qa.json`
  - 또는 `vision-qa.md`
- 회차 단위 요약:
  - `episodes/EPxxx/results.md` 안의 `Vision QA Summary` 섹션

## lint -> Vision QA handoff
- 입력 허용:
  - `critical` 없음
  - `major` 1건 이하
  - 메타데이터 누락 없음
- 입력 보류:
  - `critical` 있음
  - `major` 2건 이상
  - `selectedResult` 미확정

## 권장 운영 흐름
1. lint 결과 확인
2. handoff 기준 통과 여부 판단
3. selectedResult 후보 검수
4. 점수/상태/ReviewNote 기록
5. `approved` 또는 `conditional`이면 회차 결과에 반영
6. `revision-required` 또는 `rejected`이면 생성/수정 라운드로 복귀
