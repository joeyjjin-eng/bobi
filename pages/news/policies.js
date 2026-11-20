(function () {
  var data = window.POLICY_NEWS || [];
  var PAGE_SIZE = 15;
  var state = { q: '', kind: '', status: '', org: '', archive: false, page: 0 };

  function el(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }
  function unique(key) {
    return Array.from(new Set(data.map(function (item) { return item[key]; }))).sort(function (a, b) {
      return a.localeCompare(b, 'ko');
    });
  }
  function fillSelect(id, values) {
    var select = el(id);
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }
  function filtered() {
    var q = state.q.trim().toLowerCase();
    return data.filter(function (item) {
      if (!state.archive && item.archived) return false;
      if (state.kind && item.kind !== state.kind) return false;
      if (state.status && item.state !== state.status) return false;
      if (state.org && item.org !== state.org) return false;
      if (!q) return true;
      return [item.title, item.summary, item.org, item.kind, item.state].join(' ').toLowerCase().indexOf(q) !== -1;
    });
  }
  function thumbnail(item) {
    var index = data.indexOf(item) % 5 + 1;
    return '../../assets/news/news-art-' + index + '.jpg';
  }
  function dots(value) { return value ? String(value).replace(/-/g, '.') : ''; }
  function infoRow(label, value) {
    var empty = !value;
    return '<div><dt>' + esc(label) + '</dt><dd' + (empty ? ' class="none"' : '') + '>'
      + esc(empty ? '별도 기재 없음' : value) + '</dd></div>';
  }
  function detailHTML(item) {
    var url = item.url
      ? '<a class="nd-src" href="' + esc(item.url) + '" target="_blank" rel="noopener"><span class="tx">원문 보기</span><span class="ic" aria-hidden="true"><svg class="ic-svg" width="16" height="16"><use href="#i-arrow-right"/></svg></span></a>'
      : '';
    return '<article class="nd-main">'
      + '<dl class="nd-meta">'
      +   '<div><dt>게시일</dt><dd>' + esc(item.date || '별도 기재 없음') + '</dd></div>'
      +   '<div><dt>분류</dt><dd class="topic">' + esc(item.kind) + '</dd></div>'
      +   '<div><dt>기관</dt><dd>' + esc(item.source) + '</dd></div>'
      + '</dl>'
      + '<h1>' + esc(item.title) + '</h1>'
      + '<span class="nd-lead-tag">핵심 요약</span>'
      + '<p class="nd-lead">' + esc(item.summary) + '</p>'
      + url
      + '<figure class="nd-art"><img src="' + thumbnail(item) + '" alt="" /></figure>'
      + '<div class="nd-text"><h2>주요 내용</h2><p>' + esc(item.detail || item.summary) + '</p></div>'
      + '<dl class="nd-spec">'
      +   infoRow('발표일', dots(item.announced))
      +   infoRow('시행일', dots(item.effective))
      +   infoRow('상태', item.state)
      +   infoRow('뉴스 분류', item.kind)
      + '</dl>'
      + '</article>';
  }
  function row(item) {
    var index = data.indexOf(item);
    return '<button type="button" class="policy-row' + (item.archived ? ' is-archived' : '') + '" data-policy-index="' + index + '">'
      + '<div class="policy-subject">'
      +   '<img class="policy-thumb" src="' + thumbnail(item) + '" alt="" loading="lazy" />'
      +   '<div class="policy-subject-copy"><h4>' + esc(item.title) + '</h4><p>' + esc(item.summary) + '</p></div>'
      + '</div>'
      + '<div class="policy-cell policy-kind-cell"><span class="policy-kind">' + esc(item.kind) + '</span></div>'
      + '<div class="policy-cell policy-org-cell"><span>' + esc(item.source) + '</span></div>'
      + '<div class="policy-cell policy-state-cell"><span class="policy-state">' + esc(item.state) + '</span></div>'
      + '</button>';
  }
  function pageButton(target, icon, label, disabled) {
    return '<button type="button" data-page="' + target + '" aria-label="' + label + '"' + (disabled ? ' disabled' : '') + '>'
      + '<svg class="ic-svg" width="16" height="16" aria-hidden="true"><use href="#i-' + icon + '"/></svg></button>';
  }
  function draw() {
    var rows = filtered();
    var lastPage = Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1);
    state.page = Math.min(state.page, lastPage);
    var visible = rows.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE);
    el('policy-count').textContent = rows.length + '건';

    if (!visible.length) {
      el('policy-results').innerHTML = '<div class="policy-empty"><svg class="ic-svg" width="28" height="28" aria-hidden="true"><use href="#i-search"/></svg><strong>조건에 맞는 자료가 없습니다</strong><p>검색어 또는 필터를 변경해 주세요.</p></div>';
    } else {
      el('policy-results').innerHTML = '<div class="policy-list">'
        + '<div class="policy-table-head" aria-hidden="true"><span>자료</span><span>분류</span><span>관련 기관</span><span>상태</span></div>'
        + visible.map(row).join('') + '</div>';
    }

    if (!rows.length) {
      el('policy-pager').innerHTML = '';
    } else {
      el('policy-pager').innerHTML = pageButton(0, 'chevrons-left', '첫 페이지', state.page === 0)
        + pageButton(Math.max(0, state.page - 1), 'chevron-left', '이전 페이지', state.page === 0)
        + '<span class="pp">' + (state.page + 1) + ' / ' + (lastPage + 1) + '</span>'
        + pageButton(Math.min(lastPage, state.page + 1), 'chevron-right', '다음 페이지', state.page === lastPage)
        + pageButton(lastPage, 'chevrons-right', '마지막 페이지', state.page === lastPage);
    }
  }

  fillSelect('policy-kind', unique('kind'));
  fillSelect('policy-state', unique('state'));
  fillSelect('policy-org', unique('org'));
  el('policy-total').textContent = data.length;

  var timer;
  el('policy-q').addEventListener('input', function (event) {
    state.q = event.target.value; state.page = 0;
    clearTimeout(timer); timer = setTimeout(draw, 160);
  });
  [['policy-kind', 'kind'], ['policy-state', 'status'], ['policy-org', 'org']].forEach(function (entry) {
    el(entry[0]).addEventListener('change', function (event) {
      state[entry[1]] = event.target.value; state.page = 0; draw();
    });
  });
  el('policy-archive').addEventListener('change', function (event) {
    state.archive = event.target.checked; state.page = 0; draw();
  });
  el('policy-pager').addEventListener('click', function (event) {
    var button = event.target.closest('[data-page]');
    if (!button || button.disabled) return;
    state.page = Number(button.dataset.page);
    draw();
    el('policy-title').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  var modal = el('policy-modal');
  var modalSheet = modal.querySelector('.policy-modal-sheet');
  var modalScroll = modal.querySelector('.policy-modal-scroll');
  var modalBody = el('policy-modal-body');
  var closeButton = el('policy-modal-close');
  var lastFocus = null;

  function openDetail(index, push) {
    var item = data[index];
    if (!item) return;
    lastFocus = document.activeElement;
    modalBody.innerHTML = detailHTML(item);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalSheet.focus();
    modalScroll.scrollTop = 0;
    if (push !== false) history.pushState({ policy: index }, '', 'policies.html?policy=' + index);
  }
  function closeDetail() {
    if (modal.hidden) return;
    modal.hidden = true;
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function requestClose() {
    if (history.state && typeof history.state.policy === 'number') { history.back(); return; }
    closeDetail();
    history.replaceState(null, '', 'policies.html');
  }

  el('policy-results').addEventListener('click', function (event) {
    var rowButton = event.target.closest('[data-policy-index]');
    if (rowButton) openDetail(parseInt(rowButton.dataset.policyIndex, 10));
  });
  modal.addEventListener('mousedown', function (event) {
    if (!modalSheet.contains(event.target)) requestClose();
  });
  closeButton.addEventListener('click', requestClose);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) requestClose();
  });
  window.addEventListener('popstate', function (event) {
    var index = event.state && event.state.policy;
    if (typeof index === 'number') openDetail(index, false); else closeDetail();
  });
  draw();

  var startIndex = parseInt(new URLSearchParams(location.search).get('policy'), 10);
  if (!isNaN(startIndex)) openDetail(startIndex, false);
})();
