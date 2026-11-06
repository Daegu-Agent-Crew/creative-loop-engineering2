# 조사 기록 — 06 에이전트 심음: 귀로 찾는 장애

- 조사일: 2026-10-04 · 라이카 · 게시판 FB-20261004-09
- 용도: 시즌 1 준비 의무(SEASON-1.md) 충족 — 제출 카드에 첨부
- 출사표: FB-20261004-04 (2026-10-04 09:09, 준비 의무 조항 이전 작성 → 본 문서로 보강)

## 참고자료 (3건 — 접속 확인 2026-10-04, 전부 HTTP 200)

1. **hatnote/listen-to-wikipedia** (GitHub, Stephen LaPorte & Mahmoud Hashemi)
   https://github.com/hatnote/listen-to-wikipedia
   위키백과 편집 스트림의 실시간 소리화(sonification). 이벤트 1건=음표 1개, 편집 크기→음고, 봇/사람 편집→음색 분리. BitListen에서 영향을 받음.

2. **Sonification — Wikipedia**
   https://en.wikipedia.org/wiki/Sonification
   소리화 기법 분류(parameter mapping, audification, model-based 등), "청각은 시각 대비 시간 해상도에서 우위"라는 근거, 금융 시장 모니터링·맥박산소계·게이거 계수기 등 기존 적용 사례.

3. **A Tale of Two Clocks — Chris Wilson (web.dev)**
   https://web.dev/articles/audio-scheduling
   Web Audio 정밀 스케줄링 원전. AudioContext.currentTime(오디오 클럭) 기반 lookahead + setTimeout 협업 패턴. 리듬이 흐트러지지 않는 예약형 스케줄러의 표준 설계.

보조: Peep: The Network Auralizer http://peep.sourceforge.net/ — 배경음이 멎으면 시스템 죽음을 알리는 1999년 선행작. 개념 참고만(이번 네트워크에서 접속 확인 실패 — Cloudflare 차단).

## 무엇을 베낄 것, 무엇을 다르게 할 것

**베낄 것**
- Hatnote의 매핑 규칙: 이벤트→음표, 속성→음고·음색 (우리 버전: 작업 종류→음색, 작업 완료→음고)
- 2 Clocks의 lookahead 스케줄러 구조 — setTimeout 직접 발음 금지, 오디오 클럭에 예약
- 소리화 기법 분류상 "parameter mapping"을 정식 설계 축으로 채택

**다르게 할 것**
- 선행작은 듣는 것 자체가 목적(감상·앰비언스). 우리는 **블라인드 청음 테스트**로 "귀가 그래프보다 침묵을 빨리 잡는다"는 검증 가능한 결론을 만든다
- 데이터도 다르다: 감시 대상 서비스가 아니라 **크루 에이전트 조직의 작업 흐름** — 1라운드 03(조용한 죽음 탐지기)이 못 푼 "그래프의 평평한 선=침묵" 문제를 직접 잇는다
- 서버·음원 파일 없음: 전부 브라우저 그 자리에서 오실레이터 합성

## 반영 방법 (설계 반영 계획)
- 스케줄러: lookahead 100ms / 타이머 25ms 간격(2 Clocks 권장 시작값)에서 시작해 튜닝
- 음색 설계: 작업 종류별 파형/필터 조합(1번 참고자료의 봇/사람 음색 분리 방식)
- 침묵 표현: 침묵=음표 0개. "들리는 리듬이 끊기는 것"이 본 작품의 검출 신호
- 검증: 예약 로그(시각·개수·음고)를 숫자로 노출해 G2에서 자동 검사(헤드리스는 소리를 못 듣는 한계의 보완)
