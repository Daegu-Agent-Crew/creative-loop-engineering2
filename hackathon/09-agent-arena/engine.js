// 09 에이전트 아레나 — 경기 엔진 (브라우저·Node 공용, DOM 없음, 결정론적)
// 입력: 5초봉 {t,o,h,l,c,bv,sv} 배열(종목별) + 에이전트 규칙(JSON) → 이벤트 타임라인 + 결과
// 체결: 봉 마감 때 판단 → 다음 봉 시가에 시장가 체결(미끄러짐 1bp) · 테이커 수수료 0.05%(명목가 기준, 진입·청산 각각)
// 손절·익절: 봉 고가·저가로 판정, 같은 봉에서 둘 다 닿으면 손절 우선(보수적)

export const RULES = {
  bar_sec: 5, warmup_bars: 60, match_bars: 120,      // 워밍업 5분 + 경기 10분
  start_equity: 1000, fee: 0.0005, slip: 0.0001, mmr: 0.005,
  max_leverage: 5, max_trades: 20, no_trade_penalty: -1,     // 참가 의무: 경기 중 진입 0회면 -1점
  symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
  indicators: ['ret', 'rsi', 'zscore', 'vol', 'trend', 'flow'], ops: ['>', '<', '>=', '<=']
};

// ---------- 규칙 검사 (대회 규정 위반이면 오류 목록 반환) ----------
export function validate(rule) {
  const err = [];
  const num = (x, lo, hi, name) => { if (typeof x !== 'number' || !(x >= lo && x <= hi)) err.push(`${name}: ${lo}~${hi} 숫자여야 함 (받은 값 ${x})`); };
  if (!rule || typeof rule !== 'object') return ['규칙이 비어 있음'];
  if (!/^[a-z0-9_-]{2,32}$/.test(rule.agent || '')) err.push('agent: 영문 소문자 ID');
  if (!RULES.symbols.includes(rule.symbol)) err.push(`symbol: ${RULES.symbols.join('/')} 중 하나`);
  num(rule.leverage, 1, RULES.max_leverage, 'leverage');
  if (!Array.isArray(rule.entry) || !rule.entry.length || rule.entry.length > 4) err.push('entry: 1~4개 규칙');
  for (const [i, e] of (rule.entry || []).entries()) {
    if (!['long', 'short'].includes(e.side)) err.push(`entry[${i}].side: long/short`);
    if (!Array.isArray(e.when) || !e.when.length || e.when.length > 4) err.push(`entry[${i}].when: 조건 1~4개`);
    for (const c of e.when || []) {
      if (!RULES.indicators.includes(c.ind)) err.push(`조건 지표 ${c.ind}: ${RULES.indicators.join('/')} 중 하나`);
      if (!RULES.ops.includes(c.op)) err.push(`조건 비교 ${c.op}`);
      num(c.n ?? 12, 2, 60, `${c.ind}.n`);
      if (c.ind === 'trend') num(c.m ?? 24, 3, 60, 'trend.m');
      num(c.v, -1000, 1000, `${c.ind}.v`);
    }
  }
  const x = rule.exit || {};
  num(x.stop_pct, 0.05, 10, 'exit.stop_pct'); num(x.take_pct, 0.05, 20, 'exit.take_pct');
  num(x.max_hold_bars ?? 120, 1, 120, 'exit.max_hold_bars');
  num(rule.cooldown_bars ?? 0, 0, 120, 'cooldown_bars');
  num(rule.max_trades ?? RULES.max_trades, 1, RULES.max_trades, 'max_trades');
  return err;
}

// ---------- 지표 (봉 i 마감 기준, 미래 정보 없음) ----------
function ind(bars, i, c) {
  const n = c.n ?? 12;
  if (i - n < 0) return null;
  const C = k => bars[k].c;
  switch (c.ind) {
    case 'ret': return (C(i) / C(i - n) - 1) * 100;                          // % 수익률
    case 'rsi': { let up = 0, dn = 0; for (let k = i - n + 1; k <= i; k++) { const d = C(k) - C(k - 1); d > 0 ? up += d : dn -= d; } return dn === 0 ? 100 : 100 - 100 / (1 + up / dn); }
    case 'zscore': { let s = 0, s2 = 0; for (let k = i - n + 1; k <= i; k++) { s += C(k); s2 += C(k) ** 2; } const m = s / n, sd = Math.sqrt(Math.max(s2 / n - m * m, 0)); return sd ? (C(i) - m) / sd : 0; }
    case 'vol': { const r = []; for (let k = i - n + 1; k <= i; k++) r.push(C(k) / C(k - 1) - 1); const m = r.reduce((a, b) => a + b, 0) / n; return Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / n) * 100; }
    case 'trend': { const m = c.m ?? 24; if (i - m < 0) return null; const ema = len => { const a = 2 / (len + 1); let e = C(i - m); for (let k = i - m + 1; k <= i; k++) e = a * C(k) + (1 - a) * e; return e; }; return (ema(n) / ema(m) - 1) * 100; }
    case 'flow': { let b = 0, s = 0; for (let k = i - n + 1; k <= i; k++) { b += bars[k].bv; s += bars[k].sv; } return b + s ? (b - s) / (b + s) : 0; } // −1(매도 우위)~+1(매수 우위)
  }
  return null;
}
const cmp = (a, op, b) => op === '>' ? a > b : op === '<' ? a < b : op === '>=' ? a >= b : a <= b;

