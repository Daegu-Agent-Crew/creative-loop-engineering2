# GOAL — 삼체 연재 만화 창작 시스템 (CLE3)

## 목표
`three-body-comic` 저장소와 기존 CLE/CLE2 운영 경험을 바탕으로, 삼체 연재 만화의 기획, 생성, 교정, 배포, 관측까지를 사용자와 AI 에이전트가 함께 다루는 창작 시스템 `CLE3`를 정의하고 구현 기준을 세운다.

## 성공 기준 (Definition of Done)
- [ ] `three-body-comic` 현재 구조를 기준으로 CLE3의 시스템 경계와 핵심 객체가 정리된다
- [ ] GitHub + GitHub Pages + Discord + OpenClaw + Codex 연동 범위가 문서화된다
- [ ] 스토리, 화풍, 캐릭터, 패널, 결과물 교정의 협업 루프가 단계별로 정의된다
- [ ] CLE2-7에서 만든 운영 레이어와 CLE3에서 새로 필요한 창작 레이어가 구분된다
- [ ] CLE2 대시보드에서 CLE2-9 진행 상태와 의사결정을 추적할 수 있다
- [ ] 후속 구현 이슈(정합성 린트, Vision QA, 작업 뷰 등)로 분해 가능한 기준 문서가 준비된다

## 범위
### 포함 (In Scope)
- `three-body-comic` 저장소 구조 분석과 목표 재정의
- CLE/CLE2/CLE2-7 자산을 기반으로 CLE3 운영/창작 경계 설계
- GitHub, Pages, Discord, OpenClaw, Codex 간 연동 흐름 정의
- 인간 + AI 협업 창작 단계(스토리/화풍/캐릭터/패널/교정) 설계
- CLE2에 CLE2-9 task 문서와 대시보드 등록
- 후속 구현 이슈 분해 기준과 연결 관계 정의

### 제외 (Out of Scope)
- 이미지 생성 모델 자체 개발
- Discord/GA/Forms 실서비스 운영 계정 세팅 완료
- `three-body-comic` 전체 제작 대행
- 완전 자동 만화 생성 파이프라인 즉시 구현
- 후속 구현 이슈 전체의 한 번에 동시 구현

## 관련 이슈
- GitHub Issue: #24
- CLE2-ID: 9

## 담당자
- 대구루 (시스템 구조, CLE2 반영)
- 레노버 (분석, 워크플로우 구조화)
- 회장님 (방향 승인, 우선순위 판단)
