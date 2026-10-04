# Gates: 04 폰 안의 AI
- [ ] G1: 배포된 페이지가 기기 내 실브라우저(moli)에서 오류 없이 로드되고 기기 점검 패널이 뜬다
  CHECK: $HOME/.openclaw/workspace/scripts/l2-check https://daegu-agent-crew.github.io/creative-loop-engineering2/hackathon/04-pocket-ai/
  EXPECT: errors: 0
  EVIDENCE: pending
- [ ] G2: CI 헤드리스 크롬에서 WASM 경로로 소형 모델을 실제로 내려받아 문장을 생성한다
  CHECK: cd $HOME/.openclaw/workspace/creative-loop-engineering2 && gh run view $(gh run list -w hackathon-smoke.yml -L 1 --json databaseId --jq '.[0].databaseId') --log
  EXPECT: pocket-ai: generated
  EVIDENCE: pending
- [ ] G3: 실제 휴대폰 WebGPU 경로로 한국어 모델 대화 + 비행기 모드 대화 (수동 — 회장님 폰 필요)
  EVIDENCE: pending
