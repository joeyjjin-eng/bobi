/* ============================================================
   째피티 · 사용 튜토리얼 (코치마크)

   - 최초 진입 시 1회 자동 실행 (localStorage 플래그)
   - 탭 우측 "사용법 보기" 버튼으로 언제든 재실행
   - 3단계 구성
       STEP 1 병력 입력         : 질병명 검색 → 목록에서 선택 → 기간 → 입원·수술
       STEP 2 인수 가능 상품 조회 : 결과 확인하기 → 결과 읽는 법 → 결과 저장
       STEP 3 조회 내역 확인      : 탭 이동 → 기간·검색 → 상세 열기 → 선택 삭제
   - 핵심 단계는 "직접 클릭" 방식.
     스포트라이트 구멍이 비어 있어 실제 요소를 그대로 누를 수 있고,
     사용자가 실제로 그 동작을 해야 다음 단계로 넘어간다.
     10초 동안 움직임이 없으면 "대신 해줄게요" 링크가 나타난다.
   - 모든 단계에서 "예상 가이드" 고지를 반복 노출한다.
   ============================================================ */
(function () {
  'use strict';

  var KEY   = 'bobi.jjaepity.tour.v1';
  var ENTRY = '.sm-form-card[data-entry-idx="0"]';
  var HELPER_DELAY = 10000;        /* 이 시간 동안 진전이 없으면 도움 링크 노출 */

  /* 데모로 대신 채워 넣을 샘플 병력 (페이지 데모 기준일 2026.07.09) */
  var DEMO = { q: '골절', name: 'S52 아래팔 골절', start: '2026.03.02' };

  /* 질병명이 "코드 + 이름" 형태로 선택됐는지 판별 (예: S52 아래팔 골절) */
  var PICKED = /^[A-Z]\d{2}\s/;

  /* ===== 공통 유틸 ===== */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function vis(el) { return !!(el && !el.hidden && (el.offsetWidth || el.offsetHeight)); }
  function fire(el, type) { el.dispatchEvent(new Event(type, { bubbles: true })); }
  function mouse(el, type) { el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true })); }
  function tap(el) { if (el) mouse(el, 'click'); }
  function setVal(el, v) { if (!el) return; el.value = v; fire(el, 'input'); }
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function baseUrl() { return location.href.split('#')[0].split('?')[0]; }

  function until(test, done, limit) {
    var end = Date.now() + (limit || 7000);
    (function poll() {
      if (test() || Date.now() > end) { done(); return; }
      setTimeout(poll, 90);
    })();
  }

  /* 한 글자씩 타이핑 — 검색 후보가 떠오르는 과정을 그대로 보여준다 */
  function typeInto(el, text, done) {
    if (!el) { done(); return; }
    el.focus();
    el.value = ''; fire(el, 'input');
    var i = 0;
    (function step() {
      if (i >= text.length) { setTimeout(done, 240); return; }
      el.value = text.slice(0, ++i);
      fire(el, 'input');
      setTimeout(step, 115);
    })();
  }

  /* ===== 페이지 요소 ===== */
  function entryEl(sel) { var c = $(ENTRY); return c ? $(sel, c) : null; }
  function diseaseInput() { return entryEl('.sm-disease'); }
  function diseaseVal() { var i = diseaseInput(); return i ? i.value.trim() : ''; }
  function sugBox() { return entryEl('.sm-sug'); }
  function startInput() { return entryEl('.sm-date-input[data-role="start"]'); }
  function openCal() { var c = entryEl('.sm-cal'); return vis(c) ? c : null; }

  function histRow() {
    var rows = $$('#histRows .sm-tr');
    for (var i = 0; i < rows.length; i++) if ($('.sm-td-extra', rows[i])) return rows[i];
    return rows[0] || null;
  }
  function closeHistModal(done) {
    var m = $('#historyModal');
    if (m && !m.hidden) tap($('.sm-modal-close', m));
    setTimeout(done, 260);
  }
  function clearHistSelection() {
    $$('#histRows .hist-row-check').forEach(function (c) {
      if (c.checked) { c.checked = false; fire(c, 'change'); }
    });
  }

  /* 질병명 후보 목록이 닫혔으면 다시 띄운다 (선택 단계 유지용) */
  function keepSuggestions() {
    if (PICKED.test(diseaseVal())) return;
    if (vis(sugBox())) return;
    var inp = diseaseInput();
    if (!inp) return;
    if (!inp.value.trim()) inp.value = DEMO.q;
    inp.focus();
    fire(inp, 'input');
  }

  /* ===== 단계 정의 =====
     anchor : 스포트라이트 선택자 / 함수 / 배열(모두 감싸는 사각형)
     desc   : 말풍선 본문 (한두 줄로 짧게)
     note   : 보조 안내 박스
     do     : 직접 클릭 단계. { hint, done, auto, helper, keep, when, pending, pendingHint }
     before : 단계 진입 전 화면 준비 (done 호출 필수)
     noBack : 화면 상태가 바뀌어 되돌릴 수 없는 단계
  */
  var STEPS = [
    /* ---------- 인트로 ---------- */
    {
      card: true,
      mascot: '../../assets/img_jjapt_profile.png',
      kicker: 'BoBi Original AI · 사용 튜토리얼',
      title: '째피티, 3단계만 알면 끝이에요',
      sub: '고객 병력을 넣으면 가입 가능성이 있는 간편보험을 보비가 대신 찾아드려요.<br/>' +
           '<b>직접 눌러가며</b> 한 바퀴 돌아볼까요? (약 1분)',
      steps: [
        { t: '병력 입력', d: '질병명을 검색해 목록에서 고르고, 치료 기간·입원일·수술 여부를 넣어요.' },
        { t: '인수 가능 상품 조회', d: '결과 확인하기를 누르면 보험사별 인수 가능 / 예외질환 상품을 묶어서 보여줘요.' },
        { t: '조회 내역 확인', d: '저장한 결과는 조회 내역 탭에서 언제든 다시 열어볼 수 있어요.' }
      ],
      note: { type: 'warn', html: '째피티 결과는 <b>예상 가이드</b>예요. 보험사 내부 규정과 상세 진단코드에 따라 <b>실제 인수 심사 결과는 달라질 수 있어요.</b>' },
      hint: '나중에 탭 오른쪽 <b>사용법 보기</b>에서 다시 열 수 있어요.',
      ghost: '나중에 볼게요',
      primary: '직접 해보기'
    },

    /* ---------- STEP 1 · 병력 입력 ---------- */
    {
      ch: 1, anchor: '.sm-form',
      desc: '먼저 <span class="k">왼쪽 카드</span>에 고객 병력을 넣어요. 위에서 아래로 순서대로 채우면 돼요.'
    },
    {
      ch: 1, anchor: [ENTRY + ' .sm-field', ENTRY + ' .sm-sug'],
      desc: '<span class="k">질병명</span> 칸을 누르고 <span class="k">골절</span>이라고 입력해보세요. 전체 이름을 다 쓰지 않아도 돼요.',
      do: {
        hint: '질병명 칸에 직접 입력해보세요',
        helper: '대신 입력해줄게요',
        done: function () { return vis(sugBox()) || PICKED.test(diseaseVal()); },
        auto: function (cb) { typeInto(diseaseInput(), DEMO.q, cb); }
      }
    },
    {
      ch: 1, anchor: function () { return vis(sugBox()) ? [sugBox(), entryEl('.sm-field')] : [entryEl('.sm-field')]; },
      desc: '검색 결과에서 <span class="k">S52 아래팔 골절</span>을 눌러 골라주세요. 목록에서 골라야 <span class="k">질병코드</span>까지 함께 들어가요.',
      note: { type: 'warn', html: '이름이 비슷한 항목이 여러 개예요. <b>진단서에 적힌 코드와 같은 항목</b>을 골라야 결과가 정확해요.' },
      do: {
        hint: '목록에서 하나를 눌러주세요',
        helper: '대신 골라줄게요',
        keep: keepSuggestions,
        done: function () { return PICKED.test(diseaseVal()); },
        auto: function (cb) {
          var box = sugBox();
          var item = box && ($('.sm-sug-item[data-name="' + DEMO.name + '"]', box) || $('.sm-sug-item', box));
          if (item) mouse(item, 'mousedown');
          setTimeout(cb, 260);
        }
      }
    },
    {
      ch: 1, anchor: function () { var c = openCal(); return c ? [entryEl('.sm-dates'), c] : [entryEl('.sm-dates')]; },
      desc: '<span class="k">시작일</span> 칸을 누르면 달력이 열려요. 날짜를 하나 골라보세요. <span class="k">20260302</span>처럼 숫자 8자리를 바로 쳐도 돼요.',
      do: {
        hint: '달력에서 날짜를 골라보세요',
        helper: '대신 넣어줄게요',
        done: function () { var i = startInput(); return !!i && /^\d{4}\.\d{2}\.\d{2}$/.test(i.value); },
        auto: function (cb) { setVal(startInput(), DEMO.start); setTimeout(cb, 240); }
      }
    },
    {
      ch: 1, anchor: [ENTRY + ' .sm-dates', ENTRY + ' .sm-check-treat'],
      desc: '종료일도 같은 방법으로요. 아직 치료 중이면 <span class="k">치료 중</span>을 체크하세요. 종료일이 잠기고 <span class="k">오늘까지</span>로 계산돼요.',
      note: { type: 'tip', html: '<b>미래 날짜</b>나 <b>시작일보다 이른 종료일</b>은 선택되지 않고 자동으로 지워져요.' }
    },
    {
      ch: 1, anchor: ENTRY + ' .sm-two',
      desc: '<span class="k">입원일</span>은 치료 기간 안에서만 입력돼요. <span class="k">수술 여부</span>는 진단서 기준으로 골라주세요.',
      note: { type: 'warn', html: '<b>수술 · 시술 여부에 따라 인수 결과가 크게 갈려요.</b> (예: AIG손해보험)' }
    },
    {
      ch: 1, anchor: '#addEntryBtn',
      desc: '병력이 더 있으면 <span class="k">항목 추가</span>. 최대 <span class="k">5건</span>까지 넣을 수 있어요.',
      note: { type: 'warn', html: '여러 건을 넣으면 <b>모두 통과하는 상품만</b> 걸러줘요. 한 건이라도 빠지면 결과가 달라지니 한 번에 다 넣어주세요.' }
    },

    /* ---------- STEP 2 · 인수 가능 상품 조회 ---------- */
    {
      ch: 2, anchor: '#submitBtn',
      desc: '이제 <span class="k">결과 확인하기</span>를 눌러보세요. 보험사별 인수 조건을 대조하는 데 몇 초면 끝나요.',
      do: {
        hint: '버튼을 눌러보세요',
        helper: '대신 눌러줄게요',
        done: function () { return vis($('#pResults')); },
        pending: function () { return vis($('#pLoading')); },
        pendingHint: 'AI가 분석하고 있어요…',
        auto: function (cb) {
          tap($('#submitBtn'));
          until(function () { return vis($('#pResults')); }, function () { setTimeout(cb, 260); }, 9000);
        }
      }
    },
    {
      ch: 2, anchor: '.sm-insight', noBack: true,
      desc: '보비가 결과를 한 줄로 요약해줘요. 아래는 <span class="k">인수 가능</span>과 <span class="k">예외질환 인수 가능</span> 두 묶음으로 나뉘어요.'
    },
    {
      ch: 2, anchor: '.sm-result > .sm-insight-caveat',
      desc: '<span class="w">꼭 기억해주세요.</span> 째피티 결과는 보험사 공개 기준으로 계산한 <span class="w">예상치</span>예요.',
      note: { type: 'warn', html: '<b>실제 인수 여부는 보험사 심사 결과에 따라 달라질 수 있어요.</b> 고객에게는 "가능성"으로 안내하고, 확정은 청약 · 심사 이후에 말씀해주세요.', list: [
        '보험사 내부 규정이나 상세 진단코드에 따라 결과가 바뀔 수 있어요.',
        'AIG손해보험은 수술 / 시술 여부에 따라 인수 결과가 달라져요.',
        '현대해상은 2Q패스가 가능하면 전산 자동심사로 인수 가능해요.'
      ] }
    },
    {
      ch: 2, anchor: ['#pResults .sm-sec', '#possibleWrap'],
      desc: '인수 가능 상품은 <span class="k">보험사 이름</span>을 누르면 펼쳐져요. 하나 눌러보세요.',
      note: { type: 'tip', html: '위쪽 <b>모두 펼치기</b>로 전체를 한 번에 볼 수도 있어요.' },
      do: {
        hint: '보험사 이름을 눌러보세요',
        helper: '대신 펼쳐줄게요',
        when: function () { return !!$('#possibleWrap .sm-grp-head'); },
        done: function () { return !!$('#possibleWrap .sm-grp[data-open="1"]'); },
        auto: function (cb) { tap($('#possibleWrap .sm-grp-head')); setTimeout(cb, 240); }
      }
    },
    {
      ch: 2, anchor: ['#pResults .sm-sec.mt', '#exceptList'],
      desc: '예외질환 상품은 <span class="k">조건부</span>예요. 상품마다 적힌 <span class="k">특이조건</span>을 꼭 읽어주세요.',
      note: { type: 'warn', html: '"치료 종결 후 심사 가능", "재발 · 합병증 · 후유장해 없을 것" 같은 조건은 <b>고객 상황과 맞는지 먼저 확인</b>해야 해요.' }
    },
    {
      ch: 2, anchor: '#saveBtn',
      desc: '<span class="k">결과 저장</span>을 눌러야 조회 내역에 남아요. 저장하지 않고 다시 입력하면 사라져요.',
      do: {
        hint: '결과 저장을 눌러보세요',
        helper: '대신 저장해줄게요',
        done: function () { return vis($('section[data-screen="history"]')); },
        auto: function (cb) {
          tap($('#saveBtn'));
          until(function () { return vis($('section[data-screen="history"]')); }, function () { setTimeout(cb, 300); }, 5000);
        }
      }
    },

    /* ---------- STEP 3 · 조회 내역 확인 ---------- */
    {
      ch: 3, anchor: '.sm-tab[data-screen="history"]', noBack: true,
      desc: '저장하면 <span class="k">조회 내역</span> 탭으로 넘어와요. 지난 상담을 다시 볼 때는 이 탭이에요.'
    },
    {
      ch: 3, anchor: '.sm-screen[data-screen="history"] .filter-bar',
      desc: '기본은 <span class="k">3개월</span>이에요. 더 지난 내역은 기간을 넓히고, 검색창에는 <span class="k">병력</span>을 넣으면 돼요.'
    },
    {
      ch: 3, anchor: function () { return [histRow() || $('#histRows')]; },
      desc: '지난 내역 <span class="k">한 줄</span>을 눌러보세요. 그때 입력값과 결과가 그대로 열려요.',
      do: {
        hint: '내역 한 줄을 눌러보세요',
        helper: '대신 열어줄게요',
        done: function () { return vis($('#historyModal')); },
        auto: function (cb) {
          tap(histRow());
          until(function () { return vis($('#historyModal')); }, function () { setTimeout(cb, 300); }, 5000);
        }
      }
    },
    {
      ch: 3, anchor: '#histModalEntries', noBack: true,
      desc: '질병명 · 치료 기간 · 치료 일수 · 수술 여부가 그대로 남아요. 같은 고객을 다시 상담할 때 꺼내 쓰면 돼요.',
      note: { type: 'warn', html: '여기에도 같은 고지가 있어요 — <b>예상 가이드이며 실제 인수 여부는 심사 결과에 따라 달라질 수 있어요.</b> 보험사 기준은 수시로 바뀌니 <b>오래된 내역은 다시 조회</b>해주세요.' }
    },
    {
      ch: 3, anchor: ['#histRows', '.sm-screen[data-screen="history"] .hist-delete-btn'], noBack: true,
      desc: '지울 내역의 <span class="k">체크박스</span>를 눌러보세요. 선택하면 위쪽 <span class="k">선택 삭제</span>가 켜져요.',
      note: { type: 'warn', html: '<b>삭제한 내역은 되돌릴 수 없어요.</b> 삭제 전에 확인 창이 한 번 더 떠요.' },
      before: function (done) { closeHistModal(done); },
      do: {
        hint: '체크박스를 눌러보세요',
        helper: '대신 선택해줄게요',
        done: function () { var b = $('#histDeleteBtn'); return !!b && !b.disabled; },
        auto: function (cb) {
          var row = histRow();
          var chk = row && $('.hist-row-check', row);
          if (chk && !chk.checked) { chk.checked = true; fire(chk, 'change'); }
          setTimeout(cb, 220);
        }
      }
    },

    /* ---------- 아웃트로 ---------- */
    {
      card: true, last: true,
      mascot: '../../assets/img_jjapt_result.svg',
      kicker: '준비 완료',
      title: '이제 직접 해보세요',
      sub: '세 가지만 기억하면 돼요.',
      steps: [
        { t: '병력 입력', d: '질병명은 반드시 검색 후 목록에서 선택 · 한 고객당 최대 5건까지 한 번에' },
        { t: '결과 확인하기', d: '인수 가능 / 예외질환 두 묶음으로 확인 · 특이조건은 꼭 읽기' },
        { t: '결과 저장', d: '저장해야 조회 내역에 남아요 · 지난 내역은 내역 탭에서 다시 열기' }
      ],
      note: { type: 'warn', html: '다시 한 번 — 째피티 결과는 <b>예상 가이드</b>예요. 보험사 내부 규정과 상세 진단코드에 따라 <b>실제 심사 결과가 달라질 수 있으니</b> 고객에게는 "가능성"으로 안내해주세요.' },
      hint: '사용법은 탭 오른쪽 <b>사용법 보기</b>에서 다시 열 수 있어요.',
      ghost: '닫기',
      primary: '처음부터 직접 입력하기'
    }
  ];

  var CH = ['병력 입력', '인수 가능 상품 조회', '조회 내역 확인'];

  /* 챕터별 단계 개수 / 챕터 내 순번 */
  var chTotal = { 1: 0, 2: 0, 3: 0 };
  var chIndex = [];
  STEPS.forEach(function (s, i) {
    if (!s.ch) { chIndex[i] = 0; return; }
    chTotal[s.ch] += 1;
    chIndex[i] = chTotal[s.ch];
  });

  /* ===== DOM ===== */
  var root, spot, tip, tail, cardEl, shades = [];
  var idx = -1, busy = false, active = false, touched = false, advancing = false;
  var tickId = null, stepAt = 0, helperShown = false;

  function build() {
    root = document.createElement('div');
    root.className = 'tt-root';
    root.hidden = true;
    root.innerHTML =
      '<div class="tt-shade"></div><div class="tt-shade"></div>' +
      '<div class="tt-shade"></div><div class="tt-shade"></div>' +
      '<div class="tt-dim"></div>' +
      '<div class="tt-spot"></div>' +
      '<div class="tt-tail"></div>' +
      '<div class="tt-tip" role="dialog" aria-live="polite"></div>' +
      '<button class="tt-close" type="button" data-tt="skip" aria-label="튜토리얼 닫기">' +
        '<svg class="ic-svg" width="18" height="18"><use href="#i-x"/></svg>' +
      '</button>' +
      '<div class="tt-card" role="dialog"></div>';
    document.body.appendChild(root);
    shades = $$('.tt-shade', root);
    spot = $('.tt-spot', root); tip = $('.tt-tip', root);
    tail = $('.tt-tail', root); cardEl = $('.tt-card', root);

    /* 말풍선을 눌러도 입력칸 포커스를 빼앗지 않게 (검색 후보가 닫히는 문제 방지) */
    root.addEventListener('mousedown', function (e) {
      if (e.target.closest('.tt-tip, .tt-card')) e.preventDefault();
    });
    root.addEventListener('click', onAction);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    document.addEventListener('keydown', function (e) {
      if (!active || e.key !== 'Escape') return;
      e.stopPropagation(); e.preventDefault();
      close(true);
    }, true);
  }

  function onAction(e) {
    var btn = e.target.closest('[data-tt]');
    if (!btn) {
      /* 가림막을 눌렀다면 "여기를 누르세요" 링을 한 번 더 강조 */
      if (e.target.closest('.tt-shade') && root.classList.contains('is-do')) {
        root.classList.remove('is-do'); void root.offsetWidth; root.classList.add('is-do');
      }
      return;
    }
    var act = btn.getAttribute('data-tt');
    if (act === 'skip')  { close(true); return; }
    if (act === 'close') { close(false); return; }
    if (act === 'reset') { restart(); return; }
    if (busy || advancing) return;
    if (act === 'next')  { go(idx + 1); return; }
    if (act === 'auto')  { runAuto(); return; }
  }

  /* ===== 렌더 ===== */
  function isDo(s) { return !!(s.do && (!s.do.when || s.do.when())); }

  function noteHTML(note) {
    if (!note) return '';
    var h = '<div class="tt-note ' + note.type + '">' + note.html;
    if (note.list && note.list.length) {
      h += '<ul>';
      note.list.forEach(function (li) { h += '<li>' + li + '</li>'; });
      h += '</ul>';
    }
    return h + '</div>';
  }

  function renderTip() {
    var s = STEPS[idx];
    var h = '<p class="tt-desc">' + s.desc + '</p>' + noteHTML(s.note) + '<div class="tt-foot">';
    if (isDo(s)) {
      h += '<span class="tt-do"><span class="hand">👆</span><span class="tt-do-label">' + esc(s.do.hint) + '</span></span>'
         + '<button class="tt-helper" type="button" data-tt="auto" hidden>' + esc(s.do.helper) + '</button>';
    } else {
      h += '<button class="tt-next" type="button" data-tt="next">다음</button>';
    }
    h += '<span class="tt-count">STEP ' + s.ch + ' · <b>' + chIndex[idx] + '</b> / ' + chTotal[s.ch] + '</span></div>';
    tip.innerHTML = h;
    tip.style.animation = 'none'; void tip.offsetWidth; tip.style.animation = '';
    root.classList.toggle('is-do', isDo(s));
  }

  function renderCard() {
    var s = STEPS[idx];
    var h = '<div class="tt-card-top">'
          +   '<img class="tt-card-mascot" src="' + s.mascot + '" alt="보비" />'
          +   '<div>'
          +     '<div class="tt-kicker">' + esc(s.kicker) + '</div>'
          +     '<h2 class="tt-card-title">' + s.title + '</h2>'
          +     '<p class="tt-card-sub">' + s.sub + '</p>'
          +   '</div>'
          + '</div><div class="tt-steps">';
    s.steps.forEach(function (st, i) {
      h += '<div class="tt-step"><div class="no">' + (i + 1) + '</div>'
        +    '<div><h4>' + esc(st.t) + '</h4><p>' + esc(st.d) + '</p></div></div>';
    });
    h += '</div><div class="tt-card-note">' + noteHTML(s.note) + '</div>'
      +  '<div class="tt-card-foot">'
      +    '<p class="tt-replay-hint">' + s.hint + '</p>'
      +    '<button class="tt-btn ghost" type="button" data-tt="' + (s.last ? 'close' : 'skip') + '">' + esc(s.ghost) + '</button>'
      +    '<button class="tt-btn primary" type="button" data-tt="' + (s.last ? 'reset' : 'next') + '">' + esc(s.primary) + '</button>'
      +  '</div>';
    cardEl.innerHTML = h;
  }

  /* ===== 위치 ===== */
  function anchorEls() {
    var s = STEPS[idx];
    if (!s || s.card) return [];
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

  function reveal(els, done) {
    var r = unionRect(els);
    var vh = window.innerHeight;
    if (r.top >= 24 && r.bottom <= vh - 24) { done(); return; }
    try { els[0].scrollIntoView({ behavior: 'smooth', block: (r.height > vh - 220 ? 'start' : 'center'), inline: 'nearest' }); }
    catch (e) { els[0].scrollIntoView(); }
    setTimeout(done, 440);
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

  /* 가림막 4장을 구멍 둘레에 깔아 구멍 안쪽만 그대로 클릭되게 한다 */
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
    var s = STEPS[idx];
    if (!s || s.card) return;
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
    stepAt = Date.now();
    helperShown = false;
    tickId = setInterval(function () {
      if (!active) { stopTick(); return; }
      reposition();
      var s = STEPS[idx];
      if (!s || !isDo(s)) return;
      if (s.do.keep) s.do.keep();

      /* 진행 중 상태 문구 (예: 분석 중) */
      if (s.do.pending && s.do.pending()) {
        var lab = $('.tt-do-label', tip);
        if (lab && lab.textContent !== s.do.pendingHint) lab.textContent = s.do.pendingHint;
        stepAt = Date.now();
        return;
      }
      if (s.do.done()) { advance(); return; }
      if (!helperShown && Date.now() - stepAt > HELPER_DELAY) {
        helperShown = true;
        var hp = $('.tt-helper', tip);
        if (hp) hp.hidden = false;
        reposition();
      }
    }, 170);
  }

  function advance() {
    if (advancing) return;
    advancing = true;
    touched = true;
    stopTick();
    setTimeout(function () { advancing = false; go(idx + 1); }, 420);
  }

  function runAuto() {
    var s = STEPS[idx];
    if (!s || !isDo(s) || advancing) return;
    advancing = true; touched = true;
    stopTick();
    var hp = $('.tt-helper', tip); if (hp) hp.hidden = true;
    s.do.auto(function () { advancing = false; go(idx + 1); });
  }

  function go(i) {
    if (i < 0) i = 0;
    if (i >= STEPS.length) { close(false); return; }
    stopTick();
    idx = i;
    var s = STEPS[idx];
    busy = true;
    var nx = $('[data-tt="next"]', tip); if (nx) nx.disabled = true;
    (s.before || function (d) { d(); })(function () {
      busy = false;
      if (s.card) { root.classList.add('is-card'); root.classList.remove('is-do'); tip.innerHTML = ''; renderCard(); return; }
      root.classList.remove('is-card');
      cardEl.innerHTML = '';      /* 카드의 버튼 마크업이 남아 오동작하지 않게 비운다 */
      renderTip();
      var els = anchorEls();
      if (!els.length) { go(idx + 1); return; }
      reveal(els, function () { reposition(); startTick(); });
    });
  }

  /* ===== 시작 · 종료 ===== */
  function start() {
    if (!root) build();
    active = true; touched = false; advancing = false;
    root.hidden = false;
    go(0);
  }

  function markSeen() { try { localStorage.setItem(KEY, '1'); } catch (e) {} }

  /* 닫기. 건너뛰기인데 이미 입력이 들어갔다면 깨끗한 화면으로 되돌린다. */
  function close(fromSkip) {
    markSeen();
    active = false; advancing = false;
    stopTick();
    if (root) root.hidden = true;
    if (fromSkip && touched) { location.replace(baseUrl()); return; }
    clearHistSelection();
    var m = $('#historyModal');
    if (m && !m.hidden) tap($('.sm-modal-close', m));
  }

  function restart() { markSeen(); location.replace(baseUrl()); }

  /* 재실행 — 이미 입력·조회가 진행된 상태면 깨끗한 화면으로 리로드 후 자동 시작 */
  function replay() {
    var dirty = vis($('#pResults')) || vis($('#summaryContainer')) || !!diseaseVal() ||
                vis($('section[data-screen="history"]'));
    if (dirty) { location.replace(baseUrl() + '?tour=1'); return; }
    start();
  }

  /* ===== 부트 ===== */
  function boot() {
    var replayBtn = $('#tourReplay');
    if (replayBtn) replayBtn.addEventListener('click', replay);

    if (/[?&]tour=1/.test(location.search)) {
      try { history.replaceState(null, '', baseUrl()); } catch (e) {}
      setTimeout(start, 260);
      return;
    }
    var seen = true;
    try { seen = !!localStorage.getItem(KEY); } catch (e) { seen = true; }
    if (!seen) setTimeout(start, 520);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.jjaepityTour = { start: replay, reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} } };
})();
