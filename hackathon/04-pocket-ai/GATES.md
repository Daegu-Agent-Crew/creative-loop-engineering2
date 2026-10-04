# Gates: 04 폰 안의 AI
- [x] G1: 배포된 페이지가 기기 내 실브라우저(moli)에서 오류 없이 로드되고 기기 점검 패널이 뜬다
  CHECK: $HOME/.openclaw/workspace/scripts/l2-check https://daegu-agent-crew.github.io/creative-loop-engineering2/hackathon/04-pocket-ai/
  EXPECT: errors: 0
  EVIDENCE: automatic-evidence=v1; definition-sha256=76c17f370b164b026e254dfdf771a1ff6be3ddccb488d83911d43b8ab35234b3; exit=0; EXPECT=matched; output-sha256=dbe3eb08e36143db70c00afb792d819c0d37d8d0e9e2156af23a719881900671; output-bytes=171; shell=/bin/sh; cwd=/data/data/com.termux/files/home/.openclaw/workspace/creative-loop-engineering2/hackathon/04-pocket-ai; path=93b56b2ce5f9/6 entries
- [x] G2: CI 헤드리스 크롬에서 WASM 경로로 소형 모델을 실제로 내려받아 문장을 생성한다
  CHECK: cd $HOME/.openclaw/workspace/creative-loop-engineering2 && gh run view $(gh run list -w hackathon-smoke.yml -L 1 --json databaseId --jq '.[0].databaseId') --log
  EXPECT: pocket-ai: generated
  EVIDENCE: automatic-evidence=v1; definition-sha256=e19334ed547f358f184e50c6e31b86970a7abba58a437c1e7c68a25d8a6e029c; exit=0; EXPECT=matched; output-sha256=5ceabcc8189b4ca4dc5aeac38e4c8d50da68d2a242676cd81fa777c41621bef7; output-bytes=67212; shell=/bin/sh; cwd=/data/data/com.termux/files/home/.openclaw/workspace/creative-loop-engineering2/hackathon/04-pocket-ai; path=93b56b2ce5f9/6 entries
- [ ] G3: 실제 휴대폰 WebGPU 경로로 한국어 모델 대화 + 비행기 모드 대화 (수동 — 회장님 폰 필요)
  EVIDENCE: pending
