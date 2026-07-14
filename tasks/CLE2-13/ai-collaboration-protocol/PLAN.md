# PLAN — AI 협업 운영 프로토콜

## 실행 계획

### Phase 1: CLE2 문서 프로토콜
- **담당**: Codex
- **입력**: 기존 5개 태스크 문서와 운영 규칙
- **출력**: DISCOVERY 템플릿, 확장된 GOAL/PLAN/STATUS/TESTS/DECISIONS
- **예상 시간**: 1차 구현 완료

### Phase 2: CLE2 조회 UI
- **담당**: Codex
- **입력**: DISCOVERY 데이터
- **출력**: 태스크 상세 Discovery 탭과 결정 필요 요약
- **예상 시간**: 1차 구현 완료

### Phase 3: CLE3 시범 적용
- **담당**: Codex
- **입력**: EP001과 패널 생성 정책
- **출력**: discovery/decisions/approvals 데이터 및 Workspace UI
- **예상 시간**: 진행 중

### Phase 4: 실행 큐 및 검증
- **담당**: Codex
- **입력**: 패널 큐와 작업 계획
- **출력**: 판단 근거/가정/불확실성 메타데이터, 검증 결과
- **예상 시간**: 진행 중

## 의존성
- CLE2-9 / #24
- CLE2-10~12 / #26~28
- creative-loop-engineering3 저장소

## 도구 및 접근
| 도구/데이터 | 목적 | 접근 상태 | 대안 |
|---|---|---|---|
| GitHub | 이슈, PR, 장기 기록 | available | 로컬 Git 후 동기화 |
| CLE2/CLE3 로컬 저장소 | 구현과 검증 | available | 없음 |
| 브라우저 | GitHub Pages 화면 검증 | available | 정적 HTML 검사 |

## 사람 승인 게이트
| 게이트 | 승인 대상 | 승인자 | 기준 |
|---|---|---|---|
| CLE3 Story Lock | 스토리 기준선 | 사람 | 가치와 연출 방향 합의 |
| Character Lock | 캐릭터 디자인 | 사람 | 주요 외형과 화풍 합의 |
| Storyboard Lock | 페이지/패널 흐름 | 사람 | 구조와 장면 의도 합의 |
| Release | 최종 공개본 | 사람 | QA 통과와 공개 가치 확인 |

## 리스크
- Discovery가 체크리스트 의식으로 변하면 중대한 Unknown과 사람 결정 항목만 필수로 유지한다.
- 판단 로그는 내부 사고가 아니라 검토 가능한 근거와 불확실성만 저장한다.
