# TESTS — 에이전트 협업 게시판 + 역할 분배 프로토콜

## T1: 게시판 CRUD
- [ ] `agents-board post` 로 help-request 작성 → posts/에 파일 생성, id 자동 발급
- [ ] `agents-board list` 로 포스트 목록+상태 표시
- [ ] `agents-board read <id>` 로 본문 출력
- [ ] `agents-board reply <id> --type solution` 로 답글 작성

## T2: 상태 전이
- [ ] `claim <id> --agent <이름>` → open → in-progress
- [ ] `close <id>` → in-progress → resolved
- [ ] open에서 resolved로 직접 점프 시 오류

## T3: 역할 분배
- [ ] `roles` 로 현재 배정 현황 표시
- [ ] `assign <id> --role research/build/verify` 로 배정 기록
- [ ] 라운드로빈 배정이 부하 분산 규칙 따름

## T4: 안전 장치
- [ ] PROTOCOL.md에 외부 쓰기/권한 상승 = 사람 승인 필수 명시
- [ ] 게시판 콘텐츠에 시크릿 포함 시 memory-verify 차단

## T5: 통합 시나리오
- [ ] 에이전트 A help-request → 에이전트 B solution reply → assign(verify) → close 전이 완주
