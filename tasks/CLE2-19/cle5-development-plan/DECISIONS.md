# DECISIONS — CLE5 개발 계획

## 결정 로그

### 2026-08-03 — CLE5를 독립 요구사항으로 등록
- 결정: CLE5 개발 계획을 `CLE2-19 / Issue #51`로 등록한다.
- 이유: `CLE2-9`에는 기존 CLE3와 새 CLE4 문서가 함께 있어 같은 ID에 CLE5까지 추가하면 목표와 완료 상태를 판정할 수 없다.
- 근거 및 사용한 레퍼런스: `origin/main`의 `tasks/CLE2-9/three-body-cle3/`, `tasks/CLE2-9/cle4-creative-system/`
- 확신도: high
- 남아 있는 불확실성: CLE4 자체를 향후 별도 CLE2 ID로 재정리할지 여부
- 검토한 대안: CLE2-9 아래 `cle5/` 추가
- 사람 승인: approved
- 영향: CLE5는 자체 GOAL/STATUS/TESTS와 Issue 타임라인을 가진다.

### 2026-08-03 — CLE5의 핵심 책임은 외재화된 성장 루프
- 결정: CLE4가 창작 철학과 작품 생성 파이프라인을 소유하고, CLE5는 경험 저장, 재발 판정, 원칙 생명주기와 세대 상속을 추가로 소유한다.
- 이유: 모델 자체의 세션 간 학습을 전제로 하면 재현성과 감사 가능성을 확보할 수 없다.
- 근거 및 사용한 레퍼런스: `research/GROWTH.md`, `research/feedback-tags.yaml`
- 확신도: high
- 남아 있는 불확실성: 독립 저장소 또는 CLE4 메이저 개정 중 배치 방식
- 검토한 대안: `memory/lessons-learned.md`만 누적
- 사람 승인: pending
- 영향: Growth Loop 산출물은 파일과 Git 이력으로 보존하고 새 세션이 부팅 시 읽는다.

### 2026-08-03 — 원칙 승격은 자동 판정과 사람 승인을 결합
- 결정: 2회 WATCH와 3회 승격 후보 판정은 자동화하되 정식 원칙 반영은 근거 사례 검토와 사람 승인 후 확정한다.
- 이유: 단순 빈도는 에피소드 길이와 피드백 양에 영향을 받고 미학적 원칙을 잘못 고정할 수 있다.
- 근거 및 사용한 레퍼런스: `research/GROWTH.md` G4, CLE2-13 Human in the Loop
- 확신도: medium
- 남아 있는 불확실성: 실제 운영에서 적절한 임계값
- 검토한 대안: 세 번째 발생 즉시 SYSTEM.md 자동 수정
- 사람 승인: pending
- 영향: 실행기는 후보와 근거를 만들고 승인된 변경만 공식 원칙 버전에 반영한다.

### 2026-08-03 — 원본 자료는 research로 보존
- 결정: 제공된 6개 파일은 의미를 바꾸지 않고 `research/`에 보존하며, CLE5 운영본은 이후 schema와 실행 계약에 맞춰 별도 생성한다.
- 이유: 원본 컨설팅 자료와 구현 중 개정된 규칙을 구분해야 출처와 변경 근거가 유지된다.
- 근거 및 사용한 레퍼런스: `/Users/chulhyunhwang/Downloads/cle5/`
- 확신도: high
- 남아 있는 불확실성: CLE4 원본 blueprint와 철학 문서의 공식 위치
- 검토한 대안: 제공 파일을 즉시 CLE5 운영 루트로 사용
- 사람 승인: not-required
- 영향: research는 불변 입력으로 취급하고 운영 데이터는 구현 저장소에서 버전 관리한다.

## 열린 쟁점
- [ ] CLE5 독립 저장소 생성 여부와 이름
- [ ] CLE4 원본 blueprint, 철학 연구, 독자 시뮬레이션의 공식 경로
- [ ] 첫 시범 에피소드와 기준 산출물
- [ ] 비평가 모델, 비용 상한과 실패 시 대체 경로
- [ ] 2/3/4회 임계값의 시범 운영 후 조정 기준

## 참고 링크
- GitHub Issue: #51
- 선행 요구사항: CLE2-9 / CLE4, CLE2-13
- 관련 문서: `research/GROWTH.md`, `research/feedback-tags.yaml`, `research/case-library/`
