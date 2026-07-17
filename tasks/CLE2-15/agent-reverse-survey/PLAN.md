# PLAN — AI 에이전트 역공학 설문 + 개선 처방 웹앱

## 아키텍처

```
[공개 GitHub Pages]                    [Cloudflare Workers]         [Private Repo]
 설문 폼 (14항목)     ──submit──→  API 게이트웨이  ──write──→  surveys/{id}.json
 결과 조회 (PW 인증)  ──fetch──→   API 게이트웨이  ──read──→   surveys/{id}.json
                                                                comments/{surveyId}/
 반복 상담 대시보드    ──update──→  D1 상담 이력 DB
 실행 과제·증거·점검  ←─fetch───   KV 운영 캐시
```

## 리포 구성

| 리포 | 가시성 | 용도 |
|------|--------|------|
| Daegu-Agent-Crew/creative-loop-engineering2 | public | Pages 호스팅 (설문 웹앱) |
| Daegu-Agent-Crew/agent-reverse-survey | **private** | 설문 응답 + 처방 JSON 저장 |

## 데이터 모델

### survey (설문 응답)
```json
{
  "id": "{timestamp}-{random}",
  "createdAt": "ISO-8601",
  "agentName": "에이전트 이름",
  "password": "sha256 hash",
  "items": {
    "persona": { "answer": "...", "evidence": "...", "confidence": "high|medium|low" },
    "goal": { ... },
    "mission": { ... },
    "constraints": { ... },
    "safetyRules": { ... },
    "toolUsageRules": { ... },
    "memoryUsage": { ... },
    "planningStrategy": { ... },
    "reasoningStyle": { ... },
    "refusalPolicy": { ... },
    "outputFormattingRules": { ... },
    "decisionPriority": { ... },
    "hiddenAssumptions": { ... },
    "unknownAreas": { ... }
  },
  "summary": "운영 설계도 1장 요약"
}
```

### comment (처방 댓글)
```json
{
  "id": "{timestamp}",
  "surveyId": "{survey id}",
  "analyst": "대구루|라이카|...",
  "createdAt": "ISO-8601",
  "overall": "전체 평가",
  "suggestions": [
    { "item": "persona", "comment": "..." },
    ...
  ]
}
```

## 실행 계획

### Phase 1: 인프라 세팅
- **담당**: 대구루
- **출력**: private repo 생성, Cloudflare Workers API skeleton, Pages 기본 구조
- **예상 시간**: 2시간

#### 1-1. Private repo 생성
- `Daegu-Agent-Crew/agent-reverse-survey` (private)
- 초기 폴더: `surveys/`, `comments/`

#### 1-2. Cloudflare Workers API
- 참고: ai-solana-agent의 `ai-solana-upload.sfex11.workers.dev`
- 엔드포인트:
  - `POST /api/survey` — 설문 제출 (→ private repo commit)
  - `GET /api/survey/:id?pw=xxx` — 설문 + 처방 조회 (PW 검증)
  - `GET /api/surveys` — 설문 목록(메타데이터만)
- 인증: Workers API 키 + 설문 비밀번호(sha256)
- private repo 쓰기: GitHub API (PAT 또는 GitHub App token)

#### 1-3. Pages 기본 구조
- `creative-loop-engineering2`의 `docs/agent-reverse-survey/` 폴더
- 경로: `/creative-loop-engineering2/agent-reverse-survey/`

### Phase 2: 설문 웹앱 구현
- **담당**: 대구루
- **출력**: 설문 입력 페이지 + 결과 조회 페이지
- **예상 시간**: 3시간

#### 2-1. 설문 입력 폼
- 14개 항목별: 답변 textarea + Evidence textarea + Confidence 셀렉트
- 에이전트 이름 입력
- 비밀번호 설정 (결과 조회용)
- 제출 → Workers API → private repo

#### 2-2. 운영 설계도 요약
- 마지막 섹션 자동 생성 또는 직접 입력
- 14개 항목 요약 → 1장 카드 형태

