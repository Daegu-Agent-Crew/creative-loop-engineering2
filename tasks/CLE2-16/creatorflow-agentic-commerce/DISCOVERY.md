# DISCOVERY — CreatorFlow Agentic Creator Commerce

## 작업 맥락

- 사용자/운영자: Solana AI Agentic 해커톤 참가팀과 CreatorFlow 데모 운영자
- 실제 문제: 크리에이터 협업은 제안, 협상, 검수, 게시 확인, 성과 확인과 지급이 분리되어 느리고 분쟁 증빙이 약하다.
- 기대 가치: 공개 YouTube 데이터와 온체인 지급을 연결해 Agent가 협상부터 정산까지 완료한다.
- 관련 시스템: `ai-solana-agent`, OpenClaw, GitHub Pages, Cloudflare Worker/D1, YouTube Data API, Solana Devnet

## Unknown Map

### Known Known

- 해커톤 마감은 2026-08-03 23:59 KST이며, 소개서·GitHub·데모 영상이 필수다.
- 심사 기준에 Gemini/Google Cloud AI, Solana 결제, 실제 Agent 트랜잭션과 실행 로그가 포함된다.
- OpenClaw Brand/Creator Agent의 두뇌는 Gemini를 사용한다.
- Agent는 CreatorFlow 웹페이지를 브라우저로 직접 조작한다.
- UI는 GitHub Pages, 공유 상태/API는 Cloudflare Worker/D1을 사용한다.
- Treasury `FWmGGKtczrdtWQJNdimApAfzBxEKdoDFwCFQtP9DEB5i`에 약 4.956 Devnet SOL이 있다.
- Treasury의 공식 Circle Devnet USDC 잔액은 20이고 mint는 `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`다.
- Treasury USDC Token Account는 `HHxjRNC6KZHqpk5c4tGzxUqzbSahz8Tby7BWdcsE5GfK`다.
- SPL Token Account에는 한 시점에 하나의 delegate와 delegated amount만 설정할 수 있다.
- YouTube API 미감사 프로젝트가 `videos.insert`로 올린 영상은 private 제한을 받으므로 Studio 직접 업로드를 사용한다.

### Known Unknown

- [ ] OpenClaw에 사용할 Solana Wallet 생성·서명 도구의 설치 형태
- [ ] Brand Agent와 Creator Agent가 사용할 실제 OpenClaw 인스턴스와 브라우저 세션
- [ ] Creator Agent 수령 Wallet 공개키
- [ ] YouTube 데모 채널, OAuth Client와 API key
- [ ] 새 저장소가 기존 `ai-solana-agent` 저장소로 빌드 산출물을 전달할 인증 방식
- [ ] 데모 당일 사용할 unlisted/public 영상과 KPI 기준 조회수

### Unknown Known

- [ ] OpenClaw 비밀 저장소에 Wallet private key를 넣는 기존 팀 규칙
- [ ] Phantom 모바일과 데스크톱 중 최종 owner approve/revoke 데모 환경
- [ ] 기존 Cloudflare 계정의 D1/KV 네이밍 및 배포 관례

### Unknown Unknown 후보

- [ ] YouTube 조회수 반영 지연으로 이미 충족한 KPI가 즉시 반환되지 않을 수 있다.
- [ ] 공개 전환 직후 `videos.list` status 캐시가 늦게 갱신될 수 있다.
- [ ] Devnet RPC rate limit 또는 faucet 장애가 데모에 영향을 줄 수 있다.
- [ ] 브라우저 자동화가 OAuth 또는 Wallet 팝업을 안정적으로 처리하지 못할 수 있다.
- [ ] Owner가 allowance 승인 후 USDC를 별도로 써서 잔액이 부족해질 수 있다.
- [ ] Agent가 같은 마일스톤을 재시도해 중복 트랜잭션을 만들 수 있다.

## 탐색 활동

- 기존 4개 DApp 소스, GitHub Actions, Pages와 Cloudflare API를 검토했다.
- 최신 NFT mint를 Solana Devnet RPC에서 확인했다.
- Treasury의 SOL과 모든 SPL Token Account를 공개 RPC로 조회했다.
- Circle 공식 Devnet USDC mint와 Treasury 잔액 20을 대조했다.
- YouTube 공식 `videos.insert`, `videos.update`, `videos.list`, `channels.list` 제약을 확인했다.
- Instagram 대신 공개 조회수 검증이 쉬운 YouTube를 MVP 채널로 확정했다.

## 도구 확인

| 도구/데이터 | 목적 | 상태 | 제한/대안 |
|---|---|---|---|
| OpenClaw + Gemini | 협상·검수 판단과 브라우저 작업 | 사용 결정 | Wallet 도구 구현 필요 |
| GitHub Pages | 사람/Agent 공용 UI | available | 공유 쓰기는 Worker 필요 |
| Cloudflare Worker/D1 | API, 상태, 정책, 감사 로그 | available | 비밀값은 Worker Secret 사용 |
| Solana Devnet RPC | allowance와 지급 실행·검증 | verified | 재시도와 보조 RPC 검토 |
| Circle Devnet USDC | 3단계 지급 | verified | 테스트 자산이며 실가치 없음 |
| YouTube Data API | 채널·상태·조회수 | setup-needed | credentials와 데모 채널 필요 |
| GitHub Actions | cross-repo Pages 배포 | available | 최소 권한 token 또는 App 필요 |

## 레퍼런스

- 해커톤: <https://www.gcp-solana-ai-agentic-hacks-kr.xyz/>
- 기존 Hub: <https://daegu-agent-crew.github.io/ai-solana-agent/>
- 기존 저장소: <https://github.com/Daegu-Agent-Crew/ai-solana-agent>
- Circle USDC 주소: <https://developers.circle.com/stablecoins/usdc-contract-addresses>
- Solana delegate: <https://solana.com/docs/tokens/basics/approve-delegate>
- Solana revoke: <https://solana.com/docs/tokens/basics/revoke-delegate>
- YouTube videos.insert: <https://developers.google.com/youtube/v3/docs/videos/insert>
- YouTube videos.update: <https://developers.google.com/youtube/v3/docs/videos/update>
- CLE2 Issue: <https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/issues/42>

## 실행 전 판단

- 계속 진행 가능한 가정: Agent는 Wallet private key를 OpenClaw의 비밀 저장소에서만 사용하고 CreatorFlow에는 공개키와 서명 증명만 제공한다.
- 사람 결정 필요: Creator 수령 Wallet, YouTube 채널/OAuth, 최종 데모 영상.
- 에스컬레이션 조건: private key 노출 가능성, official USDC mint 불일치, delegate/revoke 검증 실패, cross-repo token 권한 과다.

## 도전 목표

- 기존 트레이드오프: 브라우저 조작은 Agent 동작을 잘 보여주지만 API 직접 호출보다 느리고 실패 가능성이 높다.
- 자동화 가설: 동일 Worker API를 UI와 기계 호출 양쪽에서 사용하되, 데모는 OpenClaw가 실제 UI를 조작하고 감사 로그에는 동일한 결정·서명·결과를 남긴다.
