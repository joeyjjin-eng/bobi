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

   active 키: 'home' | 'customer' | 'report' | 'claim' | 'smart' | 'notice'
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

  // ===== SVG Symbols (전 페이지 공통) =====
  var ICONS_SVG = ''
    // GNB / 페이지 nav
    + '<symbol id="i-home" viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></symbol>'
    + '<symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><path d="M16 5.2a3 3 0 0 1 0 5.6"/><path d="M21 20c0-2.6-1.5-4.5-3.5-5.2"/></symbol>'
    + '<symbol id="i-file-text" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8.5 13h7M8.5 16.5h7M8.5 9.5h2"/></symbol>'
    + '<symbol id="i-search-check" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="m8.5 11 2 2 3.5-3.7"/></symbol>'
    + '<symbol id="i-sparkles" viewBox="0 0 24 24"><path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4z"/><path d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></symbol>'
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
    + '<symbol id="i-bed" viewBox="0 0 24 24"><path d="M3 7v12M3 13h18v6M21 19v-3a4 4 0 0 0-4-4H8"/><circle cx="7" cy="10.5" r="1.6"/></symbol>'
    + '<symbol id="i-footprints" viewBox="0 0 24 24"><path d="M7 19c-1.5 0-2.5-1-2.5-2.8 0-1.3.6-2 .6-3.4 0-1.2-.4-1.8-.4-3C4.7 7.4 5.7 6 7.2 6c1.4 0 2.3 1.1 2.3 3 0 2.4-.3 3-.3 5.3C9.2 17.7 8.5 19 7 19Z"/><path d="M17 13c1.5 0 2.5-1 2.5-2.8 0-1.3-.6-2-.6-3.4 0-1.2.4-1.8.4-3C19.3 1.4 18.3 0 16.8 0"/><path d="M17 13c-1.5 0-2.2 1.3-2.2 3.3 0 1 .1 1.7.1 2.4 0 1.2.9 2.3 2.1 2.3s2.2-1 2.2-2.8c0-1.3-.6-2-.6-3.4"/></symbol>'
    // 정보 / 메시지 / 위치
    + '<symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></symbol>'
    + '<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></symbol>'
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
    return ''
      + '<aside class="eside">'
      +   '<div class="brand"><img src="' + BASE + 'assets/bobi-logo.png" alt="BoBi" /></div>'
      +   '<div class="eprofile">'
      +     '<div class="pa">'
      +       '<div class="eav">홍</div>'
      +       '<div>'
      +         '<div class="nm">홍길동님</div>'
      +         '<div class="rl">메가미래라이프 · FC</div>'
      +       '</div>'
      +     '</div>'
      +     '<button class="mybtn">마이페이지</button>'
      +   '</div>'
      +   '<nav class="enav">'
      +     navItem('home',     BASE + 'home.html',                  'i-home',         '홈')
      +     navItem('customer', BASE + 'pages/customer/list.html',      'i-users',        '내고객')
      +     navItem('report',   BASE + 'pages/report/history.html',     'i-file-text',    '진료기록 리포트')
      +     navItem('claim',    BASE + 'pages/unclaimed/history.html',  'i-search-check', '미청구보험금')
      +     navItem('smart',    '#',                                    'i-sparkles',     '스마트보비', '<span class="badge"></span>')
      +     navItem('notice',   '#',                                    'i-bell',         '공지사항')
      +   '</nav>'
      +   '<div class="logout"><svg class="ic-svg" width="17" height="17"><use href="#i-log-out"/></svg> 로그아웃</div>'
      + '</aside>';
  }

  // ===== 모바일 상단 헤더 + 하단 탭바 =====
  function mobileShellHTML(active) {
    function tab(key, href, icon, label) {
      var cls = (active === key) ? ' on' : '';
      return '<a class="m-tab' + cls + '" href="' + href + '"><svg class="ic-svg" width="22" height="22"><use href="#' + icon + '"/></svg><span>' + label + '</span></a>';
    }
    return ''
      + '<header class="m-topbar">'
      +   '<button class="m-ham" type="button" aria-label="메뉴 열기"><svg class="ic-svg" width="22" height="22"><use href="#i-menu"/></svg></button>'
      +   '<a class="m-logo" href="' + BASE + 'home.html"><img src="' + BASE + 'assets/bobi-logo.png" alt="BoBi" /></a>'
      +   '<button class="m-bell" type="button" aria-label="알림"><svg class="ic-svg" width="22" height="22"><use href="#i-bell"/></svg><span class="m-dot"></span></button>'
      + '</header>'
      + '<nav class="m-tabbar">'
      +   tab('home',     BASE + 'home.html',                    'i-home',         '홈')
      +   tab('customer', BASE + 'pages/customer/list.html',     'i-users',        '내고객')
      +   tab('report',   BASE + 'pages/report/history.html',    'i-file-text',    '리포트')
      +   tab('claim',    BASE + 'pages/unclaimed/history.html', 'i-search-check', '미청구')
      +   '<button class="m-tab m-more" type="button" aria-label="더보기"><svg class="ic-svg" width="22" height="22"><use href="#i-more-horizontal"/></svg><span>더보기</span></button>'
      + '</nav>'
      + '<div class="m-drawer" id="m-drawer" hidden aria-hidden="true">'
      +   '<div class="m-drawer-bg"></div>'
      +   '<div class="m-drawer-panel">'
      +     '<div class="m-drawer-head">'
      +       '<div class="m-drawer-pa"><div class="m-drawer-av">홍</div><div><div class="m-drawer-nm">홍길동님</div><div class="m-drawer-rl">메가미래라이프 · FC</div></div></div>'
      +       '<button class="m-drawer-close" type="button" aria-label="닫기"><svg class="ic-svg" width="18" height="18"><use href="#i-x"/></svg></button>'
      +     '</div>'
      +     '<button class="m-drawer-mybtn">마이페이지</button>'
      +     '<div class="m-drawer-list">'
      +       '<a href="#"><svg class="ic-svg" width="19" height="19"><use href="#i-sparkles"/></svg>스마트보비</a>'
      +       '<a href="#"><svg class="ic-svg" width="19" height="19"><use href="#i-bell"/></svg>공지사항</a>'
      +     '</div>'
      +     '<div class="m-drawer-logout"><svg class="ic-svg" width="17" height="17"><use href="#i-log-out"/></svg> 로그아웃</div>'
      +   '</div>'
      + '</div>';
  }

  // 모바일 헤더/탭바에 필요한 아이콘 추가
  ICONS_SVG += ''
    + '<symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>'
    + '<symbol id="i-more-horizontal" viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none"/></symbol>';

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
      +       '<p>대구광역시 중구 달구벌대로 1929, 2층 (대신동)</p>'
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
    window.paintPatientAvatars();
    bindMobileShell();
  };

  // 햄버거 + 더보기 → 드로어 토글
  function bindMobileShell() {
    var drawer = document.getElementById('m-drawer');
    if (!drawer) return;
    var ham   = document.querySelector('.m-ham');
    var more  = document.querySelector('.m-more');
    var close = drawer.querySelector('.m-drawer-close');
    var bg    = drawer.querySelector('.m-drawer-bg');
    function open() { drawer.hidden = false; drawer.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; }
    function shut() { drawer.hidden = true;  drawer.setAttribute('aria-hidden','true');  document.body.style.overflow = ''; }
    if (ham)   ham.addEventListener('click', open);
    if (more)  more.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    if (bg)    bg.addEventListener('click', shut);
  }
})();
