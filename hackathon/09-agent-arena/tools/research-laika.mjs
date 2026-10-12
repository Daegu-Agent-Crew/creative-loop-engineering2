// 라이카 전략 탐색기 — 지정된 학습 구간만 사용하고 상위 후보를 출력한다.
// 사용: node tools/research-laika.mjs SOLUSDT 2026-09-27 2026-10-05
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { RULES, runAgent } from '../engine.js';

const [symbol = 'SOLUSDT', from, to] = process.argv.slice(2);
if (!from || !to) throw new Error('symbol, from, to가 필요합니다');
if (!RULES.symbols.includes(symbol)) throw new Error(`지원 종목: ${RULES.symbols.join(', ')}`);

const width = RULES.warmup_bars + RULES.match_bars;
const windows = [];
for (let date = new Date(`${from}T00:00:00Z`); date <= new Date(`${to}T00:00:00Z`); date = new Date(+date + 864e5)) {
  const day = date.toISOString().slice(0, 10);
  const path = `${homedir()}/.cache/arena-bars/${symbol}-${day}.json`;
  if (!existsSync(path)) throw new Error(`백테스트 봉 없음: ${path}`);
  const bars = JSON.parse(readFileSync(path, 'utf8'));
  for (let index = 0; index + width <= bars.length; index += width) {
    windows.push({ day, bars: bars.slice(index, index + width) });
  }
}

const exits = [];
for (const stop_pct of [0.15, 0.3, 0.5]) {
  for (const take_pct of [0.3, 0.6, 1]) {
    for (const max_hold_bars of [24, 60, 120]) exits.push({ stop_pct, take_pct, max_hold_bars });
  }
}

const entries = [];
for (const n of [6, 12, 24, 36]) {
  for (const v of [-0.02, 0, 0.02]) {
    entries.push({ family: `ret-follow-${n}-${v}`, entry: [
      { side: 'long', when: [{ ind: 'ret', n, op: '>', v }] },
      { side: 'short', when: [{ ind: 'ret', n, op: '<=', v }] },
    ] });
    entries.push({ family: `ret-fade-${n}-${v}`, entry: [
      { side: 'short', when: [{ ind: 'ret', n, op: '>', v }] },
      { side: 'long', when: [{ ind: 'ret', n, op: '<=', v }] },
    ] });
  }
}
for (const n of [6, 12, 24, 36]) {
  for (const v of [-0.05, 0, 0.05]) {
    entries.push({ family: `flow-follow-${n}-${v}`, entry: [
      { side: 'long', when: [{ ind: 'flow', n, op: '>', v }] },
      { side: 'short', when: [{ ind: 'flow', n, op: '<=', v }] },
    ] });
    entries.push({ family: `flow-fade-${n}-${v}`, entry: [
      { side: 'short', when: [{ ind: 'flow', n, op: '>', v }] },
      { side: 'long', when: [{ ind: 'flow', n, op: '<=', v }] },
    ] });
  }
}
for (const [n, m] of [[6, 24], [12, 36], [24, 60]]) {
  for (const v of [-0.02, 0, 0.02]) {
    entries.push({ family: `trend-follow-${n}-${m}-${v}`, entry: [
      { side: 'long', when: [{ ind: 'trend', n, m, op: '>', v }] },
      { side: 'short', when: [{ ind: 'trend', n, m, op: '<=', v }] },
    ] });
    entries.push({ family: `trend-fade-${n}-${m}-${v}`, entry: [
      { side: 'short', when: [{ ind: 'trend', n, m, op: '>', v }] },
      { side: 'long', when: [{ ind: 'trend', n, m, op: '<=', v }] },
    ] });
  }
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const candidates = [];
for (const signal of entries) {
  for (const exit of exits) {
    const rule = { agent: 'laika', symbol, leverage: 1, max_trades: 1, entry: signal.entry, exit };
    const results = windows.map(window => runAgent(window.bars, rule));
    const middle = Math.floor(results.length / 2);
    const early = mean(results.slice(0, middle).map(result => result.score));
    const late = mean(results.slice(middle).map(result => result.score));
    const scores = results.map(result => result.score);
    candidates.push({
      family: signal.family,
      robust: Math.min(early, late),
      mean: mean(scores),
      early,
      late,
      win: scores.filter(score => score > 0).length / scores.length,
      entry: signal.entry,
      exit,
    });
  }
}

candidates.sort((left, right) => right.robust - left.robust || right.mean - left.mean);
console.log(JSON.stringify({ symbol, period: [from, to], windows: windows.length, candidates: candidates.length, top: candidates.slice(0, 20) }, null, 2));
