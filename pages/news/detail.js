/* 보험소식지 — 기사 상세 (detail.html?no=<기사 번호>)
   지면은 article.js 가 그린다. 이 파일은 주소에서 기사를 찾아 꽂는 일만 한다. */
(function () {
  var A = window.NEWS_ARTICLE;
  if (!window.NEWS || !A) return;

  var host = document.getElementById('nd-body');
  var it = A.find(parseInt(new URLSearchParams(location.search).get('no'), 10));

  if (!it) { host.innerHTML = A.notFound(); return; }

  document.title = it.title + ' · BoBi 보험소식지';
  host.innerHTML = A.html(it);
})();
