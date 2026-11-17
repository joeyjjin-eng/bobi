/* 보험소식지 — 오늘의 뉴스 (헤드라인 · 상품 소식 · 주제별 목록 · 기사 상세) */
(function () {
  var D = window.NEWS;
  if (!D) return;

  var SIZE = D.size || 9;
  var byNo = {};
  D.items.forEach(function (it) { byNo[it.no] = it; });

  // 화면 상태 — 주제 칩 · 검색어 · 뉴스 분류 · 보기 방식 · 쪽
  var st = { topic: 'all', q: '', kind: '전체', view: 'latest', page: 0 };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(id) { return document.getElementById(id); }
  function dots(v) { return v ? String(v).replace(/-/g, '.') : ''; }

  // 주제·기관 뱃지. 주제는 topic 값(product/industry/consumer)으로 색이 갈린다
  function badge(text, tone) {
    return '<span class="ns-badge ' + tone + '">' + esc(text) + '</span>';
  }

  // 썸네일 — 이미지가 없는 자료는 같은 자리를 회색 판으로 채운다
  function thumbHTML(it, cls) {
    if (it.thumb) return '<img class="ns-thumb' + cls + '" src="' + esc(it.thumb) + '" alt="" loading="lazy" />';
    return '<span class="ns-thumb none' + cls + '" aria-hidden="true">'
      + '<svg class="ic-svg" width="22" height="22"><use href="#i-newspaper"/></svg></span>';
  }

  // 목록·카드의 미리보기는 첫 문장까지만 — 나머지는 상세에서 본다
  function lead(text) {
    var m = String(text || '').match(/^.*?[다요][.!?](?=\s|$)/);
    return m ? m[0] : String(text || '');
  }

  // ===== 헤드라인 · 상품 소식 카드 =====
  // 헤드라인은 요약 첫 문장까지, 상품 소식은 날짜·회사와 제목만
  function cardHTML(it, mode) {
    // 상품 소식은 글 부분에만 색이 깔린 카드, 헤드라인은 배경 없는 카드
    if (mode === 'product') {
      return '<button type="button" class="ns-card" data-no="' + it.no + '">'
        + thumbHTML(it, '')
        + '<span class="ns-pbody">'
        +   '<span class="meta">' + badge(it.org, 'org')
        +     '<span class="ns-meta-dt">' + esc(it.date) + '</span></span>'
        +   '<span class="tt">' + esc(it.title) + '</span>'
        + '</span>'
        + '</button>';
    }
    return '<button type="button" class="ns-card" data-no="' + it.no + '">'
      + thumbHTML(it, '')
      + '<span class="meta">' + badge(it.topicLabel, it.topic) + badge(it.org, 'org')
      +   '<span class="ns-meta-dt">' + esc(it.date) + '</span></span>'
      + '<span class="tt">' + esc(it.title) + '</span>'
      + '<span class="ex">' + esc(lead(it.brief)) + '</span>'
      + '</button>';
  }

  function renderHead() {
    var heads = D.head.headlines.map(function (no) { return byNo[no]; }).filter(Boolean);
    var prods = D.head.products.map(function (no) { return byNo[no]; }).filter(Boolean);
    el('ns-hl-meta').textContent = D.head.date + ' 기준 · 주제별 ' + heads.length + '건';
    el('ns-headlines').innerHTML = heads.map(function (it) { return cardHTML(it, 'headline'); }).join('');
    el('ns-products').innerHTML = prods.map(function (it) { return cardHTML(it, 'product'); }).join('');

    el('ns-chips').innerHTML = D.head.topics.map(function (t) {
      var on = st.topic === t[0];
      return '<button type="button" class="ns-chip' + (on ? ' on' : '') + '" data-topic="' + t[0] + '"'
        + ' aria-pressed="' + on + '">' + esc(t[1]) + ' <span class="cnt">' + (D.head.topicCounts[t[0]] || 0) + '</span></button>';
    }).join('');

    el('ns-kind').innerHTML = ['전체'].concat(D.head.kinds).map(function (k) {
      return '<option value="' + esc(k) + '"' + (k === st.kind ? ' selected' : '') + '>'
        + esc(k === '전체' ? '모든 분류' : k) + '</option>';
    }).join('');
  }

  // ===== 목록 =====
  function filtered() {
    var q = st.q.trim().toLowerCase();
    var rows = D.items.filter(function (it) {
      if (st.topic !== 'all' && it.topic !== st.topic) return false;
      if (st.kind !== '전체' && it.kind !== st.kind) return false;
      if (!q) return true;
      return [it.title, it.org, it.brief, it.kind, it.topicLabel].join(' ').toLowerCase().indexOf(q) >= 0;
    });
    rows.sort(function (a, b) {
      // 분류별은 분류 이름 순, 같은 분류 안에서는 최신순
      if (st.view === 'group' && a.kind !== b.kind) return a.kind.localeCompare(b.kind, 'ko');
      return a.date < b.date ? 1 : a.date > b.date ? -1 : a.no - b.no;
    });
    return rows;
  }

  function rowHTML(it) {
    // 분류별 보기에서는 정렬 기준인 뉴스 분류를, 최신순에서는 주제를 뱃지로 앞에 둔다
    var meta = badge(st.view === 'group' ? it.kind : it.topicLabel, it.topic) + badge(it.org, 'org');
    return '<button type="button" class="ns-row" data-no="' + it.no + '">'
      + '<span class="dt">' + esc(it.date) + '</span>'
      + '<span class="bd">'
      +   '<span class="meta">' + meta + '</span>'
      +   '<span class="tt">' + esc(it.title) + '</span>'
      +   '<span class="ex">' + esc(lead(it.brief)) + '</span>'
      + '</span>'
      + thumbHTML(it, '')
      + '<span class="go" aria-hidden="true"><svg class="ic-svg" width="16" height="16"><use href="#i-chevron-right"/></svg></span>'
      + '</button>';
  }

  function drawList() {
    var rows = filtered();
    var last = Math.max(0, Math.ceil(rows.length / SIZE) - 1);
    if (st.page > last) st.page = last;
    var page = rows.slice(st.page * SIZE, st.page * SIZE + SIZE);
    var host = el('ns-results');

    el('ns-count').innerHTML = '<b>' + rows.length + '</b>건';

    if (!rows.length) {
      host.innerHTML = '<div class="ns-empty"><b>찾는 기사가 없습니다</b>'
        + '<p>검색어와 선택한 분류를 확인해 주세요.</p></div>';
      el('ns-pager').innerHTML = '';
      return;
    }

    host.innerHTML = '<div class="ns-panel">' + page.map(rowHTML).join('') + '</div>';

    // 쪽 넘기기 — 한 쪽을 넘을 때만
    if (last === 0) { el('ns-pager').innerHTML = ''; return; }
    el('ns-pager').innerHTML = ''
      + btn('first', 'i-chevrons-left', st.page === 0, '첫 쪽')
      + btn('prev', 'i-chevron-left', st.page === 0, '이전 쪽')
      + '<span class="pp">' + (st.page + 1) + ' / ' + (last + 1) + '</span>'
      + btn('next', 'i-chevron-right', st.page === last, '다음 쪽')
      + btn('last', 'i-chevrons-right', st.page === last, '마지막 쪽');
  }

  function btn(act, icon, off, label) {
    return '<button type="button" data-page="' + act + '"' + (off ? ' disabled' : '')
      + ' aria-label="' + label + '"><svg class="ic-svg" width="16" height="16"><use href="#' + icon + '"/></svg></button>';
  }

  // ===== 기사 상세 =====
  // 문장 두 개씩 한 문단 — 받은 화면과 같은 규칙
  function paragraphs(text) {
    var sentences = String(text || '').split(/(?<=[다요][.!?])\s+/);
    var out = [];
    for (var i = 0; i < sentences.length; i += 2) {
      var p = sentences.slice(i, i + 2).join(' ').trim();
      if (p) out.push('<p class="body">' + esc(p) + '</p>');
    }
    return out.join('');
  }

  var modal = el('ns-modal');

  function openDoc(no) {
    var it = byNo[no];
    if (!it) return;
    el('ns-sheet-body').innerHTML = ''
      + '<article class="ns-doc">'
      +   '<div class="kicker">' + badge(it.kind, it.topic) + badge(it.org, 'org')
      +     '<span class="ns-meta-dt">' + esc(it.date) + '</span></div>'
      +   '<h2 id="ns-doc-title">' + esc(it.title) + '</h2>'
      +   (it.thumb ? '<img class="art" src="' + esc(it.thumb) + '" alt="" />' : '')
      +   '<section><h3>주요 내용</h3>' + paragraphs(it.brief) + '</section>'
      +   '<section><h3>날짜·진행 상태</h3><dl>'
      +     '<dt>기사 게시·확인일</dt><dd>' + esc(it.date) + '</dd>'
      +     '<dt>발표일</dt><dd>' + esc(dots(it.announced) || '별도 기재 없음') + '</dd>'
      +     '<dt>시행일</dt><dd>' + esc(dots(it.effective) || '별도 기재 없음') + '</dd>'
      +     '<dt>상태</dt><dd>' + esc(it.status) + '</dd>'
      +   '</dl></section>'
      +   '<section><h3>원문</h3>'
      +     '<a class="src-btn" href="' + esc(it.url) + '" target="_blank" rel="noopener">원문에서 자세히 보기 ↗</a>'
      +     '<p class="src-url">' + esc(it.url) + '</p>'
      +   '</section>'
      + '</article>';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    el('ns-close').focus();
  }

  function closeDoc() {
    modal.hidden = true;
    el('ns-sheet-body').innerHTML = '';
    document.body.style.overflow = '';
  }

  // ===== 이벤트 =====
  document.addEventListener('click', function (e) {
    var card = e.target.closest('[data-no]');
    if (card) { openDoc(+card.dataset.no); return; }

    var chip = e.target.closest('[data-topic]');
    if (chip) {
      st.topic = chip.dataset.topic;
      st.kind = '전체';
      st.page = 0;
      el('ns-kind').value = '전체';
      document.querySelectorAll('[data-topic]').forEach(function (b) {
        var on = b === chip;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      drawList();
      return;
    }

    var pg = e.target.closest('[data-page]');
    if (pg) {
      var last = Math.max(0, Math.ceil(filtered().length / SIZE) - 1);
      var act = pg.dataset.page;
      st.page = act === 'first' ? 0 : act === 'last' ? last : act === 'prev' ? st.page - 1 : st.page + 1;
      st.page = Math.min(last, Math.max(0, st.page));
      drawList();
      el('ns-browse').scrollIntoView({ block: 'start' });
      return;
    }

    if (e.target === modal || e.target.closest('#ns-close')) closeDoc();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeDoc();
  });

  el('ns-all-product').addEventListener('click', function () {
    var chip = document.querySelector('[data-topic="product"]');
    if (chip) chip.click();
    el('ns-browse').scrollIntoView({ block: 'start' });
  });

  var timer;
  el('ns-q').addEventListener('input', function (e) {
    st.q = e.target.value;
    st.page = 0;
    clearTimeout(timer);
    timer = setTimeout(drawList, 200);
  });
  el('ns-kind').addEventListener('change', function (e) {
    st.kind = e.target.value; st.page = 0; drawList();
  });
  el('ns-view').addEventListener('change', function (e) {
    st.view = e.target.value; st.page = 0; drawList();
  });

  renderHead();
  drawList();
})();
