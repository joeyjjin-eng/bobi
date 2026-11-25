/* ============================================================
   판례노트 — 목록 · 판례 레이어

   판례 레이어 한 장 안에서 탭으로 갈린다. 고객 카드가 앞이다.
     고객 카드   큰 장 하나를 넘겨 보고, 아래 줄에서 4장을 한눈에
     판례 내용   ① 사건 개요 ② 쟁점 ③ 법원의 판단

   전면 레이어는 쓰지 않는다. 저장은 보고 있는 장 기준이고,
   4장을 한 장으로 잇는 저장은 그 옆에 둔다.
   ============================================================ */
(function () {
  var data = (window.CASE_NOTES || []).slice().sort(function (a, b) {
    return String(b.decided).localeCompare(String(a.decided));
  });
  var press = window.CASE_PRESS || [];
  var PAGE_SIZE = 9;
  var state = { q: '', kind: '', scope: '', page: 0 };
  var view = { index: -1, tab: 'text', slide: 0 };

  function el(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dotDate(value) {
    var parts = String(value || '').split('-');
    if (parts.length !== 3) return value || '';
    return parts[0] + '. ' + Number(parts[1]) + '. ' + Number(parts[2]) + '.';
  }
  function citation(item) { return item.court + ' ' + dotDate(item.decided) + ' 선고 ' + item.caseNo; }

  var toastTimer;
  function toast(message) {
    var box = el('cs-toast');
    box.textContent = message;
    box.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.hidden = true; }, 2600);
  }

  /* ===== 카드 한 장 — 그림이 없으면 같은 짜임으로 그린다 ===== */
  function slideHTML(item, index) {
    var slide = item.card.slides[index];
    if (slide.img) {
      return '<img class="cn-img" src="' + esc(slide.img) + '" alt="' + esc(slide.heading) + '" loading="lazy" />';
    }
    return '<span class="cn-cover' + (index === 0 ? ' is-cover' : '') + '">'
      + '<span class="cn-ribbon">보비 인사이트 | 판례 노트</span>'
      + '<span class="cn-cover-title">' + esc(slide.heading) + '</span>'
      + '<span class="cn-cover-art" aria-hidden="true"></span>'
      + '<span class="cn-lines">'
      +   (slide.lines || []).map(function (line, i) {
            return '<span class="cn-line' + (i % 2 ? ' alt' : '') + '">' + esc(line) + '</span>';
          }).join('')
      + '</span>'
      + '<span class="cn-cover-foot">'
      +   '<span>' + esc(citation(item)) + (slide.pages ? ' | ' + esc(slide.pages) : '') + '</span>'
      +   '<span class="cn-no">' + pad(index + 1) + ' / ' + pad(item.card.slides.length) + '</span>'
      + '</span>'
      + '</span>';
  }

  /* ===== 목록 — 카드 가로 넘김 ===== */
  function railCardHTML(item) {
    var index = data.indexOf(item);
    return '<li class="cn-card">'
      + '<button type="button" class="cn-card-btn" data-open-card="' + index + '">'
      +   '<span class="cn-card-art">' + slideHTML(item, 0) + '</span>'
      +   '<span class="cn-card-title">' + esc(item.question) + '</span>'
      +   '<span class="cn-card-foot">' + esc(item.court) + ' · ' + esc(item.decided) + ' · '
      +     item.card.slides.length + '장</span>'
      + '</button>'
      + '</li>';
  }
  function drawRail() {
    var cards = data.filter(function (item) { return item.card && item.card.slides.length; });
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
      return [item.caseNo, item.title, item.question, item.summary, item.kind, item.court, (item.tags || []).join(' ')]
        .join(' ').toLowerCase().indexOf(q) !== -1;
    });
  }
  function rowHTML(item) {
    var index = data.indexOf(item);
    return '<li class="case-row">'
      + '<button type="button" class="case-row-btn" data-case-index="' + index + '">'
      +   (item.card ? '<span class="case-row-thumb">' + slideHTML(item, 0) + '</span>' : '')
      +   '<span class="case-row-copy">'
      +     '<span class="case-row-title">' + esc(item.title) + '</span>'
      +     '<span class="case-row-meta">' + esc(item.court) + ' · ' + esc(item.decided) + ' · ' + esc(item.caseNo)
      +       (item.pending ? ' · 확정 전' : '') + '</span>'
      +     '<span class="case-row-result">' + esc(item.result || '') + '</span>'
      +   '</span>'
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

  /* ===== 판례 — 머리 ===== */
  function headHTML(item) {
    var remand = /파기/.test(item.result || '');
    var pdf = item.pdf && item.pdf.url
      ? '<a class="cs-act" href="' + esc(item.pdf.url) + '" target="_blank" rel="noopener">'
        + '<svg class="ic-svg" width="16" height="16" aria-hidden="true"><use href="#i-file-text"/></svg>판결문 PDF</a>'
      : '<span class="cs-act is-off" title="원문 파일이 아직 연결되지 않았습니다">'
        + '<svg class="ic-svg" width="16" height="16" aria-hidden="true"><use href="#i-file-text"/></svg>판결문 PDF</span>';
    return '<header class="cs-head">'
      + '<div class="cs-head-top">'
      +   '<div class="cs-badges">'
      +     '<span class="cs-kind">' + esc(item.kind) + '</span>'
      +     '<span class="cs-result' + (remand ? ' remand' : '') + '">' + esc(item.result || '결과 미기재') + '</span>'
      +     (item.pending ? '<span class="cs-result pending">확정 전</span>' : '')
      +   '</div>'
      +   '<div class="cs-acts">' + pdf
      +     '<button type="button" class="cs-act" data-share="1">'
      +     '<svg class="ic-svg" width="16" height="16" aria-hidden="true"><use href="#i-send"/></svg>공유</button>'
      +   '</div>'
      + '</div>'
      + '<h1>' + esc(item.question) + '</h1>'
      + '<p class="cs-lead">' + esc(item.summary) + '</p>'
      + '<p class="cs-cite">' + esc(citation(item)) + '</p>'
      + '</header>';
  }

  /* ===== 판례 내용 — 세 마디 ===== */
  function textPaneHTML(item) {
    var remand = /파기/.test(item.result || '');
    var warn = '이 결론은 이 사건의 약관 문구와 사실관계에 한정됩니다. 고객 계약의 약관을 확인하고 쓰세요.'
      + (remand ? ' 파기환송은 아직 지급이 정해지지 않았다는 뜻입니다.' : '');
    var judgment = (item.judgment || []).map(function (part) {
      return '<p>' + esc(part.text) + '</p>'
        + (part.src ? '<p class="cs-src">근거 · ' + esc(part.src) + '</p>' : '');
    }).join('');
    function sec(no, heading, body) {
      return '<section class="cs-sec"><h2><span class="cs-no">' + no + '</span>' + esc(heading) + '</h2>' + body + '</section>';
    }
    var tags = (item.tags || []).length
      ? '<ul class="case-tags">' + item.tags.map(function (tag) { return '<li>#' + esc(tag) + '</li>'; }).join('') + '</ul>'
      : '';
    return '<div class="cs-pane" data-pane="text">'
      + '<p class="cs-warn">' + esc(warn) + '</p>'
      + sec(1, '사건 개요', '<p>' + esc(item.facts || item.summary) + '</p>')
      + sec(2, '쟁점', '<p>' + esc(item.issueText || item.summary) + '</p>')
      + sec(3, '법원의 판단', judgment
          + (item.practice ? '<div class="cs-field"><b>현장에서 볼 점</b><p>' + esc(item.practice) + '</p></div>' : ''))
      + tags
      + '<dl class="nd-spec">'
      +   '<div><dt>사건번호</dt><dd>' + esc(item.caseNo) + '</dd></div>'
      +   '<div><dt>법원 · 선고일</dt><dd>' + esc(item.court) + ' · ' + esc(item.decided) + '</dd></div>'
      +   (item.lower ? '<div><dt>원심</dt><dd>' + esc(item.lower) + '</dd></div>' : '')
      +   '<div><dt>결과</dt><dd>' + esc(item.result || '별도 기재 없음') + '</dd></div>'
      +   '<div><dt>자료 구분</dt><dd>' + esc(item.type + (item.pending ? ' · 확정 전' : '')) + '</dd></div>'
      +   '<div><dt>분류</dt><dd>' + esc(item.kind) + '</dd></div>'
      +   '<div><dt>관련 조항</dt><dd>' + esc(item.laws || '별도 기재 없음') + '</dd></div>'
      + '</dl>'
      + '</div>';
  }

  /* ===== 고객 카드 — 큰 장 하나 + 아래 줄에 4장 ===== */
  function cardPaneHTML(item) {
    var slides = item.card.slides;
    var current = slides[view.slide];
    return '<div class="cs-pane" data-pane="card">'
      + '<div class="cv-stage">'
      +   '<button type="button" class="cv-nav" data-move="-1" aria-label="이전 장"' + (view.slide === 0 ? ' disabled' : '') + '>'
      +     '<svg class="ic-svg" width="20" height="20"><use href="#i-chevron-left"/></svg></button>'
      +   '<div class="cv-main">' + slideHTML(item, view.slide) + '</div>'
      +   '<button type="button" class="cv-nav" data-move="1" aria-label="다음 장"' + (view.slide === slides.length - 1 ? ' disabled' : '') + '>'
      +     '<svg class="ic-svg" width="20" height="20"><use href="#i-chevron-right"/></svg></button>'
      + '</div>'
      + '<div class="cv-cap">'
      +   '<b>' + esc(current.heading) + '</b>'
      +   '<span>' + (current.pages ? esc(current.pages) + ' · ' : '') + (view.slide + 1) + ' / ' + slides.length + '장</span>'
      + '</div>'
      + '<ul class="cv-strip">'
      +   slides.map(function (slide, i) {
          return '<li><button type="button" class="cv-chip' + (i === view.slide ? ' on' : '') + '" data-go="' + i + '">'
            + slideHTML(item, i)
            + '<span class="cv-chip-no">' + (i + 1) + '</span>'
            + '</button></li>';
        }).join('')
      + '</ul>'
      + '<div class="cv-acts">'
      +   '<button type="button" class="cs-btn primary" data-save-one="1">'
      +     '<svg class="ic-svg" width="16" height="16" aria-hidden="true"><use href="#i-download"/></svg>'
      +     '이 장 저장</button>'
      +   '<button type="button" class="cs-btn" data-save-all="1">' + slides.length + '장 한 장으로 저장</button>'
      +   '<button type="button" class="cs-btn" data-share="1">'
      +     '<svg class="ic-svg" width="16" height="16" aria-hidden="true"><use href="#i-send"/></svg>공유</button>'
      + '</div>'
      + '</div>';
  }

  function tabsHTML(item) {
    if (!item.card) return '';
    return '<div class="cs-tabs" role="tablist">'
      + '<button type="button" class="cs-tab' + (view.tab === 'card' ? ' on' : '') + '" data-tab="card" role="tab" aria-selected="' + (view.tab === 'card') + '">고객 카드 ' + item.card.slides.length + '장</button>'
      + '<button type="button" class="cs-tab' + (view.tab === 'text' ? ' on' : '') + '" data-tab="text" role="tab" aria-selected="' + (view.tab === 'text') + '">판례 내용</button>'
      + '</div>';
  }
  function detailHTML(item) {
    return '<article class="nd-main case-view">'
      + headHTML(item)
      + tabsHTML(item)
      + (view.tab === 'card' && item.card ? cardPaneHTML(item) : textPaneHTML(item))
      + '</article>';
  }

  var modal = el('case-modal');
  var modalSheet = modal.querySelector('.policy-modal-sheet');
  var modalScroll = modal.querySelector('.policy-modal-scroll');
  var modalBody = el('case-modal-body');
  var lastFocus = null;

  function render(keepScroll) {
    var top = modalScroll.scrollTop;
    modalBody.innerHTML = detailHTML(data[view.index]);
    modalScroll.scrollTop = keepScroll ? top : 0;
  }
  function openDetail(index, push, tab) {
    var item = data[index];
    if (!item) return;
    if (modal.hidden) lastFocus = document.activeElement;
    view.index = index;
    view.tab = (tab === 'text' || !item.card) ? 'text' : 'card';
    view.slide = 0;
    render(false);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalSheet.focus();
    if (push !== false) history.pushState({ caseNote: index }, '', 'cases.html?case=' + index);
  }
  function closeDetail() {
    if (modal.hidden) return;
    modal.hidden = true;
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function requestClose() {
    if (history.state && typeof history.state.caseNote === 'number') { history.back(); return; }
    closeDetail();
    history.replaceState(null, '', 'cases.html');
  }
  function moveSlide(step) {
    var item = data[view.index];
    if (!item || view.tab !== 'card') return;
    var next = view.slide + step;
    if (next < 0 || next >= item.card.slides.length) return;
    view.slide = next;
    render(true);
  }

  /* ===== 저장 · 공유 ===== */
  function fileBase(item) {
    return '판례노트_' + String(item.caseNo).replace(/[^\dA-Za-z가-힣]+/g, '_').replace(/_+$/, '');
  }
  function download(url, filename, revoke) {
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (revoke) setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function saveOne() {
    var item = data[view.index];
    var slide = item && item.card && item.card.slides[view.slide];
    if (!slide) return;
    if (!slide.img) { toast('카드 이미지 파일을 연결하면 저장됩니다.'); return; }
    download(slide.img, fileBase(item) + '_' + pad(view.slide + 1) + '.jpg');
    toast((view.slide + 1) + '장을 저장했습니다.');
  }
  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = reject;
      image.src = src;
    });
  }
  function saveAll() {
    var item = data[view.index];
    if (!item || !item.card) return;
    var sources = item.card.slides.map(function (slide) { return slide.img; });
    if (sources.some(function (src) { return !src; })) {
      toast('카드 이미지 파일을 연결하면 한 장으로 저장됩니다.');
      return;
    }
    toast('이미지를 잇는 중입니다.');
    Promise.all(sources.map(loadImage)).then(function (images) {
      var width = Math.max.apply(null, images.map(function (image) { return image.naturalWidth; }));
      var heights = images.map(function (image) { return image.naturalHeight * (width / image.naturalWidth); });
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = Math.round(heights.reduce(function (sum, height) { return sum + height; }, 0));
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      var top = 0;
      images.forEach(function (image, i) {
        ctx.drawImage(image, 0, top, width, heights[i]);
        top += heights[i];
      });
      canvas.toBlob(function (blob) {
        download(URL.createObjectURL(blob), fileBase(item) + '_전체.png', true);
        toast(images.length + '장을 한 장으로 저장했습니다.');
      }, 'image/png');
    }).catch(function () { toast('이미지를 불러오지 못했습니다.'); });
  }
  function shareCase() {
    var item = data[view.index];
    if (!item) return;
    var url = location.origin + location.pathname + '?case=' + view.index;
    if (navigator.share) {
      navigator.share({ title: item.question, text: citation(item), url: url }).catch(function () {});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(function () { toast('링크를 복사했습니다.'); })
        .catch(function () { toast('주소창의 주소를 복사해 보내 주세요.'); });
      return;
    }
    toast('이 브라우저에서는 공유가 지원되지 않습니다.');
  }

  /* ===== 기존 판례 관련 보도 =====
     가진 정보가 적으므로 빈 칸을 만들지 않고 있는 것만 보여 준다 */
  function linkedIndex(caseNo) {
    if (!caseNo) return -1;
    for (var i = 0; i < data.length; i++) {
      if (data[i].caseNo.indexOf(caseNo) !== -1) return i;
    }
    return -1;
  }
  function drawPress() {
    el('case-press-count').textContent = press.length;
    el('case-press-list').innerHTML = press.map(function (item, i) {
      var linked = linkedIndex(item.link) !== -1;
      return '<li class="case-press-row">'
        + '<button type="button" class="case-press-btn" data-press="' + i + '">'
        +   '<span class="case-press-copy">'
        +     '<span class="case-press-title">' + esc(item.title) + '</span>'
        +     '<span class="case-press-meta">기사일 ' + esc(item.date)
        +       (item.kind ? ' · ' + esc(item.kind) : '')
        +       (linked ? ' · 판례노트 있음' : '') + '</span>'
        +   '</span>'
        +   '<svg class="ic-svg case-row-go" width="16" height="16" aria-hidden="true"><use href="#i-chevron-right"/></svg>'
        + '</button>'
        + '</li>';
    }).join('');
  }

  var pressModal = el('press-modal');
  var pressSheet = pressModal.querySelector('.press-sheet');
  var pressFocus = null;

  function pressHTML(item) {
    var index = linkedIndex(item.link);
    var linked = index === -1 ? null : data[index];
    var origin = item.url
      ? '<a class="cs-btn primary" href="' + esc(item.url) + '" target="_blank" rel="noopener">'
        + '기사 원문 보기<svg class="ic-svg" width="15" height="15" aria-hidden="true"><use href="#i-arrow-up-right"/></svg></a>'
      : '<span class="cs-btn is-off">기사 원문 링크 연결 전</span>';
    var note = linked
      ? '<button type="button" class="pr-linked" data-press-case="' + index + '">'
        + '<span class="pr-linked-art">' + slideHTML(linked, 0) + '</span>'
        + '<span class="pr-linked-copy">'
        +   '<span class="pr-linked-tag">이 사건의 판례노트</span>'
        +   '<span class="pr-linked-title">' + esc(linked.question) + '</span>'
        +   '<span class="pr-linked-meta">' + esc(citation(linked)) + '</span>'
        + '</span>'
        + '<svg class="ic-svg case-row-go" width="16" height="16" aria-hidden="true"><use href="#i-chevron-right"/></svg>'
        + '</button>'
      : '';
    function fact(label, value) {
      return value ? '<div><dt>' + esc(label) + '</dt><dd>' + esc(value) + '</dd></div>' : '';
    }
    var facts = fact('게시일', item.date) + fact('발표일', item.announced)
      + fact('시행일', item.effective) + fact('상태', item.status);
    return '<p class="pr-eyebrow">판례 관련 보도 · ' + esc(item.date) + '</p>'
      + '<h2 class="pr-title" id="press-title">' + esc(item.title) + '</h2>'
      + (item.kind ? '<p class="pr-kind">' + esc(item.kind) + '</p>' : '')
      + (item.summary ? '<p class="pr-sum">' + esc(item.summary) + '</p>' : '')
      + (facts ? '<dl class="pr-facts">' + facts + '</dl>' : '')
      + note
      + '<div class="pr-acts">' + origin + '</div>'
      + '<p class="pr-foot">판결문을 정리한 판례노트가 아니라 기사 보도입니다. 상담에 쓰기 전에 원문과 약관을 확인하세요.</p>';
  }
  function openPress(i) {
    var item = press[i];
    if (!item) return;
    pressFocus = document.activeElement;
    el('press-body').innerHTML = pressHTML(item);
    pressModal.hidden = false;
    document.body.style.overflow = 'hidden';
    pressSheet.focus();
  }
  function closePress() {
    if (pressModal.hidden) return;
    pressModal.hidden = true;
    el('press-body').innerHTML = '';
    if (modal.hidden) document.body.style.overflow = '';
    if (pressFocus && pressFocus.focus) pressFocus.focus();
  }

  /* ===== 묶기 ===== */
  (function fillKind() {
    var select = el('case-kind');
    Array.from(new Set(data.map(function (item) { return item.kind; })))
      .sort(function (a, b) { return a.localeCompare(b, 'ko'); })
      .forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
  })();
  el('case-total').textContent = data.length;
  el('case-note-total').textContent = data.filter(function (item) { return !!item.card; }).length;
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
  el('cn-rail').addEventListener('click', function (event) {
    var button = event.target.closest('[data-open-card]');
    if (button) openDetail(parseInt(button.dataset.openCard, 10), true, 'card');
  });
  function railStep(direction) {
    var rail = el('cn-rail');
    var card = rail.querySelector('.cn-card');
    var step = card ? card.getBoundingClientRect().width + 16 : 220;
    rail.scrollBy({ left: direction * step * 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  el('cn-prev').addEventListener('click', function () { railStep(-1); });
  el('cn-next').addEventListener('click', function () { railStep(1); });

  /* 마우스로 끌어서 좌우 이동 — 손가락은 브라우저 기본 스크롤을 쓴다 */
  (function dragScroll(track) {
    var dragging = false, moved = false, startX = 0, startLeft = 0;
    track.addEventListener('pointerdown', function (event) {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      dragging = true; moved = false;
      startX = event.clientX; startLeft = track.scrollLeft;
    });
    track.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      var dx = event.clientX - startX;
      /* 4px 넘게 움직인 뒤에야 끌기로 보고 포인터를 잡는다.
         누르자마자 잡으면 클릭이 카드가 아니라 트랙으로 가서 카드가 열리지 않는다 */
      if (!moved) {
        if (Math.abs(dx) <= 4) return;
        moved = true;
        track.classList.add('is-dragging');
        try { track.setPointerCapture(event.pointerId); } catch (error) {}
      }
      track.scrollLeft = startLeft - dx;
    });
    function stop(event) {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      try { track.releasePointerCapture(event.pointerId); } catch (error) {}
    }
    track.addEventListener('pointerup', stop);
    track.addEventListener('pointercancel', stop);
    track.addEventListener('dragstart', function (event) { event.preventDefault(); });
    /* 끌고 난 뒤의 클릭은 카드 열기로 이어지지 않게 막는다 */
    track.addEventListener('click', function (event) {
      if (!moved) return;
      moved = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  })(el('cn-rail'));

  modalBody.addEventListener('click', function (event) {
    var tab = event.target.closest('[data-tab]');
    if (tab) { view.tab = tab.dataset.tab; view.slide = 0; render(false); return; }
    var go = event.target.closest('[data-go]');
    if (go) { view.slide = parseInt(go.dataset.go, 10); render(true); return; }
    var move = event.target.closest('[data-move]');
    if (move && !move.disabled) { moveSlide(parseInt(move.dataset.move, 10)); return; }
    if (event.target.closest('[data-save-one]')) { saveOne(); return; }
    if (event.target.closest('[data-save-all]')) { saveAll(); return; }
    if (event.target.closest('[data-share]')) shareCase();
  });
  modal.addEventListener('mousedown', function (event) {
    if (!modalSheet.contains(event.target)) requestClose();
  });
  el('case-modal-close').addEventListener('click', requestClose);

  el('case-press-list').addEventListener('click', function (event) {
    var button = event.target.closest('[data-press]');
    if (button) openPress(parseInt(button.dataset.press, 10));
  });
  el('press-body').addEventListener('click', function (event) {
    var jump = event.target.closest('[data-press-case]');
    if (!jump) return;
    var index = parseInt(jump.dataset.pressCase, 10);
    closePress();
    openDetail(index);
  });
  pressModal.addEventListener('mousedown', function (event) {
    if (!pressSheet.contains(event.target)) closePress();
  });
  el('press-close').addEventListener('click', closePress);

  document.addEventListener('keydown', function (event) {
    if (!pressModal.hidden) {
      if (event.key === 'Escape') closePress();
      return;
    }
    if (modal.hidden) return;
    if (event.key === 'Escape') { requestClose(); return; }
    if (view.tab !== 'card') return;
    if (event.key === 'ArrowLeft') moveSlide(-1);
    if (event.key === 'ArrowRight') moveSlide(1);
  });
  window.addEventListener('popstate', function (event) {
    var index = event.state && event.state.caseNote;
    if (typeof index === 'number') openDetail(index, false); else closeDetail();
  });

  var startIndex = parseInt(new URLSearchParams(location.search).get('case'), 10);
  if (!isNaN(startIndex)) openDetail(startIndex, false);
})();
