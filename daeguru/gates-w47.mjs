// 2026-W47 게이트 기계 판정: G2(회귀 시뮬레이션) G3(스텝 순서) G4(기존 기능 무변경) G7(풀 파이프라인 시뮬) — G1/G5/G6는 별도 실행·기록
import { readFileSync, rmSync, mkdirSync, cpSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

const repo = homedir() + '/.openclaw/workspace/creative-loop-engineering2';
const sim = homedir() + '/.cache/daeguru-w47-sim';
const fails = [];
const ok = (m) => console.log(m);

// ── G3: 커밋 스텝 블록에 pull < add < commit < push 순서 성립
const wf = readFileSync(repo + '/.github/workflows/daeguru-cockpit.yml', 'utf8');
function extractStep(text, marker) {
  const lines = text.split('\n');
  const i = lines.findIndex((l) => l.includes(marker));
  if (i < 0) throw new Error('스텝 없음: ' + marker);
  for (let j = i + 1; j < lines.length; j++) {
    const m = lines[j].match(/^(\s*)run: \|$/);
    if (m) {
      const indent = m[1] + '  ';
      const body = [];
      for (let k = j + 1; k < lines.length; k++) {
        if (lines[k].startsWith(indent)) body.push(lines[k].slice(indent.length));
        else if (lines[k].trim() === '') body.push('');
        else break;
      }
      return body.join('\n');
    }
  }
  throw new Error('run 블록 없음: ' + marker);
}
try {
  const step = extractStep(wf, '변경 있을 때만 커밋·푸시');
  const idxPull = step.indexOf('git pull');
  const idxAdd = step.indexOf('git add');
  const idxCommit = step.indexOf('git commit');
  const idxPush = step.indexOf('git push');
  if (idxPull < 0 || idxAdd < 0 || idxCommit < 0 || idxPush < 0) throw new Error('명령 누락 pull=' + idxPull + ' add=' + idxAdd + ' commit=' + idxCommit + ' push=' + idxPush);
  if (!(idxPull < idxAdd && idxAdd < idxCommit && idxCommit < idxPush)) throw new Error('순서 위반 pull=' + idxPull + ' add=' + idxAdd + ' commit=' + idxCommit + ' push=' + idxPush);
  ok('G3 PASS 스텝 순서 pull(' + idxPull + ') < add(' + idxAdd + ') < commit(' + idxCommit + ') < push(' + idxPush + ')');
} catch (e) { fails.push('G3 FAIL ' + e.message); }

// ── G4-1: update-arena.mjs가 d2075e4(W46 도입판)와 byte 동일
try {
  const d = execFileSync('git', ['-C', repo, 'diff', 'd2075e4', '--', 'daeguru/update-arena.mjs'], { encoding: 'utf8' });
  if (d.trim() !== '') throw new Error('update-arena.mjs 변경 감지됨');
  ok('G4-1 PASS update-arena.mjs d2075e4와 byte 동일');
} catch (e) { fails.push('G4-1 FAIL ' + e.message); }

// ── G2: 스크래치 리포 시뮬레이션 — 구 스텝 실패 재현 · 신 스텝 커밋·푸시 성공
const seedData = JSON.parse(readFileSync(repo + '/daeguru/data.json', 'utf8'));
const seedIdx = readFileSync(repo + '/hackathon/09-agent-arena/matches/index.json', 'utf8');
function recompute(idxText) {
  const idx = JSON.parse(idxText);
  const s = {};
  for (const m of idx) for (const [a, v] of Object.entries(m.scores)) {
    s[a] = s[a] || { sum: 0, n: 0, w: 0 };
    s[a].sum += v; s[a].n++; if (m.ranking[0] === a) s[a].w++;
  }
  return Object.entries(s).sort((x, y) => y[1].sum - x[1].sum)
    .map(([agent, v]) => ({ agent, sum: +v.sum.toFixed(3), avg: +(v.sum / v.n).toFixed(3), wins: v.w, n: v.n }));
}
try {
  rmSync(sim, { recursive: true, force: true });
  mkdirSync(sim, { recursive: true });
  const bare = join(sim, 'origin.git');
  execFileSync('git', ['init', '--bare', '-b', 'main', bare]);
  const seed = join(sim, 'seed');
  mkdirSync(join(seed, 'daeguru'), { recursive: true });
  mkdirSync(join(seed, 'hackathon/09-agent-arena/matches'), { recursive: true });
  cpSync(repo + '/daeguru/update-arena.mjs', join(seed, 'daeguru/update-arena.mjs'));
  writeFileSync(join(seed, 'daeguru/data.json'), JSON.stringify(seedData, null, 1) + '\n');
  writeFileSync(join(seed, 'hackathon/09-agent-arena/matches/index.json'), seedIdx);
  execFileSync('git', ['init', '-q', '-b', 'main', seed]);
  const g = (cwd, args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });
  g(seed, ['add', '-A']);
  g(seed, ['-c', 'user.name=seed', '-c', 'user.email=seed@x', 'commit', '-q', '-m', 'seed']);
  g(seed, ['push', '-q', bare, 'main:main']);

  const oldStep = extractStep(execFileSync('git', ['-C', repo, 'show', 'd2075e4:.github/workflows/daeguru-cockpit.yml'], { encoding: 'utf8' }), '변경 있을 때만 커밋·푸시');
  const newStep = extractStep(wf, '변경 있을 때만 커밋·푸시');
  const runBash = (cwd, script) => {
    try {
      const out = execFileSync('bash', ['-eo', 'pipefail', '-c', script], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      return { code: 0, out };
    } catch (e) { return { code: e.status ?? 1, out: String(e.stdout || '') + String(e.stderr || '') }; }
  };

  // G2-OLD: d2075e4판 스텝은 'cannot pull with rebase'로 실패 재현
  const c1 = join(sim, 'clone-old');
  execFileSync('git', ['clone', '-q', bare, c1]);
  execFileSync('node', [join(c1, 'daeguru/update-arena.mjs')]);
  const rOld = runBash(c1, oldStep);
  if (rOld.code === 0 || !/cannot pull with rebase/.test(rOld.out)) throw new Error('구 스텝 재현 실패 code=' + rOld.code + ' out=' + rOld.out.slice(-200));
  ok('G2-OLD PASS 구 스텝 재현: exit ' + rOld.code + " · 'cannot pull with rebase' 포함");

  // G2-NEW: 수정 스텝은 커밋 생성·푸시 성공
  const c2 = join(sim, 'clone-new');
  execFileSync('git', ['clone', '-q', bare, c2]);
  const rNew = runBash(c2, newStep);
  if (rNew.code !== 0) throw new Error('신 스텝 실패 code=' + rNew.code + ' out=' + rNew.out.slice(-300));
  const bareLog = g(bare, ['log', '--oneline', 'main']);
  const pushed = bareLog.trim().split('\n').length;
  if (pushed !== 2) throw new Error('bare 커밋 수 기대 2(Seed+갱신) 실제 ' + pushed);
  ok('G2-NEW PASS 신 스텝 exit 0 · 커밋 푸시됨(bare 총 ' + pushed + ' 커밋)');

  // G2-IDEM: 재실행 시 '변경 없음' exit 0 · 커밋 추가 없음
  const rAgain = runBash(c2, newStep);
  if (rAgain.code !== 0 || !/변경 없음/.test(rAgain.out)) throw new Error('멱등 실패 code=' + rAgain.code + ' out=' + rAgain.out.slice(-200));
  const pushed2 = g(bare, ['log', '--oneline', 'main']).trim().split('\n').length;
  if (pushed2 !== 2) throw new Error('멱등 위반: 커밋 추가됨 ' + pushed2);
  ok('G2-IDEM PASS 재실행 exit 0 · 변경 없음 · 커밋 수 불변');

  // G4-2/3: 시뮬 결과 — 비-arena 필드 무변경 · standings 재계산 일치
  const after = JSON.parse(g(bare, ['show', 'main:daeguru/data.json']));
  const strip = (o) => { const c = JSON.parse(JSON.stringify(o)); delete c.arena; delete c.updated; return c; };
  if (JSON.stringify(strip(seedData)) !== JSON.stringify(strip(after))) throw new Error('G4-2 비-arena 필드 변경 감지');
  ok('G4-2 PASS 시뮬 data.json 비-arena 필드 무변경');
  const expect = recompute(seedIdx);
  if (JSON.stringify(expect) !== JSON.stringify(after.arena.standings)) throw new Error('G4-3 standings 불일치: 기대 1위 ' + expect[0].agent + ' vs ' + after.arena.standings[0].agent);
  ok('G4-3 PASS 시뮬 standings 재계산과 일치: 1위 ' + expect[0].agent + '(n=' + expect[0].n + ') · 최다 ' + Math.max(...expect.map((e) => e.n)) + '경기');
  // ── G7: 풀 파이프라인 시뮬레이션 — run 스텝 전체를 순서 실행(스텝1이 트리를 더럽히는 실전 결함 재현)
  const sim2 = homedir() + '/.cache/daeguru-w47-sim2';
  rmSync(sim2, { recursive: true, force: true });
  mkdirSync(sim2, { recursive: true });
  const bare2 = join(sim2, 'origin.git');
  execFileSync('git', ['init', '--bare', '-b', 'main', bare2]);
  const seed2 = join(sim2, 'seed');
  mkdirSync(join(seed2, 'daeguru'), { recursive: true });
  mkdirSync(join(seed2, 'hackathon/09-agent-arena/matches'), { recursive: true });
  cpSync(repo + '/daeguru/update-arena.mjs', join(seed2, 'daeguru/update-arena.mjs'));
  const stale = JSON.parse(JSON.stringify(seedData)); stale.arena.standings = [];
  writeFileSync(join(seed2, 'daeguru/data.json'), JSON.stringify(stale, null, 1) + '\n');
  writeFileSync(join(seed2, 'hackathon/09-agent-arena/matches/index.json'), seedIdx);
  execFileSync('git', ['init', '-q', '-b', 'main', seed2]);
  g(seed2, ['add', '-A']);
  g(seed2, ['-c', 'user.name=seed', '-c', 'user.email=seed@x', 'commit', '-q', '-m', 'seed']);
  g(seed2, ['push', '-q', bare2, 'main:main']);
  function pipeline(yml, cloneDir) {
    execFileSync('git', ['clone', '-q', bare2, cloneDir]);
    const scripts = [];
    const ls = yml.split('\n');
    for (let i = 0; i < ls.length; i++) {
      if (!/^      - name:/.test(ls[i])) continue;
      for (let j = i + 1; j < ls.length; j++) {
        if (/^      - (name|uses):/.test(ls[j])) break;
        if (/^        run: \|$/.test(ls[j])) {
          const body = [];
          for (let k = j + 1; k < ls.length; k++) {
            if (ls[k].startsWith('          ')) body.push(ls[k].slice(10));
            else if (ls[k].trim() === '') body.push('');
            else break;
          }
          scripts.push(body.join('\n')); break;
        }
        const one = ls[j].match(/^        run: (.+)$/);
        if (one) { scripts.push(one[1]); break; }
      }
    }
    if (!scripts.length) throw new Error('run 스텝 0개');
    let last = { code: 0, out: '' };
    for (const s of scripts) { last = runBash(cloneDir, s); if (last.code !== 0) break; }
    return { n: scripts.length, last };
  }
  const ymlW46 = execFileSync('git', ['-C', repo, 'show', 'd2075e4:.github/workflows/daeguru-cockpit.yml'], { encoding: 'utf8' });
  const ymlV1 = execFileSync('git', ['-C', repo, 'show', 'aac4669:.github/workflows/daeguru-cockpit.yml'], { encoding: 'utf8' });
  const p46 = pipeline(ymlW46, join(sim2, 'pipe-w46'));
  if (p46.last.code === 0 || !/cannot pull with rebase/.test(p46.last.out)) throw new Error('G7-W46 재현 실패 code=' + p46.last.code);
  ok("G7-W46 PASS W46판 파이프라인(스텝" + p46.n + ") 실패 재현: 'cannot pull with rebase'");
  const pv1 = pipeline(ymlV1, join(sim2, 'pipe-v1'));
  if (pv1.last.code === 0 || !/cannot pull with rebase/.test(pv1.last.out)) throw new Error('G7-V1 재현 실패 code=' + pv1.last.code);
  ok("G7-V1 PASS v1판(aac4669) 실전 탈출 결함 재현(스텝" + pv1.n + "): 런 43784926638과 동일 실패");
  const pn = pipeline(wf, join(sim2, 'pipe-new'));
  if (pn.last.code !== 0) throw new Error('G7-NEW 실패 code=' + pn.last.code + ' out=' + pn.last.out.slice(-300));
  const bare2Log = g(bare2, ['log', '--oneline', 'main']).trim().split('\n').length;
  if (bare2Log !== 2) throw new Error('G7-NEW 커밋 수 기대 2 실제 ' + bare2Log);
  const after2 = JSON.parse(g(bare2, ['show', 'main:daeguru/data.json']));
  const expect2 = recompute(seedIdx);
  if (JSON.stringify(expect2) !== JSON.stringify(after2.arena.standings)) throw new Error('G7-NEW standings 불일치');
  ok('G7-NEW PASS v2 파이프라인(스텝' + pn.n + ') 전 스텝 exit 0 · 커밋 푸시 · standings 일치(1위 ' + expect2[0].agent + ' n=' + expect2[0].n + ')');
} catch (e) { fails.push('G2/G4/G7 시뮬 FAIL ' + e.message); }

if (fails.length) { console.error('FAIL'); for (const f of fails) console.error(' - ' + f); process.exit(1); }
console.log('PASS G2/G3/G4/G7');
