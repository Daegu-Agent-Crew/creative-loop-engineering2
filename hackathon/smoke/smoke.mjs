// 해커톤 출품작 실브라우저 검사 — 배포된 Pages URL 대상
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'https://daegu-agent-crew.github.io/creative-loop-engineering2/hackathon/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const fail = msg => { console.error('FAIL ' + msg); process.exitCode = 1; };

await page.goto(BASE, { waitUntil: 'networkidle' });
if (!(await page.locator('a[href="01-agent-brief-clinic/"]').count())) fail('허브에 출품작 01 링크 없음');
await page.screenshot({ path: 'shot-hub.png', fullPage: true });

await page.goto(BASE + '01-agent-brief-clinic/', { waitUntil: 'networkidle' });
for (const [sample, check] of [['weak', t => t < 40], ['good', t => t >= 85]]) {
  await page.click(`[data-sample="${sample}"]`);
  const total = Number(await page.textContent('#total'));
  const rx = await page.locator('#rx li').count();
  const draft = (await page.textContent('#draft')) || '';
  console.log(`${sample}: total=${total} rx=${rx} draft=${draft.length}자`);
  if (!check(total)) fail(`${sample} 점수 범위 이탈: ${total}`);
  if (rx < 1 || draft.length < 20) fail(`${sample} 처방/초안 비어 있음`);
  await page.screenshot({ path: `shot-${sample}.png`, fullPage: true });
}
await page.fill('#src', '');
await page.click('#run');
if (await page.isVisible('#result')) fail('빈 입력에서 결과가 표시됨');
// 출품작 02 반증 도장
await page.goto(BASE, { waitUntil: 'networkidle' });
if (!(await page.locator('a[href="02-falsification-dojo/"]').count())) fail('허브에 출품작 02 링크 없음');
await page.goto(BASE + '02-falsification-dojo/', { waitUntil: 'networkidle' });
for (let n = 0; n < 8; n++) {
  const opts = page.locator('#opts .opt');
  if ((await opts.count()) !== 4) fail(`02 문제 ${n + 1} 선택지 수 이상`);
  // 첫 문제는 일부러 오답 → 오답 처리·해설 확인
  await page.click(n === 0 ? '#opts .opt[data-correct="0"]' : '#opts .opt[data-correct="1"]');
  if (!(await page.isVisible('#explain'))) fail(`02 문제 ${n + 1} 해설 미표시`);
  await page.click('#next');
}
const dojoScore = Number(await page.textContent('#finalScore'));
const rank = (await page.textContent('#rank')) || '';
console.log(`dojo: score=${dojoScore} rank=${rank}`);
if (dojoScore !== 7) fail(`02 점수 집계 오류: ${dojoScore} (기대 7)`);
await page.screenshot({ path: 'shot-dojo-final.png', fullPage: true });
await page.click('#toCard');
await page.click('[data-sample="card"]');
const md = (await page.textContent('#cardMd')) || '';
if (!md.includes('| 1 | 새 지시서 템플릿') || !md.includes('| 보류 |')) fail('02 반증 카드 마크다운 생성 실패');
await page.fill('#cFals', '테스트가 통과하면 성공');
await page.click('#makeCard');
if (!((await page.textContent('#cardWarn')) || '').includes('맞다는 증거')) fail('02 확인 편향 경고 미표시');
await page.screenshot({ path: 'shot-dojo-card.png', fullPage: true });
if (errors.length) fail(errors.join('\n'));
await browser.close();
console.log(process.exitCode ? 'SMOKE FAIL' : 'SMOKE PASS');
