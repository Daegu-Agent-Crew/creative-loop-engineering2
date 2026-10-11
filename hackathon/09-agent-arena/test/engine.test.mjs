// 09 아레나 엔진 검사: ① 규칙 검사 ② 미래 정보 미사용(앞부분만 준 계산과 전체 계산의 이벤트가 일치) ③ 결정론(두 번 계산 동일) ④ 참가 의무·청산 점수
// 실행: node hackathon/09-agent-arena/test/engine.test.mjs  (합성 시세 사용 — 네트워크 불필요)
import { readFileSync } from 'node:fs';
import { RULES, HOUSE, validate, runAgent, runMatch } from '../engine.js';

let fail = 0;
const ok = (c, msg) => { if (!c) { fail++; console.log('FAIL', msg); } else console.log('ok  ', msg); };
// 합성 시세: 시드 고정 랜덤워크 + 체결 대금
let seed = 42; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
function synth(n, vol = 0.0008, p0 = 100) {
  const out = []; let p = p0;
  for (let i = 0; i < n; i++) { const o = p; p *= 1 + (rnd() - 0.5) * 2 * vol; const h = Math.max(o, p) * (1 + rnd() * vol / 2), l = Math.min(o, p) * (1 - rnd() * vol / 2);
    out.push({ t: i * 5000, o, h, l, c: p, bv: Math.round(rnd() * 1e5), sv: Math.round(rnd() * 1e5) }); }
  return out;
}
const mine = JSON.parse(readFileSync(new URL('../strategies/daeguru.json', import.meta.url)));
ok(validate(mine).length === 0, '대구루 전략 규칙 통과');
ok(HOUSE.every(h => validate(h).length === 0), '하우스 봇 규칙 통과');
ok(validate({ ...mine, leverage: 10 }).some(e => e.startsWith('leverage')), '레버리지 10배 거부');
ok(validate({ ...mine, entry: [{ side: 'long', when: [{ ind: 'magic', op: '>', v: 1 }] }] }).length > 0, '모르는 지표 거부');

const bars = synth(RULES.warmup_bars + RULES.match_bars);
const busy = { agent: 'busy', symbol: 'BTCUSDT', leverage: 3, cooldown_bars: 2,
  entry: [{ side: 'long', when: [{ ind: 'ret', n: 3, op: '>', v: 0 }] }, { side: 'short', when: [{ ind: 'ret', n: 3, op: '<=', v: 0 }] }], exit: { stop_pct: 0.1, take_pct: 0.1, max_hold_bars: 6 } };
const full = runAgent(bars, busy);
let lookahead = true;
for (const cut of [70, 100, 150]) {
  const part = runAgent(bars.slice(0, cut), busy, RULES, false);
  const a = JSON.stringify(full.events.filter(e => e.k < cut - 1)), b = JSON.stringify(part.events.filter(e => e.k < cut - 1));
  if (a !== b) { lookahead = false; console.log('  차이 cut', cut); }
}
ok(lookahead, '앞부분만 준 계산 = 전체 계산 (미래 정보 미사용)');
ok(JSON.stringify(runAgent(bars, busy)) === JSON.stringify(full), '결정론: 두 번 계산 동일');
ok(full.trades > 3, `거래 발생 (${full.trades}회)`);

const idle = { ...busy, agent: 'idle', entry: [{ side: 'long', when: [{ ind: 'ret', n: 2, op: '>', v: 999 }] }] };
ok(runAgent(bars, idle).score === RULES.no_trade_penalty, '진입 0회 → 참가 의무 감점');
const crash = bars.map((b, i) => i > 70 ? { ...b, o: b.o * 0.5, h: b.h * 0.5, l: b.l * 0.5, c: b.c * 0.5 } : b);
const yolo = { ...busy, agent: 'yolo', leverage: 5, max_trades: 1, entry: [{ side: 'long', when: [{ ind: 'ret', n: 2, op: '>', v: -999 }] }], exit: { stop_pct: 10, take_pct: 20 } };
const y = runAgent(crash, yolo);
ok(y.liquidated && y.score === 0, '5배 롱 + 50% 폭락 → 강제 청산 0점');
const m = runMatch({ strategies: [mine, ...HOUSE], bars: { BTCUSDT: bars } });
ok(m.ranking.length === 3 && m.results.every(r => typeof r.score === 'number'), '경기 순위 산출');
console.log(fail ? `FAIL ${fail}` : 'PASS');
process.exit(fail ? 1 : 0);
