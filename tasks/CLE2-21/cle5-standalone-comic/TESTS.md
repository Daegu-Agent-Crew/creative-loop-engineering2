# TESTS — CLE5 독립 연재 만화 제작 시스템

| # | 검증 항목 | 기대 결과 | 상태 |
|---|---|---|---|
| 1 | 요구사항 등록 | Issue #59와 표준 문서 연결 | ✅ |
| 2 | Workspace v2 마이그레이션 | 기존 작업과 기억 보존, comicProjects 추가 | ✅ |
| 3 | 프로젝트·에피소드 생성 | CLE5 내부 ID와 4단계 상태 생성 | ✅ |
| 4 | 캐릭터·콘티·패널 등록 | URL/경로 산출물이 에피소드에 저장 | ✅ |
| 5 | Agent Handoff | 만화 맥락·자산·반환 경로가 Brief에 포함 | ✅ |
| 6 | 후보 수렴 | A/B/동점/모두 탈락과 근거 저장 | ✅ |
| 7 | 기억 승격 | 사람 선택 후보만 범위별 기억에 등록 | ✅ |
| 8 | 패널 QA | 이미지·구도·연속성·대사 상태 판정 | ✅ |
| 9 | 발행 게이트 | 승인 패널만 최종 뷰어에 표시 | ✅ |
| 10 | GitHub 동기화 | comicProjects 포함 Workspace 저장 | ✅ |
| 11 | 기존 기능 회귀 | Workspace/Growth/Agent/GitHub 테스트 통과 | ✅ |
| 12 | CLE3 비의존 | 앱 코드에 CLE3 URL/API/import 없음 | ✅ |
| 13 | 반응형 UI | 데스크톱·모바일에서 겹침·가로 넘침 없음 | ✅ |

## 자동 검증
```bash
npm run check
node --test tests/comic-core.test.js
rg -n "creative-loop-engineering3|CLE3_API" app tests scripts
```

## 실행 결과
- `npm test`: 17/17 통과
- `npm run build`: 통과
- `node --check app/app.js app/comic-core.js`: 통과
- Chrome 1440×1000 / 390×844 스크린샷: 겹침·가로 넘침 없음
