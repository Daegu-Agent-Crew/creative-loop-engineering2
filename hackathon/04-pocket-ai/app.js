// 폰 안의 AI — 기기 점검 · 모델 설치 · 대화 (모든 추론은 worker.js에서 기기 안에서)
const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const setState = s => { document.documentElement.dataset.state = s; };
setState('boot');

const MODELS = {
  tiny: {
    id: 'HuggingFaceTB/SmolLM2-135M-Instruct', dtype: { webgpu: 'q4f16', webgpuNoF16: 'q4', wasm: 'q8' },
    system: 'You are a tiny AI running entirely inside the user\'s phone, with no server. Answer briefly and kindly.',
    chips: ['Hi! Who are you?', 'Write a haiku about Daegu.', 'Explain WebGPU in one sentence.']
  },
  ko: {
    id: 'onnx-community/Qwen2.5-0.5B-Instruct', dtype: { webgpu: 'q4f16', webgpuNoF16: null, wasm: 'q8' },
    system: '너는 사용자의 휴대폰 안에서 서버 없이 실행되는 작은 AI다. 한국어로 짧고 친절하게 답한다.',
    chips: ['안녕! 너는 어디서 돌아가고 있어?', '대구 여행 코스 3줄로 추천해줘', '비행기 모드인데 대화가 되는 이유가 뭐야?']
  }
};

const dev = { gpu: false, f16: false };

async function checkDevice() {
  // WebGPU
  try {
    const adapter = navigator.gpu && await navigator.gpu.requestAdapter();
    if (adapter) {
      dev.gpu = true;
      dev.f16 = adapter.features.has('shader-f16');
      const info = adapter.info || {};
      $('#c-gpu').innerHTML = '<span class="ok">사용 가능</span>' + (info.vendor ? ' · ' + esc(info.vendor) : '') + (dev.f16 ? '' : ' · f16 미지원');
    } else {
      $('#c-gpu').innerHTML = '<span class="no">없음</span> — CPU로 실행';
    }
  } catch (e) { $('#c-gpu').innerHTML = '<span class="no">확인 실패</span> — CPU로 실행'; }
  // 메모리 (Chrome 계열만 제공, 최대 8로 반올림)
  $('#c-mem').textContent = navigator.deviceMemory ? '약 ' + navigator.deviceMemory + 'GB 이상' : '브라우저가 알려주지 않음';
  // 저장 공간
  try {
    const est = await navigator.storage.estimate();
    const free = (est.quota - est.usage) / 1e9;
    $('#c-disk').innerHTML = (free > 1 ? '<span class="ok">' : '<span class="no">') + free.toFixed(1) + 'GB</span>';
  } catch (e) { $('#c-disk').textContent = '확인 불가'; }
  $('#c-mode').innerHTML = dev.gpu ? '<span class="ok">GPU 가속</span>' : 'CPU (WASM) — 느리지만 동작';
}

function plan(key) {
  const m = MODELS[key];
  const forced = params.get('device');
  if (forced === 'wasm' || !dev.gpu) return { device: 'wasm', dtype: m.dtype.wasm };
  if (dev.f16) return { device: 'webgpu', dtype: m.dtype.webgpu };
  if (m.dtype.webgpuNoF16) return { device: 'webgpu', dtype: m.dtype.webgpuNoF16 };
  return { device: 'wasm', dtype: m.dtype.wasm };
}

// 네트워크 상태 배지 — 오프라인에서도 동작한다는 것을 눈으로 보여주기
function updateNet() {
  const on = navigator.onLine;
  $('#net').className = 'net ' + (on ? 'on' : 'off');
  $('#net').textContent = on ? '온라인' : '✈️ 오프라인 — 그래도 대화됩니다';
}
addEventListener('online', updateNet); addEventListener('offline', updateNet);

const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
let current = null, history = [], bubble = null, busy = false;

