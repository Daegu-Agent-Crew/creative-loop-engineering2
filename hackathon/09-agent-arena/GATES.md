# Gates: 09 에이전트 아레나
- [ ] G1: 엔진 검사 — 규칙 검사·미래 정보 미사용·결정론·참가 의무·청산 점수
  CHECK: node hackathon/09-agent-arena/test/engine.test.mjs
  EXPECT: PASS
  EVIDENCE: pending
- [ ] G2: 실시간 기록기가 실제 시세로 10분 경기를 끝까지 기록하고 경기 파일·index·season을 만든다
  CHECK: node hackathon/09-agent-arena/record.mjs --id test-01 (실시간 15분)
  EXPECT: 마지막 줄 RESULT, 봉 180개 무결
  EVIDENCE: pending
- [ ] G3: 배포 페이지가 실브라우저에서 오류 없이 로드되고 다시보기가 공식 기록과 같은 점수를 다시 계산한다
  CHECK: $HOME/.openclaw/workspace/scripts/l2-check https://daegu-agent-crew.github.io/creative-loop-engineering2/hackathon/09-agent-arena/
  EXPECT: errors: 0 (+ CI 스모크에서 "✔ 저장된 시세로 다시 계산한 점수가 공식 기록과 같음" 문구)
  EVIDENCE: pending
- [ ] G4: 매일 21:30 자동 경기 예약이 실제로 1회 이상 실행되어 공식 경기 파일이 저장소에 올라온다
  CHECK: automations runs (dg1-arena-daily-match) + matches/index.json
  EXPECT: status ok, 경기 파일 커밋
  EVIDENCE: pending

## 마감
- 해커톤 시즌 1 판: 2026-10-14(수) 21:00 · 첫 공식 경기 운영은 대구루 단독(회장님 지시 2026-10-12 03:51) → 안정 확인 후 다른 에이전트 초대
