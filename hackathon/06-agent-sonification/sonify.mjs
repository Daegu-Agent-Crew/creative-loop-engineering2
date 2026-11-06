// 06 에이전트 심음 — 순수 플래너 (오디오·브라우저 의존 없음)
// 시나리오 → 음표 리스트(시각·종류·셈여림). 결정론적(시드 고정) — 같은 시나리오는 항상 같은 소리.
// 설계 근거: RESEARCH.md (parameter mapping — 작업 종류→음색, 이벤트→음표, 지연→주기 확장, 침묵→음표 0개)

export const DURATION = 32; // 초 — 한 라운드 길이
const JITTER = 0.05;        // 각 간격 ±5% (사람이 하는 일이니 약간의 흔들림)

export const TYPES = [
  { id: 'collect',   label: '수집', period: 2.0, wave: 'triangle', freq: 660, filter: 2600, gain: 0.16, decay: 0.10 },
  { id: 'summarize', label: '요약', period: 3.2, wave: 'sine',     freq: 440, filter: 1800, gain: 0.22, decay: 0.22 },
  { id: 'verify',    label: '검증', period: 2.6, wave: 'sawtooth', freq: 550, filter: 1200, gain: 0.10, decay: 0.08 },
  { id: 'publish',   label: '발행', period: 6.4, wave: 'sine',     freq: 165, filter: 700,  gain: 0.30, decay: 0.42 },
  { id: 'report',    label: '보고', period: 4.8, wave: 'square',   freq: 880, filter: 2400, gain: 0.06, decay: 0.05 }
];

const SEEDS = { normal: 1006, delayed: 2006, silent: 3006 };
const DELAYED_TYPE = 'verify';
const DELAY_FACTOR = 2.4;   // 검증 작업이 2.4배 느려짐 — 리듬이 절뚝거림
const SILENT_TYPE = 'collect';
const SILENCE_FROM = 12;    // 12초 이후 수집 스트림 완전 침묵 — 그래프의 평평한 선

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function planScenario(name) {
  if (!(name in SEEDS)) throw new Error('unknown scenario: ' + name);
  const rng = mulberry32(SEEDS[name]);
  const notes = [];
  for (const type of TYPES) {
    const delayed = name === 'delayed' && type.id === DELAYED_TYPE;
    const period = delayed ? type.period * DELAY_FACTOR : type.period;
    let t = period * (0.15 + 0.7 * rng()); // 스트림 시작점 흩어서 올림 — 얼개가 겹치지 않게
    while (t < DURATION) {
      if (!(name === 'silent' && type.id === SILENT_TYPE && t >= SILENCE_FROM)) {
        notes.push({ t: Math.round(t * 1000) / 1000, type: type.id, vel: 0.75 + 0.25 * rng(), lag: delayed });
      }
      t += period * (1 + JITTER * (rng() * 2 - 1));
    }
  }
  notes.sort((a, b) => a.t - b.t);
  return {
    scenario: name,
    duration: DURATION,
    notes,
    meta: {
      delayedType: DELAYED_TYPE, delayFactor: DELAY_FACTOR,
      silentType: SILENT_TYPE, silenceFrom: SILENCE_FROM,
      types: TYPES.map(({ id, label, period }) => ({ id, label, period }))
    }
  };
}