worker.onmessage = ({ data }) => {
  if (data.type === 'progress') {
    const pct = Math.min(100, data.loaded / data.total * 100);
    $('#prog>i').style.width = pct.toFixed(1) + '%';
    $('#status').textContent = '내려받는 중 ' + (data.loaded / 1e6).toFixed(0) + ' / ' + (data.total / 1e6).toFixed(0) + 'MB';
  } else if (data.type === 'ready') {
    $('#status').textContent = data.cached ? '이미 설치되어 있습니다.' : '설치 완료 — 이제 이 기기 안에서 실행됩니다.';
    $('#prog>i').style.width = '100%';
    $('#setup').style.display = 'none';
    $('#chat').style.display = 'flex';
    $('#chips').innerHTML = '';
    MODELS[current].chips.forEach(t => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.onclick = () => ask(t); $('#chips').appendChild(b);
    });
    setState('ready');
    if (params.get('q')) ask(params.get('q'));
  } else if (data.type === 'token') {
    if (bubble) { bubble.firstChild.textContent += data.text; scrollDown(); }
  } else if (data.type === 'done') {
    busy = false; $('#send').disabled = false;
    if (bubble) {
      if (!bubble.firstChild.textContent.trim()) bubble.firstChild.textContent = data.text;
      const p = plan(current);
      bubble.insertAdjacentHTML('beforeend', '<span class="meta">' + data.tokens + '토큰 · ' + (data.ms / 1000).toFixed(1) + '초 · 초당 ' + data.tps.toFixed(1) + '토큰 · ' + (p.device === 'webgpu' ? 'GPU' : 'CPU') + ' · ' + (navigator.onLine ? '온라인' : '오프라인') + '</span>');
    }
    history.push({ role: 'assistant', content: data.text });
    window.__pocketResult = { text: data.text, tokens: data.tokens, tps: data.tps };
    setState('done');
  } else if (data.type === 'error') {
    busy = false; $('#send').disabled = false;
    const msg = '문제가 생겼습니다: ' + data.message;
    if (bubble) bubble.firstChild.textContent = msg; else $('#status').textContent = msg;
    $('#load').disabled = false;
    window.__pocketError = data.message;
    setState('error');
  }
};

function load(key) {
  current = key;
  const p = plan(key);
  $('#load').disabled = true;
  $('#prog').style.display = 'block';
  $('#status').textContent = (p.device === 'webgpu' ? 'GPU' : 'CPU') + ' 방식으로 준비 중…';
  setState('loading');
  worker.postMessage({ type: 'load', model: MODELS[key].id, ...p });
}

function ask(text) {
  if (busy || !text.trim()) return;
  busy = true; $('#send').disabled = true;
  add('me', text);
  history.push({ role: 'user', content: text });
  bubble = add('ai', '');
  setState('generating');
  const messages = [{ role: 'system', content: MODELS[current].system }, ...history.slice(-6)];
  worker.postMessage({ type: 'generate', messages, maxTokens: Number(params.get('max')) || 192 });
}

function add(who, text) {
  const d = document.createElement('div');
  d.className = 'msg ' + who;
  d.appendChild(document.createElement('span')).textContent = text;
  $('#log').appendChild(d); scrollDown();
  return d;
}
const scrollDown = () => scrollTo(0, document.body.scrollHeight);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

$('#load').onclick = () => load(document.querySelector('input[name=m]:checked').value);
$('#f').onsubmit = e => { e.preventDefault(); const q = $('#q').value; $('#q').value = ''; ask(q); };

// 앱 껍데기·엔진 파일 캐시 → 비행기 모드에서 새로고침해도 열림
if ('serviceWorker' in navigator && !params.has('nosw')) navigator.serviceWorker.register('sw.js').catch(() => {});

updateNet();
await checkDevice();
setState('idle');
// 검사용 자동 실행: ?auto=tiny&device=wasm&q=...
if (params.get('auto') && MODELS[params.get('auto')]) load(params.get('auto'));
