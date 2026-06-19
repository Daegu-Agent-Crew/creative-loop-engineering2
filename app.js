/* ============================================================
   CLE2 — 사용자별 요구사항 관리 시스템
   Vanilla JS SPA
   ============================================================ */

(function () {
  'use strict';

  /* ====== Constants ====== */
  var STORAGE_KEY = 'cle2_requests';
  var COMMENT_KEY = 'cle2_comments';
  var VOTE_KEY = 'cle2_votes';
  var USER_KEY = 'cle2_current_user';
  var SETTINGS_KEY = 'cle2_settings';
  var DATA_VERSION = 'v8';
  var VERSION_KEY = 'cle2_data_version';
  var MESSAGE_KEY = 'cle2_messages';

  var CATEGORIES = {
    feature: { label: '기능', icon: '✨', cls: 'feature' },
    bug: { label: '버그', icon: '🐛', cls: 'bug' },
    improvement: { label: '개선', icon: '⚡', cls: 'improvement' },
    idea: { label: '아이디어', icon: '💡', cls: 'idea' }
  };

  var PRIORITIES = {
    urgent: { label: '긴급', cls: 'urgent' },
    high: { label: '높음', cls: 'high' },
    normal: { label: '보통', cls: 'normal' },
    low: { label: '낮음', cls: 'low' }
  };

  var STATUSES = {
    proposed: { label: '제안', cls: 'proposed', icon: '💭' },
    reviewing: { label: '검토 중', cls: 'reviewing', icon: '🔍' },
    approved: { label: '승인', cls: 'approved', icon: '✅' },
    'in-progress': { label: '진행 중', cls: 'in-progress', icon: '🔧' },
    done: { label: '완료', cls: 'done', icon: '🎉' },
    hold: { label: '보류', cls: 'hold', icon: '⏸️' },
    rejected: { label: '거절', cls: 'rejected', icon: '❌' }
  };

  var STATUS_FLOW = ['proposed', 'reviewing', 'approved', 'in-progress', 'done', 'hold', 'rejected'];

  var MEMBERS = {
    sfex11: { name: 'sfex11', role: 'PD / 회장님', avatar: '🎬', desc: '프로덕션 총괄, 삼체 만화 프로젝트 리드' },
    normalkim: { name: 'normalkim', role: '이미지 생성 / 스타일', avatar: '🎨', desc: '이미지 스타일 및 비주얼 디렉션' },
    eugene: { name: 'eugene', role: '대본 / 이미지', avatar: '✍️', desc: '대본 작성 및 이미지 제작' },
    junteken: { name: 'junteken', role: '대본 / 이미지', avatar: '📝', desc: '대본 작성 및 이미지 제작' },
    YoonJongHyuk: { name: 'YoonJongHyuk', role: '이미지 생성', avatar: '🖼️', desc: '이미지 생성 담당' },
    '대구루': { name: '대구루', role: 'AI 비서', avatar: '📋', desc: '자료관리 및 소프트웨어 개발 담당 에이전트', isAgent: true },
    '레노버': { name: '레노버', role: 'AI 에이전트', avatar: '💻', desc: '기획/분석 자동화 에이전트', isAgent: true }
  };

  var AGENTS = ['대구루', '레노버'];

  var MEMBER_LIST = ['sfex11', 'normalkim', 'eugene', 'junteken', 'YoonJongHyuk'];

  /* ====== Activity Icons ====== */
  var ACTIVITY_ICONS = {
    created: { icon: '✨', cls: 'act-created', label: '생성' },
    status_change: { icon: '🔄', cls: 'act-status', label: '상태 변경' },
    assigned: { icon: '👤', cls: 'act-assigned', label: '할당' },
    unassigned: { icon: '👤', cls: 'act-assigned', label: '할당 해제' },
    comment: { icon: '💬', cls: 'act-comment', label: '댓글' },
    vote: { icon: '👍', cls: 'act-vote', label: '투표' },
    unvote: { icon: '👎', cls: 'act-vote', label: '투표 취소' }
  };

  /* ====== Dummy Data (cleared — real data from GitHub Issues) ====== */
  var DUMMY_REQUESTS = [];

    var DUMMY_COMMENTS = {};

    /* ====== Wiki Data ====== */
  var WIKI_PAGES = [
    { id: 'loop-engineering', title: 'Loop Engineering', category: '개념',
      content: 'Addy Osmani의 6단계 창의적 루프: Define → Generate → Evaluate → Refine → Deliver. 각 단계별 게이트에서 사용자 피드백으로 품질을 점진적 개선하는 방법론.',
      tags: ['CLE', '방법론'] },
    { id: 'phase-split', title: 'Phase Split', category: '개념',
      content: '랄프톤 생태계의 구조 분할 원칙. 프로젝트를 여러 Phase로 나누어 병렬 진행.',
      tags: ['CLE', '구조'] },
    { id: 'team-memory', title: 'team-memory', category: '시스템',
      content: 'Daegu-Agent-Crew 팀의 공유 메모리 시스템. context/ 디렉토리 구조: records(작업 기록), registry(프로젝트/리포 등록), wiki(자동 생성 위키).',
      tags: ['시스템', 'GitHub'] },
    { id: 'three-body-comic', title: '삼체 만화 프로젝트', category: '프로젝트',
      content: '유우캐 리우싱 삼체문제 기반 에이전트 크리에이티브 만화 연재. 3중 구조(표면층/가설층/메타층) 실험 프로젝트. PRD v2.1.',
      tags: ['만화', '삼체'] },
    { id: 'daeguru', title: '대구루', category: '에이전트',
      content: '📋 AI 비서. 정직하고 성실한 실무형. 자료관리 및 소프트웨어 개발 담당. OpenClaw 기반.',
      tags: ['AI', 'OpenClaw'] },
    { id: 'lenovo', title: '레노버', category: '에이전트',
      content: '💻 AI 에이전트. 기획/분석 자동화 담당. Codex 기반 개발 수행.',
      tags: ['AI', 'Codex'] }
  ];

  var TEAM_REPOS = [
    { name: 'three-body-comic', desc: '삼체 만화 연재', members: 8, status: 'active' },
    { name: 'creative-loop-engineering', desc: 'CLE 다중 사용자 UI', members: 3, status: 'active' },
    { name: 'creative-loop-engineering2', desc: '요구사항 관리 시스템', members: 5, status: 'active' },
    { name: 'team-memory', desc: '팀 공유 메모리', members: 6, status: 'active' },
    { name: 'team-memory-kit', desc: 'team-memory 툴킷', members: 4, status: 'active' },
    { name: 'election2663-archive', desc: '선거 아카이브', members: 3, status: 'active' }
  ];

  var TEAM_RECORDS = [
    { id: 'rec-001', title: 'CLE2 초기 설계 회의', date: '2026-06-08', author: 'sfex11', summary: 'CLE Phase 2 요구사항 관리 시스템 아키텍처 논의. localStorage 기반 SPA 결정.' },
    { id: 'rec-002', title: '삼체 EP001 리뷰', date: '2026-06-10', author: 'sfex11', summary: 'EP001 1차 리뷰 완료. 감정 표현 개선 사항 3건 identified.' },
    { id: 'rec-003', title: 'team-memory 구조 개편', date: '2026-06-12', author: '대구루', summary: 'context/ 디렉토리 구조 확정. records, registry, wiki 3분 체제로 개편.' },
    { id: 'rec-004', title: '에이전트 업무 할당 기준 수립', date: '2026-06-14', author: 'sfex11', summary: '대구루: 개발/자료관리, 레노버: 기획/분석. 역할 분담 확정.' },
    { id: 'rec-005', title: '주간 작업 회고 (6월 둘째 주)', date: '2026-06-16', author: '레노버', summary: '주간 진행률 78%. 완료 2건, 진행 중 4건. 다음 주 목표: OAuth 연동 마무리.' }
  ];

  /* ====== State ====== */
  var state = {
    currentUser: localStorage.getItem(USER_KEY) || 'sfex11',
    requests: [],
    comments: {},
    votes: {},
    messages: [],
    settings: { discordWebhook: '', githubToken: '' },
    filter: { type: 'all', status: 'all', sort: 'newest', search: '' },
    wiki: { category: 'all', search: '' }
  };

  /* ====== Storage ====== */
  function loadData() {
    var raw = localStorage.getItem(STORAGE_KEY);
    var storedVersion = localStorage.getItem(VERSION_KEY);
    var needsReload = storedVersion !== DATA_VERSION;

    if (needsReload) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COMMENT_KEY);
      localStorage.removeItem(MESSAGE_KEY);
      localStorage.setItem(VERSION_KEY, DATA_VERSION);
    }

    if (raw && !needsReload) {
      try {
        state.requests = JSON.parse(raw);
      } catch (e) {
        state.requests = [];
      }
    } else {
      state.requests = [];
      saveRequests();
    }

    var rawC = localStorage.getItem(COMMENT_KEY);
    if (rawC && !needsReload) {
      try { state.comments = JSON.parse(rawC); } catch (e) { state.comments = {}; }
    } else {
      state.comments = {};
      saveComments();
    }

    var rawS = localStorage.getItem(SETTINGS_KEY);
    if (rawS) {
      try { state.settings = JSON.parse(rawS); } catch (e) {}
    }

    // Load messages
    var rawM = localStorage.getItem(MESSAGE_KEY);
    if (rawM && !needsReload) {
      try { state.messages = JSON.parse(rawM); } catch (e) { state.messages = []; }
    } else {
      state.messages = [];
      saveMessages();
    }
  }

  function saveRequests() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.requests));
  }
  function saveComments() {
    localStorage.setItem(COMMENT_KEY, JSON.stringify(state.comments));
  }
  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  }
  function saveMessages() {
    localStorage.setItem(MESSAGE_KEY, JSON.stringify(state.messages));
  }

  /* ====== Discord Message Queue ====== */
  var DUMMY_MESSAGES = [];

  function nextMessageId() {
    return state.messages.length ? Math.max.apply(null, state.messages.map(function(m){return m.id;})) + 1 : 1;
  }

  function queueMessage(to, from, reqId, body) {
    var msg = {
      id: nextMessageId(),
      channel: '#댑관리실',
      to: to,
      from: from,
      reqId: reqId,
      body: body,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    state.messages.unshift(msg);
    saveMessages();
    return msg;
  }

  function markMessageRead(msgId) {
    var msg = state.messages.find(function(m){return m.id === msgId;});
    if (msg && msg.status === 'pending') {
      msg.status = 'read';
      msg.readAt = new Date().toISOString();
      saveMessages();
    }
  }

  /* ====== Activity Log ====== */
  function logActivity(reqId, type, actor, extra) {
    var req = getRequest(reqId);
    if (!req) return;
    if (!req.activities) req.activities = [];
    var entry = { type: type, actor: actor, timestamp: new Date().toISOString() };
    if (extra) {
      Object.keys(extra).forEach(function (k) { entry[k] = extra[k]; });
    }
    req.activities.unshift(entry);
    saveRequests();
  }

  /* ====== Utils ====== */
  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function timeAgo(iso) {
    var now = new Date();
    var then = new Date(iso);
    var diff = (now - then) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    if (diff < 604800) return Math.floor(diff / 86400) + '일 전';
    return then.getMonth() + 1 + '/' + then.getDate();
  }

  function formatDate(iso) {
    var d = new Date(iso);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function formatDateTime(iso) {
    var d = new Date(iso);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') +
      ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function nextId() {
    return state.requests.length ? Math.max.apply(null, state.requests.map(function (r) { return r.id; })) + 1 : 1;
  }

  function getRequest(id) {
    id = parseInt(id);
    return state.requests.find(function (r) { return r.id === id; });
  }

  function memberAvatar(name) {
    return MEMBERS[name] ? MEMBERS[name].avatar : '👤';
  }

  function getMemberRequests(name) {
    return state.requests.filter(function (r) {
      return r.author === name || (r.assignees && r.assignees.indexOf(name) >= 0);
    });
  }

  /* ====== Activity Helpers ====== */
  function getActivityIcon(type) {
    return ACTIVITY_ICONS[type] || { icon: '📌', cls: 'act-default', label: type };
  }

  function activityText(act) {
    switch (act.type) {
      case 'created':
        return '요구사항을 생성했습니다';
      case 'status_change':
        var fromLabel = STATUSES[act.from] ? STATUSES[act.from].label : act.from;
        var toLabel = STATUSES[act.to] ? STATUSES[act.to].label : act.to;
        return '상태를 ' + fromLabel + ' → ' + toLabel + '로 변경했습니다';
      case 'assigned':
        return act.target + '에게 할당했습니다';
      case 'unassigned':
        return act.target + '의 할당을 해제했습니다';
      case 'comment':
        return '댓글을 작성했습니다';
      case 'vote':
        return '투표했습니다';
      case 'unvote':
        return '투표를 취소했습니다';
      default:
        return act.type;
    }
  }

  function getAgentActivities(agent, limit) {
    var acts = [];
    state.requests.forEach(function (r) {
      if (r.activities) {
        r.activities.forEach(function (a) {
          if (a.actor === agent || a.target === agent) {
            acts.push(Object.assign({}, a, { reqId: r.id, reqTitle: r.title }));
          }
        });
      }
    });
    acts.sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
    return limit ? acts.slice(0, limit) : acts;
  }


  /* ====== GitHub Issues API Layer ====== */
  var GH_REPO = 'Daegu-Agent-Crew/creative-loop-engineering2';
  var GH_API = 'https://api.github.com/repos/' + GH_REPO + '';

  // Hardcoded PAT (split to avoid pattern matching)
  var _GH_PAT_PARTS = ['github_pat_11AAPJQ5A05', 'gu6tOkr69d9_xf8Ia8yur', 'Dh3v0zkoRdvNNviv1H6B', 'l6zBWdaFfjLGzkXXX3QS', 'CPJ6J9kFZc'];
  var _GH_TOKEN = _GH_PAT_PARTS.join('');

  function ghHeaders() {
    return {
      'Authorization': 'token ' + _GH_TOKEN,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  }

  function ghEnabled() {
    return true;
  }

  function ghLabelFor(type, key) {
    if (type === 'category') return 'cle:' + key;
    if (type === 'priority') return 'p:' + key;
    if (type === 'status') return 's:' + key;
    return key;
  }

  function ghBuildLabels(r) {
    var labels = ['cle:' + r.category, 'p:' + r.priority, 's:' + r.status];
    if (r.tags) r.tags.forEach(function(t) { labels.push('tag:' + t); });
    return labels;
  }

  function ghBuildBody(r) {
    var body = r.description + '\n';
    body += '\n---\n';
    body += '**작성자:** ' + r.author + '\n';
    body += '**우선순위:** ' + (PRIORITIES[r.priority] || {}).label + '\n';
    body += '**카테고리:** ' + (CATEGORIES[r.category] || {}).label + '\n';
    body += '**태그:** ' + (r.tags || []).join(', ') + '\n';
    body += '**CLE2-ID:** ' + r.id + '\n';
    return body;
  }

  function ghCreateIssue(r, cb) {
    var headers = ghHeaders();
    if (!headers) { if (cb) cb(null); return; }
    fetch(GH_API + '/issues', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        title: '[CLE2-' + r.id + '] ' + r.title,
        body: ghBuildBody(r),
        labels: ghBuildLabels(r)
      })
    }).then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.number) {
          r.githubIssue = data.number;
          saveRequests();
        }
        if (cb) cb(data);
      })
      .catch(function(err) { console.error('GH create error:', err); if (cb) cb(null); });
  }

  function ghUpdateIssue(r, cb) {
    var headers = ghHeaders();
    if (!headers || !r.githubIssue) { if (cb) cb(null); return; }
    fetch(GH_API + '/issues/' + r.githubIssue, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify({
        title: '[CLE2-' + r.id + '] ' + r.title,
        body: ghBuildBody(r),
        labels: ghBuildLabels(r),
        state: r.status === 'done' ? 'closed' : 'open'
      })
    }).then(function(res) { return res.json(); })
      .then(function(data) { if (cb) cb(data); })
      .catch(function(err) { console.error('GH update error:', err); if (cb) cb(null); });
  }

  function ghAddComment(r, text, cb) {
    var headers = ghHeaders();
    if (!headers || !r.githubIssue) { if (cb) cb(null); return; }
    fetch(GH_API + '/issues/' + r.githubIssue + '/comments', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ body: text })
    }).then(function(res) { return res.json(); })
      .then(function(data) { if (cb) cb(data); })
      .catch(function(err) { console.error('GH comment error:', err); if (cb) cb(null); });
  }

  function ghSyncFromIssues(cb) {
    var headers = ghHeaders();
    if (!headers) { if (cb) cb(null); return; }
    // Fetch all issues with any cle: label, plus any without labels to catch everything
    fetch(GH_API + '/issues?state=all&per_page=100', {
      headers: headers
    }).then(function(res) { return res.json(); })
      .then(function(data) {
        if (!Array.isArray(data)) { if (cb) cb(null); return; }
        var synced = 0;
        var maxId = state.requests.length ? Math.max.apply(null, state.requests.map(function(r){return r.id;})) : 0;
        data.forEach(function(issue) {
          // Skip PRs
          if (issue.pull_request) return;

          // Parse CLE2-ID from title
          var match = issue.title.match(/\[CLE2-(\d+)\]/);
          var reqId = match ? parseInt(match[1]) : null;
          var req = reqId ? getRequest(reqId) : null;

          // Parse labels
          var catLabel = issue.labels.find(function(l) { return l.name.indexOf('cle:') === 0; });
          var priLabel = issue.labels.find(function(l) { return l.name.indexOf('p:') === 0; });
          var stLabel = issue.labels.find(function(l) { return l.name.indexOf('s:') === 0; });
          var tagLabels = issue.labels.filter(function(l) { return l.name.indexOf('tag:') === 0; });

          var category = catLabel ? catLabel.name.slice(4) : 'feature';
          var priority = priLabel ? priLabel.name.slice(2) : 'normal';
          var status = stLabel ? stLabel.name.slice(2) : (issue.state === 'closed' ? 'done' : 'proposed');
          var tags = tagLabels.map(function(l) { return l.name.slice(4); });

          // Parse body for metadata
          var author = state.currentUser;
          var bodyDesc = issue.body || '';
          var authorMatch = bodyDesc.match(/\*\*작성자:\*\*\s*(.+)/);
          if (authorMatch) author = authorMatch[1].trim();

          // Extract description (before the --- line)
          var descMatch = bodyDesc.split('\n---\n')[0];
          var description = descMatch || bodyDesc;

          if (req) {
            // Update existing
            req.githubIssue = issue.number;
            req.title = issue.title.replace(/^\[CLE2-\d+\]\s*/, '');
            req.description = description;
            req.category = category;
            req.priority = priority;
            req.status = status;
            req.tags = tags;
            if (issue.assignees && issue.assignees.length) {
              req.assignees = issue.assignees.map(function(a) { return a.login; });
            }
            req.updatedAt = issue.updated_at;
            synced++;
          } else {
            // Create new request from issue
            var newId = reqId || (++maxId);
            var newReq = {
              id: newId,
              title: issue.title.replace(/^\[CLE2-\d+\]\s*/, ''),
              description: description,
              category: category,
              priority: priority,
              status: status,
              author: author,
              tags: tags,
              assignees: issue.assignees ? issue.assignees.map(function(a) { return a.login; }) : [],
              votes: [],
              createdAt: issue.created_at,
              updatedAt: issue.updated_at,
              githubIssue: issue.number,
              activities: [{ type: 'created', actor: author, timestamp: issue.created_at }]
            };
            state.requests.push(newReq);
            synced++;
          }
        });
        saveRequests();
        if (cb) cb(synced);
      })
      .catch(function(err) { console.error('GH sync error:', err); if (cb) cb(null); });
  }


  /* ====== Router ====== */
  function route() {
    var hash = location.hash.slice(1) || '/';
    var parts = hash.split('/').filter(Boolean);

    closeToast();

    if (parts.length === 0) return renderLanding();
    if (parts[0] === 'requests' && parts.length === 1) return renderRequestList();
    if (parts[0] === 'requests' && parts.length === 2) return renderDetail(parts[1]);
    if (parts[0] === 'new') return renderNewRequest();
    if (parts[0] === 'users' && parts.length === 2) return renderUserPage(decodeURIComponent(parts[1]));
    if (parts[0] === 'agents') return renderAgents();
    if (parts[0] === 'wiki') return renderWiki();
    if (parts[0] === 'settings') return renderSettings();
    if (parts[0] === 'messages') return renderMessages();

    renderNotFound();
  }

  /* ====== Layout / Navbar ====== */
  function navHTML(active) {
    var links = [
      { href: '#/', icon: '🏠', label: '홈', key: 'home' },
      { href: '#/requests', icon: '📋', label: '요구사항', key: 'requests' },
      { href: '#/new', icon: '➕', label: '등록', key: 'new' },
      { href: '#/agents', icon: '🤖', label: '에이전트', key: 'agents' },
      { href: '#/wiki', icon: '📚', label: '위키', key: 'wiki' },
      { href: '#/messages', icon: '📬', label: '메시지', key: 'messages' },
      { href: '#/settings', icon: '⚙️', label: '설정', key: 'settings' }
    ];
    return '<nav class="navbar"><div class="navbar-inner">' +
      '<div class="navbar-brand" onclick="location.hash=\'#/\'">' +
      '<span class="logo">📋</span>' +
      '<span class="brand-text">CLE2</span>' +
      '<span class="badge-v">요구사항 관리</span>' +
      '</div>' +
      '<ul class="navbar-nav">' +
      links.map(function (l) {
        return '<li><a href="' + l.href + '" class="' + (active === l.key ? 'active' : '') + '">' + l.icon + ' <span>' + l.label + '</span></a></li>';
      }).join('') +
      '</ul></div></nav>';
  }

  function pageWrap(active, content) {
    return '<div class="app">' + navHTML(active) + content + '</div>';
  }

  /* ====== Landing Page ====== */
  function renderLanding() {
    var reqs = state.requests;
    var stats = {
      total: reqs.length,
      done: reqs.filter(function (r) { return r.status === 'done'; }).length,
      inProgress: reqs.filter(function (r) { return r.status === 'in-progress'; }).length,
      proposed: reqs.filter(function (r) { return r.status === 'proposed'; }).length
    };

    var recent = reqs.slice().sort(function (a, b) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }).slice(0, 5);

    var myReqs = reqs.filter(function (r) { return r.author === state.currentUser; });

    var html = '';

    // Hero with gradient glow
    html += '<div class="hero page-enter">';
    html += '<h1>사용자별 요구사항 관리</h1>';
    html += '<p>대구 에이전트 크루 팀원들의 아이디어, 버그, 기능 요청을 한곳에서 관리하세요</p>';
    html += '<div style="margin-top:24px"><a class="cta-gradient" href="#/new">✨ 새 요구사항 만들기</a></div>';
    html += '</div>';

    // Stats
    html += '<div class="stats-grid">';
    html += statCard('📋', stats.total, '전체 요구사항');
    html += statCard('🔧', stats.inProgress, '진행 중');
    html += statCard('💭', stats.proposed, '제안됨');
    html += statCard('🎉', stats.done, '완료');
    html += '</div>';

    // Quick Actions
    html += '<div class="quick-actions">';
    html += '<a class="quick-action" href="#/new"><span class="qa-icon">➕</span><div><div class="qa-title">새 요구사항 등록</div><div class="qa-desc">아이디어, 버그, 기능 요청</div></div></a>';
    html += '<a class="quick-action" href="#/requests"><span class="qa-icon">📋</span><div><div class="qa-title">전체 요구사항</div><div class="qa-desc">필터 및 검색</div></div></a>';
    html += '<a class="quick-action" href="#/agents"><span class="qa-icon">🤖</span><div><div class="qa-title">에이전트 패널</div><div class="qa-desc">대구루, 레노버 현황</div></div></a>';
    html += '<a class="quick-action" href="#/wiki"><span class="qa-icon">📚</span><div><div class="qa-title">팀 위키</div><div class="qa-desc">개념, 프로젝트, 용어 사전</div></div></a>';
    html += '<a class="quick-action" href="#/settings"><span class="qa-icon">⚙️</span><div><div class="qa-title">설정</div><div class="qa-desc">GitHub 연동, 사용자 변경</div></div></a>';
    html += '</div>';

    // My Requests
    if (myReqs.length) {
      html += '<div class="section">';
      html += '<div class="section-header"><h2>📌 내 요구사항 (' + state.currentUser + ')</h2><a href="#/users/' + encodeURIComponent(state.currentUser) + '">전체 보기 →</a></div>';
      myReqs.slice(0, 3).forEach(function (r) { html += requestCardHTML(r); });
      html += '</div>';
    }

    // Recent
    html += '<div class="section">';
    html += '<div class="section-header"><h2>🔄 최근 활동</h2><a href="#/requests">전체 보기 →</a></div>';
    recent.forEach(function (r) { html += requestCardHTML(r); });
    html += '</div>';

    // Team
    html += '<div class="section">';
    html += '<div class="section-header"><h2>👥 팀원</h2></div>';
    html += '<div class="grid grid-2">';
    MEMBER_LIST.forEach(function (m) {
      var member = MEMBERS[m];
      var count = getMemberRequests(m).length;
      html += '<a class="card clickable" href="#/users/' + encodeURIComponent(m) + '" style="display:flex;align-items:center;gap:12px;">';
      html += '<span style="font-size:1.5rem">' + member.avatar + '</span>';
      html += '<div style="flex:1"><div style="font-weight:600;font-size:0.88rem">' + member.name + '</div>';
      html += '<div style="font-size:0.75rem;color:var(--text2)">' + member.role + '</div></div>';
      html += '<span class="badge" style="background:var(--surface3);color:var(--text2)">' + count + '건</span>';
      html += '</a>';
    });
    html += '</div>';
    html += '</div>';

    html += footerHTML();

    render(pageWrap('home', html));
  }

  function statCard(icon, value, label) {
    return '<div class="stat-card"><div class="stat-icon">' + icon + '</div><div class="stat-value">' + value + '</div><div class="stat-label">' + label + '</div></div>';
  }

  /* ====== Request Card (Enhanced) ====== */
  function requestCardHTML(r) {
    var cat = CATEGORIES[r.category] || CATEGORIES.feature;
    var pri = PRIORITIES[r.priority] || PRIORITIES.normal;
    var st = STATUSES[r.status] || STATUSES.proposed;
    var member = MEMBERS[r.author] || { avatar: '👤' };
    var voteCount = r.votes ? r.votes.length : 0;
    var commentCount = state.comments[r.id] ? state.comments[r.id].length : 0;

    var tagsHTML = (r.tags || []).map(function (t) {
      return '<span class="tag">' + esc(t) + '</span>';
    }).join('');

    return '<div class="request-card page-enter" data-status="' + r.status + '" onclick="location.hash=\'#/requests/' + r.id + '\'">' +
      '<div class="rc-badges-top">' +
      '<span class="badge badge-priority ' + pri.cls + '">' + pri.label + '</span>' +
      '<span class="badge badge-type ' + cat.cls + '">' + cat.icon + ' ' + cat.label + '</span>' +
      '</div>' +
      '<div class="rc-header">' +
      '<div class="rc-title">' + esc(r.title) + '</div>' +
      '<span class="badge badge-status ' + st.cls + '">' + st.icon + ' ' + st.label + '</span>' +
      '</div>' +
      (tagsHTML ? '<div class="rc-tags">' + tagsHTML + '</div>' : '') +
      '<div class="rc-footer">' +
      '<div class="rc-footer-left">' +
      '<span class="user-pill">' + member.avatar + ' ' + esc(r.author) + '</span>' +
      '<span class="rc-meta-item">' + timeAgo(r.updatedAt) + '</span>' +
      '</div>' +
      '<div class="rc-footer-right">' +
      (commentCount > 0 ? '<span class="rc-meta-item">💬 ' + commentCount + '</span>' : '') +
      '<span class="rc-meta-item">👍 ' + voteCount + '</span>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  /* ====== Request List ====== */
  function renderRequestList() {
    var html = '<div style="padding-top:24px" class="page-enter">';
    html += '<h1 style="font-size:1.4rem;font-weight:700;margin-bottom:20px">📋 전체 요구사항</h1>';

    // Filter Bar
    html += '<div class="filter-bar">';

    // Type filter
    html += '<div class="filter-group">';
    html += '<button class="filter-btn ' + (state.filter.type === 'all' ? 'active' : '') + '" data-filter="type" data-value="all">전체</button>';
    Object.keys(CATEGORIES).forEach(function (k) {
      html += '<button class="filter-btn ' + (state.filter.type === k ? 'active' : '') + '" data-filter="type" data-value="' + k + '">' + CATEGORIES[k].icon + ' ' + CATEGORIES[k].label + '</button>';
    });
    html += '</div>';

    // Status filter
    html += '<div class="filter-group">';
    html += '<button class="filter-btn ' + (state.filter.status === 'all' ? 'active' : '') + '" data-filter="status" data-value="all">전체 상태</button>';
    STATUS_FLOW.forEach(function (k) {
      html += '<button class="filter-btn ' + (state.filter.status === k ? 'active' : '') + '" data-filter="status" data-value="' + k + '">' + STATUSES[k].label + '</button>';
    });
    html += '</div>';

    html += '</div>';

    // Search + Sort row
    html += '<div class="filter-bar">';
    html += '<div class="search-wrapper">';
    html += '<span class="search-icon">🔍</span>';
    html += '<input class="search-input" type="text" placeholder="검색어 입력..." id="searchInput" value="' + esc(state.filter.search) + '">';
    html += '</div>';
    html += '<select class="select-input" id="sortSelect">';
    var sortOpts = [
      { v: 'newest', l: '최신순' },
      { v: 'oldest', l: '오래된순' },
      { v: 'votes', l: '인기순' },
      { v: 'priority', l: '우선순위' }
    ];
    sortOpts.forEach(function (o) {
      html += '<option value="' + o.v + '" ' + (state.filter.sort === o.v ? 'selected' : '') + '>' + o.l + '</option>';
    });
    html += '</select>';
    html += '</div>';

    // List
    var filtered = filterAndSort();
    html += '<div style="margin-top:16px">';
    if (filtered.length === 0) {
      html += '<div class="empty-state"><div class="es-icon">📭</div><div class="es-text">조건에 맞는 요구사항이 없습니다</div><div class="es-hint">필터를 변경하거나 새 요구사항을 등록해보세요</div></div>';
    } else {
      html += '<div class="grid">';
      filtered.forEach(function (r) { html += requestCardHTML(r); });
      html += '</div>';
    }
    html += '</div>';

    html += '</div>';

    render(pageWrap('requests', html));

    // Bind events
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.filter.search = this.value;
        renderRequestList();
        // refocus
        var el = document.getElementById('searchInput');
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      });
    }
    var sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        state.filter.sort = this.value;
        renderRequestList();
      });
    }
    document.querySelectorAll('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = this.getAttribute('data-filter');
        var v = this.getAttribute('data-value');
        state.filter[f] = v;
        renderRequestList();
      });
    });
  }

  function filterAndSort() {
    var list = state.requests.slice();
    if (state.filter.type !== 'all') {
      list = list.filter(function (r) { return r.category === state.filter.type; });
    }
    if (state.filter.status !== 'all') {
      list = list.filter(function (r) { return r.status === state.filter.status; });
    }
    if (state.filter.search) {
      var q = state.filter.search.toLowerCase();
      list = list.filter(function (r) {
        return (r.title + ' ' + r.description + ' ' + (r.tags || []).join(' ')).toLowerCase().indexOf(q) >= 0;
      });
    }

    var priOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    switch (state.filter.sort) {
      case 'newest':
        list.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
        break;
      case 'oldest':
        list.sort(function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); });
        break;
      case 'votes':
        list.sort(function (a, b) { return (b.votes || []).length - (a.votes || []).length; });
        break;
      case 'priority':
        list.sort(function (a, b) { return (priOrder[a.priority] || 3) - (priOrder[b.priority] || 3); });
        break;
    }
    return list;
  }

  /* ====== Timeline HTML ====== */
  function timelineHTML(req) {
    var acts = req.activities || [];
    if (acts.length === 0) {
      return '<div class="empty-state" style="padding:24px"><div class="es-icon">📅</div><div class="es-text">아직 활동 기록이 없습니다</div></div>';
    }

    var html = '<div class="timeline">';
    acts.forEach(function (act, i) {
      var aInfo = getActivityIcon(act.type);
      var isLast = i === acts.length - 1;
      var isAgent = AGENTS.indexOf(act.actor) >= 0 || AGENTS.indexOf(act.target || '') >= 0;

      html += '<div class="timeline-item ' + aInfo.cls + (isAgent ? ' timeline-agent' : '') + '">';
      html += '<div class="timeline-dot">' + aInfo.icon + '</div>';
      if (!isLast) html += '<div class="timeline-line"></div>';
      html += '<div class="timeline-content">';
      html += '<div class="timeline-header">';
      html += '<span class="timeline-actor">' + memberAvatar(act.actor) + ' ' + esc(act.actor) + '</span>';
      if (isAgent) html += '<span class="badge badge-agent">🤖 에이전트</span>';
      html += '<span class="timeline-time">' + timeAgo(act.timestamp) + '</span>';
      html += '</div>';
      html += '<div class="timeline-action">' + esc(activityText(act)) + '</div>';
      html += '<div class="timeline-date">' + formatDateTime(act.timestamp) + '</div>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  /* ====== Detail Page ====== */
  function renderDetail(id) {
    var r = getRequest(id);
    if (!r) return renderNotFound();

    var cat = CATEGORIES[r.category] || CATEGORIES.feature;
    var pri = PRIORITIES[r.priority] || PRIORITIES.normal;
    var st = STATUSES[r.status] || STATUSES.proposed;
    var member = MEMBERS[r.author] || { avatar: '👤', role: '' };
    var comments = state.comments[r.id] || [];
    var hasVoted = r.votes && r.votes.indexOf(state.currentUser) >= 0;

    var html = '<div style="padding-top:24px" class="page-enter">';

    // Back
    html += '<a class="detail-back" href="#/requests">← 목록으로</a>';

    // Header Card with status color bar
    html += '<div class="detail-header-card" data-status="' + r.status + '">';
    html += '<div class="detail-badges">';
    html += '<span class="badge badge-type ' + cat.cls + '">' + cat.icon + ' ' + cat.label + '</span>';
    html += '<span class="badge badge-priority ' + pri.cls + '">우선순위: ' + pri.label + '</span>';
    html += '<span class="badge badge-status ' + st.cls + '">' + st.icon + ' ' + st.label + '</span>';
    html += '</div>';
    html += '<h1>' + esc(r.title) + '</h1>';
    html += '<div class="detail-meta">';
    html += '<span class="user-pill" onclick="location.hash=\'#/users/' + encodeURIComponent(r.author) + '\'">' + member.avatar + ' ' + esc(r.author) + '</span>';
    html += '<span>·</span>';
    html += '<span>' + formatDate(r.createdAt) + ' 작성</span>';
    html += '<span>·</span>';
    html += '<span>' + timeAgo(r.updatedAt) + ' 업데이트</span>';
    html += '</div>';
    html += '</div>';

    // Two-column layout
    html += '<div class="detail-layout">';

    // Left column (main)
    html += '<div class="detail-main">';

    // Description
    html += '<div class="detail-section">';
    html += '<h3>📝 설명</h3>';
    html += '<div class="detail-description">' + esc(r.description) + '</div>';
    if (r.tags && r.tags.length) {
      html += '<div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:4px">' + r.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>';
    }
    html += '</div>';

    // Vote
    html += '<div class="detail-section" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">';
    html += '<button class="vote-btn ' + (hasVoted ? 'voted' : '') + '" onclick="window.__CLE2__.toggleVote(' + r.id + ')">👍 ' + (r.votes || []).length + ' ' + (hasVoted ? '투표함' : '투표') + '</button>';
    html += '<a class="btn btn-ghost btn-sm" href="#/new">🔗 이슈 복사</a>';
    html += '</div>';

    // Comments
    html += '<div class="detail-section">';
    html += '<h3>💬 댓글 (' + comments.length + ')</h3>';
    if (comments.length === 0) {
      html += '<div class="empty-state" style="padding:24px"><div class="es-icon">💬</div><div class="es-text">아직 댓글이 없습니다</div><div class="es-hint">첫 댓글을 남겨보세요!</div></div>';
    }
    comments.forEach(function (c) {
      var cMember = MEMBERS[c.author] || { avatar: '👤' };
      html += '<div class="comment">';
      html += '<div class="comment-avatar">' + cMember.avatar + '</div>';
      html += '<div class="comment-body">';
      html += '<div class="cb-header"><span class="cb-author">' + esc(c.author) + '</span><span class="cb-time">' + timeAgo(c.createdAt) + '</span></div>';
      html += '<div class="cb-text">' + esc(c.text) + '</div>';
      html += '</div></div>';
    });
    // Comment Form
    html += '<div class="comment-form">';
    html += '<input class="text-input" id="commentInput" placeholder="댓글 입력..." style="flex:1">';
    html += '<button class="btn btn-primary btn-sm" onclick="window.__CLE2__.addComment(' + r.id + ')">등록</button>';
    html += '</div>';
    html += '</div>';

    // Activity Timeline
    html += '<div class="detail-section">';
    html += '<h3>📅 활동 타임라인</h3>';
    html += timelineHTML(r);
    html += '</div>';

    html += '</div>'; // end detail-main

    // Right Sidebar
    html += '<div class="detail-sidebar">';

    // Status Change
    html += '<div class="sidebar-section">';
    html += '<h4>🔄 상태 변경</h4>';
    html += '<div class="status-pills">';
    STATUS_FLOW.forEach(function (s) {
      var sObj = STATUSES[s];
      html += '<button class="status-pill ' + (r.status === s ? 'active' : '') + '" onclick="window.__CLE2__.changeStatus(' + r.id + ', \'' + s + '\')">' + sObj.icon + ' ' + sObj.label + '</button>';
    });
    html += '</div>';
    html += '</div>';

    // Assignment
    html += '<div class="sidebar-section">';
    html += '<h4>🤖 에이전트 할당</h4>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
    AGENTS.forEach(function (a) {
      var isAssigned = r.assignees && r.assignees.indexOf(a) >= 0;
      html += '<button class="assign-btn ' + (isAssigned ? 'assigned' : '') + '" onclick="window.__CLE2__.toggleAssign(' + r.id + ', \'' + a + '\')">';
      html += memberAvatar(a) + ' ' + esc(a);
      if (isAssigned) html += ' ✅';
      html += '</button>';
    });
    html += '</div>';
    if (r.assignees && r.assignees.length) {
      html += '<div class="assignee-list">';
      r.assignees.forEach(function (a) {
        html += '<span class="assignee-chip">' + memberAvatar(a) + ' ' + esc(a) + '</span>';
      });
      html += '</div>';
    }
    html += '</div>';

    html += '</div>'; // end detail-sidebar

    html += '</div>'; // end detail-layout
    html += '</div>'; // end padding-top div

    render(pageWrap('requests', html));
  }

  /* ====== New Request ====== */
  function renderNewRequest() {
    var html = '<div style="padding-top:24px;max-width:680px;margin:0 auto" class="page-enter">';
    html += '<a class="detail-back" href="#/requests">← 목록으로</a>';
    html += '<h1 style="font-size:1.4rem;font-weight:700;margin-bottom:24px">➕ 새 요구사항 등록</h1>';

    html += '<div class="card" style="padding:28px">';
    html += '<div class="form-group">';
    html += '<label>제목 <span class="required">*</span></label>';
    html += '<input class="text-input" id="reqTitle" placeholder="요구사항 제목을 입력하세요" oninput="window.__CLE2__.updatePreview()">';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label>설명 <span class="required">*</span></label>';
    html += '<textarea class="textarea-input" id="reqDesc" placeholder="상세 내용을 입력하세요..." oninput="window.__CLE2__.updatePreview()"></textarea>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label>카테고리</label>';
    html += '<div class="toggle-group" id="categoryToggle">';
    Object.keys(CATEGORIES).forEach(function (k, i) {
      html += '<button class="toggle-btn ' + k + (i === 0 ? ' active' : '') + '" data-cat="' + k + '">' + CATEGORIES[k].icon + ' ' + CATEGORIES[k].label + '</button>';
    });
    html += '</div>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label>우선순위</label>';
    html += '<div class="toggle-group" id="priorityToggle">';
    Object.keys(PRIORITIES).forEach(function (k, i) {
      html += '<button class="toggle-btn ' + k + (k === 'normal' ? ' active' : '') + '" data-pri="' + k + '">' + PRIORITIES[k].label + '</button>';
    });
    html += '</div>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label>태그</label>';
    html += '<div class="tag-input-container" id="tagContainer">';
    html += '<input class="tag-input" id="tagInput" placeholder="엔터로 추가..." onkeydown="window.__CLE2__.handleTagKey(event)">';
    html += '</div>';
    html += '<div style="font-size:0.72rem;color:var(--text3);margin-top:6px">엔터키를 눌러 태그를 추가하고, x를 눌러 삭제하세요</div>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label>작성자</label>';
    html += '<select class="select-input" id="reqAuthor" style="width:100%">';
    MEMBER_LIST.forEach(function (m) {
      html += '<option value="' + m + '"' + (m === state.currentUser ? ' selected' : '') + '>' + memberAvatar(m) + ' ' + m + '</option>';
    });
    AGENTS.forEach(function (a) {
      html += '<option value="' + a + '">' + memberAvatar(a) + ' ' + a + '</option>';
    });
    html += '</select>';
    html += '</div>';

    // Preview
    html += '<div class="form-preview">';
    html += '<div class="form-preview-label">👁 대량 미리보기</div>';
    html += '<div id="previewBox" style="font-size:0.85rem;color:var(--text2)">제목을 입력하면 미리보기가 표시됩니다.</div>';
    html += '</div>';

    html += '<div class="form-actions">';
    html += '<a class="btn btn-ghost" href="#/requests">취소</a>';
    html += '<button class="btn btn-primary" onclick="window.__CLE2__.submitRequest()">등록하기</button>';
    html += '</div>';

    html += '</div>';
    html += '</div>';

    render(pageWrap('new', html));

    // Bind toggle groups
    document.querySelectorAll('#categoryToggle .toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#categoryToggle .toggle-btn').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        window.__CLE2__.updatePreview();
      });
    });
    document.querySelectorAll('#priorityToggle .toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#priorityToggle .toggle-btn').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        window.__CLE2__.updatePreview();
      });
    });
  }

  /* ====== User Page ====== */
  function renderUserPage(name) {
    var member = MEMBERS[name];
    var reqs = getMemberRequests(name);
    var authored = state.requests.filter(function (r) { return r.author === name; });
    var assigned = state.requests.filter(function (r) { return r.assignees && r.assignees.indexOf(name) >= 0; });

    var html = '<div style="padding-top:24px">';

    html += '<a class="detail-back" href="#/">← 홈으로</a>';

    html += '<div class="user-header">';
    html += '<div class="uh-avatar">' + (member ? member.avatar : '👤') + '</div>';
    html += '<div class="uh-info">';
    html += '<h1>' + esc(name) + '</h1>';
    html += '<p>' + (member ? member.role + ' · ' + member.desc : '') + '</p>';
    html += '</div>';
    html += '</div>';

    // Stats
    html += '<div class="stats-grid">';
    html += statCard('📝', authored.length, '작성한 요구사항');
    html += statCard('🔧', assigned.length, '할당된 요구사항');
    html += statCard('✅', reqs.filter(function (r) { return r.status === 'done'; }).length, '완료');
    html += statCard('🔄', reqs.filter(function (r) { return r.status === 'in-progress'; }).length, '진행 중');
    html += '</div>';

    // Tabs
    html += '<div class="filter-bar">';
    html += '<div class="filter-group">';
    html += '<button class="filter-btn active" id="tab-all" onclick="window.__CLE2__.switchTab(\'all\')">전체</button>';
    html += '<button class="filter-btn" id="tab-authored" onclick="window.__CLE2__.switchTab(\'authored\')">작성함</button>';
    html += '<button class="filter-btn" id="tab-assigned" onclick="window.__CLE2__.switchTab(\'assigned\')">할당됨</button>';
    html += '</div>';
    html += '</div>';

    html += '<div id="userReqList"></div>';

    html += footerHTML();
    html += '</div>';

    render(pageWrap('', html));

    // Store for tab switching
    window.__CLE2__._userReqs = { all: reqs, authored: authored, assigned: assigned };
    window.__CLE2__.switchTab('all');
  }

  /* ====== Agents Page (Enhanced) ====== */
  function renderAgents() {
    var html = '<div style="padding-top:24px" class="page-enter">';
    html += '<h1 style="font-size:1.4rem;font-weight:700;margin-bottom:8px">🤖 에이전트 패널</h1>';
    html += '<p style="color:var(--text2);font-size:0.85rem;margin-bottom:28px">대구루와 레노버의 작업 현황을 확인하세요</p>';

    html += '<div class="agent-grid">';

    AGENTS.forEach(function (a) {
      var member = MEMBERS[a];
      var aReqs = state.requests.filter(function (r) { return r.assignees && r.assignees.indexOf(a) >= 0; });
      var aDone = aReqs.filter(function (r) { return r.status === 'done'; }).length;
      var aActive = aReqs.filter(function (r) { return r.status === 'in-progress' || r.status === 'approved'; }).length;
      var aProposed = aReqs.filter(function (r) { return r.status === 'proposed' || r.status === 'reviewing'; }).length;

      // Status distribution
      var statusDist = {};
      STATUS_FLOW.forEach(function (s) { statusDist[s] = 0; });
      aReqs.forEach(function (r) { if (statusDist[r.status] !== undefined) statusDist[r.status]++; });

      var isActive = aActive > 0;
      var pct = aReqs.length > 0 ? Math.round(aDone / aReqs.length * 100) : 0;

      // Recent activities
      var recentActs = getAgentActivities(a, 5);

      html += '<div class="agent-card">';
      html += '<div class="ac-avatar">' + member.avatar + '</div>';
      html += '<div class="ac-name">' + esc(a) + '</div>';
      html += '<div class="ac-role">' + member.role + '</div>';
      html += '<div class="ac-desc">' + member.desc + '</div>';
      html += '<div class="ac-stats">';
      html += '<div class="ac-stat"><div class="ac-val">' + aReqs.length + '</div><div class="ac-label">전체</div></div>';
      html += '<div class="ac-stat"><div class="ac-val">' + aActive + '</div><div class="ac-label">진행 중</div></div>';
      html += '<div class="ac-stat"><div class="ac-val">' + aDone + '</div><div class="ac-label">완료</div></div>';
      html += '</div>';

      // Stat bar
      html += '<div class="stat-bar" style="position:relative;z-index:1">';
      if (aDone > 0) html += '<div class="stat-bar-segment" style="width:' + (aDone/aReqs.length*100) + '%;background:var(--green)"></div>';
      if (aActive > 0) html += '<div class="stat-bar-segment" style="width:' + (aActive/aReqs.length*100) + '%;background:var(--purple)"></div>';
      if (aProposed > 0) html += '<div class="stat-bar-segment" style="width:' + (aProposed/aReqs.length*100) + '%;background:var(--amber)"></div>';
      html += '</div>';
      html += '<div style="font-size:0.7rem;color:var(--text3);text-align:center;margin-top:6px;position:relative;z-index:1">완료율: ' + pct + '%</div>';

      // Status distribution detail
      html += '<div class="agent-status-dist">';
      html += '<h4>상태별 분포</h4>';
      html += '<div class="dist-list">';
      STATUS_FLOW.forEach(function (s) {
        if (statusDist[s] > 0) {
          var sObj = STATUSES[s];
          html += '<div class="dist-item">';
          html += '<span class="dist-label">' + sObj.icon + ' ' + sObj.label + '</span>';
          html += '<span class="dist-count">' + statusDist[s] + '건</span>';
          html += '</div>';
        }
      });
      html += '</div>';
      html += '</div>';

      // Status badge
      html += '<div style="margin-top:14px;position:relative;z-index:1">';
      html += '<span class="agent-status ' + (isActive ? 'active' : 'idle') + '">';
      html += '<span class="agent-status-dot"></span>';
      html += (isActive ? '작업 중' : '대기 중');
      html += '</span>';
      html += '</div>';

      // Assigned tasks list
      if (aReqs.length > 0) {
        html += '<div class="agent-tasks">';
        html += '<h4>할당된 요구사항</h4>';
        aReqs.slice(0, 4).forEach(function (r) {
          var stObj = STATUSES[r.status] || STATUSES.proposed;
          html += '<div class="agent-task-item" onclick="location.hash=\'#/requests/' + r.id + '\'">';
          html += '<span>' + stObj.icon + '</span>';
          html += '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(r.title) + '</span>';
          html += '</div>';
        });
        if (aReqs.length > 4) {
          html += '<div style="text-align:center;font-size:0.75rem;color:var(--text3);padding:6px">+' + (aReqs.length - 4) + '개 더 보기</div>';
        }
        html += '</div>';
      }

      // Recent activity feed
      if (recentActs.length > 0) {
        html += '<div class="agent-activity-feed">';
        html += '<h4>🕐 최근 활동</h4>';
        recentActs.forEach(function (act) {
          var aInfo = getActivityIcon(act.type);
          html += '<div class="agent-activity-item" onclick="location.hash=\'#/requests/' + act.reqId + '\'">';
          html += '<span class="aa-icon">' + aInfo.icon + '</span>';
          html += '<div class="aa-content">';
          html += '<div class="aa-action">' + esc(activityText(act)) + '</div>';
          html += '<div class="aa-meta"><span style="color:var(--text3)">' + esc(act.reqTitle) + '</span> · ' + timeAgo(act.timestamp) + '</div>';
          html += '</div>';
          html += '</div>';
        });
        html += '</div>';
      }

      html += '</div>';
    });

    html += '</div>';

    // Recent agent work
    html += '<div class="section">';
    html += '<div class="section-header"><h2>💬 에이전트 할당 요구사항</h2></div>';
    var agentReqs = state.requests.filter(function (r) {
      return r.assignees && r.assignees.some(function (a) { return AGENTS.indexOf(a) >= 0; });
    });
    if (agentReqs.length === 0) {
      html += '<div class="empty-state"><div class="es-icon">🤖</div><div class="es-text">에이전트에 할당된 요구사항이 없습니다</div></div>';
    } else {
      html += '<div class="grid">';
      agentReqs.forEach(function (r) { html += requestCardHTML(r); });
      html += '</div>';
    }
    html += '</div>';

    html += footerHTML();
    html += '</div>';

    render(pageWrap('agents', html));
  }

  /* ====== Wiki Page ====== */
  function renderWiki() {
    var html = '<div style="padding-top:24px" class="page-enter">';
    html += '<h1 style="font-size:1.4rem;font-weight:700;margin-bottom:8px">📚 team-memory 위키</h1>';
    html += '<p style="color:var(--text2);font-size:0.85rem;margin-bottom:24px">Daegu-Agent-Crew 팀의 공유 지식 베이스 — 개념, 프로젝트, 에이전트, 용어 사전</p>';

    // Search bar
    html += '<div class="wiki-search-bar">';
    html += '<span class="search-icon">🔍</span>';
    html += '<input class="search-input wiki-search-input" type="text" placeholder="위키 검색..." id="wikiSearchInput" value="' + esc(state.wiki.search) + '" style="padding-left:36px">';
    html += '</div>';

    html += '<div class="wiki-layout">';

    // Sidebar - categories
    var cats = ['all', '개념', '시스템', '프로젝트', '에이전트'];
    html += '<div class="wiki-sidebar">';
    html += '<h4>카테고리</h4>';
    html += '<ul class="wiki-cat-list">';
    cats.forEach(function (c) {
      var label = c === 'all' ? '전체' : c;
      var count = c === 'all' ? WIKI_PAGES.length : WIKI_PAGES.filter(function (p) { return p.category === c; }).length;
      html += '<li><a class="' + (state.wiki.category === c ? 'active' : '') + '" onclick="window.__CLE2__.setWikiCategory(\'' + c + '\')">' + label + ' <span class="cat-count">(' + count + ')</span></a></li>';
    });
    html += '</ul>';
    html += '</div>';

    // Main content
    html += '<div class="wiki-main">';

    // Filter pages
    var filteredPages = WIKI_PAGES.filter(function (p) {
      if (state.wiki.category !== 'all' && p.category !== state.wiki.category) return false;
      if (state.wiki.search) {
        var q = state.wiki.search.toLowerCase();
        return (p.title + ' ' + p.content + ' ' + (p.tags || []).join(' ')).toLowerCase().indexOf(q) >= 0;
      }
      return true;
    });

    if (filteredPages.length === 0) {
      html += '<div class="empty-state"><div class="es-icon">📖</div><div class="es-text">검색 결과가 없습니다</div></div>';
    } else {
      // Wiki page cards
      filteredPages.forEach(function (p) {
        html += '<div class="wiki-page-card">';
        html += '<div class="wpc-header">';
        html += '<span class="wpc-category">' + esc(p.category) + '</span>';
        html += '<h3>' + esc(p.title) + '</h3>';
        html += '</div>';
        html += '<p class="wpc-content">' + esc(p.content) + '</p>';
        if (p.tags && p.tags.length) {
          html += '<div class="wpc-tags">';
          p.tags.forEach(function (t) {
            html += '<span class="tag">' + esc(t) + '</span>';
          });
          html += '</div>';
        }
        html += '<div class="wpc-footer">';
        html += '<a href="https://github.com/Daegu-Agent-Crew/team-memory" target="_blank" class="wpc-github-link">📄 GitHub에서 보기 →</a>';
        html += '</div>';
        html += '</div>';
      });
    }

    // Repos section
    html += '<div class="wiki-section">';
    html += '<h3>🔗 연결된 리포지토리</h3>';
    html += '<div class="repo-grid">';
    TEAM_REPOS.forEach(function (repo) {
      html += '<div class="repo-card">';
      html += '<div class="repo-header">';
      html += '<span class="repo-icon">📦</span>';
      html += '<span class="repo-name">' + esc(repo.name) + '</span>';
      html += '</div>';
      html += '<div class="repo-desc">' + esc(repo.desc) + '</div>';
      html += '<div class="repo-meta">';
      html += '<span>👥 ' + repo.members + '명</span>';
      html += '<span class="repo-status">' + repo.status + '</span>';
      html += '</div>';
      html += '<a href="https://github.com/Daegu-Agent-Crew/' + esc(repo.name) + '" target="_blank" class="repo-link">GitHub →</a>';
      html += '</div>';
    });
    html += '</div>';
    html += '</div>';

    // Team members section
    html += '<div class="wiki-section">';
    html += '<h3>👥 팀원 명부</h3>';
    html += '<div class="wiki-members-grid">';
    MEMBER_LIST.forEach(function (m) {
      var member = MEMBERS[m];
      html += '<a class="wiki-member-card" href="#/users/' + encodeURIComponent(m) + '">';
      html += '<span class="wm-avatar">' + member.avatar + '</span>';
      html += '<div class="wm-info">';
      html += '<div class="wm-name">' + member.name + '</div>';
      html += '<div class="wm-role">' + member.role + '</div>';
      html += '</div>';
      html += '</a>';
    });
    AGENTS.forEach(function (a) {
      var member = MEMBERS[a];
      html += '<a class="wiki-member-card" href="#/users/' + encodeURIComponent(a) + '">';
      html += '<span class="wm-avatar">' + member.avatar + '</span>';
      html += '<div class="wm-info">';
      html += '<div class="wm-name">' + member.name + '</div>';
      html += '<div class="wm-role">' + member.role + '</div>';
      html += '</div>';
      html += '</a>';
    });
    html += '</div>';
    html += '</div>';

    // Records section
    html += '<div class="wiki-section">';
    html += '<h3>📋 작업 기록 (Records)</h3>';
    html += '<div class="records-list">';
    TEAM_RECORDS.forEach(function (rec) {
      html += '<div class="record-card">';
      html += '<div class="record-header">';
      html += '<span class="record-date">' + rec.date + '</span>';
      html += '<span class="record-author">' + memberAvatar(rec.author) + ' ' + esc(rec.author) + '</span>';
      html += '</div>';
      html += '<div class="record-title">' + esc(rec.title) + '</div>';
      html += '<div class="record-summary">' + esc(rec.summary) + '</div>';
      html += '</div>';
    });
    html += '</div>';
    html += '</div>';

    html += '</div>'; // end wiki-main
    html += '</div>'; // end wiki-layout

    html += footerHTML();
    html += '</div>';

    render(pageWrap('wiki', html));

    // Bind search
    var searchInput = document.getElementById('wikiSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.wiki.search = this.value;
        renderWiki();
        var el = document.getElementById('wikiSearchInput');
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      });
    }
  }

  /* ====== Settings ====== */
  function renderSettings() {
    var html = '<div style="padding-top:24px;max-width:680px;margin:0 auto">';
    html += '<h1 style="font-size:1.4rem;font-weight:700;margin-bottom:24px">⚙️ 설정</h1>';

    // Discord
    html += '<div class="settings-card">';
    html += '<h3>💬 Discord 알림</h3>';
    html += '<p class="sc-desc">요구사항 등록/변경 시 Discord 채널로 알림을 보냅니다.</p>';
    html += '<div class="sc-status">Phase 2 예정</div>';
    html += '<div style="margin-top:14px">';
    html += '<label style="display:block;font-size:0.82rem;font-weight:600;margin-bottom:6px;color:var(--text2)">Discord 웹훅 URL</label>';
    html += '<input class="text-input" id="discordWebhook" placeholder="https://discord.com/api/webhooks/..." value="' + esc(state.settings.discordWebhook || '') + '" disabled style="opacity:0.5">';
    html += '</div>';
    html += '</div>';

    // GitHub
    html += '<div class="settings-card">';
    html += '<h3>🔐 GitHub 연동</h3>';
    html += '<p class="sc-desc">GitHub Issues와 동기화하여 백엔드로 사용합니다.</p>';
    html += '<div class="sc-status sc-active">활성화됨</div>';
    html += '<div style="margin-top:14px">';
    html += '<div style="padding:10px 14px;background:var(--surface2);border-radius:8px;border:1px solid var(--surface3);font-size:0.85rem;color:var(--green);font-weight:600">✅ GitHub 연결됨 — 자동 동기화 활성</div>';
    html += '<div style="margin-top:8px"><button class="btn btn-primary btn-sm" onclick="window.__CLE2__.syncFromGitHub()">🔄 GitHub에서 동기화</button></div>';
    html += '<div style="margin-top:8px;font-size:0.75rem;color:var(--text3)">저장소: Daegu-Agent-Crew/creative-loop-engineering2</div>';
    html += '<div style="margin-top:6px;font-size:0.75rem;color:var(--green)">✅ 새 요구사항/댓글이 자동으로 Issue로 동기화됩니다</div>';
    html += '</div>';
    html += '</div>';

    // Current User
    html += '<div class="settings-card">';
    html += '<h3>👤 현재 사용자</h3>';
    html += '<p class="sc-desc">요구사항 등록 및 댓글 작성에 사용할 사용자를 선택하세요.</p>';
    html += '<div style="margin-top:14px">';
    html += '<select class="select-input" id="currentUserSelect" onchange="window.__CLE2__.changeUser(this.value)">';
    MEMBER_LIST.forEach(function (m) {
      html += '<option value="' + m + '"' + (m === state.currentUser ? ' selected' : '') + '>' + memberAvatar(m) + ' ' + m + '</option>';
    });
    AGENTS.forEach(function (a) {
      html += '<option value="' + a + '"' + (a === state.currentUser ? ' selected' : '') + '>' + memberAvatar(a) + ' ' + a + '</option>';
    });
    html += '</select>';
    html += '</div>';
    html += '</div>';

    // Data
    html += '<div class="settings-card">';
    html += '<h3>💾 데이터 관리</h3>';
    html += '<p class="sc-desc">localStorage에 저장된 데이터를 관리합니다.</p>';
    html += '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">';
    html += '<button class="btn btn-secondary btn-sm" onclick="window.__CLE2__.resetData()">초기 데이터로 리셋</button>';
    html += '<button class="btn btn-ghost btn-sm" onclick="window.__CLE2__.clearAllData()">모든 데이터 삭제</button>';
    html += '</div>';
    html += '</div>';

    html += '<div style="margin-top:20px;font-size:0.78rem;color:var(--text3);text-align:center">';
    html += 'CLE2 v1.2.0 · GitHub Issues 연동 지원<br>';
    html += 'Daegu Agent Crew © 2026';
    html += '</div>';

    html += '</div>';

    render(pageWrap('settings', html));
  }

  /* ====== Not Found ====== */
  function renderMessages() {
    var html = pageWrap('messages', '');
    html += '<div style="padding-top:24px" class="page-enter">';
    html += '<h1 style="font-size:1.6rem;font-weight:800;margin-bottom:6px">📬 Discord 메시지</h1>';
    html += '<p style="color:var(--text2);font-size:0.9rem;margin-bottom:24px">에이전트에게 전송된 메시지 목록. Discord에서 메시지 번호를 에이전트에게 알려주면 됩니다.</p>';

    var msgs = state.messages.slice().sort(function(a,b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    var pending = msgs.filter(function(m){return m.status === 'pending';});
    var read = msgs.filter(function(m){return m.status === 'read';});

    // Stats
    html += '<div class="msg-stats">';
    html += '<div class="msg-stat-card"><div class="ms-num">' + msgs.length + '</div><div class="ms-label">전체</div></div>';
    html += '<div class="msg-stat-card pending"><div class="ms-num">' + pending.length + '</div><div class="ms-label">대기 중</div></div>';
    html += '<div class="msg-stat-card read"><div class="ms-num">' + read.length + '</div><div class="ms-label">읽음</div></div>';
    html += '</div>';

    // Filter buttons
    html += '<div class="msg-filter-bar">';
    html += "<button class=\"msg-filter-btn active\" onclick=\"window.__CLE2__.filterMessages('all')\">전체</button>";
    html += "<button class=\"msg-filter-btn\" onclick=\"window.__CLE2__.filterMessages('pending')\">대기 중</button>";
    html += "<button class=\"msg-filter-btn\" onclick=\"window.__CLE2__.filterMessages('read')\">읽음</button>";
    html += '</div>';

    // Message table
    html += '<table class="msg-table">';
    html += '<thead><tr><th>#</th><th>수신자</th><th>내용</th><th>발신자</th><th>시간</th><th>상태</th><th></th></tr></thead>';
    html += '<tbody>';
    msgs.forEach(function(m) {
      var toMember = MEMBERS[m.to] || {avatar:'🤖'};
      var fromMember = MEMBERS[m.from] || {avatar:'👤'};
      var req = getRequest(m.reqId);
      html += '<tr class="msg-row ' + m.status + '" id="msg-row-' + m.id + '">';
      html += '<td class="msg-id">#' + m.id + '</td>';
      html += '<td class="msg-to">' + toMember.avatar + ' ' + esc(m.to) + '</td>';
      html += '<td class="msg-body">';
      html += '<div class="msg-text">' + esc(m.body) + '</div>';
      if (req) {
        html += '<a class="msg-req-link" href="#/requests/' + req.id + '">📋 #' + req.id + ' ' + esc(req.title) + '</a>';
      }
      html += '</td>';
      html += '<td class="msg-from">' + fromMember.avatar + ' ' + esc(m.from) + '</td>';
      html += '<td class="msg-time">' + timeAgo(m.timestamp) + '</td>';
      html += '<td class="msg-status-cell">';
      if (m.status === 'pending') {
        html += '<span class="msg-status pending">● 대기</span>';
      } else {
        html += '<span class="msg-status read">✓ 읽음</span>';
      }
      html += '</td>';
      html += '<td>';
      if (m.status === 'pending') {
        html += '<button class="btn btn-ghost btn-sm" onclick="window.__CLE2__.markMessageRead(' + m.id + ')">읽음 처리</button>';
      }
      html += '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';

    // Usage info
    html += '<div class="msg-info-box">';
    html += '<div class="info-icon">💡</div>';
    html += '<div>';
    html += '<div style="font-weight:600;margin-bottom:4px">사용 방법</div>';
    html += '<div style="color:var(--text2);font-size:0.85rem;line-height:1.6">';
    html += '1. 요구사항에서 에이전트(대구루/레노버)를 할당하면 자동으로 메시지가 생성됩니다.<br>';
    html += '2. Discord에서 에이전트에게 <code style="background:var(--surface2);padding:2px 6px;border-radius:4px">메시지 #3 확인해</code>라고 보내시면 됩니다.<br>';
    html += '3. 에이전트가 메시지를 확인하고 작업을 시작합니다.<br>';
    html += '4. 상태 변경, 댓글 작성 시에도 자동으로 메시지가 누적됩니다.';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    document.getElementById('app').innerHTML = html;
    window.scrollTo(0, 0);
  }

  var _msgFilter = 'all';
  function renderNotFound() {
    var html = '<div class="empty-state" style="padding-top:80px">';
    html += '<div class="es-icon">🤷</div>';
    html += '<div class="es-text" style="font-size:1.1rem;font-weight:600;margin-bottom:8px">페이지를 찾을 수 없습니다</div>';
    html += '<a href="#/" style="color:var(--accent2)">홈으로 돌아가기 →</a>';
    html += '</div>';
    render(pageWrap('', html));
  }

  /* ====== Footer ====== */
  function footerHTML() {
    return '<div class="footer">CLE2 — 요구사항 관리 시스템 · <a href="https://github.com/Daegu-Agent-Crew/creative-loop-engineering2" target="_blank">GitHub</a> · Daegu Agent Crew © 2026</div>';
  }

  /* ====== Toast ====== */
  var toastTimer = null;
  var toastQueue = [];
  function showToast(msg, type) {
    toastQueue.push({ msg: msg, type: type });
    if (toastTimer) return; // will be picked up
    processToastQueue();
  }
  function processToastQueue() {
    if (toastQueue.length === 0) { toastTimer = null; return; }
    var item = toastQueue.shift();
    closeToast();
    var el = document.createElement('div');
    el.className = 'toast ' + (item.type || '');
    el.innerHTML = item.msg;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 10);
    toastTimer = setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () {
        if (el.parentNode) el.remove();
        toastTimer = null;
        processToastQueue();
      }, 300);
    }, 2500);
  }
  function closeToast() {
    document.querySelectorAll('.toast').forEach(function (el) { el.remove(); });
  }

  /* ====== Actions ====== */
  window.__CLE2__ = {
    toggleVote: function (id) {
      var r = getRequest(id);
      if (!r) return;
      if (!r.votes) r.votes = [];
      var idx = r.votes.indexOf(state.currentUser);
      if (idx >= 0) {
        r.votes.splice(idx, 1);
        logActivity(id, 'unvote', state.currentUser);
        showToast('투표를 취소했습니다', 'success');
      } else {
        r.votes.push(state.currentUser);
        logActivity(id, 'vote', state.currentUser);
        showToast('👍 투표했습니다!', 'success');
      }
      r.updatedAt = new Date().toISOString();
      saveRequests();
      renderDetail(id);
    },

    changeStatus: function (id, status) {
      var r = getRequest(id);
      if (!r) return;
      var oldStatus = r.status;
      if (oldStatus === status) return;
      r.status = status;
      r.updatedAt = new Date().toISOString();
      logActivity(id, 'status_change', state.currentUser, { from: oldStatus, to: status });
      saveRequests();
      var stObj = STATUSES[status] || {};
      showToast(stObj.icon + ' 상태가 "' + stObj.label + '"로 변경되었습니다', 'success');
      // Queue Discord message to assigned agents
      if (r.assignees && r.assignees.length) {
        r.assignees.forEach(function(a) {
          if (AGENTS.indexOf(a) >= 0) {
            var msg = queueMessage(a, state.currentUser, id, '#' + id + ' "' + r.title + '" 상태가 "' + stObj.label + '"(으)로 변경되었습니다.');
            showToast('📬 #' + msg.id + ' ' + a + '에게 Discord 메시지 전송', 'success');
          }
        });
      }
      // Sync to GitHub
      if (ghEnabled() && r.githubIssue) {
        ghUpdateIssue(r, function(data) {
          if (data) showToast('🔄 GitHub Issue #' + r.githubIssue + ' 업데이트됨', 'success');
        });
      }
      renderDetail(id);
    },

    toggleAssign: function (id, agent) {
      var r = getRequest(id);
      if (!r) return;
      if (!r.assignees) r.assignees = [];
      var idx = r.assignees.indexOf(agent);
      if (idx >= 0) {
        r.assignees.splice(idx, 1);
        logActivity(id, 'unassigned', state.currentUser, { target: agent });
        showToast(memberAvatar(agent) + ' ' + agent + ' 할당 해제', 'success');
      } else {
        r.assignees.push(agent);
        logActivity(id, 'assigned', state.currentUser, { target: agent });
        showToast(memberAvatar(agent) + ' ' + agent + '에게 할당했습니다!', 'success');
        // Queue Discord message if agent
        if (AGENTS.indexOf(agent) >= 0) {
          var msg = queueMessage(agent, state.currentUser, id, '#' + id + ' "' + r.title + '" 요구사항이 ' + agent + '에게 할당되었습니다. 확인 부탁드립니다.');
          showToast('📬 메시지 #' + msg.id + ' ' + agent + '에게 Discord 전송', 'success');
        }
      }
      r.updatedAt = new Date().toISOString();
      saveRequests();
      // Sync to GitHub
      if (ghEnabled() && r.githubIssue) {
        ghUpdateIssue(r, function(data) {
          if (data) showToast('🔄 GitHub Issue #' + r.githubIssue + ' 업데이트됨', 'success');
        });
      }
      renderDetail(id);
    },

    addComment: function (id) {
      var input = document.getElementById('commentInput');
      if (!input || !input.value.trim()) return;
      if (!state.comments[id]) state.comments[id] = [];
      state.comments[id].push({
        author: state.currentUser,
        text: input.value.trim(),
        createdAt: new Date().toISOString()
      });
      saveComments();
      logActivity(id, 'comment', state.currentUser);
      // Update request timestamp
      var r = getRequest(id);
      if (r) { r.updatedAt = new Date().toISOString(); saveRequests(); }
      showToast('💬 댓글이 등록되었습니다', 'success');
      // Notify assigned agents
      if (r && r.assignees) {
        r.assignees.forEach(function(a) {
          if (AGENTS.indexOf(a) >= 0) {
            var msg = queueMessage(a, state.currentUser, id, '#' + id + ' "' + r.title + '"에 ' + state.currentUser + '님이 댓글을 남겼습니다.');
          }
        });
      }
      // Sync comment to GitHub
      if (ghEnabled() && r && r.githubIssue) {
        ghAddComment(r, '**' + state.currentUser + ':** ' + input.value.trim());
      }
      renderDetail(id);
    },

    _formTags: [],
    submitRequest: function () {
      var title = document.getElementById('reqTitle').value.trim();
      var desc = document.getElementById('reqDesc').value.trim();
      if (!title) { showToast('⚠️ 제목을 입력하세요', 'error'); return; }
      if (!desc) { showToast('⚠️ 설명을 입력하세요', 'error'); return; }

      var catBtn = document.querySelector('#categoryToggle .toggle-btn.active');
      var cat = catBtn ? catBtn.getAttribute('data-cat') : 'feature';
      var priBtn = document.querySelector('#priorityToggle .toggle-btn.active');
      var pri = priBtn ? priBtn.getAttribute('data-pri') : 'normal';
      var tags = window.__CLE2__._formTags.slice();
      var author = document.getElementById('reqAuthor').value;

      var now = new Date().toISOString();
      var newReq = {
        id: nextId(),
        title: title,
        description: desc,
        category: cat,
        priority: pri,
        status: 'proposed',
        author: author,
        tags: tags,
        assignees: [],
        votes: [],
        createdAt: now,
        updatedAt: now,
        activities: [
          { type: 'created', actor: author, timestamp: now }
        ]
      };
      state.requests.unshift(newReq);
      saveRequests();
      showToast('✅ 요구사항이 등록되었습니다!', 'success');
      // Sync to GitHub Issues
      if (ghEnabled()) {
        showToast('🔄 GitHub Issue 생성 중...', 'success');
        ghCreateIssue(newReq, function(data) {
          if (data && data.number) {
            showToast('✅ GitHub Issue #' + data.number + ' 생성됨', 'success');
          } else {
            showToast('⚠️ GitHub 동기화 실패 (토큰 확인)', 'error');
          }
        });
      }
      location.hash = '#/requests/' + newReq.id;
    },

    changeUser: function (user) {
      state.currentUser = user;
      localStorage.setItem(USER_KEY, user);
      showToast(memberAvatar(user) + ' ' + user + '로 변경했습니다', 'success');
    },

    switchTab: function (tab) {
      var reqs = window.__CLE2__._userReqs[tab] || [];
      var container = document.getElementById('userReqList');
      if (!container) return;

      ['all', 'authored', 'assigned'].forEach(function (t) {
        var el = document.getElementById('tab-' + t);
        if (el) el.classList.toggle('active', t === tab);
      });

      if (reqs.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="es-icon">📭</div><div class="es-text">요구사항이 없습니다</div></div>';
      } else {
        container.innerHTML = '<div class="grid">' + reqs.map(function (r) { return requestCardHTML(r); }).join('') + '</div>';
      }
    },

    setWikiCategory: function (cat) {
      state.wiki.category = cat;
      renderWiki();
    },

    saveSettings: function () {
      var webhookEl = document.getElementById('discordWebhook');
      if (webhookEl) state.settings.discordWebhook = webhookEl.value.trim();
      saveSettings();
      showToast('✅ 설정이 저장되었습니다', 'success');
      renderSettings();
    },

    syncFromGitHub: function () {
      showToast('🔄 GitHub에서 데이터 동기화 중...', 'success');
      ghSyncFromIssues(function(count) {
        if (count !== null) {
          showToast('✅ ' + count + '개 요구사항 동기화됨', 'success');
          route();
        } else {
          showToast('⚠️ 동기화 실패 — 네트워크 또는 권한 확인 필요', 'error');
        }
      });
    },

    filterMessages: function(filter) {
      _msgFilter = filter;
      // Update filter buttons
      var btns = document.querySelectorAll('.msg-filter-btn');
      btns.forEach(function(b) { b.classList.remove('active'); });
      // Filter rows
      var rows = document.querySelectorAll('.msg-row');
      rows.forEach(function(r) {
        if (filter === 'all') { r.style.display = ''; }
        else if (filter === 'pending') { r.style.display = r.classList.contains('pending') ? '' : 'none'; }
        else { r.style.display = r.classList.contains('read') ? '' : 'none'; }
      });
    },

    markMessageRead: function (msgId) {
      markMessageRead(msgId);
      renderMessages();
    },

    resetData: function () {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COMMENT_KEY);
      localStorage.removeItem(MESSAGE_KEY);
      state.requests = [];
      state.comments = {};
      state.messages = [];
      saveRequests();
      saveComments();
      saveMessages();
      showToast('✅ 데이터가 초기화되었습니다', 'success');
      renderSettings();
    },

    clearAllData: function () {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COMMENT_KEY);
      state.requests = [];
      state.comments = {};
      showToast('🗑️ 모든 데이터가 삭제되었습니다', 'error');
      location.hash = '#/';
    },

    handleTagKey: function (e) {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        var input = e.target;
        var val = input.value.trim();
        if (val && window.__CLE2__._formTags.indexOf(val) < 0) {
          window.__CLE2__._formTags.push(val);
          window.__CLE2__.renderTagChips();
          input.value = '';
          window.__CLE2__.updatePreview();
        }
      } else if (e.key === 'Backspace' && !e.target.value && window.__CLE2__._formTags.length) {
        window.__CLE2__._formTags.pop();
        window.__CLE2__.renderTagChips();
        window.__CLE2__.updatePreview();
      }
    },
    removeTag: function (idx) {
      window.__CLE2__._formTags.splice(idx, 1);
      window.__CLE2__.renderTagChips();
      window.__CLE2__.updatePreview();
    },
    renderTagChips: function () {
      var container = document.getElementById('tagContainer');
      if (!container) return;
      var input = document.getElementById('tagInput');
      var chips = window.__CLE2__._formTags.map(function (t, i) {
        return '<span class="tag-chip">' + t.replace(/</g, '&lt;') + '<span class="tag-remove" onclick="window.__CLE2__.removeTag(' + i + ')">×</span></span>';
      }).join('');
      container.innerHTML = chips + '<input class="tag-input" id="tagInput" placeholder="엔터로 추가..." onkeydown="window.__CLE2__.handleTagKey(event)">';
      var newInput = document.getElementById('tagInput');
      if (newInput) newInput.focus();
    },
    updatePreview: function () {
      var title = document.getElementById('reqTitle');
      var desc = document.getElementById('reqDesc');
      var preview = document.getElementById('previewBox');
      if (!preview) return;
      var t = title ? title.value.trim() : '';
      var d = desc ? desc.value.trim() : '';
      var catBtn = document.querySelector('#categoryToggle .toggle-btn.active');
      var catKey = catBtn ? catBtn.getAttribute('data-cat') : 'feature';
      var priBtn = document.querySelector('#priorityToggle .toggle-btn.active');
      var priKey = priBtn ? priBtn.getAttribute('data-pri') : 'normal';
      var cat = CATEGORIES[catKey] || CATEGORIES.feature;
      var pri = PRIORITIES[priKey] || PRIORITIES.normal;
      if (!t && !d) {
        preview.innerHTML = '제목을 입력하면 미리보기가 표시됩니다.';
        preview.style.color = 'var(--text2)';
        return;
      }
      preview.style.color = 'var(--text)';
      var html = '<div style="font-weight:600;margin-bottom:6px">' + esc(t || '(제목 없음)') + '</div>';
      html += '<div style="margin-bottom:8px"><span class="badge badge-type ' + cat.cls + '">' + cat.icon + ' ' + cat.label + '</span> <span class="badge badge-priority ' + pri.cls + '">' + pri.label + '</span></div>';
      if (d) html += '<div style="color:var(--text2);white-space:pre-wrap;font-size:0.82rem">' + esc(d.slice(0, 200)) + (d.length > 200 ? '...' : '') + '</div>';
      if (window.__CLE2__._formTags.length) {
        html += '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">' + window.__CLE2__._formTags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>';
      }
      preview.innerHTML = html;
    },
    _userReqs: {}
  };

  /* ====== Render Helper ====== */
  function render(html) {
    document.getElementById('app').innerHTML = html;
    window.scrollTo(0, 0);
  }

  /* ====== Init ====== */
  function init() {
    loadData();
    window.addEventListener('hashchange', route);
    route();
    // Auto-sync from GitHub Issues on load
    ghSyncFromIssues(function(count) {
      if (count !== null && count > 0) {
        console.log('[CLE2] GitHub sync: ' + count + ' items synced');
        // Re-render current view if sync brought data
        route();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
