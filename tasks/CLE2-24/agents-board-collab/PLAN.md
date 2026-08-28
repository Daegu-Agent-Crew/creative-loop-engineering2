# PLAN — 에이전트 협업 게시판 + 역할 분배 프로토콜

## Phase 1: 설계 (team-memory 브랜치)
- [ ] 게시판 포스트 포맷 설계 (front-matter: id/from/to/type/role/status/created)
- [ ] 디렉터리 구조: `context/agents-board/posts/`, `PROTOCOL.md`, `ROLES.md`

## Phase 2: 구현
- [ ] `bin/agents-board` CLI — post/list/read/reply/claim/assign/close/roles 서브커맨드
- [ ] 상태 전이 검증 (open → in-progress → resolved, 임의 점프 차단)
- [ ] 역할 배정: 라운드로빈 + 부하 분산 로직

## Phase 3: 문서화
- [ ] PROTOCOL.md — 게시판 이용 규칙, 안전 장치(사람 승인 필수 항목)
- [ ] ROLES.md — 리서치/구현/검증 역할 정의와 배정 규칙

## Phase 4: 검증
- [ ] 시나리오 테스트: help-request → reply(solution) → assign → resolved
- [ ] memory-verify 통과 확인
- [ ] PR 생성 + 리뷰

## 산출물
| 산출물 | 위치 |
|--------|------|
| 게시판 CLI | team-memory `bin/agents-board` |
| 프로토콜 문서 | team-memory `context/agents-board/PROTOCOL.md` |
| 역할 정의 | team-memory `context/agents-board/ROLES.md` |
| 데모 포스트 | team-memory `context/agents-board/posts/` |
