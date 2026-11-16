/* 보비 자료실 — 자료 상세(콘텐츠) 화면 */
(function () {
  // 폴더 구조 — detail.html · gallery.html 과 동일 (경로 표시용)
  var TREE = [
    { id: 'a', name: '보험사 자료', kids: [
      { id: 'c1', name: '보험회사 콜센터 번호', kids: [
        { id: 'c1a', name: '생명보험사' },
        { id: 'c1b', name: '손해보험사' },
        { id: 'c1c', name: '공제·기타' },
        { id: 'c1d', name: '재보험사' },
        { id: 'c1e', name: 'GA·법인대리점' }
      ]},
      { id: 'c2', name: '홈페이지 주소' },
      { id: 'c3', name: '설계사 전산 주소', kids: [
        { id: 'c3a', name: '생명보험사' },
        { id: 'c3b', name: '손해보험사', kids: [
          { id: 'c3b1', name: '자동차보험 전용' }
        ]}
      ]},
      { id: 'c4', name: '모니터링 인콜 번호' }
    ]},
    { id: 'b', name: '계약 및 청약 관리', kids: [
      { id: 'b1', name: '계약변경, 보험료 납부' },
      { id: 'b2', name: '전자청약' }
    ]},
    { id: 'd', name: '보험금 청구', kids: [
      { id: 'd1', name: '현장조사 대응 방법' },
      { id: 'd2', name: '보험금 청구서류' },
      { id: 'd3', name: '보험금 청구 필요서류' }
    ]},
    { id: 'e', name: '자동차 관리' }
  ];

  // 자료 목록 — detail.html · gallery.html 과 동일한 데이터를 사용
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

  // 갤러리형으로 보여주는 폴더 — detail.html 대신 gallery.html로 돌아간다
  var GALLERY_VIEW = { b1: true };
  function folderHref(id) { return (GALLERY_VIEW[id] ? 'gallery.html' : 'detail.html') + '?folder=' + id; }

  var byId = {}, parent = {};
  (function walk(nodes, p) {
    nodes.forEach(function (n) {
      byId[n.id] = n; parent[n.id] = p;
      if (n.kids) walk(n.kids, n.id);
    });
  })(TREE, null);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var params = new URLSearchParams(location.search);
  var folderId = byId[params.get('folder')] ? params.get('folder') : 'c1';
  var doc = DOCS.filter(function (d) { return d.id === params.get('doc'); })[0] || DOCS[0];
  var cls = TYPE_CLASS[doc.type];

  // 경로 — 단순 텍스트 트레일 (폴더 전환 없이 뒤로 가는 용도)
  var path = [];
  for (var p = folderId; p; p = parent[p]) path.unshift(byId[p]);
  document.getElementById('crumbs').innerHTML =
    '<a href="index.html">자료실</a>' +
    path.map(function (n) {
      return '<span class="sep" aria-hidden="true">›</span><a href="' + folderHref(n.id) + '">' + esc(n.name) + '</a>';
    }).join('') +
    '<span class="sep" aria-hidden="true">›</span><span class="cur">' + esc(doc.title) + '</span>';

  document.title = doc.title + ' · 자료실 · BoBi';
  document.getElementById('doc-back').href = folderHref(folderId);

  var icChip = document.getElementById('doc-ic');
  icChip.className = 'doc-ic ' + cls;
  icChip.innerHTML = '<svg class="ic-svg" width="22" height="22"><use href="#' + TYPE_ICON[doc.type] + '"/></svg>';

  var badge = document.getElementById('doc-badge');
  badge.className = 'lib-type-badge ' + cls;
  badge.textContent = doc.type;
  document.getElementById('doc-new').hidden = !doc.isNew;

  document.getElementById('doc-title').textContent = doc.title;
  document.getElementById('doc-meta').textContent = doc.date + ' · 조회 ' + doc.views;

  var downloadBtn = document.getElementById('doc-download');
  if (doc.type === '링크') {
    downloadBtn.removeAttribute('download');
    downloadBtn.innerHTML = '<svg class="ic-svg" width="16" height="16"><use href="#i-arrow-right"/></svg>바로가기';
  } else {
    downloadBtn.innerHTML = '<svg class="ic-svg" width="16" height="16"><use href="#i-download"/></svg>다운로드';
  }

  var preview = document.getElementById('doc-preview');
  if (doc.type === '이미지' && doc.thumb) {
    preview.innerHTML = '<img class="doc-preview-img" src="' + doc.thumb + '" alt="' + esc(doc.title) + '">';
  } else if (doc.type === '링크') {
    preview.innerHTML = '<div class="doc-preview-blank">' +
      '<span class="pv-ic ' + cls + '"><svg class="ic-svg" width="30" height="30"><use href="#i-link"/></svg></span>' +
      '<p>외부 사이트로 연결되는 자료입니다</p>' +
      '<p class="sub">위 \'바로가기\' 버튼을 누르면 새 창에서 열립니다</p>' +
      '</div>';
  } else {
    preview.innerHTML = '<div class="doc-preview-blank">' +
      '<span class="pv-ic ' + cls + '"><svg class="ic-svg" width="30" height="30"><use href="#' + TYPE_ICON[doc.type] + '"/></svg></span>' +
      '<p>미리보기를 지원하지 않는 파일 형식입니다</p>' +
      '<p class="sub">다운로드하여 확인해주세요</p>' +
      '</div>';
  }
})();
