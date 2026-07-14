# GOAL — AI 협업 운영 프로토콜

## 목표
CLE2 요구사항 관리와 CLE3 실행 파이프라인에 Tool First, Unknown Discovery, Human in the Loop, 판단 근거 기록을 공통 운영 규칙으로 적용한다.

## 가치 가설
- 사용자 가치: 사람은 방향과 가치 판단에 집중하고 AI는 조사, 구현, 실험, 검증을 이어간다.
- 기본 목표: 모든 CLE2 태스크에서 작업 전 Unknown과 도구 상태를 조회할 수 있다.
- 도전 목표: 승인 병목을 늘리지 않으면서 품질, 속도, 비용을 동시에 개선하는 실행 루프를 만든다.

## 성공 기준 (Definition of Done)
- [x] CLE2 표준 태스크에 `DISCOVERY.md`가 추가된다.
- [x] CLE2 상세 화면에서 Unknown, 도구, 레퍼런스, 사람 결정 항목을 조회할 수 있다.
- [x] `DECISIONS.md`가 근거, 확신도, 불확실성, 대안, 승인 상태를 기록한다.
- [ ] CLE3 EP001에서 discovery, decisions, approvals 데이터가 조회된다.
- [ ] CLE3 패널 작업 계획에 판단 근거, 가정, 불확실성이 포함된다.

## 범위
### 포함 (In Scope)
- CLE2 태스크 템플릿과 UI
- CLE3 Episode Workspace와 패널 작업 큐
- 중요 승인 게이트와 예외 에스컬레이션

### 제외 (Out of Scope)
- 모델의 비공개 내부 사고 과정 저장
- 모든 작업 단계의 사람 승인 의무화
- 외부 모델 자체의 성능 개선

## 관련 이슈
- GitHub Issue: #29
- CLE2-ID: CLE2-13

## 담당자
- Codex
