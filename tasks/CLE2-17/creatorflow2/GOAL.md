# GOAL — CreatorFlow2

## 목표

브랜드 AI가 여러 YouTube 크리에이터를 분석해 개별 조건과 지급액을 제안하고, 사람 크리에이터의 수락·영상 제출 이후 시스템 검증과 AI 결제 서명으로 Solana Devnet USDC를 안전하게 자동 지급하는 해커톤 서비스를 만든다.

## 가치 가설

- 사용자 가치: 크리에이터는 제안 수락과 영상 제출만 하고, 캠페인 운영·검증·정산은 브랜드 AI와 시스템이 처리한다.
- 기본 목표: 여러 크리에이터의 `제안 → 수락 → 영상 제출 → 검증 → 지급` 상태를 한 화면에서 관리한다.
- 도전 목표: 사람의 매 지급 승인을 제거하되, 브랜드 지갑의 소액 위임 한도 안에서 AI가 실제 결제에 서명하고 시스템이 안전 규칙을 강제한다.

## 성공 기준 (Definition of Done)

- [ ] 심플한 크리에이터 파이프라인 UI가 여러 크리에이터와 개별 지급액을 표시한다.
- [ ] 브랜드 AI가 채널 적합도와 캠페인 예산을 근거로 크리에이터별 제안을 생성한다.
- [ ] 사람 크리에이터가 제안을 수락하고 YouTube 영상을 제출할 수 있다.
- [ ] 시스템이 영상 공개 상태, 제출 기한, 성과, 예산과 중복 지급을 검증한다.
- [ ] 브랜드 AI가 위임 한도 안의 USDC 결제에 서명하고 시스템이 전송·확인·감사 기록을 남긴다.
- [ ] 브랜드 지갑이 AI 지갑 권한을 취소하고 새 지갑으로 교체할 수 있다.
- [ ] 공개 Pages, API, 자동 테스트, Devnet Explorer 증빙과 해커톤 데모가 완성된다.

## 범위

### 포함 (In Scope)

- 브랜드 OpenClaw Gemini AI 1개와 사람 크리에이터
- 크리에이터별 맞춤 제안 금액과 수락
- YouTube 영상 제출·객관 검증·성과 확인
- Solana Devnet 공식 USDC delegate allowance, AI 결제 서명, revoke와 키 교체
- Cloudflare Worker/D1의 정책 검사, 상태 머신, idempotency와 감사 로그
- 파이프라인 중심 반응형 UI와 간단한 크리에이터 제출 화면

### 제외 (Out of Scope)

- 크리에이터 AI와 Agent ID/Workspace 등록
- 반복 가격 협상, 채팅, 범용 크리에이터 마켓플레이스
- Solana Mainnet, 실가치 지급, 세금·법률 계약·분쟁 중재
- Instagram/TikTok 및 YouTube API 영상 업로드

## 관련 이슈

- GitHub Issue: #46
- CLE2-ID: CLE2-17

## 담당자

- 제품 결정: sfex11
- 구현·문서·검증: Codex
- 실행 Agent: OpenClaw Brand AI
