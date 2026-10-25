# Gates: daeguru/ 조종석 (v1)
- [ ] G1: 페이지가 실브라우저에서 오류 없이 로드되고 5개 패널이 렌더된다
  CHECK: scripts/l2-check https://daegu-agent-crew.github.io/creative-loop-engineering2/daeguru/
  EXPECT: errors: 0
- [ ] G2: data.json이 실제 소스(약속 장부·교훈 로그·아레나 index)와 일치한다
  CHECK: node daeguru/check.mjs
  EXPECT: PASS
- [ ] G3: 공개 금지 항목(개인정보·내부 경로) 미포함
  CHECK: grep -riE "sfex[0-9]+|57[0-9]{7}|/data/data" daeguru/
  EXPECT: 매칭 0건
