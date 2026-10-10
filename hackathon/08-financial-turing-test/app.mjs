// 금융 튜링 테스트 — 화면·입력 (기울기·진동·차트)
import { rng, makeRound, toCandles, absAC1, machinePick, binomTail, fmtP } from './core.mjs';

const ROUNDS = 10, TILT_DEG = 25, NEUTRAL_DEG = 10, HOLD_MS = 700;
const $ = id => document.getElementById(id);
const game = $('game');
const NAMES = { BTC: '비트코인', ETH: '이더리움', SOL: '솔라나', XRP: '리플', DOGE: '도지코인', BNB: 'BNB' };

const qs = new URLSearchParams(location.search);
let seed = Number(qs.get('seed')) || (crypto.getRandomValues(new Uint32Array(1))[0] || 1);
let series = null, rand, round, n = 0, score = 0, machineScore = 0, answered = false;

// ---------- 차트 ----------
const charts = {};
function chartFor(side) {
  if (charts[side] !== undefined) return charts[side];
  const el = $('chart' + side);
  const LC = window.LightweightCharts;
  charts[side] = null;
  if (LC && typeof LC.createChart === 'function') {
    try {
      const auto = 'ResizeObserver' in window;
      const chart = LC.createChart(el, {
        autoSize: auto, ...(auto ? {} : { width: el.clientWidth || 320, height: 190 }),
        layout: { background: { type: 'solid', color: '#14161e' }, textColor: '#9ba3b4' },
        grid: { vertLines: { color: 'rgba(255,255,255,.04)' }, horzLines: { color: 'rgba(255,255,255,.04)' } },
        rightPriceScale: { visible: false }, leftPriceScale: { visible: false },
        timeScale: { visible: false }, crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
        handleScroll: false, handleScale: false,
      });
      const s = chart.addSeries(LC.CandlestickSeries, {
        upColor: '#22c55e', downColor: '#ef4444', borderVisible: false, wickUpColor: '#22c55e', wickDownColor: '#ef4444',
        priceLineVisible: false, lastValueVisible: false,
      });
      charts[side] = { set: data => { s.setData(data); chart.timeScale().fitContent(); } };
    } catch { charts[side] = null; }
  }
  if (!charts[side]) charts[side] = canvasChart(el); // 라이브러리 로드 실패 시 직접 그리기
  return charts[side];
}
function canvasChart(el) {
  const cv = document.createElement('canvas');
  cv.width = 600; cv.height = 190; cv.style.width = '100%'; cv.style.height = '190px';
  el.appendChild(cv);
  const g = cv.getContext('2d');
  return { set(data) {
    g.fillStyle = '#14161e'; g.fillRect(0, 0, cv.width, cv.height);
    const hi = Math.max(...data.map(d => d.high)), lo = Math.min(...data.map(d => d.low));
    const y = v => 8 + (hi - v) / (hi - lo || 1) * (cv.height - 16), w = cv.width / data.length;
    data.forEach((d, i) => {
      g.fillStyle = g.strokeStyle = d.close >= d.open ? '#22c55e' : '#ef4444';
      const x = i * w + w / 2;
      g.beginPath(); g.moveTo(x, y(d.high)); g.lineTo(x, y(d.low)); g.stroke();
      g.fillRect(x - w * 0.35, Math.min(y(d.open), y(d.close)), w * 0.7, Math.max(1, Math.abs(y(d.open) - y(d.close))));
    });
  } };
}

// ---------- 진행 ----------
function newRound() {
  round = makeRound(series, rand);
  answered = false;
  game.dataset.real = round.realSide; game.dataset.chosen = ''; game.dataset.round = String(n + 1);
  $('rno').textContent = n + 1; $('score').textContent = score;
  for (const side of ['A', 'B']) {
    chartFor(side).set(toCandles(round[side]));
    $('card' + side).classList.remove('real', 'fake', 'lean');
    $('pick' + side).disabled = false;
  }
  $('reveal').style.display = 'none';
  needNeutral = true;
}

