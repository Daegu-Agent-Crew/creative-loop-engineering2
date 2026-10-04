// 출품작 05 손짓 오케스트라 검사 — 카메라 없는 환경: 거부/없음 경로 → 데모 모드 폴백, 마우스 지휘
export async function check05({ browser, BASE, fail, watch }) {
  const url = BASE + '05-gesture-orchestra/';
  const ds = (p, k) => p.$eval('#stage', (el, k) => el.dataset[k], k);

  // ① 카메라 버튼 → (권한 거부 또는 장치 없음) → 오류 없이 데모 모드로 전환
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  watch(page);
  await page.goto(url, { waitUntil: 'networkidle' });
  if ((await ds(page, 'state')) !== 'idle') fail('05 초기 상태가 idle 아님');
  await page.click('#startCam');
  await page.waitForFunction(() => document.querySelector('#stage').dataset.mode === 'demo', null, { timeout: 8000 })
    .catch(() => fail('05 카메라 실패 시 데모 폴백 안 됨'));
  const msg = (await page.textContent('#camStatus')) || '';
  console.log('05 cam-fallback:', msg);
  if (!msg.includes('데모 모드로 전환')) fail('05 카메라 실패 안내 문구 없음');

  // ② 마우스 지휘: 오른쪽 위 → 빠르게·리노버 솔로 / 왼쪽 아래 → 느리게·대구루 솔로
  const box = await page.locator('#stage').boundingBox();
  const at = (fx, fy) => page.mouse.move(box.x + box.width * fx, box.y + box.height * fy);
  await at(0.95, 0.05);
  await page.waitForFunction(() => { const d = document.querySelector('#stage').dataset; return +d.tempo >= 160 && d.focus === '4'; }, null, { timeout: 4000 })
    .catch(async () => fail(`05 위쪽 지휘 반영 안 됨: tempo=${await ds(page, 'tempo')} focus=${await ds(page, 'focus')}`));
  const fast = +(await ds(page, 'tempo'));
  await page.screenshot({ path: 'shot-orchestra-fast.png', fullPage: true });
  await at(0.05, 0.95);
  await page.waitForFunction(() => { const d = document.querySelector('#stage').dataset; return +d.tempo <= 75 && d.focus === '0'; }, null, { timeout: 4000 })
    .catch(async () => fail(`05 아래쪽 지휘 반영 안 됨: tempo=${await ds(page, 'tempo')} focus=${await ds(page, 'focus')}`));

  const slow = +(await ds(page, 'tempo'));
  console.log(`05 tempo: top=${fast} bottom=${slow}`);
  if (fast - slow < 80) fail(`05 손 높이-템포 대응 폭 부족 ${fast}/${slow}`);

  // ③ 박자 진행 → 주먹(정지) 시 멈춤 → 손바닥(연주) 시 재개
  const b0 = +(await ds(page, 'beats')); await page.waitForTimeout(1500);
  const b1 = +(await ds(page, 'beats'));
  if (b1 <= b0) fail(`05 연주 중 박자 진행 없음 ${b0}→${b1}`);
  await page.click('#fist');
  if ((await ds(page, 'state')) !== 'stopped') fail('05 정지 버튼 미동작');
  const s0 = +(await ds(page, 'beats')); await page.waitForTimeout(800);
  if (+(await ds(page, 'beats')) !== s0) fail('05 정지 중에도 박자 진행');
  await page.screenshot({ path: 'shot-orchestra-stop.png', fullPage: true });
  await page.click('#palm');
  await page.waitForTimeout(800);
  if ((await ds(page, 'state')) !== 'playing' || +(await ds(page, 'beats')) <= s0) fail('05 연주 재개 미동작');
  console.log(`05 demo: beats ${b0}→${b1}, stop/resume ok`);
  await page.close();

  // ④ 카메라 API 자체가 없는 브라우저
  const p2 = await browser.newPage();
  watch(p2);
  await p2.addInitScript(() => { try { Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true }); } catch {} });
  await p2.goto(url, { waitUntil: 'networkidle' });
  await p2.click('#startCam');
  await p2.waitForFunction(() => document.querySelector('#stage').dataset.mode === 'demo', null, { timeout: 5000 })
    .catch(() => fail('05 카메라 API 없음 경로 폴백 안 됨'));
  const msg2 = (await p2.textContent('#camStatus')) || '';
  if (!msg2.includes('쓸 수 없습니다')) fail('05 카메라 API 없음 안내 문구 없음: ' + msg2);
  await p2.close();
}
