# TESTS — CLE3 수렴 루프 시스템 도입

## 검증 기준

### 기능 테스트
| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|------------|------|-----------|------|
| 1 | 비교·선택 스키마 검증 | 예제 후보/평가 데이터 검증 | 스키마 위반 없음 | ✅ |
| 2 | A/B/C Evaluator — both_bad 케이스 | 품질 낮은 후보 2개 입력 | `both_bad` 반환 → 재생성 트리거 | ⬜ |
| 3 | A/B/C Evaluator — 절대 게이트 | 품질 높은 후보 입력 | 35점 절대 게이트 통과 + A/B 선택 반환 | ✅ |
| 4 | run-panel-jobs.js `--variants` | 세 대표 패널에 `--variants 2` 드라이런 | 패널별 2개 생성 명령 + 평가 명령 | ✅ |
| 5 | 레퍼런스 이미지 주입 | 생성 명령의 `codex -i` 확인 | 단인물 1개, 다인물 2개 참조 전달 | ✅ |
| 6 | 선호 메모리 — 승인 패널 등록 | QA 통과 패널을 preference-memory에 기록 | preference-memory.json 갱신됨 | ⬜ |
| 7 | 선호 메모리 → 다음 생성 반영 | preference-memory 기반 레퍼런스 자동 선택 | 다음 패널 생성 시 참조됨 | ✅ |
| 8 | 단일 패널 end-to-end | 대표 패널 1개에 후보 2× 최대 2회 | 생성→평가→선택→승인 완료 | ⬜ |
| 9 | 사람 블라인드 선호 비교 | AI 선택 vs 사람 선택 비교 | 일치율 ≥ 60% (첫 검증 기준) | ⬜ |
| 10 | `p8-1` 재생성 | 이미지 생성 + 후처리 + 상태 동기화 | 이미지, SVG, panels.json, Manifest 갱신 | ✅ |
| 11 | 기존 기능 회귀 | 문법, dry-run, 잘못된 옵션, 자산 정책 검사 | 기존 기능 손상 없음 | ✅ |

### 단계별 확장 검증
| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|------------|------|-----------|------|
| E1 | EP001 단인물 패널 | 후보 2× 최대 2회 | 1회차 생성·AI 평가 완료, 사람 선택 대기 | 🟡 |
| E2 | EP001 다인물 패널 | 후보 2× 최대 2회 | 1회차 생성·AI 평가 완료, 사람 선택 대기 | 🟡 |
| E3 | EP001 풀페이지/고난도 | 후보 2× 최대 3회 | 1회차 생성·AI 평가 완료, 사람 선택 대기 | 🟡 |
| E4 | EP001 오버레이 확대 | 기존 17개에서 추가 완료 | 오버레이 완료율 향상 | ⬜ |
| E5 | EP002 확대 | EP001 검증 후 EP002 적용 | EP002 30→49+ 패널 | ⬜ |

### 비기능 테스트
| # | 테스트 항목 | 방법 | 기대 결과 | 통과 |
|---|------------|------|-----------|------|
| N1 | 생성 시간 | 패널당 2후보 생성 시간 측정 | 단일 생성 대비 ≤ 2.5배 | ⬜ |
| N2 | 기존 데이터 호환성 | 개편 후 기존 panels.json, state.json 정상 | 기존 데이터 손상 없음 | ⬜ |
| N3 | 루프 종료 안정성 | 최대 반복 도달 시 강제 종료 | 무한 루프 없음 | ⬜ |
| N4 | 비용 추적 | 패널당 생성 횟수 로깅 | 예산 범위 내 유지 | ⬜ |

### 자동화 테스트 (계획)
```bash
# 스키마와 선호 메모리 검증
node scripts/validate-candidates.js schemas/examples/candidates.example.json
node scripts/validate-preference-memory.js episodes/EP001/panels/preference-memory.json

# Evaluator 단위 테스트
node scripts/run-panel-jobs.js --episode EP001 --panel p2-3 --variants 2 --max-iterations 2 --dry-run

# run-panel-jobs.js 회귀 테스트
node scripts/run-panel-jobs.js --episode EP001 --dry-run --max-jobs 3

# 수렴 루프 드라이런
node scripts/run-panel-jobs.js --episode EP001 --panel p2-3 --variants 2 --max-iterations 2 --iteration 2 --diagnosis "평가 결과의 next_prompt_adjustment" --dry-run
```

## 검증 결과
- **검증 일자**: 2026-08-15
- **검증자**: Codex
- **결과**: 후보 스키마 3건, 선호 메모리, 참조 체인, runner, 자산 정책, CLE3 수렴 UI 데스크톱/모바일 검증 통과. 실제 후보 6개 생성과 AI 평가 완료. 사람 선택 및 GitHub 반영은 대기.

## 대표 패널 선정 기준 (E1~E3)
| 유형 | 선정 기준 | 후보 패널 (제안) |
|------|----------|----------------|
| 단인물 | 1명 캐릭터, 감정 표현 중심 | EP001 `p2-3` |
| 다인물 | 2+ 캐릭터 상호작용 | EP001 `p15-3` |
| 풀페이지/고난도 | 복잡한 배경, 파노라마 | EP001 `p6-1` |
