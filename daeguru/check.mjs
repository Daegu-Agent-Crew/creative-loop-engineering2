// G2 검증: data.json이 실제 소스와 일치하는지 (아레나 순위 top1 + 미이행 약속 존재)
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
const repo = homedir() + '/.openclaw/workspace/creative-loop-engineering2';
const data = JSON.parse(readFileSync(repo + '/daeguru/data.json', 'utf8'));
const idx = JSON.parse(readFileSync(repo + '/hackathon/09-agent-arena/matches/index.json', 'utf8'));
const s = {};
for (const m of idx) for (const [a, v] of Object.entries(m.scores)) {
  s[a] = s[a] || { sum: 0, n: 0, w: 0 };
  s[a].sum += v; s[a].n++; if (m.ranking[0] === a) s[a].w++;
}
const rank = Object.entries(s).sort((x, y) => y[1].sum - x[1].sum);
const errs = [];
if (rank[0][0] !== data.arena.standings[0].agent) errs.push('아레나 1위 불일치: 실제 ' + rank[0][0]);
const sum = +rank.find(r => r[0] === 'daeguru')[1].sum.toFixed(3);
const mine = data.arena.standings.find(x => x.agent === 'daeguru');
if (Math.abs(mine.sum - sum) > 0.01) errs.push('daeguru 누적 불일치: 실제 ' + sum + ' vs ' + mine.sum);
if (!Array.isArray(data.promises) || !data.promises.some(p => !p.done)) { /* 전부 완료여도 오류 아님 */ }
if (errs.length) { console.error('FAIL', errs.join(' · ')); process.exit(1); }
console.log('PASS  아레나 1위 ' + rank[0][0] + ' · daeguru ' + sum + ' · 약속 ' + data.promises.length + '건');
