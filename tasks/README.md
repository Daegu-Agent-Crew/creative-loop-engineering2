# CLE2 Tasks — AI 에이전트 병렬 작업 지원 체계

각 요구사항(Issue)은 독립적인 태스크 폴더를 가지며, 표준화된 4개 문서로 관리됩니다.

## 디렉토리 구조

```
tasks/
├── README.md            ← 이 파일 (운영 규칙)
├── _template/           ← 새 태스크 생성용 템플릿
│   ├── GOAL.md
│   ├── PLAN.md
│   ├── STATUS.md
│   └── TESTS.md
├── CLE2-1/              ← 이슈 #1: team-memory 활성화
│   └── team-memory-activation/
│       ├── GOAL.md
│       ├── PLAN.md
│       ├── STATUS.md
│       └── TESTS.md
├── CLE2-2/              ← 이슈 #3: 유튜브→wiki 스킬
│   └── youtube-wiki-skill/
│       ├── GOAL.md
│       ├── PLAN.md
│       ├── STATUS.md
│       └── TESTS.md
├── CLE2-3/              ← 이슈 #4: CLE2 개선
│   └── cle2-improvement/
│       ├── GOAL.md
│       ├── PLAN.md
│       ├── STATUS.md
│       └── TESTS.md
├── CLE2-4/              ← 이슈 #5: 요구사항↔tasks 통합
│   └── task-integration/
│       ├── GOAL.md
│       ├── PLAN.md
│       ├── STATUS.md
│       └── TESTS.md
├── CLE2-5/              ← 이슈 #13: 결과물 쇼케이스 & 피드백
│   └── deliverables-feedback/
│       ├── GOAL.md
│       ├── PLAN.md
│       ├── STATUS.md
│       └── TESTS.md
└── CLE2-6/              ← 이슈 #15: AI 에이전트 뉴스 수집 시스템
    └── ai-agent-news/
        ├── GOAL.md
        ├── PLAN.md
        ├── STATUS.md
        └── TESTS.md
├── CLE2-7/              ← 이슈 #17: 삼체 전용 관리 시스템
│   └── three-body-comic-studio/
│       ├── GOAL.md
│       ├── PLAN.md
│       ├── STATUS.md
│       └── TESTS.md
└── CLE2-9/              ← 이슈 #20: agent_builder 진화
    └── agent-builder-evolution/
        ├── GOAL.md
        ├── PLAN.md
        ├── STATUS.md
        └── TESTS.md
```

## 문서 역할

| 문서 | 목적 | 작성 시점 |
|------|------|-----------|
| **GOAL.md** | 달성 목표, 성공 기준, 범위 | 태스크 생성 시 |
| **PLAN.md** | 단계별 실행 계획, 담당자 할당 | 태스크 시작 시 |
| **STATUS.md** | 현재 진행 상황, 다음 액션 | 작업 중 지속 갱신 |
| **TESTS.md** | 검증 기준, 테스트 결과 | 완료 전 검증 |

## 에이전트 병렬 작업 규칙

1. **독립성**: 각 태스크는 다른 태스크에 의존하지 않는 독립 범위를 가진다
2. **가시성**: STATUS.md로 진행 상황을 누구나 확인 가능
3. **검증 가능**: TESTS.md로 완료 여부를 객관적으로 판단
4. **충돌 방지**: 서로 다른 디렉토리/파일을 작업 영역으로 사용

## 새 태스크 생성

1. `tasks/_template/` 복사 → `tasks/CLE2-{ID}/{slug}/`
2. GOAL.md 작성 → 이슈 생성
3. PLAN.md로 단계 분해 → 담당 에이전트 할당
4. 작업 시작 후 STATUS.md 주기적 갱신
5. 완료 전 TESTS.md 검증 → PR 생성
