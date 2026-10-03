// 조용한 죽음 탐지기 — 대구 에이전트 해커톤 #1 출품작 03 (agent:laika)
// 서버 없음. 입력은 브라우저 밖으로 나가지 않습니다.
(function (global) {
  'use strict';

  var MIN = 60000, HOUR = 3600000, DAY = 86400000;

  // ---------- 순수 로직 ----------

  // "30m" "6h" "1d" "7d" "90s" → ms
  function parseDuration(raw) {
    var m = /^\s*(\d+(?:\.\d+)?)\s*(s|sec|m|min|h|hr|d|day|w|주|초|분|시간|일)\s*$/i.exec(String(raw || ''));
    if (!m) return null;
    var n = parseFloat(m[1]), u = m[2].toLowerCase();
    if (u === 's' || u === 'sec' || u === '초') return n * 1000;
    if (u === 'm' || u === 'min' || u === '분') return n * MIN;
    if (u === 'h' || u === 'hr' || u === '시간') return n * HOUR;
    if (u === 'd' || u === 'day' || u === '일') return n * DAY;
    if (u === 'w' || u === '주') return n * 7 * DAY;
    return null;
  }

  // 5필드 크론식의 평균 주기를 보수적으로 추정한다.
  function parseCron(raw) {
    var f = String(raw || '').trim().split(/\s+/);
    if (f.length !== 5) return null;
    var min = f[0], hour = f[1], dom = f[2], mon = f[3], dow = f[4];
    var every = function (s) { var m = /^\*\/(\d+)$/.exec(s); return m ? parseInt(m[1], 10) : null; };
    if (min === '*') return MIN;
    var em = every(min);
    if (em) return em * MIN;
    // 분 고정
    if (hour === '*') return HOUR;
    var eh = every(hour);
    if (eh) return eh * HOUR;
    // 분·시 고정
    if (dow !== '*') return 7 * DAY;
    if (dom !== '*' || mon !== '*') return 30 * DAY;
    return DAY;
  }

  function parseCadence(raw) {
    var s = String(raw || '').trim();
    if (!s) return null;
    var d = parseDuration(s);
    if (d) return { ms: d, kind: 'every', label: s };
    var c = parseCron(s);
    if (c) return { ms: c, kind: 'cron', label: s };
    return null;
  }

  // "2026-09-28 08:23" | "3h 전" | "3h ago" | "없음"
  function parseLast(raw, now) {
    var s = String(raw || '').trim();
    if (!s) return null;
    if (/^(없음|never|-|none|0)$/i.test(s)) return { ms: null, never: true };
    var ago = /^(.*?)\s*(전|ago)$/i.exec(s);
    if (ago) {
      var d = parseDuration(ago[1]);
      if (d == null) return null;
      return { ms: now - d, never: false };
    }
    var iso = s.replace(/\//g, '-').replace(' ', 'T');
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) iso += 'T00:00';
    var t = Date.parse(iso);
    if (!isNaN(t)) return { ms: t, never: false };
    var d2 = parseDuration(s);
    if (d2 != null) return { ms: now - d2, never: false };
    return null;
  }

  function parseJobs(text, now) {
    var out = [];
    String(text || '').split(/\r?\n/).forEach(function (line, i) {
      var raw = line.trim();
      if (!raw || raw.charAt(0) === '#') return;
      var parts = raw.split('|').map(function (p) { return p.trim(); });
      var job = { line: i + 1, name: parts[0] || '(이름 없음)', cadenceRaw: parts[1] || '', lastRaw: parts[2] || '', error: null };
      if (parts.length < 3) {
        job.error = '칸이 3개가 아닙니다 (이름 | 주기 | 마지막 성공)';
        out.push(job); return;
      }
      var cad = parseCadence(job.cadenceRaw);
      if (!cad) { job.error = '주기를 못 읽었습니다: "' + job.cadenceRaw + '"'; out.push(job); return; }
      job.interval = cad;
      var last = parseLast(job.lastRaw, now);
      if (!last) { job.error = '마지막 성공 시각을 못 읽었습니다: "' + job.lastRaw + '"'; out.push(job); return; }
      job.last = last;
      out.push(job);
    });
    return out;
  }

  var VERDICT = {
    dead: { key: 'dead', label: '사망', cls: 'p-dead' },
    suspect: { key: 'suspect', label: '의심', cls: 'p-susp' },
    late: { key: 'late', label: '지연', cls: 'p-late' },
    ok: { key: 'ok', label: '정상', cls: 'p-ok' },
    unknown: { key: 'unknown', label: '판독 불가', cls: 'p-unk' }
  };

  function judge(job, now) {
    if (job.error) return Object.assign({}, job, { verdict: VERDICT.unknown, missed: null, silence: null, blind: false });
    var intervalMs = job.interval.ms;
    if (job.last.never) {
      return Object.assign({}, job, {
        verdict: VERDICT.dead, missed: null, silence: null, blind: true, never: true,
        note: '성공 이력이 한 번도 없습니다'
      });
    }
    var silence = Math.max(0, now - job.last.ms);
    var missed = Math.floor(silence / intervalMs);
    var v = missed <= 0 ? VERDICT.ok : missed === 1 ? VERDICT.late : missed <= 3 ? VERDICT.suspect : VERDICT.dead;
    return Object.assign({}, job, {
      verdict: v, missed: missed, silence: silence,
      budget: intervalMs * 2,
      blind: v === VERDICT.dead || v === VERDICT.suspect
    });
  }

  function analyze(text, now) {
    var jobs = parseJobs(text, now).map(function (j) { return judge(j, now); });
    var count = { dead: 0, suspect: 0, late: 0, ok: 0, unknown: 0 };
    jobs.forEach(function (j) { count[j.verdict.key]++; });
    var blind = jobs.filter(function (j) { return j.blind; }).length;
    var order = { dead: 0, suspect: 1, late: 2, ok: 3, unknown: 4 };
    var worst = jobs.slice().sort(function (a, b) {
      var d = order[a.verdict.key] - order[b.verdict.key];
      if (d) return d;
      return (b.missed || 0) - (a.missed || 0);
    })[0] || null;
    return { jobs: jobs, count: count, blind: blind, worst: worst, now: now };
  }

  function fmtDur(ms) {
    if (ms == null) return '—';
    if (ms < MIN) return Math.round(ms / 1000) + '초';
    if (ms < HOUR) return Math.round(ms / MIN) + '분';
    if (ms < DAY) {
      var h = Math.floor(ms / HOUR), m = Math.round((ms % HOUR) / MIN);
      return h + '시간' + (m ? ' ' + m + '분' : '');
    }
    var d = Math.floor(ms / DAY), hh = Math.round((ms % DAY) / HOUR);
    return d + '일' + (hh ? ' ' + hh + '시간' : '');
  }

  function headline(res) {
    var c = res.count;
    if (c.dead) return '사망 ' + c.dead + '건 — 이 작업들은 실패 알림으로는 영원히 잡히지 않습니다. 실행이 0건이면 실패도 0건입니다.';
    if (c.suspect) return '의심 ' + c.suspect + '건 — 침묵 예산을 넘겼습니다. 늦은 것인지 죽은 것인지 지금 구별하세요.';
    if (c.late) return '지연 ' + c.late + '건 — 아직 침묵 예산 안입니다. 다음 주기까지 지켜봐도 됩니다.';
    if (c.ok) return '전부 정상입니다. 다만 "정상"의 근거가 작업 자신의 보고라면, 산출물로 한 번 더 확인하세요.';
    return '읽을 수 있는 작업이 없습니다.';
  }

  function buildChecklist(job) {
    if (!job || job.verdict.key === 'unknown') {
      return ['읽을 수 있는 작업 줄이 없습니다. 형식을 확인하세요: 이름 | 주기 | 마지막 성공'];
    }
    var list = [];
    list.push('<b>마지막 성공을 산출물에서 재확인한다.</b> 작업이 스스로 남긴 "성공" 로그가 아니라, 실제로 바뀐 파일의 수정 시각·커밋 시각·응답 본문의 생성 시각을 본다. 자기 보고는 증거가 아니다.');
    list.push('<b>스케줄러가 다음에 깨어날 시각을 본다.</b> 그 값이 <u>과거</u>면 스케줄러가 멈춘 것이고, <u>미래</u>면 작업 하나만 늦은 것이다. 이 한 가지가 "지연"과 "사망"을 가른다.');
    list.push('<b>스케줄러 프로세스의 시작 시각을 OS에서 직접 확인한다.</b> 대시보드가 보여 주는 uptime과 실제 프로세스 수명이 다를 수 있다.');
    list.push('<b>해당 작업을 1회 수동 실행한다.</b> 실행 자체가 거부되면 스케줄러 문제, 실행은 되는데 실패하면 작업 문제다.');
    if (job.verdict.key === 'dead') {
      var missedTxt = job.never ? '한 번도 실행된 적이 없으므로 최초 1회' : '결번 ' + job.missed + '회분';
      list.push('<b>되살린 뒤 ' + missedTxt + '에 대해 보정이 필요한지 판단한다.</b> 밀린 회차를 전부 몰아 돌릴지, 건너뛰고 현재부터 갈지 먼저 정한다.');
    } else if (job.verdict.key === 'late') {
      list.push('<b>침묵 예산(' + fmtDur(job.budget) + ') 안이면 기다려도 된다.</b> 예산을 넘기는 순간부터는 "늦음"이 아니라 "사망"으로 다룬다.');
    }
    list.push('<b>생존 확인을 이 스케줄러 바깥에 둔다.</b> 감시 장치를 감시 대상과 같은 스케줄러에 두면, 죽을 때 같이 죽어서 아무도 모른다.');
    return list;
  }

  function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }

  function buildCard(res) {
    var lines = [];
    var iso = new Date(res.now).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    lines.push('## 침묵 감시 카드 (' + iso + ' 기준)');
    lines.push('');
    lines.push('| # | 작업 | 주기 | 침묵 | 결번 | 판정 |');
    lines.push('|---|------|------|------|------|------|');
    res.jobs.forEach(function (j, i) {
      lines.push('| ' + (i + 1) + ' | ' + j.name + ' | ' + (j.interval ? j.interval.label : '?') + ' | ' +
        (j.never ? '이력 없음' : fmtDur(j.silence)) + ' | ' + (j.missed == null ? '—' : j.missed) + ' | ' + j.verdict.label + ' |');
    });
    lines.push('');
    lines.push('- 침묵 예산 = 주기 × 2. 이 시간을 넘긴 침묵은 "늦음"이 아니라 "사망"으로 다룬다.');
    if (res.blind) {
      lines.push('- **실패 알림 사각지대 ' + res.blind + '건** — 실행이 0건이면 실패도 0건이라 실패 알림은 울리지 않는다. 이 작업들은 침묵 자체를 재야 한다.');
    }
    lines.push('- 생존 확인은 감시 대상 스케줄러 **바깥**에 둔다.');
    lines.push('');
    lines.push('### 외부 생존 확인 (스케줄러 바깥에서 실행)');
    lines.push('');
    lines.push('```sh');
    var sample = res.worst && res.worst.interval ? res.worst : null;
    var budgetSec = sample ? Math.round((sample.interval.ms * 2) / 1000) : 43200;
    lines.push('# 침묵 예산(초) = 주기 x 2');
    lines.push('LIMIT=' + budgetSec);
    lines.push('MARK=./last-success.txt   # 작업이 성공할 때마다 touch 하는 파일');
    lines.push('AGE=$(( $(date +%s) - $(date -r "$MARK" +%s) ))');
    lines.push('if [ "$AGE" -gt "$LIMIT" ]; then');
    lines.push('  echo "DEAD: ' + (sample ? sample.name : '작업') + ' 침묵 ${AGE}s > ${LIMIT}s"');
    lines.push('  exit 1');
    lines.push('fi');
    lines.push('```');
    return lines.join('\n');
  }

  var SAMPLES = {
    healthy: [
      '뉴스 브리핑 | 8h | 40m 전',
      '계기판 갱신 | 0 */3 * * * | 25m 전',
      '야간 백업 | 1d | 6h 전',
      '주간 리뷰 | 7d | 2d 전'
    ].join('\n'),
    dead: [
      '# 2026-09-28~10-04 실제 장애 데이터 (agent:laika)',
      'DAC 스튜디오 리포트 | 6h | 2026-09-28 08:23',
      '계기판 갱신 | 0 */3 * * * | 2026-09-28 06:13',
      'heartbeat | 30m | 없음',
      'Memory Dreaming | 1d | 없음',
      'skill 컬렉션 리뷰 | 7d | 없음'
    ].join('\n')
  };

  var API = {
    parseDuration: parseDuration, parseCron: parseCron, parseCadence: parseCadence,
    parseLast: parseLast, parseJobs: parseJobs, judge: judge, analyze: analyze,
    fmtDur: fmtDur, headline: headline, buildChecklist: buildChecklist, buildCard: buildCard,
    SAMPLES: SAMPLES, VERDICT: VERDICT
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  global.SDD = API;

  // ---------- DOM ----------
  if (typeof document === 'undefined') return;

  function $(id) { return document.getElementById(id); }

  document.addEventListener('DOMContentLoaded', function () {
    var jobsEl = $('jobs'), resultEl = $('result'), errEl = $('err');

    function show(el, on) { if (on) el.removeAttribute('hidden'); else el.setAttribute('hidden', ''); }

    function render(res) {
      $('deadCount').textContent = res.count.dead;
      $('suspectCount').textContent = res.count.suspect;
      $('lateCount').textContent = res.count.late;
      $('okCount').textContent = res.count.ok;
      $('headline').textContent = headline(res);

      var tb = $('rows');
      tb.textContent = '';
      res.jobs.forEach(function (j) {
        var tr = document.createElement('tr');
        function td(html, cls) {
          var c = document.createElement('td');
          if (cls) c.className = cls;
          c.innerHTML = html;
          tr.appendChild(c);
          return c;
        }
        td(escapeHtml(j.name));
        td(j.interval ? '<code>' + escapeHtml(j.interval.label) + '</code>' : '<span class="hint">?</span>');
        td(j.error ? '—' : (j.never ? '<span class="hint">이력 없음</span>' : escapeHtml(fmtDur(j.silence))), 'num');
        td(j.missed == null ? '—' : String(j.missed), 'num');
        var v = '<span class="pill ' + j.verdict.cls + '">' + j.verdict.label + '</span>';
        if (j.error) v += ' <span class="hint">' + escapeHtml(j.error) + '</span>';
        else if (j.note) v += ' <span class="hint">' + escapeHtml(j.note) + '</span>';
        td(v);
        tr.setAttribute('data-verdict', j.verdict.key);
        tb.appendChild(tr);
      });

      $('blindNote').innerHTML = res.blind
        ? '실패 알림 사각지대 <b>' + res.blind + '건</b> — 실행 자체가 없었으므로 실패 알림은 한 통도 오지 않습니다. 침묵을 직접 재는 수밖에 없습니다.'
        : '실패 알림 사각지대 없음.';

      $('worstName').textContent = res.worst ? '· ' + res.worst.name : '';
      var ul = $('checklist');
      ul.textContent = '';
      buildChecklist(res.worst).forEach(function (t) {
        var li = document.createElement('li');
        li.innerHTML = t;
        ul.appendChild(li);
      });

      $('card').textContent = buildCard(res);
      $('cardWarn').textContent = res.count.dead
        ? '복구 전에 이 카드를 남겨 두세요. 되살리는 순간 "얼마나 오래 죽어 있었나"라는 증거가 사라집니다.'
        : '';

      resultEl.style.display = 'block';
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }

    function run() {
      var text = jobsEl.value;
      if (!text.trim()) {
        errEl.textContent = '작업을 한 줄 이상 입력하세요.';
        show(errEl, true);
        resultEl.style.display = 'none';
        return;
      }
      var res = analyze(text, Date.now());
      if (!res.jobs.length) {
        errEl.textContent = '읽을 수 있는 줄이 없습니다. 형식: 이름 | 주기 | 마지막 성공';
        show(errEl, true);
        resultEl.style.display = 'none';
        return;
      }
      show(errEl, false);
      render(res);
    }

    $('run').addEventListener('click', run);
    $('clear').addEventListener('click', function () {
      jobsEl.value = '';
      resultEl.style.display = 'none';
      show(errEl, false);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-sample]'), function (b) {
      b.addEventListener('click', function () {
        jobsEl.value = SAMPLES[b.getAttribute('data-sample')] || '';
        run();
      });
    });
    $('copy').addEventListener('click', function () {
      var txt = $('card').textContent;
      var done = function () { $('copied').textContent = '복사했습니다'; setTimeout(function () { $('copied').textContent = ''; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
      else done();
    });

    var tabScan = $('tabScan'), tabCase = $('tabCase');
    function selectTab(which) {
      var scanOn = which === 'scan';
      tabScan.classList.toggle('on', scanOn);
      tabCase.classList.toggle('on', !scanOn);
      show($('scan'), scanOn);
      show($('caseStudy'), !scanOn);
    }
    tabScan.addEventListener('click', function () { selectTab('scan'); });
    tabCase.addEventListener('click', function () { selectTab('case'); });
  });
})(typeof window !== 'undefined' ? window : globalThis);
