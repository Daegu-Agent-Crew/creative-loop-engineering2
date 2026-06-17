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
  var DATA_VERSION = 'v3';
  var VERSION_KEY = 'cle2_data_version';

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

  /* ====== Dummy Data ====== */
  var DUMMY_REQUESTS = [
    {
      id: 1, title: '삼체 EP002 대본 필요', description: 'EP002 분량의 대본 초안이 필요합니다.\n원작 소설 2화 기반으로, 웹툰 분할에 맞게 장면 구성해주세요.\n\n필요 항목:\n- 장면별 대사\n- 연출 메모\n- 감정선 표시',
      category: 'feature', priority: 'high', status: 'in-progress',
      author: 'sfex11', tags: ['삼체만화', 'EP002', '대본'],
      assignees: ['eugene'], votes: ['normalkim', 'junteken'],
      createdAt: '2026-06-15T09:30:00', updatedAt: '2026-06-17T14:00:00'
    },
    {
      id: 2, title: 'CLE Phase 2 OAuth 연동', description: 'GitHub OAuth를 연동하여 사용자 로그인 기능을 추가해야 합니다.\nPhase 2 핵심 기능 중 하나입니다.\n\n- GitHub OAuth App 등록\n- access token 관리\n- 사용자 세션 유지',
      category: 'feature', priority: 'urgent', status: 'approved',
      author: 'sfex11', tags: ['CLE', 'OAuth', 'Phase2'],
      assignees: ['대구루'], votes: ['eugene', 'normalkim', 'junteken'],
      createdAt: '2026-06-14T11:00:00', updatedAt: '2026-06-16T10:00:00'
    },
    {
      id: 3, title: '수채화풍 레퍼런스 추가 라이브러리', description: '수채화 스타일 이미지 생성을 위한 레퍼런스 라이브러리를 구축합시다.\n- 다양한 수채화 테크닉 샘플\n- 색감 팔레트 모음\n- 브러시 질감 참고 자료',
      category: 'idea', priority: 'normal', status: 'reviewing',
      author: 'normalkim', tags: ['수채화', '레퍼런스', '이미지'],
      assignees: [], votes: ['sfex11', 'eugene'],
      createdAt: '2026-06-13T15:20:00', updatedAt: '2026-06-13T15:20:00'
    },
    {
      id: 4, title: 'EP001 p.37 감정 표현 개선', description: 'EP001 37페이지에서 캐릭터의 감정 표현이 다소 어색합니다.\n분노 표현을 더 자연스럽게 수정 필요.',
      category: 'improvement', priority: 'high', status: 'done',
      author: 'eugene', tags: ['삼체만화', 'EP001', '수정'],
      assignees: ['eugene'], votes: ['sfex11'],
      createdAt: '2026-06-10T13:00:00', updatedAt: '2026-06-16T09:00:00'
    },
    {
      id: 5, title: '대본 템플릿 자동화', description: '대본 작성 시 반복되는 포맷을 템플릿화하여 자동 생성하는 도구가 있으면 좋겠습니다.\nMarkdown 기반 템플릿 + 변수 치환 시스템.',
      category: 'feature', priority: 'normal', status: 'proposed',
      author: 'eugene', tags: ['대본', '자동화', '템플릿'],
      assignees: [], votes: ['junteken', 'sfex11'],
      createdAt: '2026-06-16T10:30:00', updatedAt: '2026-06-16T10:30:00'
    },
    {
      id: 6, title: '이미지 배치 자동화 스크립트', description: '웹툰 컷에 이미지를 자동 배치하는 스크립트가 필요합니다.\nPython + PIL 기반으로:\n- 컷 영역 감지\n- 이미지 리사이즈 및 크롭\n- 자동 레이어 배치',
      category: 'feature', priority: 'normal', status: 'in-progress',
      author: 'junteken', tags: ['자동화', '이미지', '스크립트'],
      assignees: ['junteken', '대구루'], votes: ['sfex11', 'eugene', 'normalkim'],
      createdAt: '2026-06-12T14:00:00', updatedAt: '2026-06-17T11:00:00'
    },
    {
      id: 7, title: 'team-memory 동기화 버그', description: 'team-memory의 records 디렉토리가 간헐적으로 동기화되지 않는 버그가 있습니다.\nGit hook 관련 문제로 추정됩니다.',
      category: 'bug', priority: 'urgent', status: 'in-progress',
      author: '대구루', tags: ['team-memory', '버그', 'git'],
      assignees: ['대구루'], votes: ['sfex11'],
      createdAt: '2026-06-17T08:00:00', updatedAt: '2026-06-17T16:00:00'
    },
    {
      id: 8, title: 'Discord 알림 포맷 개선', description: '현재 Discord 알림이 너무 단조롭습니다.\n임베드 형식으로 개선하고, 상태별 색상을 적용하면 좋겠습니다.',
      category: 'improvement', priority: 'low', status: 'proposed',
      author: '대구루', tags: ['Discord', '알림', 'UX'],
      assignees: [], votes: [],
      createdAt: '2026-06-17T09:00:00', updatedAt: '2026-06-17T09:00:00'
    },
    {
      id: 9, title: '대시보드 통계 페이지', description: '전체 프로젝트 진행 상황을 한눈에 볼 수 있는 대시보드가 필요합니다.\n- 주간 진행 그래프\n- 멤버별 기여도\n- 상태별 분포도',
      category: 'feature', priority: 'high', status: 'reviewing',
      author: 'sfex11', tags: ['대시보드', '통계', 'CLE'],
      assignees: ['레노버'], votes: ['normalkim', 'eugene', 'junteken'],
      createdAt: '2026-06-11T16:00:00', updatedAt: '2026-06-15T10:00:00'
    },
    {
      id: 10, title: '레노버 분석 리포트 자동 생성', description: '주간 작업 결과를 분석하여 자동으로 리포트를 생성하는 기능.\n에이전트가 처리한 요구사항 통계 + 트렌드 분석 포함.',
      category: 'idea', priority: 'normal', status: 'approved',
      author: '레노버', tags: ['자동화', '리포트', '분석'],
      assignees: ['레노버'], votes: ['sfex11', '대구루'],
      createdAt: '2026-06-14T14:00:00', updatedAt: '2026-06-16T11:00:00'
    },
    {
      id: 11, title: '캐릭터 시트 업데이트', description: '주요 캐릭터들의 디자인 시트를 최신화해야 합니다.\nEP002 기준으로 변경된 캐릭터 외형 반영.',
      category: 'improvement', priority: 'normal', status: 'hold',
      author: 'normalkim', tags: ['캐릭터', '디자인'],
      assignees: [], votes: ['eugene'],
      createdAt: '2026-06-09T11:00:00', updatedAt: '2026-06-14T09:00:00'
    },
    {
      id: 12, title: '협업 워크플로우 문서화', description: '팀 내 협업 프로세스를 문서화하여 team-memory에 등록해야 합니다.\nGitHub Issues 기반 워크플로우 정의.',
      category: 'feature', priority: 'low', status: 'proposed',
      author: 'junteken', tags: ['문서화', '워크플로우', 'team-memory'],
      assignees: [], votes: ['sfex11'],
      createdAt: '2026-06-16T17:00:00', updatedAt: '2026-06-16T17:00:00'
    }
  ];

  var DUMMY_COMMENTS = {
    1: [
      { author: 'eugene', text: 'EP002 대본 초안 작업 시작했습니다. 이번 주 내로 1차 초안 올리겠습니다.', createdAt: '2026-06-15T14:00:00' },
      { author: 'sfex11', text: '좋습니다! 연출 메모 부분을 특히 신경 써주세요.', createdAt: '2026-06-15T15:30:00' }
    ],
    2: [
      { author: '대구루', text: 'GitHub OAuth App 등록 완료했습니다. 다음으로 콜백 URL 설정 진행하겠습니다.', createdAt: '2026-06-16T10:00:00' },
      { author: 'sfex11', text: '빠르시네요! 보안 부분도 꼼꼼히 체크 부탁드립니다.', createdAt: '2026-06-16T11:00:00' }
    ],
    4: [
      { author: 'sfex11', text: '확인했습니다. 훨씬 자연스러워졌네요! 👍', createdAt: '2026-06-16T09:00:00' }
    ],
    7: [
      { author: '대구루', text: 'pre-commit hook에서 누락되는 케이스를 발견했습니다. 수정 중입니다.', createdAt: '2026-06-17T16:00:00' }
    ],
    9: [
      { author: '레노버', text: '데이터 시각화 방안 정리해서 제안 드리겠습니다. Chart.js 또는 순수 Canvas 기반 중 선택 가능합니다.', createdAt: '2026-06-15T10:00:00' },
      { author: 'sfex11', text: '가벼운 게 좋으니 순수 Canvas로 가죠. 의존성 최소화가 좋겠습니다.', createdAt: '2026-06-15T11:00:00' }
    ]
  };

  /* ====== State ====== */
  var state = {
    currentUser: localStorage.getItem(USER_KEY) || 'sfex11',
    requests: [],
    comments: {},
    votes: {},
    settings: { discordWebhook: '', githubToken: '' },
    filter: { type: 'all', status: 'all', sort: 'newest', search: '' }
  };

  /* ====== Storage ====== */
  function loadData() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        state.requests = JSON.parse(raw);
      } catch (e) {
        state.requests = JSON.parse(JSON.stringify(DUMMY_REQUESTS));
      }
    } else {
      state.requests = JSON.parse(JSON.stringify(DUMMY_REQUESTS));
      saveRequests();
    }

    // Check data version — force reload if version changed
    var storedVersion = localStorage.getItem(VERSION_KEY);
    var needsReload = storedVersion !== DATA_VERSION;

    if (needsReload) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COMMENT_KEY);
      localStorage.setItem(VERSION_KEY, DATA_VERSION);
    }

    var rawC = localStorage.getItem(COMMENT_KEY);
    if (rawC && !needsReload) {
      try { state.comments = JSON.parse(rawC); } catch (e) { state.comments = {}; }
    } else {
      state.comments = JSON.parse(JSON.stringify(DUMMY_COMMENTS));
      saveComments();
    }

    if (needsReload) {
      state.requests = JSON.parse(JSON.stringify(DUMMY_REQUESTS));
      saveRequests();
    }

    var rawS = localStorage.getItem(SETTINGS_KEY);
    if (rawS) {
      try { state.settings = JSON.parse(rawS); } catch (e) {}
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
    if (parts[0] === 'settings') return renderSettings();

    renderNotFound();
  }

  /* ====== Layout / Navbar ====== */
  function navHTML(active) {
    var links = [
      { href: '#/', icon: '🏠', label: '홈', key: 'home' },
      { href: '#/requests', icon: '📋', label: '요구사항', key: 'requests' },
      { href: '#/new', icon: '➕', label: '등록', key: 'new' },
      { href: '#/agents', icon: '🤖', label: '에이전트', key: 'agents' },
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

  /* ====== Detail Page ====== */
  function renderDetail(id) {
    var r = getRequest(id);
    if (!r) return renderNotFound();

    var cat = CATEGORIES[r.category] || CATEGORIES.feature;
    var pri = PRIORITIES[r.priority] || PRIORITIES.normal;
    var st = STATUSES[r.status] || STATUSES.proposed;
    var member = MEMBERS[r.author] || { avatar: '\u{1F464}', role: '' };
    var comments = state.comments[r.id] || [];
    var hasVoted = r.votes && r.votes.indexOf(state.currentUser) >= 0;

    var html = '<div style="padding-top:24px" class="page-enter">';

    // Back
    html += '<a class="detail-back" href="#/requests">\u2190 \uBAA9\uB85D\uC73C\uB85C</a>';

    // Header Card with status color bar
    html += '<div class="detail-header-card" data-status="' + r.status + '">';
    html += '<div class="detail-badges">';
    html += '<span class="badge badge-type ' + cat.cls + '">' + cat.icon + ' ' + cat.label + '</span>';
    html += '<span class="badge badge-priority ' + pri.cls + '">\uC6B0\uC120\uC21C\uC704: ' + pri.label + '</span>';
    html += '<span class="badge badge-status ' + st.cls + '">' + st.icon + ' ' + st.label + '</span>';
    html += '</div>';
    html += '<h1>' + esc(r.title) + '</h1>';
    html += '<div class="detail-meta">';
    html += '<span class="user-pill" onclick="location.hash=\'#/users/' + encodeURIComponent(r.author) + '\'">' + member.avatar + ' ' + esc(r.author) + '</span>';
    html += '<span>\u00B7</span>';
    html += '<span>' + formatDate(r.createdAt) + ' \uC791\uC131</span>';
    html += '<span>\u00B7</span>';
    html += '<span>' + timeAgo(r.updatedAt) + ' \uC5C5\uB370\uC774\uD2B8</span>';
    html += '</div>';
    html += '</div>';

    // Two-column layout
    html += '<div class="detail-layout">';

    // Left column (main)
    html += '<div class="detail-main">';

    // Description
    html += '<div class="detail-section">';
    html += '<h3>\uD83D\uDCDD \uC124\uBA85</h3>';
    html += '<div class="detail-description">' + esc(r.description) + '</div>';
    if (r.tags && r.tags.length) {
      html += '<div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:4px">' + r.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>';
    }
    html += '</div>';

    // Vote
    html += '<div class="detail-section" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">';
    html += '<button class="vote-btn ' + (hasVoted ? 'voted' : '') + '" onclick="window.__CLE2__.toggleVote(' + r.id + ')">\uD83D\uDC4D ' + (r.votes || []).length + ' ' + (hasVoted ? '\uD22C\uD45C\uD568' : '\uD22C\uD45C') + '</button>';
    html += '<a class="btn btn-ghost btn-sm" href="#/new">\uD83D\uDD17 \uC774\uC288 \uBCF5\uC0AC</a>';
    html += '</div>';

    // Comments
    html += '<div class="detail-section">';
    html += '<h3>\uD83D\uDCAC \uB313\uAE00 (' + comments.length + ')</h3>';
    if (comments.length === 0) {
      html += '<div class="empty-state" style="padding:24px"><div class="es-icon">\uD83D\uDCAC</div><div class="es-text">\uC544\uC9C1 \uB313\uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div><div class="es-hint">\uCCAB \uB313\uAE00\uC744 \uB0A8\uACBC\uBCF4\uC138\uC694!</div></div>';
    }
    comments.forEach(function (c) {
      var cMember = MEMBERS[c.author] || { avatar: '\u{1F464}' };
      html += '<div class="comment">';
      html += '<div class="comment-avatar">' + cMember.avatar + '</div>';
      html += '<div class="comment-body">';
      html += '<div class="cb-header"><span class="cb-author">' + esc(c.author) + '</span><span class="cb-time">' + timeAgo(c.createdAt) + '</span></div>';
      html += '<div class="cb-text">' + esc(c.text) + '</div>';
      html += '</div></div>';
    });
    // Comment Form
    html += '<div class="comment-form">';
    html += '<input class="text-input" id="commentInput" placeholder="\uB313\uAE00 \uC785\uB825..." style="flex:1">';
    html += '<button class="btn btn-primary btn-sm" onclick="window.__CLE2__.addComment(' + r.id + ')">\uB4F1\uB85D</button>';
    html += '</div>';
    html += '</div>';

    html += '</div>'; // end detail-main

    // Right Sidebar
    html += '<div class="detail-sidebar">';

    // Status Change
    html += '<div class="sidebar-section">';
    html += '<h4>\uD83D\uDD04 \uC0C1\uD0DC \uBCC0\uACBD</h4>';
    html += '<div class="status-pills">';
    STATUS_FLOW.forEach(function (s) {
      var sObj = STATUSES[s];
      html += '<button class="status-pill ' + (r.status === s ? 'active' : '') + '" onclick="window.__CLE2__.changeStatus(' + r.id + ', \'' + s + '\')">' + sObj.icon + ' ' + sObj.label + '</button>';
    });
    html += '</div>';
    html += '</div>';

    // Assignment
    html += '<div class="sidebar-section">';
    html += '<h4>\uD83E\uDD16 \uC5D0\uC774\uC804\uD2B8 \uD560\uB2F9</h4>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
    AGENTS.forEach(function (a) {
      var isAssigned = r.assignees && r.assignees.indexOf(a) >= 0;
      html += '<button class="assign-btn ' + (isAssigned ? 'assigned' : '') + '" onclick="window.__CLE2__.toggleAssign(' + r.id + ', \'' + a + '\')">';
      html += memberAvatar(a) + ' ' + esc(a);
      if (isAssigned) html += ' \u2705';
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
    html += '<a class="detail-back" href="#/requests">\u2190 \uBAA9\uB85D\uC73C\uB85C</a>';
    html += '<h1 style="font-size:1.4rem;font-weight:700;margin-bottom:24px">\u2795 \uC0C8 \uC694\uAD6C\uC0AC\uD56D \uB4F1\uB85D</h1>';

    html += '<div class="card" style="padding:28px">';
    html += '<div class="form-group">';
    html += '<label>\uC81C\uBAA9 <span class="required">*</span></label>';
    html += '<input class="text-input" id="reqTitle" placeholder="\uC694\uAD6C\uC0AC\uD56D \uC81C\uBAA9\uC744 \uC785\uB825\uD558\uC138\uC694" oninput="window.__CLE2__.updatePreview()">';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label>\uC124\uBA85 <span class="required">*</span></label>';
    html += '<textarea class="textarea-input" id="reqDesc" placeholder="\uC0C1\uC138 \uB0B4\uC6A9\uC744 \uC785\uB825\uD558\uC138\uC694..." oninput="window.__CLE2__.updatePreview()"></textarea>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label>\uCE74\uD14C\uACE0\uB9AC</label>';
    html += '<div class="toggle-group" id="categoryToggle">';
    Object.keys(CATEGORIES).forEach(function (k, i) {
      html += '<button class="toggle-btn ' + k + (i === 0 ? ' active' : '') + '" data-cat="' + k + '">' + CATEGORIES[k].icon + ' ' + CATEGORIES[k].label + '</button>';
    });
    html += '</div>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label>\uC6B0\uC120\uC21C\uC704</label>';
    html += '<div class="toggle-group" id="priorityToggle">';
    Object.keys(PRIORITIES).forEach(function (k, i) {
      html += '<button class="toggle-btn ' + k + (k === 'normal' ? ' active' : '') + '" data-pri="' + k + '">' + PRIORITIES[k].label + '</button>';
    });
    html += '</div>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label>\uD0DC\uADF8</label>';
    html += '<div class="tag-input-container" id="tagContainer">';
    html += '<input class="tag-input" id="tagInput" placeholder="\uC5D4\uD130\uB85C \uCD94\uAC00..." onkeydown="window.__CLE2__.handleTagKey(event)">';
    html += '</div>';
    html += '<div style="font-size:0.72rem;color:var(--text3);margin-top:6px">\uC5D4\uD130\uD0A4\uB97C \uB20C\uB7EC \uD0DC\uADF8\uB97C \uCD94\uAC00\uD558\uACE0, x\uB97C \uB20C\uB7EC \uC0AD\uC81C\uD558\uC138\uC694</div>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label>\uC791\uC131\uC790</label>';
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
    html += '<div class="form-preview-label">\uD83D\uDC41 \uB300\uB7C9 \uBBF8\uB9AC\uBCF4\uAE30</div>';
    html += '<div id="previewBox" style="font-size:0.85rem;color:var(--text2)">\uC81C\uBAA9\uC744 \uC785\uB825\uD558\uBA74 \uBBF8\uB9AC\uBCF4\uAE30\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4.</div>';
    html += '</div>';

    html += '<div class="form-actions">';
    html += '<a class="btn btn-ghost" href="#/requests">\uCDE8\uC18C</a>';
    html += '<button class="btn btn-primary" onclick="window.__CLE2__.submitRequest()">\uB4F1\uB85D\uD558\uAE30</button>';
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

  /* ====== Agents Page ====== */
  function renderAgents() {
    var html = '<div style="padding-top:24px" class="page-enter">';
    html += '<h1 style="font-size:1.4rem;font-weight:700;margin-bottom:8px">\uD83E\uDD16 \uC5D0\uC774\uC804\uD2B8 \uD328\uB110</h1>';
    html += '<p style="color:var(--text2);font-size:0.85rem;margin-bottom:28px">\uB300\uAD6C\uB8E8\uC640 \uB808\uB178\uBC84\uC758 \uC791\uC5C5 \uD604\uD669\uC744 \uD655\uC778\uD558\uC138\uC694</p>';

    html += '<div class="agent-grid">';

    AGENTS.forEach(function (a) {
      var member = MEMBERS[a];
      var aReqs = state.requests.filter(function (r) { return r.assignees && r.assignees.indexOf(a) >= 0; });
      var aDone = aReqs.filter(function (r) { return r.status === 'done'; }).length;
      var aActive = aReqs.filter(function (r) { return r.status === 'in-progress' || r.status === 'approved'; }).length;
      var aProposed = aReqs.filter(function (r) { return r.status === 'proposed' || r.status === 'reviewing'; }).length;

      var isActive = aActive > 0;
      var pct = aReqs.length > 0 ? Math.round(aDone / aReqs.length * 100) : 0;

      html += '<div class="agent-card">';
      html += '<div class="ac-avatar">' + member.avatar + '</div>';
      html += '<div class="ac-name">' + esc(a) + '</div>';
      html += '<div class="ac-role">' + member.role + '</div>';
      html += '<div class="ac-desc">' + member.desc + '</div>';
      html += '<div class="ac-stats">';
      html += '<div class="ac-stat"><div class="ac-val">' + aReqs.length + '</div><div class="ac-label">\uC804\uCCB4</div></div>';
      html += '<div class="ac-stat"><div class="ac-val">' + aActive + '</div><div class="ac-label">\uC9C4\uD589 \uC911</div></div>';
      html += '<div class="ac-stat"><div class="ac-val">' + aDone + '</div><div class="ac-label">\uC644\uB8CC</div></div>';
      html += '</div>';

      // Stat bar
      html += '<div class="stat-bar" style="position:relative;z-index:1">';
      if (aDone > 0) html += '<div class="stat-bar-segment" style="width:' + (aDone/aReqs.length*100) + '%;background:var(--green)"></div>';
      if (aActive > 0) html += '<div class="stat-bar-segment" style="width:' + (aActive/aReqs.length*100) + '%;background:var(--purple)"></div>';
      if (aProposed > 0) html += '<div class="stat-bar-segment" style="width:' + (aProposed/aReqs.length*100) + '%;background:var(--amber)"></div>';
      html += '</div>';
      html += '<div style="font-size:0.7rem;color:var(--text3);text-align:center;margin-top:6px;position:relative;z-index:1">\uC644\uB8CC\uC728: ' + pct + '%</div>';

      // Status
      html += '<div style="margin-top:14px;position:relative;z-index:1">';
      html += '<span class="agent-status ' + (isActive ? 'active' : 'idle') + '">';
      html += '<span class="agent-status-dot"></span>';
      html += (isActive ? '\uC791\uC5C5 \uC911' : '\uB300\uAE30 \uC911');
      html += '</span>';
      html += '</div>';

      // Assigned tasks list
      if (aReqs.length > 0) {
        html += '<div class="agent-tasks">';
        html += '<h4>\uD560\uB2F9\uB41C \uC694\uAD6C\uC0AC\uD56D</h4>';
        aReqs.slice(0, 4).forEach(function (r) {
          var stObj = STATUSES[r.status] || STATUSES.proposed;
          html += '<div class="agent-task-item" onclick="location.hash=\'#/requests/' + r.id + '\'">';
          html += '<span>' + stObj.icon + '</span>';
          html += '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(r.title) + '</span>';
          html += '</div>';
        });
        if (aReqs.length > 4) {
          html += '<div style="text-align:center;font-size:0.75rem;color:var(--text3);padding:6px">+' + (aReqs.length - 4) + '\uAC1C \uB354 \uBCF4\uAE30</div>';
        }
        html += '</div>';
      }

      html += '</div>';
    });

    html += '</div>';

    // Recent agent work
    html += '<div class="section">';
    html += '<div class="section-header"><h2>\uD83D\uDCCB \uC5D0\uC774\uC804\uD2B8 \uD560\uB2F9 \uC694\uAD6C\uC0AC\uD56D</h2></div>';
    var agentReqs = state.requests.filter(function (r) {
      return r.assignees && r.assignees.some(function (a) { return AGENTS.indexOf(a) >= 0; });
    });
    if (agentReqs.length === 0) {
      html += '<div class="empty-state"><div class="es-icon">\uD83E\uDD16</div><div class="es-text">\uC5D0\uC774\uC804\uD2B8\uC5D0 \uD560\uB2F9\uB41C \uC694\uAD6C\uC0AC\uD56D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</div></div>';
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
    html += '<div class="sc-status">Phase 2 예정</div>';
    html += '<div style="margin-top:14px">';
    html += '<label style="display:block;font-size:0.82rem;font-weight:600;margin-bottom:6px;color:var(--text2)">GitHub Personal Access Token</label>';
    html += '<input class="text-input" id="githubToken" placeholder="ghp_xxxxxxxxxxxx" value="' + esc(state.settings.githubToken || '') + '" disabled style="opacity:0.5">';
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
    html += 'CLE2 v1.0.0 · Phase 1 · localStorage 모드<br>';
    html += 'Daegu Agent Crew © 2026';
    html += '</div>';

    html += '</div>';

    render(pageWrap('settings', html));
  }

  /* ====== Not Found ====== */
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
  function showToast(msg, type) {
    closeToast();
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.innerHTML = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 10);
    toastTimer = setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { if (el.parentNode) el.remove(); }, 300);
    }, 3000);
  }
  function closeToast() {
    if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
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
        showToast('투표를 취소했습니다', 'success');
      } else {
        r.votes.push(state.currentUser);
        showToast('👍 투표했습니다!', 'success');
      }
      r.updatedAt = new Date().toISOString();
      saveRequests();
      renderDetail(id);
    },

    changeStatus: function (id, status) {
      var r = getRequest(id);
      if (!r) return;
      r.status = status;
      r.updatedAt = new Date().toISOString();
      saveRequests();
      var stObj = STATUSES[status] || {};
      showToast(stObj.icon + ' 상태가 "' + stObj.label + '"로 변경되었습니다', 'success');
      // Simulate Discord notification
      showToast('💬 Discord에 알림 전송됨 (시뮬레이션)', 'success');
      renderDetail(id);
    },

    toggleAssign: function (id, agent) {
      var r = getRequest(id);
      if (!r) return;
      if (!r.assignees) r.assignees = [];
      var idx = r.assignees.indexOf(agent);
      if (idx >= 0) {
        r.assignees.splice(idx, 1);
        showToast(memberAvatar(agent) + ' ' + agent + ' 할당 해제', 'success');
      } else {
        r.assignees.push(agent);
        showToast(memberAvatar(agent) + ' ' + agent + '에게 할당했습니다!', 'success');
        showToast('💬 Discord에 알림 전송됨 (시뮬레이션)', 'success');
      }
      r.updatedAt = new Date().toISOString();
      saveRequests();
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
      // Update request timestamp
      var r = getRequest(id);
      if (r) { r.updatedAt = new Date().toISOString(); saveRequests(); }
      showToast('💬 댓글이 등록되었습니다', 'success');
      renderDetail(id);
    },

    _formTags: [],
    submitRequest: function () {
      var title = document.getElementById('reqTitle').value.trim();
      var desc = document.getElementById('reqDesc').value.trim();
      if (!title) { showToast('\u26A0\uFE0F \uC81C\uBAA9\uC744 \uC785\uB825\uD558\uC138\uC694', 'error'); return; }
      if (!desc) { showToast('\u26A0\uFE0F \uC124\uBA85\uC744 \uC785\uB825\uD558\uC138\uC694', 'error'); return; }

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
        updatedAt: now
      };
      state.requests.unshift(newReq);
      saveRequests();
      showToast('✅ 요구사항이 등록되었습니다!', 'success');
      showToast('💬 Discord에 알림 전송됨 (시뮬레이션)', 'success');
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

    resetData: function () {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COMMENT_KEY);
      state.requests = JSON.parse(JSON.stringify(DUMMY_REQUESTS));
      state.comments = JSON.parse(JSON.stringify(DUMMY_COMMENTS));
      saveRequests();
      saveComments();
      showToast('✅ 초기 데이터로 리셋되었습니다', 'success');
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
        return '<span class="tag-chip">' + t.replace(/</g, '&lt;') + '<span class="tag-remove" onclick="window.__CLE2__.removeTag(' + i + ')">\u00D7</span></span>';
      }).join('');
      container.innerHTML = chips + '<input class="tag-input" id="tagInput" placeholder="\uC5D4\uD130\uB85C \uCD94\uAC00..." onkeydown="window.__CLE2__.handleTagKey(event)">';
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
        preview.innerHTML = '\uC81C\uBAA9\uC744 \uC785\uB825\uD558\uBA74 \uBBF8\uB9AC\uBCF4\uAE30\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4.';
        preview.style.color = 'var(--text2)';
        return;
      }
      preview.style.color = 'var(--text)';
      var html = '<div style="font-weight:600;margin-bottom:6px">' + esc(t || '(\uC81C\uBAA9 \uC5C6\uC74C)') + '</div>';
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
