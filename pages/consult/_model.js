/* ============================================================
   재무상담 — 공용 데이터 모델
   02 수입지출 / 03 자산·부채에서 적은 값을 한곳에 모아 두고,
   04 재무재표와 상담결과가 그 값을 읽어 계산한다.

   저장은 localStorage 한 칸(bobi.consult). 서버가 붙기 전까지만 쓰는 임시 저장이다.
   처음 열면 모든 금액이 비어 있고, 값을 적으면 바로 합계·표·그래프에 반영된다.
   단위는 모두 만원. null 은 '미입력'(합계에서 제외).
   ============================================================ */
(function () {
  var KEY = 'bobi.consult';

  /* ---------- 항목 이름은 기획 문서 3장 '항목 이름(확정)' 표 ---------- */
  var SAMPLE = {
    cf: {
      '수입':   { grp: '수입', items: [['월급(세후)', 320, null], ['배우자 월급(세후)', 0, null], ['상여·성과급', null, null],
                                       ['사업·부업 수입', 200, null], ['연금', 0, null], ['월세 받는 돈', 0, null], ['그 밖에 들어온 돈', 0, null]] },
      '집':     { grp: '고정지출', items: [['월세', 20, 20], ['관리비', 10, 10], ['전기·가스·수도', 8, 8]] },
      '통신':   { grp: '고정지출', items: [['휴대폰 요금', 16, 12], ['인터넷·TV', 6, 6]] },
      '보험':   { grp: '고정지출', items: [['보장성 보험료', 48, 48]] },
      '구독':   { grp: '고정지출', items: [['넷플릭스', 3, 2], ['멜론', 1, 1]] },
      '가족':   { grp: '고정지출', items: [['부모님 용돈', 20, 20], ['자녀 학원·교육비', 55, 55], ['자녀 용돈', 10, 10]] },
      '교통':   { grp: '고정지출', items: [['대중교통', 10, 10], ['주유비', 18, 14], ['주차·통행료', 4, 4]] },
      '식비':   { grp: '변동지출', items: [['장보기', 62, 60], ['외식·배달', 38, 28], ['카페·간식', 10, null]] },
      '생활':   { grp: '변동지출', items: [['생활용품', 18, 16]] },
      '건강':   { grp: '변동지출', items: [['병원·약', 8, 8], ['운동', 4, 4]] },
      '꾸밈':   { grp: '변동지출', items: [['미용', 5, 5], ['옷·신발', 10, 7]] },
      '여가·경조사·기타': { grp: '변동지출', items: [['취미·여행', 10, 8], ['경조사·선물', 10, 10], ['그 밖에 쓴 돈', 5, 5]] },
      '저축':   { grp: '저축', items: [['예금·적금', 20, null], ['주택청약', 10, null], ['주식·펀드 투자', 5, null],
                                       ['연금저축·IRP', 4, null], ['저축성·연금보험', 0, null]] },
      '일시 수입': { grp: '일시 수입·지출', items: [['대출 받은 돈', 0, null], ['적금 해지·돌려받은 돈', 0, null]] },
      '일시 지출': { grp: '일시 수입·지출', items: [['보증금 낸 돈', null, null], ['집·차 등 큰 물건 산 돈', null, null]] }
    },
    // 03 자산
    as: {
      '유동자산':    [['예금·현금', 850]],
      '금융자산':    [['예·적금', 900], ['주택청약', 450], ['주식·펀드·ISA', 300]],
      '연금자산':    [['연금저축·IRP·퇴직연금', 1200], ['보험 적립금', 700]],
      '부동산·차량': [['거주 주택 (자가)', 0], ['전·월세 보증금', 22000], ['차량', 2000], ['기타 부동산', 0]],
      '기타자산':    [['대여금·기타', 0]]
    },
    // 03 부채 — 월 상환액은 02 '부채상환' 합계로도 쓰인다
    debt: [
      { name: '전세자금대출', at: '국민은행',   bal: 10000, pay: 32, rate: 4, due: '2028.03' },
      { name: '차량 할부',    at: '현대캐피탈', bal: 1600,  pay: 28, rate: 6, due: '2028.11' },
      { name: '신용대출',     at: '신한은행',   bal: 700,   pay: 6,  rate: 6, due: '2029.12' }
    ],
    // 목표 — 종류 6종(비상금·주택구매·결혼자금·자녀학비·노후·기타)
    goals: [
      { name: '가족 여행',        kind: '기타',     term: '단기', due: '2027-07', need: 400,  saved: 100 },
      { name: '차량 교체',        kind: '기타',     term: '중기', due: '2028-06', need: 1500, saved: 200 },
      { name: '첫째 대학 등록금', kind: '자녀학비', term: '장기', due: '2032-03', need: 2400, saved: 300 }
    ]
  };

  var BASE_YM = '2026-09';   // 상담일 기준
  var KINDS = ['비상금', '주택구매', '결혼자금', '자녀학비', '노후', '기타'];
  var TERMS = ['단기', '중기', '장기'];

  var FIXED = ['집', '통신', '보험', '구독', '가족', '교통'];
  var VARI  = ['식비', '생활', '건강', '꾸밈', '여가·경조사·기타'];
  var ORDER = ['수입'].concat(FIXED, VARI, ['저축', '일시 수입', '일시 지출']);

  /* 처음 화면은 빈 값으로 연다. 위 SAMPLE 은 항목 이름·묶음 구성을 담는 뼈대이고,
     금액은 자릿수·합계를 가늠해 보려고 적어 둔 참고값이다(화면에는 나오지 않는다). */
  function blank() {
    var m = clone(SAMPLE);
    Object.keys(m.cf).forEach(function (c) { m.cf[c].items.forEach(function (r) { r[1] = null; r[2] = null; }); });
    Object.keys(m.as).forEach(function (g) { m.as[g].forEach(function (r) { r[1] = null; }); });
    m.debt.forEach(function (d) { d.bal = null; d.pay = null; d.rate = null; d.due = ''; });
    m.goals.forEach(function (g) { g.need = null; g.saved = null; });
    return m;
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* 저장이 막힌 브라우저면 그냥 예시값으로 */ }
    return blank();
  }
  function save(m) {
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
  }
  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    return blank();
  }

  /* ---------- 합계 ---------- */
  function sumItems(items, idx) {
    var s = 0;
    items.forEach(function (r) { if (r[idx] !== null && !isNaN(r[idx])) s += Number(r[idx]); });
    return round1(s);
  }
  function unknown(items, idx) {
    var n = 0;
    items.forEach(function (r) { if (r[idx] === null) n++; });
    return n;
  }
  function catTotal(m, cat, idx) {
    var c = m.cf[cat];
    return c ? sumItems(c.items, idx === undefined ? 1 : idx) : 0;
  }
  function groupTotal(m, cats, idx) {
    var s = 0;
    cats.forEach(function (c) { s += catTotal(m, c, idx); });
    return round1(s);
  }
  function round1(n) { return Math.round(n * 10) / 10; }

  function calc(m) {
    var income   = catTotal(m, '수입');
    var fixed    = groupTotal(m, FIXED);
    var vari     = groupTotal(m, VARI);
    var debtPay  = round1(m.debt.reduce(function (s, d) { return s + (Number(d.pay) || 0); }, 0));
    var saving   = catTotal(m, '저축');
    var expense  = round1(fixed + vari + debtPay + saving);
    var balance  = round1(income - expense);

    var assets = 0;
    Object.keys(m.as).forEach(function (g) {
      m.as[g].forEach(function (r) { assets += Number(r[1]) || 0; });
    });
    var liab = m.debt.reduce(function (s, d) { return s + (Number(d.bal) || 0); }, 0);

    return {
      income: income, fixed: fixed, vari: vari, debtPay: debtPay, saving: saving,
      expense: expense, balance: balance,
      assets: assets, liab: liab, net: assets - liab,
      incomeUnknown: m.cf['수입'] ? unknown(m.cf['수입'].items, 1) : 0
    };
  }

  /* ---------- 목표 ----------
     남은 달수 = 상담일 → 목표 시점. 매달 모을 돈 = (필요금액 − 적립액) ÷ 남은 달수. */
  function ym(s) {
    var t = String(s || '').replace(/[^0-9]/g, '');
    return { y: Number(t.slice(0, 4)) || 0, m: Number(t.slice(4, 6)) || 1 };
  }
  function monthsTo(due) {
    var b = ym(BASE_YM), d = ym(due);
    return Math.max(1, (d.y - b.y) * 12 + (d.m - b.m));
  }
  function goals(m) {
    return (m.goals || []).map(function (g) {
      var months = monthsTo(g.due);
      var remain = Math.max(0, (Number(g.need) || 0) - (Number(g.saved) || 0));
      return {
        name: g.name, kind: g.kind, term: g.term, due: g.due,
        need: Number(g.need) || 0, saved: Number(g.saved) || 0,
        months: months, remain: remain,
        monthly: Math.round(remain / months),
        pct: g.need ? Math.round((Number(g.saved) || 0) / Number(g.need) * 100) : 0
      };
    });
  }
  function goalSum(m) {
    var gs = goals(m);
    return {
      list: gs,
      count: gs.length,
      need: gs.reduce(function (s, g) { return s + g.need; }, 0),
      saved: gs.reduce(function (s, g) { return s + g.saved; }, 0),
      monthly: gs.reduce(function (s, g) { return s + g.monthly; }, 0)
    };
  }
  // 기간별 필요 저축액 — 목표가 하나씩 끝날 때마다 줄어든다
  function goalPhases(m) {
    var gs = goals(m).slice().sort(function (a, b) { return a.months - b.months; });
    var out = [], from = 0;
    gs.forEach(function (g, i) {
      var live = gs.slice(i);
      out.push({ from: from, to: g.months, count: live.length,
                 monthly: live.reduce(function (s, x) { return s + x.monthly; }, 0) });
      from = g.months;
    });
    return out;
  }

  /* ---------- 표시 ---------- */
  function comma(n) {
    if (n === null || n === undefined || n === '') return '—';
    return Number(n).toLocaleString('ko-KR');
  }
  // 12300(만원) → "1억 2,300만원"
  function won(manwon) {
    var n = Math.round(Number(manwon) || 0);
    var eok = Math.floor(n / 10000), rest = n % 10000;
    if (eok && rest) return eok + '억 ' + comma(rest) + '만원';
    if (eok) return eok + '억원';
    return comma(rest) + '만원';
  }
  function pct(part, whole) {
    if (!whole) return 0;
    return Math.round((part / whole) * 100);
  }
  // 입력 문자열 → 숫자 (빈 값·'미입력'은 null)
  function parse(v) {
    var s = String(v == null ? '' : v).replace(/[^0-9-]/g, '');
    return s === '' ? null : Number(s);
  }

  window.CT = {
    KEY: KEY, SAMPLE: SAMPLE, blank: blank, FIXED: FIXED, VARI: VARI, ORDER: ORDER, KINDS: KINDS, TERMS: TERMS, BASE_YM: BASE_YM,
    load: load, save: save, reset: reset, calc: calc,
    sumItems: sumItems, unknown: unknown, catTotal: catTotal, groupTotal: groupTotal,
    goals: goals, goalSum: goalSum, goalPhases: goalPhases, monthsTo: monthsTo,
    comma: comma, won: won, pct: pct, parse: parse, round1: round1
  };
})();
