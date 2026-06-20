# GOAL — 유튜브 자료를 team-memory wiki에 흡수하는 워크플로우/스킬 개발

## 목표
유튜브 영상 URL을 입력하면 자막 추출→구조화 요약→team-memory wiki 등록→이슈 댓글 작성까지 자동화하는 재사용 가능한 스킬을 개발한다.

## 성공 기준 (Definition of Done)
- [ ] 유튜브 URL 입력만으로 자막 자동 추출
- [ ] 한국어/영어 자막 지원
- [ ] 구조화된 요약 (메타데이터, 핵심메시지, 주요내용, 팀 인사이트)
- [ ] team-memory repo에 자동 PR 또는 direct commit
- [ ] 관련 CLE2 이슈에 결과 댓글 자동 작성
- [ ] 스킬이 OpenClaw 스킬 디렉토리에 등록되어 재사용 가능

## 범위
### 포함 (In Scope)
- yt-dlp 기반 자막 추출
- VTT 정제 Python 스크립트
- LLM 기반 구조화 요약
- GitHub API로 team-memory 등록
- OpenClaw 스킬 패키징

### 제외 (Out of Scope)
- 음성 인식 fallback (whisper.cpp) — 차후 확장
- 자동 유튜브 채널 모니터링

## 관련 이슈
- GitHub Issue: #3
- CLE2-ID: 2
- 영상 예시: https://youtu.be/5jG9qLe8G8M

## 담당자
- 대구루 (개발)
