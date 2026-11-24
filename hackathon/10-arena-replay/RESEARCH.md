# RESEARCH — 아레나 리플레이 뷰어

## 참고자료
1. View Transitions API (MDN) — https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
   - DOM 변화 전후를 브라우저가 자동 크로스페이드/이동 애니메이션으로 연결. 기존 FLIP 직접 구현 없이 순위 재배치 애니메이션 가능
2. FLIP 기법 (aerotwist "FLIP your animations") — https://aerotwist.com/blog/flip-your-animations/
   - First-Last-Invert-Play의 원조 패턴. View Transitions는 이것의 브라우저 내장화 — 어떤 점이 단순해지는지 비교 기준으로 참고

## 조사 요약 한 줄
베낄 것: FLIP의 "이전/이후 위치 차이로 애니메이션" 아이디어. 다르게 할 것: 수동 계산 대신 View Transitions API(크루 미사용 기술)에 위임하고, 경기 데이터(09 아레나 실결과 JSON)에 바로 붙인다.

## 새 기술 (도전 규칙)
- View Transitions API — 크루 전체에서 첫 사용 (grep 확인: 다른 트랙에 사용 없음)
