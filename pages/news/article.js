/* 보험소식지 — 기사 지면 한 벌
   상세 페이지(detail.js)와 목록의 기사 레이어(index.js)가 같은 마크업을 쓴다.
   _data.js 보다 뒤, 쓰는 쪽보다 앞에 둔다. */
window.NEWS_ARTICLE = (function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function dots(v) { return v ? String(v).replace(/-/g, '.') : ''; }

  // 문장 두 개씩 한 문단
  function paragraphs(text) {
    var sentences = String(text || '').split(/(?<=[다요][.!?])\s+/);
    var out = [];
    for (var i = 0; i < sentences.length; i += 2) {
      var p = sentences.slice(i, i + 2).join(' ').trim();
      if (p) out.push(p);
    }
    return out;
  }

  // 기사 정보 한 줄 — 값이 없으면 자리를 비우지 않고 표시한다
  function row(label, value) {
    var none = !value;
    return '<div><dt>' + esc(label) + '</dt>'
      + '<dd' + (none ? ' class="none"' : '') + '>' + esc(none ? '별도 기재 없음' : value) + '</dd></div>';
  }

  function art(it) {
    if (!it.thumb) return '';
    return '<figure class="nd-art"><img src="' + esc(it.thumb) + '" alt="" /></figure>';
  }

  // 기사 한 건의 지면 — 머리 메타 · 제목 · 머리글 · 원문 · 삽화 · 본문 · 기사 정보
  function html(it) {
    var paras = paragraphs(it.brief);
    var lead = paras.shift() || '';

    return ''
      + '<article class="nd-main">'
      +   '<dl class="nd-meta">'
      +     '<div><dt>게시일</dt><dd>' + esc(it.date) + '</dd></div>'
      +     '<div><dt>주제</dt><dd class="topic ' + it.topic + '">' + esc(it.topicLabel) + '</dd></div>'
      +     '<div><dt>기관</dt><dd>' + esc(it.org) + '</dd></div>'
      +   '</dl>'
      +   '<h1>' + esc(it.title) + '</h1>'
      +   (lead
            ? '<span class="nd-lead-tag">핵심 요약</span>'
              + '<p class="nd-lead">' + esc(lead) + '</p>'
            : '')
      +   '<a class="nd-src" href="' + esc(it.url) + '" target="_blank" rel="noopener">'
      +     '<span class="tx">원문 보기</span>'
      +     '<span class="ic" aria-hidden="true"><svg class="ic-svg" width="16" height="16"><use href="#i-arrow-right"/></svg></span>'
      +   '</a>'
      +   art(it)
      +   (paras.length
            ? '<div class="nd-text">'
              + paras.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('')
              + '</div>'
            : '')
      +   '<dl class="nd-spec">'
      +     row('발표일', dots(it.announced))
      +     row('시행일', dots(it.effective))
      +     row('상태', it.status)
      +     row('뉴스 분류', it.kind)
      +   '</dl>'
      + '</article>';
  }

  function notFound() {
    return '<div class="nd-empty"><b>기사를 찾지 못했습니다</b>'
      + '<p>주소가 바뀌었거나 표본에 없는 기사입니다.</p></div>';
  }

  function find(no) {
    var items = (window.NEWS && window.NEWS.items) || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].no === no) return items[i];
    }
    return null;
  }

  return { html: html, notFound: notFound, find: find };
})();
