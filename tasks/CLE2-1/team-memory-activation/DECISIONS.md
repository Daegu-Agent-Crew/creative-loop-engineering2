# DECISIONS — team-memory 활성화

## 결정 로그

### 2026-06-20
- 결정: team-memory는 `context/records`, `context/registry`, `context/wiki` 중심 구조를 유지한다.
- 이유: 기록, 등록, 지식 문서를 역할별로 분리해야 에이전트 병렬 작업이 쉬워진다.
- 영향: 후속 자동화와 위키 생성 작업은 이 구조를 전제로 진행한다.

## 열린 쟁점
- [ ] Discord 알림과 GitHub Actions 경계를 어디까지 자동화할지 재정리 필요

## 참고 링크
- GitHub Issue: #1
