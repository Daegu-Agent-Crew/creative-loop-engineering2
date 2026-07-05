# GOAL — 삼체 연재 만화 창작 시스템 (CLE3)

## 메타데이터
- 인터뷰 ID: cle3-20260705
- 라운드 수: 11
- 최종 모호성 점수: 10%
- 프로젝트 유형: brownfield (기존 three-body-comic, three-body-comic-styles, CLE2-7 기반)
- 생성일: 2026-07-05
- 임계값: 5%

## 목표

CLE3: 삼체 연재 만화 창작 시스템 — GitHub Actions 기반 파이프라인(GitHub 저장→Actions→Discord→AI Agent 실행)으로 스토리 각색, 캐릭터, 콘티, 이미지 생성, 교정, 배포 6단계를 사용자-AI 협업으로 수행하고, 각 단계에서 AI 자동 평가 + 프롬프트 자동 개선 + 사람 승인 루프를 통해 산출물 품질을 지속적으로 높이는 시스템.

## 성공 기준 (Definition of Done)

- [ ] 하나의 에피소드(예: EP001)를 처음부터 끝까지 CLE3 시스템만으로 협업 완성 (전체 6단계)
- [ ] 1~4단계 각각에 대해 프롬프트/컨텍스트 버전(v1, v2, v3...)과 결과물 품질 비교가 파일로 저장됨
- [ ] 각 단계 산출물에 대해 AI 자동 평가 점수 + 회장님 최종 평가 점수가 함께 기록됨
- [ ] AI 자동 평가 후 프롬프트 자동 개선 → 회장님 Discord 승인 후 반영되는 루프가 작동함
- [ ] GitHub 저장 → Actions → Discord 알림 → AI Agent 실행 흐름이 자동으로 연결됨
- [ ] CLE3 리포의 GitHub Pages에 완성 에피소드가 배포됨

## 범위

### 포함 (In Scope)
- CLE3 신규 GitHub 리포지토리 생성 (`creative-loop-engineering3` 또는 유사명)
- 6단계 창작 파이프라인: 스토리 각색 → 캐릭터/세계관 → 콘티/스토리보드 → 이미지 생성 → 교정/리뷰 → 배포
- 단계별 AI 프롬프트 + 컨텍스트 지속 개선 연구 루프
- AI 자동 평가 (원작 충실도, 캐릭터 일관성, 장면 구성, 화풍 일관성, 한글 렌더링 등)
- 프롬프트 자동 개선 → 사람 검토/승인 → 다음 버전 반영
- GitHub Actions 기반 자동화 파이프라인 (push → actions → discord → ai agent)
- Discord 연동: 중간 산출물 알림, 회장님 승인/피드백 게이트
- OpenClaw AI Agent: 파이프라인 오케스트레이터
- Codex CLI: 컨설팅, 리뷰, 이미지 생성 등 다목적 활용
- CLE3 리포 내 GitHub Pages 에피소드 뷰어
- 평가 점수 + 프롬프트 버전 기록 구조

### 제외 (Out of Scope)
- 이미지 생성 모델 자체 개발
- 기존 three-body-comic 리포 마이그레이션 (참고용)
- CLE2-7 관리 시스템과의 통합 (별도 진행)

## 제약사항
- 언어: 한국어 (대사, 자막, 말풍선)
- 원작: 유우캐 리우싱 《삼체문제》 기반 각색
- 기술 스택: GitHub + GitHub Actions + GitHub Pages + Discord + OpenClaw AI Agent + Codex CLI
- 평가 항목은 초기 버전으로 시작, 추후 지속 개선

## 가정 노출 및 해결

| 가정 | 도전 | 결론 |
|------|------|------|
| CLE3를 기존 리포에 구축 | 별도 리포인가? | 새 리포 생성 (A) |
| 완전 자동 출력 | 자동화 수준? | 반자동 협업 (B), 각 단계마다 사람 승인 |
| 1~4단계만 다룸 | 배포는? | 전체 6단계 포함 (A) |
| Codex는 이미지 생성용 | Codex 용도? | 다목적: 컨설팅, 리뷰, 이미지 생성 등 |
| 평가는 참고용 | 평가 방식? | AI 자동평가 + 사람 평가, 자동 개선 후 사람 승인 (C) |

## 핵심 엔티티

| 엔티티 | 유형 | 필드 | 관계 |
|--------|------|------|------|
| Episode | 코어 도메인 | id, title, status, phase | 1:N Panel, 1:N PromptVersion |
| Pipeline | 코어 도메인 | episode_id, current_stage, status | 1:1 Episode, 1:N Stage |
| Stage | 코어 도메인 | type(스토리/캐릭터/콘티/이미지/교정/배포), status, output | N:1 Pipeline |
| PromptVersion | 핵심 | stage_id, version, prompt, context, auto_score, human_score | N:1 Stage |
| Evaluation | 핵심 | target_id, ai_score, human_score, feedback, auto_improvement | N:1 PromptVersion |
| DiscordApproval | 외부 시스템 | stage_id, channel, message_id, status(approved/rejected), feedback | N:1 Stage |

## 기술 컨텍스트

기존 자산 (참고용):
- `three-body-comic` 리포: 에피소드 1화, 위키(세계관/캐릭터/타임라인), 화풍 4종, 실험 5개, GitHub Pages 배포, prompt-guide-v2.md
- `three-body-comic-styles` 리포: 화풍별 프로토타입 (수채화, 웹툰, 먹물, 사실적 SF)
- CLE2-7: 삼체 만화 관리 시스템 설계(GOAL.md 있음, 구현 미완료)
- CLE2 tasks 구조: GOAL/PLAN/STATUS/TESTS 4문서 체계

핵심 아키텍처 흐름:
```
GitHub Push → GitHub Actions Trigger → Discord Notification → OpenClaw AI Agent 실행 → 각 단계 수행 → 결과 GitHub 저장 → 반복
```

## 관련 이슈
- GitHub Issue: #24
- CLE2-ID: 9

## 담당자
- 회장님 (기획, 승인, 평가)
- 대구루 (시스템 설계, 구현, AI 에이전트)
