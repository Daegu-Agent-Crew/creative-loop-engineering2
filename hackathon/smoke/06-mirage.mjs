// 출품작 06 백테스트는 전부 아름답다 — 실브라우저 검사 (배포 Pages 대상)
// 검사 대상은 "그려졌는가"가 아니라 "작품이 주장하는 수치가 실제로 나오는가"다.
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'https://daegu-agent-crew.github.io/creative-loop-engineering2/hackathon/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const fail = msg => { console.error('FAIL ' + msg); process.exitCode = 1; };

await page.goto(BASE, { waitUntil: 'networkidle' });
if (!(await page.locator('a[href="06-backtest-mirage/"]').count())) fail('허브에 출품작 06 링크 없음');

await page.goto(BASE + '06-backtest-mirage/', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__mirageReady === true, null, { timeout: 30000 });

// 개별 실행 — 기본 시드 1 / N=200 은 node 테스트의 고정 기대값과 같아야 한다(재현성)
const train = (await page.textContent('#t-train')) || '';
const test = (await page.textContent('#t-test')) || '';
const rank = (await page.textContent('#t-rank')) || '';
const btl = (await page.textContent('#t-btl')) || '';
console.log(`06: train=${train} test=${test} rank=${rank} minBTL=${btl}`);
if (train.trim() !== '0.87') fail(`06 학습 샤프가 node 기대값(0.87)과 다름: ${train}`);
if (test.trim() !== '0.17') fail(`06 검증 샤프가 node 기대값(0.17)과 다름: ${test}`);
if (rank.trim() !== '1/200') fail(`06 검증 순위가 node 기대값(1/200)과 다름: ${rank}`);
if (btl.trim() !== '14.0년') fail(`06 MinBTL이 node 기대값(14.0년)과 다름: ${btl}`);

// 수익곡선 2개가 실제로 그려졌는가
if ((await page.locator('.plot svg path.ln').count()) !== 2) fail('06 수익곡선 2개가 그려지지 않음');
// SVG 텍스트를 못 그리는 브라우저 대비로 축 글자는 HTML로 얹었다 — 그 라벨이 있는지 확인
if ((await page.locator('.plot .ylab').count()) < 8) fail('06 y축 라벨(HTML) 부족');

// N 스윕 표 — 학습 샤프가 단조 비감소여야 한다(작품의 핵심 주장 G3)
const sweep = await page.$$eval('#sweep tbody tr', rows =>
  rows.map(r => [...r.children].map(c => c.textContent.trim())));
if (sweep.length !== 5) fail(`06 N 스윕 행 수 이상: ${sweep.length}`);
const trainCol = sweep.map(r => parseFloat(r[1]));
for (let i = 1; i < trainCol.length; i++) {
  if (trainCol[i] < trainCol[i - 1] - 1e-9) fail(`06 학습 샤프 단조성 위반: ${trainCol.join(' → ')}`);
}
console.log(`06: sweep train = ${trainCol.join(' → ')}`);

// 자동 집계(N=200, 시드 60개) — 작품의 주장을 수치로 확인
await page.waitForFunction(() => Array.isArray(window.__mirageAgg) && window.__mirageAgg.length >= 1, null, { timeout: 30000 });
const agg = await page.evaluate(() => window.__mirageAgg[0]);
console.log(`06: agg n=${agg.n} meanTrain=${agg.meanTrain.toFixed(3)} meanTest=${agg.meanTest.toFixed(3)} medianRank=${agg.medianRank} degraded=${agg.degraded}/60`);
if (!(agg.meanTrain > agg.meanTest)) fail('06 학습 평균이 검증 평균보다 높지 않음 — 작품의 주장이 성립하지 않음');
if (Math.abs(agg.medianRank - agg.n / 2) > agg.n * 0.25) fail(`06 검증 순위 중앙값이 한가운데가 아님: ${agg.medianRank}/${agg.n}`);
if (!(agg.degraded > 30)) fail(`06 악화 건수가 과반 미만: ${agg.degraded}/60`);

// 슬라이더 상호작용 — N을 바꾸면 다시 계산된다
await page.evaluate(() => {
  const el = document.getElementById('n');
  el.value = '800';
  el.dispatchEvent(new Event('change'));
});
await page.waitForFunction(() => (document.getElementById('status').textContent || '').includes('후보 800'), null, { timeout: 30000 });
console.log('06: N=800 재계산 OK');

await page.screenshot({ path: 'shot-06.png', fullPage: true });
if (errors.length) fail('06 콘솔 오류: ' + errors.join(' | '));
await browser.close();
