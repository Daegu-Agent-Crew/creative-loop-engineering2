// 반증 도장 — 서버 없이 동작. 정답(a[0])은 화면에 섞어서 보여 준다.
const Q = [
  { c: '모든 백조는 하얗다.',
    a: ['검은 백조 한 마리가 발견된다',
        '하얀 백조 1,000마리를 더 관찰한다',
        '하얀 운동화를 하나 발견한다',
        '조류학자 10명이 이 주장에 동의한다'],
    e: '확인 사례는 몇 개를 모아도 "모든"을 증명하지 못합니다. 반례 하나면 무너집니다. 하얀 운동화는 논리적으로는 "하얗지 않은 것은 백조가 아니다"를 지지하지만 사실상 아무 정보도 없습니다(헴펠의 까마귀 역설).' },
  { c: '새 온보딩 문구를 넣은 뒤 가입률이 올랐다. 문구 덕분이다.',
    a: ['문구를 바꾸지 않은 대조군에서도 같은 기간 가입률이 똑같이 올랐다',
        '가입자 인터뷰에서 "문구가 좋았다"는 말이 나왔다',
        '문구를 바꾼 다음 날 가입 수가 최고치를 찍었다',
        '디자인팀도 새 문구가 더 낫다고 평가했다'],
    e: '시점이 겹치는 것만으로는 원인을 알 수 없습니다. 대조군도 똑같이 올랐다면 원인은 계절, 광고처럼 문구 밖에 있습니다.' },
  { c: '프롬프트를 고쳤더니 에이전트 정확도가 올랐다. (예시 10개로 확인)',
    a: ['처음 보는 새 문제 50개에서는 고치기 전과 정확도가 같다',
        '예시 10개 중 9개를 맞혔다',
        '다른 모델로 돌려도 예시 10개를 통과했다',
        '고친 프롬프트가 더 길고 구체적이다'],
    e: '고칠 때 보던 예시에서만 좋아졌다면 과적합일 수 있습니다. 반증은 고칠 때 안 본 데이터에서 해야 의미가 있습니다.' },
  { c: '밈코인 가격은 커뮤니티 이벤트 공지에 반응한다.',
    a: ['이벤트가 없는 무작위 날짜에도 비슷한 크기의 급등락이 비슷한 빈도로 나온다',
        '이벤트 공지 직후 30% 오른 사례가 있다',
        '커뮤니티가 "이벤트 덕분에 올랐다"고 말한다',
        '이벤트 공지 게시물의 리트윗이 많았다'],
    e: '변동성이 큰 시장에서는 무슨 일이 있든 급등락이 생깁니다. "이벤트 때만 특별히" 움직였는지 보려면 이벤트 없는 날과 비교해야 합니다. 비교 기준은 미리 정해 둬야 합니다(사전 등록).' },
  { c: '테스트가 전부 통과하니 이 코드에는 버그가 없다.',
    a: ['일부러 버그를 심어도 테스트가 여전히 전부 통과한다',
        '코드 커버리지가 90%다',
        'CI가 30일 연속 초록불이다',
        '테스트가 300개나 된다'],
    e: '버그를 심었는데도 통과한다면 그 테스트는 버그를 잡지 못한다는 뜻입니다(뮤테이션 테스트). 커버리지는 "실행됐다"는 뜻이지 "검사했다"는 뜻이 아닙니다.' },
  { c: '우리 에이전트는 비밀키에 절대 접근하지 않는다.',
    a: ['실행 로그나 파일 접근 기록에 키 파일 읽기가 한 번이라도 남아 있다',
        '에이전트에게 물어보니 "접근하지 않는다"고 답했다',
        '지시서에 "키 접근 금지"라고 적혀 있다',
        '지난 일주일 동안 사고가 없었다'],
    e: '본인 진술과 규칙 문구는 행동의 증거가 아닙니다. "절대"라는 주장은 실제 기록에 남은 위반 1건으로 무너집니다. 그래서 감사 로그가 필요합니다.' },
  { c: '"전문가 90%가 찬성"이라는 기사 제목은 사실이다.',
    a: ['원 조사를 찾아보니 응답자가 10명이었고 질문도 다른 내용이었다',
        '여러 매체가 같은 숫자를 인용했다',
        '기사 조회수가 매우 높다',
        '숫자가 직관적으로 그럴듯하다'],
    e: '여러 매체의 인용은 독립된 증거가 아닌 경우가 많습니다. 다 같은 출처를 베낀 것일 수 있습니다. 원자료 확인이 반증의 출발점입니다.' },
  { c: '"침묵하면 동의로 본다" 규칙 덕분에 결정권자의 부담이 줄었다.',
    a: ['도입 뒤 사후에 뒤집힌 결정이 늘어 전체 처리 시간이 오히려 길어졌다',
        '승인 대기 건수가 줄었다',
        '에이전트들이 일이 편해졌다고 보고했다',
        '결정 처리 속도가 빨라졌다'],
    e: '대기 건수와 속도는 규칙이 원래 만들어 내는 숫자라서 부담이 줄었는지는 따로 봐야 합니다. 침묵 승인이 나중에 번복과 재작업으로 돌아온다면 부담은 옮겨 갔을 뿐입니다.' },
];
const RANKS = [[8, '🥋 포퍼 대사범', '반증의 눈이 완성됐습니다. 이제 내 주장에도 써 보세요.'],
  [6, '🥈 반증 사범', '대부분 꿰뚫었습니다. 틀린 문제의 함정을 다시 보세요.'],
  [4, '🥉 반증 입문', '"맞다는 증거"에 끌리는 순간을 알아차리기 시작했습니다.'],
  [0, '🌱 수련생', '확인 사례가 많다고 주장이 증명되진 않습니다. 다시 도전해 보세요.']];

