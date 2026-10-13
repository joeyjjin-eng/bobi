/* ============================================================
   보험금청구 · 사용 튜토리얼 (코치마크)

   - new.html 최초 진입 시 1회 자동 실행 · 상단 "사용법 보기"로 재실행
   - 투어가 알아서 5단계를 넘기며 각 단계의 핵심을 한 줄씩만 짚는다.
   - 보험사 고르기 · 불러오기 · 고객 선택 세 군데만 직접 눌러보게 하고
     (미리 선택/입력돼 있던 값은 그 직전에 비워서 채워지는 과정이 보이게 한다)
     나머지는 "다음"으로 넘긴다. 타이핑은 시키지 않는다.
   - 마지막 전송으로 생기는 연습용 청구건은 종료 시 되돌려 놓는다.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'bobi.claim.tour.v1';
  var CLAIM_STORE = 'bobi-claims-extra';

  /* ===== 공통 유틸 ===== */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function vis(el) { return !!(el && !el.hidden && (el.offsetWidth || el.offsetHeight)); }
  function tap(el) { if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); }
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
  function baseUrl() { return location.href.split('#')[0].split('?')[0]; }

  function paneOn(n) { return vis($('#pane-' + n)); }
  function insuredCard() { return $('#person-cards .p-card.hi') || $('#person-cards .p-card'); }
  function guardianCard() { var b = $('#person-cards [data-load="guardian"]'); return b ? b.closest('.p-card') : null; }

  var PANES = ['1', '2', '3', '4', '5', '6', 'done'];
  function paneIdx() { for (var i = 0; i < PANES.length; i++) if (paneOn(PANES[i])) return i; return -1; }

  /* 목표 화면까지 마법사의 "다음" / "이전"을 눌러 이동한다 (앞·뒤 모두).
     마법사는 화면을 바꾸면서 top 으로 부드럽게 스크롤하는데 그게 끝나길 기다리면
     가이드가 배경보다 늦어지므로, 즉시 스크롤로 덮어써서 애니메이션을 끊는다.
     1단계에서 "이전"은 청구목록으로 나가버리므로 절대 누르지 않는다. */
  function toPane(n) {
    return function (done) {
      var target = PANES.indexOf(String(n));
      var guard = 0;
      (function step() {
        var cur = paneIdx();
        if (cur === target || cur < 0 || guard++ > 10) {
          if (guard > 0) window.scrollTo(0, 0);
          setTimeout(done, guard > 0 ? 50 : 0);
          return;
        }
        touched = true;
        if (cur < target) tap($('#btn-next'));
        else if (cur > 0) tap($('#btn-prev'));
        else { done(); return; }
        setTimeout(step, 40);
      })();
    };
  }

  function setMinor(on) {
    return function (done) {
      var b = $('#btn-minor');
      if (b && b.classList.contains('on') !== on) { touched = true; tap(b); setTimeout(done, 90); return; }
      done();
    };
  }
  function closeLoadModal(done) {
    if (vis($('#load-modal'))) { tap($('#load-close')); setTimeout(done, 140); return; }
    done();
  }

  /* 같은 버튼을 조건이 없어질 때까지 반복해서 누른다 (선택 해제 · 초기화용) */
  function repeatTap(find, done, limit) {
    var guard = 0, max = limit || 20;
    (function step() {
      var el = find();
      if (el && guard++ < max) { touched = true; tap(el); setTimeout(step, 35); return; }
      done();
    })();
  }

  /* 미리 선택돼 있던 보험사를 모두 해제 — 직접 고르는 과정을 보여주기 위해 */
  function clearInsurers(done) {
    repeatTap(function () { return $('#pane-1 .insurer-btn.on'); }, done, 30);
  }

  /* 피보험자 카드를 비움 — 불러오기로 채워지는 과정을 보여주기 위해 */
  function clearInsured(done) {
    closeLoadModal(function () {
      repeatTap(function () { return $('#person-cards [data-clear="insured"]'); }, done, 3);
    });
  }

  /* 첨부 사진을 모두 제거 — "+ 추가"로 올리는 과정을 보여주기 위해 */
  function clearPhotos(done) {
    repeatTap(function () { return $('#photo-grid .photo-remove'); }, done, 15);
  }

  /* 고객 불러오기 모달을 열어둔 상태로 (뒤로 돌아왔을 때도 같은 화면이 되도록) */
  function openLoadModal(done) {
    picked = false;
    if (vis($('#load-modal'))) { done(); return; }
    tap($('#person-cards .p-card.hi [data-load]') || $('#person-cards [data-load]'));
    setTimeout(done, 160);
  }

  /* 고객 목록에서 이름으로 행 찾기 */
  function loadRow(name) {
    var rows = $$('#load-body .load-row');
    for (var i = 0; i < rows.length; i++) if (rows[i].textContent.indexOf(name) >= 0) return rows[i];
    return rows[0] || null;
  }

  /* 고객 목록에서 실제로 한 명을 골랐는지 추적 */
  var picked = false;
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#load-body .load-row')) picked = true;
  }, true);

  /* ===== 연습용 청구건 되돌리기 =====
     마지막 "서명 링크 전송"이 localStorage 에 청구건을 쌓으므로,
     전송 전 상태를 저장해 두었다가 투어가 끝나면 원래대로 돌려놓는다. */
  var storeSnapshot = null, storeTaken = false;
  function snapshotStore() {
    if (storeTaken) return;
    storeTaken = true;
    try { storeSnapshot = localStorage.getItem(CLAIM_STORE); } catch (e) { storeSnapshot = null; }
  }
  function restoreStore() {
    if (!storeTaken) return;
    try {
      if (storeSnapshot === null) localStorage.removeItem(CLAIM_STORE);
      else localStorage.setItem(CLAIM_STORE, storeSnapshot);
    } catch (e) {}
    storeTaken = false; storeSnapshot = null;
  }

  /* ===== 단계 — 한 단계에 한 줄 =====
     pane 은 그 단계가 서 있어야 할 마법사 화면. 앞으로 가든 뒤로 가든
     이 화면으로 먼저 맞춘 다음 before 를 실행한다. */
  var STEPS = [
    { pane: 1, anchor: '#step-dots',
      desc: '청구서 입력은 이 <span class="k">5단계</span>입니다.' },

    { pane: 1, anchor: '#pane-1 .insurer-btn[data-ins="현대해상"]', before: clearInsurers,
      desc: '청구할 보험사를 고릅니다. 여기서는 <span class="k">현대해상</span>으로 해볼게요.',
      done: function () { return !!$('#pane-1 .insurer-btn.on[data-ins="현대해상"]'); },
      auto: function () { tap($('#pane-1 .insurer-btn[data-ins="현대해상"]')); } },

    { pane: 2, anchor: function () { return [$('#person-cards .p-card.hi [data-load]') || $('#person-cards [data-load]')]; },
      before: clearInsured,
      desc: '인적사항은 직접 입력해도 되고, <span class="k">불러오기</span>로 내 고객에서 가져와도 됩니다.',
      done: function () { return vis($('#load-modal')); },
      auto: function () { tap($('#person-cards .p-card.hi [data-load]') || $('#person-cards [data-load]')); } },

    { pane: 2, anchor: function () { return [loadRow('홍길동')]; }, before: openLoadModal,
      desc: '내 고객 목록입니다. 여기서는 <span class="k">홍길동</span>으로 해볼게요.',
      done: function () { return picked && !vis($('#load-modal')); },
      auto: function () { picked = true; tap(loadRow('홍길동')); } },

    { pane: 2, anchor: '#person-cards .p-card.hi .rrn-row', before: closeLoadModal,
      desc: '이름 · 연락처와 주민번호 <span class="k">앞 7자리</span>가 채워집니다. 뒷자리는 저장되지 않아 직접 입력합니다.' },

    { pane: 2, anchor: '#person-cards .same-row',
      desc: '계약자 · 수익자가 피보험자와 같으면 <span class="k">피보험자와 같음</span>만 누르면 됩니다.' },

    { pane: 2, anchor: '#btn-minor', before: setMinor(false),
      desc: '피보험자가 <span class="k">미성년자</span>면 여기를 체크합니다.',
      done: function () { return !!guardianCard(); },
      auto: function () { tap($('#btn-minor')); } },

    { pane: 2, anchor: function () { var c = guardianCard(); return c ? [c] : []; }, before: setMinor(true),
      desc: '<span class="k">법정대리인</span> 칸이 생겼습니다. 피보험자 대신 법정대리인이 서명합니다.' },

    { pane: 3, anchor: '#pane-3 .acct-card', before: setMinor(false),
      desc: '보험금 받을 계좌입니다. <span class="k">은행명 · 계좌번호 · 예금주명</span>을 직접 입력합니다.' },

    { pane: 4, anchor: ['#type-grid', '#incident-card'],
      desc: '<span class="k">질병 · 상해</span>에 따라 입력 항목이 달라집니다.' },

    { pane: 5, anchor: '#photo-grid', before: clearPhotos,
      desc: '첨부한 서류가 없습니다. <span class="k">+ 추가</span>로 한 장 올려볼게요. 최대 10장까지 됩니다.',
      done: function () { return !!$('#photo-grid .photo-remove'); },
      auto: function () { tap($('#btn-add-photo')); } },

    { pane: 6, anchor: ['#review-persons', '#review-incident', '#review-account'],
      desc: '전송 전 미리보기에서 <span class="k">미입력</span> 항목을 확인합니다.' },

    { pane: 6, anchor: '#signer-list',
      desc: '서명 링크는 피보험자와 수익자에게 발송됩니다. 동일인이면 <span class="k">한 번만</span>, 피보험자가 미성년자면 <span class="k">법정대리인</span>에게 갑니다.' },

    { pane: 'done', anchor: '#pane-done .success-wrap', last: true,
      desc: '고객이 서명을 완료하면 청구가 <span class="k">접수</span>됩니다.' }
  ];

  /* ===== DOM ===== */
  var root, spot, tip, tail, shades = [];
  var idx = -1, busy = false, active = false, touched = false, advancing = false;
  var tickId = null;

  function build() {
    root = document.createElement('div');
    root.className = 'ct-root';
    root.hidden = true;
    root.innerHTML =
      '<div class="ct-shade"></div><div class="ct-shade"></div>' +
      '<div class="ct-shade"></div><div class="ct-shade"></div>' +
      '<div class="ct-spot"></div>' +
      '<div class="ct-lock"></div>' +
      '<div class="ct-tail"></div>' +
      '<div class="ct-tip" role="dialog" aria-live="polite"></div>' +
      '<button class="ct-close" type="button" data-ct="skip" aria-label="튜토리얼 닫기">' +
        '<svg class="ic-svg" width="18" height="18"><use href="#i-x"/></svg>' +
      '</button>';
    document.body.appendChild(root);
    shades = $$('.ct-shade', root);
    spot = $('.ct-spot', root); tip = $('.ct-tip', root); tail = $('.ct-tail', root);

    root.addEventListener('click', onAction);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    document.addEventListener('keydown', function (e) {
      if (!active || e.key !== 'Escape') return;
      e.stopPropagation(); e.preventDefault();
      close();
    }, true);
  }

  function onAction(e) {
    var btn = e.target.closest('[data-ct]');
    if (!btn) {
      /* 가림막을 눌렀으면 "여기" 링을 한 번 더 강조 */
      if (e.target.closest('.ct-shade') && root.classList.contains('is-do')) {
        root.classList.remove('is-do'); void root.offsetWidth; root.classList.add('is-do');
      }
      return;
    }
    var act = btn.getAttribute('data-ct');
    if (act === 'skip') { close(); return; }
    if (busy || advancing) return;
    if (act === 'prev') { advance(-1); return; }
    if (act === 'next') {
      var s = STEPS[idx];
      /* 직접 눌러야 하는 단계인데 아직 안 눌렀으면, 투어가 대신 수행하고 넘어간다 */
      if (s && s.done && !s.done()) s.auto();
      advance(1);
    }
  }

  /* ===== 렌더 ===== */
  function renderTip() {
    var s = STEPS[idx];
    /* 완료 화면에서는 마법사를 되돌릴 수 없으므로 "이전"을 숨긴다 */
    var canBack = idx > 0 && !s.last;
    tip.innerHTML = '<p class="ct-desc">' + s.desc + '</p>'
      + '<div class="ct-foot">'
      +   (canBack ? '<button class="ct-prev" type="button" data-ct="prev">이전</button>' : '')
      +   '<button class="ct-next" type="button" data-ct="next">' + (s.last ? '완료' : '다음') + '</button>'
      +   '<span class="ct-count"><b>' + (idx + 1) + '</b> / ' + STEPS.length + '</span>'
      + '</div>';
    root.classList.toggle('is-do', !!s.done);
  }

  /* ===== 위치 ===== */
  function anchorEls() {
    var s = STEPS[idx];
    if (!s) return [];
    var raw = typeof s.anchor === 'function' ? s.anchor() : [].concat(s.anchor);
    var out = [];
    [].concat(raw).forEach(function (a) {
      var el = (typeof a === 'string') ? $(a) : a;
      if (vis(el)) out.push(el);
    });
    return out;
  }

  function unionRect(els) {
    var t = Infinity, l = Infinity, b = -Infinity, r = -Infinity;
    els.forEach(function (el) {
      var x = el.getBoundingClientRect();
      t = Math.min(t, x.top); l = Math.min(l, x.left);
      b = Math.max(b, x.bottom); r = Math.max(r, x.right);
    });
    return { top: t, left: l, bottom: b, right: r, width: r - l, height: b - t };
  }

  /* instant=true 면 즉시 스크롤 — 화면이 바뀐 직후에는 부드러운 스크롤을 기다리지 않는다 */
  function reveal(els, instant, done) {
    var r = unionRect(els);
    var vh = window.innerHeight;
    if (r.top >= 24 && r.bottom <= vh - 24) { done(); return; }
    try { els[0].scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: (r.height > vh - 220 ? 'start' : 'center'), inline: 'nearest' }); }
    catch (e) { els[0].scrollIntoView(); }
    setTimeout(done, instant ? 50 : 280);
  }

  function spotRect(els) {
    var r = unionRect(els);
    var pad = 8, vw = window.innerWidth, vh = window.innerHeight;
    var top = r.top - pad, left = r.left - pad, w = r.width + pad * 2, h = r.height + pad * 2;
    if (top < 16) { h += top - 16; top = 16; }
    if (top + h > vh - 16) h = vh - 16 - top;
    if (left < 8) { w += left - 8; left = 8; }
    if (left + w > vw - 8) w = vw - 8 - left;
    return { top: top, left: left, w: Math.max(w, 24), h: Math.max(h, 24) };
  }

  /* 가림막 4장 — 구멍 둘레만 덮어 스포트라이트가 또렷하게 보이게 */
  function placeShades(r) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var boxes = [
      { left: 0, top: 0, width: vw, height: Math.max(r.top, 0) },
      { left: 0, top: r.top + r.h, width: vw, height: Math.max(vh - (r.top + r.h), 0) },
      { left: 0, top: r.top, width: Math.max(r.left, 0), height: r.h },
      { left: r.left + r.w, top: r.top, width: Math.max(vw - (r.left + r.w), 0), height: r.h }
    ];
    shades.forEach(function (el, i) {
      var b = boxes[i];
      el.style.left = Math.round(b.left) + 'px';
      el.style.top = Math.round(b.top) + 'px';
      el.style.width = Math.round(b.width) + 'px';
      el.style.height = Math.round(b.height) + 'px';
    });
  }

  function placeTip(r) {
    tip.style.visibility = 'hidden';
    tip.style.left = '0px'; tip.style.top = '0px';
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var vw = window.innerWidth, vh = window.innerHeight, gap = 20, m = 16;
    var side;
    if (r.top - gap - th >= m) side = 'top';
    else if (r.top + r.h + gap + th <= vh - m) side = 'bottom';
    else if (r.left + r.w + gap + tw <= vw - m) side = 'right';
    else if (r.left - gap - tw >= m) side = 'left';
    else side = 'bottom';

    var l, t;
    if (side === 'top' || side === 'bottom') {
      t = side === 'bottom' ? r.top + r.h + gap : r.top - gap - th;
      l = r.left + r.w / 2 - tw / 2;
    } else {
      l = side === 'right' ? r.left + r.w + gap : r.left - gap - tw;
      t = r.top + r.h / 2 - th / 2;
    }
    l = clamp(l, m, Math.max(m, vw - tw - m));
    t = clamp(t, m, Math.max(m, vh - th - m));
    tip.style.left = Math.round(l) + 'px';
    tip.style.top = Math.round(t) + 'px';
    tip.style.visibility = '';

    var ax, ay;
    if (side === 'top' || side === 'bottom') {
      ay = side === 'bottom' ? t - 8 : t + th - 10;
      ax = clamp(r.left + r.w / 2 - 9, l + 22, l + tw - 31);
    } else {
      ax = side === 'right' ? l - 8 : l + tw - 10;
      ay = clamp(r.top + r.h / 2 - 9, t + 22, t + th - 31);
    }
    tail.hidden = false;
    tail.style.left = Math.round(ax) + 'px';
    tail.style.top = Math.round(ay) + 'px';
  }

  function reposition() {
    if (!active) return;
    var els = anchorEls();
    if (!els.length) return;
    var r = spotRect(els);
    spot.style.left = Math.round(r.left) + 'px';
    spot.style.top = Math.round(r.top) + 'px';
    spot.style.width = Math.round(r.w) + 'px';
    spot.style.height = Math.round(r.h) + 'px';
    placeShades(r);
    placeTip(r);
  }

  /* ===== 진행 ===== */
  function stopTick() { if (tickId) { clearInterval(tickId); tickId = null; } }
  function startTick() {
    stopTick();
    tickId = setInterval(function () {
      if (!active) { stopTick(); return; }
      reposition();
      var s = STEPS[idx];
      if (s && s.done && s.done()) advance(1);
    }, 200);
  }

  /* 다음 단계를 준비하는 동안 화면을 잠가, 같은 버튼을 또 눌러
     선택이 토글로 해제되는 일을 막는다. */
  function advance(dir) {
    if (advancing) return;
    advancing = true; touched = true;
    stopTick();
    root.classList.remove('is-do');
    root.classList.add('is-locked');
    $$('[data-ct="next"], [data-ct="prev"]', tip).forEach(function (b) { b.disabled = true; });
    setTimeout(function () { advancing = false; go(idx + (dir || 1)); }, 110);
  }

  /* 단계 이동 순서
       ① 말풍선을 먼저 숨긴다 (옛 위치에 새 문구가 떠 있는 어색함 제거)
       ② 그 단계의 마법사 화면으로 맞춘다 — 앞으로든 뒤로든 동일
          (즉시 스크롤로 마법사의 부드러운 스크롤을 끊어 배경과 속도를 맞춘다)
       ③ before 로 그 단계에 필요한 상태를 만들고
       ④ 스포트라이트·말풍선을 배치한 뒤 말풍선만 제자리에서 나타나게 한다
     스포트라이트는 위치 전환이 없어 항상 대상에 붙어 있는다. */
  function go(i) {
    if (i >= STEPS.length) { close(); return; }
    stopTick();
    idx = Math.max(i, 0);
    var s = STEPS[idx];
    var jump = !paneOn(s.pane);     /* 화면이 바뀌는 단계 */
    busy = true;
    root.classList.remove('is-locked');
    root.classList.add('is-moving');
    $$('[data-ct="next"], [data-ct="prev"]', tip).forEach(function (b) { b.disabled = true; });
    toPane(s.pane)(function () {
      (s.before || function (d) { d(); })(function () {
        busy = false;
        renderTip();
        var els = anchorEls();
        if (!els.length) { go(idx + 1); return; }
        reveal(els, jump, function () {
          reposition();
          setTimeout(function () {
            root.classList.remove('is-moving');
            startTick();
          }, 30);
        });
      });
    });
  }

  /* ===== 시작 · 종료 ===== */
  function start() {
    if (!root) build();
    active = true; touched = false; advancing = false; picked = false;
    snapshotStore();        /* 마지막 전송으로 생길 연습용 청구건을 되돌리기 위해 미리 저장 */
    root.hidden = false;
    go(0);
  }

  function markSeen() { try { localStorage.setItem(KEY, '1'); } catch (e) {} }

  /* 닫기 — 연습용 청구건을 되돌리고, 투어가 화면을 넘겨놨으면 1단계부터 다시 */
  function close() {
    markSeen();
    active = false;
    stopTick();
    restoreStore();
    if (root) root.hidden = true;
    if (touched) location.replace(baseUrl());
  }

  function replay() {
    if (!paneOn(1)) { location.replace(baseUrl() + '?tour=1'); return; }
    start();
  }

  /* 모바일(≤960px)에서는 타이틀 줄(.nr-title-row)이 숨겨지므로
     "사용법 보기" 버튼을 모바일 상단바의 우측 스페이서 자리로 옮긴다. */
  function placeReplay(btn, home) {
    if (!btn || !home.parent) return;
    var mobile = !!(window.matchMedia && window.matchMedia('(max-width: 960px)').matches);
    var bar = $('.m-topbar');
    if (mobile && bar) {
      if (btn.parentElement !== bar) bar.appendChild(btn);
      bar.classList.add('has-tour');
    } else {
      if (btn.parentElement !== home.parent) home.parent.insertBefore(btn, home.next);
      if (bar) bar.classList.remove('has-tour');
    }
  }

  /* ===== 부트 ===== */
  function boot() {
    var btn = $('#tourReplay');
    if (btn) {
      btn.addEventListener('click', replay);
      var home = { parent: btn.parentElement, next: btn.nextSibling };
      placeReplay(btn, home);
      window.addEventListener('resize', function () { placeReplay(btn, home); });
    }

    if (/[?&]tour=1/.test(location.search)) {
      try { history.replaceState(null, '', baseUrl()); } catch (e) {}
      setTimeout(start, 280);
      return;
    }
    var seen = true;
    try { seen = !!localStorage.getItem(KEY); } catch (e) { seen = true; }
    if (!seen) setTimeout(start, 540);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.claimTour = { start: replay, reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} } };
})();