function choose(side) {
  if (answered || !round) return;
  answered = true;
  const ok = side === round.realSide, m = machinePick(round);
  if (ok) score++;
  if (m === round.realSide) machineScore++;
  game.dataset.chosen = side;
  $('score').textContent = score;
  try { if (navigator.vibrate) navigator.vibrate(ok ? 40 : [90, 60, 90]); } catch { /* 진동 없는 기기 */ }
  for (const s of ['A', 'B']) {
    $('card' + s).classList.remove('lean');
    $('card' + s).classList.add(s === round.realSide ? 'real' : 'fake');
    $('pick' + s).disabled = true;
  }
  $('rvHead').innerHTML = '';
  const b = document.createElement('b');
  b.className = ok ? 'ok' : 'no';
  b.textContent = ok ? `정답! ${round.realSide}가 진짜입니다.` : `아쉽습니다. 진짜는 ${round.realSide}였습니다.`;
  $('rvHead').appendChild(b);
  $('rvWhat').textContent = `${NAMES[round.symbol] || round.symbol} ${round.from} ~ ${round.to}`;
  $('rvAC').textContent = `${absAC1(round.A).toFixed(2)} / ${absAC1(round.B).toFixed(2)}`;
  $('rvMachine').textContent = `${m}를 골랐습니다 — ${m === round.realSide ? '정답' : '오답'}`;
  $('next').textContent = n + 1 >= ROUNDS ? '결과 보기' : '다음 판';
  $('reveal').style.display = 'block';
  holdStart = 0; $('hold').style.width = '0';
}

function finish() {
  game.style.display = 'none';
  $('final').style.display = 'block';
  const p = binomTail(score, ROUNDS);
  $('fScore').textContent = score;
  $('fP').textContent = fmtP(p);
  $('fMachine').textContent = `${machineScore} / ${ROUNDS}`;
  $('fVerdict').textContent = p <= 0.05 ? '🎯 우연이라 보기 어렵습니다. 진짜 시장의 흔적을 읽어 냈습니다.'
    : score >= 5 ? '🪙 아직은 동전 던지기와 구별되지 않습니다. 큰 캔들이 몰려 있는 쪽을 찾아 보세요.'
    : '🌀 동전보다 못했습니다. 반대로 고르는 습관이 있는지도 모릅니다.';
}

function restart() {
  n = 0; score = 0; machineScore = 0;
  rand = rng(++seed);
  $('final').style.display = 'none'; game.style.display = 'block';
  newRound();
}

$('pickA').addEventListener('click', () => choose('A'));
$('pickB').addEventListener('click', () => choose('B'));
$('next').addEventListener('click', () => { if (++n >= ROUNDS) finish(); else newRound(); });
$('retry').addEventListener('click', restart);
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') choose('A');
  else if (e.key === 'ArrowRight') choose('B');
});

// ---------- 기울기 ----------
let holdStart = 0, holdSide = '', needNeutral = true;
function onTilt(e) {
  const gamma = typeof e.gamma === 'number' ? Math.max(-60, Math.min(60, e.gamma)) : 0;
  $('needle').style.left = `calc(${50 + gamma / 60 * 50}% - 2px)`;
  if (answered) return;
  if (Math.abs(gamma) < NEUTRAL_DEG) needNeutral = false;
  const side = gamma <= -TILT_DEG ? 'A' : gamma >= TILT_DEG ? 'B' : '';
  $('cardA').classList.toggle('lean', side === 'A');
  $('cardB').classList.toggle('lean', side === 'B');
  if (!side || needNeutral) { holdStart = 0; $('hold').style.width = '0'; return; }
  const now = performance.now();
  if (side !== holdSide || !holdStart) { holdSide = side; holdStart = now; }
  const k = Math.min(1, (now - holdStart) / HOLD_MS);
  $('hold').style.width = (k * 100) + '%';
  if (k >= 1) choose(side);
}
function listenTilt() {
  window.addEventListener('deviceorientation', onTilt);
  $('tiltMsg').textContent = '폰을 왼쪽(A)·오른쪽(B)으로 0.7초 기울이면 선택됩니다. 다음 판은 수평으로 돌아온 뒤 시작됩니다.';
}
if (typeof DeviceOrientationEvent === 'undefined') {
  $('tiltMsg').textContent = '이 기기는 기울기 센서를 지원하지 않습니다. 버튼이나 ← → 키로 고르세요.';
} else if (typeof DeviceOrientationEvent.requestPermission === 'function') { // iOS: 사용자 동작 후 권한 요청
  $('tiltOn').hidden = false;
  $('tiltOn').addEventListener('click', async () => {
    try {
      const r = await DeviceOrientationEvent.requestPermission();
      if (r === 'granted') { listenTilt(); $('tiltOn').hidden = true; }
      else $('tiltMsg').textContent = '기울기 권한이 거부되었습니다. 버튼으로 고르세요.';
    } catch { $('tiltMsg').textContent = '기울기 권한을 요청하지 못했습니다. 버튼으로 고르세요.'; }
  });
} else listenTilt();

// ---------- 시작 ----------
fetch('data.json').then(r => r.json()).then(d => {
  series = d.series;
  rand = rng(seed);
  newRound();
}).catch(() => { $('tiltMsg').textContent = '가격 데이터를 불러오지 못했습니다. 새로고침해 주세요.'; });
