/* 보험소식지 — 기사 상세 (detail.html?no=<기사 번호>) */
(function () {
  var D = window.NEWS;
  if (!D) return;

  var host = document.getElementById('nd-body');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function dots(v) { return v ? String(v).replace(/-/g, '.') : ''; }
  function badge(text, tone) { return '<span class="ns-badge ' + tone + '">' + esc(text) + '</span>'; }

  // 문장 두 개씩 한 문단
  function paragraphs(text) {
    var sentences = String(text || '').split(/(?<=[다요][.!?])\s+/);
    var out = [];
    for (var i = 0; i < sentences.length; i += 2) {
      var p = sentences.slice(i, i + 2).join(' ').trim();
      if (p) out.push('<p>' + esc(p) + '</p>');
    }
    return out.join('');
  }

  function row(label, value) {
    var none = !value;
    return '<dt>' + esc(label) + '</dt>'
      + '<dd' + (none ? ' class="none"' : '') + '>' + esc(none ? '별도 기재 없음' : value) + '</dd>';
  }

  var no = parseInt(new URLSearchParams(location.search).get('no'), 10);
  var it = null;
  for (var i = 0; i < D.items.length; i++) {
    if (D.items[i].no === no) { it = D.items[i]; break; }
  }

  if (!it) {
    host.innerHTML = '<div class="nd-empty"><b>기사를 찾지 못했습니다</b>'
      + '<p>주소가 바뀌었거나 표본에 없는 기사입니다.</p></div>';
    return;
  }

  document.title = it.title + ' · BoBi 보험소식지';

  // 같은 주제의 다른 기사 — 최신순 3건
  var more = D.items.filter(function (x) { return x.topic === it.topic && x.no !== it.no; })
    .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : a.no - b.no; })
    .slice(0, 3);

  host.innerHTML = ''
    + '<article>'
    +   '<header class="nd-head">'
    +     '<div class="nd-meta">' + badge(it.topicLabel, it.topic) + badge(it.org, 'org')
    +       '<span class="ns-meta-dt">' + esc(it.date) + '</span></div>'
    +     '<h1>' + esc(it.title) + '</h1>'
    +   '</header>'

    +   (it.thumb
          ? '<figure class="nd-art"><img src="' + esc(it.thumb) + '" alt="" />'
            + '<figcaption>보험업계 소식 · 주제 삽화</figcaption></figure>'
          : '')

    +   '<section class="nd-sec"><h2>주요 내용</h2>' + paragraphs(it.brief) + '</section>'

    +   '<section class="nd-sec"><h2>날짜·진행 상태</h2><dl class="nd-dl">'
    +     row('기사 게시·확인일', it.date)
    +     row('발표일', dots(it.announced))
    +     row('시행일', dots(it.effective))
    +     row('상태', it.status)
    +     row('뉴스 분류', it.kind)
    +   '</dl></section>'

    +   '<section class="nd-sec"><h2>원문</h2>'
    +     '<a class="nd-src" href="' + esc(it.url) + '" target="_blank" rel="noopener">원문에서 자세히 보기 ↗</a>'
    +   '</section>'
    + '</article>'

    + (more.length
        ? '<section class="nd-sec"><h2>' + esc(it.topicLabel) + ' 다른 기사</h2><div class="nd-more">'
          + more.map(function (m) {
              return '<a class="nd-more-row" href="detail.html?no=' + m.no + '">'
                + '<span class="d">' + esc(m.date) + '</span>'
                + '<span class="t">' + esc(m.title) + '</span>'
                + '<span class="g" aria-hidden="true"><svg class="ic-svg" width="16" height="16"><use href="#i-chevron-right"/></svg></span>'
                + '</a>';
            }).join('')
          + '</div></section>'
        : '');
})();
