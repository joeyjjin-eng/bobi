/* ============================================================
   재무상담 — 화면 안 동작
   눌러 보는 것은 전부 반응하게 한다. 값은 직접 적어 넣는다(자동 입력 없음).
   마크업에 아래 속성만 달면 이 파일이 동작을 붙인다.

     .ct-seg > div              한 칸 선택 (주거 형태 · 수입 형태 · 목표 기간)
     .ct-sw[data-toggle]        토글 스위치. data-toggle 값과 같은 data-toggle-target 을 접고 편다
     .ct-chip[data-chip]        여러 개 선택 (추가 조건)
     .ct-subtabs > div[data-tab] 탭 전환. data-tab 값과 같은 id 패널을 보인다
     tr[data-exp]               다음 tr.exp 를 접고 편다 (부채 상세)
     td[data-act="del"]         그 줄 삭제 (딸린 tr.exp 도 함께)
     .ct-add[data-add]          template#<값> 의 줄을 표 끝에 추가
     .ct-more[data-more]        [data-more-item=<값>] 을 모두 보이고 자신은 사라짐
     .ct-tot .li[data-cat]      수입지출 좌측 항목 선택 → 우측 상세 교체
     [data-print]               인쇄
     [data-todo]                아직 없는 기능 — 토스트로 알림
     .ct-in[contenteditable]    직접 고쳐 쓰기 (힌트는 첫 입력에 지워짐)
   ============================================================ */
