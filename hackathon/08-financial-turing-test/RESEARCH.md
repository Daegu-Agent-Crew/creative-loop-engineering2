# 조사 기록 — 08 금융 튜링 테스트

- 조사일: 2026-10-10 · 대구루2(agent:daeguru2)
- 용도: 시즌 1 준비 의무(SEASON-1.md) — 출사표 FB-20261010-02, 제출 카드 첨부
- 연결: 회장님 우선순위(10-10) "트레이딩 전략" — "차트는 무작위라 볼 필요 없다"는 통념을 체험으로 검증

## 참고자료 (4건 — 접속 확인 2026-10-10)

1. **Hasanhodzic, Lo, Viola — "Is It Real, or Is It Randomized?: A Financial Turing Test" (2010)**
   https://arxiv.org/abs/1002.4592
   실제 수익률과 같은 수익률을 무작위로 재배열한 계열을 나란히 보여 주고 고르게 하는 온라인 게임. 매 판 즉시 정답을 알려 줬고, 참가자들은 통계적으로 유의하게(p ≤ 0.5%) 구별했다. → 이 출품작의 실험 설계 원형.

2. **TradingView Lightweight Charts™ (Apache-2.0)**
   https://github.com/tradingview/lightweight-charts · CDN `lightweight-charts@5.2.1` standalone
   HTML5 캔버스 기반 금융 차트. `createChart` + `addSeries(CandlestickSeries)`. 크루 첫 사용. 라이선스상 TradingView 표기 유지(차트 로고 기본값 + 하단 링크).

3. **MDN — DeviceOrientation 이벤트 / Vibration API**
   https://developer.mozilla.org/docs/Web/API/Window/deviceorientation_event
   `gamma`(좌우 기울기, -90~90°)로 선택 입력. iOS 13+는 `DeviceOrientationEvent.requestPermission()`을 사용자 동작 안에서 호출해야 함 → 전용 버튼. `navigator.vibrate`는 안드로이드 크롬 지원, iOS 미지원 → 없으면 조용히 생략.

4. **Binance 공개 시세 데이터 (인증 없는 klines)**
   https://data-api.binance.vision
   BTC·ETH·SOL·XRP·DOGE·BNB 일봉 2021-01-01~2026-10-09 (각 2,108개). 공개 시세라 정적 파일로 구워 넣음(`data.json`, 직전 종가 대비 bp 정수, 213KB).

## 무엇을 베낄 것, 무엇을 다르게 할 것

**베낄 것**
- 실험 설계: 진짜 vs 같은 수익률의 무작위 순열, 둘 중 하나 고르기
- 매 판 즉시 정답 공개 → 하다 보면 눈이 트이는 학습 효과
- 결과를 p값(동전 던지기 대비)으로 판정

**다르게 할 것**
- 원 실험은 수익률 선 그래프. 우리는 **일봉 캔들을 하루 단위로 통째로 섞는다** — 캔들 하나하나의 모양(꼬리·몸통)은 진짜와 완전히 같고, **순서에 숨은 정보만** 다르다. 그래서 "무엇을 보고 구별했나"가 변동성 군집과 추세로 좁혀진다.
- 마우스 대신 **폰 기울이기(0.7초 유지) + 진동 피드백**. 다음 판은 수평 복귀 후 시작(연속 오선택 방지).
- 매 판 **변동성 군집 수치(|수익률| 1일 시차 자기상관)**를 A/B 나란히 공개하고, 끝에 **같은 10판에서 기계 판별기**(그 값이 큰 쪽을 진짜로 찍는 한 줄 규칙)와 성적 비교.
- 가격축·날짜·코인 이름을 숨겨 다른 단서를 없애고, 정답 공개 때만 코인·기간을 보여 준다.

## 반영 결과
- 사전 시뮬레이션(3,000판): 창 60일 72% · 90일 78% · **120일 82%** · 180일 88% → 폰 화면 가독성과 난이도를 고려해 120일 채택.
- `test/ftt.test.mjs`(G2): 가짜가 진짜 캔들의 순열인지(500판), 시드 재현성, 이항검정 정확값(7/10 = 0.171875), 캔들 복원 범위, 자기상관 부호 검사 — PASS, 기계 판별기 81.6%.
- 해석 주의(화면에도 표기): 구별할 수 있다는 것이 곧 돈을 벌 수 있다는 뜻은 아니다. 변동성 군집은 "얼마나 움직일지"의 단서이지 "어느 쪽으로"의 단서가 아니다.
