// 09 에이전트 아레나 — 실시간 시세 → 5초봉 (브라우저·Node 공용, fetch만 사용)
// Binance USDT 무기한 공개 체결(aggTrades)을 받아 5초봉 {t,o,h,l,c,bv,sv}로 묶는다. bv/sv = 매수·매도 주도 체결 대금(USDT)
const API = 'https://fapi.binance.com';

async function getJSON(url, tries = 3) {
  for (let a = 0; a < tries; a++) {
    try { const r = await fetch(url); if (r.ok) return await r.json(); } catch { }
    await new Promise(z => setTimeout(z, 500 * (a + 1)));
  }
  throw new Error('fetch failed: ' + url);
}

export class BarFeed {
  constructor(symbol, barSec = 5) {
    this.symbol = symbol; this.ms = barSec * 1000;
    this.cur = null; this.bars = []; this.lastId = null;
  }
  _add(t) {
    const p = +t.p, q = +t.q * p, bt = Math.floor(t.T / this.ms) * this.ms;
    const last = this.bars[this.bars.length - 1];
    if (!this.cur && last && bt <= last.t) {     // 늦게 도착한 체결 → 이미 마감된 마지막 봉에 합침
      last.h = Math.max(last.h, p); last.l = Math.min(last.l, p); last.c = p;
      if (t.m) last.sv += Math.round(q); else last.bv += Math.round(q);
      return;
    }
    if (this.cur && bt > this.cur.t) this._seal(bt);
    if (!this.cur) this.cur = { t: bt, o: p, h: p, l: p, c: p, bv: 0, sv: 0 };
    const b = this.cur;
    b.h = Math.max(b.h, p); b.l = Math.min(b.l, p); b.c = p;
    if (t.m) b.sv += q; else b.bv += q;          // m=true: 매수자가 메이커 → 매도 주도 체결
  }
  _seal(untilT) {                                 // 현재 봉 마감 + 체결 없는 빈 봉 채우기
    const round = b => ({ ...b, bv: Math.round(b.bv), sv: Math.round(b.sv) });
    this.bars.push(round(this.cur));
    let c = this.cur.c, t = this.cur.t + this.ms;
    while (t < untilT) { this.bars.push({ t, o: c, h: c, l: c, c, bv: 0, sv: 0 }); t += this.ms; }
    this.cur = null;
  }
  // startMs부터 지금까지 과거 체결로 채움 (워밍업)
  async backfill(startMs) {
    let from = startMs;
    for (; ;) {
      const tr = await getJSON(`${API}/fapi/v1/aggTrades?symbol=${this.symbol}&startTime=${from}&endTime=${from + 3_500_000}&limit=1000`);
      if (!tr.length) break;
      for (const t of tr) this._add(t);
      this.lastId = tr[tr.length - 1].a;
      if (tr.length < 1000) break;
      from = tr[tr.length - 1].T + 1;
      if (from > Date.now()) break;
    }
    await this.poll();
  }
  // 새 체결 반영. nowMs 기준으로 끝난 봉은 마감
  async poll(nowMs = Date.now()) {
    for (let guard = 0; guard < 20; guard++) {
      const url = `${API}/fapi/v1/aggTrades?symbol=${this.symbol}&limit=1000` + (this.lastId != null ? `&fromId=${this.lastId + 1}` : '');
      const tr = await getJSON(url);
      for (const t of tr) this._add(t);
      if (tr.length) this.lastId = tr[tr.length - 1].a;
      if (tr.length < 1000) break;
    }
    const sealBefore = Math.floor((nowMs - 1500) / this.ms) * this.ms;   // 1.5초 지연 후 마감(늦게 도착한 체결 흡수)
    if (this.cur && this.cur.t < sealBefore) this._seal(sealBefore);
    else if (!this.cur && this.bars.length) {
      const last = this.bars[this.bars.length - 1];
      for (let t = last.t + this.ms; t < sealBefore; t += this.ms) this.bars.push({ t, o: last.c, h: last.c, l: last.c, c: last.c, bv: 0, sv: 0 });
    }
    return this.bars;
  }
}
