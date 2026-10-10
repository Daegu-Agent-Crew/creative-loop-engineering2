// 출품작 07 펀딩 스프레드 실험실 — 실브라우저 검사 (배포 Pages 대상)
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'https://daegu-agent-crew.github.io/creative-loop-engineering2/hackathon/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const fail = msg => { console.error('FAIL ' + msg); process.exitCode = 1; };

await page.goto(BASE, { waitUntil: 'networkidle' });
if (!(await page.locator('a[href="07-funding-spread-lab/"]').count())) fail('허브에 출품작 07 링크 없음');
await page.goto(BASE + '07-funding-spread-lab/', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__labReady === true, null, { timeout: 30000 });
if ((await page.locator('#chart svg text').count()) < 3) fail('07 차트 축 글자 없음');
await page.click('#auto');
const grid = await page.locator('#grid tr').count();
const chosen = (await page.textContent('#grid tr.chosen')) || '';
const testN = (await page.textContent('#stats .stat:nth-child(3) b')) || '';
console.log(`07: grid=${grid} chosen=${chosen.trim()} testN=${testN}`);
if (grid !== 11) fail('07 자동 선택 격자 행 수 이상');
if (!chosen.includes('0.10%') || !chosen.includes('켜기')) fail('07 자동 선택 결과가 사전 등록 백테스트(0.10%·확인 켜기)와 다름');
if (testN !== '267건') fail('07 검증 거래 수가 백테스트(267건)와 다름');
await page.click('#cost button[data-v="taker"]');
const verdict = (await page.textContent('#verdict')) || '';
if (!verdict.length) fail('07 판정 문구 없음');
await page.screenshot({ path: 'shot-07.png', fullPage: true });
if (errors.length) fail('07 콘솔 오류: ' + errors.join(' | '));
await browser.close();
