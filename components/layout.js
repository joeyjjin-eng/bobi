/* ============================================================
   BoBi v2 — 공통 레이아웃 (GNB · 푸터 · SVG symbols)

   사용 방법
   ---------
   각 페이지 <body>에 placeholder를 두고, 이 스크립트 로드 후 injectShell(active)
   호출. active 키로 GNB의 활성 메뉴를 지정.

   <body>
     <div id="icons-host"></div>
     <div class="layout">
       <div class="cA cE bobi">
         <div id="gnb-host"></div>
         <main class="emain"> ... </main>
       </div>
       <div id="footer-host"></div>
     </div>
     <script src="../../components/layout.js"></script>
     <script>injectShell('report');</script>
   </body>

   active 키: 'home' | 'customer' | 'report' | 'unclaimed' | 'claim' | 'jjaepity' | 'notice' | 'planner' | 'mypage'
   ============================================================ */
(function () {
  // 스크립트가 로드된 경로에서 프로젝트 루트의 상대경로 추출
  function getBasePath() {
    var scripts = document.scripts;
    for (var i = scripts.length - 1; i >= 0; i--) {
      var raw = scripts[i].getAttribute('src') || '';
      var idx = raw.indexOf('components/layout.js');
      if (idx >= 0) return raw.substring(0, idx);
    }
    return '';
  }
  var BASE = getBasePath();

  // ===== 플랜 정의 =====
  // 4개 기능: report(진료기록리포트) · unclaimed(미청구보험금) · jjaepity(째피티) · claim(보험금청구)
  // GNB 활성키: 위 4개 기능 키와 동일. 보험금청구 메뉴는 key='claim' → pages/claim/list.html
  // 월 정액 · 잔여는 각 에이전트별로 서로 다른 상황을 보여주기 위해 하드코딩(데모).
  var PLANS = {
    free:  { key: 'free',  label: 'FREE',   price: 0,      limits: { report: 10,  unclaimed: 10,  jjaepity: 0,  claim: 0  } },
    basic: { key: 'basic', label: 'BASIC',  price: 5900,   limits: { report: 50,  unclaimed: 50,  jjaepity: 20, claim: 10 } },
    pro:   { key: 'pro',   label: 'PRO',    price: 14900,  limits: { report: 100, unclaimed: 100, jjaepity: 60, claim: 30 } }
  };
  // 보험금청구만 잔여 소진 후 건당 500원 추가결제 가능
  var CLAIM_EXTRA_PRICE = 500;

  // ===== 데모 에이전트 (플랜 스위처용) =====
  var AGENTS = [
    // FREE — 진료기록리포트 잔여 소진(0), 미청구는 여유 있음 (모달 트리거 시연용)
    { id: 'hong',  name: '홍길동', initial: '홍', org: '메가미래라이프', role: 'FC',   plan: 'free',
      remaining: { report: 0,  unclaimed: 6,  jjaepity: 0,  claim: 0  },
      usage30: { report: 10, unclaimed: 4,  jjaepity: 0 },
      payment: null }, // 무료 → 등록된 결제수단 없음
    // BASIC — 진료기록리포트 16%, 째피티 15% 경고
    { id: 'kim',   name: '김미래', initial: '김', org: '삼성생명',       role: '팀장', plan: 'basic',
      remaining: { report: 8,  unclaimed: 35, jjaepity: 3,  claim: 5  },
      usage30: { report: 42, unclaimed: 15, jjaepity: 17 },
      payment: { brand: '신한카드', last4: '1234' } },
    // PRO — 진료기록리포트 12% 경고, 나머지는 여유
    { id: 'lee',   name: '이보험', initial: '이', org: '한화생명',       role: '지점장', plan: 'pro',
      remaining: { report: 12, unclaimed: 60, jjaepity: 40, claim: 15 },
      usage30: { report: 88, unclaimed: 40, jjaepity: 20 },
      payment: { brand: '삼성카드', last4: '5678' } },
    // BASIC · 만료됨 (재구독 유도 시연용)
    { id: 'park',  name: '박만료', initial: '박', org: 'DB손해보험',     role: 'FC',   plan: 'basic', expired: true,
      remaining: { report: 0,  unclaimed: 0,  jjaepity: 0,  claim: 0  },
      usage30: { report: 0,  unclaimed: 0,  jjaepity: 0 },
      payment: { brand: '국민카드', last4: '9012' },
      expiredAt: '2026-06-05' }
  ];

  var FEATURE_LABEL = {
    report:    '진료기록리포트',
    unclaimed: '미청구보험금',
    jjaepity:  '째피티',
    claim:     '보험금청구'
  };

  function getCurrentAgent() {
    var id = 'hong';
    try { id = localStorage.getItem('bobi-agent-id') || 'hong'; } catch (e) {}
    for (var i = 0; i < AGENTS.length; i++) if (AGENTS[i].id === id) return AGENTS[i];
    return AGENTS[0];
  }
  window.getCurrentAgent = getCurrentAgent;
  window.getPlans = function () { return PLANS; };
  window.getAgents = function () { return AGENTS; };
  window.getFeatureLabel = function (f) { return FEATURE_LABEL[f] || f; };
  window.getClaimExtraPrice = function () { return CLAIM_EXTRA_PRICE; };
  window.setCurrentAgent = function (id) {
    try { localStorage.setItem('bobi-agent-id', id); } catch (e) {}
    location.reload();
  };
  window.setCurrentPlan = function (planKey) {
    // 현재 에이전트의 플랜을 강제 변경 (데모용, 잔여를 새 플랜 한도로 리셋)
    try {
      localStorage.setItem('bobi-plan-override-' + getCurrentAgent().id, planKey);
    } catch (e) {}
    location.reload();
  };
  function getEffectivePlan(agent) {
    var override = null;
    try { override = localStorage.getItem('bobi-plan-override-' + agent.id); } catch (e) {}
    var key = (override && PLANS[override]) ? override : agent.plan;
    return PLANS[key];
  }
  window.getEffectivePlan = function () { return getEffectivePlan(getCurrentAgent()); };
  // 최근 30일 사용량 (feature별)
  window.getMonthlyUsage = function (feature) {
    var agent = getCurrentAgent();
    return (agent.usage30 && typeof agent.usage30[feature] === 'number') ? agent.usage30[feature] : 0;
  };

  // 추천 플랜: 사용량이 각 플랜 한도의 80% 이하로 들어가는 가장 저렴한 플랜
  window.getRecommendedPlan = function () {
    var features = ['report', 'unclaimed', 'jjaepity'];
    var order = ['free', 'basic', 'pro'];
    for (var i = 0; i < order.length; i++) {
      var p = PLANS[order[i]];
      var fits = features.every(function (f) {
        var usage = window.getMonthlyUsage(f);
        if (usage === 0) return true; // 사용 안 하는 기능은 통과
        var limit = p.limits[f] || 0;
        if (limit === 0) return false; // 사용중인 기능이 미포함이면 부적합
        return usage <= Math.floor(limit * 0.8); // 20% 이상 여유
      });
      if (fits) return PLANS[order[i]];
    }
    return PLANS.pro; // 사용량이 PRO도 넘으면 일단 PRO 추천
  };

  window.getRemaining = function (feature) {
    var agent = getCurrentAgent();
    var plan = getEffectivePlan(agent);
    var limit = plan.limits[feature] || 0;
    // 만료된 플랜은 잔여 0으로 처리
    if (agent.expired) return { remaining: 0, limit: limit, plan: plan };
    var raw = (agent.remaining && typeof agent.remaining[feature] === 'number') ? agent.remaining[feature] : 0;
    var override = null;
    try { override = localStorage.getItem('bobi-plan-override-' + agent.id); } catch (e) {}
    if (override) raw = limit; // 오버라이드 시 새 플랜 만한도로 리셋
    return { remaining: Math.min(raw, limit), limit: limit, plan: plan };
  };
  window.isExpired = function () { return !!getCurrentAgent().expired; };
  window.getPaymentMethod = function () { return getCurrentAgent().payment || null; };
  window.getExpiredAt = function () {
    var a = getCurrentAgent();
    return a.expiredAt ? new Date(a.expiredAt) : null;
  };

  // ===== SVG Symbols (전 페이지 공통) =====
  var ICONS_SVG = ''
    // GNB / 페이지 nav
    + '<symbol id="i-home" viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></symbol>'
    + '<symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><path d="M16 5.2a3 3 0 0 1 0 5.6"/><path d="M21 20c0-2.6-1.5-4.5-3.5-5.2"/></symbol>'
    + '<symbol id="i-file-text" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8.5 13h7M8.5 16.5h7M8.5 9.5h2"/></symbol>'
    + '<symbol id="i-search-check" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="m8.5 11 2 2 3.5-3.7"/></symbol>'
    + '<symbol id="i-sparkles" viewBox="0 0 24 24"><path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4z"/><path d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></symbol>'
    + '<symbol id="i-wing" viewBox="0 0 24 24"><path d="M4 20.5C4 12 10 5 20 3.5C19 12 13 20 4 20.5Z"/><path d="M8 18C11 15 14 12 17 9"/></symbol>'
    + '<symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/></symbol>'
    + '<symbol id="i-log-out" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 16 4-4-4-4M20 12H9"/></symbol>'
    // chevron / arrows
    + '<symbol id="i-chevron-left" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></symbol>'
    + '<symbol id="i-chevron-right" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></symbol>'
    + '<symbol id="i-chevron-down" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>'
    + '<symbol id="i-chevrons-left" viewBox="0 0 24 24"><path d="m17 6-6 6 6 6"/><path d="m11 6-6 6 6 6"/></symbol>'
    + '<symbol id="i-chevrons-right" viewBox="0 0 24 24"><path d="m7 6 6 6-6 6"/><path d="m13 6 6 6-6 6"/></symbol>'
    + '<symbol id="i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>'
    + '<symbol id="i-trending-up" viewBox="0 0 24 24"><path d="m3 17 6-6 4 4 8-8"/><path d="M16 7h5v5"/></symbol>'
    // 액션
    + '<symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6 18 18M18 6 6 18"/></symbol>'
    + '<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>'
    + '<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></symbol>'
    + '<symbol id="i-edit" viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/></symbol>'
    + '<symbol id="i-send" viewBox="0 0 24 24"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2z"/></symbol>'
    + '<symbol id="i-download" viewBox="0 0 24 24"><path d="M12 3v12M7 11l5 4 5-4"/><path d="M5 20h14"/></symbol>'
    + '<symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></symbol>'
    + '<symbol id="i-printer" viewBox="0 0 24 24"><path d="M7 9V4h10v5"/><rect x="3.5" y="9" width="17" height="9" rx="2"/><rect x="7" y="14" width="10" height="6"/><circle cx="17" cy="12" r=".6" fill="currentColor" stroke="none"/></symbol>'
    + '<symbol id="i-trash" viewBox="0 0 24 24"><path d="M4.5 7h15"/><path d="M9.5 7V4.5h5V7"/><path d="M6.5 7l1 12.5a2 2 0 0 0 2 1.8h5a2 2 0 0 0 2-1.8L17.5 7"/><path d="M10 11v6M14 11v6"/></symbol>'
    + '<symbol id="i-more-vertical" viewBox="0 0 24 24"><circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="18.5" r="1.4" fill="currentColor" stroke="none"/></symbol>'
    + '<symbol id="i-rotate-ccw" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></symbol>'
    // 상태 (체크 / 알림 / 클락)
    + '<symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></symbol>'
    + '<symbol id="i-check-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></symbol>'
    + '<symbol id="i-alert" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><circle cx="12" cy="16.5" r=".8" fill="currentColor"/></symbol>'
    + '<symbol id="i-help-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-.7 1-2 1.3-2 2.5"/><circle cx="12" cy="17" r=".8" fill="currentColor"/></symbol>'
    + '<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>'
    // 의료 / 진료 카테고리
    + '<symbol id="i-stethoscope" viewBox="0 0 24 24"><path d="M5 3v5a4 4 0 0 0 8 0V3"/><path d="M5 3H3.5M13 3h1.5"/><path d="M9 16v1a4 4 0 0 0 8 0v-1.5"/><circle cx="18" cy="13.5" r="2"/></symbol>'
    + '<symbol id="i-pill" viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="m8.5 8.5 7 7"/></symbol>'
    + '<symbol id="i-type-jil" viewBox="0 0 24 24"><path d="M17 3L21 7"/><path d="M19 5L14.5 9.5"/><path d="M11.5 6.5L17.5 12.5"/><path d="M16.5 11.5L10 18H6V14L12.5 7.5"/><path d="M7.5 12.5L9 14"/><path d="M10.5 9.5L12 11"/><path d="M3 21L6 18"/></symbol>'
    + '<symbol id="i-type-sang" viewBox="0 0 24 24"><path d="M9 5C9 5.53043 9.21071 6.03914 9.58579 6.41421C9.96086 6.78929 10.4696 7 11 7C11.5304 7 12.0391 6.78929 12.4142 6.41421C12.7893 6.03914 13 5.53043 13 5C13 4.46957 12.7893 3.96086 12.4142 3.58579C12.0391 3.21071 11.5304 3 11 3C10.4696 3 9.96086 3.21071 9.58579 3.58579C9.21071 3.96086 9 4.46957 9 5Z"/><path d="M11 7V15H15L19 20"/><path d="M11 11H16"/><path d="M7 11.5C6.28 11.8 5.65 12.26 5.14 12.84C4.63 13.43 4.26 14.12 4.07 14.87C3.88 15.63 3.86 16.41 4.03 17.17C4.19 17.93 4.53 18.64 5.01 19.24C5.49 19.85 6.11 20.33 6.82 20.66C7.52 20.98 8.29 21.14 9.07 21.12C9.84 21.09 10.6 20.89 11.28 20.52C11.97 20.16 12.55 19.63 13 19"/></symbol>'
    + '<symbol id="i-bed" viewBox="0 0 24 24"><path d="M3 7v12M3 13h18v6M21 19v-3a4 4 0 0 0-4-4H8"/><circle cx="7" cy="10.5" r="1.6"/></symbol>'
    + '<symbol id="i-footprints" viewBox="0 0 24 24"><path d="M7 19c-1.5 0-2.5-1-2.5-2.8 0-1.3.6-2 .6-3.4 0-1.2-.4-1.8-.4-3C4.7 7.4 5.7 6 7.2 6c1.4 0 2.3 1.1 2.3 3 0 2.4-.3 3-.3 5.3C9.2 17.7 8.5 19 7 19Z"/><path d="M17 13c1.5 0 2.5-1 2.5-2.8 0-1.3-.6-2-.6-3.4 0-1.2.4-1.8.4-3C19.3 1.4 18.3 0 16.8 0"/><path d="M17 13c-1.5 0-2.2 1.3-2.2 3.3 0 1 .1 1.7.1 2.4 0 1.2.9 2.3 2.1 2.3s2.2-1 2.2-2.8c0-1.3-.6-2-.6-3.4"/></symbol>'
    // 정보 / 메시지 / 위치
    + '<symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></symbol>'
    + '<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></symbol>'
    + '<symbol id="i-won" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M7.5 9l1.6 6 2.9-5.5L14.9 15l1.6-6"/><path d="M7 12.5h10"/></symbol>'
    + '<symbol id="i-message" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></symbol>'
    + '<symbol id="i-phone" viewBox="0 0 24 24"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"/></symbol>'
    + '<symbol id="i-map-pin" viewBox="0 0 24 24"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></symbol>'
    + '<symbol id="i-note" viewBox="0 0 24 24"><path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/><path d="M8 11h8M8 15h6"/></symbol>'
    + '<symbol id="i-layers" viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></symbol>'
    // 사용자 (단일 / 다중)
    + '<symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="9" r="3.5"/><path d="M6.5 17.5h11"/></symbol>'
    + '<symbol id="i-user-2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></symbol>';

  // ===== GNB 템플릿 (데스크탑) =====
  function gnbHTML(active) {
    function navItem(key, href, icon, label, extra) {
      var cls = (active === key) ? ' class="on"' : '';
      return '<a' + cls + ' href="' + href + '"><svg class="ic-svg" width="19" height="19"><use href="#' + icon + '"/></svg>' + label + (extra || '') + '</a>';
    }
    var agent = getCurrentAgent();
    var plan = getEffectivePlan(agent);
    return ''
      + '<aside class="eside">'
      +   '<div class="brand"><a href="' + BASE + 'home.html" aria-label="홈으로"><img src="' + BASE + 'assets/bobi-logo.png" alt="BoBi" /></a></div>'
      +   '<div class="eprofile">'
      +     '<div class="pa">'
      +       '<div class="eav">' + agent.initial + '</div>'
      +       '<div>'
      +         '<div class="nm">' + agent.name + '님</div>'
      +         '<div class="rl">' + agent.org + ' · ' + agent.role + '</div>'
      +       '</div>'
      +     '</div>'
      +     '<div class="plan"><span class="k">현재 플랜</span><a class="v" href="' + BASE + 'pages/plan/index.html" style="text-decoration:none;">' + plan.label + ' ›</a></div>'
      +     '<a class="mybtn' + (active === 'mypage' ? ' on' : '') + '" href="' + BASE + 'pages/mypage/index.html">마이페이지</a>'
      +   '</div>'
      +   '<nav class="enav">'
      +     navItem('home',     BASE + 'home.html',                  'i-home',         '홈')
      +     navItem('customer', BASE + 'pages/customer/list.html',      'i-users',        '내고객')
      +     navItem('report',   BASE + 'pages/report/history.html',     'i-file-text',    '진료기록 리포트')
      +     navItem('unclaimed', BASE + 'pages/unclaimed/history.html', 'i-search-check', '미청구보험금', '<span class="beta-tag">BETA</span>')
      +     navItem('claim',    BASE + 'pages/claim/list.html',         'i-won',          '보험금청구')
      +     navItem('jjaepity', BASE + 'pages/jjaepity/index.html',     'i-wing',         '째피티', '<span class="badge"></span>')
      +     navItem('notice',   '#',                                    'i-bell',         '공지사항')
      +     navItem('planner',  BASE + 'pages/admin/planner/list.html', 'i-user-2',       '설계사관리')
      +   '</nav>'
      +   devSwitcherHTML(agent, plan)
      +   '<div class="logout"><svg class="ic-svg" width="17" height="17"><use href="#i-log-out"/></svg> 로그아웃</div>'
      + '</aside>';
  }

  // ===== [DEV] 로그인 설계사 + 플랜 스위처 =====
  function devSwitcherHTML(agent, plan) {
    var opts = AGENTS.map(function (a) {
      var sel = (a.id === agent.id) ? ' selected' : '';
      return '<option value="' + a.id + '"' + sel + '>' + a.name + ' (' + PLANS[a.plan].label + ')</option>';
    }).join('');
    var planOpts = Object.keys(PLANS).map(function (k) {
      var sel = (plan.key === k) ? ' selected' : '';
      return '<option value="' + k + '"' + sel + '>' + PLANS[k].label + '</option>';
    }).join('');
    return ''
      + '<div class="dev-switch" aria-label="개발자 도구">'
      +   '<div class="dev-switch-title">🛠 임시 스위처</div>'
      +   '<label class="dev-switch-row">'
      +     '<span>설계사</span>'
      +     '<select class="dev-switch-sel" data-role="agent">' + opts + '</select>'
      +   '</label>'
      +   '<label class="dev-switch-row">'
      +     '<span>플랜</span>'
      +     '<select class="dev-switch-sel" data-role="plan">' + planOpts + '</select>'
      +   '</label>'
      + '</div>';
  }

  // ===== 모바일 상단 헤더 + 드로어 (하단 탭바 제거) =====
  function mobileShellHTML(active) {
    function drawerItem(key, href, icon, label, extra) {
      var cls = (active === key) ? ' class="on"' : '';
      return '<a' + cls + ' href="' + href + '"><svg class="ic-svg" width="19" height="19"><use href="#' + icon + '"/></svg>' + label + (extra || '') + '</a>';
    }
    var agent = getCurrentAgent();
    var plan = getEffectivePlan(agent);
    return ''
      + '<header class="m-topbar">'
      +   '<button class="m-ham" type="button" aria-label="메뉴 열기"><svg class="ic-svg" width="22" height="22"><use href="#i-menu"/></svg></button>'
      +   '<a class="m-logo" href="' + BASE + 'home.html"><img src="' + BASE + 'assets/bobi-logo.png" alt="BoBi" /></a>'
      +   '<button class="m-bell" type="button" aria-label="알림"><svg class="ic-svg" width="22" height="22"><use href="#i-bell"/></svg><span class="m-dot"></span></button>'
      + '</header>'
      + '<div class="m-drawer" id="m-drawer" hidden aria-hidden="true">'
      +   '<div class="m-drawer-bg"></div>'
      +   '<div class="m-drawer-panel">'
      +     '<div class="m-drawer-head">'
      +       '<div class="m-drawer-pa"><div class="m-drawer-av">' + agent.initial + '</div><div><div class="m-drawer-nm">' + agent.name + '님</div><div class="m-drawer-rl">' + agent.org + ' · ' + agent.role + '</div></div></div>'
      +       '<button class="m-drawer-close" type="button" aria-label="닫기"><svg class="ic-svg" width="18" height="18"><use href="#i-x"/></svg></button>'
      +     '</div>'
      +     '<a class="m-drawer-mybtn' + (active === 'mypage' ? ' on' : '') + '" href="' + BASE + 'pages/mypage/index.html">마이페이지</a>'
      +     '<div class="m-drawer-list">'
      +       drawerItem('home',     BASE + 'home.html',                    'i-home',         '홈')
      +       drawerItem('customer', BASE + 'pages/customer/list.html',     'i-users',        '내고객')
      +       drawerItem('report',    BASE + 'pages/report/history.html',    'i-file-text',    '진료기록 리포트')
      +       drawerItem('unclaimed', BASE + 'pages/unclaimed/history.html', 'i-search-check', '미청구보험금', '<span class="m-drawer-beta">BETA</span>')
      +       drawerItem('claim',     BASE + 'pages/claim/list.html',        'i-won',          '보험금청구')
      +       drawerItem('jjaepity',  BASE + 'pages/jjaepity/index.html',    'i-wing',         '째피티', '<span class="m-drawer-badge"></span>')
      +       drawerItem('notice',   '#',                                   'i-bell',         '공지사항')
      +       drawerItem('planner',  BASE + 'pages/admin/planner/list.html','i-user-2',       '설계사관리')
      +     '</div>'
      +     devSwitcherHTML(agent, plan)
      +     '<div class="m-drawer-logout"><svg class="ic-svg" width="17" height="17"><use href="#i-log-out"/></svg> 로그아웃</div>'
      +   '</div>'
      + '</div>';
  }

  // 모바일 헤더/탭바에 필요한 아이콘 추가
  ICONS_SVG += ''
    + '<symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>'
    + '<symbol id="i-more-horizontal" viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none"/></symbol>';

  // ===== 스마트보비 준비중 모달 =====
  var SMART_MODAL_CSS = ''
    + '.sm-modal { position: fixed; inset: 0; background: rgba(15,23,42,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; font-family: "Pretendard", system-ui, sans-serif; }'
    + '.sm-modal[hidden] { display: none; }'
    + '.sm-modal-card { position: relative; background: #fff; border-radius: 20px; padding: 36px 36px 28px; max-width: 420px; width: 100%; box-shadow: 0 24px 60px rgba(0,0,0,0.25); box-sizing: border-box; text-align: center; animation: smPop .24s cubic-bezier(0.16,1,0.3,1) both; }'
    + '@keyframes smPop { from { opacity: 0; transform: scale(0.94) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }'
    + '.sm-modal-close { position: absolute; top: 14px; right: 14px; background: none; border: none; padding: 8px; cursor: pointer; color: var(--ink-3); display: inline-flex; border-radius: 8px; transition: color .15s ease, background-color .15s ease; }'
    + '.sm-modal-close:hover { color: var(--ink); background: var(--bg-soft); }'
    + '.sm-modal-close svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }'
    + '.sm-modal-ic { width: 168px; height: 168px; margin: 4px auto 14px; display: grid; place-items: center; position: relative; }'
    + '.sm-modal-ic::before { content: ""; position: absolute; inset: 8px; border-radius: 50%; background: radial-gradient(circle at 50% 55%, var(--brand-pale) 0%, #FFF1E8 55%, transparent 78%); z-index: 0; }'
    + '.sm-modal-ic img { position: relative; z-index: 1; width: 100%; height: 100%; object-fit: contain; animation: smFloat 3.6s ease-in-out infinite; }'
    + '@keyframes smFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }'
    + '.sm-modal-tag { display: inline-flex; align-items: center; gap: 6px; background: var(--brand-pale); color: var(--brand-deep); border-radius: var(--r-pill); padding: 5px 12px; font-size: var(--fs-option); font-weight: 800; letter-spacing: -0.01em; margin-bottom: 12px; }'
    + '.sm-modal-tag svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }'
    + '.sm-modal-title { font-size: var(--fs-h2); font-weight: 800; color: var(--ink); letter-spacing: -0.02em; line-height: 1.4; margin: 0 0 10px; }'
    + '.sm-modal-desc { font-size: var(--fs-body); color: var(--ink-3); line-height: 1.6; margin: 0 0 26px; font-weight: 500; }'
    + '.sm-modal-desc b { color: var(--ink); font-weight: 700; }'
    + '.sm-modal-cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: var(--brand-grad); color: #fff; border: none; border-radius: var(--r-pill); padding: 14px 24px; font-family: inherit; font-size: var(--fs-body); font-weight: 700; cursor: pointer; box-shadow: var(--sh-brand); letter-spacing: -0.01em; transition: filter .2s ease; }'
    + '.sm-modal-cta:hover { filter: brightness(1.05); }';

  function smartModalHTML() {
    return ''
      + '<div class="sm-modal" id="smart-modal" hidden role="dialog" aria-modal="true" aria-labelledby="sm-modal-title">'
      +   '<div class="sm-modal-card">'
      +     '<button class="sm-modal-close" type="button" id="sm-modal-close" aria-label="닫기">'
      +       '<svg class="ic-svg" width="18" height="18"><use href="#i-x"/></svg>'
      +     '</button>'
      +     '<div class="sm-modal-ic">'
      +       '<img src="' + BASE + 'assets/img_jjapt.png" alt="보비 마스코트" />'
      +     '</div>'
      +     '<div class="sm-modal-tag">'
      +       '<svg class="ic-svg" width="13" height="13"><use href="#i-clock"/></svg>'
      +       'COMING SOON'
      +     '</div>'
      +     '<h3 class="sm-modal-title" id="sm-modal-title">스마트보비, 출시 준비 중이에요</h3>'
      +     '<p class="sm-modal-desc">더 똑똑해진 <b>AI 보험 비서</b>로<br/>곧 새로운 모습으로 찾아뵐게요.<br/>조금만 기다려주세요!</p>'
      +     '<button class="sm-modal-cta" type="button" id="sm-modal-ok">기대할게요</button>'
      +   '</div>'
      + '</div>';
  }

  // ===== 잔여 부족 모달 =====
  var QUOTA_MODAL_CSS = ''
    + '.qm-modal { position: fixed; inset: 0; background: rgba(15,23,42,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; font-family: "Pretendard", system-ui, sans-serif; }'
    + '.qm-modal[hidden] { display: none; }'
    + '.qm-card { position: relative; background: #fff; border-radius: 20px; padding: 32px 32px 24px; max-width: 460px; width: 100%; box-shadow: 0 24px 60px rgba(0,0,0,0.25); box-sizing: border-box; animation: qmPop .24s cubic-bezier(0.16,1,0.3,1) both; }'
    + '@keyframes qmPop { from { opacity: 0; transform: scale(0.94) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }'
    + '.qm-close { position: absolute; top: 14px; right: 14px; background: none; border: none; padding: 8px; cursor: pointer; color: var(--ink-3); display: inline-flex; border-radius: 8px; }'
    + '.qm-close:hover { color: var(--ink); background: var(--bg-soft); }'
    + '.qm-close svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }'
    + '.qm-ic { width: 56px; height: 56px; border-radius: 50%; background: #FFF0F1; color: #C92238; display: grid; place-items: center; margin-bottom: 16px; }'
    + '.qm-ic svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }'
    + '.qm-title { font-size: var(--fs-h2); font-weight: 800; color: var(--ink); letter-spacing: -0.02em; margin: 0 0 8px; line-height: 1.4; }'
    + '.qm-desc { font-size: var(--fs-body); color: var(--ink-2); line-height: 1.6; margin: 0 0 18px; }'
    + '.qm-desc b { color: var(--ink); font-weight: 700; }'
    + '.qm-status { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--bg-soft); border-radius: var(--r-md); padding: 12px 16px; margin-bottom: 18px; }'
    + '.qm-status-l { font-size: var(--fs-option); color: var(--ink-3); font-weight: 700; }'
    + '.qm-status-v { font-size: var(--fs-body); font-weight: 800; color: var(--ink); }'
    + '.qm-status-v b { color: #C92238; }'
    + '.qm-plans { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }'
    + '.qm-plan { border: 1px solid var(--line); border-radius: var(--r-md); padding: 12px 14px; text-align: left; }'
    + '.qm-plan .qp-l { font-size: 11px; color: var(--ink-3); font-weight: 800; letter-spacing: 0.04em; }'
    + '.qm-plan .qp-v { font-size: var(--fs-body); font-weight: 800; color: var(--ink); margin-top: 4px; }'
    + '.qm-plan .qp-v small { font-size: 11px; font-weight: 600; color: var(--ink-3); margin-left: 2px; }'
    + '.qm-actions { display: flex; flex-direction: column; gap: 8px; }'
    + '.qm-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 20px; border-radius: var(--r-pill); font-family: inherit; font-size: var(--fs-body); font-weight: 700; cursor: pointer; letter-spacing: -0.01em; border: 1px solid transparent; text-decoration: none; transition: filter .15s ease, background-color .15s ease, border-color .15s ease; }'
    + '.qm-btn.primary { background: var(--brand-grad); color: #fff; box-shadow: var(--sh-brand); }'
    + '.qm-btn.primary:hover { filter: brightness(1.05); }'
    + '.qm-btn.extra { background: #fff; color: var(--brand-deep); border-color: var(--brand-soft); }'
    + '.qm-btn.extra:hover { background: var(--brand-pale); }'
    + '.qm-btn.ghost { background: #fff; color: var(--ink-2); border-color: var(--line-strong); }'
    + '.qm-btn.ghost:hover { background: var(--bg-soft); color: var(--ink); }';

  function quotaModalHTML() {
    return ''
      + '<div class="qm-modal" id="qm-modal" hidden role="dialog" aria-modal="true" aria-labelledby="qm-title">'
      +   '<div class="qm-card">'
      +     '<button class="qm-close" type="button" id="qm-close" aria-label="닫기"><svg class="ic-svg" width="18" height="18"><use href="#i-x"/></svg></button>'
      +     '<div class="qm-ic"><svg class="ic-svg" width="26" height="26"><use href="#i-alert"/></svg></div>'
      +     '<h3 class="qm-title" id="qm-title">잔여 사용량이 부족해요</h3>'
      +     '<p class="qm-desc" id="qm-desc"></p>'
      +     '<div class="qm-status">'
      +       '<span class="qm-status-l" id="qm-status-l">현재 플랜</span>'
      +       '<span class="qm-status-v" id="qm-status-v"></span>'
      +     '</div>'
      +     '<div class="qm-actions" id="qm-actions"></div>'
      +   '</div>'
      + '</div>';
  }

  function bindQuotaModal() {
    var modal = document.getElementById('qm-modal');
    if (!modal) return;
    var close = document.getElementById('qm-close');
    function shut() { modal.hidden = true; document.body.style.overflow = ''; }
    if (close) close.addEventListener('click', shut);
    modal.addEventListener('click', function (e) { if (e.target === modal) shut(); });
    document.addEventListener('keydown', function (e) { if (!modal.hidden && e.key === 'Escape') shut(); });
    window.closeQuotaModal = shut;
  }

  // 잔여 부족 시 안내 모달을 열고 false 반환. 여유가 있으면 true 반환.
  window.checkQuota = function (feature) {
    var info = window.getRemaining(feature);
    if (info.remaining > 0) return true;
    var modal = document.getElementById('qm-modal');
    if (!modal) return true;
    var featLabel = FEATURE_LABEL[feature] || feature;
    document.getElementById('qm-title').textContent = '이번 달 ' + featLabel + ' 사용량을 모두 소진했어요';
    document.getElementById('qm-desc').innerHTML =
      '현재 플랜에서 사용할 수 있는 <b>' + featLabel + '</b> 횟수를 모두 사용했어요.<br/>'
      + '더 많이 이용하려면 요금제를 업그레이드해 주세요.';
    document.getElementById('qm-status-l').textContent = '현재 플랜';
    document.getElementById('qm-status-v').innerHTML =
      info.plan.label + ' <b>· 잔여 0 / ' + info.limit + ' 건</b>';
    var actions = document.getElementById('qm-actions');
    var buttons = ''
      + '<a class="qm-btn primary" href="' + BASE + 'pages/plan/index.html">요금제 업그레이드 하기</a>';
    if (feature === 'claim') {
      buttons += '<button type="button" class="qm-btn extra" id="qm-btn-extra">'
        + '이번 건만 <b style="margin:0 4px;">500원</b> 추가결제하고 계속</button>';
    }
    buttons += '<button type="button" class="qm-btn ghost" onclick="closeQuotaModal()">닫기</button>';
    actions.innerHTML = buttons;
    if (feature === 'claim') {
      var extra = document.getElementById('qm-btn-extra');
      if (extra) extra.addEventListener('click', function () {
        window.closeQuotaModal();
        alert('500원 추가결제가 요청되었습니다. (데모)');
      });
    }
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    return false;
  };

  // ===== 공통 잔여 뱃지 (pill) =====
  // 사용법: <span class="quota-pill" data-quota-pill="report"></span>
  // 또는 window.renderQuotaPill('report') 로 HTML 문자열 얻어 삽입.
  var QUOTA_PILL_CSS = ''
    + '.quota-pill { display: inline-flex; align-items: baseline; gap: 4px; color: var(--ink-3); font-family: "Pretendard", system-ui, sans-serif; font-size: var(--fs-option); font-weight: 600; line-height: 1.4; letter-spacing: -0.01em; white-space: nowrap; }'
    + '.quota-pill b { color: var(--ink); font-weight: 800; }'
    + '.quota-pill.warn { color: #C92238; }'
    + '.quota-pill.warn b { color: #C92238; }'
    + '.quota-pill.gone { color: var(--brand-deep); text-decoration: none; cursor: pointer; }'
    + '.quota-pill.gone:hover { text-decoration: underline; }';

  window.renderQuotaPill = function (feature) {
    var info = window.getRemaining(feature);
    var cls = 'quota-pill';
    if (info.limit === 0) {
      return '<a class="' + cls + ' gone" href="' + BASE + 'pages/plan/index.html">플랜 업그레이드 하기 ›</a>';
    }
    if (info.remaining === 0) cls += ' warn';
    else if (info.remaining <= Math.max(1, Math.floor(info.limit * 0.2))) cls += ' warn';
    var body = '이번 달 잔여 <b>' + info.remaining + '</b> / ' + info.limit + '건';
    return '<span class="' + cls + '">' + body + '</span>';
  };

  // data-quota-pill 속성이 있는 노드를 자동으로 잔여 뱃지로 렌더
  // (기존 노드의 className과 style을 렌더된 pill로 넘겨주어 배치 정보 유지)
  function paintQuotaPills() {
    document.querySelectorAll('[data-quota-pill]').forEach(function (el) {
      var f = el.getAttribute('data-quota-pill');
      var extraCls = el.className || '';
      var extraStyle = el.getAttribute('style') || '';
      var wrapper = document.createElement('div');
      wrapper.innerHTML = window.renderQuotaPill(f);
      var pill = wrapper.firstChild;
      if (extraCls) pill.className += ' ' + extraCls;
      if (extraStyle) pill.setAttribute('style', (pill.getAttribute('style') || '') + ';' + extraStyle);
      el.parentNode.replaceChild(pill, el);
    });
  }

  // ===== [DEV] 스위처 CSS =====
  var DEV_SWITCH_CSS = ''
    + '.dev-switch { margin: 12px 12px 0; padding: 10px 12px; background: #F3F5F7; border: 1px dashed #C7CFD6; border-radius: 10px; font-family: "Pretendard", system-ui, sans-serif; }'
    + '.dev-switch-title { font-size: 11px; color: #6B7681; font-weight: 800; letter-spacing: 0.03em; margin-bottom: 6px; }'
    + '.dev-switch-row { display: flex; align-items: center; gap: 6px; margin-top: 4px; }'
    + '.dev-switch-row > span { font-size: 11px; color: #6B7681; font-weight: 700; flex: none; width: 34px; }'
    + '.dev-switch-sel { flex: 1; height: 28px; border: 1px solid #D1D8DE; border-radius: 6px; background: #fff; font-family: inherit; font-size: 12px; color: #2A343B; padding: 0 6px; outline: none; }'
    + '.dev-switch-sel:focus { border-color: var(--brand); }';

  function bindDevSwitcher() {
    document.querySelectorAll('.dev-switch-sel').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var role = sel.getAttribute('data-role');
        if (role === 'agent') {
          try { localStorage.removeItem('bobi-plan-override-' + getCurrentAgent().id); } catch (e) {}
          window.setCurrentAgent(sel.value);
        } else if (role === 'plan') {
          window.setCurrentPlan(sel.value);
        }
      });
    });
  }

  function bindSmartModal() {
    var modal = document.getElementById('smart-modal');
    if (!modal) return;
    function open(e) { if (e) e.preventDefault(); modal.hidden = false; document.body.style.overflow = 'hidden'; }
    function shut() { modal.hidden = true; document.body.style.overflow = ''; }
    window.openSmartComingSoon = open;
    var close = document.getElementById('sm-modal-close');
    var ok = document.getElementById('sm-modal-ok');
    if (close) close.addEventListener('click', shut);
    if (ok)    ok.addEventListener('click', shut);
    modal.addEventListener('click', function (e) { if (e.target === modal) shut(); });
    document.addEventListener('keydown', function (e) { if (!modal.hidden && e.key === 'Escape') shut(); });
    // 클릭 트리거 자동 바인딩: button.smart-cta (저장·내보내기 등 아직 준비중인 액션)
    // 앵커(<a class="smart-cta">)는 href로 이동 — 모달 열지 않음.
    document.querySelectorAll('button.smart-cta').forEach(function (el) {
      el.addEventListener('click', open);
    });
  }

  // ===== 푸터 템플릿 =====
  function footerHTML() {
    return ''
      + '<footer class="ft">'
      +   '<div class="ft-inner">'
      +     '<div class="ft-links">'
      +       '<button class="ft-link">이용약관</button>'
      +       '<span class="ft-sep">|</span>'
      +       '<button class="ft-link bold">개인정보처리방침</button>'
      +     '</div>'
      +     '<div class="ft-info">'
      +       '<p>주식회사 천호인터내셔널<span class="ft-sep-dot">·</span>대표 이승엽<span class="ft-sep-dot">·</span>사업자등록번호 342-81-00261</p>'
      +       '<p>대구광역시 중구 달구벌대로 1929, 2층 (대신동)<span class="ft-sep-dot">·</span>대표번호 1644-0161</p>'
      +     '</div>'
      +   '</div>'
      + '</footer>';
  }

  // ===== 환자 아바타 자동 채색 =====
  // .patient-avatar[data-name] 요소를 찾아 첫 글자 + 팔레트 색상 적용.
  // 전체 이름 기반 해시 → 같은 이름은 항상 같은 색, 다른 이름은 (대체로) 다른 색.
  // 페이지 내에서 이름이 동적으로 바뀐 뒤에도 다시 호출 가능.
  var AVATAR_PALETTE = ['#8FB8C4','#E89A9A','#B89AC4','#9AC4A6','#D4B88A','#9AB8E0','#E0A8C0','#9AC4B8','#C49AAE','#A8BFA4'];
  function hashName(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) {
      h = ((h << 5) - h) + name.charCodeAt(i);
      h = h | 0;
    }
    return Math.abs(h);
  }
  window.paintPatientAvatars = function () {
    document.querySelectorAll('.patient-avatar[data-name]').forEach(function (el) {
      var name = el.dataset.name;
      if (!name) return;
      el.textContent = name.charAt(0);
      el.style.background = AVATAR_PALETTE[hashName(name) % AVATAR_PALETTE.length];
    });
  };

  // ===== 주입 함수 =====
  window.injectShell = function (active) {
    var iconsHost = document.getElementById('icons-host');
    if (iconsHost) {
      iconsHost.outerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' + ICONS_SVG + '</svg>';
    }
    var gnbHost = document.getElementById('gnb-host');
    if (gnbHost) {
      // 데스크탑 GNB + 모바일 헤더/탭바를 함께 주입. CSS @media로 토글.
      gnbHost.outerHTML = gnbHTML(active) + mobileShellHTML(active);
    }
    var footerHost = document.getElementById('footer-host');
    if (footerHost) footerHost.outerHTML = footerHTML();
    // 스마트보비 준비중 모달 — body 끝에 한 번만 주입
    if (!document.getElementById('smart-modal')) {
      var style = document.createElement('style');
      style.textContent = SMART_MODAL_CSS;
      document.head.appendChild(style);
      var holder = document.createElement('div');
      holder.innerHTML = smartModalHTML();
      document.body.appendChild(holder.firstChild);
    }
    // 잔여 부족 모달 + 스위처 + 잔여 뱃지 스타일
    if (!document.getElementById('qm-modal')) {
      var qStyle = document.createElement('style');
      qStyle.textContent = QUOTA_MODAL_CSS + DEV_SWITCH_CSS + QUOTA_PILL_CSS;
      document.head.appendChild(qStyle);
      var qHolder = document.createElement('div');
      qHolder.innerHTML = quotaModalHTML();
      document.body.appendChild(qHolder.firstChild);
    }
    window.paintPatientAvatars();
    bindMobileShell();
    bindSmartModal();
    bindQuotaModal();
    bindDevSwitcher();
    paintQuotaPills();
  };

  // 햄버거 → 드로어 토글
  function bindMobileShell() {
    var drawer = document.getElementById('m-drawer');
    if (!drawer) return;
    var ham   = document.querySelector('.m-ham');
    var close = drawer.querySelector('.m-drawer-close');
    var bg    = drawer.querySelector('.m-drawer-bg');
    function open() { drawer.hidden = false; drawer.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; }
    function shut() { drawer.hidden = true;  drawer.setAttribute('aria-hidden','true');  document.body.style.overflow = ''; }
    if (ham)   ham.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    if (bg)    bg.addEventListener('click', shut);
  }
})();
