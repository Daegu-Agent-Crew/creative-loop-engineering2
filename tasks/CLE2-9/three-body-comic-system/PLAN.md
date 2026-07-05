# PLAN — 삼체 연재 만화 창작 시스템 (CLE3)

## 메타데이터
- Planner: subagent/planner
- Architect: subagent/architect (2라운드)
- Critic: subagent/critic (2라운드)
- 합의 라운드: 2
- 생성일: 2026-07-05

## 의사결정 기록 (ADR)

- **결정**: 순차 파이프라인(옵션 A) 채택 — 6단계 + 인프라 + 드라이런
- **동력**: 롤백 단순성, 단계 간 계약 명확성, 점진적 자동화 적합, 초기 리스크 최소
- **대안**: 옵션 B(병렬 파이프라인) — 처리량은 높지만 롤백 복잡, 초기 설계 리스크 큼
- **선택 이유**: CLE3 첫 시스템이므로 안정성 우선. 병렬성은 에피소드 단위로 확보 가능
- **결과**: 순차 구조로 시작 → 안정화 후 병렬화 검토
- **후속**: Phase 4 이후 안정화 시점에 옵션 B 재검토

## 핵심 원칙

1. **P1: 단계별 독립 평가 루프** — 6단계 각각 자체 평가→개선→승인
2. **P2: 프롬프트 버전 관리** — git 기반, 평가 점수와 1:1 매핑
3. **P3: 사람은 게이트키퍼, AI는 엔진** — Discord 승인 없이 다음 단계 불가
4. **P4: 점진적 자동화** — 수동+반자동으로 시작, 검증 후 자동화
5. **P5: 기존 자산 최대 활용** — three-body-comic 리소스, GitHub Pages, Discord 인프라

## 핵심 아키텍처

```
GitHub Push → GitHub Actions → Discord 알림(#cle3-approvals) → OpenClaw AI Agent 실행
→ 단계 수행 → AI 자동 평가 → Discord 승인 게이트 → 결과 GitHub 저장 → 다음 단계
```

### Discord 트리거: Bot 리액션 리스너
- OpenClaw Bot이 평가 결과를 Discord 임베드로 게시
- ✅(승인) / 🔄(개선) / ⏭️(스킵) 리액션
- 채널: #cle3-approvals

### 평가 루프
- 프롬프트 v{N} → 산출물 → AI 자동평가(50점 만점) → Discord 승인
- REJECT 시 자동 개선 (에피소드당 15회, Phase당 5회 한도)

### 평가 모델 분리
- 생성: zai/glm-5.2 (temperature 0.7)
- 평가: 별도 모델(gpt-4o 또는 claude-sonnet), temperature 0.3
- fallback: 동일 모델 + 제3자 평가자 프롬프트

### 에스컬레이션 경로
- 시도 1-3: 자동 개선 (피드백 주입→재생성)
- 시도 4-5: 강화 개선 (프롬프트 자체 수정)
- 5회 초과: Discord 수동 개입 / 이전 Phase 롤백 / 에피소드 일시정지

## 실행 계획

### Phase 0: 인프라 구축
- **담당**: 대구루
- **입력**: GOAL.md, 기존 three-body-comic 리소스
- **출력**:
  - CLE3 신규 GitHub 리포 생성
  - 디렉토리 구조 (episodes/, prompts/, schemas/, styles/, docs/)
  - GitHub Actions 워크플로우 (trigger, notify, deploy)
  - Discord #cle3-approvals 채널 + Bot 리액션 리스너
  - state.json 상태 추적 + GitHub Projects 대시보드
  - JSON 스키마 정의 (단계별 산출물 계약)
  - 평가 루브릭 5개 항목 × 10점 (Phase별 문서화)
