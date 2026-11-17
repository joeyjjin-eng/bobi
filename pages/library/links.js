/* 보비 자료실 상세 — 링크형 (폴더 탐색 + 탭 분류 + 보험사 링크 카드) */
(function () {
  // 루트 카테고리를 index.html과 동일한 4색 체계(med/in/surg/off)에 매핑
  var TONE = ['med', 'in', 'surg', 'off'];

  // 폴더 구조 (깊이 제한 없음) · 이름과 자료 수는 예시 — detail.html · gallery.html · doc.html 과 동일
  var TREE = [
    { id: 'a', name: '보험사 자료', docs: 32, kids: [
      { id: 'c1', name: '보험회사 콜센터 번호', docs: 12 },
      { id: 'c2', name: '홈페이지 주소', docs: 6 },
      { id: 'c3', name: '설계사 전산 주소', docs: 9 },
      { id: 'c4', name: '모니터링 인콜 번호', docs: 5 }
    ]},
    { id: 'b', name: '계약 및 청약 관리', docs: 14, kids: [
      { id: 'b1', name: '계약변경, 보험료 납부', docs: 8 },
      { id: 'b2', name: '전자청약', docs: 6 }
    ]},
    { id: 'd', name: '보험금 청구', docs: 21, kids: [
      { id: 'd1', name: '현장조사 대응 방법', docs: 5 },
      { id: 'd2', name: '보험금 청구서류', docs: 9 },
      { id: 'd3', name: '보험금 청구 필요서류', docs: 7 }
    ]},
    { id: 'e', name: '자동차 관리', docs: 18, kids: [
      { id: 'e1', name: '사고 접수 방법', docs: 1 },
      { id: 'e2', name: '긴급출동 번호', docs: 1 },
      { id: 'e3', name: '갱신·할인 특약', docs: 1 },
      { id: 'e4', name: '렌터카·대차 안내', docs: 1 }
    ]}
  ];

  // 리스트형이 아닌 갤러리형으로 보여줄 폴더 — 해당 폴더는 gallery.html 쪽으로 넘긴다 (보험금 청구 = 전부 갤러리)
  var GALLERY_VIEW = { d1: true, d2: true, d3: true };
  // 폴더/리스트 없이 바로 게시물로 넘어가는 폴더 — 값은 랜딩할 자료 id (자동차 관리 = 전부 바로 게시물)
  var DIRECT_POST = { e1: 'doc9', e2: 'doc10', e3: 'doc11', e4: 'doc12' };
  // 탭+링크 카드 그리드로 보여줄 폴더 (이 페이지가 직접 다루는 폴더) — 폴더 id별 탭 데이터
  var LINKS_DATA = {
    c1: {
      tabs: [
        { id: 'life', label: '생명보험사', items: [
          { name: '삼성생명', sub: '1588-3114', kind: 'tel', value: '1588-3114' },
          { name: '한화생명', sub: '1588-6363', kind: 'tel', value: '1588-6363' },
          { name: '교보생명', sub: '1588-1001', kind: 'tel', value: '1588-1001' },
          { name: '신한라이프', sub: '1588-5580', kind: 'tel', value: '1588-5580' },
          { name: 'NH농협생명', sub: '1588-4300', kind: 'tel', value: '1588-4300' },
          { name: '미래에셋생명', sub: '1588-5600', kind: 'tel', value: '1588-5600' },
          { name: '동양생명', sub: '1577-1004', kind: 'tel', value: '1577-1004' },
          { name: 'ABL생명', sub: '1588-6500', kind: 'tel', value: '1588-6500' }
        ]},
        { id: 'nonlife', label: '손해보험사', items: [
          { name: '삼성화재', sub: '1588-5114', kind: 'tel', value: '1588-5114' },
          { name: '현대해상', sub: '1588-5656', kind: 'tel', value: '1588-5656' },
          { name: 'DB손해보험', sub: '1588-0100', kind: 'tel', value: '1588-0100' },
          { name: 'KB손해보험', sub: '1544-0114', kind: 'tel', value: '1544-0114' },
          { name: '메리츠화재', sub: '1566-7711', kind: 'tel', value: '1566-7711' },
          { name: '롯데손해보험', sub: '1588-3344', kind: 'tel', value: '1588-3344' },
          { name: '하나손해보험', sub: '1566-0100', kind: 'tel', value: '1566-0100' },
          { name: '흥국화재', sub: '1688-1688', kind: 'tel', value: '1688-1688' }
        ]},
        { id: 'mutual', label: '공제·기타', items: [
          { name: '새마을금고중앙회 공제', sub: '1599-9000', kind: 'tel', value: '1599-9000' },
          { name: '수협중앙회 공제', sub: '1588-1515', kind: 'tel', value: '1588-1515' },
          { name: '신협중앙회 공제', sub: '1566-6000', kind: 'tel', value: '1566-6000' },
          { name: 'NH농협손해보험', sub: '1588-4300', kind: 'tel', value: '1588-4300' }
        ]},
        { id: 'reins', label: '재보험사', items: [
          { name: '코리안리재보험', sub: '02-3702-6000', kind: 'tel', value: '02-3702-6000' },
          { name: '스위스리코리아', sub: '02-3702-6300', kind: 'tel', value: '02-3702-6300' },
          { name: 'RGA코리아', sub: '02-6730-9500', kind: 'tel', value: '02-6730-9500' }
        ]},
        { id: 'ga', label: 'GA·법인대리점', items: [
          { name: '피플라이프', sub: '1688-2662', kind: 'tel', value: '1688-2662' },
          { name: '인카금융서비스', sub: '1600-1230', kind: 'tel', value: '1600-1230' },
          { name: '글로벌금융판매', sub: '공식 홈페이지', kind: 'link', value: '#' },
          { name: '지에이코리아', sub: '공식 홈페이지', kind: 'link', value: '#' }
        ]}
      ]
    }
  };

  // c1과 같은 보험사 목록을 재사용 — 폴더 목적에 맞게 sub/kind/value만 바꿔서 c2·c3·c4를 만든다
  function deriveLinkFolder(overrideFn) {
    return { tabs: LINKS_DATA.c1.tabs.map(function (t) {
      return { id: t.id, label: t.label, items: t.items.map(function (it) {
        var o = overrideFn(it);
        return { name: it.name, sub: o.sub, kind: o.kind, value: o.value };
      }) };
    }) };
  }
  LINKS_DATA.c2 = deriveLinkFolder(function () {
    return { sub: '공식 홈페이지', kind: 'link', value: '#' };
  });
  LINKS_DATA.c3 = deriveLinkFolder(function () {
    return { sub: '설계사 전산 포털', kind: 'link', value: '#' };
  });
  LINKS_DATA.c4 = deriveLinkFolder(function (it) {
    var v = it.kind === 'tel' ? it.value : '1588-0000';
    return { sub: v, kind: 'tel', value: v };
  });

  var byId = {}, parent = {}, rootIdx = {};
  (function walk(nodes, p, root) {
    nodes.forEach(function (n, i) {
      var r = root === null ? i : root;
      byId[n.id] = n; parent[n.id] = p; rootIdx[n.id] = r;
      if (n.kids) walk(n.kids, n.id, r);
    });
  })(TREE, null, null);

  function tone(id) { return TONE[rootIdx[id] % TONE.length]; }

  var params = new URLSearchParams(location.search);
  var state = { active: byId[params.get('folder')] ? params.get('folder') : 'c1', menu: -1, tab: 0, q: '' };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hasKids(n) { return !!(n.kids && n.kids.length); }

  // pages/claim·pages/coverage 에서 이미 쓰고 있는 실제 보험사 로고 — 있으면 이미지로, 없으면 이니셜 아바타로 대체
  var INSURER_LOGO = {
    '삼성생명': 'icn_blogo_ss_s.png', '삼성화재': 'icn_blogo_ss_s.png',
    '현대해상': 'icn_blogo_hd_s.png',
    'DB손해보험': 'icn_blogo_db_s.png',
    'KB손해보험': 'icn_blogo_kb_s.png',
    'NH농협생명': 'icn_blogo_nh_s.png', 'NH농협손해보험': 'icn_blogo_nh_s.png',
    '메리츠화재': 'icn_blogo_mz_s.png',
    '롯데손해보험': 'icn_blogo_lt_s.png',
    '하나손해보험': 'icn_blogo_hnsh_s.png',
    '흥국화재': 'icn_carinsu_hk_s.png',
    '한화생명': 'icn_blogo_hh_s.svg',
    'ABL생명': 'icn_logo_abl_s.png',
    '교보생명': 'icn_blogo_kyo_s.svg',
    '신한라이프': 'icn_blogo_sh_s.svg',
    '미래에셋생명': 'icn_blogo_mirae_s.svg',
    '동양생명': 'icn_logo_dy_s.svg',
    '새마을금고중앙회 공제': 'icn_blogo_mg_s.svg'
  };
  var LOGO_COLORS = ['#42BAFF', '#2ABBA7', '#9360F7', '#FF7A85', '#1C50A1', '#F6A609'];
  function initials(name) {
    var m = name.match(/^[A-Za-z]+/);
    return m ? m[0].slice(0, 2).toUpperCase() : name.charAt(0);
  }

  function go(id) {
    state.active = id; state.menu = -1; state.tab = 0; state.q = '';
    history.replaceState(null, '', '?folder=' + id);
    render();
  }

  function crumbsHTML(path) {
    return path.map(function (n, i) {
      var sibs = i === 0 ? TREE : byId[parent[n.id]].kids;
      var isLast = i === path.length - 1;
      var on = state.menu === i;
      var label = i === 0 ? '카테고리 이동' : byId[parent[n.id]].name + ' 안의 폴더';
      var cls = 'lib-crumb' + (isLast ? ' cur' : '') + (on ? ' open' : '');
      var menu = '';
      if (on) {
        menu = '<ul role="listbox" aria-label="' + esc(label) + '" class="lib-dd-menu">' +
          '<li class="lib-dd-label">' + esc(label) + '</li>' +
          sibs.map(function (s) {
            var cur = s.id === n.id;
            var optCls = 'lib-dd-opt tone-' + tone(s.id) + (i === 0 ? ' root' : '') + (cur ? ' cur' : '');
            return '<li role="option" aria-selected="' + cur + '"><button type="button" class="' + optCls + '" data-go="' + s.id + '">' +
              '<svg class="ic-svg ic" width="16" height="16"><use href="#i-folder"/></svg>' +
              '<span class="nm">' + esc(s.name) + '</span><span class="cnt">' + s.docs + '</span>' +
              (cur ? '<svg class="ic-svg chk" width="16" height="16" stroke-width="2.4"><use href="#i-check"/></svg>' : '') +
              '</button></li>';
          }).join('') + '</ul>';
      }
      return '<span class="sep" aria-hidden="true">›</span>' +
        '<span class="crumb-wrap">' +
        '<button type="button" class="' + cls + '" data-menu="' + i + '" aria-haspopup="listbox" aria-expanded="' + on + '"><span>' + esc(n.name) + '</span>' +
        '<svg class="ic-svg" width="14" height="14" stroke-width="2.2"><use href="#i-chevron-down"/></svg></button>' +
        menu + '</span>';
    }).join('');
  }

  function renderTabs(data) {
    document.getElementById('link-tabs').innerHTML = data.tabs.map(function (t, i) {
      return '<button type="button" class="link-tab' + (i === state.tab ? ' on' : '') + '" data-tab="' + i + '">' + esc(t.label) + '</button>';
    }).join('');
  }

  function renderGrid(data) {
    var items = data.tabs[state.tab].items;
    var q = state.q.trim().toLowerCase();
    if (q) items = items.filter(function (it) { return it.name.toLowerCase().indexOf(q) !== -1; });

    var grid = document.getElementById('link-grid');
    var empty = document.getElementById('link-empty');
    if (!items.length) {
      grid.hidden = true; empty.hidden = false;
      return;
    }
    grid.hidden = false; empty.hidden = true;
    grid.innerHTML = items.map(function (it, i) {
      var href = it.kind === 'tel' ? 'tel:' + it.value : it.value;
      var target = it.kind === 'tel' ? '' : ' target="_blank" rel="noopener"';
      var icon = it.kind === 'tel' ? 'i-phone' : 'i-arrow-right';
      var logoFile = INSURER_LOGO[it.name];
      var logo = logoFile
        ? '<span class="lk-logo lk-logo-img"><img src="../../assets/' + logoFile + '" alt="" loading="lazy"></span>'
        : '<span class="lk-logo" style="background:' + LOGO_COLORS[i % LOGO_COLORS.length] + '">' + esc(initials(it.name)) + '</span>';
      return '<a class="link-card" href="' + href + '"' + target + '>' +
        logo +
        '<span class="lk-info">' +
        '<span class="lk-name">' + esc(it.name) + '</span>' +
        '<span class="lk-sub"><svg class="ic-svg" width="13" height="13"><use href="#' + icon + '"/></svg>' + esc(it.sub) + '</span>' +
        '</span></a>';
    }).join('');
  }

  function render() {
    var cur = byId[state.active];
    if (DIRECT_POST[cur.id]) { location.replace('doc.html?folder=' + cur.id + '&doc=' + DIRECT_POST[cur.id]); return; }
    var t = tone(cur.id);
    var path = [];
    for (var p = cur.id; p; p = parent[p]) path.unshift(byId[p]);

    document.getElementById('crumbs').innerHTML = crumbsHTML(path);
    var chip = document.getElementById('cur-chip');
    chip.className = 'ht-ic tone-' + t;
    document.getElementById('cur-name').textContent = cur.name;
    document.title = cur.name + ' · 자료실 · BoBi';

    var folders = document.getElementById('folders');
    var linksSec = document.getElementById('links-sec');
    if (hasKids(cur)) {
      folders.hidden = false; linksSec.hidden = true;
      document.getElementById('cur-summary').textContent = '하위 폴더 ' + cur.kids.length + '개';
      document.getElementById('kid-count').textContent = cur.kids.length;
      document.getElementById('kid-grid').innerHTML = cur.kids.map(function (k) {
        return '<button type="button" class="lib-fold doc-folder" data-go="' + k.id + '">' +
          '<span class="df-doc df-doc--back" aria-hidden="true"><span class="df-line df-line--head" style="width:55%"></span><span class="df-line" style="width:85%"></span></span>' +
          '<span class="df-doc df-doc--front" aria-hidden="true"><span class="df-row"><span class="df-dot"></span><span class="df-line df-line--head" style="flex:1"></span></span><span class="df-line" style="width:90%"></span><span class="df-line" style="width:70%"></span></span>' +
          '<span class="df-tab" aria-hidden="true"></span>' +
          '<span class="df-body" aria-hidden="true"></span>' +
          '<span class="df-content">' +
          '<span class="lib-fold-name">' + esc(k.name) + '</span>' +
          '<span class="lib-fold-meta">자료 ' + k.docs + '개</span></span>' +
          '</button>';
      }).join('');
    } else if (!LINKS_DATA[cur.id]) {
      // 이 페이지가 다루지 않는 폴더면 원래 보기(갤러리/리스트)로 넘긴다
      location.replace((GALLERY_VIEW[cur.id] ? 'gallery.html' : 'detail.html') + '?folder=' + cur.id);
    } else {
      folders.hidden = true; linksSec.hidden = false;
      var data = LINKS_DATA[cur.id];
      var total = data.tabs.reduce(function (n, t) { return n + t.items.length; }, 0);
      document.getElementById('cur-summary').textContent = '보험사 ' + total + '곳';
      renderTabs(data);
      renderGrid(data);
    }
  }

  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]');
    if (g) { go(g.getAttribute('data-go')); return; }
    var m = e.target.closest('[data-menu]');
    if (m) { var i = +m.getAttribute('data-menu'); state.menu = state.menu === i ? -1 : i; render(); return; }
    var tb = e.target.closest('[data-tab]');
    if (tb) { state.tab = +tb.getAttribute('data-tab'); state.q = ''; document.getElementById('link-search').value = ''; renderTabs(LINKS_DATA[state.active]); renderGrid(LINKS_DATA[state.active]); return; }
    if (state.menu !== -1 && !e.target.closest('.lib-dd-menu')) { state.menu = -1; render(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.menu !== -1) { state.menu = -1; render(); }
  });
  document.getElementById('link-search').addEventListener('input', function (e) {
    state.q = e.target.value;
    renderGrid(LINKS_DATA[state.active]);
  });

  render();
})();
