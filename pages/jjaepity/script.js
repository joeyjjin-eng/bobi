/* ============================================================
   째피티 · 스마트보비 AI 인수 가이드 — 페이지 로직
   ============================================================ */
(function () {
  var DATA = {
    diseases: [
      "K05 치은염 및 치주질환","I10 본태성 고혈압","E11 2형 당뇨병","E78 고지혈증",
      "E04 갑상선 결절","K21 역류성 식도염","K29 위염","M51 추간판탈출증(디스크)",
      "J45 천식","B18 만성 B형 간염","N20 요로결석","H25 백내장",
      "S52 아래팔 골절","S62 손목·손 골절","S82 아래다리 골절","S22 갈비뼈 골절","S72 대퇴골 골절"
    ],
    except: [
      { insurer: "NH농협손해보험", name: "NH335굿플러스건강보험", notes: null },
      { insurer: "NH농협손해보험", name: "NH헤아림3.10.10건강보험", notes: null },
      { insurer: "NH농협손해보험", name: "NH헤아림355건강보험", notes: null },
      { insurer: "AIG손해보험",   name: "AIG 315플러스 간편건강보험", notes: ["최대 인수 가능 질병 갯수는 AIG의 경우 인수심사로만 알 수 있어요."] },
      { insurer: "AIG손해보험",   name: "AIG 325플러스 간편건강보험", notes: ["최대 인수 가능 질병 갯수는 AIG의 경우 인수심사로만 알 수 있어요."] },
      { insurer: "흥국화재",       name: "흥GOOD 든든한 325 아마시가한도 간편종합보험", notes: [
        "양성종양(물혹, 낭종 등)의 경우 수술 제거 및 치료 종결 후 심사 가능",
        "이측성 질환의 경우 이측 수술 후 심사 가능",
        "재발 / 합병증 / 후유장해 없을 것"
      ]},
      { insurer: "흥국화재",       name: "흥Good 고비지 3.10.5 간편종합보험 · 고지혈증·당뇨병 제외", notes: [
        "양성종양(물혹, 낭종 등)의 경우 수술 제거 및 치료 종결 후 심사 가능",
        "재발 / 합병증 / 후유장해 없을 것"
      ]},
      { insurer: "흥국화재",       name: "흥Good 고비지 3.10.5 간편종합보험 · 고지혈증 제외", notes: [
        "양성종양(물혹, 낭종 등)의 경우 수술 제거 및 치료 종결 후 심사 가능"
      ]},
      { insurer: "흥국화재",       name: "흥Good 고비지 3.10.5 간편종합보험 · 고혈압·고지혈증 제외", notes: null },
      { insurer: "흥국화재",       name: "흥Good 고비지 3.10.5 간편종합보험 · 고혈압·당뇨병 제외", notes: null },
      { insurer: "흥국화재",       name: "흥Good 고비지 3.10.5 간편종합보험 · 고혈압 제외", notes: null },
      { insurer: "흥국화재",       name: "흥Good 고비지 3.10.5 간편종합보험 · 당뇨병 제외", notes: [
        "이측성 질환의 경우 이측 수술 후 심사 가능"
      ]}
    ],
    history: [
      {
        date: "2026.07.06 11:32",
        disease: "K05 치은염 및 치주질환",
        cond: "복합 병력 · 5건",
        entries: [
          { disease: "K05 치은염 및 치주질환", period: "2026.06.01 ~ 06.05",  days: "5일",  surgery: "예"     },
          { disease: "I10 본태성 고혈압",       period: "2025.11.10 ~ 진행 중", days: "0일",  surgery: "아니오" },
          { disease: "E78 고지혈증",            period: "2025.09.01 ~ 진행 중", days: "0일",  surgery: "아니오" },
          { disease: "K21 역류성 식도염",       period: "2026.02.14 ~ 03.14",  days: "12일", surgery: "아니오" },
          { disease: "E04 갑상선 결절",         period: "2025.05.02 ~ 05.02",  days: "1일",  surgery: "예"     }
        ],
        possible: 3, except: 62
      },
      { date: "2026.07.04 16:12", disease: "K05 치은염 및 치주질환", cond: "2026.06.01 ~ 06.01 · 일수 7일 · 수술 예",    possible: 0,  except: 148 },
      { date: "2026.07.02 10:38", disease: "E11 2형 당뇨병",         cond: "2026.03.10 ~ 05.20 · 일수 0일 · 수술 아니오", possible: 12, except: 96  },
      { date: "2026.06.28 14:05", disease: "I10 본태성 고혈압",      cond: "2026.01.15 ~ 04.15 · 일수 3일 · 수술 아니오", possible: 23, except: 74  }
    ]
  };

  // ===== 골절(예시) 케이스 : 인수 가능 상품 다건 목록 =====
  DATA.possibleFracture = (function () {
    var arr = [];
    function add(insurer, names) { names.forEach(function (n) { arr.push({ insurer: insurer, name: n }); }); }
    // 메리츠화재
    add("메리츠화재", ["(무)메리츠통합간편건강보험(3.0.5)","(무)메리츠통합간편건강보험(3.1.5)","(무)메리츠통합간편건강보험(3.2.5)","(무)메리츠통합간편건강보험(3.3.5)","(무)메리츠통합간편건강보험(3.4.5)","(무)메리츠통합간편건강보험(3.5.5)","(무)메리츠통합간편건강보험(3.6.5)","(무)메리츠통합간편건강보험(3.7.5)","(무)메리츠통합간편건강보험(3.8.5)","(무)메리츠통합간편건강보험(3.9.5)","(무)메리츠통합간편건강보험(3.10.5)","(무)메리츠간편31건강보험","(무)메리츠유병력자실손의료비","The가벼운간편355건강보험","통합간편건강보험(355수술고지간편심사형)","통합간편건강보험(355입원고지간편심사형)"]);
    // 흥국화재
    add("흥국화재", ["흥GOOD 든든한 3.0.5 간편종합보험","흥GOOD 든든한 3.1.5 간편종합보험","흥GOOD 든든한 3.2.5 간편종합보험","흥GOOD 든든한 3.3.5 간편종합보험","흥GOOD 든든한 3.4.5 간편종합보험","흥GOOD 든든한 3.5.5 간편종합보험","흥GOOD 든든한 3.6.5 간편종합보험","흥GOOD 든든한 3.10.5 간편종합보험","흥GOOD 든든한 325 암만생각해도 간편종합보험","흥GOOD 유병력자 실손의료보험","흥Good고당지3.10.5간편종합보험_고지혈증,당뇨병없음","흥Good고당지3.10.5간편종합보험_고지혈증없음","흥Good고당지3.10.5간편종합보험_고혈압, 고지혈증 없음","흥Good고당지3.10.5간편종합보험_고혈압,당뇨병없음","흥Good고당지3.10.5간편종합보험_고혈압없음","흥Good고당지3.10.5간편종합보험_당뇨병없음"]);
    // NH농협손해보험
    add("NH농협손해보험", ["간편가입헤아림실손의료비보험","NH335굿패스건강보험","NH헤아림3.10.10건강보험","NH헤아림355건강보험","NH헤아림345건강보험","NH헤아림365건강보험"]);
    // 라이나손해보험
    add("라이나손해보험", ["(무)더핏 간편한 나만의 종합보험(갱신형)2509 1종(325(암)간편심사형)","(무)더핏 간편한 나만의 종합보험(갱신형)2509 1종(355(6대질병)간편심사형)","(무)더핏 간편한 원모어 암보험(갱신형) 1종(325(암)간편심사형)","(무)더핏 간편한 원모어 암보험(갱신형) 2종(355(6대질병)간편심사형)","(무)더핏 프리미엄 종합보험 1종","(무)더핏 프리미엄 종합보험 2종","(무)더핏 시니어 종합보험 1종"]);
    // 롯데손해보험
    add("롯데손해보험", ["let: simple 3.2.5 간편맞춤 건강보험","let: simple 3.3.5 간편맞춤 건강보험","let: simple 3.4.5 간편맞춤 건강보험","let: simple 3.5.5 간편맞춤 건강보험","let: simple 간편 3.5.10","let: simple 간편 3.6.10","let: simple 간편 3.7.10","let: simple 간편 3.8.10","let: simple 간편 3.9.10","let: simple 간편 3.10.10","let:care 유병력자 실손의료보험","let:care 종합암보험(88플러스원)3.10.10"]);
    // 하나손해보험
    add("하나손해보험", ["(3N5)하나더퍼스트 315 간편건강보험","(3N5)하나더퍼스트 325 간편건강보험","(3N5)하나더퍼스트 335 간편건강보험","(3N5)하나더퍼스트 345 간편건강보험","(3N5)하나더퍼스트 355 간편건강보험","(3N5)하나더퍼스트 365 간편건강보험","(3N5)하나더퍼스트 375 간편건강보험","(3N5)하나더퍼스트 395 간편건강보험","(3N5)하나더퍼스트 3105 간편건강보험","(Grade)하나더퍼스트건강간편보험"]);
    // 한화손해보험
    add("한화손해보험", ["한화 3N5 더간편건강보험_305","한화 3N5 더간편건강보험_315","한화 3N5 더간편건강보험_325","한화 3N5 더간편건강보험_335","한화 3N5 더간편건강보험_345","한화 3N5 더간편건강보험_355","한화 3N5 더간편건강보험_355_고혈압없음","한화 3N5 더간편건강보험_355_당뇨,고혈압없음","한화 3N5 더간편건강보험_355_당뇨없음","한화 311 간편건강보험2601","한화 더 경증 간편건강보험_3.10.5","한화 더 경증 간편건강보험_3.10.5_고혈압없음","한화 더 경증 간편건강보험_3.10.5_당뇨,고혈압없음","한화 더 경증 간편건강보험_3.10.5_당뇨없음","한화 더 경증 간편건강보험_3.10.5_고지혈증없음","한화 더 경증 간편건강보험_3.10.5_당뇨,고혈압,고지혈증없음"]);
    // 삼성화재
    add("삼성화재", ["(무)삼성 간편건강보험(3.0.5)","(무)삼성 간편건강보험(3.1.5)","(무)삼성 간편건강보험(3.2.5)","(무)삼성 간편건강보험(3.3.5)","(무)삼성 간편건강보험(3.5.5)","(무)삼성 간편건강보험(3.6.5)","(무)삼성 간편건강보험(3.7.5)","(무)삼성 간편건강보험(3.8.5)","(무)삼성 간편건강보험(3.9.5)","(무)삼성 간편건강보험(3.10.5)","(무)삼성 실손의료보험(간편심사형)","(무)삼성 유병력자 간편심사보험","(무)삼성 실버 간편건강보험(3.5.5)","(무)삼성 실버 간편건강보험(3.10.5)","(무)삼성 여성전용 간편건강보험(3.10.5)"]);
    // KB손해보험
    add("KB손해보험", ["KB The간편한 건강보험(3.0.5)","KB The간편한 건강보험(3.1.5)","KB The간편한 건강보험(3.5.5)","KB The간편한 건강보험(3.10.5)","KB 다이렉트 간편건강보험","KB 매직카 간편심사보험","KB 골드라이프 간편건강보험"]);
    // 현대해상
    add("현대해상", ["굿앤굿 간편건강보험(3.0.5)","굿앤굿 간편건강보험(3.5.5)","굿앤굿 간편건강보험(3.10.5)","2Q패스 간편건강보험","3Q패스 간편건강보험","4Q패스 간편건강보험","굿앤굿 유병력자 실손의료보험","굿앤굿 실버 간편건강보험"]);
    // DB손해보험
    add("DB손해보험", ["프로미라이프 간편건강보험(3.0.5)","프로미라이프 간편건강보험(3.5.5)","프로미라이프 간편건강보험(3.10.5)","프로미 유병력자 실손의료보험","프로미라이프 간편심사 종합보험"]);
    // AIG손해보험
    add("AIG손해보험", ["AIG 315플러스 간편건강보험","AIG 325플러스 간편건강보험","AIG 335플러스 간편건강보험","AIG 355플러스 간편건강보험"]);
    // 캐롯손해보험
    add("캐롯손해보험", ["캐롯 간편건강보험(3.5.5)","캐롯 간편건강보험(3.10.5)","캐롯 유병력자 간편건강보험"]);
    // MG손해보험
    add("MG손해보험", ["MG 간편건강보험","MG 유병력자 실손의료보험","MG 실버 간편건강보험"]);
    // AXA손해보험
    add("AXA손해보험", ["AXA 간편건강보험(325)","AXA 간편건강보험(355)","AXA 유병력자 간편심사보험"]);
    return arr;
  })();

  var MAX_ENTRIES = 5;
  function newEntry() { return { disease: '', dateStart: '', dateEnd: '', treating: false, hospDays: 0 }; }
  var state = {
    screen: 'search', phase: 'empty', focused: false,
    entries: [ newEntry() ],
    disease: '',
    saved: false,
    historySearch: '',
    historyPeriod: '3m',
    historySelected: {},
    history: DATA.history.slice()
  };

  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function label() { return state.disease.trim() || '입력한 병력'; }

  // ===== 날짜 유틸 =====
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtDate(d) { return d.getFullYear() + '.' + pad2(d.getMonth() + 1) + '.' + pad2(d.getDate()); }
  function parseDate(s) {
    var m = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(String(s || '').trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2] - 1, d = +m[3];
    var dt = new Date(y, mo, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
    return dt;
  }
  // 데모 기준일 (샘플 데이터가 2026년 7월 기준). 실 배포 시 new Date()로 교체.
  function todayStart() { return new Date(2026, 6, 9); }
  function digitsToDate(s) {
    s = String(s || '').replace(/\D/g, '').slice(0, 8);
    if (s.length <= 4) return s;
    if (s.length <= 6) return s.slice(0, 4) + '.' + s.slice(4);
    return s.slice(0, 4) + '.' + s.slice(4, 6) + '.' + s.slice(6, 8);
  }
  var CALENDAR_ICON =
    '<svg class="ic-svg" width="15" height="15" viewBox="0 0 24 24" fill="none">' +
      '<rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/>' +
      '<line x1="4" y1="10.5" x2="20" y2="10.5" stroke="currentColor" stroke-width="1.8"/>' +
      '<line x1="9" y1="3" x2="9" y2="7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<line x1="15" y1="3" x2="15" y2="7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '</svg>';

  function calendarInnerHTML(y, m, entryIdx, role) {
    var entry = state.entries[entryIdx];
    var selectedStr = role === 'start' ? entry.dateStart : entry.dateEnd;
    var minDate = role === 'end' ? parseDate(entry.dateStart) : null;
    var today = todayStart();
    var weekLabels = ['일','월','화','수','목','금','토'];
    var firstDay = new Date(y, m, 1);
    var dayOfWeek = firstDay.getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var prevMonthDays = new Date(y, m, 0).getDate();
    var h = '<div class="sm-cal-head">' +
        '<div class="sm-cal-nav-group">' +
          '<button type="button" class="sm-cal-nav sm-cal-nav-yr" data-nav="-12" aria-label="이전 해">«</button>' +
          '<button type="button" class="sm-cal-nav" data-nav="-1" aria-label="이전 달">‹</button>' +
        '</div>' +
        '<div class="sm-cal-title">' + y + '년 ' + (m + 1) + '월</div>' +
        '<div class="sm-cal-nav-group">' +
          '<button type="button" class="sm-cal-nav" data-nav="1" aria-label="다음 달">›</button>' +
          '<button type="button" class="sm-cal-nav sm-cal-nav-yr" data-nav="12" aria-label="다음 해">»</button>' +
        '</div>' +
      '</div>' +
      '<div class="sm-cal-week">';
    for (var i = 0; i < 7; i++) {
      var wcls = i === 0 ? ' class="sun"' : (i === 6 ? ' class="sat"' : '');
      h += '<span' + wcls + '>' + weekLabels[i] + '</span>';
    }
    h += '</div><div class="sm-cal-grid">';
    for (var p = dayOfWeek - 1; p >= 0; p--) {
      h += '<button class="sm-cal-day out" type="button" disabled>' + (prevMonthDays - p) + '</button>';
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var dt = new Date(y, m, d);
      var iso = fmtDate(dt);
      var cls = ['sm-cal-day'];
      var dis = false;
      if (dt.getTime() > today.getTime()) { cls.push('future'); dis = true; }
      if (minDate && dt.getTime() < minDate.getTime()) { cls.push('outside'); dis = true; }
      if (dt.getFullYear() === today.getFullYear() && dt.getMonth() === today.getMonth() && dt.getDate() === today.getDate()) cls.push('today');
      if (iso === selectedStr) cls.push('selected');
      var wd = dt.getDay();
      if (wd === 0) cls.push('sun');
      if (wd === 6) cls.push('sat');
      h += '<button class="' + cls.join(' ') + '" type="button" data-date="' + iso + '"' + (dis ? ' disabled' : '') + '>' + d + '</button>';
    }
    h += '</div>';
    return h;
  }

  function openCalendar(input) {
    document.querySelectorAll('.sm-cal').forEach(function (c) { c.hidden = true; });
    var field = input.closest('.sm-date-field');
    if (!field) return;
    var cal = field.querySelector('.sm-cal');
    var idx = Number(input.dataset.entryIdx);
    var role = input.dataset.role;
    var entry = state.entries[idx];
    var initial = parseDate(role === 'start' ? entry.dateStart : entry.dateEnd);
    if (!initial) initial = (role === 'end' && parseDate(entry.dateStart)) ? parseDate(entry.dateStart) : todayStart();
    cal.dataset.year = initial.getFullYear();
    cal.dataset.month = initial.getMonth();
    cal.innerHTML = calendarInnerHTML(initial.getFullYear(), initial.getMonth(), idx, role);
    cal.hidden = false;
  }

  function updateTreatingUI(idx) {
    var entry = state.entries[idx];
    var canTreat = !!parseDate(entry.dateStart);
    var card = document.querySelector('.sm-form-card[data-entry-idx="' + idx + '"]');
    if (!card) return;
    var check = card.querySelector('.sm-treating');
    var label = card.querySelector('.sm-check-treat');
    if (!check || !label) return;
    check.disabled = !canTreat;
    label.classList.toggle('is-disabled', !canTreat);
    if (!canTreat) {
      check.checked = false;
      entry.treating = false;
    }
  }

  function maxHospDays(entry) {
    var sd = parseDate(entry.dateStart);
    if (!sd) return 0;
    var end = entry.treating ? todayStart() : parseDate(entry.dateEnd);
    if (!end) return 0;
    var ms = end.getTime() - sd.getTime();
    return Math.floor(ms / 86400000) + 1;
  }

  function refreshHospField(idx) {
    var entry = state.entries[idx];
    var canTreat = !!parseDate(entry.dateStart);
    var canHosp = canTreat && (entry.treating || !!parseDate(entry.dateEnd));
    var max = canHosp ? maxHospDays(entry) : 0;
    if (entry.hospDays > max) entry.hospDays = max;
    var card = document.querySelector('.sm-form-card[data-entry-idx="' + idx + '"]');
    if (!card) return;
    var input = card.querySelector('.sm-hosp-days');
    var hint = card.querySelector('.sm-days');
    if (input) {
      input.disabled = !canHosp;
      if (String(entry.hospDays) !== input.value) input.value = String(entry.hospDays);
    }
    if (hint) hint.textContent = canHosp ? '치료기간 내 최대 ' + max + '일' : 'DAYS';
  }

  function refreshEndDateField(idx) {
    var entry = state.entries[idx];
    var card = document.querySelector('.sm-form-card[data-entry-idx="' + idx + '"]');
    if (!card) return;
    var endInput = card.querySelector('.sm-date-input[data-role="end"]');
    if (!endInput) return;
    var field = endInput.closest('.sm-date-field');
    var cal = field.querySelector('.sm-cal');
    var disabled = !!entry.treating;
    endInput.disabled = disabled;
    field.classList.toggle('is-disabled', disabled);
    if (disabled) {
      endInput.value = '';
      entry.dateEnd = '';
      if (cal) cal.hidden = true;
    }
  }

  function computeDisease() {
    for (var i = 0; i < state.entries.length; i++) {
      var v = (state.entries[i].disease || '').trim();
      if (v) { state.disease = state.entries[i].disease; return; }
    }
    state.disease = '';
  }

  function entryHTML(idx) {
    var no = idx + 1;
    var noStr = no < 10 ? '0' + no : String(no);
    var entry = state.entries[idx];
    var canTreat = !!parseDate(entry.dateStart);
    var endDisabled = !!entry.treating;
    var canHosp = canTreat && (endDisabled || !!parseDate(entry.dateEnd));
    var maxDays = canHosp ? maxHospDays(entry) : 0;
    if (entry.hospDays > maxDays) entry.hospDays = maxDays;
    var del = idx === 0 ? '' :
      '<button type="button" class="sm-entry-del" aria-label="병력 삭제">' +
        '<svg class="ic-svg" width="14" height="14"><use href="#i-x"/></svg>' +
      '</button>';
    return '<div class="sm-form-card" data-entry-idx="' + idx + '">' +
      '<div class="sm-form-card-head">' +
        '<div class="sm-no">NO. ' + noStr + '</div>' + del +
      '</div>' +
      '<label class="sm-lbl">질병명</label>' +
      '<div class="sm-field">' +
        '<input class="sm-input sm-disease" data-entry-idx="' + idx + '" placeholder="예: 고혈압, 당뇨, 갑상선 결절" autocomplete="off" />' +
        '<div class="sm-sug" hidden></div>' +
      '</div>' +
      '<label class="sm-lbl">치료 기간 (시작 ~ 종료)</label>' +
      '<div class="sm-dates">' +
        '<div class="sm-date-field">' +
          '<input type="text" class="sm-date-input" data-role="start" data-entry-idx="' + idx + '" value="' + esc(entry.dateStart) + '" placeholder="YYYY.MM.DD" maxlength="10" autocomplete="off" inputmode="numeric" />' +
          '<span class="sm-date-ic" aria-hidden="true">' + CALENDAR_ICON + '</span>' +
          '<div class="sm-cal" hidden></div>' +
        '</div>' +
        '<span class="sm-date-tilde">~</span>' +
        '<div class="sm-date-field' + (endDisabled ? ' is-disabled' : '') + '">' +
          '<input type="text" class="sm-date-input" data-role="end" data-entry-idx="' + idx + '" value="' + esc(entry.dateEnd) + '" placeholder="YYYY.MM.DD" maxlength="10" autocomplete="off" inputmode="numeric"' + (endDisabled ? ' disabled' : '') + ' />' +
          '<span class="sm-date-ic" aria-hidden="true">' + CALENDAR_ICON + '</span>' +
          '<div class="sm-cal" hidden></div>' +
        '</div>' +
      '</div>' +
      '<label class="sm-check sm-check-treat' + (canTreat ? '' : ' is-disabled') + '">' +
        '<input type="checkbox" class="sm-treating" data-entry-idx="' + idx + '"' + (entry.treating ? ' checked' : '') + (canTreat ? '' : ' disabled') + '>' +
        '<span class="box"></span>치료 중' +
      '</label>' +
      '<div class="sm-two">' +
        '<div>' +
          '<label class="sm-lbl">입원일</label>' +
          '<input type="text" class="sm-num-input sm-hosp-days" data-entry-idx="' + idx + '" value="' + entry.hospDays + '" inputmode="numeric" placeholder="0"' + (canHosp ? '' : ' disabled') + ' />' +
          '<div class="sm-days">' + (canHosp ? '치료기간 내 최대 ' + maxDays + '일' : 'DAYS') + '</div>' +
        '</div>' +
        '<div><label class="sm-lbl">수술 여부</label><div class="sm-seg"><button type="button">예</button><button type="button" class="on">아니오</button></div></div>' +
      '</div>' +
    '</div>';
  }

  function renderEntries() {
    var box = $('#entriesContainer');
    var h = '';
    for (var i = 0; i < state.entries.length; i++) h += entryHTML(i);
    box.innerHTML = h;
    var inputs = box.querySelectorAll('.sm-disease');
    for (var i = 0; i < inputs.length; i++) inputs[i].value = state.entries[i].disease;
  }

  function updateAddBtn() {
    var btn = $('#addEntryBtn');
    btn.querySelector('.sm-add-count').textContent = state.entries.length + '/' + MAX_ENTRIES;
    btn.disabled = state.entries.length >= MAX_ENTRIES;
  }

  function exceptGroupsHTML() {
    var list = DATA.except;
    if (!list.length) return '';
    var groups = [];
    var gmap = {};
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!gmap[p.insurer]) { gmap[p.insurer] = { insurer: p.insurer, products: [] }; groups.push(gmap[p.insurer]); }
      gmap[p.insurer].products.push(p);
    }
    var CHEV = '<svg class="ic-svg" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9 L12 15 L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var h = '<div class="sm-grp-actions">'
          +   '<span class="sm-grp-summary">' + groups.length + '개 회사 · ' + list.length + '건</span>'
          +   '<button type="button" class="sm-grp-toggle-all" data-action="expand">모두 펼치기</button>'
          + '</div>'
          + '<div class="sm-grp-list">';
    for (var g = 0; g < groups.length; g++) {
      var grp = groups[g];
      h += '<div class="sm-grp" data-open="0">'
        +    '<button class="sm-grp-head" type="button">'
        +      '<span class="sm-grp-name">' + esc(grp.insurer) + '</span>'
        +      '<span class="sm-grp-count">' + grp.products.length + '건</span>'
        +      '<span class="sm-grp-arrow" aria-hidden="true">' + CHEV + '</span>'
        +    '</button>'
        +    '<div class="sm-grp-body">';
      for (var k = 0; k < grp.products.length; k++) {
        var pr = grp.products[k];
        h += '<div class="sm-ex-item">'
          +    '<div class="sm-ex-name">' + esc(pr.name) + '</div>';
        if (pr.notes && pr.notes.length) {
          h += '<div class="sm-ex-notes"><div class="sm-ex-notes-t">특이조건</div>';
          for (var j = 0; j < pr.notes.length; j++) {
            h += '<div class="sm-ex-line"><span>·</span><span>' + esc(pr.notes[j]) + '</span></div>';
          }
          h += '</div>';
        }
        h += '</div>';
      }
      h += '</div></div>';
    }
    h += '</div>';
    return h;
  }

  function renderExcept() {
    $('#exceptList').innerHTML = exceptGroupsHTML();
  }

  function parseHistoryDate(s) {
    var m = /^(\d{4})\.(\d{2})\.(\d{2})/.exec(s || '');
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  function periodCutoff(p) {
    var d = todayStart();
    var y = d.getFullYear(), mo = d.getMonth(), da = d.getDate();
    if (p === '1m') return new Date(y, mo - 1, da);
    if (p === '6m') return new Date(y, mo - 6, da);
    if (p === '1y') return new Date(y - 1, mo, da);
    return new Date(y, mo - 3, da);
  }

  function renderHistory() {
    var q = (state.historySearch || '').trim().toLowerCase();
    var cutoff = periodCutoff(state.historyPeriod);
    var h = '';
    var visibleCount = 0;
    var visibleIdxs = [];
    for (var i = 0; i < state.history.length; i++) {
      var x = state.history[i];
      // 기간 필터
      var histDate = parseHistoryDate(x.date);
      if (histDate && histDate.getTime() < cutoff.getTime()) continue;
      // 병력 검색 필터
      if (q) {
        var match = false;
        if (x.disease && x.disease.toLowerCase().indexOf(q) >= 0) match = true;
        if (!match && x.entries) {
          for (var j = 0; j < x.entries.length; j++) {
            var ed = x.entries[j] && x.entries[j].disease;
            if (ed && ed.toLowerCase().indexOf(q) >= 0) { match = true; break; }
          }
        }
        if (!match) continue;
      }
      visibleCount++;
      visibleIdxs.push(i);
      var dis = esc(x.disease);
      if (x.entries && x.entries.length > 1) {
        dis += ' <span class="sm-td-extra">외 ' + (x.entries.length - 1) + '건</span>';
      }
      var checked = state.historySelected[i] ? ' checked' : '';
      var selCls = state.historySelected[i] ? ' is-selected' : '';
      h += '<div class="sm-tr' + selCls + '" data-idx="' + i + '">'
         +   '<div class="sm-td sm-td-check">'
         +     '<label class="sm-tbl-check"><input type="checkbox" class="hist-row-check" data-idx="' + i + '"' + checked + '><span class="box"></span></label>'
         +   '</div>'
         +   '<div class="sm-td date">' + esc(x.date) + '</div>'
         +   '<div class="sm-td dis">' + dis + '</div>'
         +   '<div class="sm-td cond">' + esc(x.cond) + '</div>'
         +   '<div class="sm-td res">'
         +     '<span class="sm-pill gray">인수 ' + x.possible + '</span>'
         +     '<span class="sm-pill blue">예외 ' + x.except + '</span>'
         +   '</div>'
         + '</div>';
    }
    if (q && visibleCount === 0) {
      h = '<div class="sm-td" style="padding:36px 16px;text-align:center;color:var(--ink-3);font-size:var(--fs-option);grid-column: 1 / -1;">"' + esc(state.historySearch) + '"에 해당하는 조회 내역이 없어요.</div>';
    } else if (visibleCount === 0) {
      h = '<div class="sm-td" style="padding:36px 16px;text-align:center;color:var(--ink-3);font-size:var(--fs-option);grid-column: 1 / -1;">저장된 조회 내역이 없어요.</div>';
    }
    $('#histRows').innerHTML = h;
    $('#histCount').textContent = visibleCount;
    var pt = $('#pagerTotal'); if (pt) pt.textContent = visibleCount;
    updateSelectionUI(visibleIdxs);
  }

  function updateSelectionUI(visibleIdxs) {
    var selectedVisible = 0;
    for (var k = 0; k < visibleIdxs.length; k++) {
      if (state.historySelected[visibleIdxs[k]]) selectedVisible++;
    }
    var selBtn = $('#histDeleteBtn');
    var selCnt = $('#histDeleteCount');
    if (selBtn) selBtn.disabled = selectedVisible === 0;
    if (selCnt) selCnt.textContent = selectedVisible;
    var master = $('#histSelectAll');
    if (master) {
      if (selectedVisible === 0) {
        master.checked = false; master.indeterminate = false;
      } else if (selectedVisible === visibleIdxs.length) {
        master.checked = true; master.indeterminate = false;
      } else {
        master.checked = false; master.indeterminate = true;
      }
    }
  }

  function getVisibleHistoryIdxs() {
    var q = (state.historySearch || '').trim().toLowerCase();
    var cutoff = periodCutoff(state.historyPeriod);
    var out = [];
    for (var i = 0; i < state.history.length; i++) {
      var x = state.history[i];
      var histDate = parseHistoryDate(x.date);
      if (histDate && histDate.getTime() < cutoff.getTime()) continue;
      if (!q) { out.push(i); continue; }
      var match = false;
      if (x.disease && x.disease.toLowerCase().indexOf(q) >= 0) match = true;
      if (!match && x.entries) {
        for (var j = 0; j < x.entries.length; j++) {
          var ed = x.entries[j] && x.entries[j].disease;
          if (ed && ed.toLowerCase().indexOf(q) >= 0) { match = true; break; }
        }
      }
      if (match) out.push(i);
    }
    return out;
  }

  function exceptListHTML() {
    return exceptGroupsHTML();
  }

  function openHistoryModal(idx) {
    var item = state.history[idx];
    if (!item) return;

    $('#histModalDate').textContent = item.date;

    // 병력 개수 표시 (h4 옆)
    var countEl = $('#histModalEntryCount');
    if (countEl) {
      if (item.entries && item.entries.length > 1) {
        countEl.textContent = ' · 총 ' + item.entries.length + '건';
      } else {
        countEl.textContent = '';
      }
    }

    // 병력 표시 — entries 배열이 있으면 다건 렌더링, 없으면 단건 cond 파싱
    var entriesH = '';
    if (item.entries && item.entries.length) {
      for (var e = 0; e < item.entries.length; e++) {
        var en = item.entries[e];
        var num = (e + 1 < 10 ? '0' + (e + 1) : String(e + 1));
        entriesH += '<div class="sm-modal-history sm-modal-history-multi">'
                 +   '<div class="sm-modal-history-num">NO. ' + num + '</div>'
                 +   '<div class="entry-item"><div class="entry-label">질병명</div><div class="entry-value">' + esc(en.disease) + '</div></div>'
                 +   '<div class="entry-item"><div class="entry-label">치료 기간</div><div class="entry-value">' + esc(en.period) + '</div></div>'
                 +   '<div class="entry-item"><div class="entry-label">치료 일수</div><div class="entry-value">' + esc(en.days) + '</div></div>'
                 +   '<div class="entry-item"><div class="entry-label">수술 여부</div><div class="entry-value">' + esc(en.surgery) + '</div></div>'
                 + '</div>';
      }
      $('#histModalEntries').outerHTML = '<div id="histModalEntries">' + entriesH + '</div>';
    } else {
      var parts = (item.cond || '').split(' · ');
      var hasDetail = parts.length >= 3 && /\d{4}\.\d{2}\.\d{2}/.test(parts[0] || '');
      entriesH = '<div class="entry-item"><div class="entry-label">질병명</div><div class="entry-value">' + esc(item.disease) + '</div></div>';
      if (hasDetail) {
        var period  = parts[0];
        var days    = (parts[1] || '').replace(/^일수\s*/, '');
        var surgery = (parts[2] || '').replace(/^수술\s*/, '');
        entriesH +=
            '<div class="entry-item"><div class="entry-label">치료 기간</div><div class="entry-value">' + esc(period) + '</div></div>'
          + '<div class="entry-item"><div class="entry-label">치료 일수</div><div class="entry-value">' + esc(days) + '</div></div>'
          + '<div class="entry-item"><div class="entry-label">수술 여부</div><div class="entry-value">' + esc(surgery) + '</div></div>';
      } else {
        entriesH +=
            '<div class="entry-item"><div class="entry-label">조건</div><div class="entry-value">' + esc(item.cond) + '</div></div>';
      }
      $('#histModalEntries').outerHTML = '<div id="histModalEntries" class="sm-modal-history">' + entriesH + '</div>';
    }

    // 결과 영역
    var subject = (item.entries && item.entries.length > 1)
      ? '<strong>' + item.entries.length + '건의 병력</strong>'
      : '<strong>' + esc(item.disease) + '</strong>';
    var r = '';
    r += '<div class="sm-insight"><div class="sm-insight-in">'
      +   '<img class="mascot" src="../../assets/img_jjapt_result.svg" alt="보비" />'
      +   '<div style="flex:1;min-width:0">'
      +     '<div class="sm-badge"><svg class="ic-svg" width="11" height="11"><use href="#i-sparkles"/></svg> 보비 AI 분석 결과</div>'
      +     '<div class="sm-insight-txt">입력하신 ' + subject + ' 기준으로 인수 가능성이 높은 상품은 <strong>' + item.possible + '건</strong>, 예외질환 기준 <strong style="color:var(--brand-deep)">' + item.except + '건</strong>이에요.</div>'
      +   '</div>'
      + '</div></div>';
    r += '<div class="sm-insight-caveat" style="margin: 0 0 20px;">ⓘ 예상 가이드이며, 실제 인수 여부는 보험사 심사 결과에 따라 다를 수 있어요.</div>';
    r += '<div class="sm-sec"><svg class="ic-svg" width="16" height="16" style="color:var(--brand-deep)"><use href="#i-check-circle"/></svg><h4>인수 가능 상품 <span class="cnt">(' + item.possible + '건)</span></h4></div>';
    if (item.possible === 0) {
      r += '<div class="sm-empty-line">해당 조건으로 인수 가능성이 높은 상품이 없어요.</div>';
    } else {
      r += '<div class="sm-empty-line">인수 가능 상품 ' + item.possible + '건이 확인되었어요.</div>';
    }
    r += '<div class="sm-sec mt"><svg class="ic-svg" width="16" height="16" style="color:var(--ink-2)"><use href="#i-alert"/></svg><h4>예외질환 인수 가능 상품 <span class="cnt">(' + item.except + '건)</span></h4></div>';
    r += exceptListHTML();

    $('#histModalResults').innerHTML = r;

    $('#historyModal').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeHistoryModal() {
    $('#historyModal').hidden = true;
    document.body.style.overflow = '';
  }

  function renderSug(inputEl) {
    document.querySelectorAll('.sm-sug').forEach(function (b) { b.hidden = true; b.innerHTML = ''; });
    if (!inputEl || !state.focused) return;
    var v = (inputEl.value || '').trim();
    var items = v ? DATA.diseases.filter(function(d){ return d.indexOf(v) >= 0 && d !== v; }).slice(0, 5) : [];
    if (!items.length) return;
    var box = inputEl.closest('.sm-field').querySelector('.sm-sug');
    var h = '';
    for (var i = 0; i < items.length; i++) {
      h += '<div class="sm-sug-item" data-name="' + esc(items[i]) + '">'
         +   '<svg class="ic-svg" width="14" height="14"><use href="#i-search"/></svg>'
         +   '<span>' + esc(items[i]) + '</span>'
         + '</div>';
    }
    box.innerHTML = h; box.hidden = false;
    box.querySelectorAll('.sm-sug-item').forEach(function (el) {
      el.addEventListener('mousedown', function (ev) {
        ev.preventDefault();
        var name = this.getAttribute('data-name');
        inputEl.value = name;
        var idx = Number(inputEl.dataset.entryIdx);
        state.entries[idx].disease = name;
        state.focused = false;
        computeDisease();
        render();
        renderSug(inputEl);
      });
    });
  }

  function render() {
    document.querySelectorAll('.sm-screen').forEach(function (el) {
      el.hidden = el.getAttribute('data-screen') !== state.screen;
    });
    document.querySelectorAll('.sm-tab').forEach(function (el) {
      var on = el.getAttribute('data-screen') === state.screen;
      el.classList.toggle('on', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $('#pEmpty').hidden   = state.phase !== 'empty';
    $('#pLoading').hidden = state.phase !== 'loading';
    $('#pResults').hidden = state.phase !== 'results';
    $('#saveBtn').hidden  = state.phase !== 'results';
    $('#rightLabel').textContent = state.phase === 'results' ? '실시간 인수 가이드'
                                : state.phase === 'loading' ? 'AI 분석 진행 중'
                                : '가이드 대기 중';
    $('#rightDot').classList.toggle('idle', state.phase === 'empty');
    var btn = $('#submitBtn');
    if (state.phase === 'results') { btn.disabled = false; btn.textContent = '병력 다시 입력하기'; }
    else { btn.disabled = !state.disease.trim() || state.phase === 'loading'; btn.textContent = '결과 확인하기 →'; }
    $('#loadDisease').textContent = label();
    if (state.phase === 'results') renderResults();
    else $('#resDisease').textContent = label();
  }

  function renderResults() {
    var disease = state.disease.trim();
    var isFracture = /골절/.test(disease);
    var possible = isFracture ? DATA.possibleFracture : [];
    var possibleCount = possible.length;
    var exceptCount = DATA.except.length;

    var pCnt = $('#possibleCount');
    var pWrap = $('#possibleWrap');
    var eCnt = $('#exceptCount');
    var insight = $('#insightText');

    if (pCnt) pCnt.textContent = '(' + possibleCount + '건)';
    if (eCnt) eCnt.textContent = '(' + exceptCount + '건)';

    if (pWrap) {
      if (possibleCount === 0) {
        pWrap.innerHTML = '<div class="sm-empty-line">해당 조건으로 인수 가능한 상품이 없습니다.</div>';
      } else {
        // 회사별 그룹핑 (등장 순서 보존)
        var groups = [];
        var gmap = {};
        for (var i = 0; i < possible.length; i++) {
          var p = possible[i];
          if (!gmap[p.insurer]) { gmap[p.insurer] = { insurer: p.insurer, products: [] }; groups.push(gmap[p.insurer]); }
          gmap[p.insurer].products.push(p);
        }
        var h = '<div class="sm-grp-actions">'
              +   '<span class="sm-grp-summary">' + groups.length + '개 회사 · ' + possibleCount + '건</span>'
              +   '<button type="button" class="sm-grp-toggle-all" data-action="expand">모두 펼치기</button>'
              + '</div>'
              + '<div class="sm-grp-list">';
        var CHEV = '<svg class="ic-svg" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9 L12 15 L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        for (var g = 0; g < groups.length; g++) {
          var grp = groups[g];
          h += '<div class="sm-grp" data-open="0">'
            +    '<button class="sm-grp-head" type="button">'
            +      '<span class="sm-grp-name">' + esc(grp.insurer) + '</span>'
            +      '<span class="sm-grp-count">' + grp.products.length + '건</span>'
            +      '<span class="sm-grp-arrow" aria-hidden="true">' + CHEV + '</span>'
            +    '</button>'
            +    '<div class="sm-grp-body">'
            +      '<div class="sm-chip-list">';
          for (var k = 0; k < grp.products.length; k++) {
            h += '<span class="sm-chip">' + esc(grp.products[k].name) + '</span>';
          }
          h += '</div></div></div>';
        }
        h += '</div>';
        pWrap.innerHTML = h;
      }
    }

    if (insight) {
      var diseaseHTML = '<strong id="resDisease">' + esc(label()) + '</strong>';
      if (possibleCount > 0) {
        insight.innerHTML = '입력하신 ' + diseaseHTML + ' 기준으로 <strong style="color:var(--brand-deep)">' + possibleCount + '건의 인수 가능 상품</strong>을 찾았어요. 예외질환 기준으로도 <strong>' + exceptCount + '건</strong>이 더 있어요.';
      } else {
        insight.innerHTML = '입력하신 ' + diseaseHTML + ' 기준으로는 바로 인수 가능성이 높은 상품은 없지만, 보비가 <strong style="color:var(--brand-deep)">예외질환 기준 ' + exceptCount + '개 상품</strong>에서 가입 가능성을 찾았어요.';
      }
    }
  }

  var entriesBox = $('#entriesContainer');
  entriesBox.addEventListener('input', function (e) {
    var t = e.target;
    if (t.classList.contains('sm-disease')) {
      var idx = Number(t.dataset.entryIdx);
      state.entries[idx].disease = t.value;
      computeDisease();
      render();
      renderSug(t);
      return;
    }
    if (t.classList.contains('sm-date-input')) {
      var idx = Number(t.dataset.entryIdx);
      var role = t.dataset.role;
      var key = role === 'start' ? 'dateStart' : 'dateEnd';
      var formatted = digitsToDate(t.value);
      t.value = formatted;
      state.entries[idx][key] = formatted;
      // 8자리 완성 시 유효성 검증
      if (formatted.length === 10) {
        var d = parseDate(formatted);
        var reset = false;
        if (!d) reset = true;
        else if (d.getTime() > todayStart().getTime()) reset = true;
        else if (role === 'end') {
          var sd = parseDate(state.entries[idx].dateStart);
          if (sd && d.getTime() < sd.getTime()) reset = true;
        }
        if (reset) {
          state.entries[idx][key] = '';
          t.value = '';
        } else {
          if (role === 'start') {
            var ed = parseDate(state.entries[idx].dateEnd);
            if (ed && ed.getTime() < d.getTime()) {
              state.entries[idx].dateEnd = '';
              var card = t.closest('.sm-form-card');
              var endInput = card.querySelector('.sm-date-input[data-role="end"]');
              if (endInput) endInput.value = '';
            }
          }
        }
      }
      if (role === 'start') updateTreatingUI(idx);
      refreshHospField(idx);
      var field = t.closest('.sm-date-field');
      var cal = field && field.querySelector('.sm-cal');
      if (cal && !cal.hidden) openCalendar(t);
      return;
    }
    if (t.classList.contains('sm-hosp-days')) {
      var idx = Number(t.dataset.entryIdx);
      var entry = state.entries[idx];
      var digits = t.value.replace(/\D/g, '');
      var n = digits === '' ? 0 : parseInt(digits, 10);
      if (isNaN(n)) n = 0;
      var max = maxHospDays(entry);
      if (n > max) n = max;
      entry.hospDays = n;
      var clean = String(n);
      if (t.value !== clean) t.value = clean;
      return;
    }
  });
  entriesBox.addEventListener('focusin', function (e) {
    var t = e.target;
    if (t.classList.contains('sm-disease')) {
      state.focused = true;
      renderSug(t);
    } else if (t.classList.contains('sm-date-input')) {
      openCalendar(t);
    }
  });
  entriesBox.addEventListener('focusout', function (e) {
    if (!e.target.classList.contains('sm-disease')) return;
    var inp = e.target;
    setTimeout(function () { state.focused = false; renderSug(inp); }, 140);
  });
  entriesBox.addEventListener('change', function (e) {
    if (!e.target.classList.contains('sm-treating')) return;
    var idx = Number(e.target.dataset.entryIdx);
    var entry = state.entries[idx];
    if (!parseDate(entry.dateStart)) {
      e.target.checked = false;
      entry.treating = false;
      return;
    }
    entry.treating = e.target.checked;
    refreshEndDateField(idx);
    refreshHospField(idx);
  });
  entriesBox.addEventListener('click', function (e) {
    var del = e.target.closest('.sm-entry-del');
    if (del) {
      var card = del.closest('.sm-form-card');
      var idx = Number(card.dataset.entryIdx);
      if (state.entries.length <= 1 || idx === 0) return;
      state.entries.splice(idx, 1);
      computeDisease();
      renderEntries();
      updateAddBtn();
      render();
      return;
    }
    // 캘린더 아이콘
    var ic = e.target.closest('.sm-date-ic');
    if (ic) {
      var field = ic.closest('.sm-date-field');
      var input = field.querySelector('.sm-date-input');
      if (input.disabled) return;
      var cal = field.querySelector('.sm-cal');
      if (cal && !cal.hidden) {
        cal.hidden = true;
      } else {
        openCalendar(input);
      }
      return;
    }
    // 월/해 이동
    var nav = e.target.closest('.sm-cal-nav');
    if (nav) {
      e.stopPropagation(); // innerHTML 교체 시 e.target이 detach 되어 document 핸들러가 오작동하는 것 방지
      var cal = nav.closest('.sm-cal');
      var y = Number(cal.dataset.year);
      var m = Number(cal.dataset.month);
      m += Number(nav.dataset.nav);
      while (m < 0) { m += 12; y--; }
      while (m > 11) { m -= 12; y++; }
      var input = cal.parentElement.querySelector('.sm-date-input');
      var idx = Number(input.dataset.entryIdx);
      var role = input.dataset.role;
      cal.dataset.year = y;
      cal.dataset.month = m;
      cal.innerHTML = calendarInnerHTML(y, m, idx, role);
      return;
    }
    // 날짜 선택
    var day = e.target.closest('.sm-cal-day');
    if (day && !day.disabled) {
      var date = day.dataset.date;
      var cal = day.closest('.sm-cal');
      var field = cal.parentElement;
      var input = field.querySelector('.sm-date-input');
      var idx = Number(input.dataset.entryIdx);
      var role = input.dataset.role;
      var key = role === 'start' ? 'dateStart' : 'dateEnd';
      input.value = date;
      state.entries[idx][key] = date;
      cal.hidden = true;
      // 시작일 변경 시 종료일이 이전이면 초기화
      if (role === 'start') {
        var ed = parseDate(state.entries[idx].dateEnd);
        var sd = parseDate(date);
        if (ed && sd && ed.getTime() < sd.getTime()) {
          state.entries[idx].dateEnd = '';
          var endInput = field.parentElement.querySelector('.sm-date-input[data-role="end"]');
          if (endInput) endInput.value = '';
        }
        updateTreatingUI(idx);
      }
      refreshHospField(idx);
      return;
    }
  });

  // 캘린더 외부 클릭 시 닫기
  document.addEventListener('click', function (e) {
    if (e.target.closest('.sm-date-field')) return;
    document.querySelectorAll('.sm-cal').forEach(function (c) { c.hidden = true; });
  });

  $('#addEntryBtn').addEventListener('click', function () {
    if (state.entries.length >= MAX_ENTRIES) return;
    state.entries.push(newEntry());
    renderEntries();
    updateAddBtn();
    render();
  });

  function openUnsavedModal() {
    $('#unsavedModal').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeUnsavedModal() {
    $('#unsavedModal').hidden = true;
    document.body.style.overflow = '';
  }

  $('#unsavedModal').addEventListener('click', function (e) {
    if (e.target.closest('#confirmDiscard')) {
      closeUnsavedModal();
      state.phase = 'empty';
      state.saved = false;
      render();
      return;
    }
    if (e.target.closest('#confirmSave')) {
      closeUnsavedModal();
      $('#saveBtn').click();
      return;
    }
    if (e.target.closest('[data-close="1"]')) {
      closeUnsavedModal();
      return;
    }
  });

  $('#submitBtn').addEventListener('click', function () {
    if (state.phase === 'results') {
      if (!state.saved) {
        openUnsavedModal();
        return;
      }
      state.phase = 'empty';
      state.saved = false;
      render();
      return;
    }
    if (!state.disease.trim() || state.phase === 'loading') return;
    state.phase = 'loading'; render();
    var bar = $('#loadBar'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
    var resultEl = document.querySelector('.sm-result');
    if (resultEl) resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    clearTimeout(window.__t);
    window.__t = setTimeout(function () { state.phase = 'results'; state.saved = false; render(); }, 2100);
  });

  $('#saveBtn').addEventListener('click', function () {
    var n = new Date();
    var pad = function (z) { return (('' + z).length < 2) ? '0' + z : '' + z; };
    var date = n.getFullYear() + '.' + pad(n.getMonth() + 1) + '.' + pad(n.getDate())
             + ' ' + pad(n.getHours()) + ':' + pad(n.getMinutes());
    state.history.unshift({
      date: date,
      disease: (state.disease.trim() || 'K05 치은염 및 치주질환'),
      cond: '째피티 · 예외질환 148건',
      possible: 0,
      except: 148
    });
    state.saved = true;
    renderHistory();
    state.screen = 'history'; render();
    showToast('<svg class="ic-svg" width="17" height="17" style="color:var(--brand)"><use href="#i-check"/></svg> 조회 내역에 저장되었어요');
  });

  function showToast(html) {
    var t = $('#toast');
    t.innerHTML = html;
    t.style.display = 'flex';
    clearTimeout(window.__tt);
    window.__tt = setTimeout(function () { t.style.display = 'none'; }, 2600);
  }

  document.querySelectorAll('.sm-tab').forEach(function (el) {
    el.addEventListener('click', function () { state.screen = this.getAttribute('data-screen'); render(); });
  });

  // 상품 그룹 토글 (인수 가능 · 예외질환 공통)
  function bindGrpToggle(root) {
    root.addEventListener('click', function (e) {
      var head = e.target.closest('.sm-grp-head');
      if (head) {
        var grp = head.closest('.sm-grp');
        grp.dataset.open = grp.dataset.open === '1' ? '0' : '1';
        return;
      }
      var toggle = e.target.closest('.sm-grp-toggle-all');
      if (toggle) {
        var action = toggle.dataset.action;
        var newOpen = action === 'collapse' ? '0' : '1';
        var actions = toggle.closest('.sm-grp-actions');
        var grpList = actions && actions.nextElementSibling;
        if (grpList) {
          grpList.querySelectorAll('.sm-grp').forEach(function (g) { g.dataset.open = newOpen; });
        }
        toggle.dataset.action = action === 'collapse' ? 'expand' : 'collapse';
        toggle.textContent = action === 'collapse' ? '모두 펼치기' : '모두 접기';
        return;
      }
    });
  }
  bindGrpToggle($('#pResults'));
  bindGrpToggle($('#historyModal'));

  // 조회 내역 병력 검색
  $('#histSearch').addEventListener('input', function (e) {
    state.historySearch = e.target.value;
    renderHistory();
  });

  // 조회 내역 기간 필터
  document.querySelectorAll('.filter-bar .pill[data-period]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.historyPeriod = btn.getAttribute('data-period');
      document.querySelectorAll('.filter-bar .pill[data-period]').forEach(function (p) {
        p.classList.toggle('on', p === btn);
      });
      // 기간이 바뀌면 필터에서 벗어난 항목의 선택 해제
      var visible = getVisibleHistoryIdxs();
      var vSet = {};
      visible.forEach(function (i) { vSet[i] = true; });
      Object.keys(state.historySelected).forEach(function (k) {
        if (!vSet[k]) delete state.historySelected[k];
      });
      renderHistory();
    });
  });

  // 개별 체크박스
  $('#histRows').addEventListener('change', function (e) {
    if (!e.target.classList.contains('hist-row-check')) return;
    var idx = Number(e.target.dataset.idx);
    if (e.target.checked) state.historySelected[idx] = true;
    else delete state.historySelected[idx];
    var row = e.target.closest('.sm-tr');
    if (row) row.classList.toggle('is-selected', e.target.checked);
    updateSelectionUI(getVisibleHistoryIdxs());
  });

  // 전체 선택 (필터링된 결과 기준)
  $('#histSelectAll').addEventListener('change', function (e) {
    var visible = getVisibleHistoryIdxs();
    if (e.target.checked) {
      visible.forEach(function (i) { state.historySelected[i] = true; });
    } else {
      visible.forEach(function (i) { delete state.historySelected[i]; });
    }
    renderHistory();
  });

  // 선택 삭제 버튼 → 확인 모달 오픈
  $('#histDeleteBtn').addEventListener('click', function () {
    var visible = getVisibleHistoryIdxs();
    var selectedVisible = visible.filter(function (i) { return state.historySelected[i]; });
    if (selectedVisible.length === 0) return;
    $('#deleteCountLabel').textContent = selectedVisible.length;
    $('#deleteModal').hidden = false;
    document.body.style.overflow = 'hidden';
  });

  // 삭제 확인 모달
  $('#deleteModal').addEventListener('click', function (e) {
    if (e.target.closest('#confirmDelete')) {
      // 삭제 실행 (선택된 인덱스를 큰 순서부터 splice)
      var idxs = Object.keys(state.historySelected).map(Number).sort(function (a, b) { return b - a; });
      var deletedCount = 0;
      idxs.forEach(function (i) {
        if (i >= 0 && i < state.history.length) {
          state.history.splice(i, 1);
          deletedCount++;
        }
      });
      state.historySelected = {};
      $('#deleteModal').hidden = true;
      document.body.style.overflow = '';
      renderHistory();
      // 삭제 완료 토스트
      var t = $('#toast');
      var msgEl = t.querySelector('span, div') || t;
      // 토스트 텍스트 임시 갱신 (구조 유지)
      var origHTML = t.innerHTML;
      t.innerHTML = '<svg class="ic-svg" width="17" height="17" style="color:var(--brand)"><use href="#i-check"/></svg> ' + deletedCount + '건의 조회 내역을 삭제했어요';
      t.style.display = 'flex';
      clearTimeout(window.__tt);
      window.__tt = setTimeout(function () {
        t.style.display = 'none';
        t.innerHTML = origHTML;
      }, 2400);
      return;
    }
    if (e.target.closest('[data-close="1"]')) {
      $('#deleteModal').hidden = true;
      document.body.style.overflow = '';
      return;
    }
  });

  // 조회 내역 행 클릭 → 상세 모달 (체크박스 클릭은 제외)
  $('#histRows').addEventListener('click', function (e) {
    if (e.target.closest('.sm-tbl-check')) return;
    var row = e.target.closest('.sm-tr');
    if (!row) return;
    var idx = Number(row.getAttribute('data-idx'));
    if (!isNaN(idx)) openHistoryModal(idx);
  });

  // 모달 닫기 (백드롭 / 닫기 버튼)
  $('#historyModal').addEventListener('click', function (e) {
    var t = e.target.closest('[data-close="1"]');
    if (t) closeHistoryModal();
  });

  // ===== 의견 보내기 모달 =====
  function openFeedbackModal() {
    var today = new Date();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var todayStr = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
    var mins = Math.floor(today.getMinutes() / 5) * 5;
    $('#fbErrorDate').value = todayStr;
    $('#fbErrorDate').max = todayStr;
    $('#fbErrorTime').value = pad(today.getHours()) + ':' + pad(mins);
    // 초기 상태: 데이터 오류 제보
    var radios = document.querySelectorAll('input[name="fbType"]');
    radios.forEach(function (r) { r.checked = (r.value === 'error'); });
    $('#fbFieldsError').hidden = false;
    $('#fbFieldsProduct').hidden = true;
    $('#fbErrorContent').value = '';
    $('#fbProductContent').value = '';
    $('#feedbackModal').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeFeedbackModal() {
    $('#feedbackModal').hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.sm-feedback-link').forEach(function (el) {
    el.addEventListener('click', function () { openFeedbackModal(); });
  });

  $('#feedbackModal').addEventListener('change', function (e) {
    var r = e.target.closest('input[name="fbType"]');
    if (r) {
      var isError = r.value === 'error';
      $('#fbFieldsError').hidden = !isError;
      $('#fbFieldsProduct').hidden = isError;
      return;
    }
    if (e.target && e.target.id === 'fbErrorDate') {
      var max = e.target.max;
      if (max && e.target.value && e.target.value > max) e.target.value = max;
      return;
    }
  });

  $('#feedbackModal').addEventListener('click', function (e) {
    if (e.target.closest('[data-close="1"]')) { closeFeedbackModal(); return; }
    if (e.target.closest('#fbSubmit')) {
      var type = document.querySelector('input[name="fbType"]:checked').value;
      var ok = false;
      if (type === 'error') {
        var d = $('#fbErrorDate').value.trim();
        var c = $('#fbErrorContent').value.trim();
        ok = !!(d && c);
      } else {
        ok = !!$('#fbProductContent').value.trim();
      }
      if (!ok) {
        (type === 'error' ? $('#fbErrorContent') : $('#fbProductContent')).focus();
        return;
      }
      closeFeedbackModal();
      showToast('<svg class="ic-svg" width="17" height="17" style="color:var(--brand)"><use href="#i-check"/></svg> 의견이 전송되었어요. 감사합니다!');
    }
  });

  // ESC 키로 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('#deleteModal').hidden) { $('#deleteModal').hidden = true; document.body.style.overflow = ''; return; }
    if (!$('#unsavedModal').hidden) { closeUnsavedModal(); return; }
    if (!$('#feedbackModal').hidden) { closeFeedbackModal(); return; }
    if (!$('#historyModal').hidden) closeHistoryModal();
  });

  renderExcept();
  renderHistory();
  renderEntries();
  updateAddBtn();
  render();
})();