#### 2-3. 결과 조회 페이지
- 설문 ID + 비밀번호 입력
- 설문 내용 + 처방 댓글 목록 표시
- 비밀번호 불일치 시 "조회 권한 없음"

### Phase 3: 분석 에이전트 연동
- **담당**: 대구루 (프로토콜 정의)
- **출력**: 분석 에이전트 가이드 + comment 등록 API
- **예상 시간**: 1시간

#### 3-1. 분석 프로토콜
- 수동 지시: "이 설문 분석해줘" → 분석 에이전트가 private repo에서 survey 읽기
- 처방 작성 → Workers API 또는 직접 repo commit으로 comments/{surveyId}/ 저장

#### 3-2. 댓글 표시
- 여러 분석 에이전트(대구루, 라이카 등)가 각각 처방 등록
- 결과 페이지에 댓글 형태로 표시 (작성자, 시간, 내용)

### Phase 4: 통합 테스트 + 배포
- **담당**: 대구루
- **출력**: E2E 테스트, 최종 배포
- **예상 시간**: 1시간

- 실제 에이전트로 설문 1건 작성
- 분석 에이전트로 처방 등록
- 비밀번호 조회 확인
- Pages 배포 확인

## 의존성
- Cloudflare Workers 계정 (기존 ai-solana-agent 참고)
- Private repo용 GitHub PAT (기존 .env GITHUB_TOKEN 사용 가능)
- GitHub Pages (creative-loop-engineering2 리포)

### Phase 5: 지속 개선 상담 시스템

- **담당**: 대구루
- **출력**: 회차형 상담, 실행 과제, 증거, 점검, 재평가, 운영 문서
- **상태**: 완료 (2026-07-17)

#### 5-1. 반복 상담 데이터

- D1 `consultation_cycles`: 상담 회차와 기준/재평가 점수
- D1 `action_items`: 처방을 실행 가능한 규칙 변경 과제로 관리
- D1 `evidence`: 실행 증거와 관리자 검증 기록
- D1 `checkins`: 기간별 진행 상황, 장애물, 다음 행동
- KV: 후속 알림과 집계 캐시 확장을 위한 운영 공간

#### 5-2. 사용자 흐름

1. 기존 설문과 처방 조회
2. 진행 중인 상담 회차와 과제 확인
3. 과제 수락·진행·보류 상태 기록
4. 실행 증거 및 주간 점검 제출
5. 핵심 항목 재평가
6. 관리자 검증 후 회차 종료 및 다음 회차 시작

#### 5-3. 완료 기준

- 비밀번호가 URL에 노출되지 않는 POST 조회
- 설문 비밀번호로 본인 상담 회차만 접근
- 관리자 키로 회차 생성·증거 검증·회차 종료
- 테스트 설문으로 전체 상태 전이 E2E 통과
- 실제 대구루 설문에 1회차 및 5개 과제 등록

## 도구 및 접근
| 도구/데이터 | 목적 | 접근 상태 | 대안 |
|---|---|---|---|
| Cloudflare Workers | API 게이트웨이 | available (sfex11 계정) | — |
| GitHub API (PAT) | private repo read/write | available (.env) | GitHub App |
| GitHub Pages | 공개 웹앱 호스팅 | available | — |

## 사람 승인 게이트
| 게이트 | 승인 대상 | 승인자 | 기준 |
|---|---|---|---|
| Phase 1 완료 | Workers API + repo 구조 | 회장님 | API 정상 동작 확인 |
| Phase 3 완료 | 분석 프로토콜 | 회장님 | 처방 등록 검증 |

## 리스크
- Cloudflare Workers CORS 설정 누락 → Pages에서 API 호출 실패 → Workers에 CORS 헤더 추가
- private repo PAT 권한 부족 → repo 스코프 확인 필요
- 비밀번호 평문 저장 금지 → sha256 해시 저장