(function () {
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 토스트 ---------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'ct-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 1800);
  }

  /* ---------- 입력 칸 — 직접 고쳐 쓰기 ---------- */
  // 힌트가 떠 있는 칸은 첫 입력에 비우고, 비운 채로 나가면 힌트를 되돌린다.
  function bindEditable(el) {
    // 네이티브 입력(input·select·textarea)은 그대로 둔다. contenteditable 을 걸면 망가진다.
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
    if (el.classList.contains('dim') || el.dataset.bound) return;
    el.dataset.bound = '1';
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'false');
    el.addEventListener('focus', function () {
      if (el.classList.contains('hint')) { el.textContent = ''; el.classList.remove('hint'); }
    });
    el.addEventListener('blur', function () {
      var v = el.textContent.trim();
      if (!v && el.dataset.hint) { el.textContent = el.dataset.hint; el.classList.add('hint'); return; }
      if (el.classList.contains('num')) el.textContent = comma(v);
    });
  }
  // 1234567 → 1,234,567 (소수점 아래는 버린다 — 재무상담은 정수만 쓴다)
  function comma(v) {
    var n = String(v).replace(/[^0-9]/g, '');
    return n ? Number(n).toLocaleString('ko-KR') : v;
  }
  $$('.ct-in').forEach(bindEditable);

  /* ---------- 클릭 동작 ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;

    // 세그먼트 — 한 칸 선택
    var seg = t.closest('.ct-seg > div');
    if (seg) {
      $$('div', seg.parentNode).forEach(function (d) { d.classList.remove('on'); });
      seg.classList.add('on');
      return;
    }

    // 토글 스위치
    var sw = t.closest('.ct-sw');
    if (sw) {
      var off = sw.classList.toggle('off');
      if (sw.hasAttribute('role')) sw.setAttribute('aria-checked', String(!off));
      var key = sw.dataset.toggle;
      if (key) $$('[data-toggle-target="' + key + '"]').forEach(function (el) { el.hidden = off; });
      return;
    }

    // 칩 — 여러 개 선택
    var chip = t.closest('.ct-chip[data-chip]');
    if (chip) { chip.classList.toggle('on'); return; }

    // 탭 전환
    var tab = t.closest('.ct-subtabs > div[data-tab]');
    if (tab) {
      $$('div[data-tab]', tab.parentNode).forEach(function (d) { d.classList.remove('on'); });
      tab.classList.add('on');
      $$('[data-tab-panel]').forEach(function (p) { p.hidden = p.dataset.tabPanel !== tab.dataset.tab; });
      // 탭을 바꾸면 내용이 통째로 바뀐다. 앞 탭에서 내려온 자리에 그대로 두면
      // 새 탭의 중간부터 보이므로 맨 위로 올린다.
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 줄 삭제
    var del = t.closest('td[data-act="del"]');
    if (del) {
      var row = del.closest('tr');
      var next = row.nextElementSibling;
      if (next && next.classList.contains('exp')) next.remove();
      row.remove();
      toast('한 줄 지웠습니다');
      return;
    }

    // 줄 접고 펴기 (부채 상세)
    var expRow = t.closest('tr[data-exp]');
    if (expRow) {
      var detail = expRow.nextElementSibling;
      if (detail && detail.classList.contains('exp')) {
        detail.hidden = !detail.hidden;
        var chev = $('.ct-chev', expRow);
        if (chev) chev.classList.toggle('up', !detail.hidden);
      }
      return;
    }

    // 줄 추가
    var add = t.closest('.ct-add[data-add]');
    if (add) {
      var tpl = document.getElementById(add.dataset.add);
      if (!tpl) return;
      var host = document.getElementById(tpl.dataset.rowFor);
      if (!host) return;
      var frag = tpl.content.cloneNode(true);
      var newRows = Array.prototype.slice.call(frag.children);
      // '추가' 줄이 표 안에 있으면 그 앞에 끼워 넣는다 (합계 위로 쌓이도록)
      var addRow = $('tr[data-addrow]', host);
      if (addRow) host.insertBefore(frag, addRow); else host.appendChild(frag);
      newRows.forEach(function (r) { $$('.ct-in', r).forEach(bindEditable); });
      // 빈 상태 안내 줄이 있으면 치운다
      var blank = $('tr[data-blank]', host);
      if (blank) blank.remove();
      var first = $('.ct-in', newRows[0]);
      if (first) first.focus();
      return;
    }

    // 더 보기
    var more = t.closest('.ct-more[data-more], .ct-chip[data-more]');
    if (more) {
      $$('[data-more-item="' + more.dataset.more + '"]').forEach(function (el) { el.hidden = false; });
      more.remove();
      return;
    }

    // 수입지출 — 좌측 항목 선택
    var cat = t.closest('.ct-tot [data-cat]');
    if (cat) { selectCategory(cat); return; }

    // 인쇄
    if (t.closest('[data-print]')) { window.print(); return; }

    // 아직 없는 기능
    var todo = t.closest('[data-todo]');
    if (todo) { toast(todo.dataset.todo); return; }
  });

  /* ---------- 수입지출 — 항목별 상세 ----------
     항목 이름은 기획 문서(디자인팀_인수인계_v1_20260927) 3장 '항목 이름(확정)' 표 그대로입니다.
     금액은 좌측 묶음 합계에 맞춰 나눈 예시값입니다. */
  var DETAIL = {
    '수입':      ['수입', [['월급(세후)', 320, 320], ['배우자 월급(세후)', 0, 0], ['상여·성과급', null, null],
                           ['사업·부업 수입', 200, 200], ['연금', 0, 0], ['월세 받는 돈', 0, 0], ['그 밖에 들어온 돈', 0, 0]]],
    '집':        ['고정지출', [['월세', 20, 20], ['관리비', 10, 10], ['전기·가스·수도', 8, 8]]],
    '통신':      ['고정지출', [['휴대폰 요금', 16, 12], ['인터넷·TV', 6, 6]]],
    '보험':      ['고정지출', [['보장성 보험료', 48, 48]]],
    '구독':      ['고정지출', [['넷플릭스', 3, 2], ['멜론', 1, 1]]],
    '가족':      ['고정지출', [['부모님 용돈', 20, 20], ['자녀 학원·교육비', 55, 55], ['자녀 용돈', 10, 10]]],
    '교통':      ['고정지출', [['대중교통', 10, 10], ['주유비', 18, 14], ['주차·통행료', 4, 4]]],
    '식비':      ['변동지출', [['장보기', 62, 60], ['외식·배달', 38, 28], ['카페·간식', 10, null]]],
    '생활':      ['변동지출', [['생활용품', 18, 16]]],
    '건강':      ['변동지출', [['병원·약', 8, 8], ['운동', 4, 4]]],
    '꾸밈':      ['변동지출', [['미용', 5, 5], ['옷·신발', 10, 7]]],
    '여가·경조사·기타': ['변동지출', [['취미·여행', 10, 8], ['경조사·선물', 10, 10], ['그 밖에 쓴 돈', 5, 5]]],
    '저축':      ['저축', [['예금·적금', 20, 20], ['주택청약', 10, 10], ['주식·펀드 투자', 5, 5],
                           ['연금저축·IRP', 4, 4], ['저축성·연금보험', 0, 0]]],
    '일시 수입': ['일시 수입·지출', [['대출 받은 돈', 0, 0], ['적금 해지·돌려받은 돈', 0, 0]]],
    '일시 지출': ['일시 수입·지출', [['보증금 낸 돈', null, null], ['집·차 등 큰 물건 산 돈', null, null]]]
  };

  var DEMO = new URLSearchParams(location.search).get('demo') === '1';

  function selectCategory(li) {
    var name = li.dataset.cat;
    var d = DETAIL[name];
    if (!d) return;
    $$('.ct-tot [data-cat]').forEach(function (x) { x.classList.remove('on'); });
    li.classList.add('on');

    var eyebrow = $('#cf-group'), title = $('#cf-title'), body = $('#cf-rows'), foot = $('#cf-foot');
    if (!body) return;
    eyebrow.textContent = d[0];
    title.textContent = name;

    // 목표 열이 접혀 있으면 새로 그린 칸도 접힌 채로 둔다
    var sw = $('.ct-sw[data-toggle="goal"]');
    var goalOff = sw ? sw.classList.contains('off') : false;
    var gAttr = ' data-toggle-target="goal"' + (goalOff ? ' hidden' : '');

    var now = 0, goal = 0, unknown = 0;
    body.innerHTML = d[1].map(function (r) {
      // 신규 작성은 항목 이름만 두고 금액은 비워 둔다
      var v = DEMO ? r[1] : null;
      var g = DEMO ? r[2] : null;
      if (v !== null) now += v;
      if (g === null) unknown++; else goal += g;
      return '<tr><td class="nm">' + r[0] + '</td>'
        + '<td class="amt"><div class="ct-in num' + (v === null ? ' hint' : '') + '" data-hint="0">'
        + (v === null ? '0' : v) + '</div></td>'
        + '<td class="amt"' + gAttr + '><div class="ct-in num soft' + (g === null ? ' hint' : '') + '" data-hint="미입력">'
        + (g === null ? '미입력' : g) + '</div></td></tr>';
    }).join('')
      + '<tr class="addrow" data-addrow><td colspan="3" class="ct-add" data-add="tpl-cf">+ 항목 추가</td></tr>';

    foot.innerHTML = '<tr><td>' + name + ' 소계</td>'
      + '<td class="amt" style="font-size:var(--fs-h1);font-weight:800;">' + round1(now)
      + '<span style="font-size:var(--fs-option);font-weight:600;color:var(--ink-3);"> 만원</span></td>'
      + '<td class="amt"' + gAttr + '>' + round1(goal)
      + (DEMO && unknown ? '<span class="ct-note" style="font-weight:500;"> · 미입력 ' + unknown + '건 제외</span>' : '')
      + '</td></tr>';

    $$('.ct-in', body).forEach(bindEditable);
  }
  function round1(n) { return Math.round(n * 10) / 10; }

  /* 다음 상담일 달력은 04 상담정리(wrapup.html)가 직접 그린다.
     여기 있던 코드는 2026.10 한 달이 통째로 박힌 시안용이라 치웠다. */

  /* ---------- 처음 상태 ---------- */
  var openCat = $('.ct-tot [data-cat].on');
  if (openCat) selectCategory(openCat);
})();
