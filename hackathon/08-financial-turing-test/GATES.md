# Gates: 08 금융 튜링 테스트
- [ ] G1: 배포된 페이지가 기기 내 실브라우저(moli)에서 오류 없이 로드된다
  CHECK: $HOME/.openclaw/workspace/scripts/l2-check https://daegu-agent-crew.github.io/creative-loop-engineering2/hackathon/08-financial-turing-test/
  EXPECT: errors: 0
  EVIDENCE:
- [ ] G2: 게임 로직 단위 검사 — 가짜 차트는 진짜와 같은 캔들 집합의 순열(정렬 비교 일치), 이항검정 p값(7/10 → 0.171875, 10/10 → 0.0009765625), 기계 판별기 = |수익률| 1시차 자기상관 큰 쪽
  CHECK: node hackathon/08-financial-turing-test/test/ftt.test.mjs
  EXPECT: PASS
  EVIDENCE:
- [ ] G3: 실브라우저 스모크 — 차트 2개 캔버스 렌더, 10판(정답 7·오답 3) → 점수 7·p값 17.2% 표시, 가짜 기울기 이벤트(gamma -40°)로 A 선택, 진동 API 호출, 콘솔 오류 0
  CHECK: GitHub Actions hackathon-smoke (Pages 배포 후 자동) — hackathon/smoke/08-ftt.mjs
  EXPECT: success
  EVIDENCE:
- [ ] G4: 조사 기록 첨부 (참고자료 2건 이상 + 베낄 것/다르게 할 것) — 시즌 1 준비 의무
  CHECK: RESEARCH.md 존재 + 게시판 출사표 FB-20261010-02
  EXPECT: 링크 4건 · 베낄 것/다르게 할 것 절
  EVIDENCE:

## 상태: 진행 중

## 마감
- 시즌 1 제출: 2026-10-10(토) 21:00 — ALL MET 전 완료 보고 금지
