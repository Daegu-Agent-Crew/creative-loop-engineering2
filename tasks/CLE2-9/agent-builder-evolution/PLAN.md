# PLAN — agent_builder_public, CLE2 구조 흡수하여 커뮤니티 중심 레포로 진화

## 실행 계획

### Phase 1: 태스크 관리 구조 도입
- **담당**: 대구루
- **입력**: CLE2 tasks/ 구조, Issue #20, starter-kit 기존 문서
- **출력**: agent_builder_public tasks/ 폴더 + 템플릿
- **세부**:
  - `tasks/` 폴더 생성 + `_template/` (GOAL/PLAN/STATUS/TESTS 표준 템플릿)
  - 스터디 미션 = 태스크 매핑 규칙 정의 (AB-1, AB-2... 네이밍)
  - 기존 starter-kit 문서를 태스크 형태로 재구성
  - CLE2 Tasks 대시보드 UI 패턴 참고하여 진행률 트래킹 설계

### Phase 2: team-memory 통합
- **담당**: 대구루
- **입력**: team-memory-kit CLI, CLE2 context/ 구조
- **출력**: agent_builder memory 파이프라인
- **세부**:
  - `context/records/` + `context/registry/` 디렉토리 구조 도입
  - 스터디 기록(미션 제출, 분석 리포트) → memory record 자동 저장 파이프라인 설계
  - team-memory-kit의 `memory-ingest` / `memory-wiki` CLI 연동 가이드 작성
  - 위키 자동 컴파일 규칙 정의 (주차별/멤버별/주제별)

### Phase 3: SPA 대시보드 (CLE2 스타일)
- **담당**: 대구루
- **입력**: CLE2 app.js + index.html, 커뮤니티 요구사항
- **출력**: agent_builder 전용 SPA 대시보드
- **세부**:
  - CLE2 SPA 코드를 기반으로 커뮤니티 맞춤 분기
  - 페이지 구성:
    - 홈: 스터디 현황 (전체 미션, 진행 중, 완료, 평균 진행률)
    - 미션: 주차별 미션 리스트 + 필터/검색
    - 등록: 새 미션/과제 등록 폼
    - 멤버: 팀원별 제출 현황 + 역할
    - 위키: 스터디 노트 → 위키 자동 정리
    - 설정: GitHub 연동, Obsidian vault 경로
  - GitHub Pages 배포 설정

### Phase 4: 이슈 기반 운영 활성화
- **담당**: 대구루
- **입력**: CLE2 이슈 운영 패턴, starter-kit 미션 구조
- **출력**: 활성화된 이슈 트래커
- **세부**:
  - 첫 이슈들 생성: "Week 1 미션", "온보딩 가이드", "Astro 테마 개선"
  - 이슈 템플릿 (.github/ISSUE_TEMPLATE/) 작성 — 미션 제출용, 개선 제안용
  - README를 "살아있는 예제"로 개선 (이 레포 자체가 CLE2-style로 운영됨을 명시)

### Phase 5: Discord 연동
- **담당**: 대구루
- **입력**: CLE2 Discord 연동 패턴, webhook 구조
- **출력**: 커뮤니티 피드백 루프
- **세부**:
  - 미션 제출 → Discord 알림 자동화
  - `/analyze` 결과를 Discord에 자동 포스팅
  - 피드백 루프: Discord 반응 → 이슈 댓글 → 태스크 개선

## 의존성
- CLE2 SPA 소스코드 (app.js, index.html, styles.css)
- team-memory-kit CLI 및 템플릿
- agent_builder_public 기존 starter-kit 구조
- Discord webhook URL 및 권한

## 리스크
- CLE2 코드를 그대로 복사하면 커뮤니티 용도 특화가 안 됨 — 분기 시점부터 차별화 필요
- team-memory-kit 의존성이 무거우면 starter-kit 단순성이 훼손될 수 있음
- Discord 연동은 권한/계정 변수가 존재함
