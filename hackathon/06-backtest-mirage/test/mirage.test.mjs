/**
 * L1 순수 로직 테스트 — 출품작 06
 * 외부 의존 0. node test/mirage.test.mjs 로 실행한다.
 *
 * 🤖 agent:laika
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
	makeRng, generateSeries, backtest, sharpeOf, buildGrid, shuffledGrid,
	searchGrid, runExperiment, sweepN, aggregate, minBacktestLengthYears, median,
} from "../mirage.js";

const here = dirname(fileURLToPath(import.meta.url));
const expected = JSON.parse(readFileSync(join(here, "expected.json"), "utf8"));

let pass = 0, fail = 0;
const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

function check(name, cond, detail = "") {
	if (cond) { pass++; console.log(`  PASS  ${name}`); }
	else { fail++; console.log(`  FAIL  ${name}${detail ? " — " + detail : ""}`); }
}

console.log("06 백테스트는 전부 아름답다 — L1 테스트\n");

// T1. PRNG 재현성 — 이 작품 전체가 재현성 위에 서 있다
{
	const a = Array.from({ length: 5 }, makeRng(12345));
	const b = Array.from({ length: 5 }, makeRng(12345));
	const c = Array.from({ length: 5 }, makeRng(12346));
	check("T1a 같은 시드 → 같은 수열", JSON.stringify(a) === JSON.stringify(b));
	check("T1b 다른 시드 → 다른 수열", JSON.stringify(a) !== JSON.stringify(c));
	check("T1c 난수가 [0,1) 범위", a.every((x) => x >= 0 && x < 1));
	check("T1d 고정 기대값 일치", a.every((x, i) => near(x, expected.rng12345[i], 1e-12)),
		JSON.stringify(a.map((x) => +x.toFixed(12))));
}

// T2. 가격 생성
{
	const p1 = generateSeries(makeRng(1), 100);
	const p2 = generateSeries(makeRng(1), 100);
	check("T2a 시리즈 재현성", JSON.stringify(p1) === JSON.stringify(p2));
	check("T2b 길이 정확", p1.length === 100);
	check("T2c 가격 전부 양수", p1.every((x) => x > 0 && isFinite(x)));
	check("T2d 고정 기대값(첫 3개)", p1.slice(0, 3).every((x, i) => near(x, expected.series1[i], 1e-9)),
		JSON.stringify(p1.slice(0, 3)));
}

// T3. 샤프 — 수학적으로 확인 가능한 입력으로
{
	check("T3a 상수 수익률 → 표준편차 0 → 0 반환", sharpeOf([0.01, 0.01, 0.01]) === 0);
	check("T3b 빈 배열 → 0", sharpeOf([]) === 0);
	check("T3c 전부 0 → 0", sharpeOf([0, 0, 0, 0]) === 0);
	// mean=0.01, sd(표본)=0.01 → sharpe = 1*sqrt(252)
	const s = sharpeOf([0.02, 0.0, 0.02, 0.0]);
	const m = 0.01, sd = Math.sqrt(((0.01 ** 2) * 4) / 3);
	check("T3d 손계산 일치", near(s, (m / sd) * Math.sqrt(252), 1e-9), String(s));
	check("T3e 양의 평균 → 양의 샤프", sharpeOf([0.01, 0.02, 0.005]) > 0);
}

// T4. 백테스트
{
	const prices = generateSeries(makeRng(1), 300);
	const r = backtest(prices, 10, 30);
	check("T4a 수익률 길이 = 가격-1", r.rets.length === prices.length - 1);
	check("T4b 자산곡선 길이 = 가격", r.equity.length === prices.length);
	check("T4c 자산곡선 시작 1", r.equity[0] === 1);
	check("T4d 거래횟수 0 이상 정수", Number.isInteger(r.trades) && r.trades >= 0);
	check("T4e 고정 기대값(샤프·누적)",
		near(r.sharpe, expected.backtest_1_10_30.sharpe, 1e-9) &&
		near(r.totalReturn, expected.backtest_1_10_30.totalReturn, 1e-9),
		`sharpe=${r.sharpe} total=${r.totalReturn}`);
	let threw = false;
	try { backtest(prices, 30, 10); } catch { threw = true; }
	check("T4f fast >= slow 는 거부", threw);
}

// T5. 격자
{
	const g = buildGrid({ maxFast: 30, maxSlow: 120 });
	check("T5a 격자 크기 고정", g.length === expected.gridSize, String(g.length));
	check("T5b 전부 fast < slow", g.every((x) => x.fast < x.slow));
	const s1 = shuffledGrid(), s2 = shuffledGrid();
	check("T5c 섞기 재현성", JSON.stringify(s1) === JSON.stringify(s2));
	check("T5d 섞어도 원소 보존", s1.length === g.length);
	// 중첩성: 작은 N 집합이 큰 N 집합에 완전히 포함돼야 단조성이 성립한다
	const keyOf = (x) => `${x.fast}-${x.slow}`;
	const small = new Set(s1.slice(0, 50).map(keyOf));
	const big = new Set(s1.slice(0, 800).map(keyOf));
	check("T5e 중첩 — N=50 ⊂ N=800", [...small].every((k) => big.has(k)));
}

// T6. 탐색 정렬
{
	const prices = generateSeries(makeRng(3), 400);
	const ranked = searchGrid(prices, shuffledGrid().slice(0, 120));
	check("T6a 샤프 내림차순", ranked.every((x, i) => i === 0 || ranked[i - 1].sharpe >= x.sharpe));
	check("T6b 결과 개수 일치", ranked.length === 120);
}

// T7. MinBTL 공식
{
	// N=100, 샤프 1 → 2*ln(100)/1 = 9.2103...
	check("T7a 손계산 일치", near(minBacktestLengthYears(100, 1), 2 * Math.log(100), 1e-12));
	check("T7b 샤프 0 이하 → null", minBacktestLengthYears(100, 0) === null);
	check("T7c N<=1 → null", minBacktestLengthYears(1, 1) === null);
	check("T7d 샤프가 낮을수록 더 긴 기간 요구",
		minBacktestLengthYears(100, 0.5) > minBacktestLengthYears(100, 1));
	check("T7e N이 클수록 더 긴 기간 요구",
		minBacktestLengthYears(1000, 1) > minBacktestLengthYears(100, 1));
}

// T8. 실험 재현성 + 고정값
{
	const a = runExperiment({ seed: 1, n: 200 });
	const b = runExperiment({ seed: 1, n: 200 });
	check("T8a 실험 재현성", a.winner.fast === b.winner.fast && a.winner.slow === b.winner.slow && near(a.winner.sharpe, b.winner.sharpe));
	const e = expected.experiment_seed1_n200;
	check("T8b 고정 기대값 — 승자·샤프·검증순위",
		a.winner.fast === e.fast && a.winner.slow === e.slow &&
		near(a.winner.sharpe, e.trainSharpe, 1e-9) &&
		near(a.winnerOnTest.sharpe, e.testSharpe, 1e-9) &&
		a.testRank === e.testRank,
		`MA(${a.winner.fast},${a.winner.slow}) train=${a.winner.sharpe} test=${a.winnerOnTest.sharpe} rank=${a.testRank}`);
	check("T8c 학습 순위는 항상 1", a.trainRank === 1);
	check("T8d 검증 순위는 1..N", a.testRank >= 1 && a.testRank <= a.n);
	check("T8e 곡선 길이", a.trainCurve.length === a.trainDays && a.testCurve.length === a.testDays);
}

// T9. 핵심 주장 1 — N을 늘리면 학습 최고 샤프가 단조 비감소
{
	const ns = [10, 50, 200, 800, 3016];
	let mono = true, detail = "";
	for (const seed of [1, 7, 42, 2026, 99]) {
		const rows = sweepN({ seed, ns });
		for (let i = 1; i < rows.length; i++) {
			if (rows[i].trainSharpe < rows[i - 1].trainSharpe - 1e-12) {
				mono = false;
				detail = `seed ${seed}: N=${rows[i - 1].n}(${rows[i - 1].trainSharpe}) → N=${rows[i].n}(${rows[i].trainSharpe})`;
			}
		}
	}
	check("T9 학습 최고 샤프는 N에 대해 단조 비감소 (5개 시드)", mono, detail);
}

// T10. 핵심 주장 2 — 학습 1등은 검증에서 평균으로 돌아간다
{
	const seeds = Array.from({ length: 60 }, (_, i) => i + 1);
	const a = aggregate({ seeds, n: 200 });
	check("T10a 학습 평균 샤프 > 검증 평균 샤프",
		a.meanTrainSharpe > a.meanTestSharpe,
		`train=${a.meanTrainSharpe.toFixed(4)} test=${a.meanTestSharpe.toFixed(4)}`);
	check("T10b 과반이 악화", a.degradedRate > 0.5, `${(a.degradedRate * 100).toFixed(0)}%`);
	// 데이터에 신호가 0이므로 검증 순위는 균등분포여야 한다 → 중앙값이 N/2 근처
	const mid = a.n / 2;
	check("T10c 검증 순위 중앙값이 한가운데(±25%)",
		Math.abs(a.medianTestRank - mid) < a.n * 0.25,
		`median=${a.medianTestRank} vs mid=${mid}`);
	check("T10d 고정 기대값",
		near(a.meanTrainSharpe, expected.aggregate_n200.meanTrainSharpe, 1e-9) &&
		near(a.meanTestSharpe, expected.aggregate_n200.meanTestSharpe, 1e-9) &&
		a.degradedCount === expected.aggregate_n200.degradedCount,
		`train=${a.meanTrainSharpe} test=${a.meanTestSharpe} degraded=${a.degradedCount}`);
}

// T11. median 유틸
{
	check("T11a 홀수", median([3, 1, 2]) === 2);
	check("T11b 짝수", median([4, 1, 3, 2]) === 2.5);
	check("T11c 빈 배열", median([]) === 0);
	check("T11d 원본 불변", (() => { const x = [3, 1, 2]; median(x); return x[0] === 3; })());
}

console.log(`\n${fail === 0 ? "PASS" : "FAIL"} — ${pass}개 통과, ${fail}개 실패`);
process.exit(fail === 0 ? 0 : 1);
