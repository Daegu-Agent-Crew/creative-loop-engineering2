// 해커톤 출품작 실브라우저 검사 — 배포된 Pages URL 대상
import { chromium } from 'playwright';
import { check05 } from './05-gesture.mjs';
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

// 출품작 05 손짓 오케스트라 (카메라 없는 CI: 폴백·데모 지휘 검사)
await page.goto(BASE, { waitUntil: 'networkidle' });
if (!(await page.locator('a[href="05-gesture-orchestra/"]').count())) fail('허브에 출품작 05 링크 없음');
const watch = p => {
  p.on('pageerror', e => errors.push('05 pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push('05 console: ' + m.text()); });
};
await check05({ browser, BASE, fail, watch });

// 출품작 06 에이전트 심음 (Web Audio 실시간 합성)
await page.goto(BASE, { waitUntil: 'networkidle' });
if (!(await page.locator('a[href="06-agent-heartbeat/"]').count())) fail('허브에 출품작 06 링크 없음');
{
  const p6 = await browser.newPage({ viewport: { width: 390, height: 844 } });
  p6.on('pageerror', e => errors.push('06 pageerror: ' + e.message));
  p6.on('console', m => { if (m.type() === 'error') errors.push('06 console: ' + m.text()); });
  await p6.goto(BASE + '06-agent-heartbeat/', { waitUntil: 'networkidle' });

  // 배포된 스크립트의 순수 로직을 실브라우저에서 직접 호출
  const pure = await p6.evaluate(() => ({
    normal: ECG.notesFor('normal', 0, 16).length,
    silenceAfter9: ECG.notesFor('silence', 9, 16).length,
    counts: ECG.ORDER.map(id => ECG.notesFor(id, 0, 16).length),
    flat: ECG.ORDER.every(id => ECG.dashboardRate(id).every(v => v === 100))
  }));
  console.log(`ecg pure: normal=${pure.normal} silenceAfter9=${pure.silenceAfter9} counts=${pure.counts.join('/')} flat100=${pure.flat}`);
  if (pure.normal !== 60) fail(`06 정상 음표 수 오류: ${pure.normal} (기대 60)`);
  if (pure.silenceAfter9 !== 0) fail(`06 침묵 구간에 음표가 있음: ${pure.silenceAfter9}`);
  if (new Set(pure.counts).size !== 4) fail(`06 시나리오 음표 수가 겹침: ${pure.counts.join('/')}`);
  if (!pure.flat) fail('06 성공률이 100% 수평선이 아님 (작품의 전제)');

  if ((await p6.locator('#svgRate').getAttribute('points') || '').split(' ').length !== 16) fail('06 성공률 폴리라인 점 수 오류');
  if (!(await p6.isVisible('#charts'))) fail('06 초기 차트 미표시');

  // 실제 Web Audio 경로 — 오실레이터가 실브라우저에서 예약되는지
  await p6.click('[data-scenario="normal"]');
  await p6.waitForFunction(() => Number(document.getElementById('noteCount').textContent) > 0, null, { timeout: 5000 })
    .catch(() => fail('06 재생 직후 음표 예약 0건'));
  const audio = await p6.evaluate(() => ({
    state: window.ECG.player.ctx ? window.ECG.player.ctx.state : 'none',
    scheduled: window.ECG.player.scheduled.length
  }));
  console.log(`ecg audio: ctx=${audio.state} scheduled=${audio.scheduled}`);
  if (audio.state === 'none') fail('06 AudioContext 생성 실패');
  if (!audio.scheduled) fail('06 예약된 음표 없음');
  await p6.waitForTimeout(2200);
  const moved = await p6.evaluate(() => Number(document.getElementById('elapsed').textContent));
  console.log(`ecg clock: elapsed=${moved}s`);
  if (!(moved > 0.5)) fail(`06 오디오 시계가 전진하지 않음: ${moved}`);
  await p6.screenshot({ path: 'shot-ecg-listen.png', fullPage: true });

  // 침묵 시나리오: 9초 이후 예약 0건
  await p6.click('[data-scenario="silence"]');
  await p6.waitForTimeout(600);
  const sil = await p6.evaluate(() => window.ECG.player.scheduled.every(n => n.at < 9));
  if (!sil) fail('06 침묵 시나리오에서 9초 이후 음표가 예약됨');

  // 블라인드 테스트 1라운드
  await p6.click('#stop');
  await p6.click('#blindStart');
  if (!(await p6.isVisible('#blindBody'))) fail('06 블라인드 시작 실패');
  await p6.click('#blindPlay');
  const truth = await p6.evaluate(() => window.ECG.player.scenario);
  await p6.click(`#blindOpts .opt[data-pick="${truth}"]`);
  const fbCls = await p6.getAttribute('#blindFeedback', 'class');
  if (!(fbCls || '').includes('good')) fail(`06 정답 피드백 실패: ${fbCls}`);
  if (!(await p6.isVisible('#blindNext'))) fail('06 다음 버튼 미표시');
  console.log(`ecg blind: truth=${truth} ok`);
  await p6.screenshot({ path: 'shot-ecg-blind.png', fullPage: true });
  await p6.close();
}

if (errors.length) fail(errors.join('\n'));
await browser.close();
console.log(process.exitCode ? 'SMOKE FAIL' : 'SMOKE PASS');
