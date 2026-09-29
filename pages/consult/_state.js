/* ============================================================
   재무상담 — 화면 상태 전환
   기본(새로운 상담하기)은 빈 값 + 힌트. ?demo=1 이면 예시 값을 채운다.
   마크업은 한 벌만 두고 아래 data-* 속성으로 두 상태를 만든다.

     data-hint="예) 김민준"   빈 상태에서 보여 줄 힌트 (회색)
     data-demo="김민준"       ?demo=1 일 때 채울 값
     data-empty="—"          data-hint 없는 칸의 빈 상태 표시 (기본 "—")
     data-only="demo"        예시에서만 보이는 블록
     data-only="empty"       빈 상태에서만 보이는 블록
     data-advisor-only       ?customer=1 이면 숨김 (설계사 전용)
   ============================================================ */
(function () {
  var qs = new URLSearchParams(location.search);
  var demo = qs.get('demo') === '1';

  // 상담 중 화면끼리 이동할 때 상태를 잃지 않도록 링크에 demo를 물려 준다
  if (demo) {
    document.querySelectorAll('a[href$=".html"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (/^(https?:)?\/\//.test(href) || href.indexOf('demo=') > -1) return;
      if (a.classList.contains('back-btn') || href.indexOf('index.html') > -1) return;
      a.setAttribute('href', href + (href.indexOf('?') > -1 ? '&' : '?') + 'demo=1');
    });
  }

  // 힌트가 있는 칸
  document.querySelectorAll('[data-hint]').forEach(function (el) {
    var v = el.getAttribute('data-demo');
    if (demo && v !== null) {
      el.textContent = v;
      el.classList.remove('hint');
    } else {
      el.textContent = el.getAttribute('data-hint');
      el.classList.add('hint');
    }
  });

  // 힌트 없이 값만 바뀌는 칸 (합계·비중 등)
  document.querySelectorAll('[data-demo]:not([data-hint])').forEach(function (el) {
    el.textContent = demo ? el.getAttribute('data-demo') : (el.getAttribute('data-empty') || '—');
    el.classList.toggle('ct-none-v', !demo);
  });

  // 상태별 블록
  document.querySelectorAll('[data-only="demo"]').forEach(function (el) { el.hidden = !demo; });
  document.querySelectorAll('[data-only="empty"]').forEach(function (el) { el.hidden = demo; });

  // 빈 상태에서는 선택·강조를 모두 풀어 둔다
  if (!demo) {
    // 선택 컨트롤은 고르기 전일 뿐이므로 선택만 풀고 글자는 평소 색으로 둔다
    document.querySelectorAll('.ct-seg .on').forEach(function (d) { d.classList.remove('on'); });
    document.querySelectorAll('.ct-in.focus').forEach(function (el) { el.classList.remove('focus'); });
    document.querySelectorAll('.ct-sum .box.hi').forEach(function (el) { el.classList.add('none'); });
    document.querySelectorAll('.ct-track i').forEach(function (el) { el.style.width = '0%'; });
    document.querySelectorAll('select[data-demo-sel]').forEach(function (s) { s.selectedIndex = 0; });
  }

  // 고객 보기 — 설계사 전용 칸 숨김
  if (qs.get('customer') === '1') {
    document.querySelectorAll('[data-advisor-only]').forEach(function (el) { el.hidden = true; });
  }
})();
