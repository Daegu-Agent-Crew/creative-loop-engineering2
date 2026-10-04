// 모델 로드·생성은 워커에서 — 화면이 멈추지 않게
import { pipeline, TextStreamer, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0';

env.allowLocalModels = false;
env.useBrowserCache = true; // 한 번 받은 모델은 Cache API에 남아 오프라인에서도 로드
// GitHub Pages는 교차 출처 격리(COOP/COEP)가 없어 어차피 단일 스레드 — 명시해서 보조 워커 생성을 막는다
env.backends.onnx.wasm.numThreads = 1;
// 엔진(.mjs/.wasm)을 blob으로 바꿔 싣지 않고 CDN 주소 그대로 — 오프라인 보관은 sw.js가 맡는다
env.useWasmCache = false;

let gen = null, loadedKey = null;

self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'load') {
      const key = data.model + '|' + data.device + '|' + data.dtype;
      if (gen && loadedKey === key) return post('ready', { cached: true });
      const files = {};
      gen = await pipeline('text-generation', data.model, {
        device: data.device,
        dtype: data.dtype,
        progress_callback: p => {
          if (p.status === 'progress' && p.total) {
            files[p.file] = [p.loaded, p.total];
            let l = 0, t = 0;
            for (const [a, b] of Object.values(files)) { l += a; t += b; }
            post('progress', { loaded: l, total: t, file: p.file });
          }
        }
      });
      loadedKey = key;
      post('ready', { cached: false });
    } else if (data.type === 'generate') {
      if (!gen) throw new Error('모델이 아직 준비되지 않았습니다');
      let tokens = 0, first = 0;
      const t0 = performance.now();
      const streamer = new TextStreamer(gen.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: text => post('token', { text }),
        token_callback_function: () => { tokens++; if (!first) first = performance.now(); }
      });
      const out = await gen(data.messages, { max_new_tokens: data.maxTokens || 192, do_sample: false, repetition_penalty: 1.1, streamer });
      const ms = performance.now() - t0;
      const last = out[0].generated_text.at(-1);
      post('done', {
        text: typeof last === 'string' ? last : last.content,
        tokens, ms,
        tps: tokens && first ? tokens / ((performance.now() - first) / 1000) : 0
      });
    }
  } catch (e) {
    post('error', { message: String(e && e.message || e) });
  }
};

function post(type, payload = {}) { self.postMessage({ type, ...payload }); }
