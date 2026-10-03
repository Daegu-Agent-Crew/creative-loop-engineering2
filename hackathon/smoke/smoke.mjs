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
// 출품작 03 조용한 죽음 탐지기
await page.goto(BASE, { waitUntil: 'networkidle' });
if (!(await page.locator('a[href="03-silent-death-detector/"]').count())) fail('허브에 출품작 03 링크 없음');
await page.goto(BASE + '03-silent-death-detector/', { waitUntil: 'networkidle' });
if (await page.isVisible('#result')) fail('03 초기 상태에서 결과가 보임');
await page.click('[data-sample="healthy"]');
if (!(await page.isVisible('#result'))) fail('03 정상 샘플에서 결과 미표시');
const okCount = Number(await page.textContent('#okCount'));
const healthyDead = Number(await page.textContent('#deadCount'));
console.log(`sdd healthy: ok=${okCount} dead=${healthyDead}`);
if (okCount !== 4 || healthyDead !== 0) fail(`03 정상 샘플 집계 오류: ok=${okCount} dead=${healthyDead}`);
await page.click('[data-sample="dead"]');
const sddDead = Number(await page.textContent('#deadCount'));
const sddRows = await page.locator('#rows tr').count();
const sddCard = (await page.textContent('#card')) || '';
const sddChecks = await page.locator('#checklist li').count();
console.log(`sdd outage: dead=${sddDead} rows=${sddRows} checklist=${sddChecks} card=${sddCard.length}자`);
if (sddDead !== 5) fail(`03 장애 샘플 사망 집계 오류: ${sddDead} (기대 5)`);
if (sddRows !== 5) fail(`03 장애 샘플 행 수 오류: ${sddRows}`);
if (sddChecks < 5) fail(`03 체크리스트 부족: ${sddChecks}`);
if (!sddCard.includes('| 사망 |') || !sddCard.includes('LIMIT=')) fail('03 침묵 감시 카드 생성 실패');
if (!((await page.textContent('#blindNote')) || '').includes('5건')) fail('03 실패 알림 사각지대 집계 미표시');
await page.screenshot({ path: 'shot-sdd-outage.png', fullPage: true });
await page.fill('#jobs', 'A | 6h | 7h 전');
await page.click('#run');
if (Number(await page.textContent('#lateCount')) !== 1) fail('03 지연 판정 오류');
await page.fill('#jobs', '');
await page.click('#run');
if (await page.isVisible('#result')) fail('03 빈 입력에서 결과가 표시됨');
await page.click('#tabCase');
if (!(await page.isVisible('#caseStudy'))) fail('03 부검 탭 전환 실패');
await page.screenshot({ path: 'shot-sdd-case.png', fullPage: true });

if (errors.length) fail(errors.join('\n'));
await browser.close();
console.log(process.exitCode ? 'SMOKE FAIL' : 'SMOKE PASS');
