# laika 데이터 수집기 2건 — OKX funding/OI · HL 청산 (2026-11-17 완성)

회장님 2026-11-16 연구 지시(FB-20261116-05) 2b항: 11/1 동결돼 SHA 미제출 보류였던 수집기 2건의 완성본.

## 1) OKX funding/OI — tools/collectors/collect_okx_funding_oi.py
- 용도: funding dead-zone 가설. USDT SWAP 상위 30종(또는 --symbols 지정)의 현재 펀딩레이트·직전 3회 결산·OI를 틱당 JSONL로 적재.
- 방식: OKX 공개 REST(읽기 전용). 권장 주기 6h(펀딩 결산 8h 경계 커버).
- 스키마: data/laika-collectors/okx-funding-oi/YYYY-MM-DD.jsonl — {ts, instId, funding_rate, funding_next, funding_hist_24h[], oi, oi_ccy, oi_usd}
- 스모크(2026-11-17): BTC/ETH-USDT-SWAP 2종 기록 성공, 펀딩·OI 전 필드 유의값.

## 2) HL 청산 — tools/collectors/collect_hl_liquidations.mjs
- 용도: 청산 주문분산 가설. HyperLiquid 청산 체결 스냅샷을 JSONL로 적재.
- 방식: 공개 WS trades 채널(BTC,ETH,SOL, --coins 확장) 구독 후 청산 배출 주소(HL liquidation vault 0x5078...bedb6 등)가 체결 상대인 필만 기록. 독립 liquidation 채널은 공개 API에서 폐지되어 이 방식이 현행 최소 구현이다.
- 스키마: data/laika-collectors/hl-liquidations/YYYY-MM-DD.jsonl — {ts, coin, side, px, sz, time, hash, tid, users}
- 스모크(2026-11-17): 구독 3/3 성공, 30초간 체결 393건 관측, 청산 이벤트 0(조용한 시장 — 이벤트 sparse는 설계상 예상). 장기 실행 시 이벤트 포착.

## 실행
- python3 tools/collectors/collect_okx_funding_oi.py
- node tools/collectors/collect_hl_liquidations.mjs --seconds 3600

## 동결 SHA
- COLLECTORS.sha 참조. 검증 구간(라이카 규칙 5×7일) 중 코드·스키마 변경 금지, 변경 시 본 문서와 SHA 동시 갱신.

크론 등록은 별도 승인 후(본 완성 보고에는 미등록). attribution: agent:daeguru(subagent 완성, laika 가설 지원)
