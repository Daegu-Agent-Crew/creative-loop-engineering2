// 아레나 백테스트 — 같은 엔진으로 과거 15분 창(워밍업 5분 + 경기 10분) 수백 개를 돌려 성적 분포를 낸다
// 사용: node tools/backtest.mjs <규칙.json> <시작일> <끝일> [--test-from YYYY-MM-DD]
//   5초봉 캐시: ~/.cache/arena-bars (tools/archive_bars.py로 생성)
//   --test-from 이전 = 학습, 이후 = 검증. 검증 구간 결과를 보고 규칙을 다시 고치면 과최적화 — 근거로만 쓸 것
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { RULES, validate, runAgent, HOUSE } from '../engine.js';

const [ruleFile, from, to, ...rest] = process.argv.slice(2);
const testFrom = rest[rest.indexOf('--test-from') + 1];
const rule = JSON.parse(readFileSync(ruleFile, 'utf8'));
const err = validate(rule);
if (err.length) { console.error('규칙 위반:\n- ' + err.join('\n- ')); process.exit(2); }

const W = RULES.warmup_bars + RULES.match_bars;      // 180봉 = 15분
function windows(sym) {
  const out = [];
  for (let d = new Date(from + 'T00:00:00Z'); d <= new Date(to + 'T00:00:00Z'); d = new Date(+d + 864e5)) {
    const day = d.toISOString().slice(0, 10);
    const fn = `${homedir()}/.cache/arena-bars/${sym}-${day}.json`;
    if (!existsSync(fn)) { console.error('없음:', fn); continue; }
    const bars = JSON.parse(readFileSync(fn, 'utf8'));
    for (let i = 0; i + W <= bars.length; i += W) out.push({ day, bars: bars.slice(i, i + W) });
  }
  return out;
}
function stats(rs) {
  const s = rs.map(r => r.score).sort((a, b) => a - b), n = s.length;
  if (!n) return { n: 0 };
  const sum = s.reduce((a, b) => a + b, 0);
  return { n, mean_score: +(sum / n).toFixed(4), median: +s[n >> 1].toFixed(4), win_pct: +(100 * s.filter(x => x > 0).length / n).toFixed(1),
    sum_ex_top1: +(sum - s[n - 1]).toFixed(3), mean_ret: +(rs.reduce((a, r) => a + r.ret, 0) / n).toFixed(4),
    trades_per_match: +(rs.reduce((a, r) => a + r.trades, 0) / n).toFixed(2), liquidations: rs.filter(r => r.liquidated).length };
}
const ws = windows(rule.symbol);
const run = r => ws.map(w => ({ day: w.day, ...runAgent(w.bars, { ...r, symbol: rule.symbol }) }));
const mine = run(rule);
const split = rs => testFrom ? { train: stats(rs.filter(r => r.day < testFrom)), test: stats(rs.filter(r => r.day >= testFrom)) } : { all: stats(rs) };
const report = { rule: rule.agent, symbol: rule.symbol, period: [from, to], windows: ws.length, mine: split(mine),
  house: Object.fromEntries(HOUSE.map(h => [h.agent, split(run(h))])) };
console.log(JSON.stringify(report, null, 1));
