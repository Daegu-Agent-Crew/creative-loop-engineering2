# TESTS — CLE3 Episode Workspace / 에피소드 작업 뷰

## 검증 기준

### 구조/문서 테스트
| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|------------|------|-----------|------|
| 1 | task 문서 존재 | 리포 확인 | GOAL/PLAN/STATUS/TESTS/DECISIONS 문서가 존재한다 | ☑ |
| 2 | 상위 태스크 연결 | 문서 리뷰 | CLE2-9와의 관계가 문서와 대시보드에 명시된다 | ☑ |
| 3 | 정보 구조 정의 | 문서 리뷰 | Episode 중심 작업 뷰 정보 구조가 정리된다 | ☑ |
| 4 | 실제 구조 매핑 | 문서 리뷰 | `three-body-comic` 구조와 연결표가 정리된다 | ☑ |
| 5 | EP001 파일 매핑 | 문서 리뷰 | EP001의 script/storyboard/results/panels가 화면 요소와 연결된다 | ☑ |
| 6 | STUDIO 경계 기준 | 문서 리뷰 | 운영 보드와 창작 작업 뷰의 역할 차이와 화면 배치 기준이 있다 | ☑ |

### 제품/운영 테스트
| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|------------|------|-----------|------|
| 1 | CLE2 태스크 노출 | 브라우저 확인 | CLE2-12 카드와 상세가 표시된다 | ☑ |
| 2 | 관련 태스크 링크 | 브라우저 확인 | CLE2-12에서 CLE2-9로 이동할 수 있다 | ☑ |
| 3 | STUDIO 경계 명확성 | 문서 리뷰 | 운영 보드와 창작 작업 뷰의 책임 차이가 분명하다 | ☑ |
| 4 | CLE2 배치 기준 | 문서 리뷰 | 링크형 공존 / 상하 분할 / 3열 작업형 비교와 추천안이 있다 | ☑ |
| 5 | 발표 자료 | 브라우저 확인 | 진행 현황 발표용 HTML이 정적으로 열린다 | ☑ |
| 6 | CLE3 Episode Workspace | 브라우저 확인 | EP001~EP005가 Episode Workspace에서 열리고, json/markdown fallback이 동작한다 | ☑ |
| 7 | Workspace QA/Lint 연결 | 브라우저 확인 | overview/panels/qa에서 panel QA snapshot, release gate, action-required, lint 요약이 연결된다 | ☑ |

## 검증 결과
- **검증 일자**: 2026-07-07
- **검증자**: Codex
- **결과**: 문서 기준 통과 / CLE2 및 CLE3 브라우저 확인 통과 / Workspace QA-Lint 연결 확인

## 비고
Episode Workspace는 STUDIO 보드의 대체가 아니라, 창작 객체를 한 흐름으로 읽게 하는 상위 작업 뷰여야 한다.
