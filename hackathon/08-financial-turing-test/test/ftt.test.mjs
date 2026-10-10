// G2: 게임 로직 단위 검사 — node hackathon/08-financial-turing-test/test/ftt.test.mjs
import { readFileSync } from 'fs';
import { rng, makeRound, toCandles, absAC1, machinePick, binomTail, fmtP, WINDOW } from '../core.mjs';

const series = JSON.parse(readFileSync(new URL('../data.json', import.meta.url))).series;
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); } };
const key = b => b.join(',');

// 1) 가짜 = 진짜 캔들 집합의 순열, 길이·순서 차이
const rand = rng(42);
let sameOrder = 0, machineWins = 0;
const N = 500;
for (let i = 0; i < N; i++) {
  const r = makeRound(series, rand);
  ok(r.real.length === WINDOW && r.fake.length === WINDOW, '길이');
  ok(JSON.stringify(r.real.map(key).sort()) === JSON.stringify(r.fake.map(key).sort()), '순열 아님');
  if (JSON.stringify(r.real) === JSON.stringify(r.fake)) sameOrder++;
  ok((r.realSide === 'A' ? r.A : r.B) === r.real, '정답 면 불일치');
  if (machinePick(r) === r.realSide) machineWins++;
}
ok(sameOrder === 0, '섞었는데 순서가 같음');
const mAcc = machineWins / N;
ok(mAcc > 0.7, `기계 판별기 정답률 ${mAcc}`);

// 2) 재현성
const a = makeRound(series, rng(7)), b = makeRound(series, rng(7));
ok(a.symbol === b.symbol && a.start === b.start && a.realSide === b.realSide, '같은 시드 다른 결과');

// 3) 이항검정
ok(binomTail(7, 10) === 0.171875, 'p(7/10)');
ok(binomTail(10, 10) === 0.0009765625, 'p(10/10)');
ok(binomTail(0, 10) === 1, 'p(0/10)');
ok(fmtP(0.171875) === '17.2%' && fmtP(0.0009765625) === '0.1% 미만', 'fmtP');

// 4) 캔들 복원: 종가 연쇄, 고가≥시가·종가≥저가
const c = toCandles(series.BTC.bars.slice(0, 50));
ok(c.every(x => x.high >= Math.max(x.open, x.close) - 1e-9 && x.low <= Math.min(x.open, x.close) + 1e-9), '고저 범위');
ok(c.every((x, i) => i === 0 || x.time - c[i - 1].time === 86400), '시간 간격');

// 5) 자기상관: 몰린 변동성 > 0, 교대 패턴 < 0
const clustered = [...Array(20)].map((_, i) => [0, 0, 0, i < 10 ? 500 : 10]);
ok(absAC1(clustered) > 0.5, '군집 자기상관');
ok(absAC1([...Array(20)].map((_, i) => [0, 0, 0, i % 2 ? 500 : 10])) < -0.5, '교대 자기상관');

console.log(`machine accuracy (500판, seed 42): ${(mAcc * 100).toFixed(1)}%`);
console.log(fails ? `FAIL ${fails}` : 'PASS');
process.exit(fails ? 1 : 0);
