# DISCOVERY — AI 협업 운영 프로토콜

## 작업 맥락
- 사용자/운영자: Daegu-Agent-Crew에서 AI 에이전트와 함께 요구사항과 CLE3 창작 파이프라인을 운영하는 사람
- 실제 문제: AI가 도구와 실제 데이터를 활용할 수 있어도 요구사항 문서가 목표와 완료 조건만 담아 누락, 가정, 승인 필요 항목이 늦게 드러난다.
- 기대 가치: 실행 전에 위험을 발견하고, 정상 작업은 자율적으로 진행하며, 중요한 판단만 사람에게 올린다.
- 관련 시스템/코드/데이터: CLE2 task 문서와 대시보드, CLE3 Episode Workspace, 패널 작업 큐

## Unknown Map

### Known Known
- CLE2는 GOAL, PLAN, STATUS, TESTS, DECISIONS를 요구사항별로 관리한다.
- CLE3는 Phase, JSON Schema, 패널 큐, Vision QA를 가지고 있다.
- CLE3의 정상 패널 작업은 정책 기반으로 이어가고 예외만 에스컬레이션한다.

### Known Unknown
- [ ] 다른 프로젝트에도 동일한 승인 게이트가 적절한가?
- [ ] Unknown 항목이 누적될 때 종료 또는 폐기 기준은 무엇인가?
- [ ] CLE3 실행기의 실제 이미지 생성 및 자동 QA 연결 시 기록 비용은 어느 정도인가?

### Unknown Known
- [ ] 팀원이 당연하게 여기는 코딩 스타일과 리뷰 관행을 프로젝트별로 수집해야 한다.
- [ ] 운영자가 실제로 중요하게 보는 품질 기준과 승인 속도를 실행 데이터로 보정해야 한다.

### Unknown Unknown 후보
- [ ] Discovery 항목이 많아져 작업 시작을 지연시키는 형식적 절차가 될 위험
- [ ] 낮은 확신도의 자동 판단이 누적되어 이후 Phase에서 큰 재작업이 되는 위험
- [ ] localStorage 승인 기록과 Git 원본 사이에 상태 불일치가 생기는 위험

## 탐색 활동
- Blind Spot Scan: 승인 절차 증가, 상태 원본 분산, 로그 과잉 수집 위험을 확인했다.
- Brainstorm 대안: 새 시스템 분리, 기존 5개 문서 확장, `DISCOVERY.md` 한 개 추가를 비교했다.
- 사람 인터뷰: 사용자가 CLE2/CLE3 전체에 차근차근 적용하도록 승인했다.
- 실제 코드/데이터 확인: CLE2 `TASKS_DATA`, CLE3 `generation-jobs.json`, QA localStorage 흐름을 확인했다.

## 도구 확인
| 도구/데이터 | 목적 | 상태 | 제한/대안 |
|---|---|---|---|
| GitHub Issues/PR | 요구사항과 변경 이력 관리 | available | 장기 결정은 파일에도 보존 |
| 로컬 파일/쉘 | 코드 구현과 검증 | available | 없음 |
| CLE3 이미지 생성 | 실제 패널 산출 | available | 사용량과 실행 시간 제한 |
| GitHub Pages | 조회 UI | available | 쓰기는 PAT/localStorage 또는 PR 필요 |

## 레퍼런스
- `tasks/_template/`
- `creative-loop-engineering3/config/panel-generation-policy.json`
- CLE2-8 / #22
- CLE2-9 / #24
- CLE2-10~12 / #26~28

## 실행 전 판단
- 계속 진행 가능한 가정: 공통 문서 형식은 CLE2가 소유하고 CLE3는 실행 데이터를 소유한다.
- 사람 결정 필요: 다른 프로젝트로 확대할 때 승인 게이트를 그대로 복제할지 여부
- 에스컬레이션 조건: 안전/정책 불확실성, 필수 입력 충돌, 최대 재시도 초과, 배포 승인

## 도전 목표
- 기존 트레이드오프: 자율성을 높이면 통제가 약해지고, 승인을 늘리면 속도가 느려진다.
- AI/자동화로 다시 시도할 가설: 정상 경로는 정책으로 자동화하고 예외와 가치 판단만 사람에게 올리면 두 목표를 함께 달성할 수 있다.
