/* ============================================================
   판례노트 — 카드뉴스 · 판례 자료 찾기 · 관련 보도

   짜임 — ① 고객에게 보여주는 판례노트(카드뉴스 가로 넘김)
          ② 판례 자료 찾기(검색·분류·자료 선택 + 목록 + 쪽 넘김)
          ③ 기존 판례 관련 보도(접고 펴기)

   목록 줄을 누르면 판례 상세, 카드 표지를 누르면 카드뉴스
   4장 미리보기가 열린다.
   ============================================================ */
(function () {
  var data = (window.CASE_NOTES || []).slice().sort(function (a, b) {
    return String(b.decided).localeCompare(String(a.decided));
  });
  var press = window.CASE_PRESS || [];
  var PAGE_SIZE = 9;
  var state = { q: '', kind: '', scope: '', page: 0 };

  function el(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
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
  function noteCount() {
    return data.filter(function (item) { return !!item.card; }).length;
  }

  /* ===== 카드뉴스 — 표지와 속장은 같은 틀을 쓴다 ===== */
  function coverHTML(item) {
    return '<span class="cn-cover">'
      + '<span class="cn-eyebrow">보비 인사이트 · 판례 노트</span>'
      + '<span class="cn-cover-title">' + esc(item.card.title) + '</span>'
      + '<span class="cn-cover-art" aria-hidden="true"></span>'
      + '<span class="cn-cover-foot">' + esc(item.court) + ' ' + esc(item.decided) + ' 선고 · ' + esc(item.caseNo) + '</span>'
      + '</span>';
  }
  function slides(item) {
    return [
      { kind: 'cover' },
      { kind: 'body', heading: '어떤 사건이었나', body: item.card.situation },
      { kind: 'body', heading: '법원은 이렇게 봤습니다', body: item.card.decision },
      { kind: 'body', heading: '고객에게는 이렇게', body: item.card.guide }
    ];
  }
  function slideHTML(item, index) {
    var slide = slides(item)[index];
    if (slide.kind === 'cover') return coverHTML(item);
    return '<span class="cn-cover is-body">'
      + '<span class="cn-eyebrow">보비 인사이트 · 판례 노트</span>'
      + '<span class="cn-body-heading">' + esc(slide.heading) + '</span>'
      + '<span class="cn-body-text">' + esc(slide.body) + '</span>'
      + '<span class="cn-cover-foot">' + esc(item.caseNo) + ' · ' + (index + 1) + ' / 4</span>'
      + '</span>';
  }
  function railCardHTML(item) {
    var index = data.indexOf(item);
    return '<li class="cn-card">'
      + '<button type="button" class="cn-card-btn" data-cn-index="' + index + '">'
      +   coverHTML(item)
      +   '<span class="cn-card-no">' + esc(item.caseNo) + '</span>'
      +   '<span class="cn-card-title">' + esc(item.card.title) + '</span>'
      +   '<span class="cn-card-cta">4장 보기 · 저장</span>'
      + '</button>'
      + '</li>';
  }
  function drawRail() {
    var cards = data.filter(function (item) { return !!item.card; });
    el('cn-rail').innerHTML = cards.map(railCardHTML).join('');
    el('cn-hint').textContent = '좌우로 넘겨보세요 · ' + cards.length + '종';
  }

  /* ===== 판례 자료 찾기 ===== */
  function filtered() {
    var q = state.q.trim().toLowerCase();
    return data.filter(function (item) {
      if (state.kind && item.kind !== state.kind) return false;
      if (state.scope === 'note' && !item.card) return false;
      if (state.scope === 'pending' && !item.pending) return false;
      if ((state.scope === '판례' || state.scope === '분쟁조정') && item.type !== state.scope) return false;
      if (!q) return true;
      return [item.caseNo, item.title, item.summary, item.kind, item.court, (item.tags || []).join(' ')]
        .join(' ').toLowerCase().indexOf(q) !== -1;
    });
  }
  function rowHTML(item) {
    var index = data.indexOf(item);
    return '<li class="case-row">'
      + '<button type="button" class="case-row-btn" data-case-index="' + index + '">'
      +   '<span class="case-row-copy">'
      +     '<span class="case-row-title">' + esc(item.title) + '</span>'
      +     '<span class="case-row-meta">' + esc(item.court) + ' · ' + esc(item.decided) + ' · ' + esc(item.caseNo)
      +       (item.pending ? ' · 확정 전' : '') + '</span>'
      +   '</span>'
      +   (item.card ? '<span class="case-row-thumb">' + coverHTML(item) + '</span>' : '')
      +   '<svg class="ic-svg case-row-go" width="16" height="16" aria-hidden="true"><use href="#i-chevron-right"/></svg>'
      + '</button>'
      + '</li>';
  }
  function draw() {
    var rows = filtered();
    var lastPage = Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1);
    state.page = Math.min(state.page, lastPage);
    var visible = rows.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE);
    el('case-count').textContent = rows.length + '건';

    if (!visible.length) {
      el('case-results').innerHTML = '<div class="policy-empty"><svg class="ic-svg" width="28" height="28" aria-hidden="true"><use href="#i-search"/></svg><strong>조건에 맞는 판례가 없습니다</strong><p>검색어 또는 분류를 변경해 주세요.</p></div>';
      el('case-pager').innerHTML = '';
      return;
    }
    el('case-results').innerHTML = '<ul class="case-list">' + visible.map(rowHTML).join('') + '</ul>';
    el('case-pager').innerHTML = '<button type="button" class="case-page-btn" data-page="' + (state.page - 1) + '"'
      + (state.page === 0 ? ' disabled' : '') + '>'
      + '<svg class="ic-svg" width="15" height="15" aria-hidden="true"><use href="#i-chevron-left"/></svg> 이전</button>'
      + '<span class="case-page-now">' + (state.page + 1) + ' / ' + (lastPage + 1) + '쪽 · 전체 ' + rows.length + '건</span>'
      + '<button type="button" class="case-page-btn" data-page="' + (state.page + 1) + '"'
      + (state.page === lastPage ? ' disabled' : '') + '>'
      + '다음 <svg class="ic-svg" width="15" height="15" aria-hidden="true"><use href="#i-chevron-right"/></svg></button>';
  }

  /* ===== 판례 상세 ===== */
  function infoRow(label, value) {
    var empty = !value;
    return '<div><dt>' + esc(label) + '</dt><dd' + (empty ? ' class="none"' : '') + '>'
      + esc(empty ? '별도 기재 없음' : value) + '</dd></div>';
  }
  function section(heading, body) {
    return body ? '<h2>' + esc(heading) + '</h2><p>' + esc(body) + '</p>' : '';
  }
  function detailHTML(item) {
    var index = data.indexOf(item);
    var tags = (item.tags || []).length
      ? '<ul class="case-tags">' + item.tags.map(function (tag) { return '<li>#' + esc(tag) + '</li>'; }).join('') + '</ul>'
      : '';
    var card = item.card
      ? '<button type="button" class="case-card-open" data-cn-index="' + index + '">'
        + '<svg class="ic-svg" width="16" height="16" aria-hidden="true"><use href="#i-image"/></svg>'
        + '카드뉴스 4장 보기</button>'
      : '';
    return '<article class="nd-main">'
      + '<dl class="nd-meta">'
      +   '<div><dt>선고·결정일</dt><dd>' + esc(item.decided) + '</dd></div>'
      +   '<div><dt>분류</dt><dd class="topic">' + esc(item.kind) + '</dd></div>'
      +   '<div><dt>법원</dt><dd>' + esc(item.court) + '</dd></div>'
      + '</dl>'
      + '<div class="case-headline">'
      +   '<span class="case-caseno">' + esc(item.caseNo) + '</span>'
      +   '<h1>' + esc(item.title) + '</h1>'
      + '</div>'
      + '<span class="nd-lead-tag">핵심 요약</span>'
      + '<p class="nd-lead">' + esc(item.summary) + '</p>'
      + card
      + (item.holding ? '<div class="case-holding"><span class="case-holding-label">판시사항</span><p>' + esc(item.holding) + '</p></div>' : '')
      + '<div class="nd-text">'
      +   section('사실관계', item.facts)
      +   section('법원의 판단', item.judgment)
      + '</div>'
      + (item.practice ? '<div class="case-note"><h2>현장에서 볼 점</h2><p>' + esc(item.practice) + '</p></div>' : '')
      + tags
      + '<dl class="nd-spec">'
      +   infoRow('사건번호', item.caseNo)
      +   infoRow('법원', item.court)
      +   infoRow('선고·결정일', item.decided)
      +   infoRow('자료 구분', item.type + (item.pending ? ' · 확정 전' : ''))
      +   infoRow('분류', item.kind)
      +   infoRow('관련 조항', item.laws)
      + '</dl>'
      + '</article>';
  }

  var modal = el('case-modal');
  var modalSheet = modal.querySelector('.policy-modal-sheet');
  var modalScroll = modal.querySelector('.policy-modal-scroll');
  var modalBody = el('case-modal-body');
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
    if (push !== false) history.pushState({ caseNote: index }, '', 'cases.html?case=' + index);
  }
  function closeDetail() {
    if (modal.hidden) return;
    modal.hidden = true;
    modalBody.innerHTML = '';
    if (cnModal.hidden) document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function requestClose() {
    if (history.state && typeof history.state.caseNote === 'number') { history.back(); return; }
    closeDetail();
    history.replaceState(null, '', 'cases.html');
  }

  /* ===== 카드뉴스 미리보기 ===== */
  var cnModal = el('cn-modal');
  var cnSheet = cnModal.querySelector('.cn-sheet');
  var cnHost = el('cn-slide-host');
  var cnView = { index: -1, slide: 0, lastFocus: null };

  function drawSlide() {
    var item = data[cnView.index];
    if (!item) return;
    cnHost.innerHTML = slideHTML(item, cnView.slide);
    el('cn-counter').textContent = (cnView.slide + 1) + ' / 4';
    el('cn-sheet-title').textContent = item.card.title;
    el('cn-slide-prev').disabled = cnView.slide === 0;
    el('cn-slide-next').disabled = cnView.slide === 3;
  }
  function openCard(index) {
    var item = data[index];
    if (!item || !item.card) return;
    cnView.lastFocus = document.activeElement;
    cnView.index = index;
    cnView.slide = 0;
    el('cn-save-note').textContent = '';
    drawSlide();
    cnModal.hidden = false;
    document.body.style.overflow = 'hidden';
    cnSheet.focus();
  }
  function closeCard() {
    if (cnModal.hidden) return;
    cnModal.hidden = true;
    cnHost.innerHTML = '';
    if (modal.hidden) document.body.style.overflow = '';
    if (cnView.lastFocus && cnView.lastFocus.focus) cnView.lastFocus.focus();
  }
  function moveSlide(step) {
    cnView.slide = Math.min(3, Math.max(0, cnView.slide + step));
    drawSlide();
  }

  /* ===== 기존 판례 관련 보도 ===== */
  function drawPress() {
    el('case-press-count').textContent = press.length;
    el('case-press-list').innerHTML = press.map(function (item) {
      return '<li class="case-press-row">'
        + '<span class="case-press-title">' + esc(item.title) + '</span>'
        + '<span class="case-press-meta">판례 관련 보도 · 기사일 ' + esc(item.date)
        + (item.hasNote ? ' · 판례노트 있음' : '') + '</span>'
        + '</li>';
    }).join('');
  }

  /* ===== 묶기 ===== */
  fillSelect('case-kind', Array.from(new Set(data.map(function (item) { return item.kind; })))
    .sort(function (a, b) { return a.localeCompare(b, 'ko'); }));
  el('case-total').textContent = data.length;
  el('case-note-total').textContent = noteCount();
  drawRail();
  drawPress();
  draw();

  var timer;
  el('case-q').addEventListener('input', function (event) {
    state.q = event.target.value; state.page = 0;
    clearTimeout(timer); timer = setTimeout(draw, 160);
  });
  el('case-kind').addEventListener('change', function (event) {
    state.kind = event.target.value; state.page = 0; draw();
  });
  el('case-scope').addEventListener('change', function (event) {
    state.scope = event.target.value; state.page = 0; draw();
  });
  el('case-reset').addEventListener('click', function () {
    state = { q: '', kind: '', scope: '', page: 0 };
    el('case-q').value = ''; el('case-kind').value = ''; el('case-scope').value = '';
    draw();
  });
  el('case-pager').addEventListener('click', function (event) {
    var button = event.target.closest('[data-page]');
    if (!button || button.disabled) return;
    state.page = Number(button.dataset.page);
    draw();
    el('case-find-title').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  el('case-results').addEventListener('click', function (event) {
    var rowButton = event.target.closest('[data-case-index]');
    if (rowButton) openDetail(parseInt(rowButton.dataset.caseIndex, 10));
  });

  var rail = el('cn-rail');
  rail.addEventListener('click', function (event) {
    var button = event.target.closest('[data-cn-index]');
    if (button) openCard(parseInt(button.dataset.cnIndex, 10));
  });
  function railStep(direction) {
    var card = rail.querySelector('.cn-card');
    var step = card ? card.getBoundingClientRect().width + 16 : 220;
    rail.scrollBy({ left: direction * step * 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  el('cn-prev').addEventListener('click', function () { railStep(-1); });
  el('cn-next').addEventListener('click', function () { railStep(1); });

  modalBody.addEventListener('click', function (event) {
    var button = event.target.closest('[data-cn-index]');
    if (button) openCard(parseInt(button.dataset.cnIndex, 10));
  });
  modal.addEventListener('mousedown', function (event) {
    if (!modalSheet.contains(event.target)) requestClose();
  });
  el('case-modal-close').addEventListener('click', requestClose);

  cnModal.addEventListener('mousedown', function (event) {
    if (!cnSheet.contains(event.target)) closeCard();
  });
  el('cn-close').addEventListener('click', closeCard);
  el('cn-slide-prev').addEventListener('click', function () { moveSlide(-1); });
  el('cn-slide-next').addEventListener('click', function () { moveSlide(1); });
  el('cn-save').addEventListener('click', function () {
    el('cn-save-note').textContent = '카드뉴스 이미지 파일을 연결하면 저장됩니다.';
  });

  document.addEventListener('keydown', function (event) {
    if (!cnModal.hidden) {
      if (event.key === 'Escape') closeCard();
      if (event.key === 'ArrowLeft') moveSlide(-1);
      if (event.key === 'ArrowRight') moveSlide(1);
      return;
    }
    if (event.key === 'Escape' && !modal.hidden) requestClose();
  });
  window.addEventListener('popstate', function (event) {
    var index = event.state && event.state.caseNote;
    if (typeof index === 'number') openDetail(index, false); else closeDetail();
  });

  var startIndex = parseInt(new URLSearchParams(location.search).get('case'), 10);
  if (!isNaN(startIndex)) openDetail(startIndex, false);
})();
