// 2026-W46 게이트 기계 판정: G3(정합성) G4(범위 안전) G5(배선) — G1/G2/G6는 별도 실행·기록
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const repo = fileURLToPath(new URL('../', import.meta.url));
const fails = [];

// G3-1: 기존 check.mjs가 통과해야 한다
try {
  const out = execFileSync('node', [repo + 'daeguru/check.mjs'], { encoding: 'utf8' });
  console.log('G3-1 check.mjs PASS:', out.trim());
} catch (e) { fails.push('G3-1 check.mjs FAIL: ' + String(e.stdout || e.message).trim()); }

// G3-2: data.json standings가 matches/index.json 독립 재계산과 완전 일치
const data = JSON.parse(readFileSync(repo + 'daeguru/data.json', 'utf8'));
const idx = JSON.parse(readFileSync(repo + 'hackathon/09-agent-arena/matches/index.json', 'utf8'));
const agg = {};
for (const m of idx) for (const [a, v] of Object.entries(m.scores)) {
  agg[a] = agg[a] || { sum: 0, n: 0, w: 0 };
  agg[a].sum += v; agg[a].n++; if (m.ranking[0] === a) agg[a].w++;
}
const expect = Object.entries(agg).sort((x, y) => y[1].sum - x[1].sum)
  .map(([agent, v]) => ({ agent, sum: +v.sum.toFixed(3), avg: +(v.sum / v.n).toFixed(3), wins: v.w, n: v.n }));
if (JSON.stringify(expect) !== JSON.stringify(data.arena.standings)) {
  fails.push('G3-2 standings 불일치: 기대 1위 ' + expect[0].agent + ' vs data ' + data.arena.standings[0].agent);
} else {
  console.log('G3-2 standings 일치: 1위 ' + expect[0].agent + ' · ' + expect.length + '에이전트 · 최다 ' + Math.max(...expect.map(e => e.n)) + '경기');
}

// G4: arena와 updated 외 모든 최상위 필드가 git HEAD 판본과 deep-equal
const head = JSON.parse(execFileSync('git', ['-C', repo, 'show', 'HEAD:daeguru/data.json'], { encoding: 'utf8' }));
const strip = (o) => { const c = JSON.parse(JSON.stringify(o)); delete c.arena; delete c.updated; return c; };
if (JSON.stringify(strip(head)) !== JSON.stringify(strip(data))) fails.push('G4 arena/updated 외 필드 변경 감지');
else console.log('G4 범위 안전: promises/lessons/selfcheck/techlog 등 무변경');

// G5: 워크플로 배선 4요소
const wf = readFileSync(repo + '.github/workflows/daeguru-cockpit.yml', 'utf8');
const markers = ['hackathon/09-agent-arena/matches/**', 'contents: write', 'node daeguru/update-arena.mjs', 'git push'];
const miss = markers.filter((m) => !wf.includes(m));
if (miss.length) fails.push('G5 워크플로 마커 누락: ' + miss.join(', '));
else console.log('G5 배선 4/4: 경로트리거·쓰기권한·재계산·커밋푸시');

if (fails.length) { console.error('FAIL'); for (const f of fails) console.error(' - ' + f); process.exit(1); }
console.log('PASS G3/G4/G5');
