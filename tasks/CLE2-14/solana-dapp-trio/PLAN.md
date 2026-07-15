# PLAN — Solana 기반 3개 DApp 개발

## Phase 1: DApp 2 — NFT 쿠폰 (기존 코드 재활용)
- [ ] 기존 ai-solana-agent 코드 분석 및 분리
- [ ] NFT 쿠폰 생성 + 민팅 (Metaplex)
- [ ] 보유 쿠폰 목록 조회
- [ ] 쿠폰 사용 처리 (중복 방지)
- [ ] 유효기간 설정
- [ ] 발행자 권한 관리

## Phase 2: DApp 1 — 출석
- [ ] Anchor 프로그램 작성 (출석 카운터)
- [ ] Phantom 연결 + 출석 등록 (하루 1회)
- [ ] 누적 출석 수 조회
- [ ] 전체 랭킹

## Phase 3: DApp 3 — 로컬 크레딧
- [ ] Anchor 프로그램 작성 (크레딧 누적)
- [ ] 활동 등록 + 크레딧 지급
- [ ] 중복 활동 방지
- [ ] 크레딧 잔액 조회 + 랭킹

## Phase 4: 후속 기능
- [ ] QR 코드 생성/스캔
- [ ] 위치 인증 (Geolocation API)
- [ ] AI 생성 NFT 이미지

## Phase 5: 배포
- [ ] GitHub Pages /dapp1, /dapp2, /dapp3 라우팅
- [ ] 통합 인덱스 페이지
- [ ] 최종 테스트
