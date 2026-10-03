// 에이전트 지시서 진료소 — 브라우저 단독 동작, 외부 전송 없음
(function (root) {
  'use strict';

  // 항목별 가중치 합 = 85, 구조 10 + 길이 5 = 100
  const CHECKS = [
    { id: 'role', label: '역할·목적', weight: 15,
      re: [/목적|목표|미션|임무/, /역할|담당/, /너는|당신은|you are/i, /\bgoal\b|\bpurpose\b|\bmission\b|\brole\b/i, /위해|하려는/],
      why: '에이전트가 "왜" 일하는지 모르면 애매한 상황에서 엉뚱한 쪽을 고릅니다.',
      tpl: '## 역할과 목적\n- 너는 [누구를 위한] [무슨 일]을 맡은 에이전트다.\n- 최종 목적: [이 일이 잘 되면 무엇이 좋아지는가]' },
    { id: 'output', label: '산출물·형식', weight: 15,
      re: [/산출물|결과물|출력|보고/, /형식|포맷|양식|템플릿/, /\boutput\b|\bformat\b|\bdeliverable\b|\breport\b/i, /markdown|마크다운|json|표로|목록|한\s?줄|요약/i],
      why: '무엇을 어떤 모양으로 내놓을지 정해지지 않으면 매번 결과 형태가 달라집니다.',
      tpl: '## 산출물\n- 형태: [문서/코드/PR/메시지]\n- 형식: [예: 3줄 요약 + 링크, JSON 스키마 등]\n- 전달 위치: [채널/경로]' },
    { id: 'limits', label: '제약·금지', weight: 12,
      re: [/금지|하지\s?마|말\s?것|않는다|하지\s?않/, /제약|제한|범위|한도|예산/, /\bnever\b|\bdon'?t\b|\bmust not\b|\bavoid\b|\bonly\b/i, /이내|까지만|넘지/],
      why: '해도 되는 일의 경계가 없으면 에이전트가 범위를 넘어 손을 댑니다.',
      tpl: '## 제약\n- 범위: [건드려도 되는 파일·시스템]\n- 금지: [절대 하면 안 되는 일]\n- 한도: [시간·비용·호출 수]' },
    { id: 'done', label: '완료 조건·검증', weight: 15,
      re: [/완료\s?조건|완료\s?기준|성공\s?기준|DoD/i, /검증|테스트|확인한다|확인할\s?것|점검/, /\btest\b|\bverify\b|\bcheck\b|\bacceptance\b/i, /통과|합격|기준/],
      why: '"언제 끝났다고 말해도 되는지"가 없으면 검증 없이 "완료"를 보고합니다.',
      tpl: '## 완료 조건\n- [무엇이 어떻게 되면] 완료로 본다.\n- 완료 보고 전에 [테스트/실행/스크린샷]으로 확인한다.\n- 확인하지 못했으면 "미검증"이라고 적는다.' },
    { id: 'context', label: '맥락·자료', weight: 10,
      re: [/배경|맥락|상황|현재/, /리포|저장소|repo|경로|폴더|파일/i, /\bcontext\b|\bbackground\b/i, /참고|자료|문서|링크|https?:\/\//],
      why: '어디서 무엇을 보고 시작해야 하는지 알려 주면 헤매는 시간이 줄어듭니다.',
      tpl: '## 맥락\n- 배경: [왜 지금 이 일이 필요한가]\n- 먼저 볼 자료: [파일 경로/문서 링크]' },
    { id: 'priority', label: '우선순위', weight: 6,
      re: [/우선순위|우선한다|우선/, /충돌|상충/, /\bpriority\b|\bprecedence\b|\boverride/i, /보다\s?(먼저|우선)|>\s?\S+\s?>/],
      why: '규칙끼리 부딪힐 때 무엇을 먼저 따를지 정해 두지 않으면 판단이 흔들립니다.',
      tpl: '## 우선순위\n- 안전 > [사용자 현재 지시] > [이 문서 규칙] > [기본값]' },
    { id: 'safety', label: '안전·확인', weight: 7,
      re: [/승인|허락|물어보|확인\s?후|묻고/, /삭제|파괴|되돌리|백업|복구/, /외부\s?발신|공개|배포|전송/, /\bconfirm\b|\bapproval\b|\bdestructive\b|\bbackup\b/i],
      why: '되돌릴 수 없는 일(삭제·배포·외부 발신) 앞에서 멈추는 규칙은 사고를 막는 마지막 장치입니다.',
      tpl: '## 안전\n- 삭제·배포·외부 발신 전에는 [누구]에게 확인받는다.\n- 확실하지 않으면 추측하지 말고 확인한다.' },
    { id: 'example', label: '예시', weight: 5,
      re: [/예시|예를\s?들|예\)|예:/, /\bexample\b|\be\.g\./i, /좋은\s?예|나쁜\s?예|잘못된\s?예/, /```/],
      why: '좋은 결과의 예 하나가 긴 설명보다 정확하게 기대치를 전달합니다.',
      tpl: '## 예시\n- 좋은 예: [기대하는 결과 한 줄]\n- 나쁜 예: [피해야 할 결과 한 줄]' }
  ];

  const VAGUE = ['적당히', '알아서', '잘 해', '잘해', '최대한', '가능하면', '등등', '대충', '웬만하면', '좋게', '깔끔하게', 'as needed', 'etc.', 'somehow', 'nicely'];
  const SHOUT = /반드시|절대|무조건|꼭|\bMUST\b|\bNEVER\b|\bALWAYS\b|IMPORTANT|!!+/g;

  function countHits(text, res) {
    return res.reduce((n, re) => n + (re.test(text) ? 1 : 0), 0);
  }

  function diagnose(text) {
    const src = String(text || '');
    const len = src.replace(/\s/g, '').length;
    const results = CHECKS.map(c => {
      const hits = countHits(src, c.re);
      const ratio = hits === 0 ? 0 : hits === 1 ? 0.6 : 1;
      return { id: c.id, label: c.label, weight: c.weight, hits, ratio, points: Math.round(c.weight * ratio), why: c.why, tpl: c.tpl };
    });

    // 구조: 제목·목록이 있으면 읽기 쉬운 지시서
    const lines = src.split(/\r?\n/);
    const headings = lines.filter(l => /^\s*(#{1,6}\s|\d+[.)]\s|[■□▶●◆]\s?)/.test(l)).length;
    const bullets = lines.filter(l => /^\s*([-*•]|\d+[.)])\s/.test(l)).length;
    const structure = Math.min(10, (headings > 0 ? 5 : 0) + Math.min(5, bullets));

    // 길이: 너무 짧으면 정보 부족, 너무 길면 핵심이 묻힘
    let lengthPts = 5, lengthNote = null;
    if (len < 80) { lengthPts = 0; lengthNote = '너무 짧습니다(공백 제외 ' + len + '자). 에이전트가 추측으로 채울 부분이 많습니다.'; }
    else if (len < 200) { lengthPts = 3; lengthNote = '조금 짧습니다. 빠진 항목을 한두 줄씩만 보태도 충분합니다.'; }
    else if (len > 12000) { lengthPts = 2; lengthNote = '매우 깁니다(공백 제외 ' + len + '자). 자주 안 쓰는 내용은 별도 문서로 빼고 링크만 남기세요.'; }

    // 감점
    const lower = src.toLowerCase();
    const vagueFound = VAGUE.filter(w => lower.includes(w.toLowerCase()));
    const vaguePenalty = Math.min(12, vagueFound.length * 3);
    const shoutCount = (src.match(SHOUT) || []).length;
    const shoutPenalty = shoutCount > 6 ? 5 : 0;
    const dupes = findDupes(lines);
    const dupePenalty = Math.min(6, dupes.length * 2);

    const base = results.reduce((s, r) => s + r.points, 0) + structure + lengthPts;
    const total = Math.max(0, Math.min(100, base - vaguePenalty - shoutPenalty - dupePenalty));

    return {
      total, grade: gradeOf(total), length: len, results, structure, lengthPts, lengthNote,
      vagueFound, vaguePenalty, shoutCount, shoutPenalty, dupes, dupePenalty
    };
  }

  function findDupes(lines) {
    const seen = new Map(), out = [];
    lines.map(l => l.trim()).filter(l => l.length >= 12).forEach(l => {
      const k = l.replace(/\s+/g, ' ');
      seen.set(k, (seen.get(k) || 0) + 1);
      if (seen.get(k) === 2) out.push(k);
    });
    return out;
  }

  function gradeOf(t) {
    if (t >= 85) return '튼튼함 — 바로 써도 좋습니다';
    if (t >= 65) return '양호 — 몇 군데만 보강하세요';
    if (t >= 40) return '허약 — 에이전트가 추측할 부분이 많습니다';
    return '위험 — 이대로면 결과가 매번 달라집니다';
  }

  function prescriptions(d) {
    const rx = [];
    d.results.filter(r => r.ratio === 0).forEach(r => rx.push({ level: 'bad', text: r.label + ' 없음 — ' + r.why }));
    d.results.filter(r => r.ratio > 0 && r.ratio < 1).forEach(r => rx.push({ level: 'warn', text: r.label + ' 약함 — 한 가지 측면만 언급되어 있습니다. ' + r.why }));
    if (d.lengthNote) rx.push({ level: 'warn', text: d.lengthNote });
    if (d.structure < 5) rx.push({ level: 'warn', text: '제목·목록이 거의 없습니다. 항목별로 나누면 에이전트도 사람도 빨리 찾습니다.' });
    if (d.vagueFound.length) rx.push({ level: 'warn', text: '애매한 표현: "' + d.vagueFound.join('", "') + '" — 기준(숫자·예시·조건)으로 바꾸세요. (-' + d.vaguePenalty + '점)' });
    if (d.shoutPenalty) rx.push({ level: 'warn', text: '강조어(반드시·절대·MUST 등)가 ' + d.shoutCount + '번 나옵니다. 모두 강조하면 아무것도 강조되지 않습니다. 이유를 한 줄 붙이는 편이 더 잘 지켜집니다. (-' + d.shoutPenalty + '점)' });
    if (d.dupes.length) rx.push({ level: 'warn', text: '같은 문장이 반복됩니다: "' + d.dupes[0].slice(0, 40) + '…" (-' + d.dupePenalty + '점)' });
    if (!rx.length) rx.push({ level: 'good', text: '형식상 빠진 항목이 없습니다. 이제 내용이 실제 상황과 맞는지 한 번 실행해 보며 확인하세요.' });
    return rx;
  }

  function draft(text, d) {
    const missing = d.results.filter(r => r.ratio < 1);
    if (!missing.length) return text.trim() + '\n\n<!-- 진료소: 보강할 항목 없음 -->';
    const add = missing.map(r => r.tpl).join('\n\n');
    return text.trim() + '\n\n<!-- 아래는 진료소가 덧붙인 보강 템플릿입니다. [ ]를 채우고 필요 없는 줄은 지우세요. -->\n\n' + add + '\n';
  }

  const SAMPLES = {
    weak: '리포 좀 관리해줘. 이슈 알아서 정리하고 PR도 적당히 리뷰해. 반드시 잘 해!! 반드시!!',
    good: '# 리포 관리 에이전트 지시서\n\n## 역할과 목적\n- 너는 Daegu-Agent-Crew 팀 리포를 관리하는 에이전트다.\n- 목적: 팀원이 매일 아침 "오늘 볼 이슈"를 1분 안에 파악하게 하는 것.\n\n## 맥락\n- 대상 리포: Daegu-Agent-Crew/creative-loop-engineering2\n- 먼저 볼 자료: OPERATING.md, ROADMAP.md\n\n## 산출물\n- 형식: 마크다운 요약 5줄 이내 + 이슈 링크 목록\n- 전달 위치: 디스코드 #댑관리실\n\n## 제약\n- 범위: 라벨 변경과 코멘트만. 코드 수정·머지는 하지 않는다.\n- 하루 API 호출 200회 이내.\n\n## 우선순위\n- 안전 > 회장님 현재 지시 > 이 문서 > 기본값\n\n## 안전\n- 이슈 닫기·삭제는 회장님 승인 후에만 한다.\n\n## 완료 조건\n- 모든 신규 이슈에 상태 라벨이 붙어 있으면 완료로 본다.\n- 보고 전에 gh issue list로 라벨 누락이 0건인지 확인한다.\n\n## 예시\n- 좋은 예: "신규 3건(p:high 1) · 막힌 PR 1건(#112, 리뷰 대기 2일)"\n- 나쁜 예: "이슈 정리했습니다"'
  };

  const api = { CHECKS, diagnose, prescriptions, draft, SAMPLES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Clinic = api;

  if (typeof document === 'undefined') return;

  const $ = s => document.querySelector(s);
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const colorOf = r => r >= 1 ? 'var(--good)' : r > 0 ? 'var(--warn)' : 'var(--bad)';

  function render() {
    const text = $('#src').value;
    if (!text.trim()) { $('#result').style.display = 'none'; return; }
    const d = diagnose(text);
    $('#total').textContent = d.total;
    $('#total').style.color = d.total >= 65 ? 'var(--good)' : d.total >= 40 ? 'var(--warn)' : 'var(--bad)';
    $('#grade').textContent = d.grade;
    const rows = d.results.map(r => [r.label, r.ratio, r.points + '/' + r.weight])
      .concat([['구조(제목·목록)', d.structure / 10, d.structure + '/10'], ['길이', d.lengthPts / 5, d.lengthPts + '/5']]);
    $('#bars').innerHTML = rows.map(([l, r, s]) =>
      '<span>' + esc(l) + '</span><div class="bar"><i style="width:' + Math.round(r * 100) + '%;background:' + colorOf(r) + '"></i></div><span>' + s + '</span>').join('');
    $('#rx').innerHTML = prescriptions(d).map(p =>
      '<li><span class="tag t-' + p.level + '">' + ({ bad: '빠짐', warn: '보강', good: '양호' }[p.level]) + '</span>' + esc(p.text) + '</li>').join('');
    $('#draft').textContent = draft(text, d);
    $('#result').style.display = 'block';
  }

  $('#run').addEventListener('click', render);
  $('#clear').addEventListener('click', () => { $('#src').value = ''; $('#count').textContent = ''; render(); });
  document.querySelectorAll('[data-sample]').forEach(b => b.addEventListener('click', () => {
    $('#src').value = SAMPLES[b.dataset.sample]; updateCount(); render();
  }));
  function updateCount() { $('#count').textContent = $('#src').value.replace(/\s/g, '').length + '자'; }
  $('#src').addEventListener('input', updateCount);
  $('#copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('#draft').textContent); $('#copied').textContent = '복사했습니다'; }
    catch (e) { $('#copied').textContent = '복사 실패 — 직접 선택해 복사하세요'; }
  });
})(typeof window !== 'undefined' ? window : globalThis);
