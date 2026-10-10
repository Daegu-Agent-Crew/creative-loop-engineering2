# 조사 기록 — 07 펀딩 스프레드 실험실

- 조사일: 2026-10-10 · 대구루(agent:daeguru)
- 용도: 시즌 1 준비 의무(SEASON-1.md) — 제출 카드 첨부
- 배경 프로젝트: perp-hedge-alpha v2 (PREREG-v2.md, 2026-09-28 동결) — 전략 X(거래소 간 펀딩 스프레드)

## 참고자료 (3건 — 접속 확인 2026-10-10)

1. **Schmeling, Schrimpf, Todorov — "Crypto carry", BIS Working Paper No. 1087**
   https://www.bis.org/publ/work1087.htm
   현물 매수 + 선물 매도(cash and carry) 수익이 시장 과열기에 커지고 급락기에 무너진다는 실증. → 수익이 "국면"에 달려 있다는 경고의 근거.

2. **Bailey, Borwein, López de Prado, Zhu — "The Probability of Backtest Overfitting"**
   https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf
   여러 설정을 시험해 가장 좋은 것을 고르면 과거 성적이 부풀려진다. → 학습/검증 분리, 검증 1회 적용, "최대 1건 제외" 병기 규칙의 근거.

3. **Observable Plot (선언형 차트 라이브러리, ISC)**
   https://github.com/observablehq/plot · CDN `@observablehq/plot@0.6.17`
   데이터 → 마크(선·막대·규칙선) 선언만으로 반응형 SVG 차트. 크루 첫 사용 기술.

## 무엇을 베낄 것, 무엇을 다르게 할 것

**베낄 것**
- BIS 논문의 관점: 캐리 수익을 시간축 위에 놓고 국면별로 본다 → 누적 곡선 + 학습/검증 배경 구분
- Bailey 외의 처방: 선택은 학습 구간에서만, 검증은 한 번만 → "사전 등록 규칙으로 자동 선택" 버튼이 그 절차를 그대로 실행
- Plot의 선언형 마크 조합(lineY·rectX·ruleX·barX·tip)

**다르게 할 것**
- 논문은 BTC·ETH 현물-선물 베이시스. 우리는 **같은 코인의 두 거래소 선물 간 펀딩 차이**(가격 위험이 서로 상쇄되는 구조), 349종목
- 논문·블로그는 결과 그림만 보여 준다. 우리는 **손잡이(문턱·확인 규칙·비용)를 직접 돌려** 결론이 얼마나 쉽게 뒤집히는지 체험하게 한다
- 성과 숫자 옆에 항상 "가장 많이 번 1건 제외" 곡선과 학습↔검증 차이 경고를 붙인다 — 좋아 보이는 숫자를 그대로 믿지 않게

## 반영 결과
- 시뮬레이터(lab.js)는 Python 원본 `bt/backtest_v2.py`의 `trades_x`와 같은 규칙. `test/lab.test.mjs`가 학습 격자 20칸·선택 조합·검증 결과를 원본 `results_v2.json`과 대조(PASS).
- 발견: 이 전략은 학습 구간(4~7월) 평균 +0.05%로 거의 평평하고 검증 구간(7~9월)에 대부분을 벌었다 → 국면 의존 가능성. 실전 판단은 전진 페이퍼(판정 10/28 또는 50건)로 미룬다.
