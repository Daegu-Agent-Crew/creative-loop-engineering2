// daeguru/data.json 아레나 순위 자동 갱신 — matches/index.json에서 재계산 (2026-W46 자율 개선)
// 로컬·GitHub Actions 양쪽에서 동작: 리포 루트를 스크립트 위치로부터 해결.
// standings가 바뀔 때만 updated(KST)와 함께 기록한다(멱등: 변화 없으면 파일 무변경).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../', import.meta.url));
const dataPath = repo + 'daeguru/data.json';
const data = JSON.parse(readFileSync(dataPath, 'utf8'));
const idx = JSON.parse(readFileSync(repo + 'hackathon/09-agent-arena/matches/index.json', 'utf8'));

const s = {};
for (const m of idx) for (const [a, v] of Object.entries(m.scores)) {
  s[a] = s[a] || { sum: 0, n: 0, w: 0 };
  s[a].sum += v; s[a].n++; if (m.ranking[0] === a) s[a].w++;
}
const standings = Object.entries(s)
  .sort((x, y) => y[1].sum - x[1].sum)
  .map(([agent, v]) => ({ agent, sum: +v.sum.toFixed(3), avg: +(v.sum / v.n).toFixed(3), wins: v.w, n: v.n }));

if (JSON.stringify(standings) === JSON.stringify(data.arena.standings)) {
  console.log('변경 없음 — standings 최신 (1위 ' + standings[0].agent + ')');
  process.exit(0);
}
data.arena.standings = standings;
const kst = new Date(Date.now() + 9 * 3600e3);
const pad = (n) => String(n).padStart(2, '0');
data.updated = kst.getUTCFullYear() + '-' + pad(kst.getUTCMonth() + 1) + '-' + pad(kst.getUTCDate())
  + 'T' + pad(kst.getUTCHours()) + ':' + pad(kst.getUTCMinutes()) + ':00+09:00';
writeFileSync(dataPath, JSON.stringify(data, null, 1) + '\n');
console.log('갱신: 1위 ' + standings[0].agent + ' · ' + standings.length + '에이전트 · ' + standings[0].n + '경기 기준');
