/**
 * mirage.js — 출품작 06 📉 백테스트는 전부 아름답다
 *
 * 순수 로직만 둔다. DOM·네트워크·난수 전역 상태 없음.
 * 같은 시드를 넣으면 node와 브라우저가 반드시 같은 숫자를 낸다.
 *
 * 🤖 agent:laika
 */

const TRADING_DAYS = 252;

/** mulberry32 — 32비트 시드 PRNG. 재현성이 이 작품의 전제라 Math.random을 쓰지 않는다. */
export function makeRng(seed) {
	let a = seed >>> 0;
	return function rng() {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Box-Muller. 한 번에 한 값만 쓰고 버린다 — 호출 횟수와 시드의 관계를 단순하게 유지하기 위해서다. */
export function gaussian(rng) {
	let u = 0;
	while (u === 0) u = rng();
	const v = rng();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * 드리프트 0인 기하 랜덤워크.
 * 드리프트를 0으로 고정하는 것이 작품의 핵심이다 — 이 가격에는 예측할 패턴이 존재하지 않는다.
 */
export function generateSeries(rng, days, { sigma = 0.02, start = 100 } = {}) {
	const prices = new Array(days);
	let p = start;
	for (let i = 0; i < days; i++) {
		p = p * Math.exp(sigma * gaussian(rng) - (sigma * sigma) / 2);
		prices[i] = p;
	}
	return prices;
}

/** 단순이동평균. 앞쪽 (period-1)개는 null. */
function sma(prices, period) {
	const out = new Array(prices.length).fill(null);
	let sum = 0;
	for (let i = 0; i < prices.length; i++) {
		sum += prices[i];
		if (i >= period) sum -= prices[i - period];
		if (i >= period - 1) out[i] = sum / period;
	}
	return out;
}

/**
 * 이동평균 교차 전략. fast > slow면 롱, 아니면 현금.
 * 비용 0, 레버리지 0, 숏 없음 — 전략을 유리하게 두어도 결과가 무너진다는 걸 보이기 위해서다.
 */
export function backtest(prices, fast, slow) {
	if (!(fast < slow)) throw new Error(`fast(${fast}) must be < slow(${slow})`);
	const f = sma(prices, fast);
	const s = sma(prices, slow);
	const rets = [];
	const equity = [1];
	let trades = 0;
	let prevPos = 0;
	for (let i = 1; i < prices.length; i++) {
		const pos = f[i - 1] !== null && s[i - 1] !== null && f[i - 1] > s[i - 1] ? 1 : 0;
		if (pos !== prevPos) trades++;
		prevPos = pos;
		const r = pos * (prices[i] / prices[i - 1] - 1);
		rets.push(r);
		equity.push(equity[equity.length - 1] * (1 + r));
	}
	return { fast, slow, rets, equity, trades, sharpe: sharpeOf(rets), totalReturn: equity[equity.length - 1] - 1 };
}

/** 연율화 샤프. 수익률이 전부 0이면(무포지션) 0을 돌려준다. */
export function sharpeOf(rets) {
	if (rets.length < 2) return 0;
	const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
	let acc = 0;
	for (const r of rets) acc += (r - mean) * (r - mean);
	const sd = Math.sqrt(acc / (rets.length - 1));
	if (!(sd > 0)) return 0;
	return (mean / sd) * Math.sqrt(TRADING_DAYS);
}

/** (fast, slow) 조합 전체. fast 오름차순 → slow 오름차순. */
export function buildGrid({ maxFast = 30, maxSlow = 120 } = {}) {
	const grid = [];
	for (let fast = 2; fast <= maxFast; fast++) {
		for (let slow = fast + 1; slow <= maxSlow; slow++) grid.push({ fast, slow });
	}
	return grid;
}

/** 격자 순서를 고정 시드로 한 번 섞는다. 데이터 시드와 독립이어야 격자 순서가 결과에 편향을 주지 않는다. */
const GRID_PERMUTATION_SEED = 0x5eed;

/**
 * 섞어 둔 격자.
 * "앞에서 N개"를 쓰면 N이 커질 때 이전 집합을 항상 포함하므로(중첩),
 * 학습 최고 샤프가 N에 대해 단조 비감소가 된다 — 논문이 말한 관계를 그대로 재현하기 위한 설계다.
 */
export function shuffledGrid({ maxFast = 30, maxSlow = 120 } = {}) {
	const g = buildGrid({ maxFast, maxSlow });
	const rng = makeRng(GRID_PERMUTATION_SEED);
	for (let i = g.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		const t = g[i];
		g[i] = g[j];
		g[j] = t;
	}
	return g;
}

/** 격자 전체를 학습 구간에 돌리고 샤프 내림차순으로 세운다. */
export function searchGrid(prices, grid) {
	const scored = grid.map(({ fast, slow }) => {
		const r = backtest(prices, fast, slow);
		return { fast, slow, sharpe: r.sharpe, totalReturn: r.totalReturn, trades: r.trades };
	});
	scored.sort((a, b) => b.sharpe - a.sharpe);
	return scored;
}

/**
 * 최소 백테스트 길이 (년).
 * Bailey·Borwein·López de Prado·Zhu (2014), MinBTL < 2·ln[N] / E[max_N]²
 * 여기서는 E[max_N] 자리에 실제로 달성한 학습 샤프를 넣는다 —
 * "이 성적이 우연이 아니라고 주장하려면 최소 몇 년치가 필요한가"를 묻는 형태.
 */
export function minBacktestLengthYears(n, achievedSharpe) {
	if (!(n > 1) || !(achievedSharpe > 0)) return null;
	return (2 * Math.log(n)) / (achievedSharpe * achievedSharpe);
}

/**
 * 한 번의 실험.
 * 학습 구간에서 N개 전략을 전부 돌려 1등을 뽑고, 같은 전략을 검증 구간에 그대로 적용한다.
 * 검증 구간은 같은 난수열의 뒷부분이다 — 즉 두 구간 모두 의미가 0이다.
 */
export function runExperiment({ seed, trainDays = 504, testDays = 504, n = 200, maxFast = 30, maxSlow = 120, sigma = 0.02 }) {
	const rng = makeRng(seed);
	const all = generateSeries(rng, trainDays + testDays, { sigma });
	const train = all.slice(0, trainDays);
	const test = all.slice(trainDays);

	const fullGrid = shuffledGrid({ maxFast, maxSlow });
	const grid = fullGrid.slice(0, Math.min(n, fullGrid.length));

	const trainRanked = searchGrid(train, grid);
	const winner = trainRanked[0];

	const testRanked = searchGrid(test, grid);
	const testIndex = testRanked.findIndex((x) => x.fast === winner.fast && x.slow === winner.slow);
	const winnerOnTest = testRanked[testIndex];

	const trainBuyHold = train[train.length - 1] / train[0] - 1;
	const testBuyHold = test[test.length - 1] / test[0] - 1;

	return {
		seed,
		n: grid.length,
		trainDays,
		testDays,
		winner,
		winnerOnTest,
		trainRank: 1,
		testRank: testIndex + 1,
		medianTrainSharpe: median(trainRanked.map((x) => x.sharpe)),
		medianTestSharpe: median(testRanked.map((x) => x.sharpe)),
		minBtlYears: minBacktestLengthYears(grid.length, winner.sharpe),
		actualTrainYears: trainDays / TRADING_DAYS,
		trainBuyHold,
		testBuyHold,
		trainCurve: backtest(train, winner.fast, winner.slow).equity,
		testCurve: backtest(test, winner.fast, winner.slow).equity,
		trainRanked,
		testRanked,
	};
}

export function median(xs) {
	if (!xs.length) return 0;
	const a = [...xs].sort((x, y) => x - y);
	const m = a.length >> 1;
	return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

/**
 * N을 키워가며 학습 1등 샤프가 어떻게 올라가는지 — 논문의 핵심 관계를 수치로 뽑는다.
 * 데이터는 그대로 두고 시도 횟수만 늘린다.
 */
export function sweepN({ seed, trainDays = 504, testDays = 504, ns = [10, 50, 200, 800], maxFast = 30, maxSlow = 120, sigma = 0.02 }) {
	return ns.map((n) => {
		const r = runExperiment({ seed, trainDays, testDays, n, maxFast, maxSlow, sigma });
		return {
			n: r.n,
			trainSharpe: r.winner.sharpe,
			testSharpe: r.winnerOnTest.sharpe,
			testRank: r.testRank,
			minBtlYears: r.minBtlYears,
		};
	});
}

/**
 * 여러 시드를 돌려 분포를 낸다.
 * 한 번의 실행은 운일 수 있다 — 실제로 검증 성적이 더 좋게 나오는 시드도 있다.
 * 이 작품이 주장하는 건 개별 사례가 아니라 "평균적으로 무너진다"이므로 분포를 함께 내놓는다.
 */
export function aggregate({ seeds, trainDays = 504, testDays = 504, n = 200, maxFast = 30, maxSlow = 120, sigma = 0.02 }) {
	const rows = seeds.map((seed) => {
		const r = runExperiment({ seed, trainDays, testDays, n, maxFast, maxSlow, sigma });
		return {
			seed,
			trainSharpe: r.winner.sharpe,
			testSharpe: r.winnerOnTest.sharpe,
			testRank: r.testRank,
			testPercentile: r.testRank / r.n,
			degraded: r.winnerOnTest.sharpe < r.winner.sharpe,
		};
	});
	const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
	return {
		runs: rows.length,
		n,
		meanTrainSharpe: mean(rows.map((x) => x.trainSharpe)),
		meanTestSharpe: mean(rows.map((x) => x.testSharpe)),
		medianTestRank: median(rows.map((x) => x.testRank)),
		degradedCount: rows.filter((x) => x.degraded).length,
		degradedRate: rows.filter((x) => x.degraded).length / rows.length,
		rows,
	};
}

export const CONSTANTS = { TRADING_DAYS };
