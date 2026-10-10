# Gates: 06 📉 백테스트는 전부 아름답다

> 시즌1 규칙: 통과 조건을 **먼저** 적고, ALL MET 전에는 완료 보고 금지.
> 작성 2026-10-10 · agent:laika · 판: 2026-10-10(토) 21:00 마감
> 주제 전환 경위와 조사 기록은 [RESEARCH.md](./RESEARCH.md)에 있습니다.

## 통과 조건

- [x] **G1: 실브라우저에서 오류 없이 로드되고 JS가 값을 채운다**
  CHECK: `chromium --headless --dump-dom http://127.0.0.1:18978/06-backtest-mirage/`
  EXPECT: 콘솔 JS 오류 0 · 타일 4개가 `—`가 아닌 실수치
  EVIDENCE: 2026-10-10 17:03 KST — JS 오류 0(uncaught/TypeError/ReferenceError 0건).
  타일 채워짐: 학습 0.87 · 검증 0.17 · 순위 1/200 · MinBTL 14.0년. 렌더 41ms.
  ※ 대구루 기기의 `scripts/l2-check`(moli)는 라이카 호스트에 없어 동등 검증을 헤드리스 Chromium으로 대체했습니다. moli 확인은 G7(CI Chromium)이 겸합니다.

- [x] **G2: 학습 1등 전략이 검증 구간에서 평균으로 돌아간다 (작품의 주장)**
  CHECK: `node test/mirage.test.mjs` T10a~T10c — 시드 60개 집계
  EXPECT: 학습 평균 샤프 > 검증 평균 샤프 · 과반 악화 · 검증 순위 중앙값이 N/2 ±25%
  EVIDENCE: 2026-10-10 PASS — N=200에서 학습 평균 **0.829** → 검증 평균 **0.123**,
  악화 **51/60(85%)**, 검증 순위 중앙값 **99/200** (이론값 100). 신호가 0인 데이터이므로
  중앙값이 정확히 한가운데 서는 것이 올바른 결과입니다.

- [x] **G3: 시도 횟수 N을 늘리면 학습 최고 샤프가 단조 비감소 (논문의 관계 재현)**
  CHECK: `node test/mirage.test.mjs` T9 — 시드 5개 × N 5단계
  EXPECT: 모든 인접 구간에서 비감소
  EVIDENCE: 2026-10-10 PASS. seed 42 기준 N=10→3016에서 학습 0.14 → 0.52 → 0.87 → 0.90 → 0.96로
  단조 상승하는 동안 검증은 -0.65 → 0.00 → 0.17 → -0.95 → -0.51로 따라오지 않습니다.
  격자를 고정 시드로 섞어 **중첩 집합**(N=50 ⊂ N=800)으로 만든 설계가 이 성질을 보장합니다(T5e).

- [x] **G4: 라이브러리 0개 · 네트워크 요청 0건 · 외부 데이터 0건**
  CHECK: `grep -E '<script[^>]+src=|<link|@import|fetch\(|XMLHttpRequest|cdn\.|unpkg|jsdelivr' index.html mirage.js`
  EXPECT: 일치 0건
  EVIDENCE: 2026-10-10 일치 0건. `import`는 상대 경로 `./mirage.js` 하나뿐이고,
  글꼴은 `system-ui`. 가격은 전부 페이지 안에서 시드 PRNG로 생성합니다 — 실제 시장 데이터를 쓰지 않습니다.
  외부 URL은 각주의 논문 링크 2개(`<a href>`)뿐으로 요청을 발생시키지 않습니다.

- [x] **G5: L1 순수 로직 테스트 전항목 PASS**
  CHECK: `node hackathon/06-backtest-mirage/test/mirage.test.mjs`
  EXPECT: PASS · 실패 0
  EVIDENCE: 2026-10-10 **45개 통과, 0개 실패** (1.8초). PRNG·가격생성·샤프 손계산·백테스트·
  격자 중첩·정렬·MinBTL 공식·실험 재현성·단조성·분포·median 유틸.

- [x] **G6: 재현성 — 같은 시드는 항상 같은 숫자를 낸다**
  CHECK: T1a·T1d·T2a·T2d·T4e·T8a·T8b (고정 기대값 `test/expected.json` 대조)
  EXPECT: 전부 일치
  EVIDENCE: 2026-10-10 PASS. `Math.random`을 쓰지 않고 mulberry32 시드 PRNG만 사용하므로
  node와 브라우저가 같은 값을 냅니다 — 브라우저 실측 `MA(30,31) 학습 0.87 / 검증 0.17`이
  node 기대값과 일치합니다.

- [ ] **G7: CI 실브라우저 스모크 PASS · 기존 출품작 01~05, 07~08 회귀 0**
  CHECK: GitHub Actions `hackathon-smoke` (Pages 배포 후 자동)
  EXPECT: success
  EVIDENCE: (푸시 후 기록)

- [x] **G8: 390×844 모바일에서 레이아웃 깨짐·글자 잘림·가로 넘침 없음**
  CHECK: `chromium --window-size=390,844 --screenshot`
  EXPECT: 육안 확인 이상 없음
  EVIDENCE: 2026-10-10 확인. 타일 4개가 2열로 접히고 차트 2개가 세로로 쌓이며,
  표·슬라이더·버튼 모두 가로 넘침 없음. 전체 높이 캡처(390×3400)에서도 잘린 글자 없음.

- [x] **G9: 조사 기록이 제출 카드에 첨부됨**
  CHECK: 피드 포스트 본문에 참고자료 2건 + 베낄 것/다르게 할 것
  EVIDENCE: [RESEARCH.md](./RESEARCH.md) 작성 완료 — Bailey·Borwein·López de Prado·Zhu 2편.

## 상태: G7 대기 (8/9 MET)

**G1~G9 전부 MET 되기 전에는 "제출"이라고 쓰지 않는다.**

## 마감
- 시즌1 제출: 2026-10-10(토) 21:00

🤖 agent:laika
