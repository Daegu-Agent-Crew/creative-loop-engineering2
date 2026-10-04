// 손짓 에이전트 오케스트라 — 서버 없음. 카메라 영상은 기기 안에서만 처리한다.
// 손 인식: MediaPipe Tasks Vision Hand Landmarker (카메라 허용 후에만 CDN에서 불러옴)
const MP_VER = '1.0.1';
const MP_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VER}`;
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const $ = id => document.getElementById(id);
const stage = $('stage'), g = stage.getContext('2d'), video = $('cam');
const W = stage.width, H = stage.height;

const PLAYERS = [
  { id: 'daeguru', name: '대구루', part: '베이스', color: '#6366f1', emoji: '📋' },
  { id: 'daeguru2', name: '대구루2', part: '화음', color: '#22c55e', emoji: '🥋' },
  { id: 'laika', name: '라이카', part: '멜로디', color: '#f59e0b', emoji: '🐕' },
  { id: 'lenovo', name: '레노버', part: '하이햇', color: '#ec4899', emoji: '💻' },
  { id: 'renover', name: '리노버', part: '북', color: '#06b6d4', emoji: '🔧' },
];
const MIN_BPM = 60, MAX_BPM = 180;

const S = {
  mode: 'none', playing: false, tempo: 100, targetTempo: 100, focus: -1,
  beats: 0, step: 0, nextStepAt: 0, hand: null, lastHandAt: 0,
  hits: PLAYERS.map(() => 0), gestureVotes: [], stream: null, landmarker: null,
};

// ---------- 소리 (Web Audio) ----------
let ac = null, master = null, partGain = [];
function ensureAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return; // 소리 없이 화면만 동작
  try {
    ac = new AC();
    const comp = ac.createDynamicsCompressor();
    master = ac.createGain(); master.gain.value = 0.55;
    master.connect(comp); comp.connect(ac.destination);
    partGain = PLAYERS.map(() => { const n = ac.createGain(); n.gain.value = 0.6; n.connect(master); return n; });
    if (ac.state === 'suspended') ac.resume().catch(() => {});
  } catch { ac = null; }
}
let noiseBuf = null;
function noise() {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ac.createBufferSource(); s.buffer = noiseBuf; return s;
}
function tone(part, freq, dur, type = 'sine', vol = 0.3, sweepTo = 0) {
  if (!ac) return;
  const t = ac.currentTime, o = ac.createOscillator(), e = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (sweepTo) o.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
  e.gain.setValueAtTime(0.0001, t);
  e.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(e); e.connect(partGain[part]); o.start(t); o.stop(t + dur + 0.02);
}
function hat(part, dur, vol) {
  if (!ac) return;
  const t = ac.currentTime, s = noise(), f = ac.createBiquadFilter(), e = ac.createGain();
  f.type = 'highpass'; f.frequency.value = 7000;
  e.gain.setValueAtTime(vol, t); e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(e); e.connect(partGain[part]); s.start(t); s.stop(t + dur + 0.02);
}

// C · Am · F · G 진행, 8분음표 8칸 = 1마디
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]];
const PENTA = [60, 62, 64, 67, 69, 72, 74, 76];
const MELODY = [0, 2, 4, 3, 5, 4, 2, 1, 2, 4, 5, 7, 6, 4, 3, 2];

function playStep(step) {
  const bar = Math.floor(step / 8) % 4, s = step % 8, chord = CHORDS[bar];
  const spb = 60 / S.tempo;
  if (s === 0 || s === 4) { tone(0, midi(chord[0] - 12 + (s === 4 ? 7 : 0)), spb * 0.9, 'triangle', 0.5); S.hits[0] = performance.now(); }
  if (s === 0) { chord.forEach(n => tone(1, midi(n + 12), spb * 3.6, 'sine', 0.12)); S.hits[1] = performance.now(); }
  if (s % 2 === 0 || s === 3) { tone(2, midi(PENTA[MELODY[(step >> 1) % 16]]), spb * 0.45, 'square', 0.07); if (s % 2 === 0) S.hits[2] = performance.now(); }
  hat(3, s % 2 ? 0.03 : 0.06, s % 2 ? 0.08 : 0.15); S.hits[3] = performance.now();
  if (s === 0 || s === 4) { tone(4, 150, 0.25, 'sine', 0.9, 40); S.hits[4] = performance.now(); }
  if (s === 2 || s === 6) { hat(4, 0.12, 0.25); }
}

function updateGains() {
  if (!ac) return;
  const t = ac.currentTime;
  partGain.forEach((n, i) => n.gain.setTargetAtTime(S.focus < 0 ? 0.6 : (i === S.focus ? 1.1 : 0.25), t, 0.08));
}

// ---------- 지휘 상태 ----------
function setPlaying(on) {
  if (S.playing === on) return;
  S.playing = on;
  if (on) { ensureAudio(); S.nextStepAt = performance.now(); }
  $('fist').disabled = !on || S.mode === 'none';
  $('palm').disabled = on || S.mode === 'none';
  publish();
}
function conduct(x, y) { // x, y: 0~1, 화면 기준(왼쪽 위 0)
  x = Math.min(1, Math.max(0, x)); y = Math.min(1, Math.max(0, y));
  const ty = Math.min(1, Math.max(0, (y - 0.1) / 0.8)); // 위아래 10%는 끝값 — 손이 화면 끝까지 안 가도 된다
  S.targetTempo = Math.round(MIN_BPM + (1 - ty) * (MAX_BPM - MIN_BPM));
  const f = Math.min(PLAYERS.length - 1, Math.floor(x * PLAYERS.length));
  if (f !== S.focus) { S.focus = f; updateGains(); }
  S.hand = { x, y }; S.lastHandAt = performance.now();
}
function releaseHand() { S.hand = null; if (S.focus !== -1) { S.focus = -1; updateGains(); } }

function publish() {
  const d = stage.dataset;
  d.state = S.mode === 'none' ? 'idle' : (S.playing ? 'playing' : 'stopped');
  d.tempo = String(Math.round(S.tempo)); d.focus = String(S.focus); d.beats = String(S.beats); d.mode = S.mode;
  $('hMode').textContent = { none: '대기', demo: '데모(마우스·터치)', camera: '카메라' }[S.mode];
  $('hTempo').textContent = S.mode === 'none' ? '—' : Math.round(S.tempo);
  $('hFocus').textContent = S.focus < 0 ? '—' : `${PLAYERS[S.focus].name} (${PLAYERS[S.focus].part})`;
  $('hState').textContent = d.state === 'playing' ? '연주 중' : d.state === 'stopped' ? '정지' : '대기';
}
const status = msg => { $('camStatus').textContent = msg; };

// ---------- 시계 ----------
setInterval(() => {
  S.tempo += (S.targetTempo - S.tempo) * 0.2;
  if (Math.abs(S.targetTempo - S.tempo) < 0.5) S.tempo = S.targetTempo;
  if (S.playing) {
    const now = performance.now(), stepMs = 30000 / S.tempo; // 8분음표
    if (now - S.nextStepAt > 1000) S.nextStepAt = now; // 탭 비활성 복귀 시 몰아치기 방지
    while (now >= S.nextStepAt) {
      playStep(S.step);
      if (S.step % 2 === 0) S.beats++;
      S.step++; S.nextStepAt += stepMs;
    }
  }
  if (S.mode === 'camera' && S.hand && performance.now() - S.lastHandAt > 1500) { releaseHand(); status('손이 화면에서 보이지 않습니다. 카메라 앞에 손을 들어 주세요.'); }
  publish();
}, 25);

// ---------- 그리기 ----------
function draw(now) {
  g.clearRect(0, 0, W, H);
  if (typeof g.createLinearGradient === 'function') {
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0d0f18'); grad.addColorStop(1, '#151826');
    g.fillStyle = grad;
  } else g.fillStyle = '#10121c';
  g.fillRect(0, 0, W, H);
  // 템포 눈금
  g.fillStyle = 'rgba(255,255,255,.05)';
  for (let i = 0; i <= 4; i++) g.fillRect(0, 40 + i * (H - 200) / 4, W, 1);
  g.font = '14px sans-serif'; g.fillStyle = '#5c6478'; g.textAlign = 'left';
  g.fillText('빠르게 ↑', 12, 30); g.fillText('느리게 ↓', 12, H - 168);
  // 무대
  g.fillStyle = '#1d2133'; g.beginPath(); g.ellipse(W / 2, H - 70, W * 0.48, 70, 0, 0, Math.PI * 2); g.fill();
  const playing = S.playing && S.mode !== 'none';
  PLAYERS.forEach((p, i) => {
    const cx = (i + 0.5) * W / PLAYERS.length, base = H - 120;
    const since = (now - S.hits[i]) / 1000, kick = playing ? Math.max(0, 1 - since * 4) : 0;
    const focused = S.focus === i, r = focused ? 50 : 40, y = base - kick * 18;
    if (focused) { // 스포트라이트
      if (typeof g.createRadialGradient === 'function') {
        const sp = g.createRadialGradient(cx, y, 10, cx, y, 170);
        sp.addColorStop(0, p.color + '55'); sp.addColorStop(1, p.color + '00');
        g.fillStyle = sp;
      } else g.fillStyle = p.color + '22';
      g.beginPath(); g.arc(cx, y, 170, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = playing ? 1 : 0.55;
    g.fillStyle = p.color; g.beginPath(); g.arc(cx, y, r + kick * 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0a0b0f'; // 눈
    const blink = playing ? 4 : 1.5;
    g.beginPath(); g.ellipse(cx - r * 0.3, y - r * 0.15, 4, blink, 0, 0, Math.PI * 2); g.ellipse(cx + r * 0.3, y - r * 0.15, 4, blink, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#0a0b0f'; g.lineWidth = 3; g.beginPath(); // 입
    if (playing) g.arc(cx, y + r * 0.2, r * 0.28 * (0.6 + kick * 0.6), 0.15 * Math.PI, 0.85 * Math.PI); else { g.moveTo(cx - 8, y + r * 0.3); g.lineTo(cx + 8, y + r * 0.3); }
    g.stroke();
    g.globalAlpha = 1;
    g.font = '22px sans-serif'; g.textAlign = 'center'; g.fillText(p.emoji, cx, y - r - 10);
    g.font = (focused ? 'bold ' : '') + '16px sans-serif'; g.fillStyle = '#e8eaf0'; g.fillText(p.name, cx, base + 72);
    g.font = '13px sans-serif'; g.fillStyle = '#9ba3b4'; g.fillText(p.part, cx, base + 92);
    if (!playing && S.mode !== 'none') { g.fillStyle = '#9ba3b4'; g.font = '16px sans-serif'; g.fillText('z', cx + r, y - r + 6 - (now / 300 + i) % 10); }
  });
  // 지휘봉 위치
  if (S.hand) {
    const hx = S.hand.x * W, hy = S.hand.y * H;
    g.strokeStyle = playing ? '#e8eaf0' : '#ef4444'; g.lineWidth = 3;
    g.beginPath(); g.arc(hx, hy, 18, 0, Math.PI * 2); g.stroke();
    g.font = '24px sans-serif'; g.textAlign = 'center'; g.fillText(playing ? '✋' : '✊', hx, hy + 8);
  }
  if (S.mode === 'none') {
    g.fillStyle = 'rgba(10,11,15,.6)'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#e8eaf0'; g.font = '22px sans-serif'; g.textAlign = 'center';
    g.fillText('카메라 또는 데모 모드로 지휘를 시작하세요', W / 2, H / 2);
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// ---------- 데모 모드 ----------
function startDemo(note) {
  stopCamera();
  $('startCam').disabled = false;
  S.mode = 'demo'; ensureAudio(); setPlaying(true);
  $('fist').disabled = false; $('palm').disabled = true;
  status(note || '데모 모드: 무대 위에서 마우스·손가락을 움직여 지휘하세요.');
  publish();
}
function pointerConduct(e) {
  if (S.mode !== 'demo') return;
  const r = stage.getBoundingClientRect();
  conduct((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
}
stage.addEventListener('pointermove', pointerConduct);
stage.addEventListener('pointerdown', pointerConduct);
stage.addEventListener('pointerleave', () => { if (S.mode === 'demo') releaseHand(); });
$('startDemo').addEventListener('click', () => startDemo());
$('fist').addEventListener('click', () => setPlaying(false));
$('palm').addEventListener('click', () => setPlaying(true));

// ---------- 카메라 모드 ----------
function stopCamera() {
  if (S.stream) { S.stream.getTracks().forEach(t => t.stop()); S.stream = null; }
  video.style.display = 'none';
}
function cameraFail(msg) {
  stopCamera();
  $('startCam').disabled = false;
  startDemo(msg + ' 데모 모드로 전환했습니다 — 마우스·손가락으로 지휘하세요.');
}
async function startCamera() {
  ensureAudio();
  $('startCam').disabled = true;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return cameraFail('이 브라우저(또는 http 주소)에서는 카메라를 쓸 수 없습니다.');
  status('카메라 권한을 요청하는 중…');
  try {
    S.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
  } catch (e) {
    const n = e && e.name;
    return cameraFail(n === 'NotAllowedError' || n === 'SecurityError' ? '카메라 권한이 거부되었습니다.'
      : n === 'NotFoundError' || n === 'OverconstrainedError' || n === 'NotReadableError' ? '사용할 수 있는 카메라를 찾지 못했습니다.'
      : '카메라를 켜지 못했습니다.');
  }
  video.srcObject = S.stream; video.style.display = 'block';
  try { await video.play(); } catch { /* 자동 재생 제한 시에도 프레임은 들어온다 */ }
  status('손 인식 모델을 내려받는 중… (처음 한 번 약 8MB)');
  if (!S.landmarker) {
    try {
      const { FilesetResolver, HandLandmarker } = await import(`${MP_URL}/vision_bundle.mjs`);
      const fileset = await FilesetResolver.forVisionTasks(`${MP_URL}/wasm`);
      const opts = d => ({ baseOptions: { modelAssetPath: MODEL_URL, delegate: d }, runningMode: 'VIDEO', numHands: 1 });
      try { S.landmarker = await HandLandmarker.createFromOptions(fileset, opts('GPU')); }
      catch { S.landmarker = await HandLandmarker.createFromOptions(fileset, opts('CPU')); }
    } catch {
      return cameraFail('손 인식 모델을 불러오지 못했습니다 (네트워크 확인).');
    }
  }
  if (!S.stream) return; // 기다리는 사이 데모로 바뀜
  S.mode = 'camera'; S.gestureVotes = []; setPlaying(true);
  $('fist').disabled = false; $('palm').disabled = true;
  status('카메라 지휘 중: 손을 올리면 빨라지고, 좌우로 솔로를 고르고, 주먹을 쥐면 멈춥니다.');
  requestAnimationFrame(detectLoop);
}
$('startCam').addEventListener('click', startCamera);

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function classify(lm) { // 손가락이 몇 개 펴졌나 → 주먹/손바닥
  const w = lm[0];
  let open = 0;
  for (const [tip, pip] of [[8, 6], [12, 10], [16, 14], [20, 18]]) if (dist(lm[tip], w) > dist(lm[pip], w) * 1.15) open++;
  return open <= 1 ? 'fist' : open >= 3 ? 'palm' : null;
}
let lastVideoTime = -1;
function detectLoop() {
  if (S.mode !== 'camera' || !S.landmarker) return;
  if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    let res = null;
    try { res = S.landmarker.detectForVideo(video, performance.now()); } catch { res = null; }
    const lm = res && res.landmarks && res.landmarks[0];
    if (lm) {
      const pts = [0, 5, 9, 13, 17].map(i => lm[i]);
      const cx = pts.reduce((s, p) => s + p.x, 0) / 5, cy = pts.reduce((s, p) => s + p.y, 0) / 5;
      conduct(1 - cx, cy); // 거울처럼 보이도록 좌우 반전
      const gst = classify(lm);
      S.gestureVotes.push(gst); if (S.gestureVotes.length > 5) S.gestureVotes.shift();
      if (S.gestureVotes.length === 5 && S.gestureVotes.every(v => v === gst) && gst) setPlaying(gst === 'palm');
      if ($('camStatus').textContent.startsWith('손이 화면')) status('카메라 지휘 중: 손을 올리면 빨라지고, 좌우로 솔로를 고르고, 주먹을 쥐면 멈춥니다.');
    }
  }
  requestAnimationFrame(detectLoop);
}

publish();
