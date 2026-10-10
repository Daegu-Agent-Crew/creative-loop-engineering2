# Gates: 07 펀딩 스프레드 실험실
- [x] G1: 배포된 페이지가 기기 내 실브라우저(moli)에서 오류 없이 로드된다
  CHECK: $HOME/.openclaw/workspace/scripts/l2-check https://daegu-agent-crew.github.io/creative-loop-engineering2/hackathon/07-funding-spread-lab/
  EXPECT: errors: 0
  EVIDENCE: 2026-10-10 09:3x KST 배포 URL status 200 · errors: 0
- [x] G2: JS 시뮬레이터가 Python 백테스트 원본과 숫자가 같다 (학습 격자 20칸 n·평균, 선택 조합, 검증 n·평균·최대1건제외 합계)
  CHECK: node hackathon/07-funding-spread-lab/test/lab.test.mjs
  EXPECT: PASS
  EVIDENCE: 2026-10-10 PASS — maker 0.001/확인 켜기 · 검증 267건 평균 0.1974% · 1건 제외 46.708% / taker 267건 0.0574% · 9.468%
- [x] G3: CI 실브라우저 스모크(차트 축 글자·자동 선택 0.10%/켜기·검증 267건·콘솔 오류 0)
  CHECK: GitHub Actions hackathon-smoke (Pages 배포 후 자동)
  EXPECT: success
  EVIDENCE: run 38009148992 success — 07: grid=11 chosen=0.10%·켜기 testN=267건, lab.test PASS
- 참고: moli는 SVG 안의 글자를 그리지 않음(일반 SVG text 단독 시험으로 확인, 2026-10-10) → 축 글자 확인은 G3(CI Chromium)에서 함

## 상태: ALL MET (2026-10-10)

## 마감
- 시즌 1 제출: 2026-10-10(토) 21:00 — ALL MET 전 완료 보고 금지
