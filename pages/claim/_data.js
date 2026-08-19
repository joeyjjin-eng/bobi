/* ============================================================
   보험금청구 샘플 데이터 (list.html · detail.html · new.html 공용)
   ------------------------------------------------------------
   각 claim의 필드:
   - 리스트 요약용: id, date, customer, beneficiary, insurer, insurers[],
                    typeId, typeLabel, incident(짧은 요약), photoCount,
                    status, tone, signSummary, holdReason(hold일 때만)
   - 상세 확장용: customerInfo{rrn,phone}, beneficiaryInfo?(피≠수일 때만),
                  policyholderInfo?(계약자 다를 때만), guardianInfo?(미성년),
                  incidentRows[], account, times{sent,signed?}
   window.getClaimById(id) 는 위 데이터를 상세 페이지 스키마
   (persons/incident/signers/timeline)로 확장해서 돌려줍니다.
   ============================================================ */
(function () {
  var CLAIMS = [
    // ---------- 피 = 수 (동일인) 케이스 ----------
    { id:'c1', date:'2026.08.15', customer:'정하윤', beneficiary:'정하윤',
      insurer:'삼성화재', insurers:['삼성화재'],
      typeId:'disease', typeLabel:'질병', incident:'편도염으로 응급실 내원 후 입원 3일', photoCount:4,
      status:'청구서전송', tone:'sent', signSummary:'0/2 서명',
      customerInfo:{ rrn:'940302-2******', phone:'010-8839-5562' },
      incidentRows:[
        { label:'발병일', value:'2026.08.10' },
        { label:'증상',   value:'편도염으로 응급실 내원 후 입원 3일 치료' }
      ],
      account:{ bank:'카카오뱅크', no:'3333-01-1234567', holder:'정하윤' },
      times:{ sent:'2026.08.15 09:20' } },

    { id:'c2', date:'2026.08.12', customer:'강태우', beneficiary:'강태우',
      insurer:'현대해상 외 1건', insurers:['현대해상', 'KB손해보험'],
      typeId:'injury', typeLabel:'상해', incident:'등산 중 발목 인대 파열', photoCount:6,
      status:'청구서전송', tone:'sent', signSummary:'1/2 서명',
      customerInfo:{ rrn:'760608-1******', phone:'010-2204-7793' },
      incidentRows:[
        { label:'사고 날짜', value:'2026.08.10' },
        { label:'사고 장소', value:'북한산 등산로' },
        { label:'사고 경위', value:'하산 중 돌에 미끄러져 오른쪽 발목 인대 파열' }
      ],
      account:{ bank:'국민은행', no:'123456-04-556677', holder:'강태우' },
      times:{ sent:'2026.08.12 14:05' } },

    { id:'c3', date:'2026.08.10', customer:'조미라', beneficiary:'조미라',
      insurer:'라이나생명', insurers:['라이나생명'],
      typeId:'disease', typeLabel:'질병', incident:'고혈압 진단 및 약물 처방', photoCount:2,
      status:'청구완료', tone:'done', signSummary:'2/2 서명',
      customerInfo:{ rrn:'580609-2******', phone:'010-5570-2214' },
      incidentRows:[
        { label:'발병일', value:'2026.08.03' },
        { label:'증상',   value:'고혈압 진단 · 약물 처방(리시노프릴)' }
      ],
      account:{ bank:'농협은행', no:'302-1234-5678-91', holder:'조미라' },
      times:{ sent:'2026.08.10 10:12', signed:'2026.08.10 14:30' } },

    // ---------- 보류 케이스 (holdReason 있음) ----------
    { id:'c4', date:'2026.08.08', customer:'유지원', beneficiary:'유지원',
      insurer:'KB손해보험', insurers:['KB손해보험'],
      typeId:'disease', typeLabel:'질병', incident:'생리통 심화로 산부인과 진료', photoCount:3,
      status:'보류', tone:'hold', signSummary:'서류 재요청',
      holdReason:'제출된 진단서에 상병 코드가 누락되어 있어요. 병원에서 재발급 후 다시 첨부해 주세요.',
      customerInfo:{ rrn:'981126-2******', phone:'010-7781-3340' },
      incidentRows:[
        { label:'발병일', value:'2026.08.05' },
        { label:'증상',   value:'생리통 심화로 산부인과 진료 및 처방' }
      ],
      account:{ bank:'토스뱅크', no:'1000-1234-5678', holder:'유지원' },
      times:{ sent:'2026.08.08 11:00' } },

    // ---------- 피 = 수, 다건 청구 ----------
    { id:'c5', date:'2026.08.05', customer:'배태우', beneficiary:'배태우',
      insurer:'DB손해보험 외 1건', insurers:['DB손해보험', '메리츠화재'],
      typeId:'disease', typeLabel:'질병', incident:'허리 디스크 MRI 촬영 및 물리치료', photoCount:5,
      status:'청구서전송', tone:'sent', signSummary:'0/2 서명',
      customerInfo:{ rrn:'900511-1******', phone:'010-4471-9920' },
      incidentRows:[
        { label:'발병일', value:'2026.07.28' },
        { label:'증상',   value:'허리 디스크(요추 4-5번) MRI 촬영 · 물리치료 4회' }
      ],
      account:{ bank:'우리은행', no:'1002-345-678901', holder:'배태우' },
      times:{ sent:'2026.08.05 13:22' } },

    { id:'c6', date:'2026.08.02', customer:'홍길동', beneficiary:'홍길동',
      insurer:'메리츠화재 외 1건', insurers:['메리츠화재', '삼성화재'],
      typeId:'disease', typeLabel:'질병', incident:'오른쪽 무릎 통증과 부기', photoCount:3,
      status:'청구서전송', tone:'sent', signSummary:'0/2 서명',
      customerInfo:{ rrn:'800312-1******', phone:'010-1234-5678' },
      incidentRows:[
        { label:'발병일', value:'2026.07.28' },
        { label:'증상',   value:'오른쪽 무릎 통증과 부기로 통원 치료' }
      ],
      account:{ bank:'카카오뱅크', no:'3333-01-1234567', holder:'홍길동' },
      times:{ sent:'2026.08.02 10:15' } },

    // ---------- 피 ≠ 수 (다른 사람) 케이스: 부모가 자녀의 수익자 ----------
    { id:'c7', date:'2026.07.31', customer:'안소비', beneficiary:'안소비',
      insurer:'흥국화재', insurers:['흥국화재'],
      typeId:'injury', typeLabel:'상해', incident:'자전거 사고로 팔꿈치 골절', photoCount:7,
      status:'청구완료', tone:'done', signSummary:'2/2 서명',
      customerInfo:{ rrn:'910903-2******', phone:'010-3398-1027' },
      incidentRows:[
        { label:'사고 날짜', value:'2026.07.24' },
        { label:'사고 장소', value:'한강공원 자전거 도로' },
        { label:'사고 경위', value:'자전거 주행 중 넘어져 왼쪽 팔꿈치 골절' }
      ],
      account:{ bank:'신한은행', no:'110-234-567890', holder:'안소비' },
      times:{ sent:'2026.07.31 15:40', signed:'2026.07.31 18:12' } },

    // ---------- 보류 케이스 2 ----------
    { id:'c8', date:'2026.07.28', customer:'김민준', beneficiary:'김민준',
      insurer:'현대해상', insurers:['현대해상'],
      typeId:'injury', typeLabel:'상해', incident:'회사 계단에서 낙상', photoCount:1,
      status:'보류', tone:'hold', signSummary:'서류 재요청',
      holdReason:'제출된 응급실 영수증 사진이 흐릿해 재촬영을 요청했어요.',
      customerInfo:{ rrn:'920704-1******', phone:'010-2222-3333' },
      incidentRows:[
        { label:'사고 날짜', value:'2026.07.27' },
        { label:'사고 장소', value:'회사 계단' },
        { label:'사고 경위', value:'계단에서 발을 헛디뎌 응급실 이송, 왼쪽 발목 염좌' }
      ],
      account:{ bank:'국민은행', no:'123456-01-123456', holder:'김민준' },
      times:{ sent:'2026.07.28 09:02' } },

    { id:'c9', date:'2026.07.25', customer:'황정연', beneficiary:'황정연',
      insurer:'NH농협손해보험', insurers:['NH농협손해보험'],
      typeId:'disease', typeLabel:'질병', incident:'백내장 수술 (좌안)', photoCount:6,
      status:'청구완료', tone:'done', signSummary:'2/2 서명',
      customerInfo:{ rrn:'720919-2******', phone:'010-4408-9912' },
      incidentRows:[
        { label:'발병일', value:'2026.07.18' },
        { label:'증상',   value:'좌안 백내장 진단 및 수정체 삽입 수술' }
      ],
      account:{ bank:'농협은행', no:'352-1234-5678-13', holder:'황정연' },
      times:{ sent:'2026.07.25 10:00', signed:'2026.07.25 13:44' } },

    // ---------- 피 = 수, 다건 청구 ----------
    { id:'c10', date:'2026.07.22', customer:'한재현', beneficiary:'한재현',
      insurer:'한화생명 외 2건', insurers:['한화생명', '삼성화재', '메리츠화재'],
      typeId:'disease', typeLabel:'질병', incident:'대장내시경 검사 · 용종 제거', photoCount:4,
      status:'청구서전송', tone:'sent', signSummary:'0/2 서명',
      customerInfo:{ rrn:'700217-1******', phone:'010-6627-3398' },
      incidentRows:[
        { label:'발병일', value:'2026.07.17' },
        { label:'증상',   value:'대장내시경 검사 중 용종 3개 발견 · 즉시 제거' }
      ],
      account:{ bank:'하나은행', no:'123-910-456789', holder:'한재현' },
      times:{ sent:'2026.07.22 09:35' } },

    // ---------- 미성년 피보험자 (자녀) · 부모가 계약자·수익자·법정대리인 ----------
    { id:'c11', date:'2026.07.20', customer:'박지훈', beneficiary:'이서연',
      insurer:'현대해상 외 1건', insurers:['현대해상', 'KB손해보험'],
      typeId:'disease', typeLabel:'질병', incident:'맹장염으로 맹장 절제 (미성년 자녀)', photoCount:5,
      status:'청구완료', tone:'done', signSummary:'2/2 서명',
      customerInfo:{ rrn:'150520-3******', phone:'-' },
      beneficiaryInfo:{ name:'이서연', rrn:'881129-2******', phone:'010-4444-5555' },
      policyholderInfo:{ name:'이서연', rrn:'881129-2******', phone:'010-4444-5555' },
      guardianInfo:{ name:'이서연', rrn:'881129-2******', phone:'010-4444-5555' },
      incidentRows:[
        { label:'발병일', value:'2026.07.15' },
        { label:'증상',   value:'맹장염으로 맹장 절제 수술 · 2박3일 입원' }
      ],
      account:{ bank:'신한은행', no:'110-456-789012', holder:'이서연' },
      times:{ sent:'2026.07.20 11:30', signed:'2026.07.20 16:22' } },

    { id:'c12', date:'2026.07.15', customer:'이성환', beneficiary:'이성환',
      insurer:'삼성화재', insurers:['삼성화재'],
      typeId:'injury', typeLabel:'상해', incident:'축구 경기 중 무릎 부상', photoCount:3,
      status:'청구완료', tone:'done', signSummary:'2/2 서명',
      customerInfo:{ rrn:'871030-1******', phone:'010-1142-8806' },
      incidentRows:[
        { label:'사고 날짜', value:'2026.07.10' },
        { label:'사고 장소', value:'동네 축구장' },
        { label:'사고 경위', value:'축구 경기 중 상대 선수와 충돌하여 오른쪽 무릎 인대 손상' }
      ],
      account:{ bank:'국민은행', no:'987-654-321012', holder:'이성환' },
      times:{ sent:'2026.07.15 12:20', signed:'2026.07.15 18:50' } },

    { id:'c13', date:'2026.07.12', customer:'김정운', beneficiary:'김정운',
      insurer:'동양생명', insurers:['동양생명'],
      typeId:'disease', typeLabel:'질병', incident:'우울증 진단 및 심리치료', photoCount:2,
      status:'청구완료', tone:'done', signSummary:'2/2 서명',
      customerInfo:{ rrn:'810811-2******', phone:'010-3320-1185' },
      incidentRows:[
        { label:'발병일', value:'2026.06.28' },
        { label:'증상',   value:'우울증 진단 · 심리치료 8회 진행' }
      ],
      account:{ bank:'우리은행', no:'1002-987-654321', holder:'김정운' },
      times:{ sent:'2026.07.12 14:00', signed:'2026.07.12 19:30' } },

    { id:'c14', date:'2026.07.10', customer:'홍길동', beneficiary:'홍길동',
      insurer:'삼성화재 외 1건', insurers:['삼성화재', '메리츠화재'],
      typeId:'disease', typeLabel:'질병', incident:'심근경색 진단', photoCount:4,
      status:'청구완료', tone:'done', signSummary:'2/2 서명',
      customerInfo:{ rrn:'800312-1******', phone:'010-1234-5678' },
      incidentRows:[
        { label:'발병일', value:'2026.06.30' },
        { label:'증상',   value:'심근경색 진단 · 관상동맥 스텐트 시술' }
      ],
      account:{ bank:'카카오뱅크', no:'3333-01-1234567', holder:'홍길동' },
      times:{ sent:'2026.07.10 09:50', signed:'2026.07.10 13:11' } },

    { id:'c15', date:'2026.07.08', customer:'최부명', beneficiary:'최부명',
      insurer:'KB손해보험', insurers:['KB손해보험'],
      typeId:'injury', typeLabel:'상해', incident:'교통사고 · 목 염좌', photoCount:8,
      status:'청구서전송', tone:'sent', signSummary:'2/2 서명',
      customerInfo:{ rrn:'810523-1******', phone:'010-9981-4470' },
      incidentRows:[
        { label:'사고 날짜', value:'2026.07.02' },
        { label:'사고 장소', value:'서초구 반포대로 사거리' },
        { label:'사고 경위', value:'신호대기 중 후미 추돌사고, 목·허리 통증으로 통원 치료' }
      ],
      account:{ bank:'농협은행', no:'351-9876-5432-10', holder:'최부명' },
      times:{ sent:'2026.07.08 15:30' } },

    { id:'c16', date:'2026.07.05', customer:'오미자', beneficiary:'오미자',
      insurer:'메리츠화재', insurers:['메리츠화재'],
      typeId:'disease', typeLabel:'질병', incident:'담낭염으로 담낭 절제 수술', photoCount:6,
      status:'청구완료', tone:'done', signSummary:'2/2 서명',
      customerInfo:{ rrn:'791205-2******', phone:'010-2256-6834' },
      incidentRows:[
        { label:'발병일', value:'2026.06.28' },
        { label:'증상',   value:'급성 담낭염 진단 · 복강경 담낭 절제 수술' }
      ],
      account:{ bank:'신한은행', no:'110-333-444555', holder:'오미자' },
      times:{ sent:'2026.07.05 11:15', signed:'2026.07.05 17:00' } },

    // ---------- 보류 케이스 3 (담당자 확인 필요) ----------
    { id:'c17', date:'2026.07.02', customer:'송민재', beneficiary:'송민재',
      insurer:'롯데손해보험', insurers:['롯데손해보험'],
      typeId:'disease', typeLabel:'질병', incident:'당뇨 합병증 안과 정기 검진', photoCount:2,
      status:'보류', tone:'hold', signSummary:'담당자 확인 필요',
      holdReason:'보험사에서 진단 사유 추가 확인 요청이 들어왔어요. 담당자 회신 후 재접수합니다.',
      customerInfo:{ rrn:'631102-1******', phone:'010-3392-7741' },
      incidentRows:[
        { label:'발병일', value:'2026.06.25' },
        { label:'증상',   value:'당뇨 합병증 관련 안과 정기 검진 · 안저 검사' }
      ],
      account:{ bank:'국민은행', no:'700-123-456780', holder:'송민재' },
      times:{ sent:'2026.07.02 10:20' } },

    // ---------- 피 ≠ 수 (다른 사람) 케이스: 배우자가 수익자 ----------
    { id:'c18', date:'2026.06.28', customer:'박지훈', beneficiary:'최수정',
      insurer:'롯데손해보험', insurers:['롯데손해보험'],
      typeId:'disease', typeLabel:'질병', incident:'감기 통원 치료 5회 (배우자 수령)', photoCount:5,
      status:'청구완료', tone:'done', signSummary:'2/2 서명',
      customerInfo:{ rrn:'150520-3******', phone:'010-6666-7777' },
      beneficiaryInfo:{ name:'최수정', rrn:'750108-2******', phone:'010-8888-9999' },
      incidentRows:[
        { label:'발병일', value:'2026.06.20' },
        { label:'증상',   value:'독감으로 통원 치료 5회 및 약제 처방' }
      ],
      account:{ bank:'우리은행', no:'1002-345-678901', holder:'최수정' },
      times:{ sent:'2026.06.28 08:30', signed:'2026.06.28 11:15' } },

    { id:'c19', date:'2026.06.25', customer:'장숙영', beneficiary:'장숙영',
      insurer:'한화손해보험', insurers:['한화손해보험'],
      typeId:'injury', typeLabel:'상해', incident:'욕실에서 미끄러져 손목 골절', photoCount:4,
      status:'청구완료', tone:'done', signSummary:'2/2 서명',
      customerInfo:{ rrn:'830328-2******', phone:'010-7715-2230' },
      incidentRows:[
        { label:'사고 날짜', value:'2026.06.20' },
        { label:'사고 장소', value:'자택 욕실' },
        { label:'사고 경위', value:'샤워 후 욕실에서 미끄러져 넘어짐, 오른쪽 손목 골절' }
      ],
      account:{ bank:'하나은행', no:'321-654-987012', holder:'장숙영' },
      times:{ sent:'2026.06.25 13:45', signed:'2026.06.25 16:30' } },

    // ---------- 피 ≠ 수: 다건 청구 + 다른 수익자 ----------
    { id:'c20', date:'2026.06.22', customer:'김진주', beneficiary:'김진주',
      insurer:'DB손해보험 외 1건', insurers:['DB손해보험', '삼성화재'],
      typeId:'disease', typeLabel:'질병', incident:'유방 초음파 정밀 검사', photoCount:3,
      status:'청구완료', tone:'done', signSummary:'2/2 서명',
      customerInfo:{ rrn:'830215-2******', phone:'010-1234-5678' },
      incidentRows:[
        { label:'발병일', value:'2026.06.15' },
        { label:'증상',   value:'유방 정기 검진 시 이상 소견, 초음파 정밀 검사' }
      ],
      account:{ bank:'국민은행', no:'234-56-789012', holder:'김진주' },
      times:{ sent:'2026.06.22 10:12', signed:'2026.06.22 15:45' } },

    { id:'c21', date:'2026.06.20', customer:'김민준', beneficiary:'김민준',
      insurer:'DB손해보험', insurers:['DB손해보험'],
      typeId:'injury', typeLabel:'상해', incident:'자전거 사고로 손목 골절', photoCount:2,
      status:'청구서전송', tone:'sent', signSummary:'1/2 서명',
      customerInfo:{ rrn:'920704-1******', phone:'010-2222-3333' },
      incidentRows:[
        { label:'사고 날짜', value:'2026.06.18' },
        { label:'사고 장소', value:'출근길 자전거 도로' },
        { label:'사고 경위', value:'자전거 주행 중 넘어져 왼쪽 손목 골절' }
      ],
      account:{ bank:'국민은행', no:'123456-01-123456', holder:'김민준' },
      times:{ sent:'2026.06.20 09:15' } },

    { id:'c22', date:'2026.06.18', customer:'정하윤', beneficiary:'정하윤',
      insurer:'삼성화재', insurers:['삼성화재'],
      typeId:'disease', typeLabel:'질병', incident:'알레르기성 비염 통원', photoCount:2,
      status:'청구완료', tone:'done', signSummary:'2/2 서명',
      customerInfo:{ rrn:'940302-2******', phone:'010-8839-5562' },
      incidentRows:[
        { label:'발병일', value:'2026.06.10' },
        { label:'증상',   value:'알레르기성 비염으로 이비인후과 통원 3회' }
      ],
      account:{ bank:'카카오뱅크', no:'3333-01-1234567', holder:'정하윤' },
      times:{ sent:'2026.06.18 10:40', signed:'2026.06.18 20:22' } },

    // ---------- 미성년 피보험자 (상해 · 진행중) ----------
    { id:'c23', date:'2026.06.15', customer:'김하늘', beneficiary:'김미래',
      insurer:'DB손해보험', insurers:['DB손해보험'],
      typeId:'injury', typeLabel:'상해', incident:'놀이터에서 넘어져 이마 열상 (미성년 자녀)', photoCount:3,
      status:'청구서전송', tone:'sent', signedCount: 1,
      customerInfo:{ rrn:'180825-3******', phone:'-' },
      beneficiaryInfo:{ name:'김미래', rrn:'840612-2******', phone:'010-3345-2211' },
      policyholderInfo:{ name:'김미래', rrn:'840612-2******', phone:'010-3345-2211' },
      guardianInfo:{ name:'김미래', rrn:'840612-2******', phone:'010-3345-2211' },
      incidentRows:[
        { label:'사고 날짜', value:'2026.06.10' },
        { label:'사고 장소', value:'아파트 놀이터' },
        { label:'사고 경위', value:'미끄럼틀에서 내려오다 넘어져 이마 열상, 응급실 봉합 5바늘' }
      ],
      account:{ bank:'국민은행', no:'987-654-321012', holder:'김미래' },
      times:{ sent:'2026.06.15 14:22' } }
  ];

  // ===== 상세 페이지용 확장 ==============================================
  function expandClaim(c) {
    if (!c) return null;
    var isMinorFlow = !!c.guardianInfo;
    var beneDiffers = !!c.beneficiaryInfo;
    var policyDiffers = !!c.policyholderInfo;

    // 인적사항 (피보험자 / 계약자 / 수익자 / [법정대리인])
    var persons = [];
    persons.push({
      label:'피보험자',
      name: c.customer,
      rrn:  c.customerInfo.rrn,
      phone: c.customerInfo.phone
    });
    if (policyDiffers) {
      persons.push({
        label:'계약자',
        name: c.policyholderInfo.name + ' (직접 입력)',
        rrn:  c.policyholderInfo.rrn,
        phone: c.policyholderInfo.phone
      });
    } else {
      persons.push({
        label:'계약자',
        name: c.customer + ' (피보험자와 동일)',
        rrn:  c.customerInfo.rrn,
        phone: c.customerInfo.phone
      });
    }
    if (beneDiffers) {
      persons.push({
        label:'수익자',
        name: c.beneficiaryInfo.name + ' (직접 입력)',
        rrn:  c.beneficiaryInfo.rrn,
        phone: c.beneficiaryInfo.phone
      });
    } else {
      persons.push({
        label:'수익자',
        name: c.customer + ' (피보험자와 동일)',
        rrn:  c.customerInfo.rrn,
        phone: c.customerInfo.phone
      });
    }
    if (isMinorFlow) {
      persons.push({
        label:'법정대리인',
        name: c.guardianInfo.name,
        rrn:  c.guardianInfo.rrn,
        phone: c.guardianInfo.phone
      });
    }

    // 사고 내용 (사고 유형은 첫 줄로 고정 + 저장된 incidentRows 이어붙임)
    var incident = [{ label:'사고 유형', value: c.typeLabel }].concat(c.incidentRows || []);

    // 서명자 (계약자 제외 · 미성년이면 법정대리인이 피보험자 자격 대리서명 · 같은 사람이면 태그 병합)
    var signers = [];
    var now = c.times || {};
    var doneAll = c.tone === 'done';
    var statusCode = doneAll ? 'done' : 'sent';
    var statusLbl  = doneAll ? '서명완료' : '전송됨';
    var timeVal    = doneAll ? (now.signed || now.sent || '-') : (now.sent || '-');
    var insuredRole = isMinorFlow ? '법정대리인' : '피보험자';
    var insuredSigner = isMinorFlow
      ? { name: c.guardianInfo.name, phone: c.guardianInfo.phone }
      : { name: c.customer, phone: c.customerInfo.phone };
    var beneSigner = beneDiffers
      ? { name: c.beneficiaryInfo.name, phone: c.beneficiaryInfo.phone }
      : { name: c.customer, phone: c.customerInfo.phone };
    var same = insuredSigner.name === beneSigner.name && insuredSigner.phone === beneSigner.phone;
    if (same) {
      signers.push({ roles: [insuredRole, '수익자'], name: insuredSigner.name, phone: insuredSigner.phone,
                     status: statusCode, statusLbl: statusLbl, time: timeVal });
    } else {
      signers.push({ roles: [insuredRole], name: insuredSigner.name, phone: insuredSigner.phone,
                     status: statusCode, statusLbl: statusLbl, time: timeVal });
      signers.push({ roles: ['수익자'], name: beneSigner.name, phone: beneSigner.phone,
                     status: statusCode, statusLbl: statusLbl, time: timeVal });
    }

    // 타임라인 (2단계)
    var timeline = [
      { label:'청구서 전송 · 서명 링크 발송', time: now.sent || '-',   on: !!now.sent },
      { label:'청구 완료 · 고객 서명 완료',   time: now.signed || '-', on: doneAll && !!now.signed }
    ];

    return {
      insurerLabel: c.insurer,
      customer: c.customer,
      typeLabel: c.typeLabel,
      date: c.date,
      status: c.status,
      tone: c.tone,
      holdReason: c.tone === 'hold' ? (c.holdReason || null) : null, // 정상 상태에서는 무조건 null
      persons: persons,
      incident: incident,
      insurers: c.insurers.slice(),
      photoCount: c.photoCount,
      account: c.account,
      timeline: timeline,
      signers: signers
    };
  }

  // ===== localStorage 에서 새로 제출된 청구 병합 (최신이 위로) ===========
  try {
    var raw = window.localStorage && window.localStorage.getItem('bobi-claims-extra');
    if (raw) {
      var extra = JSON.parse(raw);
      if (Array.isArray(extra) && extra.length) {
        CLAIMS = extra.concat(CLAIMS);
      }
    }
  } catch (e) {}

  // ===== signSummary 자동 계산 (피=수는 /1, 피≠수는 /2) ==================
  // 보류(hold)의 안내 문구("서류 재요청" 등)는 그대로 유지.
  // 부분 서명(피≠수인데 1명만 서명함) 케이스는 c.signedCount 로 명시.
  CLAIMS.forEach(function (c) {
    if (c.tone === 'hold') return;
    var total = c.beneficiaryInfo ? 2 : 1;
    var signed = (c.tone === 'done') ? total : (typeof c.signedCount === 'number' ? c.signedCount : 0);
    c.signSummary = signed + '/' + total + ' 서명';
  });

  window.CLAIMS = CLAIMS;
  window.getClaimById = function (id) {
    var c = CLAIMS.filter(function (x) { return x.id === id; })[0] || CLAIMS[0];
    return expandClaim(c);
  };

  // ===== 보험사 목록 (손해 13 · 생명 9) ==================================
  // 로고 파일은 assets/ 루트에 위치. tel은 각 사의 공개 고객센터 번호.
  var LOGO_BASE = '../../assets/';
  var INSURERS = {
    damage: [
      { name:'AIG손해',       tel:'1544-2792', logo: LOGO_BASE + 'icn_blogo_aig_s.png' },
      { name:'KB손해보험',    tel:'1544-0114', logo: LOGO_BASE + 'icn_blogo_kb_s.png' },
      { name:'NH농협손해',    tel:'1644-9000', logo: LOGO_BASE + 'icn_blogo_nh_s.png' },
      { name:'DB손해보험',    tel:'1588-0100', logo: LOGO_BASE + 'icn_blogo_db_s.png' },
      { name:'라이나손보',    tel:'1588-0058', logo: LOGO_BASE + 'icn_blogo_lina_s.png' },
      { name:'롯데손해',      tel:'1588-3344', logo: LOGO_BASE + 'icn_blogo_lt_s.png' },
      { name:'메리츠화재',    tel:'1566-7711', logo: LOGO_BASE + 'icn_blogo_mz_s.png' },
      { name:'삼성화재',      tel:'1588-5114', logo: LOGO_BASE + 'icn_blogo_ss_s.png' },
      { name:'예별손보(MG)',  tel:'1588-5959', logo: LOGO_BASE + 'icn_blogo_yb_s.png' },
      { name:'하나손해',      tel:'1566-3000', logo: LOGO_BASE + 'icn_blogo_hnsh_s.png' },
      { name:'한화손해보험',  tel:'1566-8000', logo: LOGO_BASE + 'icn_carinsu_hh_s.png' },
      { name:'현대해상',      tel:'1588-5656', logo: LOGO_BASE + 'icn_blogo_hd_s.png' },
      { name:'흥국화재',      tel:'1688-1688', logo: LOGO_BASE + 'icn_carinsu_hk_s.png' }
    ],
    life: [
      { name:'ABL생명',       tel:'1588-6500', logo: LOGO_BASE + 'icn_logo_abl_s.png' },
      { name:'AIA생명',       tel:'1588-9898', logo: LOGO_BASE + 'icn_blogo_aia_s.png' },
      { name:'DB생명',        tel:'1588-3131', logo: LOGO_BASE + 'icn_blogo_db_s.png' },
      { name:'IM라이프',      tel:'1588-8007', logo: LOGO_BASE + 'icn_blogo_iml_s.png' },
      { name:'KB라이프',      tel:'1588-9922', logo: LOGO_BASE + 'icn_blogo_kb_s.png' },
      { name:'NH농협생명',    tel:'1544-4000', logo: LOGO_BASE + 'icn_blogo_nh_s.png' },
      { name:'라이나생명',    tel:'1588-0058', logo: LOGO_BASE + 'icn_blogo_lina_s.png' },
      { name:'카디프생명',    tel:'1544-0300', logo: LOGO_BASE + 'icn_blogo_cardif_s.png' },
      { name:'처브라이프',    tel:'1599-4600', logo: LOGO_BASE + 'icn_blogo_cb_s.png' }
    ]
  };
  window.INSURERS = INSURERS;
  // 이름으로 빠르게 조회
  window.getInsurerByName = function (name) {
    var all = INSURERS.damage.concat(INSURERS.life);
    return all.filter(function (i) { return i.name === name; })[0] || null;
  };
})();
