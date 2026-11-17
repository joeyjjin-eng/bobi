/* 보비 자료실 — 자료 상세(콘텐츠) 화면 */
(function () {
  // 폴더 구조 — detail.html · gallery.html 과 동일 (경로 표시용)
  var TREE = [
    { id: 'a', name: '보험사 자료', kids: [
      { id: 'c1', name: '보험회사 콜센터 번호' },
      { id: 'c2', name: '홈페이지 주소' },
      { id: 'c3', name: '설계사 전산 주소' },
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
    { id: 'e', name: '자동차 관리', kids: [
      { id: 'e1', name: '사고 접수 방법' },
      { id: 'e2', name: '긴급출동 번호' },
      { id: 'e3', name: '갱신·할인 특약' },
      { id: 'e4', name: '렌터카·대차 안내' }
    ]}
  ];

  // 자료 목록 — detail.html · gallery.html 과 동일한 데이터를 사용
  // 모든 게시물은 본문(body: 글/이미지/표)을 가진다. attachments는 선택이며 0~N개 — 있을 때만 구분선 아래에 칩으로 붙는다.
  var DOCS = [
    { id: 'doc1', title: '생명보험사 고객센터 대표번호 (11월 기준)', date: '2026.11.12', views: 128, isNew: true,  thumb: '../../assets/img/library/doc-01.jpg',
      body: [
        { t: 'table', head: ['보험사', '대표번호', '운영시간'], rows: [
          ['삼성생명', '1588-3114', '평일 09:00~18:00'],
          ['한화생명', '1588-6363', '평일 09:00~18:00'],
          ['교보생명', '1588-1001', '평일 09:00~18:00'],
          ['신한라이프', '1588-5580', '평일 09:00~18:00'],
          ['NH농협생명', '1588-4300', '평일 09:00~18:00']
        ] }
      ],
      attachments: [
        { ext: 'PDF', kind: 'file', url: '#', name: '생명보험사_고객센터번호_2026-11.pdf' },
        { ext: 'XLS', kind: 'file', url: '#', name: '생명보험사_고객센터번호_2026-11.xlsx' }
      ] },
    { id: 'doc2', title: '손해보험사 고객센터·사고접수 번호표', date: '2026.11.10', views: 96,  isNew: true,  thumb: '../../assets/img/library/doc-02.jpg',
      body: [
        { t: 'p', text: '손해보험사 고객센터와 사고접수 번호를 구분해 정리했습니다. 사고접수 번호는 대부분 24시간 운영됩니다.' },
        { t: 'table', head: ['보험사', '고객센터', '사고접수'], rows: [
          ['삼성화재', '1588-5114', '1588-5119'],
          ['현대해상', '1588-5656', '1588-5656'],
          ['DB손해보험', '1588-0100', '1588-0100'],
          ['KB손해보험', '1544-0114', '1544-0114'],
          ['메리츠화재', '1566-7711', '1566-7711']
        ] }
      ],
      attachments: [{ ext: 'XLS', kind: 'file', url: '#', name: '손해보험사_고객센터_사고접수번호표.xlsx' }] },
    { id: 'doc3', title: '보험사별 고객센터 운영시간 안내', date: '2026.11.06', views: 74,  isNew: false, thumb: '../../assets/img/library/doc-03.jpg',
      body: [
        { t: 'p', text: '대부분의 보험사 고객센터는 평일 09:00~18:00에 운영되며, 토요일은 보험사에 따라 단축 운영하거나 휴무로 전환되는 경우가 많습니다. 생명보험사와 손해보험사 간에도 운영시간 차이가 있고, 같은 보험사라도 일반 상담 창구와 사고접수·보험금 청구 창구의 운영시간이 서로 다르게 책정되어 있는 경우가 흔하니 상담 전 반드시 확인이 필요합니다.' },
        { t: 'p', text: '사고접수·보험금 청구 상담은 일부 보험사에서 24시간 또는 365일 운영하니, 일반 상담과 접수의 운영시간이 다를 수 있다는 점을 고객에게 안내해 주세요.' }
      ],
      attachments: [{ ext: 'LINK', kind: 'link', url: '#', name: '보험사별 고객센터 운영시간 공식 안내' }] },
    { id: 'doc4', title: '고객 안내용 콜센터 번호 카드 이미지', date: '2026.11.03', views: 61,  isNew: false, thumb: '../../assets/img/library/doc-04.jpg',
      body: [
        { t: 'img', src: '../../assets/img/library/doc-04.jpg', caption: '고객에게 바로 전달할 수 있는 콜센터 번호 카드' }
      ] },
    { id: 'doc5', title: '외국계 보험사 고객센터 번호 모음', date: '2026.10.29', views: 45,  isNew: false, thumb: '../../assets/img/library/doc-05.jpg',
      body: [
        { t: 'p', text: '외국계 보험사는 고객센터 운영시간이 국내사와 다른 경우가 많아 상담 전 반드시 확인이 필요합니다.' },
        { t: 'p', text: '대부분 평일 09:00~17:00 운영하며, 일부사는 토요일 오전에도 상담을 받습니다. 공휴일은 전 보험사 휴무입니다.' },
        { t: 'p', text: '해외 본사 연계 상품(저축성보험 등)은 국내 고객센터 문의 시 처리에 1~2일 더 소요될 수 있다는 점을 고객에게 안내해 주세요.' }
      ] },
    { id: 'doc6', title: '공제회 고객센터 번호표', date: '2026.10.24', views: 33,  isNew: false, thumb: '../../assets/img/library/doc-06.png',
      body: [
        { t: 'p', text: '공제회는 보험사와 별도 체계로 운영되어 번호가 다릅니다. 아래 대표번호로 문의하면 됩니다.' },
        { t: 'table', head: ['공제회', '대표번호'], rows: [
          ['새마을금고중앙회 공제', '1599-9000'],
          ['수협중앙회 공제', '1588-1515'],
          ['신협중앙회 공제', '1566-6000']
        ] }
      ],
      attachments: [{ ext: 'XLS', kind: 'file', url: '#', name: '공제회_고객센터번호표.xlsx' }] },
    { id: 'doc7', title: '고객센터 연결이 안 될 때 대체 연락처', date: '2026.10.20', views: 29,  isNew: false, thumb: '../../assets/img/library/doc-07.jpg',
      body: [
        { t: 'p', text: '대표번호 연결이 지연될 때는 보험사 홈페이지의 채팅 상담이나 앱 내 1:1 문의가 더 빠른 경우가 많습니다.' },
        { t: 'p', text: '콜센터가 몰리는 월요일 오전과 월말에는 대기시간이 특히 길어지니, 고객에게 다른 시간대를 안내해 주는 것도 방법입니다.' }
      ],
      attachments: [{ ext: 'LINK', kind: 'link', url: '#', name: '고객센터 대체 연락처 안내 페이지' }] },
    { id: 'doc8', title: 'ARS 단축번호 정리표', date: '2026.10.15', views: 22,  isNew: false, thumb: '../../assets/img/library/doc-08.jpg',
      body: [
        { t: 'p', text: 'ARS 연결 시 아래 단축번호를 누르면 상담원 연결 전 대기시간을 줄일 수 있습니다.' },
        { t: 'img', src: '../../assets/img/library/doc-08.jpg', caption: '단축번호 안내 화면 예시' },
        { t: 'p', text: '단축번호는 보험사별로 다르므로, 고객에게 안내할 때는 해당 보험사 번호를 한번 더 확인해 주세요.' }
      ] },
    { id: 'doc9', title: '사고 접수 방법', date: '2026.11.14', views: 52, isNew: true, thumb: '../../assets/img/library/doc-03.jpg',
      body: [
        { t: 'img', src: '../../assets/img/library/doc-03.jpg', caption: '보험사 앱 사고접수 화면 예시' }
      ] },
    { id: 'doc10', title: '긴급출동 번호', date: '2026.11.09', views: 38, isNew: false, thumb: '../../assets/img/library/doc-05.jpg',
      body: [
        { t: 'table', head: ['상황', '연락처'], rows: [
          ['보험사 긴급출동 서비스', '1588-5114'],
          ['한국도로공사 콜센터', '1588-2504'],
          ['경찰(사고 신고)', '112'],
          ['소방(화재·구조)', '119']
        ] }
      ] },
    { id: 'doc11', title: '갱신·할인 특약', date: '2026.11.02', views: 41, isNew: false, thumb: '../../assets/img/library/doc-06.png',
      body: [
        { t: 'img', src: '../../assets/img/library/doc-06.png', caption: '갱신형 특약 가입 화면 예시' },
        { t: 'table', head: ['특약명', '할인율'], rows: [
          ['블랙박스 장착 할인', '3%'],
          ['안전운전습관 할인(UBI)', '10%'],
          ['자녀할인특약', '5%']
        ] }
      ] },
    { id: 'doc12', title: '렌터카·대차 안내', date: '2026.10.27', views: 35, isNew: false, thumb: '../../assets/img/library/doc-07.jpg',
      body: [
        { t: 'h', text: '렌터카·대차 서비스 안내' },
        { t: 'sub', text: '사고로 차량 운행이 불가능할 때 제공되는 대차 서비스입니다' },
        { t: 'p', text: '본인 과실 사고로 차량 수리가 필요한 경우, 가입한 특약에 따라 동급 차량을 렌트하거나 수리비의 일부를 대차료로 지급받을 수 있습니다.' },
        { t: 'h', text: '이용 절차' },
        { t: 'p', text: '사고 접수 후 담당 보상 직원에게 대차 서비스 이용 의사를 밝히면, 제휴 렌터카사 연결 또는 대차료 지급 중 하나를 선택할 수 있습니다.' }
      ] }
  ];

  function renderBody(blocks) {
    return blocks.map(function (b) {
      if (b.t === 'p') return '<p>' + esc(b.text) + '</p>';
      if (b.t === 'h') return '<h2 class="blk-h">' + esc(b.text) + '</h2>';
      if (b.t === 'sub') return '<p class="blk-sub">' + esc(b.text) + '</p>';
      if (b.t === 'img') {
        return '<figure class="blk-fig"><img class="blk-img" src="' + b.src + '" alt="' + esc(b.caption || '') + '">' +
          (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>';
      }
      if (b.t === 'table') {
        return '<div class="blk-table-wrap"><table><thead><tr>' +
          b.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
          '</tr></thead><tbody>' +
          b.rows.map(function (r) {
            return '<tr>' + r.map(function (c, i) {
              var cls = (b.amtCols && b.amtCols.indexOf(i) !== -1) ? ' class="amt"' : '';
              return '<td' + cls + '>' + esc(c) + '</td>';
            }).join('') + '</tr>';
          }).join('') +
          '</tbody></table></div>';
      }
      return '';
    }).join('');
  }

  // 갤러리형으로 보여주는 폴더 — detail.html 대신 gallery.html로 돌아간다 (보험금 청구 = 전부 갤러리)
  var GALLERY_VIEW = { d1: true, d2: true, d3: true };
  // 폴더/리스트 없이 바로 게시물로 연결되는 폴더 — 돌아갈 목록 페이지가 없으므로 자료실 루트로 보낸다 (자동차 관리 = 전부 바로 게시물)
  var DIRECT_POST = { e1: true, e2: true, e3: true, e4: true };
  // 자료 목록이 아니라 탭+링크 카드 그리드로 보여주는 폴더 — links.html로 돌아간다 (보험사 자료 = 전부 링크)
  var LINKS_VIEW = { c1: true, c2: true, c3: true, c4: true };
  function folderHref(id) {
    if (DIRECT_POST[id]) return 'index.html';
    if (LINKS_VIEW[id]) return 'links.html?folder=' + id;
    return (GALLERY_VIEW[id] ? 'gallery.html' : 'detail.html') + '?folder=' + id;
  }

  var byId = {};
  (function walk(nodes) {
    nodes.forEach(function (n) {
      byId[n.id] = n;
      if (n.kids) walk(n.kids);
    });
  })(TREE);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var params = new URLSearchParams(location.search);
  var folderId = byId[params.get('folder')] ? params.get('folder') : 'c1';
  var doc = DOCS.filter(function (d) { return d.id === params.get('doc'); })[0] || DOCS[0];

  document.title = doc.title + ' · 자료실 · BoBi';
  document.getElementById('doc-back').href = folderHref(folderId);

  // 모든 게시물은 글이다 — 아이콘은 첨부파일 종류가 아니라 게시물 자체를 나타낸다
  document.getElementById('doc-ic').innerHTML = '<svg class="ic-svg" width="22" height="22"><use href="#i-note"/></svg>';

  document.getElementById('doc-new').hidden = !doc.isNew;
  document.getElementById('doc-title-text').textContent = doc.title;
  document.getElementById('doc-meta').textContent = doc.date + ' · 조회 ' + doc.views;

  // 첨부파일은 구분선 아래, 본문 위에 칩으로 붙는다 (0~N개, 게시물 본문과는 별개)
  var attachList = document.getElementById('doc-attachments');
  var attachments = doc.attachments || [];
  if (!attachments.length) {
    attachList.hidden = true;
  } else {
    attachList.hidden = false;
    attachList.innerHTML = attachments.map(function (a) {
      if (a.kind === 'link') {
        return '<a class="doc-attach-item" href="' + a.url + '" target="_blank" rel="noopener">' +
          '<svg class="ic-svg" width="14" height="14"><use href="#i-arrow-right"/></svg>' +
          '<span class="fn">' + esc(a.name || '바로가기') + '</span></a>';
      }
      return '<a class="doc-attach-item" href="' + a.url + '" download>' +
        '<svg class="ic-svg" width="14" height="14"><use href="#i-download"/></svg>' +
        '<span class="fn">' + esc(a.name || a.ext) + '</span></a>';
    }).join('');
  }

  // 게시물 본문 — 모든 게시물이 글/이미지/표로 구성된 본문을 가진다
  document.getElementById('doc-preview').innerHTML = '<div class="doc-body">' + renderBody(doc.body) + '</div>';
})();
