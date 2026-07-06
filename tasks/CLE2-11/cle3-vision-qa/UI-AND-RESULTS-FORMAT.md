# UI AND RESULTS FORMAT — CLE3 Vision QA / 결과 검수 시스템

## 목적
- CLE2 UI와 `three-body-comic` 회차 결과 문서에 Vision QA 결과를 어떤 형태로 남길지 정리한다.
- lint와 Vision QA가 같은 내용을 중복 기록하지 않도록 역할을 분리한다.

## CLE2 UI 노출 기준

### 1. 태스크 상세 카드 요약
- 위치:
  - `CLE2-11` 태스크 상세의 goal/status 영역 하단
- 보여줄 항목:
  - 최근 검수 대상 패널 ID
  - 승인 상태 분포 (`approved`, `conditional`, `revision-required`, `rejected`)
  - 최근 회차의 평균 점수
  - 자주 발생한 카테고리 (`clarity`, `composition`, `emotion`, `intent`)

### 2. 회차별 QA 요약 리스트
- 위치:
  - 향후 `CLE2-12 Episode Workspace` 또는 `CLE2-11` 상세 확장 섹션
- 보여줄 항목:
  - Episode ID
  - 검수 완료 패널 수 / 전체 패널 수
  - `approved` 비율
  - `conditional` 이상 남은 패널 수
  - 반복된 주요 피드백 카테고리

### 3. 패널 단위 QA 행
- 위치:
  - 향후 패널 리스트/작업 뷰
- 보여줄 항목:
  - `panelId`
  - `selectedResult`
  - 총점
  - 승인 상태
  - 핵심 한 줄 피드백

## CLE2 UI 요약 데이터 포맷 예시

```json
{
  "episodeId": "EP002",
  "qaSummary": {
    "totalPanels": 12,
    "reviewedPanels": 9,
    "approved": 4,
    "conditional": 3,
    "revisionRequired": 2,
    "rejected": 0,
    "averageScore": 7.1,
    "topCategories": ["clarity", "emotion"]
  }
}
```

## episodes/EPxxx/results.md 반영 형식

### 권장 섹션명
- `## Vision QA Summary`

### 권장 항목
- 회차 전체 승인 상태 분포
- 평균 점수
- 가장 많이 나온 피드백 카테고리
- 다음 회차 또는 수정 라운드에 반영할 핵심 3개

### 예시 포맷

```md
## Vision QA Summary

- Reviewed Panels: 9/12
- Approved: 4
- Conditional: 3
- Revision Required: 2
- Rejected: 0
- Average Score: 7.1 / 10
- Frequent Categories: clarity, emotion

### Key Follow-ups
- EP002 P05: 배경 대비를 낮추고 얼굴 주변 집중도 강화
- EP002 P07: 감정 전달이 의도보다 약해 표정/시선 수정 필요
- EP002 P09: 다음 패널과의 연결 흐름이 끊겨 composition 재조정 필요
```

## 패널 단위 저장 기준
- 권장 위치:
  - `episodes/EPxxx/panels/Pyy/vision-qa.json`
  - 필요 시 사람이 읽기 쉬운 `vision-qa.md` 병행
- 최소 포함 필드:
  - `selectedResult`
  - `score`
  - `status`
  - `notes`
  - `reviewedAt`
  - `reviewer`

## lint와 중복 기록 최소화 규칙
- lint는 규칙 위반과 메타데이터 누락을 기록한다.
- Vision QA는 장면 전달력과 승인 판단만 기록한다.
- 같은 문제를 두 시스템 모두에 쓰지 않는다:
  - 메타데이터 누락 -> lint
  - 시선 흐름 약함 -> Vision QA
  - 캐릭터 외형 붕괴 -> lint
  - 감정이 약하게 읽힘 -> Vision QA

## handoff 메모 규칙
- Vision QA 시작 시 lint summary 전체를 복사하지 않는다.
- 다음 3가지만 요약 참조한다:
  - 잔여 `major` 개수
  - unresolved finding 존재 여부
  - selectedResult 확정 여부

## CLE2-12와의 연결
- `CLE2-11`은 QA 기준과 결과 포맷을 정의한다.
- `CLE2-12`는 이 결과를 Episode Workspace 화면에 어떤 정보 구조로 배치할지 다룬다.