- **수락 기준**:
  - [ ] 리포 생성 + 기본 구조 확립
  - [ ] GitHub Actions가 push 트리거로 정상 실행
  - [ ] Discord Bot이 #cle3-approvals에 메시지 게시 가능
  - [ ] state.json 생성/갱신 확인, Git 추적 포함
  - [ ] JSON 스키마 6종 정의 (story/character/storyboard/image/qa/deploy)
- **검증 방법**: 수동 push → Actions 로그 확인, Discord 메시지 수신 확인

### Phase 0.5: 드라이런
- **담당**: 대구루
- **입력**: Phase 0 인프라, 더미 데이터
- **출력**: 전 파이프라인 1회 통과 결과
- **수락 기준**:
  - [ ] 더미 데이터로 Phase 1~6 각 단계 최소 1회 성공 실행
  - [ ] Discord 승인 게이트 정상 작동 확인
  - [ ] state.json이 각 단계 상태 추적
  - [ ] 평가 점수 기록 정상 동작
- **검증 방법**: 드라이런 로그, state.json 상태 이력
- **종료 조건**: 각 단계 최소 1회 성공 (무제한 재시도 허용)

### Phase 1: 스토리 각색
- **담당**: AI Agent (생성) + 회장님 (승인)
- **입력**: 원작 에피소드, wiki/ 세계관, prompt v1
- **출력**: 대본/스크립트 (script.md), 프롬프트 버전 기록
- **수락 기준**: 정량 평가 ≥40/50
  - [ ] 원작 충실도 (1-10점)
  - [ ] 각색 자연스러움 (1-10점)
  - [ ] 대사/대화 품질 (1-10점)
  - [ ] 장면 전개 (1-10점)
  - [ ] 캐릭터 일관성 (1-10점)
- **검증 방법**: AI 자동 평가 + Discord 회장님 승인

### Phase 2: 캐릭터 디자인
- **담당**: AI Agent (생성) + 회장님 (승인)
- **입력**: Phase 1 대본, 기존 wiki/characters/, prompt v1
- **출력**: 캐릭터 시트, 외모 묘사, 프롬프트 버전 기록
- **수락 기준**: 정량 평가 ≥40/50
  - [ ] 외모 일관성 (1-10점)
  - [ ] 성격 표현 정확도 (1-10점)
  - [ ] 원작 부합도 (1-10점)
  - [ ] 시각적 구분성 (1-10점)
  - [ ] 스타일 가이드 준수 (1-10점)
- **검증 방법**: AI 자동 평가 + Discord 승인

### Phase 3: 콘티/스토리보드
- **담당**: AI Agent (생성) + 회장님 (승인)
- **입력**: Phase 1 대본, Phase 2 캐릭터, prompt v1
- **출력**: 페이지별 콘티, 장면 구성도, 프롬프트 버전 기록
- **수락 기준**: 정량 평가 ≥40/50
  - [ ] 장면 구성 (1-10점)
  - [ ] 페이지 흐름 (1-10점)
  - [ ] 연출 효과 (1-10점)
  - [ ] 원작 충실도 (1-10점)
  - [ ] 화풍 적합성 (1-10점)
- **검증 방법**: AI 자동 평가 + Discord 승인

### Phase 4: 이미지 생성
- **담당**: Codex CLI (생성) + 회장님 (승인)
- **입력**: Phase 3 콘티, 캐릭터 시트, styles/prompt-guide, prompt v1
- **출력**: 패널 이미지, 생성 프롬프트 기록, 품질 점수
- **수락 기준**: 정량 평가 ≥40/50
  - [ ] 프롬프트 정확도 (1-10점)
  - [ ] 화풍 일관성 (1-10점)
  - [ ] 캐릭터 외모 일관성 (1-10점)
  - [ ] 한글 렌더링 품질 (1-10점)
  - [ ] 장면 연출 (1-10점)
- **검증 방법**: AI 자동 평가 + Discord 승인 (이미지 첨부)

