// 금융 튜링 테스트 — 순수 로직 (브라우저·node 공용)
export const WINDOW = 120; // 일봉 개수. 시뮬레이션(3,000판)에서 기계 판별기 정답률 약 82%

// 재현 가능한 난수 (mulberry32)
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 한 판: 진짜 구간과, 같은 하루 캔들들을 순서만 섞은 가짜
export function makeRound(series, rand, w = WINDOW) {
  const names = Object.keys(series);
  const symbol = names[Math.floor(rand() * names.length)];
  const s = series[symbol], start = Math.floor(rand() * (s.bars.length - w));
  const real = s.bars.slice(start, start + w);
  const fake = shuffle(real, rand);
  const realSide = rand() < 0.5 ? 'A' : 'B';
  return { symbol, start, from: dayOffset(s.from, start), to: dayOffset(s.from, start + w - 1), real, fake, realSide,
    A: realSide === 'A' ? real : fake, B: realSide === 'A' ? fake : real };
}

function dayOffset(from, n) {
  const d = new Date(from + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// bp 캔들 [시가,고가,저가,종가](직전 종가 대비) → 가격 캔들
export function toCandles(bars, base = 100) {
  let pc = base;
  const t0 = Date.UTC(2000, 0, 1) / 1000;
  return bars.map(([o, h, l, c], i) => {
    const k = x => pc * (1 + x / 10000);
    const bar = { time: t0 + i * 86400, open: k(o), high: k(h), low: k(l), close: k(c) };
    pc = bar.close;
    return bar;
  });
}

// |수익률|의 1시차 자기상관 — 큰 움직임 뒤에 큰 움직임이 오는 정도(변동성 군집)
export function absAC1(bars) {
  const a = bars.map(b => Math.abs(b[3]));
  const m = a.reduce((s, x) => s + x, 0) / a.length;
  let num = 0, den = 0;
  for (let i = 0; i < a.length; i++) {
    den += (a[i] - m) ** 2;
    if (i) num += (a[i] - m) * (a[i - 1] - m);
  }
  return den ? num / den : 0;
}

export const machinePick = round => (absAC1(round.A) >= absAC1(round.B) ? 'A' : 'B');

// 동전 던지기(p=0.5)로 n판 중 k판 이상 맞힐 확률 (단측 이항검정)
export function binomTail(k, n) {
  let p = 0, c = 1;
  for (let i = 0; i <= n; i++) {
    if (i >= k) p += c;
    c = c * (n - i) / (i + 1);
  }
  return p / 2 ** n;
}

export function fmtP(p) {
  return p < 0.001 ? '0.1% 미만' : (Math.round(p * 1000) / 10).toFixed(1) + '%';
}
