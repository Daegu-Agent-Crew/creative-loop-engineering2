// G2: JS 시뮬레이터가 Python 원본(bt/backtest_v2.py → results_v2.json)과 같은 숫자를 내는지 검사
// 실행: node hackathon/07-funding-spread-lab/test/lab.test.mjs
import { readFileSync } from 'node:fs';
import { prepare, simulate, summarize, walkForward, COSTS } from '../lab.js';

const here = new URL('..', import.meta.url);
const data = JSON.parse(readFileSync(new URL('data.json', here)));
const expected = JSON.parse(readFileSync(new URL('test/expected.json', here)));
const syms = prepare(data);
let fail = 0;
const r4 = x => Math.round(x * 1e6) / 1e4; // % 소수 4자리

for (const name of ['maker', 'taker']) {
  const exp = expected[`X_${name}`];
  const { grid, best } = walkForward(data, syms, COSTS[name]);
  for (const [[th, conf], v] of exp.train_grid) {
    const g = grid.find(x => x.th === th && x.conf === conf);
    if (g.n !== v.n || r4(g.mean) !== v['mean%']) { fail++; console.log('MISMATCH train', name, th, conf, g.n, v.n, r4(g.mean), v['mean%']); }
  }
  const chosenOk = best.th === exp.chosen[0] && best.conf === exp.chosen[1];
  const test = summarize(simulate(data, syms, { th: best.th, conf: best.conf, cost: COSTS[name], from: data.split }));
  const testOk = test.n === exp.test.n && r4(test.mean) === exp.test['mean%'] && Math.round(test.sumExTop1 * 1e5) / 1e3 === exp.test['sum_ex_top1%'];
  if (!chosenOk || !testOk) fail++;
  console.log(`${name}: chosen ${best.th}/${best.conf} ${chosenOk ? 'OK' : 'MISMATCH'} · test n=${test.n} mean=${r4(test.mean)}% exTop1=${(test.sumExTop1 * 100).toFixed(3)}% ${testOk ? 'OK' : 'MISMATCH'}`);
}
console.log(fail ? `FAIL ${fail}` : 'PASS');
process.exit(fail ? 1 : 0);
