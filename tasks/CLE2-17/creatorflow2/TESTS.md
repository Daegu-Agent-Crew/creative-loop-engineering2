# TESTS — CreatorFlow2

## 검증 기준

| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|---|---|---|---|
| 1 | 파이프라인 | UI E2E | 각 크리에이터가 제안·수락·제출·검증·지급 중 정확히 한 상태에 있다 | ✅ |
| 2 | 개별 제안 | API/정책 테스트 | 브랜드 AI가 예산 상한 안에서 크리에이터별 다른 금액을 제안한다 | ✅ |
| 3 | 사람 크리에이터 | 브라우저 E2E | 별도 Agent 등록 없이 수락과 YouTube 제출을 완료한다 | ⬜ |
| 4 | 객관 검증 | Worker 통합 테스트 | 공개 상태·기한·성과·예산 불충족 시 지급 단계로 이동하지 않는다 | ✅ |
| 5 | AI 결제 서명 | Devnet E2E | OpenClaw AI 지갑 서명으로 정확한 수신자·금액만 지급된다 | ⬜ |
| 6 | 위임 한도 | 보안 테스트 | allowance 초과, 오수신자, 중복 지급과 재사용 거래가 거부된다 | ✅ |
| 7 | 키 교체 | Devnet E2E | 기존 delegate revoke 후 이전 키는 실패하고 새 키만 동작한다 | ⬜ |
| 8 | 감사 로그 | API/UI 검사 | AI 판단 근거, 시스템 검증, tx signature가 순서대로 기록된다 | ⬜ |
| 9 | 반응형 UI | 브라우저 QA | 데스크톱·모바일에서 다음 행동과 상태를 쉽게 이해한다 | ✅ |

## 자동화 테스트

```text
lint → typecheck → unit/integration → build → Worker contract → browser E2E → Devnet transaction verification
```

## 검증 결과

- 검증 일자: 2026-07-22
- 검증자: Codex
- 결과: 자동 테스트 27개, lint, React build, Worker typecheck, 운영 의존성 취약점 0건, Gemini 자동 지급 설정 UI와 분리 Worker/D1 운영 QA 통과. 실제 Phantom allowance·Gemini 판단·Devnet 자동 지급 E2E는 대기.
- 근거 링크: CreatorFlow2 commit `11e1fa8`, Pages commit `d55ad3a`, CLE2-17 Issue #46

## 인계 확인

- 브랜드 AI와 시스템이 각각 어떤 결제 책임을 갖는가?
- AI 키를 잃어버렸을 때 브랜드 자금이 안전한 이유는 무엇인가?
- 크리에이터별 지급액과 시스템 hard cap은 어떻게 다르게 동작하는가?
