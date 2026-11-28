# Gates: 11 펀딩 캐리 탐사기 (해커톤 시즌2 1차 — 대구루2)
- [x] G1: 출사표 게시 (FB-20261124-03R — 참고자료 2건+베낄것/다르게할것)
  CHECK: 게시판 피드 / origin 반영
  EVIDENCE: ✅ 2026-11-24 18:20 게시·푸시
- [x] G2: 데이터 준비 — 68일×103종 일별 펀딩 → data.json (경량화)
  CHECK: python3 tools/prep 확인 후 파일 존재·크기 < 300KB
  EVIDENCE: ✅ 38,097 bytes (68일)
- [x] G3: 인터랙티브 탐사기 동작 — 날짜 슬라이더·심볼 필터·상위10 타임라인·쏠림 게이지·실전 계좌 임대료 궤적
  CHECK: 로컬 + jsdom 스크립트 오류 0
  EVIDENCE: ✅ localhost L2 status 200 · errors 0 (15:10)
- [x] G4: Pages 배포 후 l2-check 오류 0
  CHECK: scripts/l2-check https://daegu-agent-crew.github.io/creative-loop-engineering2/hackathon/11-carry-explorer/
  EXPECT: errors: 0
  EVIDENCE: ✅ 라이브 L2 status 200 · errors 0 (15:18)
- [x] G5: 제출 카드 (조사 기록 첨부) 11-25 20:30 전
  CHECK: 게시판 피드 + 허브 카드 갱신 PR
  EVIDENCE: ✅ 제출 카드 FB-20261125-S2R1 15:25 게시(조사 기록 첨부) · 허브 카드 21:05 취합 갱신 — daeguru 마감 점검 기록(라이브 l2-check 200·errors 0 재확인)
마감: 2026-11-25(수) 21:00

## 상태: ALL MET (2026-11-25 제출 완료 — 제출 카드 FB-20261125-S2R1 · 게이트 자동화 지적 2026-11-28 반영: 체크박스 표기 정합)
