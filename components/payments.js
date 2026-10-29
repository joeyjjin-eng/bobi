/* ============================================================
   토스페이먼츠 결제취소 어댑터
   ------------------------------------------------------------
   시크릿 키는 브라우저에 둘 수 없다. Authorization: Basic base64(SECRET_KEY:) 를
   프런트에 넣으면 소스 보기만으로 키가 노출되고, 그 키는 결제 API 전체 권한을 가진다.
   토스 API는 브라우저 origin 에 CORS 도 열지 않는다.

   그래서 호출은 항상 우리 서버를 한 번 경유한다.

     브라우저  →  POST /api/payments/{paymentKey}/cancel      (세션 쿠키 인증)
     우리 서버 →  POST https://api.tosspayments.com/v1/payments/{paymentKey}/cancel
                  Authorization: Basic base64(SECRET_KEY + ':')

   서버가 반드시 해야 하는 일 (프런트 판정은 화면 힌트일 뿐 권한이 아니다)
     1. 로그인한 회원이 그 paymentKey 의 소유자인지 확인
     2. 약관 제5조 1항 판정을 서버에서 다시 수행 — 결제일로부터 7일 이내 + 사용 이력 0건
     3. 멱등키로 중복 취소 차단
     4. 토스 응답을 받은 뒤에야 플랜을 FREE 로 내리고 정기결제를 해지

   지금은 백엔드가 없어 DEMO 모드로 동작한다. 서버가 생기면 DEMO 를 false 로 바꾸면 된다.
   ============================================================ */
(function () {
  'use strict';

  var DEMO = true;                                      // 서버 연결 시 false
  var ENDPOINT = '/api/payments/{paymentKey}/cancel';   // 우리 서버. 토스 URL 을 직접 쓰지 않는다.

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  /* 데모 응답 — 토스 Payment 객체의 cancels 배열 모양을 그대로 흉내낸다 */
  function demoResponse(opts) {
    var now = new Date().toISOString();
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({
          paymentKey: opts.paymentKey,
          status: 'CANCELED',
          totalAmount: opts.cancelAmount,
          cancels: [{
            transactionKey: uuid().replace(/-/g, '').toUpperCase(),
            cancelReason: opts.cancelReason,
            cancelAmount: opts.cancelAmount,
            canceledAt: now,
            cancelStatus: 'DONE'
          }]
        });
      }, 700);
    });
  }

  /**
   * 결제 취소.
   * @param {Object} opts
   * @param {string} opts.paymentKey     토스 결제 키 (최대 200자)
   * @param {string} opts.cancelReason   필수. 취소 사유 (최대 200자)
   * @param {number} [opts.cancelAmount] 부분 취소 금액. 생략하면 전액 취소
   *
   * 가상계좌 환불 계좌(refundReceiveAccount)는 프런트가 보내지 않는다. 서버가 결제 승인 때
   * 저장해 둔 값을 붙인다. 카드번호·계좌번호를 브라우저로 내려보낼 이유가 없다.
   * @returns {Promise<Object>} 토스 Payment 객체
   */
  window.cancelPayment = function (opts) {
    if (!opts || !opts.paymentKey) return Promise.reject(new Error('paymentKey 가 없습니다.'));
    if (!opts.cancelReason) return Promise.reject(new Error('cancelReason 은 필수입니다.'));

    var body = { cancelReason: String(opts.cancelReason).slice(0, 200) };
    if (opts.cancelAmount != null) body.cancelAmount = opts.cancelAmount;

    if (DEMO) return demoResponse(opts);

    return fetch(ENDPOINT.replace('{paymentKey}', encodeURIComponent(opts.paymentKey)), {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        // 같은 취소 요청이 두 번 가도 한 번만 처리된다. 버튼 연타·네트워크 재시도 대비.
        'Idempotency-Key': opts.idempotencyKey || uuid()
      },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var err = new Error(data.message || '결제 취소에 실패했습니다.');
          err.code = data.code;          // 토스 에러 코드를 그대로 올린다
          err.status = res.status;
          throw err;
        }
        return data;
      });
    });
  };

  window.isPaymentsDemo = function () { return DEMO; };
})();

/* ------------------------------------------------------------
   서버 쪽 참고 구현 (Node/Express). 실제 코드는 백엔드 저장소에 둔다.

   app.post('/api/payments/:paymentKey/cancel', requireLogin, async (req, res) => {
     const { paymentKey } = req.params;
     const { cancelReason, cancelAmount } = req.body;

     // 1) 소유자 확인
     const payment = await db.findPayment(paymentKey);
     if (!payment || payment.memberId !== req.user.id) {
       return res.status(404).json({ message: '결제를 찾을 수 없습니다.' });
     }

     // 2) 약관 제5조 1항 재판정 — 프런트 판정은 신뢰하지 않는다
     const elapsed = daysSince(payment.paidAt);
     const used = await db.countFeatureUsageSince(req.user.id, payment.paidAt);
     if (elapsed > 7 || used > 0) {
       return res.status(409).json({ message: '취소 대상이 아닙니다. 고객센터로 문의해 주세요.' });
     }

     // 3) 토스 호출 — 시크릿 키는 서버 환경변수에서만 읽는다
     const auth = Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64');
     const r = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}/cancel`, {
       method: 'POST',
       headers: {
         Authorization: `Basic ${auth}`,
         'Content-Type': 'application/json',
         'Idempotency-Key': req.get('Idempotency-Key')
       },
       body: JSON.stringify({
         cancelReason,
         ...(cancelAmount != null && { cancelAmount }),
         // 가상계좌: 결제 승인 직후 DB에 저장해 둔 환불 계좌를 서버가 붙인다.
         // 이 값은 결제창을 띄운 시점부터 30분만 조회 가능하므로 승인 직후 저장이 필수다.
         ...(payment.method === 'VIRTUAL_ACCOUNT' && { refundReceiveAccount: payment.refundReceiveAccount })
       })
     });
     const data = await r.json();
     if (!r.ok) return res.status(r.status).json(data);

     // 4) 토스가 성공을 준 뒤에야 우리 상태를 바꾼다
     await db.markRefunded(paymentKey, data.cancels[0]);
     await db.cancelAutoRenew(req.user.id);
     await db.downgradeToFree(req.user.id);

     res.json(data);
   });
   ------------------------------------------------------------ */
