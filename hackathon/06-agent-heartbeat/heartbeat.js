// 에이전트 심음 — 대구 에이전트 해커톤 #1 2라운드 출품작 06 (agent:laika)
// 작업 실행을 실시간 합성음으로 바꾼다. 음원 파일 없음, 서버 없음.
(function (global) {
  'use strict';

  // ---------- 조직 구성 ----------
  var JOBS = [
    { id: 'report', name: '보고',   freq: 220.0, dur: 0.22, wave: 'triangle', period: 2.0, phase: 0.00 },
    { id: 'dash',   name: '계기판', freq: 330.0, dur: 0.14, wave: 'sine',     period: 1.0, phase: 0.25 },
    { id: 'fetch',  name: '수집',   freq: 440.0, dur: 0.08, wave: 'square',   period: 0.5, phase: 0.00 },
    { id: 'tidy',   name: '정리',   freq: 554.4, dur: 0.30, wave: 'sine',     period: 4.0, phase: 1.50 }
  ];

  var SPAN = 16; // 한 구간 길이(초)

  var SCENARIOS = {
    normal: {
      id: 'normal', name: '정상', emoji: '🟢',
      desc: '네 작업이 각자 제 주기를 지킵니다. 이 리듬이 기준선입니다.',
      tell: '규칙적인 겹박자. 아무것도 변하지 않습니다.'
    },
    drag: {
      id: 'drag', name: '지연', emoji: '🟡',
      desc: '계기판 갱신만 조금씩 느려집니다. 다른 셋은 멀쩡합니다.',
      tell: '중간 음(계기판)의 박자가 뒤로 밀립니다. 처음엔 거의 안 들리다가 점점 어긋납니다.',
      mod: function (jobId, t, p) { return jobId === 'dash' && t >= 4 ? Math.min(4, p * 1.22) : p; }
    },
    storm: {
      id: 'storm', name: '폭주', emoji: '🟠',
      desc: '수집 작업이 재시도 루프에 빠져 미친 듯이 반복됩니다.',
      tell: '높은 음(수집)이 점점 촘촘해지다 드르륵 긁는 소리가 됩니다.',
      mod: function (jobId, t, p) { return jobId === 'fetch' && t >= 5 ? Math.max(0.09, p * 0.52) : p; }
    },
    silence: {
      id: 'silence', name: '침묵', emoji: '🔴',
      desc: '스케줄러가 죽습니다. 모든 작업이 동시에 멈춥니다.',
      tell: '9초쯤 전부 끊깁니다. 경고음이 아니라 그냥 아무 소리도 안 납니다.',
      stopAt: 9
    }
  };

  var ORDER = ['normal', 'drag', 'storm', 'silence'];

  // ---------- 음표 생성 (순수) ----------
  function notesFor(scenarioId, from, to) {
    var sc = SCENARIOS[scenarioId];
    if (!sc) return [];
    if (from == null) from = 0;
    if (to == null) to = SPAN;
    var out = [];
    JOBS.forEach(function (j) {
      var t = j.phase, p = j.period, guard = 0;
      while (t < to && guard++ < 5000) {
        var stopped = sc.stopAt != null && t >= sc.stopAt;
        if (t >= from && !stopped) {
          out.push({ at: Math.round(t * 1e4) / 1e4, job: j.id, freq: j.freq, dur: j.dur, wave: j.wave });
        }
        p = sc.mod ? sc.mod(j.id, t, p) : j.period;
        t += p;
      }
    });
    out.sort(function (a, b) { return a.at - b.at || a.freq - b.freq; });
    return out;
  }

  // 1초 단위 실행 횟수
  function runCountSeries(scenarioId) {
    var notes = notesFor(scenarioId, 0, SPAN), buckets = [];
    for (var i = 0; i < SPAN; i++) buckets.push(0);
    notes.forEach(function (n) {
      var b = Math.floor(n.at);
      if (b >= 0 && b < SPAN) buckets[b]++;
    });
    return buckets;
  }

  // 성공률: 실행된 것은 전부 성공한다. 실행되지 않은 것은 실패로 집계되지 않는다.
  // 그래서 네 시나리오 모두 100%가 나온다 — 이 도구의 결론.
  function successRateSeries(scenarioId) {
    var runs = runCountSeries(scenarioId);
    return runs.map(function (n, i) { return n > 0 ? 100 : (i === 0 ? 100 : null); });
  }

  // null(실행 0건) 구간을 직전 값으로 이어 붙인다 — 대시보드가 보통 그리는 방식
  function dashboardRate(scenarioId) {
    var s = successRateSeries(scenarioId), last = 100;
    return s.map(function (v) { if (v == null) return last; last = v; return v; });
  }

  function polyPoints(series, w, h, max) {
    var n = series.length;
    if (!n) return '';
    var top = max != null ? max : Math.max.apply(null, series.concat([1]));
    return series.map(function (v, i) {
      var x = n === 1 ? 0 : (i * (w - 2)) / (n - 1) + 1;
      var y = h - 2 - ((v / top) * (h - 4));
      return (Math.round(x * 10) / 10) + ',' + (Math.round(y * 10) / 10);
    }).join(' ');
  }

  // ---------- 블라인드 테스트 (순수) ----------
  function makeQuiz(rounds, rnd) {
    rnd = rnd || Math.random;
    var pool = [], out = [];
    for (var i = 0; i < rounds; i++) {
      if (!pool.length) pool = ORDER.slice();
      var k = Math.floor(rnd() * pool.length) % pool.length;
      out.push(pool.splice(k, 1)[0]);
    }
    return out;
  }

  function grade(answers) {
    var hit = answers.filter(function (a) { return a.pick === a.truth; }).length;
    var total = answers.length;
    var missedSilence = answers.some(function (a) { return a.truth === 'silence' && a.pick !== 'silence'; });
    var rank = hit === total ? '🥇 절대음감'
      : hit >= Math.ceil(total * 0.6) ? '🥈 당직 가능'
        : '🥉 아직 눈으로 봅니다';
    return { hit: hit, total: total, rank: rank, missedSilence: missedSilence };
  }

  var API = {
    JOBS: JOBS, SCENARIOS: SCENARIOS, ORDER: ORDER, SPAN: SPAN,
    notesFor: notesFor, runCountSeries: runCountSeries,
    successRateSeries: successRateSeries, dashboardRate: dashboardRate,
    polyPoints: polyPoints, makeQuiz: makeQuiz, grade: grade
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  global.ECG = API;

  if (typeof document === 'undefined') return;

  // ---------- 오디오 ----------
  function Player() {
    this.ctx = null;
    this.timer = null;
    this.startedAt = 0;
    this.cursor = 0;
    this.notes = [];
    this.scenario = null;
    this.scheduled = [];   // 테스트용 — 실제로 예약된 음표
    this.onTick = null;
    this.onEnd = null;
    this.muted = false;
  }
  Player.prototype.ensureCtx = function () {
    if (this.ctx) return this.ctx;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) { this.muted = true; return null; }
    try { this.ctx = new AC(); } catch (e) { this.muted = true; return null; }
    return this.ctx;
  };
  Player.prototype.voice = function (note, when) {
    var ctx = this.ctx;
    if (!ctx) return;
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = note.wave;
    osc.frequency.setValueAtTime(note.freq, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.22, when + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, when + note.dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(when); osc.stop(when + note.dur + 0.02);
  };
  Player.prototype.play = function (scenarioId) {
    this.stop();
    this.scenario = scenarioId;
    this.notes = notesFor(scenarioId, 0, SPAN);
    this.scheduled = [];
    this.cursor = 0;
    var ctx = this.ensureCtx();
    if (ctx && ctx.state === 'suspended' && ctx.resume) ctx.resume();
    this.startedAt = ctx ? ctx.currentTime + 0.12 : (Date.now() / 1000) + 0.12;
    var self = this;
    var pump = function () {
      var now = ctx ? ctx.currentTime : Date.now() / 1000;
      var horizon = now - self.startedAt + 0.25;
      while (self.cursor < self.notes.length && self.notes[self.cursor].at <= horizon) {
        var n = self.notes[self.cursor++];
        self.voice(n, self.startedAt + n.at);
        self.scheduled.push(n);
      }
      var elapsed = now - self.startedAt;
      if (self.onTick) self.onTick(Math.max(0, Math.min(SPAN, elapsed)), self.scheduled.length);
      if (elapsed >= SPAN) { self.stop(); if (self.onEnd) self.onEnd(scenarioId); }
    };
    pump();
    this.timer = setInterval(pump, 40);
    return this.notes.length;
  };
  Player.prototype.stop = function () {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  };
  // 소리 없이 전부 예약만 수행 — 헤드리스 검증용
  Player.prototype.dryRun = function (scenarioId) {
    this.scenario = scenarioId;
    this.notes = notesFor(scenarioId, 0, SPAN);
    this.scheduled = this.notes.slice();
    return this.scheduled.length;
  };

  // ---------- DOM ----------
  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    var show = function (el, on) { if (!el) return; if (on) el.removeAttribute('hidden'); else el.setAttribute('hidden', ''); };
    var player = new Player();
    global.ECG.player = player;

    // --- 자유 청취 ---
    var bar = $('bar'), elapsedEl = $('elapsed'), noteCountEl = $('noteCount'), nowEl = $('nowPlaying'), tellEl = $('tell');

    function resetMeter() {
      bar.style.width = '0%';
      elapsedEl.textContent = '0.0';
      noteCountEl.textContent = '0';
    }
    player.onTick = function (elapsed, count) {
      bar.style.width = ((elapsed / SPAN) * 100).toFixed(1) + '%';
      elapsedEl.textContent = elapsed.toFixed(1);
      noteCountEl.textContent = String(count);
    };
    player.onEnd = function () {
      nowEl.textContent = '재생 끝';
    };

    function listen(id) {
      var sc = SCENARIOS[id];
      resetMeter();
      var total = player.play(id);
      nowEl.textContent = sc.emoji + ' ' + sc.name + ' 재생 중 (' + SPAN + '초, 음표 ' + total + '개)';
      tellEl.textContent = sc.desc + ' — ' + sc.tell;
      $('listenPanel').setAttribute('data-playing', id);
      drawCharts(id);
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-scenario]'), function (b) {
      b.addEventListener('click', function () { listen(b.getAttribute('data-scenario')); });
    });
    $('stop').addEventListener('click', function () {
      player.stop();
      nowEl.textContent = '정지';
    });

    // --- 대조 그래프 ---
    function drawCharts(id) {
      var runs = runCountSeries(id), rate = dashboardRate(id);
      $('svgRuns').setAttribute('points', polyPoints(runs, 300, 70));
      $('svgRate').setAttribute('points', polyPoints(rate, 300, 70, 100));
      $('rateNow').textContent = rate[rate.length - 1] + '%';
      $('runsNow').textContent = runs.reduce(function (a, b) { return a + b; }, 0) + '회';
      $('chartFor').textContent = SCENARIOS[id].emoji + ' ' + SCENARIOS[id].name;
      var flat = rate.every(function (v) { return v === 100; });
      $('chartNote').textContent = flat
        ? '성공률은 100%에서 꿈쩍도 하지 않습니다. 실행되지 않은 작업은 실패로 집계되지 않기 때문입니다. 대시보드에 성공률만 올려 뒀다면 이 네 상황은 전부 똑같아 보입니다.'
        : '성공률이 움직입니다.';
      show($('charts'), true);
    }

    // --- 블라인드 테스트 ---
    var quiz = [], qi = 0, answers = [];
    function renderRound() {
      $('blindRound').textContent = (qi + 1) + ' / ' + quiz.length;
      $('blindFeedback').textContent = '';
      $('blindFeedback').className = 'fb';
      show($('blindNext'), false);
      Array.prototype.forEach.call(document.querySelectorAll('#blindOpts .opt'), function (b) {
        b.disabled = false;
        b.className = 'opt';
      });
      $('blindPlay').disabled = false;
    }
    function startQuiz() {
      quiz = makeQuiz(5);
      qi = 0; answers = [];
      show($('blindBody'), true);
      show($('blindResult'), false);
      renderRound();
      $('blindScore').textContent = '0';
    }
    $('blindStart').addEventListener('click', startQuiz);
    $('blindPlay').addEventListener('click', function () {
      resetMeter();
      player.play(quiz[qi]);
      nowEl.textContent = '🙈 블라인드 재생 중 — 어느 상황일까요?';
    });
    Array.prototype.forEach.call(document.querySelectorAll('#blindOpts .opt'), function (b) {
      b.addEventListener('click', function () {
        if (b.disabled) return;
        var pick = b.getAttribute('data-pick'), truth = quiz[qi];
        answers.push({ pick: pick, truth: truth });
        Array.prototype.forEach.call(document.querySelectorAll('#blindOpts .opt'), function (o) {
          o.disabled = true;
          if (o.getAttribute('data-pick') === truth) o.className = 'opt right';
          else if (o === b) o.className = 'opt wrong';
        });
        var fb = $('blindFeedback');
        fb.className = 'fb ' + (pick === truth ? 'good' : 'bad');
        fb.textContent = (pick === truth ? '정답 — ' : '오답, 정답은 ' + SCENARIOS[truth].name + ' — ') + SCENARIOS[truth].tell;
        $('blindScore').textContent = String(answers.filter(function (a) { return a.pick === a.truth; }).length);
        $('blindPlay').disabled = true;
        show($('blindNext'), true);
        player.stop();
      });
    });
    $('blindNext').addEventListener('click', function () {
      qi++;
      if (qi < quiz.length) { renderRound(); return; }
      var g = grade(answers);
      show($('blindBody'), false);
      show($('blindResult'), true);
      $('finalHit').textContent = String(g.hit);
      $('finalTotal').textContent = String(g.total);
      $('finalRank').textContent = g.rank;
      $('finalNote').textContent = g.missedSilence
        ? '침묵을 놓치셨습니다. 바로 그게 이 작품의 요점입니다 — 침묵은 경고음을 내지 않습니다. 아무 소리도 내지 않는 쪽이 가장 위험합니다.'
        : '침묵은 잡으셨습니다. 같은 구간을 그래프로만 봤다면 어땠을지 아래에서 확인해 보세요.';
    });
    $('blindAgain').addEventListener('click', startQuiz);

    // 초기 차트는 정상 기준선
    drawCharts('normal');
    show($('charts'), true);
  });
})(typeof window !== 'undefined' ? window : globalThis);
