# PLAN — AI 에이전트 뉴스 수집 시스템

## 실행 계획

### Phase 1: 리포 구조 & LLM Wiki 설계
- **담당**: 대구루
- **입력**: 이슈 #15, team-memory 구조, Karpathy LLM Wiki 모델
- **출력**: ai-agent-news 리포 생성, context/ 구조 확정
- **세부**:
  - GitHub 리포 `Daegu-Agent-Crew/ai-agent-news` 생성
  - `context/records/` — 원본 수집 뉴스 (링크, 원문, 메타데이터)
  - `context/wiki/` — 주제별 컴파일된 위키 (LLM이 정리)
  - `context/registry/` — 소스/태그 레지스트리
  - 3계층 구조: 데이터 소스(원본) → 위키 계층(요약/연결) → 규칙(스키마)
  - README.md 작성

### Phase 2: 수집 → 번역 → 심층 분석 파이프라인
- **담당**: 대구루, 레노버
- **입력**: Phase 1 구조
- **출력**: OpenClaw 스킬 (ai-news-collector)
- **세부**:
  - 웹 검색으로 최신 AI 에이전트 뉴스 탐색
  - 기사 원문 fetch → 핵심 요약
  - 한국어 번역 (핵심 내용 위주)
  - 심층 분석: 기술 의미, 업계 영향, 관련 프로젝트 연결
  - 구조화 마크다운 생성 (메타데이터 + 본문 + 분석)
  - context/records/에 자동 저장
  - 팀원이 스킬 트리거로 수집 요청 가능

### Phase 3: LLM Wiki 컴파일
- **담당**: 대구루
- **입력**: Phase 2 수집된 records
- **출력**: context/wiki/ 주제별 컴파일 문서
- **세부**:
  - 주제별 분류 (예: 프레임워크, 모델, 도구, 산업 동향)
  - 중복 제거 및 교차 참조 연결
  - 마크다운 wiki 링크로 문서 간 연결
  - 주간/월간 위키 컴파일 스크립트

### Phase 4: 관리 웹앱 구현
- **담당**: 대구루
- **입력**: Phase 1-3 데이터 구조
- **출력**: GitHub Pages 웹앱
- **세부**:
  - Vanilla JS SPA (CLE2 패턴 재사용)
  - 뉴스 리스트 (필터: 날짜, 주제, 소스, 에이전트)
  - 뉴스 상세 (원문 링크, 번역, 분석, 관련 뉴스)
  - 위키 뷰어 (주제별 컴파일 문서)
  - 검색 기능
  - 반응형 디자인

### Phase 5: 통합 & 배포
- **담당**: 대구루
- **입력**: Phase 1-4 완성
- **출력**: 배포된 시스템, CLE2 대시보드 연동
- **세부**:
  - GitHub Pages 배포
  - CLE2 웹앱에 CLE2-6 task 데이터 추가
  - team-memory registry 등록
  - 스킬 문서 작성
  - 테스트 및 검증

## 의존성
- OpenClaw web_search / web_fetch 도구
- team-memory 구조 참조
- GitHub Pages

## 리스크
- 뉴스 품질 균일화 → 에이전트별 분석 품질 차이 가능성, 템플릿으로 완화
- 수집 범위 과다 → 초기에는 AI 에이전트 주제로 한정
- 저작권 → 요약+분석 위주, 원문 링크 참조 방식
