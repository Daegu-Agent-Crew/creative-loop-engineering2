// 출품작 08 금융 튜링 테스트 — 차트 렌더 · 기울기 선택 · 진동 · 10판 점수/p값
// domClick: moli(기기 내 실브라우저)는 스타일 변경 직후 요소 좌표를 0으로 돌려줘 Playwright 가시성 판정이 실패함 → 기기 내 실행에서만 DOM 클릭 사용
export async function check08({ browser, BASE, fail, watch, domClick = false }) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  watch(page);
  await page.addInitScript(() => {
    window.__vib = [];
    try { Object.defineProperty(navigator, 'vibrate', { value: p => { window.__vib.push(p); return true; }, configurable: true }); } catch {}
  });
  await page.goto(BASE + '08-financial-turing-test/?seed=20261010', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#game').dataset.real !== '', null, { timeout: 10000 })
    .catch(() => fail('08 첫 판 준비 안 됨'));
  for (const s of ['A', 'B']) {
    const n = await page.locator(`#chart${s} canvas`).count();
    if (n < 1) fail(`08 차트 ${s} 캔버스 없음`);
  }
  await page.screenshot({ path: 'shot-ftt-round.png', fullPage: true });

  const click = sel => domClick ? page.$eval(sel, b => b.click()) : page.click(sel);
  const shown = sel => domClick ? page.$eval(sel, el => getComputedStyle(el).display !== 'none') : page.isVisible(sel);
  const ds = k => page.$eval('#game', (el, k) => el.dataset[k], k);
  const tilt = gamma => page.evaluate(g => window.dispatchEvent(typeof DeviceOrientationEvent === 'function'
    ? new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: 0, gamma: g })
    : Object.assign(new Event('deviceorientation'), { alpha: 0, beta: 0, gamma: g })), gamma);

  // 1판: 수평 → 왼쪽 40° 유지 → A 선택
  await tilt(0);
  for (let i = 0; i < 10; i++) { await tilt(-40); await page.waitForTimeout(100); }
  if ((await ds('chosen')) !== 'A') {
    const diag = await page.evaluate(() => ({ perm: typeof (window.DeviceOrientationEvent || {}).requestPermission, msg: document.getElementById('tiltMsg').textContent, hold: document.getElementById('hold').style.width, needle: document.getElementById('needle').style.left }));
    fail('08 기울기(왼쪽)로 A 선택 안 됨 ' + JSON.stringify(diag));
    await click('#pickA'); // 이후 단계 검사는 계속
  }
  let correct = (await ds('real')) === 'A' ? 1 : 0;
  await click('#next');

  // 2~10판: 총 정답 7이 되도록 버튼 선택
  for (let r = 2; r <= 10; r++) {
    const real = await ds('real');
    const needRight = correct < 7;
    const side = needRight ? real : (real === 'A' ? 'B' : 'A');
    await click('#pick' + side);
    if (needRight) correct++;
    if (!(await shown('#reveal'))) fail(`08 ${r}판 결과 미표시`);
    await click('#next');
  }
  if (correct !== 7) fail(`08 테스트 진행 오류: 정답 ${correct}`);
  const fs = (await page.textContent('#fScore')) || '', fp = (await page.textContent('#fP')) || '';
  console.log(`08 final: score=${fs} p=${fp} machine=${await page.textContent('#fMachine')}`);
  if (fs !== '7') fail('08 점수 표시 오류: ' + fs);
  if (fp !== '17.2%') fail('08 p값 표시 오류: ' + fp);
  const vib = await page.evaluate(() => window.__vib.length);
  if (vib !== 10) fail('08 진동 호출 횟수 ' + vib);
  await page.screenshot({ path: 'shot-ftt-final.png', fullPage: true });
  await page.close();
}
