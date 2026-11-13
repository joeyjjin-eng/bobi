/* 보비 자료실 상세 — 폴더 탐색 (하위 폴더가 있으면 폴더만, 없으면 자료 목록만) */
(function () {
  // 루트 카테고리를 index.html과 동일한 4색 체계(med/in/surg/off)에 매핑
  var TONE = ['med', 'in', 'surg', 'off'];

  // 폴더 구조 (깊이 제한 없음) · 이름과 자료 수는 예시
  var TREE = [
    { id: 'a', name: '보험사 자료', docs: 32, kids: [
      { id: 'c1', name: '보험회사 콜센터 번호', docs: 12, kids: [
        { id: 'c1a', name: '생명보험사', docs: 4 },
        { id: 'c1b', name: '손해보험사', docs: 5 },
        { id: 'c1c', name: '공제·기타', docs: 0 },
        { id: 'c1d', name: '재보험사', docs: 3 },
        { id: 'c1e', name: 'GA·법인대리점', docs: 6 }
      ]},
      { id: 'c2', name: '홈페이지 주소', docs: 6 },
      { id: 'c3', name: '설계사 전산 주소', docs: 9, kids: [
        { id: 'c3a', name: '생명보험사', docs: 4 },
        { id: 'c3b', name: '손해보험사', docs: 5, kids: [
          { id: 'c3b1', name: '자동차보험 전용', docs: 2 }
        ]}
      ]},
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
    { id: 'e', name: '자동차 관리', docs: 18 }
  ];

  // 자료 목록 (예시 · 실제로는 폴더 id로 API 조회)
  var DOCS = [
    ['PDF', '생명보험사 고객센터 대표번호 (11월 기준)', '2026.11.12', 128, true],
    ['XLS', '손해보험사 고객센터·사고접수 번호표', '2026.11.10', 96, true],
    ['링크', '보험사별 고객센터 운영시간 안내', '2026.11.06', 74],
    ['이미지', '고객 안내용 콜센터 번호 카드 이미지', '2026.11.03', 61],
    ['PDF', '외국계 보험사 고객센터 번호 모음', '2026.10.29', 45],
    ['XLS', '공제회 고객센터 번호표', '2026.10.24', 33],
    ['링크', '고객센터 연결이 안 될 때 대체 연락처', '2026.10.20', 29],
    ['PDF', 'ARS 단축번호 정리표', '2026.10.15', 22]
  ];
  var TYPE_CLASS = { 'PDF': 'pdf', 'XLS': 'xls', '링크': 'link', '이미지': 'img' };

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
  var state = { active: byId[params.get('folder')] ? params.get('folder') : 'c1', menu: -1 };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hasKids(n) { return !!(n.kids && n.kids.length); }

  function go(id) {
    state.active = id; state.menu = -1;
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

  function render() {
    var cur = byId[state.active];
    var t = tone(cur.id);
    var path = [];
    for (var p = cur.id; p; p = parent[p]) path.unshift(byId[p]);

    document.getElementById('crumbs').innerHTML = crumbsHTML(path);
    var chip = document.getElementById('cur-chip');
    chip.className = 'ht-ic tone-' + t;
    document.getElementById('cur-name').textContent = cur.name;
    document.getElementById('cur-summary').textContent = hasKids(cur) ? '하위 폴더 ' + cur.kids.length + '개' : '자료 ' + cur.docs + '개';
    document.title = cur.name + ' · 자료실 · BoBi';

    var folders = document.getElementById('folders');
    var docs = document.getElementById('docs');
    if (hasKids(cur)) {
      folders.hidden = false; docs.hidden = true;
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
    } else {
      folders.hidden = true; docs.hidden = false;
      document.getElementById('doc-count').textContent = cur.docs;
      document.getElementById('doc-rows').innerHTML = DOCS.map(function (d) {
        return '<tr class="lib-doc-row">' +
          '<td><span class="lib-doc-cell">' +
          '<span class="lib-type-badge ' + TYPE_CLASS[d[0]] + '">' + d[0] + '</span>' +
          '<a href="#" class="lib-doc-t">' + esc(d[1]) + '</a>' +
          (d[4] ? '<span class="lib-new-badge">NEW</span>' : '') +
          '</span></td>' +
          '<td>' + d[2] + '</td>' +
          '<td class="ctr">' + d[3] + '</td>' +
          '<td><button type="button" class="lib-icon-btn" aria-label="내려받기"><svg class="ic-svg" width="17" height="17"><use href="#i-download"/></svg></button></td>' +
          '</tr>';
      }).join('');
    }
  }

  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]');
    if (g) { go(g.getAttribute('data-go')); return; }
    var m = e.target.closest('[data-menu]');
    if (m) { var i = +m.getAttribute('data-menu'); state.menu = state.menu === i ? -1 : i; render(); return; }
    if (state.menu !== -1 && !e.target.closest('.lib-dd-menu')) { state.menu = -1; render(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.menu !== -1) { state.menu = -1; render(); }
  });

  render();
})();
