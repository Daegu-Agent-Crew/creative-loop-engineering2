# CLE2 Tasks — AI 에이전트 병렬 작업 지원 체계

각 요구사항(Issue)은 독립적인 태스크 폴더를 가지며, 표준화된 6개 문서로 관리됩니다.

## 디렉토리 구조

```text
tasks/
├── README.md            ← 이 파일 (운영 규칙)
├── _template/           ← 새 태스크 생성용 템플릿
│   ├── GOAL.md
│   ├── DISCOVERY.md
│   ├── PLAN.md
│   ├── STATUS.md
│   ├── TESTS.md
│   └── DECISIONS.md
└── CLE2-{ID}/
    └── {slug}/
        ├── GOAL.md
        ├── DISCOVERY.md
        ├── PLAN.md
        ├── STATUS.md
        ├── TESTS.md
        ├── DECISIONS.md
        └── 필요 시 상세 사양·가이드 문서
```

## 문서 역할

| 문서 | 목적 | 작성 시점 |
|------|------|-----------|
| **GOAL.md** | 달성 목표, 성공 기준, 범위 | 태스크 생성 시 |
| **DISCOVERY.md** | 작업 맥락, Unknown, 도구, 레퍼런스, 사람 결정 항목 | 실행 계획 확정 전과 새 위험 발견 시 |
| **PLAN.md** | 단계별 실행 계획, 담당자 할당 | 태스크 시작 시 |
| **STATUS.md** | 현재 진행 상황, 다음 액션 | 작업 중 지속 갱신 |
| **TESTS.md** | 검증 기준, 테스트 결과 | 완료 전 검증 |
| **DECISIONS.md** | 핵심 의사결정, 열린 쟁점, 참고 링크 | 논의 누적 시 |

## 에이전트 병렬 작업 규칙

1. **독립성**: 각 태스크는 다른 태스크에 의존하지 않는 독립 범위를 가진다
2. **가시성**: STATUS.md로 진행 상황을 누구나 확인 가능
3. **검증 가능**: TESTS.md로 완료 여부를 객관적으로 판단
4. **의사결정 추적**: 장기 참조가 필요한 판단은 DECISIONS.md에 누적한다
5. **충돌 방지**: 서로 다른 디렉토리/파일을 작업 영역으로 사용

## 새 태스크 생성

1. `tasks/_template/` 복사 → `tasks/CLE2-{ID}/{slug}/`
2. GOAL.md 작성 → 이슈 생성
3. DISCOVERY.md에서 Unknown, 도구, 레퍼런스, 사람 결정 항목 확인
4. PLAN.md로 단계 분해 → 담당 에이전트와 승인 게이트 할당
5. 작업 시작 후 STATUS.md 주기적 갱신
6. 주요 판단은 DECISIONS.md에 근거와 불확실성을 함께 누적
7. 완료 전 TESTS.md 검증 → PR 생성