### Phase 5: 교정/QA
- **담당**: AI Agent (검토) + 회장님 (최종 승인)
- **입력**: Phase 4 이미지, 전 단계 산출물
- **출력**: 최종 보정 이미지, QA 리포트, 교정 이력
- **수락 기준**: 정량 평가 ≥42/50 (상향 기준)
  - [ ] 전체 일관성 (1-10점)
  - [ ] 이미지 품질 (1-10점)
  - [ ] 스토리 정합성 (1-10점)
  - [ ] 한글 표기 오류 (1-10점)
  - [ ] 완성도 (1-10점)
- **검증 방법**: AI 자동 평가 + Codex 리뷰 + Discord 최종 승인

### Phase 6: 배포
- **담당**: GitHub Actions (자동)
- **입력**: Phase 5 최종 산출물
- **출력**: GitHub Pages 에피소드 페이지, 배포 확인
- **수락 기준**:
  - [ ] GitHub Pages에 에피소드 정상 게시
  - [ ] 페이지 뷰어 정상 동작
  - [ ] 모바일 반응형 확인
- **검증 방법**: Pages URL 접속 확인

## 크로스 단계 롤백

- 최대 2단계 롤백 (예: Phase 4→2)
- 동일 에피소드 내 총 3회 제한
- 롤백 시 산출물 백업 + rollback_history에 기록

## 개선 예산

- 에피소드 총 15회, Phase별 상한 5회, 이월 가능
- 10회 사용 시 Discord 알림, 13회 시 경고

## 단계 간 계약 (JSON 스키마)

| Phase | 산출물 | 스키마 파일 |
|-------|--------|------------|
| 1 | script.md + metadata | schemas/story.schema.json |
| 2 | character sheets | schemas/characters.schema.json |
| 3 | storyboard pages | schemas/storyboard.schema.json |
| 4 | panel images + prompts | schemas/panels.schema.json |
| 5 | QA report + final images | schemas/qa.schema.json |
| 6 | deployed episode | schemas/deploy.schema.json |

- ajv/jsonschema로 Phase 진입 시 자동 검증

## 상태 추적

- **state.json**: 로컬 실시간 상태 관리 (Git 추적 대상)
- **GitHub Projects**: 대시보드 가시성 (자동 동기화)

## 의존성

- OpenClaw 게이트웨이 정상 운영
- Discord Bot 토큰 및 #cle3-approvals 채널
- Codex CLI 설치 및 API 키
- GitHub Actions 실행 권한

## 리스크 및 완화

| 리스크 | 확률 | 영향 | 완화 방안 |
|--------|------|------|-----------|
| Discord→OpenClaw 트리거 지연 | 중 | 높음 | 폴링 백업 + 수동 트리거 옵션 |
| Codex 이미지 품질 불안정 | 높음 | 중 | 평가 루프 + 롤백 + 프롬프트 개선 |
| state.json 손상 | 낮음 | 높음 | Git 추적 + 자동 백업 |
| 다중 에피소드 동시성 충돌 | 낮음 | 중 | 에피소드별 분리 디렉토리 |
| 평가 모델 API 장애 | 낮음 | 중 | fallback: 동일 모델 제3자 프롬프트 |

## 인텐트 조정 결과

- 회장님 확인: "자동 평가 항목은 일단 합의, 추후 개선"
- 회장님 확인: "CLE3 신규 리포 + GitHub Pages 새로 생성"
- 회장님 확인: "Codex CLI 다목적 활용 (컨설팅, 리뷰, 이미지 생성)"
- 회장님 확인: "전체 6단계 포함, 반자동 협업 모델"

## Critic 조건부 권고 (구현 시 반영)

1. Phase별 평가 루브릭 5개 항목을 Phase 0 구현 시 문서화
2. Phase 0.5 드라이런 종료 조건을 "각 단계 최소 1회 성공"으로 명확히
3. state.json을 Git 추적 대상에 포함하거나 자동 백업 스케줄 설정
4. 초기 평가 모델 하나를 선정하고 fallback 순서 명시
