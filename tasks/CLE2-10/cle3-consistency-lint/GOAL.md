# GOAL — CLE3 정합성 린트 시스템

## 목표
CLE3의 CharacterSheet, StylePack, Panel 객체를 기준으로 정합성 위반을 자동 또는 반자동으로 점검하는 린트 시스템의 기준을 정의한다. 사람이 놓치기 쉬운 캐릭터 붕괴, 스타일 드리프트, 메타데이터 누락을 조기에 잡는 것이 목적이다.

## 성공 기준 (Definition of Done)
- [ ] CharacterSheet / StylePack / Panel 기준 린트 대상과 규칙 범주가 문서화된다
- [ ] 린트 입력 포맷과 출력 포맷이 정의된다
- [ ] ReviewNote의 `consistency` 카테고리와 연결 방식이 정리된다
- [ ] CLE2-9 객체 모델과의 관계가 명시된다
- [ ] CLE2 대시보드에서 CLE2-10 상태를 추적할 수 있다

## 범위
### 포함 (In Scope)
- 캐릭터 외형/말투/역할 일관성 규칙 정의
- 화풍/색/질감/구도 드리프트 점검 규칙 정의
- Panel 필수 메타데이터 누락 점검
- 결과를 ReviewNote로 환산하는 방식 설계

### 제외 (Out of Scope)
- 실제 이미지 모델 재학습
- Vision QA의 사람 승인/반려 흐름 전체 구현
- `three-body-comic` 저장소 전체 자동 수정

## 관련 이슈
- GitHub Issue: #26
- CLE2-ID: 10

## 담당자
- 대구루 (규칙 구조, CLE2 반영)
- 레노버 (검토 기준 구조화)
