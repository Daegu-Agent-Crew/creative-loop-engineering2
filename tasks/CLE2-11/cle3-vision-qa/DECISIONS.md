# DECISIONS — CLE3 Vision QA / 결과 검수 시스템

## 결정 로그

### 2026-07-06
- 결정: Vision QA는 정합성 린트와 분리된 후속 태스크로 `CLE2-11`에서 관리한다.
- 이유: 정합성 린트는 규칙 점검이고, Vision QA는 시각 결과 해석과 승인 흐름이 중심이기 때문이다.
- 영향: CLE2-11은 `Panel.selectedResult`, ReviewNote, 승인 흐름에 집중한다.

## 열린 쟁점
- [ ] Vision QA를 에피소드 단위로 묶어 볼지, 패널 단위 우선으로 볼지 결정 필요

## 참고 링크
- 상위 태스크: `CLE2-9`
- GitHub Issue: `#27`
- 관련 문서: `tasks/CLE2-9/three-body-cle3/OBJECT-MODEL.md`
