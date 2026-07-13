/* ============================================================
   째피티 · 모바일 (챗봇형) — 페이지 로직
   ============================================================ */
(function () {

  // ===== 데이터 (desktop script.js 와 동일한 소스) =====
  var DISEASES = [
    "K05 치은염 및 치주질환","I10 본태성 고혈압","E11 2형 당뇨병","E78 고지혈증",
    "E04 갑상선 결절","K21 역류성 식도염","K29 위염","M51 추간판탈출증(디스크)",
    "J45 천식","B18 만성 B형 간염","N20 요로결석","H25 백내장",
    "S52 아래팔 골절","S62 손목·손 골절","S82 아래다리 골절","S22 갈비뼈 골절","S72 대퇴골 골절"
  ];
  var COMMON = ["I10 본태성 고혈압", "E11 2형 당뇨병", "E78 고지혈증", "E04 갑상선 결절", "M51 추간판탈출증(디스크)", "S52 아래팔 골절"];

  var EXCEPT = [
    { insurer: "NH농협손해보험", name: "NH335굿플러스건강보험" },
    { insurer: "NH농협손해보험", name: "NH헤아림3.10.10건강보험" },
    { insurer: "NH농협손해보험", name: "NH헤아림355건강보험" },
    { insurer: "AIG손해보험",   name: "AIG 315플러스 간편건강보험" },
    { insurer: "AIG손해보험",   name: "AIG 325플러스 간편건강보험" },
    { insurer: "흥국화재",       name: "흥GOOD 든든한 325 아마시가한도 간편종합보험" },
    { insurer: "흥국화재",       name: "흥Good 고비지 3.10.5 간편종합보험 · 고지혈증·당뇨병 제외" },
    { insurer: "흥국화재",       name: "흥Good 고비지 3.10.5 간편종합보험 · 고지혈증 제외" },
    { insurer: "흥국화재",       name: "흥Good 고비지 3.10.5 간편종합보험 · 고혈압·고지혈증 제외" },
    { insurer: "흥국화재",       name: "흥Good 고비지 3.10.5 간편종합보험 · 고혈압·당뇨병 제외" },
    { insurer: "흥국화재",       name: "흥Good 고비지 3.10.5 간편종합보험 · 고혈압 제외" },
    { insurer: "흥국화재",       name: "흥Good 고비지 3.10.5 간편종합보험 · 당뇨병 제외" }
  ];

  // 데스크탑 script.js의 DATA.possibleFracture와 동일 (전체 상품 리스트 소스)
  var POSSIBLE_FRACTURE = (function () {
    var arr = [];
    function add(insurer, names) { names.forEach(function (n) { arr.push({ insurer: insurer, name: n }); }); }
    add("메리츠화재", ["(무)메리츠통합간편건강보험(3.0.5)","(무)메리츠통합간편건강보험(3.1.5)","(무)메리츠통합간편건강보험(3.2.5)","(무)메리츠통합간편건강보험(3.3.5)","(무)메리츠통합간편건강보험(3.4.5)","(무)메리츠통합간편건강보험(3.5.5)","(무)메리츠통합간편건강보험(3.6.5)","(무)메리츠통합간편건강보험(3.7.5)","(무)메리츠통합간편건강보험(3.8.5)","(무)메리츠통합간편건강보험(3.9.5)","(무)메리츠통합간편건강보험(3.10.5)","(무)메리츠간편31건강보험","(무)메리츠유병력자실손의료비","The가벼운간편355건강보험","통합간편건강보험(355수술고지간편심사형)","통합간편건강보험(355입원고지간편심사형)"]);
    add("흥국화재", ["흥GOOD 든든한 3.0.5 간편종합보험","흥GOOD 든든한 3.1.5 간편종합보험","흥GOOD 든든한 3.2.5 간편종합보험","흥GOOD 든든한 3.3.5 간편종합보험","흥GOOD 든든한 3.4.5 간편종합보험","흥GOOD 든든한 3.5.5 간편종합보험","흥GOOD 든든한 3.6.5 간편종합보험","흥GOOD 든든한 3.10.5 간편종합보험","흥GOOD 든든한 325 암만생각해도 간편종합보험","흥GOOD 유병력자 실손의료보험","흥Good고당지3.10.5간편종합보험_고지혈증,당뇨병없음","흥Good고당지3.10.5간편종합보험_고지혈증없음","흥Good고당지3.10.5간편종합보험_고혈압, 고지혈증 없음","흥Good고당지3.10.5간편종합보험_고혈압,당뇨병없음","흥Good고당지3.10.5간편종합보험_고혈압없음","흥Good고당지3.10.5간편종합보험_당뇨병없음"]);
    add("NH농협손해보험", ["간편가입헤아림실손의료비보험","NH335굿패스건강보험","NH헤아림3.10.10건강보험","NH헤아림355건강보험","NH헤아림345건강보험","NH헤아림365건강보험"]);
    add("라이나손해보험", ["(무)더핏 간편한 나만의 종합보험(갱신형)2509 1종(325(암)간편심사형)","(무)더핏 간편한 나만의 종합보험(갱신형)2509 1종(355(6대질병)간편심사형)","(무)더핏 간편한 원모어 암보험(갱신형) 1종(325(암)간편심사형)","(무)더핏 간편한 원모어 암보험(갱신형) 2종(355(6대질병)간편심사형)","(무)더핏 프리미엄 종합보험 1종","(무)더핏 프리미엄 종합보험 2종","(무)더핏 시니어 종합보험 1종"]);
    add("롯데손해보험", ["let: simple 3.2.5 간편맞춤 건강보험","let: simple 3.3.5 간편맞춤 건강보험","let: simple 3.4.5 간편맞춤 건강보험","let: simple 3.5.5 간편맞춤 건강보험","let: simple 간편 3.5.10","let: simple 간편 3.6.10","let: simple 간편 3.7.10","let: simple 간편 3.8.10","let: simple 간편 3.9.10","let: simple 간편 3.10.10","let:care 유병력자 실손의료보험","let:care 종합암보험(88플러스원)3.10.10"]);
    add("하나손해보험", ["(3N5)하나더퍼스트 315 간편건강보험","(3N5)하나더퍼스트 325 간편건강보험","(3N5)하나더퍼스트 335 간편건강보험","(3N5)하나더퍼스트 345 간편건강보험","(3N5)하나더퍼스트 355 간편건강보험","(3N5)하나더퍼스트 365 간편건강보험","(3N5)하나더퍼스트 375 간편건강보험","(3N5)하나더퍼스트 395 간편건강보험","(3N5)하나더퍼스트 3105 간편건강보험","(Grade)하나더퍼스트건강간편보험"]);
    add("한화손해보험", ["한화 3N5 더간편건강보험_305","한화 3N5 더간편건강보험_315","한화 3N5 더간편건강보험_325","한화 3N5 더간편건강보험_335","한화 3N5 더간편건강보험_345","한화 3N5 더간편건강보험_355","한화 3N5 더간편건강보험_355_고혈압없음","한화 3N5 더간편건강보험_355_당뇨,고혈압없음","한화 3N5 더간편건강보험_355_당뇨없음","한화 311 간편건강보험2601","한화 더 경증 간편건강보험_3.10.5","한화 더 경증 간편건강보험_3.10.5_고혈압없음","한화 더 경증 간편건강보험_3.10.5_당뇨,고혈압없음","한화 더 경증 간편건강보험_3.10.5_당뇨없음","한화 더 경증 간편건강보험_3.10.5_고지혈증없음","한화 더 경증 간편건강보험_3.10.5_당뇨,고혈압,고지혈증없음"]);
    add("삼성화재", ["(무)삼성 간편건강보험(3.0.5)","(무)삼성 간편건강보험(3.1.5)","(무)삼성 간편건강보험(3.2.5)","(무)삼성 간편건강보험(3.3.5)","(무)삼성 간편건강보험(3.5.5)","(무)삼성 간편건강보험(3.6.5)","(무)삼성 간편건강보험(3.7.5)","(무)삼성 간편건강보험(3.8.5)","(무)삼성 간편건강보험(3.9.5)","(무)삼성 간편건강보험(3.10.5)","(무)삼성 실손의료보험(간편심사형)","(무)삼성 유병력자 간편심사보험","(무)삼성 실버 간편건강보험(3.5.5)","(무)삼성 실버 간편건강보험(3.10.5)","(무)삼성 여성전용 간편건강보험(3.10.5)"]);
    add("KB손해보험", ["KB The간편한 건강보험(3.0.5)","KB The간편한 건강보험(3.1.5)","KB The간편한 건강보험(3.5.5)","KB The간편한 건강보험(3.10.5)","KB 다이렉트 간편건강보험","KB 매직카 간편심사보험","KB 골드라이프 간편건강보험"]);
    add("현대해상", ["굿앤굿 간편건강보험(3.0.5)","굿앤굿 간편건강보험(3.5.5)","굿앤굿 간편건강보험(3.10.5)","2Q패스 간편건강보험","3Q패스 간편건강보험","4Q패스 간편건강보험","굿앤굿 유병력자 실손의료보험","굿앤굿 실버 간편건강보험"]);
    add("DB손해보험", ["프로미라이프 간편건강보험(3.0.5)","프로미라이프 간편건강보험(3.5.5)","프로미라이프 간편건강보험(3.10.5)","프로미 유병력자 실손의료보험","프로미라이프 간편심사 종합보험"]);
    add("AIG손해보험", ["AIG 315플러스 간편건강보험","AIG 325플러스 간편건강보험","AIG 335플러스 간편건강보험","AIG 355플러스 간편건강보험"]);
    add("캐롯손해보험", ["캐롯 간편건강보험(3.5.5)","캐롯 간편건강보험(3.10.5)","캐롯 유병력자 간편건강보험"]);
    add("MG손해보험", ["MG 간편건강보험","MG 유병력자 실손의료보험","MG 실버 간편건강보험"]);
    add("AXA손해보험", ["AXA 간편건강보험(325)","AXA 간편건강보험(355)","AXA 유병력자 간편심사보험"]);
    return arr;
  })();

  // 데스크탑 script.js와 동일한 데모 데이터
  var HISTORY_SEED = [
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
  ];

  // ===== 상수 =====
  var MAX_ENTRIES = 5; // desktop과 동일

  // ===== 상태 =====
  function initState() {
    return {
      log: [
        { id: 1, who: 'bot', text: '안녕하세요, 스마트보비 째피티예요. 몇 가지만 답해주시면 인수 가능성이 있는 상품을 찾아드릴게요.' },
        { id: 2, who: 'bot', text: '어떤 병력이 있으신가요? 아래에서 선택하거나 직접 입력해 주세요.' }
      ],
      entries: [],
      draft: { disease: '', period: '', inpatientDays: 0, surgery: null },
      phase: 'collecting',
      sub: 'disease',
      textVal: '',
      focused: false,
      hist: [],
      periodForm: { dateStart: '', dateEnd: '', treating: false },
      history: HISTORY_SEED.slice(),
      historyPeriod: '3m',
      sheetView: 'list',
      sheetIdx: null
    };
  }
  var state = initState();
  var _id = 100;
  function nid() { return ++_id; }
  function snap() {
    return {
      log: state.log.slice(),
      entries: state.entries.slice(),
      draft: Object.assign({}, state.draft),
      phase: state.phase,
      sub: state.sub
    };
  }

  // ===== DOM 헬퍼 =====
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var IMG_BOT = '../../assets/img_jjapt.png';
  var IMG_BOT_LOADING = '../../assets/img_jjapt_loading.svg';
  var IMG_BOT_RESULT = '../../assets/img_jjapt_result.svg';

  var IC_PENCIL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
  var IC_X = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  var IC_SEARCH = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';

  function metaOf(e) {
    var hosp = (e.inpatientDays && e.inpatientDays > 0) ? ('입원 ' + e.inpatientDays + '일') : '입원 없음';
    return e.period + ' · ' + hosp + ' · 수술 ' + (e.surgery ? '있음' : '없음');
  }

  // ===== 흐름 제어 =====
  function advance(userText, patch, botText, botHelp) {
    state.hist.push(snap());
    state.log = state.log.concat([{ id: nid(), who: 'user', text: userText }]);
    if (botText) {
      state.log = state.log.concat([{ id: nid(), who: 'bot', text: botText, help: botHelp }]);
    }
    var p = (typeof patch === 'function') ? patch() : patch;
    if (p) for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) state[k] = p[k];
    state.textVal = '';
    state.focused = false;
    var mi = $('#jmInput');
    if (mi) mi.value = '';
    render();
  }

  function pickDisease(name) {
    if (!name || !name.trim()) return;
    var nm = name.trim();
    advance(nm,
      {
        draft: Object.assign({}, state.draft, { disease: nm }),
        sub: 'period',
        periodForm: { dateStart: '', dateEnd: '', treating: false }
      },
      '치료 기간을 알려주세요.'
    );
  }

  // ===== 치료 기간 폼 =====
  function isoToDot(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
    return m ? (m[1] + '.' + m[2] + '.' + m[3]) : '';
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  // 오늘 (데모 기준일 2026-07-09) — 데스크탑 script.js와 동일
  function todayIso() {
    var d = new Date(2026, 6, 9);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function readPeriodForm() {
    var start = $('#jmPeriodStart');
    var end = $('#jmPeriodEnd');
    var treating = $('#jmPeriodTreating');
    if (start) state.periodForm.dateStart = start.value;
    if (end) state.periodForm.dateEnd = end.value;
    if (treating) state.periodForm.treating = treating.checked;
  }
  function submitPeriod() {
    readPeriodForm();
    var pf = state.periodForm;
    var errEl = $('#jmPeriodErr');

    function fail(msg) {
      if (!errEl) return;
      errEl.textContent = msg;
      errEl.hidden = false;
    }
    var today = todayIso();
    if (!pf.dateStart) return fail('시작일을 선택해 주세요.');
    if (pf.dateStart > today) return fail('시작일은 오늘 이후로 선택할 수 없어요.');
    if (!pf.treating && !pf.dateEnd) return fail('종료일을 선택하거나 "지금도 치료 중"을 체크해 주세요.');
    if (!pf.treating && pf.dateEnd && pf.dateEnd > today) return fail('종료일은 오늘 이후로 선택할 수 없어요.');
    if (!pf.treating && pf.dateEnd && pf.dateEnd < pf.dateStart) return fail('종료일이 시작일보다 앞설 수 없어요.');

    var s = isoToDot(pf.dateStart);
    var e = pf.treating ? '진행 중' : isoToDot(pf.dateEnd);
    var periodStr = s + ' ~ ' + e;

    advance(periodStr,
      { draft: Object.assign({}, state.draft, { period: periodStr }), sub: 'inpatient' },
      '입원한 일수는 며칠인가요? (없다면 0으로 두세요)'
    );
  }

  // ===== 입원 일수 폼 =====
  // 데모 기준일 (desktop과 동일: 2026.07.09)
  function demoToday() { return new Date(2026, 6, 9); }
  // 치료 기간(periodForm)으로부터 입원 가능 최대 일수 계산
  function maxHospDaysFromForm() {
    var pf = state.periodForm;
    if (!pf || !pf.dateStart) return 0;
    var sd = new Date(pf.dateStart);
    var ed = pf.treating ? demoToday() : (pf.dateEnd ? new Date(pf.dateEnd) : null);
    if (!ed || isNaN(sd.getTime()) || isNaN(ed.getTime())) return 0;
    var days = Math.floor((ed.getTime() - sd.getTime()) / 86400000) + 1;
    return Math.max(0, days);
  }
  function readHospField() {
    var el = $('#jmHospDays');
    if (!el) return 0;
    var max = maxHospDaysFromForm() || 0;
    var n = parseInt(el.value, 10);
    if (isNaN(n) || n < 0) n = 0;
    if (max > 0 && n > max) n = max;
    return n;
  }
  function submitHosp() {
    var days = readHospField();
    state.draft.inpatientDays = days;
    var userText = days > 0 ? ('입원 ' + days + '일') : '입원한 적 없어요';
    advance(userText,
      { draft: Object.assign({}, state.draft, { inpatientDays: days }), sub: 'surgery' },
      '수술한 적이 있으신가요?'
    );
  }
  function bindHospForm() {
    var el = $('#jmHospDays');
    var minus = $('#jmHospMinus');
    var plus = $('#jmHospPlus');
    if (!el) return;
    var max = maxHospDaysFromForm() || 0;
    // iOS Safari 등의 폼 값 자동 복원 무시 — state 값으로 강제 세팅
    var initN = state.draft.inpatientDays || 0;
    if (max > 0 && initN > max) initN = max;
    el.value = String(initN);
    state.draft.inpatientDays = initN;
    function clamp() {
      var n = parseInt(el.value, 10);
      if (isNaN(n) || n < 0) n = 0;
      if (max > 0 && n > max) n = max;
      el.value = String(n);
      state.draft.inpatientDays = n;
    }
    el.addEventListener('input', function () {
      var raw = el.value.replace(/\D/g, '');
      if (raw !== el.value) el.value = raw;
      // 입력 중에도 최대치 초과는 즉시 잘라내기
      if (max > 0) {
        var n = parseInt(el.value, 10);
        if (!isNaN(n) && n > max) el.value = String(max);
      }
    });
    el.addEventListener('blur', clamp);
    if (minus) minus.addEventListener('click', function () {
      var n = parseInt(el.value, 10); if (isNaN(n)) n = 0;
      el.value = String(Math.max(0, n - 1));
      state.draft.inpatientDays = +el.value;
    });
    if (plus) plus.addEventListener('click', function () {
      var n = parseInt(el.value, 10); if (isNaN(n)) n = 0;
      var cap = max > 0 ? max : 999;
      el.value = String(Math.min(cap, n + 1));
      state.draft.inpatientDays = +el.value;
    });
  }
  // 재렌더링 없이 종료일 disable 상태 · 표시 텍스트만 갱신
  function bindPeriodForm() {
    var start = $('#jmPeriodStart');
    var end = $('#jmPeriodEnd');
    var startDisp = $('#jmPeriodStartDisp');
    var endDisp = $('#jmPeriodEndDisp');
    var endWrap = end && end.parentElement;
    var treating = $('#jmPeriodTreating');
    var errEl = $('#jmPeriodErr');
    if (!start || !end || !treating) return;
    // iOS Safari 등의 폼 값 자동 복원 방어 — state 값으로 강제 세팅
    start.value = state.periodForm.dateStart || '';
    end.value = state.periodForm.dateEnd || '';
    treating.checked = !!state.periodForm.treating;
    end.disabled = !!state.periodForm.treating;
    if (endWrap) endWrap.classList.toggle('disabled', !!state.periodForm.treating);
    var today = todayIso();
    function clearErr() { if (errEl) errEl.hidden = true; }
    function showErr(msg) { if (errEl) { errEl.textContent = msg; errEl.hidden = false; } }
    function updateDisp(input, disp, isEndAndTreating) {
      var v = input.value;
      if (v) {
        disp.textContent = isoToDot(v);
        disp.classList.remove('empty');
      } else if (isEndAndTreating) {
        disp.textContent = '진행 중';
        disp.classList.remove('empty');
      } else {
        disp.textContent = '날짜 선택';
        disp.classList.add('empty');
      }
    }
    function clampFuture(el, key, disp, isEndAndTreating) {
      if (el.value && el.value > today) {
        el.value = '';
        state.periodForm[key] = '';
        if (disp) updateDisp(el, disp, isEndAndTreating);
        showErr('오늘 이후 날짜는 선택할 수 없어요.');
      }
    }
    start.addEventListener('change', function () {
      state.periodForm.dateStart = start.value;
      updateDisp(start, startDisp, false);
      clearErr();
      clampFuture(start, 'dateStart', startDisp, false);
    });
    end.addEventListener('change', function () {
      state.periodForm.dateEnd = end.value;
      updateDisp(end, endDisp, false);
      clearErr();
      clampFuture(end, 'dateEnd', endDisp, false);
    });
    treating.addEventListener('change', function () {
      state.periodForm.treating = treating.checked;
      end.disabled = treating.checked;
      if (endWrap) endWrap.classList.toggle('disabled', treating.checked);
      if (treating.checked) {
        end.value = ''; state.periodForm.dateEnd = '';
      }
      updateDisp(end, endDisp, treating.checked);
      clearErr();
    });
  }

  function finishEntry(surgery, userText) {
    var willReachMax = (state.entries.length + 1) >= MAX_ENTRIES;
    var patch = function () {
      var entry = {
        id: nid(),
        disease: state.draft.disease,
        period: state.draft.period,
        inpatientDays: state.draft.inpatientDays,
        surgery: surgery
      };
      return {
        entries: state.entries.concat([entry]),
        draft: { disease: '', period: '', inpatientDays: 0, surgery: null },
        phase: willReachMax ? 'confirm' : 'collecting',
        sub: willReachMax ? '' : 'more'
      };
    };
    var botText = willReachMax
      ? '병력은 최대 ' + MAX_ENTRIES + '개까지 입력할 수 있어요. 입력하신 병력을 확인해 주세요.'
      : '이 외에도 알려주실 병력이 있나요?';
    advance(userText, patch, botText);
  }

  function undo() {
    if (!state.hist.length) return;
    var p = state.hist.pop();
    state.log = p.log;
    state.entries = p.entries;
    state.draft = p.draft;
    state.phase = p.phase;
    state.sub = p.sub;
    render();
  }

  function addMore() {
    if (state.entries.length >= MAX_ENTRIES) return; // 최대치 초과 방어
    state.hist.push(snap());
    state.phase = 'collecting';
    state.sub = 'disease';
    state.log = state.log.concat([{ id: nid(), who: 'bot', text: '추가할 병력의 질병명을 알려주세요.' }]);
    render();
  }

  function removeEntry(id) {
    state.entries = state.entries.filter(function (x) { return x.id !== id; });
    render();
  }

  function startAnalysis() {
    if (!state.entries.length) return;
    clearTimeout(window._jmT);
    state.hist.push(snap());
    state.phase = 'analyzing';
    state.sub = '';
    state.log = state.log.concat([{ id: nid(), who: 'user', text: '이대로 심사 시작' }]);
    render();
    window._jmT = setTimeout(function () {
      state.phase = 'result';
      render();
    }, 2200);
  }

  function restart() {
    clearTimeout(window._jmT);
    var keepHistory = state.history;
    state = initState();
    state.history = keepHistory;
    render();
  }

  // ===== 저장 (결과를 조회 내역에 추가) =====
  function pad2n(n) { return (n < 10 ? '0' : '') + n; }
  function saveCurrentResult() {
    if (!state.entries.length) return;
    var r = calcResult();
    var now = new Date();
    var date = now.getFullYear() + '.' + pad2n(now.getMonth() + 1) + '.' + pad2n(now.getDate())
             + ' ' + pad2n(now.getHours()) + ':' + pad2n(now.getMinutes());
    var first = state.entries[0];
    var histEntries = state.entries.map(function (e) {
      var d = (e.inpatientDays && e.inpatientDays > 0) ? (e.inpatientDays + '일') : '없음';
      return {
        disease: e.disease,
        period: e.period || '-',
        days: d,
        surgery: e.surgery ? '예' : '아니오'
      };
    });
    var firstHosp = (first.inpatientDays && first.inpatientDays > 0) ? ('입원 ' + first.inpatientDays + '일') : '입원 없음';
    var cond = state.entries.length > 1
      ? '복합 병력 · ' + state.entries.length + '건'
      : (first.period + ' · ' + firstHosp + ' · 수술 ' + (first.surgery ? '있음' : '없음'));
    state.history.unshift({
      date: date,
      disease: first.disease,
      cond: cond,
      entries: histEntries,
      possible: r.possibleTotal,
      except: r.exceptTotal
    });
  }

  // ===== 조회 내역 시트 =====
  function openSheet() {
    state.sheetView = 'list';
    state.sheetIdx = null;
    var s = $('#jmSheet');
    s.hidden = false;
    s.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderSheet();
  }
  function closeSheet() {
    var s = $('#jmSheet');
    s.hidden = true;
    s.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function parseHistDate(s) {
    var m = /^(\d{4})\.(\d{2})\.(\d{2})/.exec(s || '');
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  function periodCutoff(p) {
    // 데모 기준일: 2026.07.09 (desktop과 동일)
    var d = new Date(2026, 6, 9);
    var y = d.getFullYear(), mo = d.getMonth(), da = d.getDate();
    if (p === '1m') return new Date(y, mo - 1, da);
    if (p === '6m') return new Date(y, mo - 6, da);
    if (p === '1y') return new Date(y - 1, mo, da);
    return new Date(y, mo - 3, da);
  }
  function visibleHistoryIdxs() {
    var cutoff = periodCutoff(state.historyPeriod);
    var out = [];
    for (var i = 0; i < state.history.length; i++) {
      var d = parseHistDate(state.history[i].date);
      if (d && d.getTime() < cutoff.getTime()) continue;
      out.push(i);
    }
    return out;
  }

  function renderSheetList() {
    // 기간 필터 pill 상태 반영
    var pills = document.querySelectorAll('.jm-hist-filter .jm-pill');
    for (var i = 0; i < pills.length; i++) {
      var p = pills[i];
      p.classList.toggle('on', p.getAttribute('data-period') === state.historyPeriod);
    }

    var idxs = visibleHistoryIdxs();
    var host = $('#jmHistList');
    if (!idxs.length) {
      host.innerHTML = '<div class="jm-hist-empty">해당 기간에 저장된 조회 내역이 없어요.</div>';
      return;
    }
    var h = '';
    for (var j = 0; j < idxs.length; j++) {
      var idx = idxs[j];
      var x = state.history[idx];
      var extra = (x.entries && x.entries.length > 1)
        ? '<span class="extra">외 ' + (x.entries.length - 1) + '건</span>'
        : '';
      h += '<div class="jm-hist-card" role="button" tabindex="0" data-action="open-detail" data-idx="' + idx + '">' +
             '<div class="jm-hist-date">' + esc(x.date) + '</div>' +
             '<div class="jm-hist-dis">' + esc(x.disease) + extra + '</div>' +
             '<div class="jm-hist-cond">' + esc(x.cond) + '</div>' +
             '<div class="jm-hist-badges">' +
               '<span class="jm-hist-badge gray">인수 ' + x.possible + '</span>' +
               '<span class="jm-hist-badge blue">예외 ' + x.except + '</span>' +
             '</div>' +
           '</div>';
    }
    host.innerHTML = h;
  }

  function renderSheetDetail() {
    var item = state.history[state.sheetIdx];
    if (!item) return;

    var entriesHTML = '';
    if (item.entries && item.entries.length) {
      for (var e = 0; e < item.entries.length; e++) {
        var en = item.entries[e];
        var num = (e + 1 < 10 ? '0' + (e + 1) : String(e + 1));
        entriesHTML += '<div class="jm-hist-entry">' +
                        '<div class="jm-hist-entry-no">NO. ' + num + '</div>' +
                        '<dl class="jm-hist-kv">' +
                          '<dt>질병명</dt><dd>' + esc(en.disease) + '</dd>' +
                          '<dt>치료 기간</dt><dd>' + esc(en.period) + '</dd>' +
                          '<dt>입원 일수</dt><dd>' + esc(en.days) + '</dd>' +
                          '<dt>수술 여부</dt><dd>' + esc(en.surgery) + '</dd>' +
                        '</dl>' +
                      '</div>';
      }
    } else {
      entriesHTML += '<div class="jm-hist-entry">' +
                       '<dl class="jm-hist-kv">' +
                         '<dt>질병명</dt><dd>' + esc(item.disease) + '</dd>' +
                         '<dt>조건</dt><dd>' + esc(item.cond) + '</dd>' +
                       '</dl>' +
                     '</div>';
    }

    var entryCount = (item.entries && item.entries.length) ? item.entries.length : 1;
    var subject = entryCount > 1
      ? '<strong>' + entryCount + '건의 병력</strong>'
      : '<strong>' + esc(item.disease) + '</strong>';
    var summary = '입력하신 ' + subject + ' 기준으로 인수 가능성이 높은 상품은 <strong>' + item.possible + '건</strong>, 예외질환 기준 <strong class="brand">' + item.except + '건</strong>이에요.';

    var h = ''
      + '<div class="jm-hist-section">'
      +   '<h4>조회일</h4>'
      +   '<div class="jm-hist-cond" style="margin:0">' + esc(item.date) + '</div>'
      + '</div>'
      + '<div class="jm-hist-section">'
      +   '<h4>입력한 병력<span class="cnt">· 총 ' + entryCount + '건</span></h4>'
      +   entriesHTML
      + '</div>'
      + '<div class="jm-hist-section">'
      +   '<h4>결과</h4>'
      +   '<div class="jm-hist-summary">' + summary + '</div>'
      +   '<div class="jm-hist-badges" style="margin-top:0">' +
             '<button type="button" class="jm-hist-badge gray" data-action="open-hist-products" data-idx="' + state.sheetIdx + '" data-section="possible">인수 가능 ' + item.possible + '건 ›</button>' +
             '<button type="button" class="jm-hist-badge blue" data-action="open-hist-products" data-idx="' + state.sheetIdx + '" data-section="except">예외질환 인수 가능 ' + item.except + '건 ›</button>' +
          '</div>'
      + '</div>';
    $('#jmHistDetail').innerHTML = h;
  }

  function renderSheet() {
    var isList = state.sheetView === 'list';
    document.querySelectorAll('#jmSheet .jm-sheet-view').forEach(function (v) {
      v.hidden = v.getAttribute('data-view') !== state.sheetView;
    });
    if (isList) renderSheetList();
    else renderSheetDetail();
  }

  // ===== 상품 리스트 시트 (전체 상품 · 보험사별 아코디언) =====
  function groupByInsurer(list) {
    var out = [], map = {};
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!map[p.insurer]) { map[p.insurer] = { insurer: p.insurer, products: [] }; out.push(map[p.insurer]); }
      map[p.insurer].products.push(p);
    }
    return out;
  }
  function accordionHTML(sectionKey, groups) {
    var CHEV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
    var h = '<div class="jm-grp-list" data-section="' + sectionKey + '">';
    for (var g = 0; g < groups.length; g++) {
      var grp = groups[g];
      h += '<div class="jm-grp" data-open="0">' +
             '<button class="jm-grp-head" type="button" data-action="grp-toggle">' +
               '<span class="jm-grp-name">' + esc(grp.insurer) + '</span>' +
               '<span class="jm-grp-count">' + grp.products.length + '건</span>' +
               '<span class="jm-grp-arrow">' + CHEV + '</span>' +
             '</button>' +
             '<div class="jm-grp-body">';
      for (var k = 0; k < grp.products.length; k++) {
        var p = grp.products[k];
        var notesHTML = '';
        if (p.notes && p.notes.length) {
          notesHTML = '<div class="notes"><span class="notes-t">특이조건</span>';
          for (var n = 0; n < p.notes.length; n++) {
            notesHTML += '<span class="notes-l">· ' + esc(p.notes[n]) + '</span>';
          }
          notesHTML += '</div>';
        }
        h += '<div class="jm-grp-item">' + esc(p.name) + notesHTML + '</div>';
      }
      h += '</div></div>';
    }
    h += '</div>';
    return h;
  }
  function renderProductSheet() {
    var r = state.productContext || calcResult();
    var tab = state.productTab || 'possible';
    var groups = tab === 'except'
      ? groupByInsurer(EXCEPT)
      : groupByInsurer(r.isFracture ? POSSIBLE_FRACTURE : []);
    var count = tab === 'except' ? r.exceptTotal : r.possibleTotal;

    var tabs =
      '<button type="button" class="jm-prod-tab' + (tab === 'possible' ? ' on' : '') + '" role="tab" aria-selected="' + (tab === 'possible') + '" data-action="prod-tab" data-tab="possible">' +
        '인수 가능 <span class="cnt">' + r.possibleTotal + '</span>' +
      '</button>' +
      '<button type="button" class="jm-prod-tab' + (tab === 'except' ? ' on' : '') + '" role="tab" aria-selected="' + (tab === 'except') + '" data-action="prod-tab" data-tab="except">' +
        '예외질환 인수 가능 <span class="cnt">' + r.exceptTotal + '</span>' +
      '</button>';

    var section;
    if (count > 0) {
      section = '<div class="jm-prod-sec">' +
        '<div class="jm-prod-sec-head">' +
          '<h4>' + (tab === 'except' ? '예외질환 인수 가능 상품' : '인수 가능 상품') +
            ' <span class="cnt">(' + count + '건)</span></h4>' +
          '<button class="jm-prod-toggle-all" type="button" data-action="grp-toggle-all" data-target="' + tab + '" data-open="0">모두 펼치기</button>' +
        '</div>' +
        accordionHTML(tab, groups) +
      '</div>';
    } else {
      section = '<div class="jm-prod-empty">해당 조건으로 인수 가능한 상품이 없습니다.</div>';
    }

    $('#jmProductTabs').innerHTML = tabs;
    $('#jmProductBody').innerHTML = section;
    $('#jmProductBody').scrollTop = 0;
  }
  function openProductSheet(focusSection, contextOverride) {
    state.productTab = (focusSection === 'except') ? 'except' : 'possible';
    state.productContext = contextOverride || null;
    var s = $('#jmProductSheet');
    s.hidden = false;
    s.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderProductSheet();
  }
  function closeProductSheet() {
    var s = $('#jmProductSheet');
    s.hidden = true;
    s.setAttribute('aria-hidden', 'true');
    // 조회 내역 시트가 여전히 열려있다면 body overflow 유지
    if ($('#jmSheet').hidden) document.body.style.overflow = '';
    state.productContext = null;
  }

  // ===== 결과 계산 =====
  function calcResult() {
    var isFracture = false;
    for (var i = 0; i < state.entries.length; i++) {
      if (/골절/.test(state.entries[i].disease || '')) { isFracture = true; break; }
    }
    if (isFracture) {
      return { possible: POSSIBLE_FRACTURE.slice(0, 2), possibleTotal: POSSIBLE_FRACTURE.length, exceptTotal: EXCEPT.length, isFracture: true };
    }
    return { possible: [], possibleTotal: 0, exceptTotal: EXCEPT.length, isFracture: false };
  }

  // ===== 렌더 =====
  function bubbleBot(text, help, card) {
    return '<div class="jm-row bot">' +
             '<div class="jm-row-ava"><img src="' + IMG_BOT + '" alt="" /></div>' +
             '<div class="jm-bubble bot' + (card ? ' card' : '') + '">' +
               '<div class="jm-btxt">' + text + '</div>' +
               (help ? '<span class="jm-help" data-action="noop">' + esc(help) + '</span>' : '') +
             '</div>' +
           '</div>';
  }

  function buildLog() {
    var h = '<div class="jm-daysep">오늘</div>';
    var lastUserIdx = -1;
    for (var i = 0; i < state.log.length; i++) {
      if (state.log[i].who === 'user') lastUserIdx = i;
    }
    for (var i = 0; i < state.log.length; i++) {
      var m = state.log[i];
      if (m.who === 'bot') {
        h += bubbleBot(esc(m.text), m.help, false);
      } else {
        var editable = (i === lastUserIdx && state.phase === 'collecting' && state.hist.length > 0);
        h += '<div class="jm-row user">' +
               (editable ? '<button class="jm-pencil" data-action="undo" title="이 답변 수정" aria-label="이 답변 수정">' + IC_PENCIL + '</button>' : '') +
               '<div class="jm-bubble user">' + esc(m.text) + '</div>' +
             '</div>';
      }
    }
    return h;
  }

  function buildInteractive() {
    var s = state;

    if (s.phase === 'collecting') {
      if (s.sub === 'disease') {
        var h = '<div class="jm-chips">';
        for (var i = 0; i < COMMON.length; i++) {
          var label = COMMON[i].replace(/^[A-Z]\d{2}\s+/, ''); // 코드 앞자리 생략해 칩 가독성 확보
          h += '<button class="jm-chip" type="button" data-action="pick-disease" data-name="' + esc(COMMON[i]) + '">' + esc(label) + '</button>';
        }
        h += '</div>';
        h += '<div class="jm-opts-hint">찾는 질병이 없다면 아래에 직접 입력해 주세요.</div>';
        return '<div class="jm-opts">' + h + '</div>';
      }
      if (s.sub === 'period') {
        var pf = s.periodForm;
        var today = todayIso(); // 오늘 이후 날짜는 선택/입력 불가
        var endDisabled = pf.treating;
        var startDisp = pf.dateStart ? isoToDot(pf.dateStart) : '날짜 선택';
        var endDisp = pf.dateEnd ? isoToDot(pf.dateEnd) : (endDisabled ? '진행 중' : '날짜 선택');
        var CAL = '<svg class="jm-date-ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></svg>';
        return '<div class="jm-opts jm-opts-form">' +
                 '<div class="jm-period">' +
                   '<div class="jm-period-row">' +
                     '<span class="jm-period-lbl">시작일</span>' +
                     '<div class="jm-date-wrap">' +
                       '<span class="jm-date-disp' + (pf.dateStart ? '' : ' empty') + '" id="jmPeriodStartDisp">' + esc(startDisp) + '</span>' +
                       CAL +
                       '<input type="date" class="jm-date-real" id="jmPeriodStart" autocomplete="off" max="' + today + '" value="' + esc(pf.dateStart) + '" />' +
                     '</div>' +
                   '</div>' +
                   '<div class="jm-period-row">' +
                     '<span class="jm-period-lbl">종료일</span>' +
                     '<div class="jm-date-wrap' + (endDisabled ? ' disabled' : '') + '">' +
                       '<span class="jm-date-disp' + (pf.dateEnd || endDisabled ? '' : ' empty') + '" id="jmPeriodEndDisp">' + esc(endDisp) + '</span>' +
                       CAL +
                       '<input type="date" class="jm-date-real" id="jmPeriodEnd" autocomplete="off" max="' + today + '" value="' + esc(pf.dateEnd) + '"' + (endDisabled ? ' disabled' : '') + ' />' +
                     '</div>' +
                   '</div>' +
                   '<label class="jm-period-check">' +
                     '<input type="checkbox" id="jmPeriodTreating" autocomplete="off"' + (pf.treating ? ' checked' : '') + ' />' +
                     '<span class="jm-period-check-box"></span>' +
                     '<span class="jm-period-check-t">지금도 치료 중이에요</span>' +
                   '</label>' +
                   '<div class="jm-period-err" id="jmPeriodErr" hidden></div>' +
                   '<button class="jm-opt dark" type="button" data-action="submit-period">다음 →</button>' +
                 '</div>' +
               '</div>';
      }
      if (s.sub === 'inpatient') {
        var max = maxHospDaysFromForm() || 0;
        var days = state.draft.inpatientDays || 0;
        if (max > 0 && days > max) days = max;
        var hintTxt = max > 0
          ? ('치료 기간 안에서 최대 ' + max + '일까지 입력할 수 있어요. 입원한 적이 없다면 0으로 두세요.')
          : '입원한 적이 없다면 0으로 두세요.';
        return '<div class="jm-opts jm-opts-form">' +
                 '<div class="jm-hosp">' +
                   '<div class="jm-hosp-lbl">입원 일수' + (max > 0 ? ' <span class="jm-hosp-max">/ 최대 ' + max + '일</span>' : '') + '</div>' +
                   '<div class="jm-hosp-stepper">' +
                     '<button type="button" class="jm-hosp-btn" id="jmHospMinus" aria-label="1일 감소">' +
                       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>' +
                     '</button>' +
                     '<div class="jm-hosp-in-wrap">' +
                       '<input type="text" class="jm-hosp-in" id="jmHospDays" inputmode="numeric" autocomplete="off" value="' + days + '" />' +
                       '<span class="jm-hosp-unit">일</span>' +
                     '</div>' +
                     '<button type="button" class="jm-hosp-btn" id="jmHospPlus" aria-label="1일 증가">' +
                       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>' +
                     '</button>' +
                   '</div>' +
                   '<div class="jm-hosp-hint">' + hintTxt + '</div>' +
                   '<button class="jm-opt dark" type="button" data-action="submit-hosp">다음 →</button>' +
                 '</div>' +
               '</div>';
      }
      if (s.sub === 'surgery') {
        return '<div class="jm-opts">' +
                 '<button class="jm-opt" type="button" data-action="surg-yes">수술한 적 있어요</button>' +
                 '<button class="jm-opt" type="button" data-action="surg-no">수술한 적 없어요</button>' +
               '</div>';
      }
      if (s.sub === 'more') {
        return '<div class="jm-opts">' +
                 '<button class="jm-opt" type="button" data-action="more-yes">네, 병력이 더 있어요</button>' +
                 '<button class="jm-opt dark" type="button" data-action="more-no">아니요, 이대로 심사할게요</button>' +
               '</div>';
      }
    }

    if (s.phase === 'confirm') {
      var rows = '';
      for (var i = 0; i < s.entries.length; i++) {
        var e = s.entries[i];
        rows += '<div class="jm-conf-row">' +
                  '<span class="jm-conf-num">' + (i + 1) + '</span>' +
                  '<div class="jm-conf-info">' +
                    '<div class="jm-conf-dis">' + esc(e.disease) + '</div>' +
                    '<div class="jm-conf-meta">' + esc(metaOf(e)) + '</div>' +
                  '</div>' +
                  '<button class="jm-conf-x" type="button" data-action="remove-entry" data-id="' + e.id + '" aria-label="삭제">' + IC_X + '</button>' +
                '</div>';
      }
      var body = '입력하신 <strong>병력 ' + s.entries.length + '건</strong> (' + s.entries.length + '/' + MAX_ENTRIES + ')이에요. 맞으면 바로 심사를 시작할게요.';
      var canStart = s.entries.length > 0;
      var canAdd = s.entries.length < MAX_ENTRIES;
      return '<div class="jm-row bot">' +
               '<div class="jm-row-ava"><img src="' + IMG_BOT + '" alt="" /></div>' +
               '<div class="jm-bubble bot card">' +
                 '<div class="jm-btxt">' + body + '</div>' +
                 '<div class="jm-conf-list">' + rows + '</div>' +
                 '<div class="jm-conf-actions">' +
                   '<button class="jm-btn-ghost" type="button" data-action="add-more"' + (canAdd ? '' : ' disabled') + '>+ 병력 추가</button>' +
                   '<button class="jm-btn-dark" type="button" data-action="start-analysis"' + (canStart ? '' : ' disabled') + '>이대로 심사 시작</button>' +
                 '</div>' +
               '</div>' +
             '</div>';
    }

    if (s.phase === 'analyzing') {
      return '<div class="jm-row bot">' +
               '<div class="jm-row-ava float"><img src="' + IMG_BOT_LOADING + '" alt="" /></div>' +
               '<div class="jm-bubble bot">' +
                 '<div class="jm-typing">' +
                   '<span class="jm-typing-t">156개 상품 인수 기준 확인 중</span>' +
                   '<span class="jm-dots"><span></span><span></span><span></span></span>' +
                 '</div>' +
               '</div>' +
             '</div>';
    }

    if (s.phase === 'result') {
      var r = calcResult();
      var chips = '';
      for (var i = 0; i < s.entries.length; i++) {
        chips += '<span class="jm-res-chip"><span class="d"></span>' + esc(s.entries[i].disease) + '</span>';
      }

      var summary;
      if (r.possibleTotal > 0) {
        summary = '심사가 끝났어요! 입력하신 <strong>병력 ' + s.entries.length + '건 기준으로 <span class="brand">인수 가능 ' + r.possibleTotal + '건</span></strong>을 찾았어요. 예외질환 기준으로도 <strong>' + r.exceptTotal + '건</strong>이 더 있어요.';
      } else {
        summary = '심사가 끝났어요! 입력하신 <strong>병력 ' + s.entries.length + '건을 모두 충족</strong>하는 상품은 바로 인수 가능한 상품은 없지만, <strong class="brand">예외질환 기준 ' + r.exceptTotal + '개 상품</strong>에서 가입 가능성을 찾았어요.';
      }

      var card = '<div class="jm-row bot">' +
                   '<div class="jm-row-ava"><img src="' + IMG_BOT_RESULT + '" alt="" /></div>' +
                   '<div class="jm-bubble bot card">' +
                     '<div class="jm-res-caveat">ⓘ 예상 가이드이며, 실제 인수 여부는 보험사 심사 결과에 따라 달라질 수 있어요.</div>' +
                     '<div class="jm-btxt">' + summary + '</div>' +
                     '<div class="jm-res-chips">' + chips + '</div>' +
                     '<div class="jm-res-stats">' +
                       '<button type="button" class="jm-stat" data-action="open-products" data-section="possible" aria-label="인수 가능 상품 전체 보기">' +
                         '<div class="k">인수 가능</div>' +
                         '<div class="v">' + r.possibleTotal + '<span class="u">건</span></div>' +
                       '</button>' +
                       '<button type="button" class="jm-stat blue" data-action="open-products" data-section="except" aria-label="예외질환 인수 가능 상품 전체 보기">' +
                         '<div class="k">예외질환 인수 가능</div>' +
                         '<div class="v">' + r.exceptTotal + '<span class="u">건</span></div>' +
                       '</button>' +
                     '</div>' +
                     '<button class="jm-res-cta" type="button" data-action="save-result">결과 저장하기 →</button>' +
                   '</div>' +
                 '</div>';
      card += '<div class="jm-quick">' +
                '<button class="jm-quick-btn" type="button" data-action="restart">처음부터 다시</button>' +
                '<button class="jm-quick-btn" type="button" data-action="feedback">의견 보내기</button>' +
              '</div>';
      return card;
    }
    return '';
  }

  function updateSend() {
    var b = $('#jmSend');
    if (!b) return;
    b.disabled = !(state.textVal.trim().length > 0);
  }

  function renderSug() {
    var box = $('#jmSug');
    if (!box) return;
    var v = state.textVal.trim();
    var items = v ? DISEASES.filter(function (d) { return d.indexOf(v) >= 0 && d !== v; }).slice(0, 6) : [];
    if (!state.focused || !items.length) {
      box.hidden = true; box.innerHTML = '';
      return;
    }
    var h = '';
    for (var i = 0; i < items.length; i++) {
      h += '<div class="jm-sug-item" data-name="' + esc(items[i]) + '">' + IC_SEARCH + '<span>' + esc(items[i]) + '</span></div>';
    }
    box.innerHTML = h;
    box.hidden = false;
    box.querySelectorAll('.jm-sug-item').forEach(function (el) {
      el.addEventListener('mousedown', function (ev) {
        ev.preventDefault();
        pickDisease(this.getAttribute('data-name'));
      });
    });
  }

  function render() {
    var c = $('#jmChat');
    c.innerHTML = buildLog() + buildInteractive();

    var showInput = (state.phase === 'collecting' && state.sub === 'disease');
    var inputBar = $('#jmInputBar');
    inputBar.hidden = !showInput;

    updateSend();
    renderSug();

    // 치료 기간 폼이 렌더된 순간 이벤트 바인딩
    if (state.phase === 'collecting' && state.sub === 'period') bindPeriodForm();
    if (state.phase === 'collecting' && state.sub === 'inpatient') bindHospForm();

    // 스크롤 하단 고정
    requestAnimationFrame(function () { c.scrollTop = c.scrollHeight; });
  }

  // ===== 토스트 =====
  function toast(msg) {
    var t = $('#jmToast');
    $('#jmToastMsg').textContent = msg;
    t.hidden = false;
    clearTimeout(window._jmToastT);
    window._jmToastT = setTimeout(function () { t.hidden = true; }, 2200);
  }

  // ===== 이벤트 =====
  $('#jmChat').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!b) return;
    var a = b.getAttribute('data-action');
    if (a === 'noop') { e.preventDefault(); return; }

    if (a === 'pick-disease') {
      pickDisease(b.getAttribute('data-name'));
    } else if (a === 'submit-period') {
      submitPeriod();
    } else if (a === 'submit-hosp') {
      submitHosp();
    } else if (a === 'surg-yes') {
      finishEntry(true, '수술한 적 있어요');
    } else if (a === 'surg-no') {
      finishEntry(false, '수술한 적 없어요');
    } else if (a === 'more-yes') {
      advance('네, 병력이 더 있어요',
        { sub: 'disease' },
        '다음 병력의 질병명을 알려주세요.'
      );
    } else if (a === 'more-no') {
      advance('아니요, 이대로 심사할게요',
        { phase: 'confirm', sub: '' },
        '입력하신 병력을 확인해 주세요. 맞으면 바로 심사를 시작할게요.'
      );
    } else if (a === 'undo') {
      undo();
    } else if (a === 'add-more') {
      addMore();
    } else if (a === 'remove-entry') {
      removeEntry(+b.getAttribute('data-id'));
    } else if (a === 'start-analysis') {
      startAnalysis();
    } else if (a === 'restart') {
      restart();
    } else if (a === 'save-result') {
      saveCurrentResult();
      toast('조회 내역에 저장되었어요');
    } else if (a === 'feedback') {
      toast('의견 보내기는 준비 중이에요');
    } else if (a === 'open-products') {
      openProductSheet(b.getAttribute('data-section'));
    }
  });

  // ===== 상품 시트 이벤트 =====
  $('#jmProductSheet').addEventListener('click', function (e) {
    if (e.target.closest('[data-close="1"]')) { closeProductSheet(); return; }
    var tabBtn = e.target.closest('[data-action="prod-tab"]');
    if (tabBtn) {
      var next = tabBtn.getAttribute('data-tab');
      if (state.productTab !== next) {
        state.productTab = next;
        renderProductSheet();
      }
      return;
    }
    var head = e.target.closest('.jm-grp-head');
    if (head) {
      var grp = head.closest('.jm-grp');
      grp.setAttribute('data-open', grp.getAttribute('data-open') === '1' ? '0' : '1');
      return;
    }
    var allBtn = e.target.closest('[data-action="grp-toggle-all"]');
    if (allBtn) {
      var open = allBtn.getAttribute('data-open') === '1';
      var next = open ? '0' : '1';
      var target = allBtn.getAttribute('data-target');
      var list = document.querySelector('#jmProductBody .jm-grp-list[data-section="' + target + '"]');
      if (list) list.querySelectorAll('.jm-grp').forEach(function (g) { g.setAttribute('data-open', next); });
      allBtn.setAttribute('data-open', next);
      allBtn.textContent = open ? '모두 펼치기' : '모두 접기';
      return;
    }
  });

  // ===== 조회 내역 시트 이벤트 =====
  $('#jmHistory').addEventListener('click', openSheet);
  $('#jmSheet').addEventListener('click', function (e) {
    if (e.target.closest('[data-close="1"]')) { closeSheet(); return; }
    var pill = e.target.closest('.jm-hist-filter .jm-pill');
    if (pill) {
      state.historyPeriod = pill.getAttribute('data-period');
      renderSheetList();
      return;
    }
    var openDetail = e.target.closest('[data-action="open-detail"]');
    if (openDetail) {
      state.sheetIdx = Number(openDetail.getAttribute('data-idx'));
      state.sheetView = 'detail';
      renderSheet();
      return;
    }
    var openHistProd = e.target.closest('[data-action="open-hist-products"]');
    if (openHistProd) {
      var idx = Number(openHistProd.getAttribute('data-idx'));
      var section = openHistProd.getAttribute('data-section');
      var item = state.history[idx];
      if (item) {
        openProductSheet(section, {
          isFracture: item.possible > 0,
          possibleTotal: item.possible,
          exceptTotal: item.except
        });
      }
      return;
    }
  });
  $('#jmSheetBack').addEventListener('click', function () {
    state.sheetView = 'list';
    state.sheetIdx = null;
    renderSheet();
  });

  // ESC로 시트 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('#jmProductSheet').hidden) { closeProductSheet(); return; }
    if (!$('#jmSheet').hidden) { closeSheet(); return; }
  });

  var mi = $('#jmInput');
  mi.addEventListener('input', function (e) {
    state.textVal = e.target.value;
    updateSend();
    renderSug();
  });
  mi.addEventListener('focus', function () { state.focused = true; renderSug(); });
  mi.addEventListener('blur', function () {
    setTimeout(function () { state.focused = false; renderSug(); }, 140);
  });
  mi.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); pickDisease(state.textVal); }
  });
  $('#jmSend').addEventListener('click', function () { pickDisease(state.textVal); });

  // 유의사항 안내 토글
  $('#jmNoticeToggle').addEventListener('click', function () {
    var box = $('#jmNotice');
    var panel = $('#jmNoticePanel');
    var open = box.getAttribute('data-open') === '1';
    var next = open ? '0' : '1';
    box.setAttribute('data-open', next);
    panel.hidden = open;
    this.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  render();

})();
