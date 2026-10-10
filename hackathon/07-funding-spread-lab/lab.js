// 07 펀딩 스프레드 실험실 — 순수 시뮬레이터 (브라우저·Node 공용, DOM 의존 없음)
// perp-hedge-alpha v2 전략 X(거래소 간 펀딩 스프레드)를 bt/backtest_v2.py trades_x와 같은 규칙으로 재현한다.
// d = f8(Bybit) − f8(Binance). |d| ≥ 문턱이면 다음 창부터 반대 포지션으로 수취, 부호가 뒤집히거나 2창 이후 문턱/2 미만이면 철회.

export const THS = [0.0005, 0.001, 0.0015, 0.002, 0.003];
export const COSTS = { maker: 0.0008, taker: 0.0022 };

// data.json → 심볼별 연속 창 목록 [{s, pts:[[idx, x]]}]
export function prepare(data) {
  const out = [];
  for (const [s, start, arr] of data.syms) {
    const pts = [];
    arr.forEach((v, j) => { if (v !== null) pts.push([start + j, v * data.unit]); });
    out.push({ s, pts });
  }
  return out;
}

// 거래 목록: {net, s, t(진입 판단 창 끝 ms), nw(수취 창 수)}
export function simulate(data, syms, { th, conf, cost, from = -Infinity, to = Infinity }) {
  const trades = [];
  for (const { s, pts } of syms) {
    let i = 1;
    while (i < pts.length - 1) {
      const [idx, x] = pts[i];
      const t = data.g0 + idx * data.h8;
      const ok = Math.abs(x) >= th && (!conf || (pts[i - 1][1] * x > 0 && Math.abs(pts[i - 1][1]) >= th));
      if (!(ok && t >= from && t < to && pts[i + 1][0] - idx === 1)) { i++; continue; }
      const sign = x > 0 ? 1 : -1;
      let col = 0, k = i + 1, nw = 0;
      while (k < pts.length && pts[k][0] - pts[k - 1][0] === 1) {
        const y = pts[k][1] * sign;
        col += y; nw++; k++;
        if (y < 0 || (nw >= 2 && y < th / 2)) break;
      }
      trades.push({ net: col - cost, s, t, nw });
      i = k;
    }
  }
  return trades.sort((a, b) => a.t - b.t);
}

export function summarize(trades) {
  const n = trades.length;
  if (!n) return { n: 0 };
  const v = trades.map(x => x.net).sort((a, b) => a - b);
  const sum = v.reduce((a, b) => a + b, 0);
  const med = n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2;
  return {
    n, mean: sum / n, median: med, win: v.filter(x => x > 0).length / n,
    sum, sumExTop1: sum - v[n - 1]
  };
}

// 사전 등록 규칙(PREREG-v2): 학습 구간에서 n ≥ 30인 조합 중 평균 순손익 최대 → 검증 구간에 1회 적용
export function walkForward(data, syms, cost) {
  const trainTo = data.split, t0 = -Infinity;
  let best = null;
  const grid = [];
  for (const th of THS) for (const conf of [false, true]) {
    const sm = summarize(simulate(data, syms, { th, conf, cost, from: t0, to: trainTo }));
    grid.push({ th, conf, ...sm });
    if (sm.n >= 30 && (!best || sm.mean > best.mean || (sm.mean === best.mean && th > best.th))) best = { th, conf, mean: sm.mean };
  }
  return { grid, best };
}

// 누적 곡선: 진입 시각 순으로 순손익 누적 (%, 1건당 동일 비중)
export function curve(trades, dropTop1 = false) {
  let drop = -1;
  if (dropTop1 && trades.length) {
    let m = -Infinity;
    trades.forEach((x, j) => { if (x.net > m) { m = x.net; drop = j; } });
  }
  let acc = 0;
  const pts = [];
  trades.forEach((x, j) => { if (j !== drop) { acc += x.net; pts.push({ t: new Date(x.t), cum: acc * 100 }); } });
  return pts;
}
