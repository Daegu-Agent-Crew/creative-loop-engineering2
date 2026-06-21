# GOAL — CLE2-4: 요구사항 관리와 Tasks 통합

## 목표
CLE2의 요구사항(Issues)과 tasks 디렉토리가 분리되어 있는 문제를 해결하여, 이슈 등록만으로 tasks 체계로 자동 연결되는 통합 흐름을 구축한다.

## 성공 기준 (Definition of Done)
- [x] GitHub Actions 워크플로우: 이슈 오픈 시 에이전트 요청 메시지 자동 생성 (issue comment)
- [ ] app.js: TASKS_DATA를 동적 생성으로 변경 (requests 기반 자동 생성)
- [ ] app.js: 요구사항 상세 페이지에 task 정보 표시
- [ ] app.js: Tasks 대시보드에 task 미생성 요구사항 표시
- [ ] GitHub Pages 배포 후 정상 동작 확인

## 범위
### 포함 (In Scope)
- GitHub Actions issue-to-task 워크플로우
- app.js TASKS_DATA 동적화
- 요구사항↔task 양방향 링크 UI
- Tasks 대시보드 개선

### 제외 (Out of Scope)
- GitHub Actions에서 tasks/ 디렉토리 자동 생성 (수동 요청 방식 유지)
- 백엔드 API 구축
- 자동 테스트 시스템

## 관련 이슈
- GitHub Issue: #8
- CLE2-ID: 4

## 담당자
- 대구루 (설계 + 구현)
