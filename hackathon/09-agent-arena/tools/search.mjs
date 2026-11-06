// 아레나 전략 대량 탐색 — 학습 구간에서만 고르고, 검증 구간은 선택 후 1회만 연다
// 사용: node tools/search.mjs <학습시작> <학습끝> <검증시작> <검증끝> [--family always|cond]
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { RULES, runAgent } from '../engine.js';

const [trFrom, trTo, teFrom, teTo] = process.argv.slice(2, 6);
const family = process.argv.includes('--family') ? process.argv[process.argv.indexOf('--family') + 1] : 'always';
const W = RULES.warmup_bars + RULES.match_bars;
const days = (a, b) => { const o = []; for (let d = new Date(a + 'T00:00:00Z'); d <= new Date(b + 'T00:00:00Z'); d = new Date(+d + 864e5)) o.push(d.toISOString().slice(0, 10)); return o; };
const cache = {};
function windows(sym, a, b) {
  const out = [];
  for (const day of days(a, b)) {
    const fn = `${homedir()}/.cache/arena-bars/${sym}-${day}.json`;
    if (!existsSync(fn)) continue;
    const bars = cache[fn] ??= JSON.parse(readFileSync(fn, 'utf8'));
    for (let i = 0; i + W <= bars.length; i += W) out.push({ day, bars: bars.slice(i, i + W) });
  }
  return out;
}
const SYMS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

// 진입 규칙 후보
function entries() {
  const E = [];
  const pair = (name, ind, extra, v = 0) => {
    E.push({ name: `${name}-follow`, entry: [{ side: 'long', when: [{ ind, ...extra, op: '>', v }] }, { side: 'short', when: [{ ind, ...extra, op: '<=', v }] }] });
    E.push({ name: `${name}-fade`, entry: [{ side: 'short', when: [{ ind, ...extra, op: '>', v }] }, { side: 'long', when: [{ ind, ...extra, op: '<=', v }] }] });
  };
  if (family === 'always') {
    E.push({ name: 'long', entry: [{ side: 'long', when: [{ ind: 'ret', n: 2, op: '>', v: -999 }] }] });
    E.push({ name: 'short', entry: [{ side: 'short', when: [{ ind: 'ret', n: 2, op: '>', v: -999 }] }] });
    for (const [n, m] of [[6, 24], [12, 36], [24, 60]]) pair(`trend${n}/${m}`, 'trend', { n, m });
    for (const n of [12, 24, 60]) pair(`ret${n}`, 'ret', { n });
    for (const n of [12, 24, 60]) pair(`flow${n}`, 'flow', { n });
    for (const n of [12, 24, 60]) pair(`z${n}`, 'zscore', { n });
  } else {
    // 조건부(극단에서만 진입) — 안 걸리면 −1점
    for (const n of [12, 24, 60]) for (const z of [1.5, 2, 2.5]) {
      E.push({ name: `z${n}>${z}-revert`, entry: [{ side: 'short', when: [{ ind: 'zscore', n, op: '>', v: z }] }, { side: 'long', when: [{ ind: 'zscore', n, op: '<', v: -z }] }] });
      E.push({ name: `z${n}>${z}-follow`, entry: [{ side: 'long', when: [{ ind: 'zscore', n, op: '>', v: z }] }, { side: 'short', when: [{ ind: 'zscore', n, op: '<', v: -z }] }] });
    }
    for (const n of [12, 24]) for (const f of [0.3, 0.5, 0.7]) {
      E.push({ name: `flow${n}>${f}-follow`, entry: [{ side: 'long', when: [{ ind: 'flow', n, op: '>', v: f }] }, { side: 'short', when: [{ ind: 'flow', n, op: '<', v: -f }] }] });
      E.push({ name: `flow${n}>${f}-fade`, entry: [{ side: 'short', when: [{ ind: 'flow', n, op: '>', v: f }] }, { side: 'long', when: [{ ind: 'flow', n, op: '<', v: -f }] }] });
    }
  }
  return E;
}
const EXITS = [];
for (const stop of [0.05, 0.1, 0.2, 0.5]) for (const take of [0.05, 0.1, 0.2, 0.5]) for (const hold of [1, 12, 60, 120]) EXITS.push({ stop_pct: stop, take_pct: take, max_hold_bars: hold });

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
  for (const e of entries()) for (const x of EXITS) {
    const rule = { agent: 'cand', symbol: sym, leverage: 1, max_trades: 1, entry: e.entry, exit: x };
    const s = evalRule(rule, tr);
    res.push({ sym, name: e.name, exit: x, ...s, robust: Math.min(s.early, s.late) });
  }
  console.error(sym, 'done', ((Date.now() - t0) / 1000).toFixed(0) + 's', res.length);
}
res.sort((a, b) => b.robust - a.robust);
const top = res.slice(0, 10);
// 선택 고정 후 검증 1회
for (const c of top) {
  const rule = { agent: 'cand', symbol: c.sym, leverage: 1, max_trades: 1, entry: entries().find(e => e.name === c.name).entry, exit: c.exit };
  c.test = evalRule(rule, windows(c.sym, teFrom, teTo));
}
const fmt = v => +v.toFixed(4);
const out = { family, train: [trFrom, trTo], test: [teFrom, teTo], candidates: res.length,
  dist: { best: fmt(res[0].robust), median: fmt(res[res.length >> 1].robust), worst: fmt(res[res.length - 1].robust) },
  top: top.map(c => ({ sym: c.sym, name: c.name, exit: c.exit, train: { mean: fmt(c.mean), early: fmt(c.early), late: fmt(c.late), win: fmt(c.win), noTrade: fmt(c.noTrade) }, test: { mean: fmt(c.test.mean), early: fmt(c.test.early), late: fmt(c.test.late), win: fmt(c.test.win), noTrade: fmt(c.test.noTrade), n: c.test.n } })) };
writeFileSync(`${homedir()}/.cache/arena-search-${family}.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
