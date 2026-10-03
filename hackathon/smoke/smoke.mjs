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
if (errors.length) fail(errors.join('\n'));
await browser.close();
console.log(process.exitCode ? 'SMOKE FAIL' : 'SMOKE PASS');
