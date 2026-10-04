// 출품작 04 폰 안의 AI — CI 크롬(WebGPU 없음)에서 WASM 경로로 실제 모델 다운로드·생성
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'https://daegu-agent-crew.github.io/creative-loop-engineering2/hackathon/';
const browser = await chromium.launch();
let failed = false;
const fail = m => { console.error('FAIL ' + m); failed = true; };

const hub = await browser.newPage();
await hub.goto(BASE, { waitUntil: 'networkidle' });
if (!(await hub.locator('a[href="04-pocket-ai/"]').count())) fail('허브에 출품작 04 링크 없음');
await hub.close();

for (const [key, q, max, re] of [
  ['tiny', 'Hi! Who are you?', 24, /[A-Za-z]{2,}/],
  ['ko', '대구를 한 문장으로 소개해줘', 48, /[가-힣]{2,}/]
]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const t0 = Date.now();
  await page.goto(`${BASE}04-pocket-ai/?auto=${key}&device=wasm&max=${max}&q=${encodeURIComponent(q)}`);
  await page.waitForFunction(() => ['done', 'error'].includes(document.documentElement.dataset.state), null, { timeout: 480000 });
  const r = await page.evaluate(() => ({ state: document.documentElement.dataset.state, res: window.__pocketResult, err: window.__pocketError }));
  const sec = ((Date.now() - t0) / 1000).toFixed(0);
  if (r.state === 'done' && r.res && re.test(r.res.text)) {
    console.log(`pocket-ai: generated [${key}] ${r.res.tokens}tok ${r.res.tps.toFixed(1)}tok/s total ${sec}s :: ${r.res.text.replace(/\s+/g, ' ').slice(0, 120)}`);
  } else fail(`04 ${key} 생성 실패 (${sec}s): ${r.err || JSON.stringify(r.res)}`);
  if (errs.length) fail(`04 ${key} 오류: ` + errs.join(' | '));
  await page.screenshot({ path: `shot-pocket-${key}.png`, fullPage: true });
  await page.close();
}
await browser.close();
console.log(failed ? 'POCKET FAIL' : 'POCKET PASS');
process.exit(failed ? 1 : 0);
