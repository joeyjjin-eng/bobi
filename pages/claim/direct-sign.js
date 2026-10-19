/* ============================================================
   직접 서명 모달 — new.html(Step 6) · detail.html(서명 현황) 공용
   ------------------------------------------------------------
   window.DirectSign.open({
     signers: [{ roles:['피보험자','수익자'], name:'정하윤' }, ...],
     queue:   [0, 1],          // 이번에 서명받을 signers 인덱스 (순서대로)
     title:   '직접 서명',      // 모달 제목 (생략 가능)
     onComplete: function (doneIdx, at) {}   // 큐를 모두 끝냈을 때
   });
   큐 중간에 닫으면 onComplete 는 호출하지 않는다 (서명은 전부 받아야 유효).
   ============================================================ */
(function () {
  var modal = null;
  var ctx = null;
  var state = { signers: [], queue: [], pos: 0, consent: false, strokes: false, onComplete: null };

  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  function stamp() {
    var d = new Date();
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate())
      + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function build() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'ds-modal';
    modal.id = 'ds-modal';
    modal.hidden = true;
    modal.innerHTML = ''
      + '<div class="ds-card" role="dialog" aria-modal="true" aria-labelledby="ds-title">'
      +   '<div class="ds-head">'
      +     '<div class="ds-head-l">'
      +       '<h3 id="ds-title">직접 서명</h3>'
      +     '</div>'
      +     '<span class="ds-step" id="ds-step" hidden>-</span>'
      +     '<button class="ds-x" type="button" id="ds-close" aria-label="닫기">'
      +       '<svg class="ic-svg" width="18" height="18"><use href="#i-x"/></svg>'
      +     '</button>'
      +   '</div>'
      +   '<div class="ds-body">'
      +     '<div class="ds-who" id="ds-who"></div>'
      +     '<div class="ds-caution">'
      +       '<div class="ds-caution-h">※ 서명 시 주의사항</div>'
      +       '<ul class="ds-caution-l">'
      +         '<li>본 서명은 반드시 청구인 본인이 내용을 확인한 후 직접 진행해야 합니다.</li>'
      +         '<li>보험설계사 및 대리인을 포함한 제3자의 대신 서명은 엄격히 금지됩니다.</li>'
      +       '</ul>'
      +       '<p class="ds-caution-p">타인이 서명을 대신하거나 본인의 동의 없이 서명이 이루어진 경우, 이로 인해 발생하는 보험금 청구 거절, 분쟁 및 법적 책임은 해당 행위자에게 있으며, 당사의 귀책사유가 없는 한 당사는 이에 대한 책임을 부담하지 않습니다.</p>'
      +     '</div>'
      +     '<button class="ds-consent" type="button" id="ds-consent">'
      +       '<span class="ds-consent-box">'
      +         '<svg class="ic-svg" width="12" height="12" style="stroke-width:2.6"><use href="#i-check"/></svg>'
      +       '</span>'
      +       '<span class="ds-consent-label">본인은 서명 내용을 확인하였으며, 타인의 대리 서명 없이 직접 서명합니다.</span>'
      +     '</button>'
      +     '<div class="ds-pad" id="ds-pad">'
      +       '<canvas id="ds-canvas"></canvas>'
      +       '<div class="ds-pad-line"></div>'
      +       '<div class="ds-pad-rlabel">서명란</div>'
      +       '<div class="ds-pad-ph">여기에 서명</div>'
      +     '</div>'
      +     '<div class="ds-pad-actions">'
      +       '<button class="ds-clear" type="button" id="ds-clear">'
      +         '<svg class="ic-svg" width="14" height="14"><use href="#i-rotate-ccw"/></svg>'
      +         '다시 쓰기'
      +       '</button>'
      +     '</div>'
      +   '</div>'
      +   '<div class="ds-foot">'
      +     '<div class="ds-foot-btns">'
      +       '<button class="ds-btn-ghost" type="button" id="ds-cancel">취소</button>'
      +       '<button class="ds-btn-main" type="button" id="ds-ok" disabled>서명 완료</button>'
      +     '</div>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(modal);

    var canvas = modal.querySelector('#ds-canvas');
    ctx = canvas.getContext('2d');

    modal.querySelector('#ds-close').addEventListener('click', close);
    modal.querySelector('#ds-cancel').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) {
      if (!modal.hidden && e.key === 'Escape') close();
    });

    modal.querySelector('#ds-consent').addEventListener('click', function () {
      state.consent = !state.consent;
      paint();
    });
    modal.querySelector('#ds-clear').addEventListener('click', clearPad);
    modal.querySelector('#ds-ok').addEventListener('click', next);

    // ----- 서명 캔버스 -----
    var drawing = false;
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      var t = e.touches && e.touches[0];
      return { x: (t ? t.clientX : e.clientX) - r.left, y: (t ? t.clientY : e.clientY) - r.top };
    }
    function start(e) {
      e.preventDefault();
      drawing = true;
      var p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }
    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      var p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      if (!state.strokes) {
        state.strokes = true;
        modal.querySelector('#ds-pad').classList.add('filled');
        paint();
      }
    }
    function end(e) { if (e && e.preventDefault) e.preventDefault(); drawing = false; }
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
    window.addEventListener('resize', function () { if (!modal.hidden) resizePad(); });
  }

  function resizePad() {
    var canvas = modal.querySelector('#ds-canvas');
    var r = canvas.getBoundingClientRect();
    if (!r.width) return;
    var dpr = window.devicePixelRatio || 1;
    var data = state.strokes ? canvas.toDataURL() : null;
    canvas.width = r.width * dprSafe(dpr);
    canvas.height = r.height * dprSafe(dpr);
    ctx.setTransform(dprSafe(dpr), 0, 0, dprSafe(dpr), 0, 0);
    ctx.strokeStyle = '#0E1A24';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (data) {
      var img = new Image();
      img.onload = function () { ctx.drawImage(img, 0, 0, r.width, r.height); };
      img.src = data;
    }
  }
  function dprSafe(d) { return d && d > 0 ? d : 1; }

  function clearPad() {
    var canvas = modal.querySelector('#ds-canvas');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.strokes = false;
    modal.querySelector('#ds-pad').classList.remove('filled');
    paint();
  }

  function paint() {
    var total = state.queue.length;
    var idx = state.queue[state.pos];
    var s = state.signers[idx] || { roles: [], name: '-' };
    var last = state.pos === total - 1;

    modal.querySelector('#ds-who').innerHTML = ''
      + '<span class="ds-who-roles">'
      +   '<span class="ds-who-role">' + escapeHTML((s.roles || []).join(' · ')) + '</span>'
      + '</span>'
      + '<span class="ds-who-name">' + escapeHTML(s.name || '-') + '</span>';

    var step = modal.querySelector('#ds-step');
    step.hidden = total < 2;
    step.textContent = (state.pos + 1) + ' / ' + total + '번째 서명';

    modal.querySelector('#ds-consent').classList.toggle('on', state.consent);

    var btn = modal.querySelector('#ds-ok');
    btn.disabled = !(state.consent && state.strokes);
    btn.textContent = last ? '서명 완료' : '다음 서명으로';
  }

  function next() {
    if (!(state.consent && state.strokes)) return;
    if (state.pos < state.queue.length - 1) {
      state.pos += 1;
      state.consent = false;
      clearPad();
      paint();
      modal.querySelector('.ds-body').scrollTop = 0;
      return;
    }
    var done = state.queue.slice();
    var cb = state.onComplete;
    var at = stamp();
    hide();
    if (cb) cb(done, at);
  }

  function hide() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }
  function close() { if (modal && !modal.hidden) hide(); }

  window.DirectSign = {
    open: function (opts) {
      build();
      state.signers = opts.signers || [];
      state.queue = (opts.queue && opts.queue.length) ? opts.queue.slice() : state.signers.map(function (_, i) { return i; });
      state.pos = 0;
      state.consent = false;
      state.strokes = false;
      state.onComplete = opts.onComplete || null;
      modal.querySelector('#ds-title').textContent = opts.title || '직접 서명';
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      modal.querySelector('#ds-pad').classList.remove('filled');
      resizePad();
      clearPad();
      paint();
    }
  };
})();
