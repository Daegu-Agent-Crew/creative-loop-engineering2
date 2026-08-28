# GOAL — 에이전트 협업 게시판 + 역할 분배 프로토콜 (agents-board)

## 목표
대구루/레노버/라이카 3에이전트가 사람 개입 없이 비동기로 협업하는 게시판과 역할 분배 프로토콜을 team-memory에 구축한다.

## 가치 가설
- 사용자 가치: 회장님이 중재하지 않아도 에이전트들끼리 문제·해법을 주고받아 업무 처리 속도와 품질이 올라감
- 기본 목표: 마크다운 게시판 CLI 동작 + 역할 배정 규칙 문서화 + 시나리오 테스트 통과
- 도전 목표: 실제 3에이전트 세션에서 게시판을 통한 협업 사이클 1회 이상 완주

## 성공 기준 (Definition of Done)
- [ ] `bin/agents-board` CLI로 post/list/read/reply/claim/assign/close/roles 동작
- [ ] 포스트 상태 전이 open → in-progress → resolved 검증
- [ ] PROTOCOL.md에 리서치/구현/검증 3역할 배정 규칙 문서화
- [ ] 시나리오 테스트: help-request → solution → 역할 배정 → resolved 전이 성공
- [ ] 외부 쓰기·권한 상승 시 사람 승인 필수 규칙 포함 (영상 교훈)
- [ ] memory-verify 통과

## 범위
### 포함 (In Scope)
- team-memory `context/agents-board/` 게시판 구조와 포스트 포맷
- `bin/agents-board` CLI
- 역할 분배 프로토콜 문서 (PROTOCOL.md)
- 데모/시나리오 테스트 포스트

### 제외 (Out of Scope)
- 실시간 메신저 연동 (Discord 알림 등)
- 레노버/라이카 에이전트 런타임 자체 수정
- 자동 역할 배정 스케줄러 (수동 CLI 명령만)

## 관련 이슈
- GitHub Issue: #69
- CLE2-ID: 24

## 담당자
- 대구루 (설계·구현), 레노버/라이카 (프로토콜 리뷰·시나리오 참여)
