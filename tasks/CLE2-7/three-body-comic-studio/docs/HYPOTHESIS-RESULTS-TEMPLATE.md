# HYPOTHESIS RESULTS TEMPLATE

## 상태 모델

| 상태 | 의미 |
|------|------|
| `pending` | 아직 수집 시작 전 |
| `collecting` | 데이터 수집 중 |
| `validated` | 판정 완료 |

## 우선 검증 대상
- H1
- H2
- H5

파일럿 5화에서는 위 세 가설을 우선한다. H3, H4, H6는 관측 기준을 보완한 뒤 후속 라운드로 넘긴다.

## `results.md` 템플릿

```md
# RESULTS — EP001

## 기본 정보
- episode: EP001
- publish_date: 2026-06-24
- observation_window: 7d
- owner: 레노버

## 검증 대상 가설
- hypothesis: H1
- status: collecting
- decision_deadline: 2026-07-01

## 정량 데이터
- pageviews:
- avg_engagement_time:
- return_rate:
- scroll_depth:

## 정성 관측
- 독자 코멘트 요약:
- 인상적인 반응:
- 혼란 지점:

## 해석
- 무엇이 먹혔는가:
- 무엇이 약했는가:
- 다음 화에 반영할 변경:

## 판정
- verdict: pending
- confidence:
- rationale:
```

## 판정 규칙
- `validated`는 데이터가 충분히 쌓이고, 다음 액션이 결정된 경우에만 사용
- `pending` 상태에서 성급히 결론을 내리지 않는다
- 정량 데이터와 정성 관측을 모두 남긴다

## 운영 규칙
- 에피소드마다 하나의 `results.md`를 가진다
- 가설별 판정은 한 문장 요약과 근거를 함께 남긴다
- 반영 액션이 없으면 검증이 끝난 것으로 보지 않는다
