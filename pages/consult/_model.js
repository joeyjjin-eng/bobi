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
    // 01 기본정보 '상담목표' — 고객이 한 말 그대로. 04·상담결과가 이걸 다시 읽는다.
    basic: { wish: '', keep: '', change: '' },
    // 03 자산·부채 기준일(YYYY-MM-DD). 재무상태표가 '언제 기준'인지 여기서 읽는다.
    asDate: '',
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
      '유동자산':    [['통장·현금', 850]],
      '금융자산':    [['예·적금', 900], ['주택청약', 450], ['주식·펀드·ISA', 300]],
      '연금자산':    [['연금저축·IRP·퇴직연금', 1200], ['보험 적립금', 700]],
      '부동산·차량': [['사는 집 (자가)', 0], ['전·월세 보증금', 22000], ['자동차', 2000], ['그 밖의 부동산', 0]],
      '기타자산':    [['빌려준 돈·기타', 0]]
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
  var BASE_DATE_TEXT = '2026.09.28';   // 기준일을 안 적었을 때 쓰는 상담일
  var KINDS = ['비상금', '주택구매', '결혼자금', '자녀학비', '노후', '기타'];
  /* 매달 갚지 않는 빚 — 월 납입금이 없고 만기에 한 번에 갚는 종류. 기획 문서 OWE_KINDS + 기타.
     남은 돈·금리·만기는 똑같이 받되 02 부채상환에는 들어가지 않는다. */
  var DEBT_LUMP = ['만기에 한 번에 갚는 대출', '가족·지인에게 빌린 돈', '세 준 집 보증금', '미납 세금', '기타'];
  /* 매달 갚는 빚 — 02 빚 갚는 돈에서 골라 더한다. 기획 문서 PAY_KINDS 그대로. */
  var DEBT_PAY_KINDS = ['전세·주택 대출', '차량 할부', '휴대폰 기기 할부', '신용대출',
    '카드론·리볼빙', '카드 할부', '그 밖의 대출'];
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
    // 빚도 목표와 같다 — 금액만 비우면 '전세자금대출·차량 할부·신용대출'이 남아
    // 고객이 적은 빚처럼 읽힌다. SAMPLE 의 3건은 입력 칸 모양을 보여 주는 예시일 뿐이다.
    m.debt = [];
    // 목표는 금액만 비우는 게 아니라 줄째로 비운다.
    // 아무것도 안 적었는데 '가족 여행 · 차량 교체 · 첫째 대학 등록금'이 들어 있으면
    // 고객이 적은 목표처럼 읽힌다. SAMPLE 의 3건은 항목 구성을 보여 주는 예시일 뿐이다.
    m.goals = [];
    m.v = VERSION;
    return m;
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ============================================================
     상담 사례 — 리스트에서 고른 고객의 상담을 그대로 열어 보는 용도.
     새로 적는 상담(blank)과 달리 01-04 가 전부 채워져 있어,
     상담결과가 어떤 모습인지 숫자까지 같이 볼 수 있다.
     cf·as 의 값은 뼈대(SAMPLE)의 항목 순서대로 넣는다.
     ============================================================ */
  var CASES = {
    /* 이서연 — 40대 맞벌이 부부 + 자녀 1, 34평 자가(주택담보대출 있음).
       월 수입 800 = 본인 450 + 배우자 350. */
    '이서연': {
      asDate: '2026-09-29',
      basic: {
        name: '이서연', date: '2026-09-29',
        job: '회사원', spouseJob: '회사원',
        housing: '자가', housingEtc: '', incomeSteady: '매월 비슷함',
        wish: '대출을 더 빨리 갚는 게 나을지, 노후 준비를 먼저 늘리는 게 나을지 모르겠어요.',
        keep: '아이 학원비는 줄이고 싶지 않아요.',
        change: '2년 뒤에 아이가 고등학교에 들어갑니다.',
        family: [
          { rel: '본인',   name: '이서연', age: '43', job: '회사원',  note: '' },
          { rel: '배우자', name: '김도현', age: '45', job: '회사원',  note: '' },
          { rel: '자녀',   name: '김하준', age: '13', job: '중학생',  note: '' }
        ]
      },
      cf: {
        '수입': [450, 350, 0, 0, 0, 0, 0],
        '집':   [0, 25, 18],
        '통신': [14, 4],
        '보험': [52],
        '구독': [2, 1],
        '가족': [30, 85, 10],
        '교통': [12, 20, 6],
        '식비': [70, 45, 12],
        '생활': [20],
        '건강': [10, 8],
        '꾸밈': [8, 12],
        '여가·경조사·기타': [15, 12, 8],
        '저축': [50, 10, 20, 34, 0],
        '일시 수입': [0, 0],
        '일시 지출': [0, 0]
      },
      /* 상담 때 함께 정한 목표 금액. 적은 항목만 '목표보다 많이 쓴 항목'에서 견준다.
         null 은 목표를 안 정한 항목(비교하지 않음). */
      cfGoal: {
        '통신': [10, null],
        '식비': [null, 40, 8],
        '꾸밈': [null, 11],
        '여가·경조사·기타': [13, null, 7]
      },
      as: {
        '유동자산':    [450],
        '금융자산':    [2400, 850, 1300],
        '연금자산':    [6800, 1500],
        '부동산·차량': [68000, 0, 1800, 0],
        '기타자산':    [0]
      },
      debt: [
        { name: '주택담보대출', at: '가상은행',   bal: 24000, pay: 115, rate: 3.8, due: '2041.06' },
        { name: '자동차 할부',  at: '가상캐피탈', bal: 900,   pay: 25,  rate: 5.4, due: '2028.04' }
      ],
      goals: [
        /* 목표 합계가 월 145만원 — 지금 저축 114만원에서 31만원만 더 돌리면 되고,
           그 31만원은 월 잔액 47만원 안에서 나온다. 셋이 맞물려야 상담이 성립한다. */
        { name: '자녀 대학 등록금', kind: '자녀학비', term: '장기', due: '2031-03', need: 2400,  saved: 850 },
        { name: '주택담보대출 조기상환', kind: '기타', term: '중기', due: '2029-12', need: 3000,  saved: 1200 },
        { name: '노후 자금',        kind: '노후',     term: '장기', due: '2046-09', need: 25000, saved: 8300 }
      ],
      wrap: {
        conclusion: '수입 800만원에서 매달 47만원이 남고, 저축으로 114만원을 따로 모으고 있습니다.\n'
                  + '목표 세 건을 다 지키려면 월 145만원이 필요해, 31만원만 더 돌리면 됩니다.',
        answer: '대출 금리가 3.8%로 낮아 조기상환보다 연금저축·IRP를 먼저 채우는 쪽이 유리합니다. ' +
                '올해 세액공제 한도까지 채우고, 남는 여유분으로 대출을 갚는 순서로 보시면 됩니다.',
        next: '2026-11-02', nextTime: '14:00'
      }
    }
  };

  function loadCase(name) {
    var c = CASES[name];
    if (!c) return null;
    var m = blank();
    m.basic  = clone(c.basic || {});
    m.asDate = c.asDate || '';
    Object.keys(c.cf || {}).forEach(function (k) {
      if (!m.cf[k]) return;
      c.cf[k].forEach(function (v, i) { if (m.cf[k].items[i]) m.cf[k].items[i][1] = v; });
    });
    Object.keys(c.cfGoal || {}).forEach(function (k) {
      if (!m.cf[k]) return;
      c.cfGoal[k].forEach(function (v, i) {
        if (m.cf[k].items[i] && v !== null) m.cf[k].items[i][2] = v;
      });
    });
    Object.keys(c.as || {}).forEach(function (g) {
      if (!m.as[g]) return;
      c.as[g].forEach(function (v, i) { if (m.as[g][i]) m.as[g][i][1] = v; });
    });
    m.debt  = clone(c.debt  || []);
    m.goals = clone(c.goals || []);
    m.wrap  = clone(c.wrap  || {});
    /* 지난 상담을 열어 보는 자리라 바깥에서 받아 오는 자료(혜택·공공임대·실거래가·연말정산)도
       이미 조회해 둔 것으로 본다. 새로 적는 상담(blank)은 조회 전이라 이 표시가 없다. */
    m.fetched = true;
    m.v = VERSION;
    return m;
  }
  function caseNames() { return Object.keys(CASES); }

  /* 저장 값에 찍는 버전.
     뼈대(항목 구성·빈 값 규칙)를 바꾸면 이 숫자를 올린다. 그러면 예전 구조로 저장돼 있던
     값은 읽을 때 버려지고 빈 화면으로 시작한다.
     이게 없으면 화면 코드를 아무리 고쳐도 브라우저에 남은 옛 값이 그대로 읽힌다
     (`blank()` 은 저장된 게 없을 때만 도는 함수라 손이 닿지 않는다).
     v2 — 빈 상태에서 목표를 줄째 비우도록 바꿈 (2026-10-01)
     v3 — 03 자산 항목 이름을 기획 문서 표에 맞춤 (2026-10-01)
     v4 — 부채에 이번 달 원금·이자 추가 (2026-10-01)
     v5 — 빈 상태에서 빚도 줄째 비움 (2026-10-01)
     v6 — 01 상담목표(basic.wish·keep·change)를 모델에 담음 (2026-10-02) */
  var VERSION = 7;   // 7: 지난 상담에 '조회해 둔 자료' 표시(fetched) 추가

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var m = JSON.parse(raw);
        if (m && m.v === VERSION) return m;
        localStorage.removeItem(KEY);   // 구조가 다른 옛 값은 버린다
      }
    } catch (e) { /* 저장이 막힌 브라우저면 그냥 빈 값으로 */ }
    return blank();
  }
  function save(m) {
    try { m.v = VERSION; localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
  }
  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    return blank();
  }

  (function () {
    var want = new URLSearchParams(location.search).get('case');
    if (!want) return;
    var m = loadCase(want);
    if (!m) return;
    save(m);
    if (history.replaceState) history.replaceState(null, '', location.pathname);
  })();

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
  /* 다음 상담 → '2026.12.14 (월) 14:00'. 날짜가 없으면 빈 문자열.
     04 상담정리와 상담결과가 같은 문장을 보여 주도록 여기서 한 번만 만든다. */
  var DOW = ['일', '월', '화', '수', '목', '금', '토'];
  function nextText(m) {
    var w = (m && m.wrap) || {};
    // 안 정하기로 한 것과 아직 안 적은 것은 다른 말이라 문장을 나눈다
    if (w.noNext) return '다음 상담일을 정하지 않았어요';
    var d = String(w.next || '');
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(d)) return '';
    var p = d.split('-');
    var dt = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return p.join('.') + ' (' + DOW[dt.getDay()] + ')' + (w.nextTime ? ' ' + w.nextTime : '');
  }

  /* 기준일 → '2026.09.28'. 안 적었으면 상담일(BASE)을 쓴다. */
  function asDateText(m) {
    var d = (m && m.asDate || '').trim();
    if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(d)) return d.replace(/-/g, '.');
    return BASE_DATE_TEXT;
  }

  function round1(n) { return Math.round(n * 10) / 10; }

  function calc(m) {
    var income   = catTotal(m, '수입');
    var fixed    = groupTotal(m, FIXED);
    var vari     = groupTotal(m, VARI);
    // 매달 갚지 않는 빚(lump)은 월 상환이 없으므로 02 부채상환에서 뺀다
    var debtPay  = round1(m.debt.reduce(function (s, d) { return d.lump ? s : s + (Number(d.pay) || 0); }, 0));
    /* 이자는 쓴 돈이라 비용이고, 원금은 빚이 줄어드는 것이라 비용이 아니다.
       기획 문서의 부채 칸은 남은 돈·월 납입금·금리·만기 넷뿐이라 이자를 따로 받지 않는다.
       남은 돈 × 연 금리 ÷ 12 로 이번 달 이자를 잡고, 월 납입금을 넘지 않게 자른다
       (금리를 안 적었으면 0). 원금은 월 납입금 − 이자다. */
    var interest = round1(m.debt.reduce(function (s, d) {
      // 설계사가 이번 달 이자를 직접 적었으면 그 값을 쓴다(기획 manualSplit)
      if (d.manualSplit && d.interest != null && d.interest !== '') return s + (Number(d.interest) || 0);
      var bal = Number(d.bal) || 0, rate = Number(d.rate) || 0, pay = d.lump ? 0 : (Number(d.pay) || 0);
      var i = bal * rate / 100 / 12;
      return s + (pay ? Math.min(i, pay) : i);
    }, 0));
    var saving   = catTotal(m, '저축');
    var expense  = round1(fixed + vari + debtPay + saving);
    var balance  = round1(income - expense);

    var assets = 0;
    Object.keys(m.as).forEach(function (g) {
      m.as[g].forEach(function (r) { assets += Number(r[1]) || 0; });
    });
    var liab = m.debt.reduce(function (s, d) { return s + (Number(d.bal) || 0); }, 0);

    return {
      income: income, fixed: fixed, vari: vari, debtPay: debtPay, interest: interest, saving: saving,
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
  /* 순자산 ↔ 부채 막대(.ct-bar2) 채우기.
     한쪽 비중이 작으면 그 칸이 글자보다 좁아져 '순자산 0%' 가 한 글자씩 세로로 쌓인다.
     그래서 글자를 넣어 본 뒤 칸을 넘치면(scrollWidth > clientWidth) 그 칸은 비우고,
     막대 바로 아래 .ct-bar2-cap 줄에 적는다. 비율에 상관없이 글자는 늘 읽힌다.
     (칸 폭이 화면마다 달라 '몇 % 미만' 같은 고정 기준은 쓸 수 없다.) */
  function bar2(aEl, bEl, percent, aName, bName) {
    var host = aEl.parentNode;

    /* 적은 값이 하나도 없으면 비율 자체가 없다.
       그런데 0 을 넣으면 '순자산 0% · 부채 100%' 가 되어 빨간 막대가 꽉 차고,
       아무것도 안 적은 상담이 빚만 가득한 집처럼 읽힌다.
       값이 없다는 뜻으로 null 을 받으면 빈 막대만 둔다. */
    var empty = (percent === null || percent === undefined);
    host.classList.toggle('empty', empty);
    if (empty) {
      aEl.style.width = '0%'; bEl.style.width = '0%';
      aEl.textContent = ''; bEl.textContent = '';
      var blank = host.nextElementSibling;
      if (blank && blank.classList.contains('ct-bar2-cap')) { blank.textContent = ''; blank.hidden = true; }
      host._bar2apply = function () {};
      return;
    }

    var p = Math.max(0, Math.min(100, Math.round(percent || 0)));
    var aTxt = (aName || '순자산') + ' ' + p + '%';
    var bTxt = (bName || '부채') + ' ' + (100 - p) + '%';
    aEl.style.width = p + '%';
    bEl.style.width = (100 - p) + '%';

    function fit(el, text) {
      el.textContent = text;
      if (el.scrollWidth > el.clientWidth) { el.textContent = ''; return false; }
      return true;
    }
    function apply() {
      var out = [];
      if (!fit(aEl, aTxt)) out.push(aTxt);
      if (!fit(bEl, bTxt)) out.push(bTxt);
      var cap = host.nextElementSibling;
      if (cap && cap.classList.contains('ct-bar2-cap')) {
        cap.textContent = out.join(' · ');
        cap.hidden = !out.length;
      }
    }
    apply();

    /* 숨겨진 탭 안에 있으면 폭이 0이라 글자가 넘치는지 잴 수 없다.
       창 크기가 바뀔 때도 들어가던 글자가 안 들어갈 수 있다.
       그래서 막대 폭이 달라질 때마다 다시 맞춘다. */
    host._bar2apply = apply;   // 다시 그릴 때를 대비해 늘 최신 것을 둔다
    if (window.ResizeObserver && !host.dataset.bar2ro) {
      host.dataset.bar2ro = '1';
      new ResizeObserver(function () { host._bar2apply(); }).observe(host);
    }
  }

  // 입력 문자열 → 숫자 (빈 값·'미입력'은 null)
  function parse(v) {
    var s = String(v == null ? '' : v).replace(/[^0-9-]/g, '');
    return s === '' ? null : Number(s);
  }

  window.CT = {
    asDateText: asDateText, nextText: nextText, DOW: DOW, DEBT_LUMP: DEBT_LUMP, DEBT_PAY_KINDS: DEBT_PAY_KINDS,
    KEY: KEY, SAMPLE: SAMPLE, blank: blank, FIXED: FIXED, VARI: VARI, ORDER: ORDER, KINDS: KINDS, TERMS: TERMS, BASE_YM: BASE_YM,
    load: load, save: save, reset: reset, calc: calc,
    loadCase: loadCase, caseNames: caseNames,
    sumItems: sumItems, unknown: unknown, catTotal: catTotal, groupTotal: groupTotal,
    goals: goals, goalSum: goalSum, goalPhases: goalPhases, monthsTo: monthsTo,
    comma: comma, won: won, pct: pct, parse: parse, round1: round1, bar2: bar2
  };
})();
