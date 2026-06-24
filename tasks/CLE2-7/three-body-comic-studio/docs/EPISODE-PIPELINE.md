# EPISODE PIPELINE — Three Body Comic Studio

## 에피소드 단계

| 단계 | 상태 키 | 설명 | 완료 기준 |
|------|---------|------|-----------|
| 대본 | `script` | 스토리 비트, 대사, 장면 구성이 확정된 상태 | 핵심 비트와 대사가 리뷰 가능 |
| 콘티 | `storyboard` | 장면 구성과 패널 흐름을 도식화한 상태 | 패널 순서와 구도 의도가 보임 |
| 패널 생성 | `render` | 실제 이미지 생성 시도를 수행하는 상태 | 각 패널에 1개 이상 후보 결과 존재 |
| 리뷰 | `review` | 패널/에피소드 수준 리뷰와 수정 판단 | 수정 여부와 선택 결과가 남음 |
| 배포 | `publish` | 공개 가능한 형태로 편집/업로드 | 링크 또는 배포 대상이 존재 |
| 관측 | `observe` | 반응과 지표를 수집하는 상태 | results 기록이 시작됨 |

## 패널 상태 모델

| 상태 | 의미 | 다음 상태 |
|------|------|-----------|
| `not-started` | 아직 작업 시작 전 | `generating` |
| `generating` | 프롬프트 실행 중, 후보 생성 중 | `review-queue`, `failed` |
| `review-queue` | 후보가 준비되어 검토 대기 | `revision`, `approved` |
| `revision` | 수정 요청 반영 중 | `generating`, `approved` |
| `approved` | 최종 사용 결정 | 없음 |
| `failed` | 도구 오류 또는 품질 불충분 | `generating`, `abandoned` |
| `abandoned` | 이번 라운드에서 제외 | 없음 |

## 패널 메타데이터 초안

```md
# PANEL — EP001-S02-P03

- episode: EP001
- scene: S02
- panel: P03
- owner: normalkim
- status: review-queue
- style-pack: watercolor-v3
- prompt-version: pv2
- attempts: 3
- selected-asset: attempt-03.png
- blockers:
  - character-face drift
```

## 작업 분배 규칙

### 에피소드 단위
- 회차 전체 흐름을 정리할 때 사용
- 대본, 콘티, 가설 연결의 소유권을 명확히 할 때 유리

### 패널 단위
- 이미지 생성, 스타일 수정, 선택 작업에 사용
- 여러 에이전트 또는 팀원이 병렬 처리할 수 있음

## 권장 폴더 구조

```text
episodes/
  EP001/
    script.md
    storyboard.md
    panels/
      EP001-S01-P01.md
      EP001-S01-P02.md
    review.md
    results.md
```

## 운영 규칙
- 한 패널에 대해 선택된 결과는 하나만 `approved`로 남긴다.
- 실패는 숨기지 않고 `failed`로 기록해 재시도 근거를 남긴다.
- 에피소드 단계는 패널 묶음의 평균 상태가 아니라 명시적 리뷰 결정으로 올린다.
