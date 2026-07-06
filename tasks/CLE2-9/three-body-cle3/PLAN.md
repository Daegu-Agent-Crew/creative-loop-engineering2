# PLAN — 삼체 연재 만화 창작 시스템 (CLE3)

## 실행 계획

### Phase 1: 현재 자산 분석 및 문제 재정의
- **담당**: 대구루
- **입력**: Issue #24, `three-body-comic`, CLE2-7 문서, 외부 CLE3 컨설팅 리서치 4종
- **출력**: CLE3가 해결할 문제 목록과 기준 구조
- **세부**:
  - `three-body-comic`의 source/publish/experiment 구조 재점검
  - CLE2-7이 이미 다룬 운영 레이어와 새로 필요한 창작 레이어 분리
  - "자동 출력"보다 중요한 중간 협업 단계를 먼저 목록화
  - 외부 리서치 문서의 권고안을 "즉시 반영 / 후속 검토 / 보류"로 분류

### Phase 2: CLE3 시스템 경계 및 핵심 객체 정의
- **담당**: 대구루
- **입력**: Phase 1 분석 결과
- **출력**: CLE3 객체 모델과 책임 분리
- **세부**:
  - Story, Style Pack, Character Sheet, Episode, Scene, Panel, Review Note, Release, Results 객체 정의
  - 삼체 매력 원리(TB)와 흥행 만화 구조 패턴(HM)을 각 객체의 필수 필드와 검토 규칙에 직접 매핑
  - `creative-loop-engineering2`, `three-body-comic`, Discord, GitHub Pages의 책임 경계 명시
  - 운영 데이터와 실제 제작 산출물의 이동 경로 정의

### Phase 3: 협업 루프 설계
- **담당**: 레노버
- **입력**: 5화 파일럿 구조, 이미지 생성/리뷰 흐름
- **출력**: 사용자 + AI 협업 루프
- **세부**:
  - 스토리 설계 → 화풍/캐릭터 기준 확정 → 패널 생성 → 교정 → 결과물 선택 흐름 정의
  - 사람 승인 포인트와 AI 에이전트 handoff 포인트 분리
  - Deliverable과 feedback의 연결 규칙 강화

### Phase 4: 통합 연동 구조 정의
- **담당**: 대구루
- **입력**: GitHub, Pages, Discord, OpenClaw, Codex 현재 사용 방식
- **출력**: CLE3 연동 다이어그램과 운영 규칙
- **세부**:
  - GitHub Issue → CLE2 task → `three-body-comic` 산출물 연결 구조 명시
  - Pages 공개 전/후 이벤트와 Discord 알림 기준 정리
  - OpenClaw와 Codex를 어떤 단계에서 어떻게 호출하는지 재정리

### Phase 5: CLE2 반영 및 후속 구현 이슈 분해
- **담당**: 대구루
- **입력**: Phase 1-4 결과
- **출력**: CLE2-9 대시보드 반영, 후속 구현 이슈 목록
- **세부**:
  - CLE2 대시보드에 CLE2-9 카드/상세 반영
  - DECISIONS.md에 핵심 기준 누적
  - 구현 이슈를 "정합성 린트", "Vision QA", "Episode Workspace" 등으로 분할
  - 각 후속 이슈가 어떤 CLE3 객체를 직접 다루는지 매핑
  - 상위 설계 태스크(CLE2-9)와 하위 구현 태스크 간 링크 규칙 정의

## 의존성
- `three-body-comic` 저장소 구조와 Pages 운영 상태
- CLE2-7 STUDIO 보드 및 관련 설계 문서
- OpenClaw/Codex 현재 실행 환경
- `tasks/CLE2-9/three-body-cle3/research/` 아래 외부 컨설팅 문서

## 리스크
- CLE2-7과 CLE3의 경계를 분명히 하지 않으면 문서와 구현이 다시 섞일 수 있음
- "자동 생성" 기대가 앞서가면 실제 협업 단계를 건너뛰는 설계가 될 수 있음
- GitHub Pages 정적 구조만으로 해결할 수 없는 운영 요구가 뒤늦게 드러날 수 있음
