# PLAN — CLE3 정합성 린트 시스템

## 실행 계획

### Phase 1: 린트 대상 객체와 오류 범주 정의
- **담당**: 대구루
- **입력**: `OBJECT-MODEL.md`, `FOLLOW-UP-ISSUES.md`
- **출력**: 린트 범주 목록
- **예상 시간**: 0.5일

### Phase 2: 입력/출력 포맷과 ReviewNote 연결 설계
- **담당**: 대구루
- **입력**: Phase 1 산출물
- **출력**: lint result schema 초안
- **예상 시간**: 0.5일

### Phase 3: CLE2 / `three-body-comic` 연결 방식 정리
- **담당**: 레노버
- **입력**: Phase 2 산출물
- **출력**: 운영 연결 방안
- **예상 시간**: 0.5일

## 의존성
- `tasks/CLE2-9/three-body-cle3/OBJECT-MODEL.md`
- `tasks/CLE2-9/three-body-cle3/FOLLOW-UP-ISSUES.md`

## 리스크
- 규칙을 너무 촘촘하게 잡으면 초기 운영 비용이 높아질 수 있음
- 사람 검토 없이 자동 판정하려 들면 오탐이 많아질 수 있음
