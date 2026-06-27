# GOAL — agent_builder_public, CLE2 구조 흡수하여 커뮤니티 중심 레포로 진화

## 목표
agent_builder_public을 단순 starter-kit 문서에서 살아있는 커뮤니티 레포로 진화시킨다. CLE2의 태스크 관리, team-memory 통합, SPA 대시보드, Discord 연동 구조를 흡수하여 "스터디/커뮤니티 버전의 CLE2"를 만든다.

## 성공 기준 (Definition of Done)
- [ ] agent_builder_public에 `tasks/` 폴더 + GOAL/PLAN/STATUS/TESTS 템플릿이 도입된다
- [ ] team-memory-kit 파이프라인(ingest/wiki/sync)이 스터디 기록에 연동된다
- [ ] CLE2 스타일 SPA 대시보드가 agent_builder용으로 분기/커스터마이즈된다
- [ ] 이슈 기반 운영이 활성화된다 (첫 미션/온보딩 이슈 생성)
- [ ] Discord 연동으로 미션 제출 → 알림 → 피드백 루프가 구축된다
- [ ] agent_builder_public 자체가 starter-kit 사용 방식의 "살아있는 예제"가 된다

## 범위
### 포함 (In Scope)
- agent_builder_public에 tasks/ 구조 도입 (AB-N 네이밍)
- context/records + context/registry 디렉토리 구조 설계
- team-memory-kit CLI 연동 가이드 작성
- CLE2 SPA 코드 기반 커뮤니티 맞춤 대시보드 설계
- 이슈 템플릿 및 첫 이슈 생성
- Discord webhook 연동 설계

### 제외 (Out of Scope)
- CLE2 코드 전체 복사 (참조는 하되 분기하여 커스터마이즈)
- Obsidian vault 자체 구조 변경 (기존互換性 유지)
- agent_builder 외부 사이트 배포 자동화 완성 (별도 태스크)

## 관련 이슈
- GitHub Issue: #20
- CLE2-ID: 9

## 담당자
- 대구루 (시스템 설계, SPA 분기, tasks 문서화)
- 회장님 (요구사항 검수, 방향 승인)