const $ = id => document.getElementById(id);
let i = 0, score = 0;

function shuffle(arr) {
  const a = arr.slice();
  for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; }
  return a;
}

function render() {
  const q = Q[i];
  $('qno').textContent = `${i + 1} / ${Q.length}`;
  $('score').textContent = score;
  $('claim').textContent = '주장: ' + q.c;
  $('explain').style.display = 'none';
  $('next').hidden = true;
  const box = $('opts');
  box.innerHTML = '';
  shuffle(q.a.map((t, k) => ({ t, ok: k === 0 }))).forEach(o => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.textContent = o.t;
    b.dataset.correct = o.ok ? '1' : '0';
    b.addEventListener('click', () => answer(b));
    box.appendChild(b);
  });
}

function answer(btn) {
  const ok = btn.dataset.correct === '1';
  if (ok) score++;
  for (const b of $('opts').children) {
    b.disabled = true;
    if (b.dataset.correct === '1') b.classList.add('right');
  }
  if (!ok) btn.classList.add('wrong');
  $('score').textContent = score;
  const ex = $('explain');
  ex.innerHTML = '';
  const head = document.createElement('b');
  head.className = ok ? 'ok' : 'no';
  head.textContent = ok ? '정확합니다. ' : '함정입니다. ';
  ex.append(head, document.createTextNode(Q[i].e));
  ex.style.display = 'block';
  $('next').textContent = i === Q.length - 1 ? '결과 보기' : '다음 문제';
  $('next').hidden = false;
}

function finish() {
  $('quiz').style.display = 'none';
  $('final').style.display = 'block';
  $('finalScore').textContent = score;
  const [, name, lesson] = RANKS.find(r => score >= r[0]);
  $('rank').textContent = name;
  $('lesson').textContent = lesson;
}

function restart() {
  i = 0; score = 0;
  $('final').style.display = 'none';
  $('quiz').style.display = 'block';
  render();
}

$('next').addEventListener('click', () => { if (++i < Q.length) render(); else finish(); });
$('retry').addEventListener('click', restart);

function tab(which) {
  $('dojo').hidden = which !== 'dojo';
  $('cardTool').hidden = which !== 'card';
  $('tabDojo').classList.toggle('on', which === 'dojo');
  $('tabCard').classList.toggle('on', which === 'card');
}
$('tabDojo').addEventListener('click', () => tab('dojo'));
$('tabCard').addEventListener('click', () => tab('card'));
$('toCard').addEventListener('click', () => tab('card'));

// --- 반증 카드 ---
const CONFIRM_WORDS = ['성공', '통과', '좋다', '좋았', '동의', '많', '증가하면', '오르면', '확인된다'];
const cell = s => (s || '').trim().replace(/\|/g, '\\|').replace(/\n+/g, ' ') || ' ';

function makeCard() {
  const claim = $('cClaim').value.trim(), fals = $('cFals').value.trim();
  const warns = [];
  if (!claim) warns.push('주장을 먼저 적어 주세요.');
  if (fals.length < 10) warns.push('반증 시나리오가 비어 있거나 너무 짧습니다. "무엇이 관찰되면 틀린 것인가"를 구체적으로 적어 주세요.');
  else if (CONFIRM_WORDS.some(w => fals.includes(w)) && !/않|없|같|안 /.test(fals))
    warns.push('반증 시나리오가 "맞다는 증거"처럼 읽힙니다. 주장이 틀렸을 때 보일 관찰로 바꿔 보세요.');
  if (!claim) { $('cardOut').style.display = 'block'; $('cardWarn').textContent = warns.join(' '); $('cardMd').textContent = ''; return; }
  const md = [
    '| # | 주장(기대 결과) | 반증 시나리오 — 이 주장이 틀리려면 무엇이 관찰돼야 하나 | 관찰 결과·근거 링크 | 판정 |',
    '|---|------------------|------------------------------------------------------|---------------------|------|',
    `| 1 | ${cell(claim)} | ${cell(fals)} | ${cell($('cObs').value)} | ${$('cVerdict').value} |`,
  ].join('\n');
  $('cardWarn').textContent = warns.join(' ');
  $('cardMd').textContent = md;
  $('copied').textContent = '';
  $('cardOut').style.display = 'block';
}
$('makeCard').addEventListener('click', makeCard);
document.querySelector('[data-sample="card"]').addEventListener('click', () => {
  $('cClaim').value = '새 지시서 템플릿을 쓰면 에이전트 재작업이 줄어든다';
  $('cFals').value = '템플릿 도입 전후 2주 비교에서 재작업 건수가 줄지 않거나 늘어난다 (기준은 도입 전에 고정)';
  $('cObs').value = '';
  $('cVerdict').value = '보류';
  makeCard();
});
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('cardMd').textContent); $('copied').textContent = '복사했습니다'; }
  catch { $('copied').textContent = '복사 권한이 없어 직접 선택해 복사해 주세요'; }
});

render();
