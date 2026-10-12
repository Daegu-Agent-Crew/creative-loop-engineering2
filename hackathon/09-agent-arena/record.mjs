// 09 에이전트 아레나 — 공식 경기 기록기 (Node 22+)
// 경기 시작 시각에 실행: 워밍업 5분을 과거 체결로 채우고, 10분간 실시간 5초봉 기록 → 엔진으로 채점 → matches/<id>.json + index.json·season.json 갱신
// 사용: node record.mjs [--start ISO시각(기본: 지금, 5초 단위 내림)] [--id 경기ID]
// 출전 규칙: strategies/*.json (+ 엔진 하우스 봇). 규칙 위반 전략은 실격 기록.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RULES, HOUSE, runMatch } from './engine.js';
import { BarFeed } from './feed.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const MS = RULES.bar_sec * 1000;
// --at HH:MM : 오늘(KST) 그 시각 시작 (예약 실행용)
const atKst = arg('--at') ? (() => { const [h, mi] = arg('--at').split(':').map(Number); const k = new Date(Date.now() + 9 * 3600e3); return Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate(), h, mi) - 9 * 3600e3; })() : null;
const start = Math.floor((atKst ?? (arg('--start') ? Date.parse(arg('--start')) : Date.now())) / MS) * MS;
const warm = start - RULES.warmup_bars * MS, end = start + RULES.match_bars * MS;
const kst = new Date(start + 9 * 3600e3).toISOString();
const id = arg('--id') || `${kst.slice(0, 10)}-${kst.slice(11, 16).replace(':', '')}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 전략 파일 하나가 깨져도 경기 전체가 무효가 되지 않게: 읽기 실패 → 그 에이전트만 실격 기록
const strategies = readdirSync(join(HERE, 'strategies')).filter(f => f.endsWith('.json') && f !== 'index.json')
  .map(f => { try { return JSON.parse(readFileSync(join(HERE, 'strategies', f), 'utf8')); }
              catch (e) { console.error('전략 파일 오류', f, e.message); return { agent: f.replace(/\.json$/, ''), symbol: 'BTCUSDT', _broken: e.message }; } })
  .concat(HOUSE);
const syms = [...new Set(strategies.map(s => s.symbol).filter(s => RULES.symbols.includes(s)))];
console.log(`[${id}] 시작 ${new Date(start).toISOString()} · 종목 ${syms.join(',')} · 출전 ${strategies.map(s => s.agent).join(',')}`);

while (Date.now() < start) await sleep(500);
const feeds = Object.fromEntries(syms.map(s => [s, new BarFeed(s, RULES.bar_sec)]));
await Promise.all(Object.values(feeds).map(f => f.backfill(warm)));
let lastLog = 0;
while (Date.now() < end + 2500) {
  await Promise.all(Object.values(feeds).map(f => f.poll().catch(e => console.error('poll', f.symbol, e.message))));
  if (Date.now() - lastLog > 60e3) { lastLog = Date.now(); console.log('기록 중', Object.entries(feeds).map(([s, f]) => `${s}:${f.bars.length}`).join(' ')); }
  await sleep(1000);
}
await Promise.all(Object.values(feeds).map(f => f.poll(end + 1600)));

const bars = {}, gaps = {};
for (const [s, f] of Object.entries(feeds)) {
  bars[s] = f.bars.filter(b => b.t >= warm && b.t < end);
  const want = RULES.warmup_bars + RULES.match_bars;
  gaps[s] = want - bars[s].length;
  if (bars[s].length !== want || bars[s][0].t !== warm) throw new Error(`${s} 봉 수 ${bars[s].length}/${want} (첫 봉 ${bars[s][0]?.t} vs ${warm}) — 기록 무효`);
}
const match = { id, start, end, warm, kst_start: kst.slice(0, 16).replace('T', ' '), rules: RULES, strategies, bars };
const { results, ranking } = runMatch(match);
match.results = results.map(({ curve, ...r }) => ({ ...r, curve }));
match.ranking = ranking;
mkdirSync(join(HERE, 'matches'), { recursive: true });
writeFileSync(join(HERE, 'matches', `${id}.json`), JSON.stringify(match));

// 목록·시즌 누적
const idxF = join(HERE, 'matches', 'index.json');
const idx = existsSync(idxF) ? JSON.parse(readFileSync(idxF, 'utf8')) : [];
const summary = { id, kst_start: match.kst_start, ranking, scores: Object.fromEntries(results.map(r => [r.agent, r.score])),
  rets: Object.fromEntries(results.map(r => [r.agent, r.ret])), liquidated: results.filter(r => r.liquidated).map(r => r.agent) };
writeFileSync(idxF, JSON.stringify([summary, ...idx.filter(m => m.id !== id)], null, 1));
const season = {};
for (const m of [summary, ...idx.filter(m => m.id !== id)].filter(m => !m.id.startsWith('test-'))) for   // 시범 경기(test-)는 시즌 제외
  (const [a, sc] of Object.entries(m.scores)) {
  const s = season[a] ??= { agent: a, matches: 0, total: 0, wins: 0, best: -Infinity };
  s.matches++; s.total += sc; s.best = Math.max(s.best, sc); if (m.ranking[0] === a) s.wins++;
}
const table = Object.values(season).map(s => ({ ...s, total: +s.total.toFixed(4), total_ex_best: +(s.total - s.best).toFixed(4), mean: +(s.total / s.matches).toFixed(4) }))
  .sort((a, b) => b.total_ex_best - a.total_ex_best);
writeFileSync(join(HERE, 'matches', 'season.json'), JSON.stringify(table, null, 1));
console.log(`RESULT ${id} 1위 ${ranking[0]} · ` + results.map(r => `${r.agent} ${r.score}${r.liquidated ? '(청산)' : ''}${r.invalid ? '(실격)' : ''}`).join(' · '));
