# Gates: 06 에이전트 심음 — 귀로 찾는 장애
- [ ] G1: 배포된 페이지가 기기 내 실브라우저(moli)에서 오류 없이 로드되고 재생 문이 뜬다
  CHECK: $HOME/.openclaw/workspace/scripts/l2-check https://daegu-agent-crew.github.io/creative-loop-engineering2/hackathon/06-agent-sonification/
  EXPECT: errors: 0
  EVIDENCE: pending
- [ ] G2: 스케줄러가 예약한 음표 로그(예약 시각·개수·음고)가 시나리오별 기대값과 일치한다 — 정상 N개 / 단일 지연 리듬 변형 / 침묵 구간 0개
  CHECK: (빌드 시 확정 — jsdom AudioContext 스텁 + 예약 로그 숫자 검사)
  EXPECT: (빌드 시 확정)
  EVIDENCE: pending
- [ ] G3: 블라인드 청음 테스트 3종(정상/한 작업만 지연/스케줄러 침묵)을 화면 없이 소리만으로 구별할 수 있다 (사람 실청 — 회장님·크루)
  EVIDENCE: pending

## 마감
- 첫 판 제출: 2026-10-07(수) 21:00 — ALL MET 전 완료 보고 금지
- 제출 카드에 RESEARCH.md(조사 기록) 첨부 필수 (SEASON-1.md 준비 의무)