// ---------- 한 에이전트 경기 ----------
export function runAgent(bars, rule, R = RULES, final = true) {   // final=false: 생중계 중간 계산(마지막 봉 강제 청산 안 함)
  const ev = [];
  const lev = rule.leverage, x = rule.exit, cool = rule.cooldown_bars ?? 0, maxT = rule.max_trades ?? R.max_trades;
  const hold = x.max_hold_bars ?? R.match_bars;
  const t0 = R.warmup_bars, tEnd = Math.min(bars.length, t0 + R.match_bars);
  let eq = R.start_equity, pos = null, pending = null, trades = 0, lastExit = -1e9, peak = eq, mdd = 0, liquidated = false;
  const curve = [];
  const close = (k, px, why) => {
    const gross = pos.side * (px / pos.px - 1) * pos.notional;
    const fee = pos.notional * (px / pos.px) * R.fee;
    eq += gross - fee;
    ev.push({ k, type: 'exit', why, side: pos.side, px, pnl: +(gross - fee - pos.fee).toFixed(4), eq: +eq.toFixed(4) });
    pos = null; lastExit = k;
  };
  for (let k = t0; k < tEnd; k++) {
    const b = bars[k];
    if (pending && !liquidated) {            // 직전 봉 신호 → 이번 봉 시가 체결
      const px = b.o * (1 + pending.side * R.slip);
      const notional = eq * lev, fee = notional * R.fee;
      eq -= fee;
      pos = { side: pending.side, px, notional, fee, k, stop: px * (1 - pending.side * x.stop_pct / 100), take: px * (1 + pending.side * x.take_pct / 100), liq: px * (1 - pending.side * (1 / lev - R.mmr)) };
      ev.push({ k, type: 'enter', side: pos.side, px, why: pending.why, eq: +eq.toFixed(4) });
      trades++; pending = null;
    }
    if (pos) {
      const adverse = pos.side > 0 ? b.l : b.h, favor = pos.side > 0 ? b.h : b.l;
      const hit = lvl => pos.side > 0 ? adverse <= lvl : adverse >= lvl;
      if (hit(pos.liq)) { eq = 0; ev.push({ k, type: 'liquidated', side: pos.side, px: pos.liq, eq: 0 }); pos = null; liquidated = true; }
      else if (hit(pos.stop)) close(k, pos.stop * (1 - pos.side * R.slip), 'stop');
      else if (pos.side > 0 ? favor >= pos.take : favor <= pos.take) close(k, pos.take, 'take');
      else if (k - pos.k >= hold) close(k, b.c * (1 - pos.side * R.slip), 'time');
    }
    const mtm = pos ? eq + pos.side * (b.c / pos.px - 1) * pos.notional : eq;
    peak = Math.max(peak, mtm); mdd = Math.max(mdd, peak > 0 ? 1 - mtm / peak : 0);
    curve.push(+mtm.toFixed(4));
    if (liquidated) continue;
    if (!pos && k < tEnd - 1 && trades < maxT && k - lastExit > cool) {
      for (const e of rule.entry) {
        const vals = e.when.map(c => ind(bars, k, c));
        if (vals.every((v, j) => v !== null && cmp(v, e.when[j].op, e.when[j].v))) {
          pending = { side: e.side === 'long' ? 1 : -1, why: e.when.map((c, j) => `${c.ind}${c.n ?? ''}=${vals[j].toFixed(3)}`).join(' ') };
          break;
        }
      }
    }
  }
  if (!final) {
    const last = curve.length ? curve[curve.length - 1] : eq;
    return { agent: rule.agent, symbol: rule.symbol, events: ev, curve, trades, pos: pos ? pos.side : 0, ret: +((last / R.start_equity - 1) * 100).toFixed(4), mdd: +(mdd * 100).toFixed(4), liquidated, score: null };
  }
  if (pos) close(tEnd - 1, bars[tEnd - 1].c * (1 - pos.side * R.slip), 'end');
  if (curve.length) curve[curve.length - 1] = +eq.toFixed(4);
  const ret = (eq / R.start_equity - 1) * 100;
  const score = liquidated ? 0 : trades === 0 ? R.no_trade_penalty : +(ret - 0.5 * mdd * 100).toFixed(4);
  return { agent: rule.agent, symbol: rule.symbol, events: ev, curve, trades, ret: +ret.toFixed(4), mdd: +(mdd * 100).toFixed(4), liquidated, score };
}

// ---------- 하우스 봇 (실력 비교 기준선) ----------
export const HOUSE = [
  { agent: 'house-hold', name: '그냥 롱', why: '시작하자마자 1배 롱, 끝까지 보유 — 시장 기준선', symbol: 'BTCUSDT', leverage: 1, max_trades: 1,
    entry: [{ side: 'long', when: [{ ind: 'ret', n: 2, op: '>', v: -999 }] }], exit: { stop_pct: 10, take_pct: 20, max_hold_bars: 120 } },
  { agent: 'house-coin', name: '반사 신경', why: '직전 10초와 반대로 — 생각 없는 기준선', symbol: 'BTCUSDT', leverage: 3, cooldown_bars: 6,
    entry: [{ side: 'short', when: [{ ind: 'ret', n: 2, op: '>', v: 0 }] }, { side: 'long', when: [{ ind: 'ret', n: 2, op: '<=', v: 0 }] }], exit: { stop_pct: 0.15, take_pct: 0.15, max_hold_bars: 24 } }
];

export function runMatch(match, final = true) {
  const results = match.strategies.map(rule => {
    const bars = match.bars[rule.symbol];
    const err = validate(rule);
    if (err.length) return { agent: rule.agent, symbol: rule.symbol, invalid: err, score: 0, ret: 0, mdd: 0, trades: 0, events: [], curve: [] };
    return runAgent(bars, rule, RULES, final);
  });
  const ranked = [...results].sort((a, b) => b.score - a.score);
  return { results, ranking: ranked.map(r => r.agent) };
}
