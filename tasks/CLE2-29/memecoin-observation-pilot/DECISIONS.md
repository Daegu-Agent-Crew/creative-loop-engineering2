# DECISIONS — 밈코인 관측 파일럿 (CLE2-29)

> 이 문서는 해당 요구사항에서 합의된 핵심 결정, 보류된 쟁점, 참고 링크를 누적 기록한다.
>
> **판정 규칙은 여기에 옮겨 적지 않는다.** 판정 절차·유보 규칙의 유일한 기준은 [PRE-REGISTRATION.md @ 05cb20f](https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/blob/05cb20f8540c4e29bffc75be84c3c7b8f42ef237/tasks/CLE2-29/memecoin-observation-pilot/PRE-REGISTRATION.md) 이다. 이 문서와 PRE-REG가 다르게 읽히면 PRE-REG가 우선한다.
>
> **서명 한계:** 아래 "사람 승인" 출처는 (not-required 항목 제외) 모두 sfex11 계정 또는 GitHub 밖 채널이다. 회장님 직접 작성과 에이전트 대필을 GitHub상 구분할 수 없으므로 "미인증"으로 표기한다 (결정 카드 #106 C2 참조).

## 사용 규칙
- 짧은 논의는 GitHub Issue 댓글에 남긴다.
- 장기적으로 참조할 결정은 이 문서에 옮긴다.
- 최종 상태 변경은 `GOAL.md`, `PLAN.md`, `STATUS.md`, `TESTS.md`에 반영한다.

## 결정 로그

### 2026-09-26 — 관측 시작 T0
- 결정: T0 = 2026-09-26, 관측 1주일, 최종 판정 D+7 = 2026-10-03
- 근거: 스모크 테스트 PASS (dry-run·실측 8코인, 서명/발송 0건) — [STATUS.md](STATUS.md)
- 출처: 이슈 #102 / PR #104 · 사람 승인: 미인증

### 2026-09-26 — 판정 함수 v2 동결 · prior B 55 : A 45
- 결정: 4스위치 + S1 프레임 조항(코인-가중/모집단-가중 병기)으로 판정 함수 v2를 동결. baseline 95코인 재판정 결과 prior B 55 : A 45
- 주의: 55:45는 판정의 **출발점으로 정한 값(결정)**이며 근거 있는 추정이 아니다. A·B 사이의 증거로 해석하지 않는다.
- 표본: #101 소급 프로브 100코인 중 baseline 재판정에 쓰인 95코인 (제외 5코인의 사유는 #101 원문 참조 — 이 문서에서 미확인)
- 근거: [#101](https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/pull/101) (100코인 소급 프로브)
- 감지 수단: ai-solana-agent `dapp4-pipeline/FROZEN.sha256` + `freeze-guard.yml` CI ([ai-solana-agent PR #11](https://github.com/Daegu-Agent-Crew/ai-solana-agent/pull/11), 2026-09-28 머지) — 같은 계정이 해시와 CI를 함께 고치면 우회 가능 (#106 C2 전 한계)
- 사람 승인: 미인증

### 2026-09-28 — 판정 절차 사전등록
- 결정: 판정 규칙을 판정 전에 문서로 고정 (사후 기준 조정 방지)
- 내용: [PRE-REGISTRATION.md @ 05cb20f](https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/blob/05cb20f8540c4e29bffc75be84c3c7b8f42ef237/tasks/CLE2-29/memecoin-observation-pilot/PRE-REGISTRATION.md) — 링크로만 참조
- 출처: PR #105 · 사람 승인: 미인증

### 2026-09-28 — CLE2-25 흡수 범위
- 결정: CLE2-25(밈코인 발행 파이프라인)를 이 과제에 흡수하고 CLE2-25는 동결
- 경계: 흡수 대상은 관측·분석 자산뿐이다. 토큰 발행·유동성 공급·매도·mainnet 거래·지갑 서명은 흡수 대상이 아니다.
- 출처: 회장님 지시 (GitHub 밖 채널, 미인증) — [CLE2-25 STATUS](../../CLE2-25/solana-memecoin-pipeline/STATUS.md)

### 2026-09-28 — 최종 판정 산출물은 초안 전용
- 결정: D+7 판정 크론(`2bf548eb`)은 초안(`final-verdict-D7-DRAFT.md`)만 만들고, 리포 커밋·대시보드 갱신·이슈 종료·STATUS "최종" 표기는 회장님 확인 후 별도로 실행
- 근거: Claude 3차 재검증 · 사람 승인: not-required (제한을 조이는 변경)

## 열린 쟁점
- [ ] era-2 무작위 pump 테일 프레임 — D+5(2026-10-01) 점검에서 확보되지 않았으면 해당 프레임 "판정 불가"를 판정 전에 확정
- [ ] 0.8 슬롯(거짓주장률) — 담론 패널 주장 0건. 처리 규칙은 PRE-REG §7
- [ ] 결정 카드 #106 (C1~C4) 회장님 결정 대기

## 참고 링크
- GitHub Issue: #102
- 관련 PR: #103, #104, #105 · ai-solana-agent #11
- 관련 문서: [PRE-REGISTRATION.md](https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/blob/05cb20f8540c4e29bffc75be84c3c7b8f42ef237/tasks/CLE2-29/memecoin-observation-pilot/PRE-REGISTRATION.md) · [OWNERS.md](../../../OWNERS.md)
