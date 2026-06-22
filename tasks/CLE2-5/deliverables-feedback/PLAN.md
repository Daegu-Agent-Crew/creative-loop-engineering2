# PLAN — 결과물 쇼케이스 & 피드백 루프

## 실행 계획

### Phase 1: 데이터 모델 & 스토리지
- **담당**: 대구루
- **입력**: 이슈 #13 요구사항
- **출력**: DELIVERABLE_KEY 스토리지, deliverable 데이터 구조 정의
- **세부**:
  - `state.deliverables` 추가: `{ reqId: [ {id, version, title, content, links[], author, createdAt, status} ] }`
  - `state.feedback` 추가: `{ deliverableId: [ {author, text, createdAt} ] }`
  - loadData/saveDeliverables/saveFeedback 함수

### Phase 2: 결과물 등록 & 표시 UI
- **담당**: 대구루
- **입력**: Phase 1 데이터 모델
- **출력**: 요구사항 상세 페이지 내 결과물 섹션
- **세부**:
  - renderDetail 내에 "📦 결과물" 섹션 추가
  - 버전 카드 (V1, V2, ...) with 확장/축소
  - 결과물 등록 폼 (인라인 모달)
  - 링크 청부 기능 (URL 입력)
  - GitHub Pages 공유 링크 생성 버튼

### Phase 3: 피드백 & 재작업 루프
- **담당**: 대구루
- **입력**: Phase 2 UI
- **출력**: 피드백 등록 및 새 버전 작성 흐름
- **세부**:
  - 각 결과물 버전에 피드백 표시
  - 피드백 입력 폼
  - "피드백 반영하여 새 버전 등록" 버튼
  - 이전 버전 보존 확인

### Phase 4: UI 통합 & 마무리
- **담당**: 대구루
- **입력**: Phase 1-3 완성
- **출력**: 테스트 통과, PR 머지, Pages 배포
- **세부**:
  - styles.css 결과물 카드 스타일 추가
  - DATA_VERSION 증가 (v9)
  - 기존 UI 일관성 유지 확인
  - node --check 문법 검증

## 의존성
- 기존 renderDetail 구조 (상세 페이지 레이아웃)

## 리스크
- 상세 페이지가 길어질 수 있음 → 접기/펼치기로 완화
- localStorage 용량 → 버전당 텍스트 한정
