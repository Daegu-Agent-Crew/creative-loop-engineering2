// G2 검증 — 플래너 출력을 숫자로 검사 (L1: 오디오·브라우저 불필요, node만으로 실행)
// 실행: node test/planner.test.mjs  →  통과 시 마지막 줄 "planner: all 8 checks OK", exit 0
import { planScenario, TYPES, DURATION } from '../sonify.mjs';

let failed = 0;
function check(n, name, ok) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}. ${name}`); if (!ok) failed++; }

const byType = (plan, id, from = 0, to = DURATION) => plan.notes.filter(x => x.type === id && x.t >= from && x.t < to);
const meanGap = ts => ts.length < 2 ? Infinity : (ts[ts.length - 1] - ts[ts.length - 0 - 1]) / (ts.length - 1);

const normal = planScenario('normal');
const delayed = planScenario('delayed');
const silent = planScenario('silent');

const periodOf = id => TYPES.find(t => t.id === id).period;

// 1) 정상: 가장 바쁜 스트림(수집) 밀도 — 32s / 2.0s 주기면 최소 15음
check(1, 'normal collect >= 15 notes', byType(normal, 'collect').length >= 15);

// 2) 정상: 모든 스트림 평균 간격이 주기 ±35% 안 (jitter ±5%의 여유 한계)
check(2, 'normal all-stream gaps ~ period', TYPES.every(t => {
  const g = meanGap(byType(normal, t.id).map(n => n.t));
  return Math.abs(g - t.period) <= t.period * 0.35;
}));

// 3) 지연: 검증 스트림 평균 간격 ≥ 기본 주기의 2.0배 (설계값 2.4배)
check(3, 'delayed verify gap >= 2.0x period', meanGap(byType(delayed, 'verify').map(n => n.t)) >= periodOf('verify') * 2.0);

// 4) 지연: 대조군 수집은 주기 ±35% 유지 — 지연이 전체로 번지지 않았다
check(4, 'delayed collect unaffected (control)', (() => {
  const g = meanGap(byType(delayed, 'collect').map(n => n.t));
  return Math.abs(g - periodOf('collect')) <= periodOf('collect') * 0.35;
})());

// 5) 침묵: 수집은 12초 전에만 존재 (침묵 이전엔 분명 살아 있었다)
check(5, 'silent collect alive before 12s, none after', byType(silent, 'collect', 0, 12).length >= 4 && byType(silent, 'collect').every(n => n.t < 12));

// 6) 침묵: [12,32) 구간 수집 음표 정확히 0개 — 그래프의 평평한 선
check(6, 'silent collect zero notes in [12,32)', byType(silent, 'collect', 12, DURATION).length === 0);

// 7) 침묵: 같은 구간 대조군 요약은 생존(≥4) — 0개가 전역 침묵이 아니다
check(7, 'silent summarize alive in [12,32) (control)', byType(silent, 'summarize', 12, DURATION).length >= 4);

// 8) 결정론성 + 정렬 + 범위 — 같은 시나리오는 언제나 같은 계획
const again = planScenario('silent');
check(8, 'deterministic + sorted + in-bounds', JSON.stringify(again) === JSON.stringify(silent)
  && silent.notes.every((n, i) => (i === 0 || n.t >= silent.notes[i - 1].t) && n.t >= 0 && n.t < DURATION));

console.log(`notes: normal=${normal.notes.length} delayed=${delayed.notes.length} silent=${silent.notes.length}`);
if (failed) { console.error(`planner: ${failed} check(s) FAILED`); process.exit(1); }
console.log('planner: all 8 checks OK');
