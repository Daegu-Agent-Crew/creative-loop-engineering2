# GOAL — CLE5 독립 연재 만화 제작 시스템

## 목표
CLE5 안에서 프로젝트 생성부터 에피소드 구성, 이미지 제작, 사람 검토, 기억 승인과 연재 만화 발행까지 완료한다. CLE3 저장소, Pages, API와 데이터에 런타임 의존하지 않는다.

## 가치 가설
- 사용자는 복잡한 제작 파일 대신 현재 단계와 다음 결정에 집중한다.
- Codex, Claude, OpenClaw 등 외부 에이전트는 CLE5 Handoff로 전체 맥락과 결과 저장 계약을 받는다.
- 사람에게 승인된 이미지와 판단만 다음 에피소드의 기억으로 누적된다.

## 성공 기준
- [x] 프로젝트·에피소드·캐릭터·콘티·패널·발행 데이터 모델
- [x] `구성 → 제작 → 검토 → 발행` Comic Workspace
- [x] 텍스트·이미지 URL·GitHub 경로 산출물 등록
- [x] 이미지 후보 A/B 선택, 동점, 모두 탈락과 선택 근거
- [x] 선택한 패널과 판단을 범위별 기억으로 승인
- [x] 패널 QA 및 발행 준비 게이트
- [x] 외부 AI Agent Brief와 결과 반환 계약
- [x] 최종 세로 만화 뷰어
- [x] 기존 CLE5 Workspace/Growth/GitHub 동기화 회귀 없음
- [x] 코드와 네트워크에서 CLE3 의존성 0

## 범위
### 포함
- CLE5 브라우저 Workspace의 만화 제작 모드
- CLE5-native 예제 프로젝트와 자산
- 기존 localStorage, export/import, GitHub Workspace JSON 동기화 확장
- 외부 AI 에이전트에 이미지 생성·창작 작업 전달

### 제외
- CLE3 코드 복사, CLE3 URL/API/데이터 조회
- CLE5 브라우저에서 이미지 생성 API 직접 호출
- 사용자 기본 화면에 JSON·스키마·Manifest 노출

## 관련 이슈
- GitHub Issue: #59
- CLE2-ID: CLE2-21
