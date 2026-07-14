# DISCOVERY — 삼체 연재 만화 창작 시스템 (CLE3)

## 작업 맥락
- 실제 문제: 기존 자료를 재사용하는 별도 만화 저장소가 아니라 CLE3 내부 파이프라인이 모든 생성 콘텐츠와 판단을 관리해야 한다.
- 기대 가치: 에피소드의 입력, 생성물, QA, 결정과 승인 상태를 한 Workspace에서 추적한다.
- 관련 시스템: creative-loop-engineering3, CLE2-10 정합성 린트, CLE2-11 Vision QA, CLE2-12 Episode Workspace

## Unknown Map

### Known Known
- CLE3의 원본은 `episodes/EPxxx/` 내부 산출물이다.
- EP001/EP002는 Phase 4 패널 생성 중이며 페이지 단위 작업 큐를 사용한다.
- 사람 승인은 스토리, 캐릭터, 콘티, 배포 게이트와 예외 작업에 필요하다.

### Known Unknown
- [ ] EP002 script 15p와 storyboard/panels 16p 구조 차이의 rebaseline 시점
- [ ] 자동 이미지 생성과 Vision QA 실행기의 최종 연결 방식
- [ ] Git 원본과 브라우저 localStorage QA 기록의 동기화 방식

### Unknown Known
- [ ] 운영자가 캐릭터 일관성, 장면 충실도, 흥행 훅 중 실제로 가장 우선하는 기준
- [ ] 복잡한 다인물 컷에서 허용 가능한 재시도 횟수와 품질 하한

### Unknown Unknown 후보
- [ ] 페이지 단위 병렬 생성이 장면 연속성에 만드는 예상 밖의 드리프트
- [ ] 패널별 판단 메타데이터가 오래된 storyboard 기준을 정당화하는 위험

## 도구 확인
| 도구/데이터 | 목적 | 상태 | 제한/대안 |
|---|---|---|---|
| GitHub/CLE2 | 요구사항, 결정, PR 관리 | available | 장기 결정은 파일에 보존 |
| CLE3 파일/쉘 | 생성 큐와 산출물 관리 | available | 없음 |
| Codex imagegen | 패널 생성 | available | 사용량과 실행 시간 제한 |
| GitHub Pages | Episode Workspace 조회 | available | 쓰기 상태는 Git/PR로 확정 |

## 레퍼런스
- CLE3 `AGENTS.md`
- `config/panel-generation-policy.json`
- `docs/AUTONOMOUS-PANEL-GENERATION.md`
- CLE2-9 OBJECT-MODEL.md

## 실행 전 판단
- 계속 진행 가능한 가정: EP001을 Discovery/Decision/Approval 데이터의 시범 에피소드로 사용한다.
- 사람 결정 필요: EP002 rebaseline과 최종 공개 승인
- 에스컬레이션 조건: 입력 충돌, 참조 누락, 반복 실패, 모호한 QA, 정책/안전 불확실성

## 도전 목표
- 기존 트레이드오프: 자율 생성 속도와 사람의 창작 통제
- AI/자동화로 다시 시도할 가설: 정상 패널은 제한 병렬화하고 예외 및 네 승인 게이트만 사람에게 올린다.
