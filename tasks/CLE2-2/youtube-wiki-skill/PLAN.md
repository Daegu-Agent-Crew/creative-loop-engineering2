# PLAN — 유튜브 자료를 team-memory wiki에 흡수하는 워크플로우/스킬 개발

## 실행 계획

### Phase 1: 자막 추출 파이프라인
- **담당**: 대구루
- **입력**: 유튜브 URL
- **출력**: 정제된 텍스트 파일
- **예상 시간**: 1시간
- **상태**: ✅ 완료 (yt-dlp + VTT 정제 스크립트)

### Phase 2: 구조화 요약
- **담당**: 대구루 (LLM 활용)
- **입력**: 정제된 텍스트
- **출력**: 메타데이터, 핵심메시지, 주요내용, 인사이트 구조의 마크다운
- **예상 시간**: 에이전트 내장 (별도 시간 불필요)
- **상태**: ✅ 완료

### Phase 3: GitHub 등록 자동화
- **담당**: 대구루
- **입력**: 요약 마크다운
- **출력**: team-memory repo context/records/ 파일 생성
- **예상 시간**: 30분
- **상태**: ✅ 완료 (GitHub API PUT)

### Phase 4: OpenClaw 스킬화
- **담당**: 대구루
- **입력**: Phase 1-3 파이프라인
- **출력**: ~/.openclaw/workspace/skills/youtube-to-wiki/SKILL.md
- **예상 시간**: 1시간
- **상태**: ✅ 완료 (스킬 등록됨)

### Phase 5: 이슈 댓글 자동화
- **담당**: 대구루
- **입력**: 등록 결과 URL
- **출력**: 관련 CLE2 이슈에 결과 댓글
- **예상 시간**: 30분
- **상태**: 🔄 설계 중

## 의존성
- yt-dlp 설치
- GITHUB_TOKEN (.env)
- OpenClaw 스킬 시스템

## 리스크
- 자막 없는 영상 → whisper.cpp fallback (차후)
- YouTube rate limit → 백오프 전략
