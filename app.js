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
  var DATA_VERSION = 'v11';
  var VERSION_KEY = 'cle2_data_version';
  var MESSAGE_KEY = 'cle2_messages';
  var DELIVERABLE_KEY = 'cle2_deliverables';
  var STUDIO_KEY = 'cle2_studio';

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

  var TASKS_DATA = [
    {
      id: 'CLE2-1',
      cle2Id: 'CLE2-1',
      slug: 'team-memory',
      title: 'team-memory 활성화',
      issue: 1,
      prs: [],
      deliverables: [],
      goal: {
        objective: 'team-memory를 실제 팀 작업 흐름에 연결하고 기록, 위키, 자동화 파이프라인이 일관되게 동작하도록 활성화한다.',
        successCriteria: [
          '디렉토리 구조와 운영 가이드가 확정되어 있다.',
          'YouTube→wiki 흐름이 실제로 동작한다.',
          'Discord 알림과 GitHub Actions 자동화가 연결된다.'
        ],
        scope: {
          in: ['context 디렉토리 구조 정비', '자동 연동 파이프라인 설계', 'Discord 알림 자동화', 'GitHub Actions 워크플로우'],
          out: ['새 메모리 시스템 재설계', '위키 외부 서비스 마이그레이션', '팀 외부 조직용 범용 배포']
        }
      },
      plan: {
        phases: [
          { name: 'Phase 1 · 구조 정비', owner: '대구루', status: 'done' },
          { name: 'Phase 2 · 자동 연동 설계', owner: '대구루', status: 'in-progress' },
          { name: 'Phase 3 · 운영 활성화', owner: '대구루', status: 'pending' }
        ]
      },
      status: {
        state: 'in-progress',
        progress: { current: 1, total: 3 },
        completedTasks: ['디렉토리 구조 확정', '가이드라인 작성', 'youtube-to-wiki 성공'],
        currentTasks: ['Discord 알림 자동화', '자동 연동 파이프라인 설계 정리'],
        nextTasks: ['GitHub Actions 워크플로우', '팀원 온보딩'],
        blockers: []
      },
      tests: {
        items: [
          { name: '디렉토리 구조 검토', method: '수동 점검', expected: 'records/registry/wiki 구조가 확정된다', passed: true },
          { name: '가이드라인 문서 확인', method: '문서 리뷰', expected: '팀원이 동일 규칙으로 사용할 수 있다', passed: true },
          { name: 'youtube-to-wiki 연결', method: '엔드투엔드 실행', expected: '입력 영상이 위키 문서로 생성된다', passed: true },
          { name: 'Discord 알림 자동화', method: '통합 테스트', expected: '작업 이벤트가 Discord로 전송된다', passed: false },
          { name: 'GitHub Actions 워크플로우', method: 'CI 시뮬레이션', expected: '저장소 이벤트에 맞춰 자동 파이프라인이 실행된다', passed: false }
        ]
      }
    },
    {
      id: 'CLE2-2',
      cle2Id: 'CLE2-2',
      slug: 'youtube-to-wiki-skill',
      title: '유튜브→wiki 스킬',
      issue: 3,
      prs: [],
      deliverables: [
        { title: 'youtube-to-wiki 스킬', type: 'link', url: 'https://github.com/Daegu-Agent-Crew/team-memory-kit', description: 'OpenClaw 스킬로 등록됨' }
      ],
      goal: {
        objective: '유튜브 영상을 team-memory 위키 문서로 변환하는 스킬을 구축하고 반복 가능한 자동 처리 흐름을 만든다.',
        successCriteria: [
          '자막 추출부터 구조화 요약까지 자동 처리된다.',
          '결과가 GitHub에 등록되고 스킬로 재사용 가능하다.',
          '이슈 댓글 자동화까지 마무리된다.'
        ],
        scope: {
          in: ['자막 추출', '정제', '구조화 요약', 'GitHub 등록', '스킬화', '이슈 댓글 자동화'],
          out: ['영상 편집 기능', '비유튜브 플랫폼 범용 수집기', '대규모 배치 인프라']
        }
      },
      plan: {
        phases: [
          { name: 'Phase 1 · 자막 추출', owner: '대구루', status: 'done' },
          { name: 'Phase 2 · 텍스트 정제', owner: '대구루', status: 'done' },
          { name: 'Phase 3 · 구조화 요약', owner: '대구루', status: 'done' },
          { name: 'Phase 4 · GitHub 등록 및 스킬화', owner: '대구루', status: 'done' },
          { name: 'Phase 5 · 자동화 마무리', owner: '대구루', status: 'in-progress' }
        ]
      },
      status: {
        state: 'in-progress',
        progress: { current: 4, total: 5 },
        completedTasks: ['자막추출', '정제', '구조화요약', 'GitHub등록', '스킬화'],
        currentTasks: ['이슈 댓글 자동화'],
        nextTasks: ['잔여 테스트 1건 통과', '자동화 안정화'],
        blockers: []
      },
      tests: {
        items: [
          { name: '자막 추출', method: '샘플 영상 실행', expected: '자막 원문이 생성된다', passed: true },
          { name: '자막 정제', method: '텍스트 처리 검증', expected: '노이즈가 제거된 텍스트가 생성된다', passed: true },
          { name: '구조화 요약', method: '요약 출력 비교', expected: '위키 구조에 맞는 요약이 생성된다', passed: true },
          { name: 'GitHub 등록', method: '원격 저장소 반영 확인', expected: '문서가 저장소에 등록된다', passed: true },
          { name: '스킬화', method: '재호출 테스트', expected: '동일 흐름을 스킬로 재사용할 수 있다', passed: true },
          { name: '에러 처리', method: '실패 시나리오 검증', expected: '오류 상황에서 안전하게 종료된다', passed: true },
          { name: '문서 포맷 일관성', method: '출력 포맷 검수', expected: '위키 문서 형식이 일관된다', passed: true },
          { name: '이슈 댓글 자동화', method: 'GitHub 통합 테스트', expected: '처리 결과가 이슈 댓글로 자동 남는다', passed: false }
        ]
      }
    },
    {
      id: 'CLE2-3',
      cle2Id: 'CLE2-3',
      slug: 'cle2-improvements',
      title: 'CLE2 개선',
      issue: 4,
      prs: [5, 6, 7],
      deliverables: [],
      goal: {
        objective: 'CLE2 웹앱의 작업 관리 경험을 개선하고 기존 이슈 문서화와 템플릿 체계를 정비해 운영 품질을 높인다.',
        successCriteria: [
          '디렉토리 구조와 템플릿이 정리되어 있다.',
          '기존 이슈가 문서화되어 추적 가능하다.',
          '웹앱에 태스크 대시보드가 추가되고 테스트 후 배포된다.'
        ],
        scope: {
          in: ['디렉토리구조', '템플릿', '기존이슈 문서화', '웹앱 태스크 대시보드', '테스트 및 배포'],
          out: ['SPA 프레임워크 전환', '백엔드 서비스 신규 구축', '모바일 앱 개발']
        }
      },
      plan: {
        phases: [
          { name: 'Phase 1 · 기초 정비', owner: '대구루', status: 'done' },
          { name: 'Phase 2 · 문서화', owner: '대구루', status: 'done' },
          { name: 'Phase 3 · 웹앱 대시보드', owner: '대구루', status: 'done' },
          { name: 'Phase 4 · 테스트 및 배포', owner: '대구루', status: 'done' }
        ]
      },
      status: {
        state: 'done',
        progress: { current: 4, total: 4 },
        completedTasks: ['디렉토리구조', '템플릿', '기존이슈 문서화', '웹앱 태스크 대시보드', '테스트 및 배포'],
        currentTasks: [],
        nextTasks: [],
        blockers: []
      },
      tests: {
        items: [
          { name: '디렉토리 구조 검증', method: '수동 점검', expected: '프로젝트 구조가 일관된다', passed: true },
          { name: '템플릿 검수', method: '문서 리뷰', expected: '반복 작업용 템플릿이 사용 가능하다', passed: true },
          { name: '기존 이슈 문서화 확인', method: '링크 및 내용 검토', expected: '주요 이슈가 문서로 추적된다', passed: true },
          { name: '태스크 대시보드 동작', method: '브라우저 수동 테스트', expected: '목록/상세/탭 이동이 정상 동작한다', passed: true },
          { name: '배포 검증', method: '릴리스 체크', expected: '배포 후 화면과 라우팅이 정상 동작한다', passed: true }
        ]
      }
    },
    {
      id: 'CLE2-4',
      cle2Id: 'CLE2-4',
      slug: 'task-integration',
      title: '요구사항↔tasks 통합',
      issue: 8,
      prs: [9, 10, 11, 12],
      deliverables: [],
      goal: {
        objective: 'TASKS_DATA를 동적 생성으로 변경하고, 요구사항과 tasks를 통합하여 새 이슈가 task 대시보드에 자동 반영되도록 한다.',
        successCriteria: [
          'getTasks()가 TASKS_DATA와 state.requests를 머지하여 동적 task 리스트를 반환한다.',
          '요구사항 상세 페이지에 task 요약 정보가 표시된다.',
          'Tasks 대시보드에 task가 없는 요구사항도 표시된다.'
        ],
        scope: {
          in: ['getTasks()/getTask() 동적 조회', 'renderDetail task 요약', 'renderTasks 미생성 표시', 'CLE2-4 task 데이터'],
          out: ['task 자동 생성 자동화', '외부 API 연동', '실시간 웹소켓 동기화']
        }
      },
      plan: {
        phases: [
          { name: 'Phase 1 · getTasks() 구현', owner: '대구루', status: 'done' },
          { name: 'Phase 2 · renderDetail 통합', owner: '대구루', status: 'done' },
          { name: 'Phase 3 · renderTasks 통합', owner: '대구루', status: 'done' }
        ]
      },
      status: {
        state: 'done',
        progress: { current: 3, total: 3 },
        completedTasks: ['CLE2-4 task 데이터 추가', 'getTasks() 동적 머지 구현', 'renderDetail task 요약', 'renderTasks 미생성 표시', 'PR #9 머지'],
        currentTasks: [],
        nextTasks: [],
        blockers: []
      },
      tests: {
        items: [
          { name: 'getTasks() 머지 검증', method: '수동 확인', expected: '기존 task + 신규 request stub이 반환된다', passed: true },
          { name: '요구사항 상세 task 요약', method: '브라우저 확인', expected: 'task 정보가 요약 표시된다', passed: true },
          { name: 'Tasks 대시보드 미생성 표시', method: '브라우저 확인', expected: 'task 없는 요구사항이 미생성 상태로 표시된다', passed: true }
        ]
      }
    },
    {
      id: 'CLE2-5',
      cle2Id: 'CLE2-5',
      slug: 'deliverables-feedback',
      title: '결과물 쇼케이스 & 피드백',
      issue: 13,
      prs: [14],
      deliverables: [],
      goal: {
        objective: '요구사항 상세 페이지에 결과물(Deliverable)을 버전별로 등록하고, 피드백을 받아 재작업할 수 있는 흐름을 구축한다.',
        successCriteria: [
          '결과물 버전 등록이 가능하고 최신/이전 버전이 구분되어 표시된다.',
          '각 버전에 피드백(댓글)을 등록할 수 있다.',
          '공유 링크 복사로 외부에서 결과물을 확인할 수 있다.'
        ],
        scope: {
          in: ['결과물 버전 관리', '피드백 등록', '공유 링크 복사', '인라인 등록 폼', 'CLE2-5 task 데이터'],
          out: ['실시간 협업 편집', '외부 API 연동', '파일 업로드']
        }
      },
      plan: {
        phases: [
          { name: 'Phase 1 · 데이터 모델', owner: '대구루', status: 'done' },
          { name: 'Phase 2 · 결과물 섹션 UI', owner: '대구루', status: 'done' },
          { name: 'Phase 3 · 피드백 & 공유', owner: '대구루', status: 'done' }
        ]
      },
      status: {
        state: 'done',
        progress: { current: 3, total: 3 },
        completedTasks: ['데이터 모델 추가', '결과물 섹션 UI', '피드백 기능', '공유 링크 복사', '인라인 폼'],
        currentTasks: [],
        nextTasks: [],
        blockers: []
      },
      tests: {
        items: [
          { name: '결과물 등록', method: '브라우저 확인', expected: '새 결과물이 최신 버전으로 표시된다', passed: true },
          { name: '버전 접기/펼치기', method: '브라우저 확인', expected: '이전 버전은 접혀 있고 클릭하면 펼쳐진다', passed: true },
          { name: '피드백 등록', method: '브라우저 확인', expected: '피드백이 해당 결과물 하단에 표시된다', passed: true },
          { name: '공유 링크 복사', method: '브라우저 확인', expected: '클립보드에 URL이 복사된다', passed: true },
          { name: 'node --check 통과', method: '문법 검증', expected: '구문 오류 없음', passed: true }
        ]
      }
    },
    {
      id: 'CLE2-6',
      cle2Id: 'CLE2-6',
      slug: 'ai-agent-news',
      title: 'AI 에이전트 뉴스 수집 시스템',
      issue: 15,
      prs: [16],
      deliverables: [
        { title: 'AI 에이전트 뉴스 웹앱', type: 'link', url: 'https://daegu-agent-crew.github.io/ai-agent-news/', description: 'GitHub Pages 관리 웹앱' },
        { title: 'ai-agent-news 리포', type: 'link', url: 'https://github.com/Daegu-Agent-Crew/ai-agent-news', description: '뉴스 수집·번역·분석 리포' }
      ],
      goal: {
        objective: '최신 AI 에이전트 뉴스를 에이전트가 수집하고 번역·심층 분석하여 GitHub 리포에 체계적으로 정리하며, 관리 웹앱으로 조회·관리할 수 있는 시스템을 구축한다.',
        successCriteria: [
          '새 리포(ai-agent-news)가 생성되어 LLM Wiki 구조로 정리된다',
          '대구루/레노버 모두 수집 요청을 처리할 수 있다',
          '수집된 뉴스에 번역 및 심층 분석이 포함된다',
          'GitHub Pages 관리 웹앱에서 뉴스 조회 및 관리가 가능하다'
        ],
        scope: {
          in: ['새 리포 생성', 'LLM Wiki 구조 설계', '수집→번역→분석 파이프라인', '관리 웹앱', '스킬화', 'team-memory 연동'],
          out: ['자동 주기 수집', '댓글/소셜 기능', '뉴스레터 자동 발송']
        }
      },
      plan: {
        phases: [
          { name: 'Phase 1 · 리포 구조 & LLM Wiki 설계', owner: '대구루', status: 'in-progress' },
          { name: 'Phase 2 · 수집→번역→분석 파이프라인', owner: '대구루+레노버', status: 'pending' },
          { name: 'Phase 3 · LLM Wiki 컴파일', owner: '대구루', status: 'pending' },
          { name: 'Phase 4 · 관리 웹앱 구현', owner: '대구루', status: 'pending' },
          { name: 'Phase 5 · 통합 & 배포', owner: '대구루', status: 'pending' }
        ]
      },
      status: {
        state: 'in-progress',
        progress: { current: 0, total: 5 },
        completedTasks: ['인터뷰 완료', 'tasks 문서 작성'],
        currentTasks: ['리포 구조 설계'],
        nextTasks: ['수집 파이프라인', '웹앱 구현'],
        blockers: []
      },
      tests: {
        items: [
          { name: '리포 구조', method: 'GitHub 확인', expected: 'context/records, wiki, registry 구조 확인', passed: false },
          { name: '수집 파이프라인', method: '스킬 실행', expected: '뉴스가 record로 저장됨', passed: false },
          { name: '번역 품질', method: '수집 뉴스 확인', expected: '한국어 번역 포함', passed: false },
          { name: '심층 분석', method: '수집 뉴스 확인', expected: '기술 의미, 업계 영향 분석 포함', passed: false },
          { name: '웹앱 리스트', method: 'Pages 접속', expected: '뉴스 리스트, 필터 동작', passed: false },
          { name: '웹앱 상세', method: '뉴스 클릭', expected: '원문/번역/분석 표시', passed: false }
        ]
      }
    },
    {
      id: 'CLE2-7',
      cle2Id: 'CLE2-7',
      slug: 'three-body-comic-studio',
      title: '삼체 연재 만화 프로젝트 전용 관리 시스템',
      issue: 17,
      prs: [],
      deliverables: [],
      goal: {
        objective: 'CLE1의 제작 루프와 CLE2의 태스크 관리 구조를 결합해 삼체 연재 만화 프로젝트 전용 운영 시스템을 구축하고, 에피소드 제작 파이프라인과 이미지 생성 품질 관리, 가설 검증 루프를 한 흐름으로 연결한다.',
        successCriteria: [
          '에피소드 단위 제작 파이프라인과 패널 상태 모델이 정의되어 있다.',
          'OpenClaw(GLM)에서 Codex CLI 이미지 생성을 재현 가능하게 실행하는 매뉴얼 또는 스크립트가 있다.',
          '이미지 생성 실패, 스타일 편차, A/B 비교를 관리할 수 있는 품질 루프가 정의되어 있다.',
          '가설 검증 결과를 기록하는 results 템플릿과 상태 추적 규칙이 있다.',
          'CLE2 대시보드에서 CLE2-7 작업 상태와 단계가 확인된다.'
        ],
        scope: {
          in: ['에피소드 파이프라인 모델링', '패널 상태 관리', '이미지 생성 표준화', '가설 실험 추적', '팀 병렬 작업 구조', 'CLE2-7 tasks 문서', 'CLE2 대시보드 반영'],
          out: ['이미지 생성 모델 자체 개발', 'GA4 실계정 운영 연동 완료', 'Discord 운영 인프라 구축 완료', 'three-body-comic 전체 리포 구현 대행']
        }
      },
      plan: {
        phases: [
          { name: 'Phase 1 · 요구사항 정제 및 시스템 경계 확정', owner: '대구루', status: 'in-progress' },
          { name: 'Phase 2 · 에피소드/패널 데이터 모델 설계', owner: '대구루', status: 'pending' },
          { name: 'Phase 3 · 이미지 생성 실행 표준화', owner: '대구루', status: 'pending' },
          { name: 'Phase 4 · 가설 검증 및 results 템플릿 설계', owner: '레노버', status: 'pending' },
          { name: 'Phase 5 · 팀 병렬 운영 루프 및 리뷰 흐름 설계', owner: '대구루', status: 'pending' },
          { name: 'Phase 6 · CLE2 대시보드/문서 통합', owner: '대구루', status: 'pending' }
        ]
      },
      status: {
        state: 'in-progress',
        progress: { current: 0, total: 6 },
        completedTasks: ['이슈 #17 생성', '문서 요구사항 초안 확정'],
        currentTasks: ['CLE2-7 GOAL/PLAN/STATUS/TESTS 구체화', 'GitHub 연동 보안 정비'],
        nextTasks: ['에피소드 파이프라인 데이터 구조 정의', 'Codex CLI 이미지 생성 표준 절차 문서화', 'results 템플릿 설계'],
        blockers: ['브라우저 프런트엔드에 GitHub PAT를 직접 넣는 기존 구조는 운영 불가']
      },
      tests: {
        items: [
          { name: '태스크 문서 생성', method: '리포 확인', expected: 'tasks/CLE2-7/ 아래 4개 문서가 존재한다', passed: true },
          { name: '대시보드 노출', method: '브라우저 확인', expected: 'CLE2-7 카드와 상세 탭이 표시된다', passed: true },
          { name: '파이프라인 모델 정의', method: '문서 리뷰', expected: '대본→콘티→패널→리뷰→배포→관측 단계가 명시된다', passed: true },
          { name: '이미지 생성 표준화', method: '문서 리뷰', expected: 'OpenClaw가 Codex CLI 이미지 생성을 재현 가능하게 호출하는 절차가 있다', passed: true },
          { name: 'GitHub 보안 정비', method: '코드 리뷰', expected: '하드코딩 PAT 없이 동기화가 동작한다', passed: true }
        ]
      },
      relatedTasks: [
        {
          id: 'CLE2-9',
          relation: '후속 상위 작업',
          note: 'CLE2-7은 STUDIO 운영 기반이고, CLE2-9는 이를 포함하는 CLE3 창작 시스템 정의다.'
        }
      ],
      docs: [
        {
          title: '시스템 개요',
          path: 'tasks/CLE2-7/three-body-comic-studio/docs/SYSTEM-OVERVIEW.md',
          description: 'CLE2와 three-body-comic 저장소의 책임 경계와 핵심 객체 정의'
        },
        {
          title: '에피소드/패널 파이프라인',
          path: 'tasks/CLE2-7/three-body-comic-studio/docs/EPISODE-PIPELINE.md',
          description: '에피소드 단계, 패널 상태, 작업 분배 규칙'
        },
        {
          title: '이미지 생성 플레이북',
          path: 'tasks/CLE2-7/three-body-comic-studio/docs/IMAGE-GENERATION-PLAYBOOK.md',
          description: 'OpenClaw(GLM)에서 Codex CLI 이미지 생성을 실행하는 표준 절차'
        },
        {
          title: '가설 검증 템플릿',
          path: 'tasks/CLE2-7/three-body-comic-studio/docs/HYPOTHESIS-RESULTS-TEMPLATE.md',
          description: 'results.md 구조와 검증 상태 기준'
        },
        {
          title: '운영 루프',
          path: 'tasks/CLE2-7/three-body-comic-studio/docs/TEAM-OPERATING-LOOP.md',
          description: '팀원, 에이전트, PR 리뷰, Discord 알림 기준'
        }
      ],
      studio: {
        episodes: [
          {
            id: 'EP001',
            title: '파일럿 1화',
            status: 'review',
            owner: 'sfex11',
            summary: '표면층과 가설층 연결 확인이 필요한 첫 공개 후보',
            phaseProgress: { current: 4, total: 6 },
            panels: [
              { id: 'P01', status: 'approved', owner: 'normalkim' },
              { id: 'P02', status: 'revision', owner: 'eugene' },
              { id: 'P03', status: 'review-queue', owner: 'YoonJongHyuk' },
              { id: 'P04', status: 'failed', owner: '대구루' }
            ]
          },
          {
            id: 'EP002',
            title: '파일럿 2화',
            status: 'storyboard',
            owner: 'eugene',
            summary: '콘티 확정과 패널 목적 문장 정리가 우선',
            phaseProgress: { current: 2, total: 6 },
            panels: [
              { id: 'P01', status: 'not-started', owner: 'eugene' },
              { id: 'P02', status: 'not-started', owner: 'junteken' },
              { id: 'P03', status: 'not-started', owner: 'normalkim' }
            ]
          },
          {
            id: 'EP003',
            title: '파일럿 3화',
            status: 'script',
            owner: 'junteken',
            summary: '대본 비트와 감정선 먼저 고정',
            phaseProgress: { current: 1, total: 6 },
            panels: [
              { id: 'P01', status: 'not-started', owner: 'junteken' },
              { id: 'P02', status: 'not-started', owner: '레노버' }
            ]
          }
        ],
        hypotheses: [
          { id: 'H1', title: '표면층만으로도 진입이 쉬운가', status: 'collecting', metric: '체류시간 / 첫 이탈률', owner: '레노버' },
          { id: 'H2', title: '가설층 단서가 다음 화 기대를 높이는가', status: 'pending', metric: '복귀율 / 다음 화 클릭률', owner: '레노버' },
          { id: 'H5', title: '메타층 장치가 과잉 설명 없이 작동하는가', status: 'pending', metric: '코멘트 질 / 혼란 지점 수', owner: 'sfex11' }
        ],
        queue: [
          { type: 'image', label: 'EP001 P04 재시도', note: 'style-drift와 composition 이슈 동시 해결 필요', owner: '대구루' },
          { type: 'review', label: 'EP001 리뷰 라운드', note: 'A/B 후보 선택과 수정 범위 결정', owner: 'sfex11' },
          { type: 'results', label: 'EP001 results.md 초안', note: '관측 항목과 H1 연결 준비', owner: '레노버' }
        ]
      }
    },
    {
      id: 'CLE2-8',
      cle2Id: 'CLE2-8',
      slug: 'agent-builder-evolution',
      title: 'agent_builder_public, CLE2 구조 흡수하여 커뮤니티 중심 레포로 진화',
      issue: 20,
      prs: [4, 5, 6, 10, 11],
      deliverables: [],
      goal: {
        objective: 'agent_builder_public을 단순 starter-kit 문서에서 살아있는 커뮤니티 레포로 진화. CLE2의 태스크 관리, team-memory 통합, SPA 대시보드, Discord 연동 구조를 흡수하여 스터디/커뮤니티 버전의 CLE2를 만든다.',
        successCriteria: [
          'agent_builder_public에 tasks/ 폴더 + GOAL/PLAN/STATUS/TESTS 템플릿이 도입된다',
          'team-memory-kit 파이프라인이 스터디 기록에 연동된다',
          'CLE2 스타일 SPA 대시보드가 agent_builder용으로 분기/커스터마이즈된다',
          '이슈 기반 운영이 활성화된다',
          'Discord 연동으로 미션 제출 → 알림 → 피드백 루프가 구축된다'
        ],
        scope: {
          in: ['tasks/ 구조 도입 (AB-N 네이밍)', 'context/records + context/registry 설계', 'team-memory-kit CLI 연동', 'CLE2 SPA 코드 기반 커뮤니티 대시보드', '이슈 템플릿 및 첫 이슈 생성', 'Discord webhook 연동'],
          out: ['CLE2 코드 전체 복사', 'Obsidian vault 구조 변경', '외부 사이트 배포 자동화 완성']
        }
      },
      plan: {
        phases: [
          { name: 'Phase 1 · 태스크 관리 구조 도입', owner: '대구루', status: 'pending' },
          { name: 'Phase 2 · team-memory 통합', owner: '대구루', status: 'pending' },
          { name: 'Phase 3 · SPA 대시보드 (CLE2 스타일)', owner: '대구루', status: 'pending' },
          { name: 'Phase 4 · 이슈 기반 운영 활성화', owner: '대구루', status: 'pending' },
          { name: 'Phase 5 · Discord 연동', owner: '대구루', status: 'pending' }
        ]
      },
      status: {
        state: 'done',
        progress: { current: 5, total: 5 },
        completedTasks: ['GitHub Issue #20 생성', 'CLE2 대시보드 구조 분석', 'CLE2-8 task 문서 생성', 'Phase 1: tasks/ 구조 도입 (PR #4)', 'Phase 2: team-memory 통합 (PR #5)', 'Phase 3: SPA 대시보드 (PR #6)', 'Phase 4: 이슈 기반 운영 (PR #10)', 'Phase 5: Discord 연동 (PR #11)'],
        currentTasks: [],
        nextTasks: [],
        blockers: []
      },
      tests: {
        items: [
          { name: 'tasks/ 폴더 구조', method: '리포 확인', expected: 'tasks/ + _template/ (GOAL/PLAN/STATUS/TESTS) 가 존재한다', passed: true },
          { name: 'AB-N 네이밍 규칙', method: '문서 리뷰', expected: '스터디 미션 → 태스크 매핑 규칙이 문서화되어 있다', passed: true },
          { name: 'team-memory 구조', method: '리포 확인', expected: 'context/records/ + context/registry/ 가 존재한다', passed: true },
          { name: 'SPA 대시보드 홈', method: '브라우저 확인', expected: '스터디 현황이 표시된다', passed: true },
          { name: 'SPA 미션 페이지', method: '브라우저 확인', expected: '주차별 미션 리스트 + 필터가 동작한다', passed: true },
          { name: '이슈 템플릿', method: '리포 확인', expected: '.github/ISSUE_TEMPLATE/에 템플릿이 있다', passed: true },
          { name: 'Discord 알림', method: '통합 테스트', expected: '미션 제출 시 Discord에 알림이 전송된다', passed: true },
          { name: 'README living example', method: '문서 리뷰', expected: 'README가 CLE2-style 운영 방식을 설명한다', passed: true }
        ]
      }
    },
    {
      id: 'CLE2-8b',
      cle2Id: 'CLE2-8b',
      slug: 'daily-improvement-question',
      title: '매일 CLE2 개선 질문하기',
      issue: 22,
      prs: [],
      deliverables: [],
      goal: {
        objective: 'CLE2 시스템을 매일 조금씩 개선하는 질문 루틴을 만든다. 하루 한 가지 개선 질문을 생성하고 답변하여 CLE2를 지속적으로 발전시킨다.',
        successCriteria: [
          '질문 생성 로직이 구현된다',
          '최초 개선 질문 1건이 등록된다',
          '질문-답변 루프가 일일 리듬에 통합된다'
        ],
        scope: {
          in: ['질문 템플릿 설계', '질문 생성 스크립트', '일일 리듬 연동'],
          out: ['자동 답변 생성', '외부 발송']
        }
      },
      plan: {
        phases: [
          { name: 'Phase 1 · 질문 생성 로직 설계', owner: '대구루', status: 'pending' },
          { name: 'Phase 2 · 최초 질문 등록', owner: '대구루', status: 'pending' },
          { name: 'Phase 3 · 일일 리듬 통합', owner: '대구루', status: 'pending' }
        ]
      },
      status: {
        state: 'proposed',
        progress: { current: 0, total: 3 },
        completedTasks: [],
        currentTasks: ['Phase 1: 질문 생성 로직 설계', '최초 개선 질문 1건 등록'],
        nextTasks: [],
        blockers: []
      },
      tests: {
        items: [
          { name: '질문 템플릿', method: '문서 리뷰', expected: '개선 질문 템플릿이 존재한다', passed: false },
          { name: '첫 질문 등록', method: '리포 확인', expected: '최초 1건의 개선 질문이 등록되어 있다', passed: false },
          { name: '일일 리듬', method: '운영 확인', expected: '일일 질문 루프가 동작한다', passed: false }
        ]
      }
    },
    {
      id: 'CLE2-9',
      cle2Id: 'CLE2-9',
      slug: 'three-body-cle3',
      title: '삼체 연재 만화 창작 시스템 (CLE3)',
      issue: 24,
      goal: {
        objective: '`three-body-comic` 저장소와 기존 CLE/CLE2 운영 경험을 바탕으로, 삼체 연재 만화의 기획, 생성, 교정, 배포, 관측까지를 사용자와 AI 에이전트가 함께 다루는 창작 시스템 CLE3를 정의하고 구현 기준을 세운다.',
        successCriteria: [
          '`three-body-comic` 현재 구조를 기준으로 CLE3의 시스템 경계와 핵심 객체가 정리된다',
          'GitHub + GitHub Pages + Discord + OpenClaw + Codex 연동 범위가 문서화된다',
          '스토리, 화풍, 캐릭터, 패널, 결과물 교정의 협업 루프가 단계별로 정의된다',
          'CLE2-7에서 만든 운영 레이어와 CLE3에서 새로 필요한 창작 레이어가 구분된다',
          'CLE2 대시보드에서 CLE2-9 진행 상태와 의사결정을 추적할 수 있다'
        ],
        scope: {
          in: ['three-body-comic 구조 분석', 'CLE/CLE2/CLE2-7 자산 기반 CLE3 재정의', 'GitHub/Pages/Discord/OpenClaw/Codex 연동 설계', '인간+AI 협업 창작 단계 정의', 'CLE2 대시보드 반영'],
          out: ['이미지 생성 모델 자체 개발', '실서비스 운영 계정 세팅 완료', 'three-body-comic 전체 제작 대행', '완전 자동 만화 생성 즉시 구현']
        }
      },
      discovery: {
        unknowns: {
          knownKnown: ['CLE3 산출물의 원본은 episodes/EPxxx 내부에 둔다', 'EP001/EP002는 Phase 4 패널 생성 중이다'],
          knownUnknown: ['EP002의 15p script와 16p storyboard/panels rebaseline 시점', '자동 이미지 생성과 Vision QA 실행기의 최종 연결 방식', 'Git 원본과 localStorage QA 기록 동기화 방식'],
          unknownKnown: ['운영자가 캐릭터 일관성, 장면 충실도, 흥행 훅 중 실제로 우선하는 기준'],
          unknownUnknown: ['페이지 병렬 생성이 만드는 장면 연속성 드리프트', '오래된 storyboard 기준을 판단 메타데이터가 정당화할 위험']
        },
        tools: [
          { name: 'GitHub / CLE2', status: 'available', purpose: '요구사항, 결정, PR 관리' },
          { name: 'CLE3 파일 / 쉘', status: 'available', purpose: '생성 큐와 산출물 관리' },
          { name: 'Codex imagegen', status: 'available', purpose: 'CLE3 내부 패널 생성' },
          { name: 'GitHub Pages', status: 'available', purpose: 'Episode Workspace 조회' }
        ],
        references: ['CLE3 AGENTS.md', 'config/panel-generation-policy.json', 'docs/AUTONOMOUS-PANEL-GENERATION.md', 'CLE2-9 OBJECT-MODEL.md'],
        needsDecision: ['EP002 rebaseline 시점', '최종 공개 승인'],
        assumptions: ['EP001을 Discovery/Decision/Approval 데이터의 시범 에피소드로 사용한다.'],
        challenge: '정상 패널은 제한 병렬화하고 예외 및 네 승인 게이트만 사람에게 올려 자율 생성 속도와 창작 통제를 함께 확보한다.'
      },
      plan: {
        phases: [
          { name: 'Phase 1 · 현재 자산 분석 및 문제 재정의', owner: '대구루', status: 'done' },
          { name: 'Phase 2 · CLE3 시스템 경계 및 핵심 객체 정의', owner: '대구루', status: 'done' },
          { name: 'Phase 3 · 협업 루프 설계', owner: '레노버', status: 'done' },
          { name: 'Phase 4 · 통합 연동 구조 정의', owner: '대구루', status: 'in-progress' },
          { name: 'Phase 5 · CLE2 반영 및 후속 구현 이슈 분해', owner: '대구루', status: 'in-progress' }
        ]
      },
      status: {
        state: 'in-progress',
        progress: { current: 4, total: 5 },
        completedTasks: ['GitHub Issue #24 생성', 'CLE2-7과 three-body-comic 기존 구조 파악', 'CLE2-9 task 문서 초기 생성', 'CLE2-7과 CLE3 경계 재정리', 'CLE3 객체 모델 정의', 'CLE2-10~12 후속 구현 이슈 분해와 연결', 'creative-loop-engineering3 저장소/Pages 기준 실제 구현 착수', 'CLE2-13 Discovery/Decision/Approval 프로토콜을 EP001~EP005에 적용'],
        currentTasks: ['CLE3 패널 생성과 QA 자동 실행 연결', '하위 구현 태스크(CLE2-10~13)의 실제 운영 상태 추적'],
        nextTasks: ['EP002 기준선 rebaseline 결정', 'Discovery 입력 비용과 재작업 감소 효과 측정', 'Discord/OpenClaw 운영 연결 범위 구체화'],
        blockers: ['CLE2 앱에는 아직 상위 태스크 / 하위 구현 태스크 상태를 한눈에 보여주는 전용 UI가 없음']
      },
      tests: {
        items: [
          { name: 'CLE2-9 task 문서', method: '리포 확인', expected: 'GOAL/DISCOVERY/PLAN/STATUS/TESTS/DECISIONS 문서가 존재한다', passed: true },
          { name: '이슈 연결', method: '문서 리뷰', expected: '모든 문서가 GitHub Issue #24 / CLE2-ID 9와 정합하다', passed: true },
          { name: '경계 정의', method: '문서 리뷰', expected: 'CLE2-7과 CLE3의 책임 차이가 명시된다', passed: true },
          { name: '객체 모델 정의', method: '문서 리뷰', expected: 'Story/Style/Character/Episode/Panel/Results 객체가 정의된다', passed: true },
          { name: '연동 흐름 정의', method: '문서 리뷰', expected: 'GitHub/Pages/Discord/OpenClaw/Codex 흐름이 설명된다', passed: true },
          { name: 'CLE2 대시보드 카드', method: '브라우저 확인', expected: 'CLE2-9 카드가 Tasks 목록과 상세에 표시된다', passed: true }
        ]
      },
      relatedTasks: [
        {
          id: 'CLE2-7',
          relation: '선행 기반 작업',
          note: 'CLE2-7에서 운영 시스템과 제작 파이프라인을 정리했고, CLE2-9는 그 위에서 CLE3 창작 객체와 협업 구조를 정의한다.'
        },
        {
          id: 'CLE2-10',
          relation: '후속 구현 태스크',
          note: 'CharacterSheet, StylePack, Panel 기준 정합성 린트 규칙과 결과 포맷을 구체화한다.'
        },
        {
          id: 'CLE2-11',
          relation: '후속 구현 태스크',
          note: '패널 시각 검수, 승인/반려 흐름, ReviewNote 연결 규칙을 다룬다.'
        },
        {
          id: 'CLE2-12',
          relation: '후속 구현 태스크',
          note: 'Story/Episode/Scene/Panel/Results를 한 흐름으로 보여주는 작업 뷰 기준을 다룬다.'
        },
        {
          id: 'CLE2-13',
          relation: '운영 프로토콜',
          note: 'Tool First, Unknown Discovery, 판단 근거 기록과 사람 승인 게이트를 CLE3에 적용한다.'
        }
      ],
      docs: [
        {
          title: '후속 구현 이슈 초안',
          path: 'tasks/CLE2-9/three-body-cle3/FOLLOW-UP-ISSUES.md',
          description: '정합성 린트, Vision QA, Episode Workspace로 분해하는 후속 태스크 계획'
        },
        {
          title: 'CLE3 객체 모델',
          path: 'tasks/CLE2-9/three-body-cle3/OBJECT-MODEL.md',
          description: 'TB/HM 원리를 Story, Episode, Panel, Review, Results 객체로 매핑한 기준 문서'
        },
        {
          title: 'CLE3 분석 보고서',
          path: 'tasks/CLE2-9/three-body-cle3/research/00-cle3-analysis-report.md',
          description: '파이프라인 결함, 정합성 린트, QA 구조 개선 제안'
        },
        {
          title: '지식 반영 가이드',
          path: 'tasks/CLE2-9/three-body-cle3/research/01-knowledge-integration-guide.md',
          description: '흥행 분석을 프롬프트, 루브릭, 가설 루프에 주입하는 방법'
        },
        {
          title: '삼체 흥행 원리',
          path: 'tasks/CLE2-9/three-body-cle3/research/02-three-body-appeal.md',
          description: '삼체 원작의 매력을 각색 규칙으로 정리한 원리 문서'
        },
        {
          title: '흥행 만화 구조 패턴',
          path: 'tasks/CLE2-9/three-body-cle3/research/03-hit-manga-structure-patterns.md',
          description: '연재 훅, 떡밥, 페이지 리듬을 규칙으로 정리한 구조 패턴'
        }
      ]
    },
    {
      id: 'CLE2-10',
      cle2Id: 'CLE2-10',
      slug: 'cle3-consistency-lint',
      title: 'CLE3 정합성 린트 시스템',
      issue: 26,
      goal: {
        objective: 'CLE3의 CharacterSheet, StylePack, Panel 객체를 기준으로 정합성 위반을 자동 또는 반자동으로 점검하는 린트 시스템의 기준을 정의한다.',
        successCriteria: [
          'CharacterSheet / StylePack / Panel 기준 린트 대상과 규칙 범주가 문서화된다',
          '린트 입력 포맷과 출력 포맷이 정의된다',
          'ReviewNote의 consistency 카테고리와 연결 방식이 정리된다',
          'CLE2-9 객체 모델과의 관계가 명시된다',
          'CLE2 대시보드에서 CLE2-10 상태를 추적할 수 있다'
        ],
        scope: {
          in: ['캐릭터/스타일/패널 정합성 린트 규칙', '입력/출력 포맷', 'ReviewNote 연결', 'CLE2 대시보드 반영'],
          out: ['이미지 모델 재학습', 'Vision QA 승인 플로우 전체 구현', 'three-body-comic 전체 자동 수정']
        }
      },
      plan: {
        phases: [
          { name: 'Phase 1 · 린트 범주 정의', owner: '대구루', status: 'done' },
          { name: 'Phase 2 · 결과 포맷 설계', owner: '대구루', status: 'done' },
          { name: 'Phase 3 · 운영 연결 정리', owner: '레노버', status: 'done' },
          { name: 'Phase 4 · CLE3 화면 반영', owner: '대구루', status: 'in-progress' }
        ]
      },
      status: {
        state: 'in-progress',
        progress: { current: 3, total: 4 },
        completedTasks: ['CLE2-10 task 문서 초기 생성', 'CLE2-9 후속 구현 태스크로 연결', '린트 범주 초안 작성', '입력/출력 포맷과 ReviewNote 연결 규칙 초안 작성', 'three-body-comic 저장 경로 기준과 Vision QA handoff 규칙 정리', 'CLE3 overview/QA 화면에 lint report 1차 반영'],
        currentTasks: ['script / storyboard / panels / results 교차 비교 규칙을 실제 CLE3 app에 연결', 'warning / info 수준을 에피소드별로 더 세분화'],
        nextTasks: ['lint rule 세부 목록을 실제 캐릭터/스타일팩 기준으로 보강', 'CLE2-11 Vision QA 루브릭과 승인 기준 정합화', 'three-body-comic 실제 패널 폴더 구조 확정 시 경로 규칙 미세 조정'],
        blockers: []
      },
      tests: {
        items: [
          { name: 'task 문서 존재', method: '리포 확인', expected: 'GOAL/PLAN/STATUS/TESTS/DECISIONS 문서가 존재한다', passed: true },
          { name: '상위 태스크 연결', method: '문서 리뷰', expected: 'CLE2-9와의 관계가 문서와 대시보드에 명시된다', passed: true },
          { name: '린트 범주 정의', method: '문서 리뷰', expected: '캐릭터/스타일/패널/교차 객체 린트 범주가 정리된다', passed: true },
          { name: '결과 포맷 정의', method: '문서 리뷰', expected: '입력/출력 schema 초안이 정리된다', passed: true },
          { name: 'ReviewNote 연결 규칙', method: '문서 리뷰', expected: 'lint finding이 consistency ReviewNote로 변환되는 규칙이 있다', passed: true },
          { name: 'CLE3 화면 반영', method: '브라우저 확인', expected: 'Episode Workspace overview/QA 탭에 lint status와 finding 요약이 표시된다', passed: true }
        ]
      },
      relatedTasks: [
        {
          id: 'CLE2-9',
          relation: '상위 기반 태스크',
          note: 'CLE2-9에서 정의한 CLE3 객체 모델을 기준으로 정합성 규칙을 구현 단위로 구체화한다.'
        }
      ],
      docs: [
        {
          title: 'GOAL',
          path: 'tasks/CLE2-10/cle3-consistency-lint/GOAL.md',
          description: '정합성 린트 시스템 목표와 범위'
        },
        {
          title: 'PLAN',
          path: 'tasks/CLE2-10/cle3-consistency-lint/PLAN.md',
          description: '린트 범주, 결과 포맷, 운영 연결 계획'
        },
        {
          title: 'LINT SPEC',
          path: 'tasks/CLE2-10/cle3-consistency-lint/LINT-SPEC.md',
          description: '린트 범주, severity, 입출력 스키마, 저장 경로, Vision QA handoff 규칙'
        },
        {
          title: 'TESTS',
          path: 'tasks/CLE2-10/cle3-consistency-lint/TESTS.md',
          description: '정합성 린트 태스크의 검증 기준'
        }
      ]
    },
    {
      id: 'CLE2-11',
      cle2Id: 'CLE2-11',
      slug: 'cle3-vision-qa',
      title: 'CLE3 Vision QA / 결과 검수 시스템',
      issue: 27,
      goal: {
        objective: '생성된 패널 후보를 시각적으로 검수하고 승인, 반려, 수정 요청으로 연결하는 CLE3 Vision QA 기준을 정의한다.',
        successCriteria: [
          'Panel.selectedResult 선택 기준이 문서화된다',
          'ReviewNote의 clarity, composition, emotion 카테고리 연결 규칙이 정리된다',
          '사람 승인 포인트와 AI 재시도 포인트가 구분된다',
          'CLE2-9 객체 모델 및 CLE2-10 린트와의 경계가 명확해진다',
          'CLE2 대시보드에서 CLE2-11 상태를 추적할 수 있다'
        ],
        scope: {
          in: ['패널 시각 검수 루브릭', '승인/반려/수정 요청 상태 모델', 'ReviewNote 기록 방식', 'CLE2 반영'],
          out: ['이미지 모델 개선', '정합성 린트 규칙 엔진 구현', '배포 후 반응 분석 자동화']
        }
      },
      plan: {
        phases: [
          { name: 'Phase 1 · 검수 기준 정의', owner: '레노버', status: 'done' },
          { name: 'Phase 2 · 승인 흐름 설계', owner: '대구루', status: 'done' },
          { name: 'Phase 3 · UI 반영 기준 정리', owner: '대구루', status: 'done' },
          { name: 'Phase 4 · CLE3 리뷰 워크플로우 반영', owner: '대구루', status: 'in-progress' }
        ]
      },
      status: {
        state: 'in-progress',
        progress: { current: 3, total: 4 },
        completedTasks: ['CLE2-11 task 문서 초기 생성', 'CLE2-9 후속 구현 태스크로 연결', 'Vision QA 루브릭 초안 작성', '승인/반려 상태 모델과 ReviewNote 연결 규칙 정리', 'CLE2 UI 노출 기준과 episodes/EPxxx/results.md 반영 포맷 정리', 'CLE3 QA 탭에 에피소드 단위 리뷰 상태/메모/export UI 1차 반영'],
        currentTasks: ['패널 단위 승인/반려 상태로 세분화', 'results.md 반영용 export 포맷을 더 구조화'],
        nextTasks: ['CLE2-12 Episode Workspace 정보 구조 안에 QA summary 배치 기준 연결', '실제 episode results.md 템플릿에 Vision QA Summary 섹션 반영 여부 결정', 'conditional 상태 운영 라운드 규칙 보강'],
        blockers: []
      },
      tests: {
        items: [
          { name: 'task 문서 존재', method: '리포 확인', expected: 'GOAL/PLAN/STATUS/TESTS/DECISIONS 문서가 존재한다', passed: true },
          { name: '상위 태스크 연결', method: '문서 리뷰', expected: 'CLE2-9와의 관계가 문서와 대시보드에 명시된다', passed: true },
          { name: 'Vision QA 루브릭', method: '문서 리뷰', expected: '시각 검수 기준과 평가 축이 정리된다', passed: true },
          { name: '승인 흐름 정의', method: '문서 리뷰', expected: '승인/반려/재시도 흐름과 상태 모델이 정리된다', passed: true },
          { name: 'lint handoff 기준', method: '문서 리뷰', expected: 'CLE2-10에서 CLE2-11로 넘어오는 입력 조건이 정리된다', passed: true },
          { name: 'CLE3 QA 탭 반영', method: '브라우저 확인', expected: 'QA 탭에 승인/수정 요청/보류 상태와 리뷰 메모, markdown export가 표시된다', passed: true }
        ]
      },
      relatedTasks: [
        {
          id: 'CLE2-9',
          relation: '상위 기반 태스크',
          note: 'CLE2-9의 Panel, ReviewNote 객체 정의를 바탕으로 시각 검수와 승인 흐름을 구체화한다.'
        },
        {
          id: 'CLE2-10',
          relation: '인접 구현 태스크',
          note: '정합성 린트는 규칙 점검이고, CLE2-11은 실제 시각 결과의 승인/반려 흐름을 다룬다.'
        }
      ],
      docs: [
        {
          title: 'GOAL',
          path: 'tasks/CLE2-11/cle3-vision-qa/GOAL.md',
          description: 'Vision QA 시스템 목표와 범위'
        },
        {
          title: 'PLAN',
          path: 'tasks/CLE2-11/cle3-vision-qa/PLAN.md',
          description: '검수 기준, 승인 흐름, UI 반영 계획'
        },
        {
          title: 'VISION QA RUBRIC',
          path: 'tasks/CLE2-11/cle3-vision-qa/VISION-QA-RUBRIC.md',
          description: '평가 축, 점수 체계, 승인 상태 모델, lint handoff 기준'
        },
        {
          title: 'UI / Results Format',
          path: 'tasks/CLE2-11/cle3-vision-qa/UI-AND-RESULTS-FORMAT.md',
          description: 'CLE2 UI 요약 항목, episode results 반영 형식, lint와의 역할 분리 기준'
        },
        {
          title: 'TESTS',
          path: 'tasks/CLE2-11/cle3-vision-qa/TESTS.md',
          description: 'Vision QA 태스크의 검증 기준'
        }
      ]
    },
    {
      id: 'CLE2-12',
      cle2Id: 'CLE2-12',
      slug: 'cle3-episode-workspace',
      title: 'CLE3 Episode Workspace / 에피소드 작업 뷰',
      issue: 28,
      goal: {
        objective: 'Story, Episode, Scene, Panel, Results 객체를 실제 작업 흐름으로 묶어 보여주는 에피소드 작업 뷰 기준을 정의한다.',
        successCriteria: [
          'Episode 중심 작업 뷰의 핵심 화면과 정보 구조가 문서화된다',
          'script / storyboard / panels / release / results 연결 방식이 정리된다',
          'CLE2-7 STUDIO와의 경계가 명시된다',
          'CLE2-9 객체 모델과의 관계가 명시된다',
          'CLE2 대시보드에서 CLE2-12 상태를 추적할 수 있다'
        ],
        scope: {
          in: ['에피소드 중심 작업 뷰 정보 구조', '객체 간 연결 방식', 'STUDIO와의 역할 분리', 'CLE2 반영'],
          out: ['완성 UI 전면 구현', '백엔드 자동화 구축', '공개 뷰어 전체 대체']
        }
      },
      plan: {
        phases: [
          { name: 'Phase 1 · 정보 구조 정의', owner: '대구루', status: 'done' },
          { name: 'Phase 2 · 실제 구조 매핑', owner: '대구루', status: 'done' },
          { name: 'Phase 3 · STUDIO 경계 정리', owner: '대구루', status: 'done' },
          { name: 'Phase 4 · CLE3 Workspace 구현 반영', owner: '대구루', status: 'in-progress' }
        ]
      },
      status: {
        state: 'in-progress',
        progress: { current: 3, total: 4 },
        completedTasks: ['CLE2-12 task 문서 초기 생성', 'CLE2-9 후속 구현 태스크로 연결', 'Episode Workspace 정보 구조 초안 작성', 'EP001 기준 실제 파일 -> 화면 요소 매핑표 작성', 'STUDIO 경계 문서화 및 CLE2 화면 배치 기준 정리', 'CLE3 저장소에서 EP001~EP005 기반 실제 Episode Workspace 1차 구현', 'EP001~EP005 Discovery/Decision/Approval 조회와 개요 요약 추가'],
        currentTasks: ['패널 단위 QA와 Discovery 에스컬레이션 상태 연결'],
        nextTasks: ['승인 export를 Git 원본으로 확정하는 저장 흐름 구현', '패널 하위 파일 구조 확정 시 lint / vision-qa 위치 미세 조정'],
        blockers: []
      },
      tests: {
        items: [
          { name: 'task 문서 존재', method: '리포 확인', expected: 'GOAL/PLAN/STATUS/TESTS/DECISIONS 문서가 존재한다', passed: true },
          { name: '상위 태스크 연결', method: '문서 리뷰', expected: 'CLE2-9와의 관계가 문서와 대시보드에 명시된다', passed: true },
          { name: '정보 구조 정의', method: '문서 리뷰', expected: 'Episode 중심 작업 뷰 정보 구조가 정리된다', passed: true },
          { name: '실제 구조 매핑', method: '문서 리뷰', expected: 'three-body-comic 구조와 연결표가 정리된다', passed: true },
          { name: 'EP001 파일 매핑', method: '문서 리뷰', expected: 'EP001의 script/storyboard/results/panels가 화면 요소와 연결된다', passed: true },
          { name: 'CLE3 Workspace 구현', method: '브라우저 확인', expected: 'EP001~EP005가 Episode Workspace에서 열리고, json/markdown fallback이 동작한다', passed: true },
          { name: 'Discovery 운영 데이터', method: '브라우저 확인', expected: 'EP001~EP005에서 Unknown, 도구, 판단 기록과 승인 게이트가 조회된다', passed: true }
        ]
      },
      relatedTasks: [
        {
          id: 'CLE2-9',
          relation: '상위 기반 태스크',
          note: 'CLE2-9 객체 모델을 바탕으로 Story/Episode/Scene/Panel/Results를 실제 작업 화면 흐름으로 엮는다.'
        },
        {
          id: 'CLE2-7',
          relation: '선행 운영 기반',
          note: 'CLE2-7 STUDIO 보드는 운영/큐 관리이고, CLE2-12는 창작 객체 중심 작업 뷰를 다룬다.'
        }
      ],
      docs: [
        {
          title: 'GOAL',
          path: 'tasks/CLE2-12/cle3-episode-workspace/GOAL.md',
          description: 'Episode Workspace 목표와 범위'
        },
        {
          title: 'PLAN',
          path: 'tasks/CLE2-12/cle3-episode-workspace/PLAN.md',
          description: '정보 구조, 실제 구조 매핑, STUDIO 경계 정리 계획'
        },
        {
          title: 'Information Architecture',
          path: 'tasks/CLE2-12/cle3-episode-workspace/INFORMATION-ARCHITECTURE.md',
          description: 'Episode 중심 화면 구조와 script/storyboard/panels/results 대응 관계'
        },
        {
          title: 'File to UI Mapping',
          path: 'tasks/CLE2-12/cle3-episode-workspace/FILE-TO-UI-MAPPING.md',
          description: 'EP001 실제 파일을 Episode Header, Scene, Panel, Results 화면으로 매핑한 기준'
        },
        {
          title: 'Studio Boundary / Layout',
          path: 'tasks/CLE2-12/cle3-episode-workspace/STUDIO-BOUNDARY-AND-LAYOUT.md',
          description: 'STUDIO와 Episode Workspace의 역할 차이, CLE2 화면 배치 옵션과 추천안'
        },
        {
          title: 'TESTS',
          path: 'tasks/CLE2-12/cle3-episode-workspace/TESTS.md',
          description: 'Episode Workspace 태스크의 검증 기준'
        }
      ]
    },
    {
      id: 'CLE2-13',
      cle2Id: 'CLE2-13',
      slug: 'ai-collaboration-protocol',
      title: 'AI 협업 운영 프로토콜',
      issue: 29,
      prs: [],
      deliverables: [],
      goal: {
        objective: 'CLE2 요구사항 관리와 CLE3 실행 파이프라인에 Tool First, Unknown Discovery, Human in the Loop, 판단 근거 기록을 공통 운영 규칙으로 적용한다.',
        successCriteria: [
          'CLE2 표준 태스크에 DISCOVERY.md가 포함된다',
          'CLE2 상세 화면에서 Unknown, 도구, 레퍼런스, 사람 결정 항목을 조회할 수 있다',
          'DECISIONS.md가 근거, 확신도, 불확실성, 대안, 승인 상태를 기록한다',
          'CLE3 EP001에서 discovery, decisions, approvals 데이터가 조회된다',
          'CLE3 패널 작업 계획에 판단 근거, 가정, 불확실성이 포함된다'
        ],
        scope: {
          in: ['CLE2 태스크 템플릿과 UI', 'CLE3 Episode Workspace와 패널 작업 큐', '중요 승인 게이트와 예외 에스컬레이션'],
          out: ['모델의 비공개 내부 사고 과정 저장', '모든 작업 단계의 사람 승인 의무화', '외부 모델 자체의 성능 개선']
        }
      },
      discovery: {
        unknowns: {
          knownKnown: ['CLE2는 요구사항별 표준 문서를 관리한다', 'CLE3는 Phase, 스키마, 패널 큐, Vision QA를 가지고 있다'],
          knownUnknown: ['다른 프로젝트에도 동일한 승인 게이트가 적절한가', 'Unknown 항목의 종료 또는 폐기 기준', '자동 QA 연결 후 판단 기록 비용'],
          unknownKnown: ['팀의 암묵적 코딩 스타일과 리뷰 관행', '운영자가 실제로 중요하게 보는 품질 기준과 승인 속도'],
          unknownUnknown: ['Discovery가 형식적 시작 지연이 될 위험', '낮은 확신도의 판단 누적', 'localStorage와 Git 원본의 상태 불일치']
        },
        tools: [
          { name: 'GitHub', status: 'available', purpose: '이슈, PR, 장기 기록' },
          { name: '로컬 파일 / 쉘', status: 'available', purpose: '구현과 검증' },
          { name: 'CLE3 이미지 생성', status: 'available', purpose: '실제 패널 산출' },
          { name: 'GitHub Pages', status: 'available', purpose: '조회 UI' }
        ],
        references: ['tasks/_template/', 'CLE3 panel-generation-policy.json', 'CLE2-8 / #22', 'CLE2-9 / #24'],
        needsDecision: ['CLE3 시범 적용 결과를 다른 프로젝트 공통 규칙으로 확대할지 결정'],
        assumptions: ['CLE2가 운영 규칙을 소유하고 각 실행 시스템이 기계 판독 데이터를 소유한다.'],
        challenge: '정상 경로는 정책으로 자동화하고 예외와 가치 판단만 사람에게 올려 자율성과 통제를 함께 확보한다.'
      },
      plan: {
        phases: [
          { name: 'Phase 1 · CLE2 문서 프로토콜', owner: 'Codex', status: 'done' },
          { name: 'Phase 2 · CLE2 조회 UI', owner: 'Codex', status: 'done' },
          { name: 'Phase 3 · CLE3 전체 에피소드 적용', owner: 'Codex', status: 'done' },
          { name: 'Phase 4 · 실행 큐 및 검증', owner: 'Codex', status: 'done' }
        ]
      },
      status: {
        state: 'done',
        progress: { current: 4, total: 4 },
        completedTasks: ['GitHub Issue #29 생성', 'CLE2 표준 DISCOVERY.md와 조회 UI 추가', '기존 5개 템플릿 확장', 'CLE2-13 문서 세트 작성', 'CLE3 EP001~EP005 governance 데이터 추가', '패널 큐 판단 메타데이터와 CI 검증 추가', 'CLE2/CLE3 데스크톱·모바일 브라우저 검증'],
        currentTasks: [],
        nextTasks: ['실제 운영에서 Discovery 입력 비용과 재작업 감소 효과 측정'],
        blockers: []
      },
      tests: {
        items: [
          { name: 'CLE2 템플릿', method: '파일 검사', expected: '표준 6개 문서와 확장 필드가 존재한다', passed: true },
          { name: 'CLE2 Discovery 조회', method: '브라우저 확인', expected: 'Unknown, 도구, 레퍼런스, 사람 결정 항목이 보인다', passed: true },
          { name: 'CLE3 전체 에피소드 Discovery', method: 'JSON/브라우저 확인', expected: 'EP001~EP005에서 세 운영 파일이 조회된다', passed: true },
          { name: '패널 작업 계획', method: '스크립트 실행', expected: '선택 결과에 근거, 가정, 불확실성이 포함된다', passed: true },
          { name: '거버넌스 CI 검증', method: '스크립트 실행', expected: '5개 에피소드의 파일, 게이트, 참조와 패널 큐 메타데이터가 통과한다', passed: true }
        ]
      },
      relatedTasks: [
        { id: 'CLE2-8', relation: '일일 탐색 루프', note: 'Blind Spot Scan과 트레이드오프 재검토를 반복 실행한다.' },
        { id: 'CLE2-9', relation: '첫 적용 대상', note: 'CLE3에 Discovery, 판단 기록과 사람 승인 게이트를 시범 적용한다.' },
        { id: 'CLE2-12', relation: '조회 UI 기반', note: 'Episode Workspace에서 실행 상태와 사람 결정 항목을 함께 보여준다.' }
      ],
      docs: [
        { title: 'DISCOVERY', path: 'tasks/CLE2-13/ai-collaboration-protocol/DISCOVERY.md', description: 'Unknown Map, 도구, 레퍼런스와 실행 전 판단' },
        { title: 'PLAN', path: 'tasks/CLE2-13/ai-collaboration-protocol/PLAN.md', description: 'CLE2 문서/UI와 CLE3 시범 적용 계획' },
        { title: 'DECISIONS', path: 'tasks/CLE2-13/ai-collaboration-protocol/DECISIONS.md', description: '운영 프로토콜의 판단 근거와 불확실성' },
        { title: 'TESTS', path: 'tasks/CLE2-13/ai-collaboration-protocol/TESTS.md', description: '두 저장소의 완료 및 운영 검증 기준' }
      ]
    },
    {
      id: 'CLE2-16',
      cle2Id: 'CLE2-16',
      slug: 'creatorflow-agentic-commerce',
      title: 'CreatorFlow Agentic Creator Commerce',
      issue: 42,
      prs: [43],
      deliverables: [
        { title: '기존 Solana DApp Hub', type: 'link', url: 'https://daegu-agent-crew.github.io/ai-solana-agent/', description: 'CreatorFlow가 배포될 기존 GitHub Pages 허브' },
        { title: 'CreatorFlow 개발 이슈', type: 'link', url: 'https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/issues/42', description: 'CLE2-16 범위와 진행 기록' }
      ],
      goal: {
        objective: 'OpenClaw Gemini 기반 Brand Agent와 Creator Agent가 웹에서 YouTube 크리에이터 협업을 협상하고, Solana Devnet USDC를 위임 한도 안에서 자동 정산하는 해커톤 MVP를 구축한다.',
        successCriteria: [
          '두 OpenClaw Agent가 CreatorFlow 웹페이지에서 지갑 서명으로 등록하고 협상한다',
          'YouTube 영상의 채널, 공개 상태와 조회수를 실제 API 데이터로 검증한다',
          '선금 0.02, 잔금 0.03, KPI 보너스 0.01 USDC가 Devnet에서 중복 없이 지급된다',
          '사용자가 0.10 USDC delegate allowance를 승인하고 언제든 revoke할 수 있다',
          '새 저장소의 빌드가 기존 ai-solana-agent Pages의 creatorflow 경로에 배포된다',
          '3분 데모와 온체인 증빙을 포함한 해커톤 제출물이 완성된다'
        ],
        scope: {
          in: ['OpenClaw Gemini Agent 브라우저 작업', 'Agent Wallet 서명 등록', 'Cloudflare Worker/D1', 'YouTube Data API/OAuth', 'Solana Devnet USDC delegate와 3단계 지급', 'cross-repo GitHub Pages 배포'],
          out: ['Solana Mainnet 지급', 'YouTube 영상 API 업로드', '범용 인플루언서 마켓플레이스', '실제 법률 계약과 세무 처리']
        }
      },
      discovery: {
        unknowns: {
          knownKnown: ['Treasury에 Circle 공식 Devnet USDC 20과 약 4.956 Devnet SOL이 있다', '공식 Devnet USDC mint와 Treasury Token Account를 확인했다', 'OpenClaw 두 Agent의 두뇌로 Gemini를 사용한다', 'GitHub Pages와 Cloudflare를 서비스 기반으로 사용한다'],
          knownUnknown: ['OpenClaw의 Solana Wallet 서명 도구 패키징 방식', 'YouTube OAuth Client와 데모 채널 준비 상태', '새 저장소에서 기존 Pages 저장소로 배포할 인증 방식', '실제 Creator Agent 수령 지갑'],
          unknownKnown: ['기존 OpenClaw 브라우저 자동화 설정과 비밀 저장소 사용 규칙', '해커톤 데모에서 심사위원이 기대하는 Agent 자율성 표현 방식'],
          unknownUnknown: ['Devnet RPC 또는 YouTube API의 데모 당일 지연', '브라우저 자동화 중 OAuth 또는 지갑 UI 변경', '조회수 갱신 지연과 KPI 스냅샷 시점 차이']
        },
        tools: [
          { name: 'OpenClaw + Gemini', status: 'available', purpose: 'Brand/Creator Agent 추론과 브라우저 작업' },
          { name: 'GitHub Pages', status: 'available', purpose: '사람과 Agent가 사용하는 정적 UI' },
          { name: 'Cloudflare Worker/D1', status: 'available', purpose: '공유 상태, 인증 challenge, 정책과 감사 로그' },
          { name: 'Solana Devnet', status: 'verified', purpose: 'USDC delegate와 지급 증빙' },
          { name: 'YouTube Data API', status: 'setup-needed', purpose: '채널 소유권, 영상 공개 상태와 조회수 검증' }
        ],
        references: ['CreatorFlow 해커톤 기획안', 'Circle USDC contract addresses', 'Solana token delegate docs', 'YouTube Data API videos/channels docs', 'CLE2-14 Solana DApp Trio'],
        needsDecision: ['Creator Agent 수령 지갑과 YouTube 데모 채널 확정'],
        assumptions: ['Brand Agent는 초대 등록, Creator Agent는 공개 등록하되 둘 다 Solana Wallet 서명을 사용한다.'],
        challenge: 'Agent가 UI를 실제 조작하는 모습을 유지하면서도 지급은 재현 가능하고 중복 없이 안전하게 만든다.'
      },
      plan: {
        phases: [
          { name: 'Phase 1 · CLE2 개발 문서와 실행 계약', owner: 'Codex', status: 'done' },
          { name: 'Phase 2 · creatorflow-solana 저장소와 Pages UI', owner: 'Codex', status: 'done' },
          { name: 'Phase 3 · Agent 등록·협상·감사 API', owner: 'Codex', status: 'in-progress' },
          { name: 'Phase 4 · YouTube 실제 데이터 검증', owner: 'Codex', status: 'pending' },
          { name: 'Phase 5 · USDC delegate와 3단계 지급', owner: 'Codex', status: 'pending' },
          { name: 'Phase 6 · OpenClaw E2E·배포·해커톤 제출', owner: 'Codex', status: 'pending' }
        ]
      },
      status: {
        state: 'in-progress',
        progress: { current: 2, total: 6 },
        completedTasks: ['해커톤 공식 기준과 기존 4개 DApp 검증', 'YouTube 중심 MVP로 범위 변경', 'Treasury Devnet USDC 20과 공식 mint 확인', 'OpenClaw Gemini·GitHub Pages·Cloudflare 아키텍처 확정', 'CLE2-16 Issue와 개발 문서 등록', 'creatorflow-solana 저장소·Agent UI·공개 Pages 배포'],
        currentTasks: ['Agent Wallet challenge 등록과 Cloudflare Worker/D1 구현'],
        nextTasks: ['협상·감사 상태 머신', 'YouTube API 연동', 'USDC delegate 및 지급'],
        blockers: []
      },
      tests: {
        items: [
          { name: '개발 계약 문서', method: '문서와 링크 검사', expected: '아키텍처, API, 보안, 상태, 테스트와 데모 기준이 추적된다', passed: true },
          { name: 'Treasury 자산 검증', method: 'Solana Devnet RPC', expected: '공식 USDC 20과 수수료용 SOL이 확인된다', passed: true },
          { name: 'Agent 자율 등록', method: '브라우저 E2E', expected: 'Brand/Creator Agent가 challenge에 서명하고 서로 다른 역할로 등록된다', passed: false },
          { name: 'YouTube 실제 데이터', method: 'API 통합 테스트', expected: '영상 채널, 공개 상태와 조회수를 검증한다', passed: false },
          { name: 'USDC 마일스톤 지급', method: 'Devnet E2E', expected: '0.02/0.03/0.01 USDC 지급과 중복 차단이 Explorer에서 확인된다', passed: false },
          { name: 'Pages UI 배포', method: '공개 URL과 브라우저 확인', expected: 'ai-solana-agent/creatorflow 경로에서 UI가 오류 없이 동작한다', passed: true }
        ]
      },
      relatedTasks: [
        { id: 'CLE2-13', relation: '운영 프로토콜', note: 'Unknown, 판단 근거, 사람 승인과 예외 에스컬레이션 규칙을 적용한다.' },
        { id: 'CLE2-14', relation: 'Solana 선행 PoC', note: 'Phantom, Devnet, Metaplex와 Pages 배포 경험을 재사용한다.' }
      ],
      docs: [
        { title: '개발 사양서', path: 'tasks/CLE2-16/creatorflow-agentic-commerce/DEVELOPMENT-SPEC.md', description: '제품, 아키텍처, 상태 머신, 보안, 배포와 데모 실행 계약' },
        { title: 'API Reference', path: 'tasks/CLE2-16/creatorflow-agentic-commerce/API-REFERENCE.md', description: 'Cloudflare Worker API와 오류·인증·idempotency 규칙' },
        { title: 'Agent Onboarding', path: 'tasks/CLE2-16/creatorflow-agentic-commerce/AGENT-ONBOARDING.md', description: 'OpenClaw Agent가 Wallet을 만들고 웹에서 자율 등록하는 방법' },
        { title: 'DISCOVERY', path: 'tasks/CLE2-16/creatorflow-agentic-commerce/DISCOVERY.md', description: '확인된 사실, Unknown, 리스크와 실행 전 판단' },
        { title: 'PLAN', path: 'tasks/CLE2-16/creatorflow-agentic-commerce/PLAN.md', description: '저장소 생성부터 해커톤 제출까지 6단계 계획' },
        { title: 'DECISIONS', path: 'tasks/CLE2-16/creatorflow-agentic-commerce/DECISIONS.md', description: 'YouTube, OpenClaw, Gemini, Pages, Cloudflare, USDC 결정 근거' },
        { title: 'TESTS', path: 'tasks/CLE2-16/creatorflow-agentic-commerce/TESTS.md', description: '기능·보안·온체인·데모 완료 기준' }
      ]
    }
  ];

  /* ====== State ====== */
  var state = {
    currentUser: localStorage.getItem(USER_KEY) || 'sfex11',
    requests: [],
    comments: {},
    votes: {},
    messages: [],
    deliverables: {},
    studioData: {},
    settings: { discordWebhook: '', githubToken: '' },
    filter: { type: 'all', status: 'all', sort: 'newest', search: '' },
    wiki: { category: 'all', search: '' },
    tasks: { activeTab: 'goal', currentId: '' }
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
      localStorage.removeItem(STUDIO_KEY);
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

    // Load deliverables
    var rawD = localStorage.getItem(DELIVERABLE_KEY);
    if (rawD && !needsReload) {
      try { state.deliverables = JSON.parse(rawD); } catch (e) { state.deliverables = {}; }
    } else {
      state.deliverables = {};
      saveDeliverables();
    }

    var rawStudio = localStorage.getItem(STUDIO_KEY);
    if (rawStudio && !needsReload) {
      try { state.studioData = JSON.parse(rawStudio); } catch (e) { state.studioData = {}; }
    } else {
      state.studioData = {};
      saveStudioData();
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
  function saveDeliverables() {
    localStorage.setItem(DELIVERABLE_KEY, JSON.stringify(state.deliverables));
  }
  function saveStudioData() {
    localStorage.setItem(STUDIO_KEY, JSON.stringify(state.studioData));
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

  function getTask(id) {
    var tasks = getTasks();
    var task = tasks.find(function (task) { return task.id === id; });
    if (task && task.studio) {
      task.studio = getTaskStudio(task);
    }
    return task;
  }

  /* ====== GitHub Link Helpers ====== */
  var GH_REPO_URL = 'https://github.com/Daegu-Agent-Crew/creative-loop-engineering2';

  function ghIssueURL(num) {
    return GH_REPO_URL + '/issues/' + num;
  }

  function ghPrURL(num) {
    return GH_REPO_URL + '/pull/' + num;
  }

  function ghLinksHTMLforRequest(req) {
    var parts = [];
    if (req.githubIssue) {
      parts.push('<a class="gh-link gh-issue" href="' + ghIssueURL(req.githubIssue) + '" target="_blank" rel="noopener">📋 #' + req.githubIssue + '</a>');
    }
    var task = getTask('CLE2-' + req.id);
    if (task && task.prs && task.prs.length) {
      task.prs.forEach(function(prNum) {
        parts.push('<a class="gh-link gh-pr" href="' + ghPrURL(prNum) + '" target="_blank" rel="noopener">🔀 #' + prNum + '</a>');
      });
    }
    return parts.length ? '<div class="gh-links">' + parts.join('') + '</div>' : '';
  }

  function ghLinksHTMLforTask(task) {
    var parts = [];
    if (task.issue) {
      parts.push('<a class="gh-link gh-issue" href="' + ghIssueURL(task.issue) + '" target="_blank" rel="noopener">📋 Issue #' + task.issue + '</a>');
    }
    if (task.prs && task.prs.length) {
      task.prs.forEach(function(prNum) {
        parts.push('<a class="gh-link gh-pr" href="' + ghPrURL(prNum) + '" target="_blank" rel="noopener">🔀 PR #' + prNum + '</a>');
      });
    }
    return parts.length ? '<div class="gh-links">' + parts.join('') + '</div>' : '';
  }

  function taskIssueLabel(task) {
    if (!task || !task.issue) return 'Issue 준비중';
    return 'Issue #' + task.issue;
  }

  /* ====== Dynamic Tasks (requirement ↔ task integration) ====== */
  function getTasks() {
    var result = [];
    var seen = {};

    // 1. Start with hardcoded TASKS_DATA
    TASKS_DATA.forEach(function (task) {
      result.push(task);
      seen[task.id] = true;
    });

    // 2. Merge in requests that have no matching task
    state.requests.forEach(function (req) {
      var taskId = 'CLE2-' + req.id;
      if (!seen[taskId]) {
        seen[taskId] = true;
        // Create a stub task from request data
        var statusMap = {
          'proposed': 'reviewing',
          'reviewing': 'reviewing',
          'approved': 'in-progress',
          'in-progress': 'in-progress',
          'done': 'done',
          'hold': 'hold',
          'rejected': 'hold'
        };
        var taskState = statusMap[req.status] || 'reviewing';
        result.push({
          id: taskId,
          cle2Id: taskId,
          slug: 'req-' + req.id,
          title: req.title,
          issue: req.githubIssue || req.id,
          prs: [],
          deliverables: [],
          _fromRequest: true,
          goal: {
            objective: req.description || req.title,
            successCriteria: [],
            scope: { in: [], out: [] }
          },
          plan: {
            phases: [{ name: 'Phase 1 · 요구사항 검토', owner: req.author || '미정', status: taskState === 'done' ? 'done' : 'in-progress' }]
          },
          status: {
            state: taskState,
            progress: { current: taskState === 'done' ? 1 : 0, total: 1 },
            completedTasks: taskState === 'done' ? [req.title] : [],
            currentTasks: taskState !== 'done' ? [req.title] : [],
            nextTasks: [],
            blockers: []
          },
          tests: { items: [] }
        });
      }
    });

    return result;
  }

  function memberAvatar(name) {
    return MEMBERS[name] ? MEMBERS[name].avatar : '👤';
  }

  function taskStateMeta(stateKey) {
    if (stateKey === 'done') return { label: '완료', cls: 'done', icon: '✅' };
    if (stateKey === 'hold') return { label: '보류', cls: 'hold', icon: '⏸️' };
    if (stateKey === 'reviewing') return { label: '검토 중', cls: 'reviewing', icon: '🔍' };
    return { label: '진행 중', cls: 'in-progress', icon: '🔧' };
  }

  function taskProgressPercent(task) {
    if (!task || !task.status || !task.status.progress || !task.status.progress.total) return 0;
    return Math.round((task.status.progress.current / task.status.progress.total) * 100);
  }

  function taskOwner(task) {
    if (!task || !task.plan || !task.plan.phases || task.plan.phases.length === 0) return '';
    return task.plan.phases[0].owner;
  }

  function taskCurrentSummary(task) {
    if (!task || !task.status || !task.status.currentTasks || task.status.currentTasks.length === 0) return '현재 진행 중인 작업 없음';
    return task.status.currentTasks[0];
  }

  function taskDocHref(path) {
    return 'https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/blob/main/' + path;
  }

  function taskDecisionsPath(task) {
    if (!task || !task.id || !task.slug) return '';
    return 'tasks/' + task.id + '/' + task.slug + '/DECISIONS.md';
  }

  function taskDiscoveryPath(task) {
    if (!task || !task.id || !task.slug) return '';
    return 'tasks/' + task.id + '/' + task.slug + '/DISCOVERY.md';
  }

  function taskIssueHref(task) {
    if (!task || !task.issue) return 'https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/issues';
    return 'https://github.com/Daegu-Agent-Crew/creative-loop-engineering2/issues/' + task.issue;
  }

  function cloneJSON(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getTaskStudio(task) {
    if (!task || !task.studio) return null;
    if (!state.studioData[task.id]) {
      state.studioData[task.id] = cloneJSON(task.studio);
      saveStudioData();
    }
    return state.studioData[task.id];
  }

  function taskRequestId(task) {
    var match = task && task.id ? task.id.match(/^CLE2-(\d+)$/) : null;
    return match ? parseInt(match[1], 10) : null;
  }

  function studioEpisodeStateMeta(stateKey) {
    var map = {
      script: { label: '대본', cls: 'studio-script' },
      storyboard: { label: '콘티', cls: 'studio-storyboard' },
      render: { label: '패널 생성', cls: 'studio-render' },
      review: { label: '리뷰', cls: 'studio-review' },
      publish: { label: '배포', cls: 'studio-publish' },
      observe: { label: '관측', cls: 'studio-observe' }
    };
    return map[stateKey] || { label: stateKey, cls: '' };
  }

  function studioPanelStateMeta(stateKey) {
    var map = {
      'not-started': { label: '미시작', cls: 'not-started' },
      generating: { label: '생성중', cls: 'generating' },
      'review-queue': { label: '리뷰대기', cls: 'review-queue' },
      revision: { label: '수정중', cls: 'revision' },
      approved: { label: '확정', cls: 'approved' },
      failed: { label: '실패', cls: 'failed' },
      abandoned: { label: '제외', cls: 'abandoned' }
    };
    return map[stateKey] || { label: stateKey, cls: '' };
  }

  function studioHypothesisStateMeta(stateKey) {
    var map = {
      pending: { label: '대기', cls: 'pending' },
      collecting: { label: '수집중', cls: 'collecting' },
      validated: { label: '검증완료', cls: 'validated' }
    };
    return map[stateKey] || { label: stateKey, cls: '' };
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

  function ghToken() {
    return (state.settings.githubToken || '').trim();
  }

  function isValidGitHubToken(token) {
    return ['ghp_', 'github_pat_', 'gho_', 'ghs_', 'ghu_'].some(function(prefix) {
      return token.indexOf(prefix) === 0;
    });
  }

  function ghHeaders(requireAuth) {
    var token = ghToken();
    if (requireAuth && !token) return null;
    var headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
    if (token) headers.Authorization = 'token ' + token;
    return headers;
  }

  function ghEnabled() {
    return !!ghToken();
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
    var headers = ghHeaders(true);
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
    var headers = ghHeaders(true);
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
    var headers = ghHeaders(true);
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
    var headers = ghHeaders(false);
    if (!headers) { if (cb) cb(null); return; }
    // Fetch all issues with any cle: label, plus any without labels to catch everything
    fetch(GH_API + '/issues?state=all&per_page=100', {
      headers: headers
    }).then(function(res) { return res.json(); })
      .then(function(data) {
        if (!Array.isArray(data)) { if (cb) cb(null); return; }

        // Dedup existing requests by githubIssue — keep first, remove duplicates
        var seen = {};
        var deduped = [];
        state.requests.forEach(function(r) {
          var key = r.githubIssue ? 'gi:' + r.githubIssue : 'id:' + r.id;
          if (!seen[key]) {
            seen[key] = true;
            deduped.push(r);
          }
        });
        if (deduped.length !== state.requests.length) {
          state.requests = deduped;
        }

        var synced = 0;
        var maxId = state.requests.length ? Math.max.apply(null, state.requests.map(function(r){return r.id;})) : 0;
        data.forEach(function(issue) {
          // Skip PRs
          if (issue.pull_request) return;

          // Parse CLE2-ID from title
          var match = issue.title.match(/\[CLE2-(\d+)\]/);
          var reqId = match ? parseInt(match[1]) : null;
          var req = reqId ? getRequest(reqId) : null;

          // Dedup by GitHub issue number — prevent duplicates on every sync
          if (!req) {
            for (var i = 0; i < state.requests.length; i++) {
              if (state.requests[i].githubIssue === issue.number) {
                req = state.requests[i];
                break;
              }
            }
          }

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
    if (parts[0] === 'tasks' && parts.length === 1) return renderTasks();
    if (parts[0] === 'tasks' && parts.length === 2) return renderTaskDetail(parts[1]);
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
      { href: '#/tasks', icon: '📋', label: '작업', key: 'tasks' },
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
    html += '<a class="quick-action" href="#/tasks"><span class="qa-icon">🗂️</span><div><div class="qa-title">Tasks 대시보드</div><div class="qa-desc">GOAL / DISCOVERY / PLAN / STATUS / TESTS / DECISIONS</div></div></a>';
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
      (r.githubIssue ? '<span class="rc-meta-item gh-badge">📋 #' + r.githubIssue + '</span>' : '') +
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
    // GitHub links
    var ghLinks = ghLinksHTMLforRequest(r);
    if (ghLinks) html += ghLinks;
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

    // Task Summary (requirement ↔ task integration)
    var taskForReq = getTask('CLE2-' + r.id);
    if (taskForReq) {
      var tStateMeta = taskStateMeta(taskForReq.status.state);
      var tProgressPct = taskProgressPercent(taskForReq);
      var tOwner = taskOwner(taskForReq);
      var tOwnerMeta = MEMBERS[tOwner] || { avatar: '👤' };
      html += '<div class="detail-section">';
      html += '<h3>🔧 Task 정보</h3>';
      if (taskForReq._fromRequest) {
        html += '<div style="padding:16px;border:1px dashed var(--border);border-radius:12px;background:var(--surface2)">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
        html += '<span style="font-weight:600">' + esc(taskForReq.id) + '</span>';
        html += '<span class="task-state-badge reviewing">📋 Task 미생성</span>';
        html += '</div>';
        html += '<div style="color:var(--text3);font-size:0.8rem">이 요구사항에 대한 task 폴더가 아직 생성되지 않았습니다. tasks/ 디렉토리에 GOAL.md, DISCOVERY.md, PLAN.md, STATUS.md, TESTS.md, DECISIONS.md를 작성하면 자동으로 반영됩니다.</div>';
        html += '<div style="margin-top:12px"><a class="btn btn-ghost btn-sm" href="#/tasks/' + taskForReq.id + '">→ Task 상세 보기</a></div>';
        html += '</div>';
      } else {
        html += '<div class="task-card" style="cursor:pointer;margin-bottom:0" onclick="location.hash=\'#/tasks/' + taskForReq.id + '\'">';
        html += '<div class="task-card-head">';
        html += '<div>';
        html += '<div class="task-card-title">' + esc(taskForReq.id) + ' · ' + esc(taskForReq.title) + '</div>';
        html += '<div class="task-card-sub">' + esc(taskIssueLabel(taskForReq)) + ' · ' + esc(taskForReq.slug) + '</div>';
        html += '</div>';
        html += '<span class="task-state-badge ' + tStateMeta.cls + '">' + tStateMeta.icon + ' ' + tStateMeta.label + '</span>';
        html += '</div>';
        // GitHub links for task
        var taskGhLinks = ghLinksHTMLforTask(taskForReq);
        if (taskGhLinks) html += taskGhLinks;
        html += '<div class="task-progress-meta">';
        html += '<span>Phase ' + taskForReq.status.progress.current + '/' + taskForReq.status.progress.total + '</span>';
        html += '<span>' + tProgressPct + '%</span>';
        html += '</div>';
        html += '<div class="task-progress-bar"><span style="width:' + tProgressPct + '%"></span></div>';
        html += '<div class="task-card-owner">';
        html += '<span class="user-pill">' + tOwnerMeta.avatar + ' ' + esc(tOwner) + '</span>';
        html += '<span class="task-current-line">' + esc(taskCurrentSummary(taskForReq)) + '</span>';
        html += '</div>';
        html += '</div>';
      }
      html += '</div>';
    }

    // Deliverables (결과물 쇼케이스 & 피드백)
    var delivs = state.deliverables[r.id] || [];
    // Merge preset deliverables from TASKS_DATA
    var taskForDeliv = getTask('CLE2-' + r.id);
    var presetDelivs = (taskForDeliv && taskForDeliv.deliverables) ? taskForDeliv.deliverables : [];
    html += '<div class="detail-section deliverable-section">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">';
    html += '<h3>📦 결과물</h3>';
    html += '<div style="display:flex;gap:6px">';
    html += '<button class="btn btn-ghost btn-sm" onclick="window.__CLE2__.copyShareLink(' + r.id + ')">🔗 공유 링크 복사</button>';
    html += '<button class="btn btn-primary btn-sm" onclick="window.__CLE2__.toggleDeliverableForm(' + r.id + ')">➕ 결과물 등록</button>';
    html += '</div>';
    html += '</div>';

    // Deliverable form (hidden by default)
    html += '<div class="deliverable-form" id="deliverableForm" style="display:none">';
    html += '<div class="form-group"><label>제목</label><input class="text-input" id="delivTitle" placeholder="결과물 제목"></div>';
    html += '<div class="form-group"><label>내용</label><textarea class="textarea-input" id="delivContent" placeholder="결과물 설명을 입력하세요..." rows="4"></textarea></div>';
    html += '<div class="form-group"><label>링크 (최대 5개)</label><div id="delivLinksContainer"><div class="deliv-link-row"><input class="text-input deliv-link-input" placeholder="https://..."></div></div><button class="btn btn-ghost btn-sm" onclick="window.__CLE2__.addLinkInput()">➕ 링크 추가</button></div>';
    html += '<div class="form-actions"><button class="btn btn-ghost" onclick="window.__CLE2__.toggleDeliverableForm(' + r.id + ')">취소</button><button class="btn btn-primary" onclick="window.__CLE2__.addDeliverable(' + r.id + ')">등록</button></div>';
    html += '</div>';

    // Preset deliverables (from TASKS_DATA)
    if (presetDelivs.length > 0) {
      html += '<div class="preset-deliverables">';
      html += '<div class="preset-deliv-label">📎 프로젝트 결과물</div>';
      html += '<div class="preset-deliv-list">';
      presetDelivs.forEach(function(pd) {
        html += '<a class="preset-deliv-card" href="' + esc(pd.url) + '" target="_blank" rel="noopener">';
        html += '<div class="preset-deliv-icon">🔗</div>';
        html += '<div class="preset-deliv-info">';
        html += '<div class="preset-deliv-title">' + esc(pd.title) + '</div>';
        if (pd.description) html += '<div class="preset-deliv-desc">' + esc(pd.description) + '</div>';
        html += '<div class="preset-deliv-url">' + esc(pd.url.replace(/^https?:\/\//, '')) + '</div>';
        html += '</div>';
        html += '</a>';
      });
      html += '</div>';
      html += '</div>';
    }

    if (delivs.length === 0) {
      html += '<div class="empty-state" style="padding:24px"><div class="es-icon">📦</div><div class="es-text">아직 결과물이 없습니다</div><div class="es-hint">첫 결과물을 등록해보세요!</div></div>';
    } else {
      // Show deliverables — latest first (reverse order)
      delivs.slice().reverse().forEach(function(d, revIdx) {
        var actualIdx = delivs.length - 1 - revIdx;
        var isLatest = revIdx === 0;
        var expanded = isLatest;
        html += '<div class="deliverable-card" data-did="' + d.id + '" id="delivCard_' + d.id + '">';
        html += '<div class="deliverable-card-head" onclick="window.__CLE2__.toggleDeliverableVersion(\'' + d.id + '\')">';
        html += '<div style="display:flex;align-items:center;gap:8px">';
        html += '<span class="deliverable-version-badge">V' + d.version + '</span>';
        html += '<span class="deliverable-card-title">' + esc(d.title) + '</span>';
        if (isLatest) { html += '<span class="badge badge-status done" style="font-size:0.7rem">최신</span>'; }
        html += '</div>';
        html += '<span class="deliverable-toggle" id="delivToggle_' + d.id + '">' + (expanded ? '▼' : '▶') + '</span>';
        html += '</div>';
        html += '<div class="deliverable-card-body" id="delivBody_' + d.id + '" style="' + (expanded ? '' : 'display:none') + '">';
        html += '<div class="deliverable-content">' + esc(d.content) + '</div>';
        if (d.links && d.links.length) {
          html += '<div class="deliverable-links">';
          d.links.forEach(function(lnk) {
            if (lnk) {
              html += '<a href="' + esc(lnk) + '" target="_blank" rel="noopener" class="deliverable-link">🔗 ' + esc(lnk.length > 50 ? lnk.substring(0, 47) + '...' : lnk) + '</a>';
            }
          });
          html += '</div>';
        }
        var dMember = MEMBERS[d.author] || { avatar: '👤' };
        html += '<div class="deliverable-meta">';
        html += '<span class="user-pill">' + dMember.avatar + ' ' + esc(d.author) + '</span>';
        html += '<span>·</span>';
        html += '<span>' + timeAgo(d.createdAt) + '</span>';
        html += '</div>';
        // Feedback section
        var feedbacks = d.feedback || [];
        html += '<div class="deliverable-feedback">';
        html += '<div style="font-size:0.8rem;font-weight:600;margin-bottom:6px;color:var(--text2)">💬 피드백 (' + feedbacks.length + ')</div>';
        feedbacks.forEach(function(fb) {
          var fbMember = MEMBERS[fb.author] || { avatar: '👤' };
          html += '<div class="feedback-item">';
          html += '<span class="feedback-avatar">' + fbMember.avatar + '</span>';
          html += '<div class="feedback-body">';
          html += '<div class="fb-header"><span class="fb-author">' + esc(fb.author) + '</span><span class="fb-time">' + timeAgo(fb.createdAt) + '</span></div>';
          html += '<div class="fb-text">' + esc(fb.text) + '</div>';
          html += '</div></div>';
        });
        html += '<div class="feedback-form">';
        html += '<input class="text-input" id="feedbackInput_' + d.id + '" placeholder="피드백 입력..." style="flex:1">';
        html += '<button class="btn btn-primary btn-sm" onclick="window.__CLE2__.addDeliverableFeedback(' + r.id + ', \'' + d.id + '\')">등록</button>';
        html += '</div>';
        html += '</div>'; // end feedback
        html += '</div>'; // end body
        html += '</div>'; // end card
      });
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

  /* ====== Tasks Dashboard ====== */
  function renderTasks() {
    var allTasks = getTasks();
    var totalTasks = allTasks.length;
    var avgProgress = totalTasks ? Math.round(allTasks.reduce(function (sum, task) {
      return sum + taskProgressPercent(task);
    }, 0) / totalTasks) : 0;
    var activeTasks = allTasks.filter(function (task) {
      return task.status.state === 'in-progress';
    }).length;

    var html = '<div style="padding-top:24px" class="page-enter">';
    html += '<h1 style="font-size:1.4rem;font-weight:700;margin-bottom:8px">📋 Tasks 대시보드</h1>';
    html += '<p style="color:var(--text2);font-size:0.85rem;margin-bottom:24px">tasks/ 디렉토리의 GOAL, DISCOVERY, PLAN, STATUS, TESTS, DECISIONS 문서를 한눈에 확인하세요</p>';

    html += '<div class="stats-grid">';
    html += statCard('🗂️', totalTasks, '전체 태스크');
    html += statCard('📈', avgProgress + '%', '평균 진행률');
    html += statCard('🔧', activeTasks, '진행 중');
    html += statCard('✅', allTasks.filter(function (task) { return task.status.state === 'done'; }).length, '완료');
    html += '</div>';

    html += '<div class="grid">';
    allTasks.forEach(function (task) {
      var stateMeta = taskStateMeta(task.status.state);
      var owner = taskOwner(task);
      var ownerMeta = MEMBERS[owner] || { avatar: '👤' };
      var progressPct = taskProgressPercent(task);
      var isStub = task._fromRequest;
      html += '<div class="task-card page-enter' + (isStub ? ' task-card-stub' : '') + '" onclick="location.hash=\'#/tasks/' + task.id + '\'">';
      html += '<div class="task-card-head">';
      html += '<div>';
      html += '<div class="task-card-title">' + esc(task.id) + ' · ' + esc(task.title) + '</div>';
      html += '<div class="task-card-sub">' + esc(taskIssueLabel(task)) + ' · ' + esc(task.slug) + '</div>';
      html += '</div>';
      if (isStub) {
        html += '<span class="task-state-badge reviewing">📋 미생성</span>';
      } else {
        html += '<span class="task-state-badge ' + stateMeta.cls + '">' + stateMeta.icon + ' ' + stateMeta.label + '</span>';
      }
      html += '</div>';
      // GitHub links in task card
      if (!isStub) {
        var taskLinks = ghLinksHTMLforTask(task);
        if (taskLinks) html += taskLinks;
      }
      if (!isStub) {
        html += '<div class="task-progress-meta">';
        html += '<span>Phase ' + task.status.progress.current + '/' + task.status.progress.total + '</span>';
        html += '<span>' + progressPct + '%</span>';
        html += '</div>';
        html += '<div class="task-progress-bar"><span style="width:' + progressPct + '%"></span></div>';
      } else {
        html += '<div class="task-progress-meta"><span>task 폴더 미생성</span><span>—</span></div>';
        html += '<div class="task-progress-bar"><span style="width:0%"></span></div>';
      }
      html += '<div class="task-card-owner">';
      html += '<span class="user-pill">' + ownerMeta.avatar + ' ' + esc(owner) + '</span>';
      if (isStub) {
        html += '<span class="task-current-line" style="color:var(--text3)">요구사항에서 자동 생성됨</span>';
      } else {
        html += '<span class="task-current-line">' + esc(taskCurrentSummary(task)) + '</span>';
      }
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';

    html += footerHTML();
    html += '</div>';

    render(pageWrap('tasks', html));
  }

  function renderTaskDetail(id, preserveTab) {
    var task = getTask(id);
    var activeTab;
    var owner = taskOwner(task);
    var ownerMeta = MEMBERS[owner] || { avatar: '👤', role: '' };
    var stateMeta;
    var progressPct;
    var html = '';

    if (!task) return renderNotFound();

    if (state.tasks.currentId !== id && !preserveTab) {
      state.tasks.activeTab = 'goal';
    }
    state.tasks.currentId = id;
    activeTab = state.tasks.activeTab || 'goal';

    stateMeta = taskStateMeta(task.status.state);
    progressPct = taskProgressPercent(task);

    html += '<div style="padding-top:24px" class="page-enter">';
    html += '<a class="detail-back" href="#/tasks">← Tasks 목록으로</a>';
    html += '<div class="detail-header-card">';
    html += '<div class="detail-badges">';
    html += '<span class="badge" style="background:var(--surface3);color:var(--text2)">' + esc(task.id) + '</span>';
    html += '<span class="badge" style="background:var(--surface3);color:var(--text2)">' + esc(taskIssueLabel(task)) + '</span>';
    html += '<span class="task-state-badge ' + stateMeta.cls + '">' + stateMeta.icon + ' ' + stateMeta.label + '</span>';
    html += '</div>';
    html += '<h1>' + esc(task.title) + '</h1>';
    html += '<div class="detail-meta">';
    html += '<span class="user-pill">' + ownerMeta.avatar + ' ' + esc(owner) + '</span>';
    html += '<span>·</span>';
    html += '<span>Phase ' + task.status.progress.current + '/' + task.status.progress.total + '</span>';
    html += '<span>·</span>';
    html += '<span>진행률 ' + progressPct + '%</span>';
    html += '</div>';
    // GitHub links
    var taskDetailGhLinks = ghLinksHTMLforTask(task);
    if (taskDetailGhLinks) html += taskDetailGhLinks;
    html += '<div style="margin-top:16px">';
    html += '<div class="task-progress-bar"><span style="width:' + progressPct + '%"></span></div>';
    html += '</div>';
    html += '</div>';

    if (task.relatedTasks && task.relatedTasks.length) {
      html += '<div class="detail-section" style="margin-top:18px">';
      html += '<h3>🔗 관련 태스크</h3>';
      html += '<div class="grid grid-2">';
      task.relatedTasks.forEach(function (related) {
        html += '<a class="quick-action" href="#/tasks/' + esc(related.id) + '">';
        html += '<span class="qa-icon">🧭</span><div>';
        html += '<div class="qa-title">' + esc(related.id) + ' · ' + esc(related.relation) + '</div>';
        html += '<div class="qa-desc">' + esc(related.note) + '</div>';
        html += '</div></a>';
      });
      html += '</div>';
      html += '</div>';
    }

    html += '<div class="task-detail-tabs">';
    html += '<button class="' + (activeTab === 'goal' ? 'active' : '') + '" onclick="window.__CLE2__.setTaskTab(\'' + task.id + '\', \'goal\')">GOAL</button>';
    html += '<button class="' + (activeTab === 'discovery' ? 'active' : '') + '" onclick="window.__CLE2__.setTaskTab(\'' + task.id + '\', \'discovery\')">DISCOVERY</button>';
    html += '<button class="' + (activeTab === 'plan' ? 'active' : '') + '" onclick="window.__CLE2__.setTaskTab(\'' + task.id + '\', \'plan\')">PLAN</button>';
    html += '<button class="' + (activeTab === 'status' ? 'active' : '') + '" onclick="window.__CLE2__.setTaskTab(\'' + task.id + '\', \'status\')">STATUS</button>';
    html += '<button class="' + (activeTab === 'tests' ? 'active' : '') + '" onclick="window.__CLE2__.setTaskTab(\'' + task.id + '\', \'tests\')">TESTS</button>';
    html += '<button class="' + (activeTab === 'decisions' ? 'active' : '') + '" onclick="window.__CLE2__.setTaskTab(\'' + task.id + '\', \'decisions\')">DECISIONS</button>';
    if (task.studio) {
      html += '<button class="' + (activeTab === 'studio' ? 'active' : '') + '" onclick="window.__CLE2__.setTaskTab(\'' + task.id + '\', \'studio\')">STUDIO</button>';
    }
    html += '</div>';

    html += '<div class="task-tab-content">';
    if (activeTab === 'goal') {
      html += '<div class="detail-section">';
      html += '<h3>🎯 목표</h3>';
      html += '<div class="detail-description">' + esc(task.goal.objective) + '</div>';
      html += '</div>';
      if (task.docs && task.docs.length) {
        html += '<div class="detail-section">';
        html += '<h3>📚 관련 문서</h3>';
        html += '<div class="grid grid-2">';
        task.docs.forEach(function (doc) {
          html += '<a class="quick-action" href="' + esc(taskDocHref(doc.path)) + '" target="_blank" rel="noopener">';
          html += '<span class="qa-icon">📄</span><div><div class="qa-title">' + esc(doc.title) + '</div><div class="qa-desc">' + esc(doc.description) + '</div></div></a>';
        });
        html += '</div>';
        html += '</div>';
      }
      html += '<div class="grid grid-2">';
      html += '<div class="detail-section">';
      html += '<h3>✅ 성공 기준</h3>';
      html += '<ul class="task-check-list">';
      task.goal.successCriteria.forEach(function (item) {
        html += '<li>☑️ ' + esc(item) + '</li>';
      });
      html += '</ul>';
      html += '</div>';
      html += '<div class="detail-section">';
      html += '<h3>📦 범위</h3>';
      html += '<div class="task-scope-columns">';
      html += '<div><div class="task-scope-title">포함</div><ul class="task-scope-list">';
      task.goal.scope.in.forEach(function (item) {
        html += '<li>' + esc(item) + '</li>';
      });
      html += '</ul></div>';
      html += '<div><div class="task-scope-title">제외</div><ul class="task-scope-list">';
      task.goal.scope.out.forEach(function (item) {
        html += '<li>' + esc(item) + '</li>';
      });
      html += '</ul></div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    } else if (activeTab === 'discovery') {
      var discovery = task.discovery || {};
      var unknowns = discovery.unknowns || {};
      var unknownGroups = [
        { title: 'Known Known', items: unknowns.knownKnown || [] },
        { title: 'Known Unknown', items: unknowns.knownUnknown || [] },
        { title: 'Unknown Known', items: unknowns.unknownKnown || [] },
        { title: 'Unknown Unknown 후보', items: unknowns.unknownUnknown || [] }
      ];
      html += '<div class="detail-section">';
      html += '<h3>작업 전 Discovery</h3>';
      html += '<div class="detail-description">목표를 실행하기 전에 실제 코드와 데이터, 사용할 도구, 레퍼런스와 불확실성을 확인합니다. 모든 Unknown을 제거하지 않고 가정으로 진행할 항목과 사람 결정이 필요한 항목을 구분합니다.</div>';
      if (task.discovery) {
        html += '<div class="studio-inline-actions" style="margin-top:14px">';
        html += '<a class="btn btn-primary btn-sm" href="' + esc(taskDocHref(taskDiscoveryPath(task))) + '" target="_blank" rel="noopener">DISCOVERY.md 열기</a>';
        html += '</div>';
      } else {
        html += '<div class="detail-description" style="margin-top:14px">기존 태스크입니다. 다음 계획 변경 전에 DISCOVERY.md를 작성해 Unknown과 도구 상태를 기준선으로 남겨야 합니다.</div>';
      }
      html += '</div>';
      html += '<div class="grid grid-2">';
      unknownGroups.forEach(function (group) {
        html += '<div class="detail-section"><h3>' + esc(group.title) + ' <span class="task-state-badge reviewing">' + group.items.length + '</span></h3>';
        if (group.items.length) {
          html += '<ul class="task-status-list">';
          group.items.forEach(function (item) { html += '<li>' + esc(item) + '</li>'; });
          html += '</ul>';
        } else {
          html += '<div class="detail-description">아직 기록된 항목이 없습니다.</div>';
        }
        html += '</div>';
      });
      html += '</div>';
      html += '<div class="grid grid-2">';
      html += '<div class="detail-section"><h3>도구와 접근</h3>';
      if (discovery.tools && discovery.tools.length) {
        discovery.tools.forEach(function (tool) {
          html += '<div class="studio-line-item"><div class="studio-line-main"><strong>' + esc(tool.name) + '</strong> <span class="task-test-badge ' + (tool.status === 'available' ? 'passed' : 'pending') + '">' + esc(tool.status) + '</span></div><div class="studio-line-sub">' + esc(tool.purpose) + '</div></div>';
        });
      } else {
        html += '<div class="detail-description">도구 상태가 아직 기록되지 않았습니다.</div>';
      }
      html += '</div>';
      html += '<div class="detail-section"><h3>사람 결정 필요</h3><ul class="task-status-list">';
      (discovery.needsDecision || []).forEach(function (item) { html += '<li>' + esc(item) + '</li>'; });
      if (!discovery.needsDecision || !discovery.needsDecision.length) html += '<li>현재 요청된 결정 없음</li>';
      html += '</ul><h3 style="margin-top:18px">계속 진행할 가정</h3><ul class="task-status-list">';
      (discovery.assumptions || []).forEach(function (item) { html += '<li>' + esc(item) + '</li>'; });
      if (!discovery.assumptions || !discovery.assumptions.length) html += '<li>기록된 가정 없음</li>';
      html += '</ul></div></div>';
      html += '<div class="grid grid-2">';
      html += '<div class="detail-section"><h3>레퍼런스</h3><ul class="task-status-list">';
      (discovery.references || []).forEach(function (item) { html += '<li>' + esc(item) + '</li>'; });
      if (!discovery.references || !discovery.references.length) html += '<li>등록된 레퍼런스 없음</li>';
      html += '</ul></div>';
      html += '<div class="detail-section"><h3>도전 목표</h3><div class="detail-description">' + esc(discovery.challenge || '기존 시간, 비용, 품질의 제약을 다시 검토할 가설을 기록하세요.') + '</div></div>';
      html += '</div>';
    } else if (activeTab === 'plan') {
      html += '<div class="detail-section">';
      html += '<h3>🗺️ Phase 계획</h3>';
      task.plan.phases.forEach(function (phase) {
        var phaseState = taskStateMeta(phase.status);
        var phaseOwner = MEMBERS[phase.owner] || { avatar: '👤' };
        html += '<div class="task-phase-item">';
        html += '<div class="task-phase-title-row">';
        html += '<div class="task-phase-title">' + esc(phase.name) + '</div>';
        html += '<span class="task-state-badge ' + phaseState.cls + '">' + phaseState.icon + ' ' + phaseState.label + '</span>';
        html += '</div>';
        html += '<div class="task-phase-meta">' + phaseOwner.avatar + ' ' + esc(phase.owner) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    } else if (activeTab === 'status') {
      html += '<div class="grid grid-2">';
      html += '<div class="detail-section"><h3>✅ 완료</h3><ul class="task-status-list">';
      task.status.completedTasks.forEach(function (item) {
        html += '<li>' + esc(item) + '</li>';
      });
      html += '</ul></div>';
      html += '<div class="detail-section"><h3>🔧 진행 중</h3><ul class="task-status-list">';
      task.status.currentTasks.forEach(function (item) {
        html += '<li>' + esc(item) + '</li>';
      });
      html += '</ul></div>';
      html += '</div>';
      html += '<div class="grid grid-2">';
      html += '<div class="detail-section"><h3>⏭️ 다음 작업</h3><ul class="task-status-list">';
      task.status.nextTasks.forEach(function (item) {
        html += '<li>' + esc(item) + '</li>';
      });
      html += '</ul></div>';
      html += '<div class="detail-section"><h3>🚧 블로커</h3>';
      if (task.status.blockers && task.status.blockers.length) {
        html += '<ul class="task-status-list">';
        task.status.blockers.forEach(function (item) {
          html += '<li>' + esc(item) + '</li>';
        });
        html += '</ul>';
      } else {
        html += '<div class="empty-state" style="padding:24px"><div class="es-icon">🟢</div><div class="es-text">현재 보고된 블로커가 없습니다</div></div>';
      }
      html += '</div>';
      html += '</div>';
    } else if (activeTab === 'tests') {
      html += '<div class="detail-section">';
      html += '<h3>🧪 테스트 현황</h3>';
      html += '<div class="task-test-table-wrap">';
      html += '<table class="task-test-table">';
      html += '<thead><tr><th>항목</th><th>방법</th><th>기대 결과</th><th>상태</th></tr></thead><tbody>';
      task.tests.items.forEach(function (item) {
        html += '<tr class="task-test-row">';
        html += '<td>' + esc(item.name) + '</td>';
        html += '<td>' + esc(item.method) + '</td>';
        html += '<td>' + esc(item.expected) + '</td>';
        html += '<td><span class="task-test-badge ' + (item.passed ? 'passed' : 'pending') + '">' + (item.passed ? '통과' : '대기') + '</span></td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
      html += '</div>';
      html += '</div>';
    } else if (activeTab === 'decisions') {
      html += '<div class="detail-section">';
      html += '<h3>🧭 의사결정 기록</h3>';
      html += '<div class="detail-description">이 요구사항의 장기 참조용 판단, 열린 쟁점, 참고 링크는 `DECISIONS.md`에 누적합니다. 짧은 토론은 GitHub Issue 댓글에 남기고, 확정된 내용만 이 문서로 옮기는 방식이 기준입니다.</div>';
      html += '</div>';
      html += '<div class="grid grid-2">';
      html += '<div class="detail-section">';
      html += '<h3>📄 문서 바로가기</h3>';
      html += '<div class="studio-line-item">';
      html += '<div class="studio-line-main"><strong>DECISIONS.md</strong></div>';
      html += '<div class="studio-line-sub">' + esc(taskDecisionsPath(task)) + '</div>';
      html += '<div class="studio-inline-actions">';
      html += '<a class="btn btn-primary btn-sm" href="' + esc(taskDocHref(taskDecisionsPath(task))) + '" target="_blank" rel="noopener">문서 열기</a>';
      html += '<a class="btn btn-ghost btn-sm" href="' + esc(taskIssueHref(task)) + '" target="_blank" rel="noopener">이슈 보기</a>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
      html += '<div class="detail-section">';
      html += '<h3>📝 기록 원칙</h3>';
      html += '<ul class="task-status-list">';
      html += '<li>짧은 의견, 링크, 임시 코멘트는 GitHub Issue 댓글에 남깁니다.</li>';
      html += '<li>구현/운영에 영향을 주는 합의는 `DECISIONS.md`에 날짜와 함께 정리합니다.</li>';
      html += '<li>최종 상태 변화는 `GOAL.md`, `PLAN.md`, `STATUS.md`, `TESTS.md`에도 반영합니다.</li>';
      html += '</ul>';
      html += '</div>';
      html += '</div>';
    } else if (activeTab === 'studio' && task.studio) {
      var linkedReqId = taskRequestId(task);
      var linkedDeliverables = linkedReqId ? (state.deliverables[linkedReqId] || []) : [];
      html += '<div class="detail-section">';
      html += '<h3>🎬 Episode Board</h3>';
      html += '<div class="studio-episode-grid">';
      task.studio.episodes.forEach(function (episode) {
        var episodeState = studioEpisodeStateMeta(episode.status);
        var episodeOwner = MEMBERS[episode.owner] || { avatar: '👤' };
        var pct = Math.round((episode.phaseProgress.current / episode.phaseProgress.total) * 100);
        html += '<div class="studio-card">';
        html += '<div class="studio-card-head">';
        html += '<div><div class="studio-card-title">' + esc(episode.id) + ' · ' + esc(episode.title) + '</div><div class="studio-card-sub">' + esc(episode.summary) + '</div></div>';
        html += '<button class="studio-state-badge ' + episodeState.cls + ' studio-button" onclick="window.__CLE2__.cycleStudioEpisodeStatus(\'' + task.id + '\', \'' + episode.id + '\')">' + esc(episodeState.label) + '</button>';
        html += '</div>';
        html += '<div class="studio-progress-row"><span>' + episodeOwner.avatar + ' ' + esc(episode.owner) + '</span><span>Phase ' + episode.phaseProgress.current + '/' + episode.phaseProgress.total + '</span></div>';
        html += '<div class="task-progress-bar"><span style="width:' + pct + '%"></span></div>';
        html += '<div class="studio-panel-list">';
        episode.panels.forEach(function (panel) {
          var panelState = studioPanelStateMeta(panel.status);
          html += '<button class="studio-panel-chip ' + panelState.cls + ' studio-button" onclick="window.__CLE2__.cycleStudioPanelStatus(\'' + task.id + '\', \'' + episode.id + '\', \'' + panel.id + '\')">';
          html += '<span>' + esc(panel.id) + '</span><span>' + esc(panelState.label) + '</span>';
          html += '</button>';
        });
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';

      html += '<div class="grid grid-2">';
      html += '<div class="detail-section">';
      html += '<h3>🧪 Hypothesis Loop</h3>';
      html += '<div class="studio-hypothesis-list">';
      task.studio.hypotheses.forEach(function (hypothesis) {
        var hypothesisState = studioHypothesisStateMeta(hypothesis.status);
        html += '<div class="studio-line-item">';
        html += '<div class="studio-line-main"><strong>' + esc(hypothesis.id) + '</strong> · ' + esc(hypothesis.title) + '</div>';
        html += '<div class="studio-line-meta"><button class="studio-state-badge ' + hypothesisState.cls + ' studio-button" onclick="window.__CLE2__.cycleStudioHypothesisStatus(\'' + task.id + '\', \'' + hypothesis.id + '\')">' + esc(hypothesisState.label) + '</button><span>' + esc(hypothesis.metric) + '</span><span>' + esc(hypothesis.owner) + '</span></div>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';

      html += '<div class="detail-section">';
      html += '<h3>📌 Active Queue</h3>';
      html += '<div class="studio-queue-list">';
      task.studio.queue.forEach(function (item) {
        html += '<div class="studio-line-item">';
        html += '<div class="studio-line-main"><strong>' + esc(item.label) + '</strong></div>';
        html += '<div class="studio-line-sub">' + esc(item.note) + '</div>';
        html += '<div class="studio-line-meta"><span class="badge" style="background:var(--surface3);color:var(--text2)">' + esc(item.type) + '</span><span>' + esc(item.owner) + '</span></div>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';
      html += '</div>';

      html += '<div class="grid grid-2">';
      html += '<div class="detail-section">';
      html += '<h3>📦 Deliverables 연결</h3>';
      if (linkedReqId) {
        html += '<div class="studio-line-item">';
        html += '<div class="studio-line-main"><strong>CLE2-' + linkedReqId + '</strong> 요구사항 결과물 ' + linkedDeliverables.length + '건</div>';
        html += '<div class="studio-line-sub">STUDIO 보드와 실제 결과물 등록 흐름은 같은 요구사항 상세 페이지를 공유합니다.</div>';
        html += '<div class="studio-inline-actions">';
        html += '<button class="btn btn-primary btn-sm" onclick="window.__CLE2__.openTaskRequest(\'' + task.id + '\')">결과물 페이지 열기</button>';
        html += '<button class="btn btn-ghost btn-sm" onclick="window.__CLE2__.openTaskRequest(\'' + task.id + '\', true)">결과물 등록으로 이동</button>';
        html += '</div>';
        html += '</div>';
      }
      html += '</div>';
      html += '<div class="detail-section">';
      html += '<h3>📝 조작 가이드</h3>';
      html += '<ul class="task-status-list">';
      html += '<li>에피소드 상태 배지를 누르면 `대본 → 콘티 → 패널 생성 → 리뷰 → 배포 → 관측` 순서로 순환합니다.</li>';
      html += '<li>패널 칩을 누르면 `미시작 → 생성중 → 리뷰대기 → 수정중 → 확정 → 실패 → 제외` 순서로 순환합니다.</li>';
      html += '<li>가설 상태 배지를 누르면 `대기 → 수집중 → 검증완료` 순서로 바뀌며 새로고침 후에도 유지됩니다.</li>';
      html += '</ul>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';

    render(pageWrap('tasks', html));
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
    html += '<p class="sc-desc">읽기 동기화는 공개 API로 수행하고, 쓰기 동기화는 이 브라우저 localStorage에 저장한 개인 토큰이 있을 때만 활성화됩니다.</p>';
    html += '<div class="sc-status ' + (ghEnabled() ? 'sc-active' : '') + '">' + (ghEnabled() ? '쓰기 동기화 활성' : '읽기 전용 모드') + '</div>';
    html += '<div style="margin-top:14px">';
    html += '<label style="display:block;font-size:0.82rem;font-weight:600;margin-bottom:6px;color:var(--text2)">GitHub Personal Access Token</label>';
    html += '<input class="text-input" id="githubToken" type="password" placeholder="github_pat_..." value="' + esc(state.settings.githubToken || '') + '">';
    html += '<div style="margin-top:8px;font-size:0.75rem;color:var(--text3)">토큰은 이 브라우저의 localStorage에만 저장되며, GitHub Pages 정적 배포에서는 `.env` 파일을 사용하지 않습니다.</div>';
    html += '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">';
    html += '<button class="btn btn-primary btn-sm" onclick="window.__CLE2__.saveGitHubToken()">💾 저장</button>';
    html += '<button class="btn btn-secondary btn-sm" onclick="window.__CLE2__.testGitHubToken()">🧪 테스트</button>';
    if (state.settings.githubToken) html += '<button class="btn btn-ghost btn-sm" onclick="window.__CLE2__.removeGitHubToken()">🗑️ 제거</button>';
    html += '<button class="btn btn-primary btn-sm" onclick="window.__CLE2__.syncFromGitHub()">🔄 GitHub에서 동기화</button>';
    html += '</div>';
    html += '<div id="githubTokenStatus" style="margin-top:8px;font-size:0.75rem;color:var(--text3)"></div>';
    html += '<div style="margin-top:8px;font-size:0.75rem;color:var(--text3)">저장소: Daegu-Agent-Crew/creative-loop-engineering2</div>';
    html += '<div style="margin-top:6px;font-size:0.75rem;color:' + (ghEnabled() ? 'var(--green)' : 'var(--amber)') + '">' + (ghEnabled() ? '✅ 새 요구사항/댓글/상태 변경이 Issue로 동기화됩니다' : 'ℹ️ 토큰 없이도 Issue 읽기 동기화는 가능하지만, 생성/수정/댓글은 비활성화됩니다') + '</div>';
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

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('🔗 공유 링크가 복사되었습니다', 'success'); }
    catch (e) { showToast('⚠️ 복사 실패. 링크: ' + text, 'error'); }
    document.body.removeChild(ta);
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

    setTaskTab: function (taskId, tab) {
      state.tasks.activeTab = tab;
      state.tasks.currentId = taskId;
      renderTaskDetail(taskId, true);
    },

    openTaskRequest: function(taskId, openDeliverable) {
      var task = getTask(taskId);
      var reqId = taskRequestId(task);
      if (!reqId) return;
      location.hash = '#/requests/' + reqId;
      if (openDeliverable) {
        setTimeout(function() {
          var form = document.getElementById('deliverableForm');
          if (form && form.style.display === 'none') {
            window.__CLE2__.toggleDeliverableForm(reqId);
          }
          var titleInput = document.getElementById('delivTitle');
          if (titleInput) titleInput.focus();
        }, 80);
      }
    },

    cycleStudioEpisodeStatus: function(taskId, episodeId) {
      var flow = ['script', 'storyboard', 'render', 'review', 'publish', 'observe'];
      var task = getTask(taskId);
      var studio = task && task.studio ? task.studio : null;
      if (!studio) return;
      var episode = studio.episodes.find(function(item) { return item.id === episodeId; });
      if (!episode) return;
      var idx = flow.indexOf(episode.status);
      var next = flow[(idx + 1) % flow.length];
      episode.status = next;
      episode.phaseProgress.current = Math.min(flow.indexOf(next) + 1, episode.phaseProgress.total);
      saveStudioData();
      showToast('🎬 ' + episode.id + ' 상태가 ' + studioEpisodeStateMeta(next).label + '(으)로 변경되었습니다', 'success');
      renderTaskDetail(taskId, true);
    },

    cycleStudioPanelStatus: function(taskId, episodeId, panelId) {
      var flow = ['not-started', 'generating', 'review-queue', 'revision', 'approved', 'failed', 'abandoned'];
      var task = getTask(taskId);
      var studio = task && task.studio ? task.studio : null;
      if (!studio) return;
      var episode = studio.episodes.find(function(item) { return item.id === episodeId; });
      if (!episode) return;
      var panel = episode.panels.find(function(item) { return item.id === panelId; });
      if (!panel) return;
      var idx = flow.indexOf(panel.status);
      var next = flow[(idx + 1) % flow.length];
      panel.status = next;
      saveStudioData();
      showToast('🖼️ ' + episode.id + ' ' + panel.id + ' 상태가 ' + studioPanelStateMeta(next).label + '(으)로 변경되었습니다', 'success');
      renderTaskDetail(taskId, true);
    },

    cycleStudioHypothesisStatus: function(taskId, hypothesisId) {
      var flow = ['pending', 'collecting', 'validated'];
      var task = getTask(taskId);
      var studio = task && task.studio ? task.studio : null;
      if (!studio) return;
      var hypothesis = studio.hypotheses.find(function(item) { return item.id === hypothesisId; });
      if (!hypothesis) return;
      var idx = flow.indexOf(hypothesis.status);
      var next = flow[(idx + 1) % flow.length];
      hypothesis.status = next;
      saveStudioData();
      showToast('🧪 ' + hypothesis.id + ' 상태가 ' + studioHypothesisStateMeta(next).label + '(으)로 변경되었습니다', 'success');
      renderTaskDetail(taskId, true);
    },

    saveSettings: function () {
      var webhookEl = document.getElementById('discordWebhook');
      if (webhookEl) state.settings.discordWebhook = webhookEl.value.trim();
      var githubTokenEl = document.getElementById('githubToken');
      if (githubTokenEl) state.settings.githubToken = githubTokenEl.value.trim();
      saveSettings();
      showToast('✅ 설정이 저장되었습니다', 'success');
      renderSettings();
    },

    saveGitHubToken: function () {
      var githubTokenEl = document.getElementById('githubToken');
      if (!githubTokenEl) return;
      var token = githubTokenEl.value.trim();
      if (!token) {
        showToast('⚠️ GitHub PAT를 입력하세요', 'error');
        return;
      }
      if (!isValidGitHubToken(token)) {
        showToast('⚠️ 올바른 GitHub PAT 형식이 아닙니다', 'error');
        return;
      }
      state.settings.githubToken = token;
      saveSettings();
      showToast('✅ GitHub PAT가 이 브라우저 localStorage에 저장되었습니다', 'success');
      renderSettings();
    },

    removeGitHubToken: function () {
      delete state.settings.githubToken;
      saveSettings();
      showToast('🗑️ GitHub PAT가 이 브라우저 localStorage에서 제거되었습니다', 'success');
      renderSettings();
    },

    testGitHubToken: function () {
      var githubTokenEl = document.getElementById('githubToken');
      var statusEl = document.getElementById('githubTokenStatus');
      if (!githubTokenEl || !statusEl) return;
      var token = githubTokenEl.value.trim();
      if (!token) {
        statusEl.style.color = 'var(--amber)';
        statusEl.textContent = 'PAT를 먼저 입력하세요.';
        return;
      }
      if (!isValidGitHubToken(token)) {
        statusEl.style.color = 'var(--red)';
        statusEl.textContent = '올바른 GitHub PAT 형식이 아닙니다.';
        return;
      }
      statusEl.style.color = 'var(--text3)';
      statusEl.textContent = 'GitHub 연결 테스트 중...';
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: 'token ' + token,
          Accept: 'application/vnd.github.v3+json'
        }
      })
      .then(function(res) { return res.json().then(function(data) { return { ok: res.ok, data: data }; }); })
      .then(function(result) {
        if (result.ok) {
          statusEl.style.color = 'var(--green)';
          statusEl.textContent = '✅ ' + (result.data.login || '인증 성공');
        } else {
          statusEl.style.color = 'var(--red)';
          statusEl.textContent = '❌ ' + ((result.data && result.data.message) || '인증 실패');
        }
      })
      .catch(function() {
        statusEl.style.color = 'var(--red)';
        statusEl.textContent = '❌ 네트워크 오류';
      });
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
    _userReqs: {},

    /* ====== Deliverable Actions ====== */
    toggleDeliverableForm: function(reqId) {
      var form = document.getElementById('deliverableForm');
      if (!form) return;
      if (form.style.display === 'none') {
        form.style.display = 'block';
        var titleInput = document.getElementById('delivTitle');
        if (titleInput) titleInput.focus();
      } else {
        form.style.display = 'none';
      }
    },

    addLinkInput: function() {
      var container = document.getElementById('delivLinksContainer');
      if (!container) return;
      var rows = container.querySelectorAll('.deliv-link-row');
      if (rows.length >= 5) { showToast('최대 5개까지 링크를 추가할 수 있습니다', 'error'); return; }
      var div = document.createElement('div');
      div.className = 'deliv-link-row';
      div.innerHTML = '<input class="text-input deliv-link-input" placeholder="https://...">';
      container.appendChild(div);
    },

    addDeliverable: function(reqId) {
      var titleEl = document.getElementById('delivTitle');
      var contentEl = document.getElementById('delivContent');
      if (!titleEl || !titleEl.value.trim()) { showToast('⚠️ 제목을 입력하세요', 'error'); return; }
      if (!contentEl || !contentEl.value.trim()) { showToast('⚠️ 내용을 입력하세요', 'error'); return; }
      var linkInputs = document.querySelectorAll('.deliv-link-input');
      var links = [];
      linkInputs.forEach(function(inp) {
        var v = inp.value.trim();
        if (v) links.push(v);
      });
      if (!state.deliverables[reqId]) state.deliverables[reqId] = [];
      var existing = state.deliverables[reqId];
      var newVersion = existing.length ? Math.max.apply(null, existing.map(function(d) { return d.version; })) + 1 : 1;
      var deliverable = {
        id: 'deliv_' + Date.now(),
        version: newVersion,
        title: titleEl.value.trim(),
        content: contentEl.value.trim(),
        links: links,
        author: state.currentUser,
        createdAt: new Date().toISOString(),
        status: 'submitted',
        feedback: []
      };
      existing.push(deliverable);
      saveDeliverables();
      showToast('📦 결과물 V' + newVersion + '이(가) 등록되었습니다!', 'success');
      renderDetail(reqId);
    },

    addDeliverableFeedback: function(reqId, deliverableId) {
      var input = document.getElementById('feedbackInput_' + deliverableId);
      if (!input || !input.value.trim()) return;
      var delivs = state.deliverables[reqId];
      if (!delivs) return;
      var d = delivs.find(function(d) { return d.id === deliverableId; });
      if (!d) return;
      if (!d.feedback) d.feedback = [];
      d.feedback.push({
        author: state.currentUser,
        text: input.value.trim(),
        createdAt: new Date().toISOString()
      });
      saveDeliverables();
      showToast('💬 피드백이 등록되었습니다', 'success');
      renderDetail(reqId);
    },

    toggleDeliverableVersion: function(deliverableId) {
      var body = document.getElementById('delivBody_' + deliverableId);
      var toggle = document.getElementById('delivToggle_' + deliverableId);
      if (!body) return;
      if (body.style.display === 'none') {
        body.style.display = 'block';
        if (toggle) toggle.textContent = '▼';
      } else {
        body.style.display = 'none';
        if (toggle) toggle.textContent = '▶';
      }
    },

    copyShareLink: function(reqId) {
      var url = 'https://daegu-agent-crew.github.io/creative-loop-engineering2/#/requests/' + reqId;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
          showToast('🔗 공유 링크가 복사되었습니다: ' + url, 'success');
        }).catch(function() {
          fallbackCopy(url);
        });
      } else {
        fallbackCopy(url);
      }
    }
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
