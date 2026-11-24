/* ============================================================
   BoBi v2 — 약관 동의 (공통)

   약관 목록을 한 곳에서 관리하고, 두 가지 형태로 쓴다.
   1) 회원가입 1단계 — 약관 동의 전용 화면
   2) 카카오로 시작하기 — 레이어(모달)

   전문은 화면에 넣지 않고 노션 문서를 새 탭으로 연다.

   사용 방법
   ---------
   <div id="terms-host"></div>
   <script src="components/terms.js"></script>
   <script>
     var terms = renderTermsList(document.getElementById('terms-host'), 'sg', function (allAgreed) {
       document.getElementById('sg-terms-next').disabled = !allAgreed;
     });
     terms.allAgreed();          // 필수 3건 모두 동의했는지
     terms.focusFirstUnchecked(); // 미동의 항목으로 스크롤
   </script>

   openTermsLayer({ onAgree: function () { location.href = 'signup.html?social=kakao'; } });
   ============================================================ */
(function () {

  var TERMS = [
    {
      id: 'tos',
      title: '설계사 회원 이용약관',
      url: 'https://app.notion.com/p/4227b6dfe2838034bfc2d2bbb83ea386'
    },
    {
      id: 'privacy',
      title: '설계사 개인정보 수집 및 이용 동의',
      url: 'https://app.notion.com/p/4227b6dfe28380a1a041fa7dbb573621'
    },
    {
      id: 'customer',
      title: '고객정보 처리 및 준수사항 동의',
      url: 'https://app.notion.com/p/4227b6dfe2838011be65f8c4476242d3',
      summary: '고객정보는 고객이 동의한 상담 목적으로만 이용해야 하며, 목적 외 이용, 제3자 제공 및 외부 유출을 금지하고 안전하게 관리·파기해야 합니다. 이를 위반할 경우 서비스 이용이 제한될 수 있으며, 위반에 따른 법적 책임을 부담합니다.'
    }
  ];

  // ===== 마크업 =====
  function listHTML(prefix) {
    var items = TERMS.map(function (t) {
      var cbId = prefix + '-ag-' + t.id;
      return '' +
        '<div class="sg-term">' +
          '<div class="sg-term-head">' +
            '<label>' +
              '<input id="' + cbId + '" type="checkbox" data-required="1" />' +
              '<span><span class="sg-term-req">[필수]</span> ' + t.title + '</span>' +
            '</label>' +
            '<a class="sg-term-more" href="' + t.url + '" target="_blank" rel="noopener noreferrer">' +
              '전문보기' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"></polyline></svg>' +
            '</a>' +
          '</div>' +
          (t.summary ? '<p class="sg-term-sum">' + t.summary + '</p>' : '') +
        '</div>';
    }).join('');

    return '' +
      '<div class="sg-terms">' +
        '<label class="sg-terms-all">' +
          '<input id="' + prefix + '-ag-all" type="checkbox" />' +
          '<span>약관에 모두 동의합니다.</span>' +
        '</label>' +
        items +
      '</div>';
  }

  // ===== 렌더 + 바인딩 =====
  // onChange(allAgreed) — 체크 상태가 바뀔 때마다 호출
  window.renderTermsList = function (host, prefix, onChange) {
    host.innerHTML = listHTML(prefix || 'tm');

    var all = host.querySelector('.sg-terms-all input[type="checkbox"]');
    var items = Array.prototype.slice.call(host.querySelectorAll('.sg-term input[data-required]'));

    function allAgreed() {
      return items.every(function (i) { return i.checked; });
    }
    function sync() {
      var ok = allAgreed();
      all.checked = ok;
      all.indeterminate = !ok && items.some(function (i) { return i.checked; });
      if (onChange) onChange(ok);
    }

    all.addEventListener('change', function () {
      items.forEach(function (i) { i.checked = all.checked; });
      all.indeterminate = false;
      if (onChange) onChange(allAgreed());
    });
    items.forEach(function (i) { i.addEventListener('change', sync); });

    if (onChange) onChange(allAgreed());

    return {
      allAgreed: allAgreed,
      focusFirstUnchecked: function () {
        for (var i = 0; i < items.length; i++) {
          if (!items[i].checked) {
            items[i].closest('.sg-term').scrollIntoView({ block: 'center', behavior: 'smooth' });
            items[i].focus();
            return;
          }
        }
      }
    };
  };

  // ===== 레이어(모달) =====
  // openTermsLayer({ title, agreeLabel, onAgree })
  window.openTermsLayer = function (opts) {
    opts = opts || {};

    var prev = document.querySelector('.tm-overlay');
    if (prev) prev.remove();

    var overlay = document.createElement('div');
    overlay.className = 'tm-overlay';
    overlay.innerHTML = '' +
      '<div class="tm-layer" role="dialog" aria-modal="true" aria-labelledby="tm-title">' +
        '<div class="tm-head">' +
          '<h2 class="tm-title" id="tm-title">' + (opts.title || '약관 동의') + '</h2>' +
          '<button class="tm-close" type="button" aria-label="닫기">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          '</button>' +
        '</div>' +
        '<p class="tm-lead">서비스를 이용하려면 아래 약관에 동의해야 합니다.</p>' +
        '<div class="tm-body"></div>' +
        '<div class="tm-foot">' +
          '<button class="lg-submit tm-agree" type="button" disabled>' + (opts.agreeLabel || '동의하고 계속하기') + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.classList.add('tm-open');

    var agreeBtn = overlay.querySelector('.tm-agree');
    renderTermsList(overlay.querySelector('.tm-body'), 'tm', function (ok) {
      agreeBtn.disabled = !ok;
    });

    function close() {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('tm-open');
      overlay.remove();
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
    }

    overlay.querySelector('.tm-close').addEventListener('click', close);
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', onKey);

    agreeBtn.addEventListener('click', function () {
      close();
      if (opts.onAgree) opts.onAgree();
    });

    overlay.querySelector('.tm-close').focus();
    return { close: close };
  };

  window.getTermsDocs = function () { return TERMS; };

})();
