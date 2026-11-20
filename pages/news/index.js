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

  // ===== 상품 소식 좌우 넘기기 =====
  function bindTrack() {
    var track = el('ns-products'), prev = el('ns-prod-prev'), next = el('ns-prod-next');
    if (!track || !prev || !next) return;
    function update() {
      prev.disabled = track.scrollLeft < 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    }
    function step(dir) {
      var smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: smooth ? 'smooth' : 'instant' });
    }
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
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

  // ===== 이벤트 =====
  document.addEventListener('click', function (e) {
    var card = e.target.closest('[data-no]');
    if (card) { openArticle(parseInt(card.dataset.no, 10)); return; }

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


  // ===== 기사 레이어 — 화면을 넘기지 않고 목록 위에 지면을 띄운다 =====
  var A = window.NEWS_ARTICLE;
  var dim = el('nl-dim');
  var layerBody = el('nl-body');
  var layerScroll = dim.querySelector('.nl-scroll');
  var listTitle = document.title;
  var lastFocus = null;

  function openArticle(no, push) {
    var it = A && A.find(no);
    if (!it) return;
    lastFocus = document.activeElement;
    layerBody.innerHTML = A.html(it);
    dim.hidden = false;
    document.body.style.overflow = 'hidden';
    document.title = it.title + ' · BoBi 보험소식지';
    sheet.focus();
    layerScroll.scrollTop = 0;
    if (push !== false) history.pushState({ no: no }, '', 'index.html?no=' + no);
  }

  function closeArticle() {
    if (dim.hidden) return;
    dim.hidden = true;
    layerBody.innerHTML = '';
    document.body.style.overflow = '';
    document.title = listTitle;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // 닫기는 주소도 함께 되돌린다 — 브라우저 뒤로가기와 같은 동작
  function requestClose() {
    if (history.state && history.state.no) { history.back(); return; }
    closeArticle();
    history.replaceState(null, '', 'index.html');
  }

  var sheet = dim.querySelector('.nl-sheet');
  dim.addEventListener('mousedown', function (e) { if (!sheet.contains(e.target)) requestClose(); });
  el('nl-close').addEventListener('click', requestClose);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !dim.hidden) requestClose();
  });
  window.addEventListener('popstate', function (e) {
    var no = e.state && e.state.no;
    if (no) openArticle(no, false); else closeArticle();
  });

  renderHead();
  bindTrack();
  drawList();

  // 주소에 기사 번호가 있으면 목록을 그린 뒤 바로 띄운다
  var startNo = parseInt(new URLSearchParams(location.search).get('no'), 10);
  if (startNo) openArticle(startNo, false);
})();
