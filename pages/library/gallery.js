/* 보비 자료실 상세 — 갤러리형 (폴더 탐색 + 자료 썸네일 카드) */
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

  // 자료 목록 (예시 · 실제로는 폴더 id로 API 조회) — detail.html · doc.html 과 동일한 데이터를 사용
  var DOCS = [
    { id: 'doc1', type: 'PDF',  title: '생명보험사 고객센터 대표번호 (11월 기준)', date: '2026.11.12', views: 128, isNew: true,  thumb: '../../assets/img/library/doc-01.jpg' },
    { id: 'doc2', type: 'XLS',  title: '손해보험사 고객센터·사고접수 번호표',       date: '2026.11.10', views: 96,  isNew: true,  thumb: '../../assets/img/library/doc-02.jpg' },
    { id: 'doc3', type: '링크', title: '보험사별 고객센터 운영시간 안내',           date: '2026.11.06', views: 74,  isNew: false, thumb: '../../assets/img/library/doc-03.jpg' },
    { id: 'doc4', type: '이미지', title: '고객 안내용 콜센터 번호 카드 이미지',     date: '2026.11.03', views: 61,  isNew: false, thumb: '../../assets/img/library/doc-04.jpg' },
    { id: 'doc5', type: 'PDF',  title: '외국계 보험사 고객센터 번호 모음',         date: '2026.10.29', views: 45,  isNew: false, thumb: '../../assets/img/library/doc-05.jpg' },
    { id: 'doc6', type: 'XLS',  title: '공제회 고객센터 번호표',                  date: '2026.10.24', views: 33,  isNew: false, thumb: '../../assets/img/library/doc-06.png' },
    { id: 'doc7', type: '링크', title: '고객센터 연결이 안 될 때 대체 연락처',     date: '2026.10.20', views: 29,  isNew: false, thumb: '../../assets/img/library/doc-07.jpg' },
    { id: 'doc8', type: 'PDF',  title: 'ARS 단축번호 정리표',                    date: '2026.10.15', views: 22,  isNew: false, thumb: '../../assets/img/library/doc-08.jpg' }
  ];
  var TYPE_CLASS = { 'PDF': 'pdf', 'XLS': 'xls', '링크': 'link', '이미지': 'img' };
  var TYPE_ICON = { 'PDF': 'i-file-text', 'XLS': 'i-grid', '링크': 'i-link', '이미지': 'i-image' };

  // 갤러리형으로 보여줄 폴더 — 그 외 폴더로 이동하면 detail.html(리스트형)로 넘긴다
  var GALLERY_VIEW = { b1: true };

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
    } else if (!GALLERY_VIEW[cur.id]) {
      location.replace('detail.html?folder=' + cur.id);
    } else {
      folders.hidden = true; docs.hidden = false;
      document.getElementById('doc-count').textContent = cur.docs;

      document.getElementById('doc-feed').innerHTML = DOCS.map(function (d) {
        return '<a class="lib-feed-card" href="doc.html?folder=' + cur.id + '&doc=' + d.id + '">' +
          '<div class="lib-feed-thumb ' + TYPE_CLASS[d.type] + '">' +
          (d.thumb ? '<img src="' + d.thumb + '" alt="" loading="lazy">' :
            '<svg class="ic-svg" width="40" height="40"><use href="#' + TYPE_ICON[d.type] + '"/></svg>') +
          (d.isNew ? '<span class="lib-new-badge">NEW</span>' : '') +
          '</div>' +
          '<span class="lib-type-badge pill ' + TYPE_CLASS[d.type] + '">' + d.type + '</span>' +
          '<span class="lib-feed-title">' + esc(d.title) + '</span>' +
          '<span class="lib-feed-meta">' + d.date + ' · 조회 ' + d.views + '</span>' +
          '</a>';
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
