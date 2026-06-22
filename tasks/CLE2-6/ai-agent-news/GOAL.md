# GOAL — AI 에이전트 뉴스 수집 시스템

## 목표
최신 AI 에이전트 관련 뉴스를 에이전트가 자체 판단하여 수집하고, 번역·심층 분석을 거쳐 GitHub 리포에 체계적으로 정리하며, 관리 웹앱으로 조회·관리할 수 있는 시스템을 구축한다.

## 성공 기준 (Definition of Done)
- [ ] 새로운 GitHub 리포(ai-agent-news)가 생성되어 있다
- [ ] team-memory context/wiki + Karpathy LLM Wiki 구조로 정리된다
- [ ] 대구루/레노버 모두 뉴스 수집 요청을 처리할 수 있다
- [ ] 수집된 뉴스에 번역 및 심층 분석이 포함된다
- [ ] GitHub Pages 관리 웹앱에서 뉴스 조회 및 관리가 가능하다
- [ ] 요청 시 on-demand로 수집이 실행된다

## 범위
### 포함 (In Scope)
- 새 리포(ai-agent-news) 생성 및 구조 설계
- LLM Wiki 구조 설계 (context/records, context/wiki)
- 뉴스 수집 → 번역 → 심층 분석 파이프라인
- OpenClaw 스킬화 (재사용 가능)
- 관리 웹앱 (뉴스 리스트, 상세, 필터, 검색)
- GitHub Pages 배포
- 대구루/레노버 양쪽 수집 지원

### 제외 (Out of Scope)
- 자동 주기 수집 (초기 버전은 on-demand만)
- 댓글/소셜 기능
- 뉴스레이트 자동 발송
- 유료 API 구독

## 관련 이슈
- GitHub Issue: #15
- CLE2-ID: 6

## 담당자
- 대구루 (수집 파이프라인, 웹앱)
- 레노버 (수집 파이프라인, 분석)
