// 확장 탐색 3차 — 미탐색 축: RSI 지표, 종목(ETH/SOL), 초단기 보유
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { RULES, runAgent } from '../engine.js';
const [trFrom, trTo, teFrom, teTo] = process.argv.slice(2, 6);
const W = RULES.warmup_bars + RULES.match_bars;
const days = (a, b) => { const o = []; for (let d = new Date(a + 'T00:00:00Z'); d <= new Date(b + 'T00:00:00Z'); d = new Date(+d + 864e5)) o.push(d.toISOString().slice(0, 10)); return o; };
const cache = {};
function windows(sym, a, b) {
  const out = [];
  for (const day of days(a, b)) {
    const fn = homedir() + '/.cache/arena-bars/' + sym + '-' + day + '.json';
    if (!existsSync(fn)) continue;
    const bars = cache[fn] ??= JSON.parse(readFileSync(fn, 'utf8'));
    for (let i = 0; i + W <= bars.length; i += W) out.push({ day, bars: bars.slice(i, i + W) });
  }
  return out;
}
const SYMS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
const E = [];
for (const n of [6, 14, 24]) for (const v of [30, 50, 70]) {
  E.push({ name: `rsi${'n'}@${'v'}-follow`.replace('n',n).replace('v',v), entry: [{ side: 'long', when: [{ ind: 'rsi', n, op: '>', v }] }, { side: 'short', when: [{ ind: 'rsi', n, op: '<=', v }] }] });
  E.push({ name: `rsi${'n'}@${'v'}-fade`.replace('n',n).replace('v',v), entry: [{ side: 'short', when: [{ ind: 'rsi', n, op: '>', v }] }, { side: 'long', when: [{ ind: 'rsi', n, op: '<=', v }] }] });
}
E.push({ name: 'z24-follow', entry: [{ side: 'long', when: [{ ind: 'zscore', n: 24, op: '>', v: 0 }] }, { side: 'short', when: [{ ind: 'zscore', n: 24, op: '<=', v: 0 }] }] });
E.push({ name: 'flow24-fade', entry: [{ side: 'short', when: [{ ind: 'flow', n: 24, op: '>', v: 0 }] }, { side: 'long', when: [{ ind: 'flow', n: 24, op: '<=', v: 0 }] }] });
E.push({ name: 'vol24low-z24', entry: [{ side: 'long', when: [{ ind: 'vol', n: 24, op: '<', v: 0.05 }, { ind: 'zscore', n: 24, op: '>', v: 0 }] }, { side: 'short', when: [{ ind: 'vol', n: 24, op: '<', v: 0.05 }, { ind: 'zscore', n: 24, op: '<=', v: 0 }] }] });
const EXITS = [];
for (const hold of [1, 3, 6, 12, 60, 120]) EXITS.push({ stop_pct: 0.05, take_pct: 0.05, max_hold_bars: hold });
function evalRule(rule, ws) {
  let sum = 0, sumA = 0, nA = 0, wins = 0, noTrade = 0; const half = ws.length >> 1;
  ws.forEach((w, i) => { const r = runAgent(w.bars, rule); sum += r.score; if (i < half) { sumA += r.score; nA++; } if (r.score > 0) wins++; if (!r.trades) noTrade++; });
  const n = ws.length;
  return { n, mean: sum / n, early: sumA / nA, late: (sum - sumA) / (n - nA), win: 100 * wins / n, noTrade: 100 * noTrade / n };
}
const res = [];
const t0 = Date.now();
for (const sym of SYMS) {
  const tr = windows(sym, trFrom, trTo);
  for (const e of E) for (const x of EXITS) {
    const rule = { agent: 'cand', symbol: sym, leverage: 1, max_trades: 1, entry: e.entry, exit: x };
    const s = evalRule(rule, tr);
    res.push({ sym, name: e.name, exit: x, ...s, robust: Math.min(s.early, s.late) });
  }
  console.error(sym, 'done', ((Date.now() - t0) / 1000).toFixed(0) + 's', res.length);
}
res.sort((a, b) => b.robust - a.robust);
const top = res.slice(0, 10);
for (const c of top) {
  const rule = { agent: 'cand', symbol: c.sym, leverage: 1, max_trades: 1, entry: E.find(e => e.name === c.name).entry, exit: c.exit };
  c.test = evalRule(rule, windows(c.sym, teFrom, teTo));
}
const fmt = v => +v.toFixed(4);
const out = { tag: 'search3-rsi-sym-hold', train: [trFrom, trTo], test: [teFrom, teTo], candidates: res.length,
  dist: { best: fmt(res[0].robust), median: fmt(res[res.length >> 1].robust), worst: fmt(res[res.length - 1].robust) },
  bySym: ['BTCUSDT','ETHUSDT','SOLUSDT'].map(s => { const r = res.filter(c => c.sym === s); return { sym: s, best: fmt(r[0] ? r[0].robust : 0) }; }),
  top: top.map(c => ({ sym: c.sym, name: c.name, exit: c.exit, train: { mean: fmt(c.mean), robust: fmt(c.robust), win: fmt(c.win), noTrade: fmt(c.noTrade) }, test: { mean: fmt(c.test.mean), win: fmt(c.test.win), noTrade: fmt(c.test.noTrade), n: c.test.n } })) };
writeFileSync(homedir() + '/.cache/arena-search3.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
