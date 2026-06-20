# PLAN — team-memory 활성화

## 실행 계획

### Phase 1: 구조 정비
- **담당**: 대구루
- **입력**: 기존 team-memory repo
- **출력**: context/{records,wiki,registry} 디렉토리 표준화, 기여 가이드 작성
- **예상 시간**: 2시간

### Phase 2: 자동 연동 파이프라인
- **담당**: 대구루
- **입력**: Phase 1 구조
- **출력**: GitHub Actions / webhook 기반 신규 record Discord 알림
- **예상 시간**: 3시간

### Phase 3: 팀원 온보딩
- **담당**: sfex11
- **입력**: 기여 가이드
- **출력**: 팀원들이 직접 record 작성
- **예상 시간**: 1주일 (루틴 형성)

## 의존성
- team-memory repo 권한 설정
- Discord 웹훅 설정

## 리스크
- 팀원 기여가 부진할 수 있음 → 자동화 알림으로 참여 유도
