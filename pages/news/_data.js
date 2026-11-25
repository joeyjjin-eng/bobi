/* ============================================================
   보험인사이트 — 오늘의 뉴스 표본 자료

   화면 확인용입니다. 실제 서비스에서는 서버가 같은 모양으로
   머리 자료(NEWS.head)와 목록(NEWS.items)을 내려줍니다.

   items[] 필드
     no         기사 번호 (상세 식별자)
     date       기사 게시·확인일
     kind       뉴스 분류 — 필터 '뉴스 분류', 분류별 보기의 묶음 기준
     org        관련 기관·회사
     topic      주제 키 (product | industry | consumer)
     topicLabel 주제 이름
     status     진행 상태
     title      제목
     brief      주요 내용
     announced  발표일 (없으면 null)
     effective  시행일 (없으면 null)
     url        원문 주소
   ============================================================ */
window.NEWS = {
  /* 목록 한 쪽에 보여줄 건수 */
  size: 9,

  head: {
    /* 헤드라인 기준일 */
    date: "2026.11.11",
    /* 오늘의 보험 헤드라인 — 주제별 주요 기사 (items 의 no) */
    headlines: [155, 156, 151],
    /* 상품·보장 소식 (items 의 no) — 가로로 이어지는 띠라 3건보다 많이 둔다 */
    products: [155, 141, 125, 124, 130, 131],
    /* 주제 묶음 [키, 이름] 과 주제별 건수 */
    topics: [["all", "전체"], ["product", "상품·보장"], ["industry", "보험사·GA 이슈"], ["consumer", "소비자·보상"]],
    topicCounts: { "all": 18, "product": 6, "industry": 8, "consumer": 4 },
    /* '뉴스 분류' 선택 목록 */
    kinds: ["상품", "감독 동향", "업계 동향", "GA 영업채널", "업계 분석", "입법 후속", "GA 내부통제", "판매 실적 분석", "건강보험 급여 검토", "감독규정 개정 의결", "법안 발의 보도", "신상품", "GA·위험관리", "소비자·보험금 청구", "상품·보장", "설계지원 서비스", "상품 개정"]
  },

  items: [
    {
      no: 155, date: "2026.11.11", kind: "상품", org: "KDB생명",
      thumb: "../../assets/news/news-art-1.jpg",
      topic: "product", topicLabel: "상품·보장", status: "출시",
      title: "KDB생명, 더!행복플러스종신보험 출시",
      brief: "KDB생명이 10년납과 20년납을 선택할 수 있는 체증형 종신보험을 출시했습니다. 계약일부터 10년간 사망보험금이 단계적으로 늘어나는 구조이며, 연금전환 기능을 포함합니다.",
      announced: null, effective: null,
      url: "https://www.insjournal.co.kr/news/articleView.html?idxno=33860"
    },
    {
      no: 156, date: "2026.11.11", kind: "감독 동향", org: "금융감독원",
      thumb: "../../assets/news/news-art-3.jpg",
      topic: "industry", topicLabel: "보험사·GA 이슈", status: "자료 요청 보도",
      title: "금감원, 간병인보험 판매·손해율 자료 요청 보도",
      brief: "보험저널은 금감원이 보험사에 간병인보험의 계약과 손해율 통계를 요청했다고 보도했습니다. 보도에서 확인된 범위는 자료 제출 요구입니다.",
      announced: null, effective: null,
      url: "https://www.insjournal.co.kr/news/articleView.html?idxno=33856"
    },
    {
      no: 157, date: "2026.11.11", kind: "업계 동향", org: "보험연수원",
      thumb: "../../assets/news/news-art-4.jpg",
      topic: "industry", topicLabel: "보험사·GA 이슈", status: "대책 발표",
      title: "보험연수원, 자격시험 스마트기기 부정행위 대응 강화 발표",
      brief: "보험연수원이 스마트기기를 이용한 자격시험 부정행위의 감독과 제재를 강화하겠다고 밝혔습니다. 대책에는 부정행위자의 응시 자격을 최대 3년간 제한하는 방안이 포함됐습니다.",
      announced: null, effective: null,
      url: "https://www.insjournal.co.kr/news/articleView.html?idxno=33862"
    },
    {
      no: 149, date: "2026.11.06", kind: "GA 영업채널", org: "토스인슈어런스",
      thumb: null,
      topic: "industry", topicLabel: "보험사·GA 이슈", status: "운영 개시",
      title: "토스인슈어런스, 대구 오피스 개설로 6대 광역시 거점 확보",
      brief: "토스인슈어런스는 11월 5일 대구 오피스 개소식을 열고 운영을 시작했다고 밝혔다. 이번 개소로 전국 6대 광역시에 영업 거점을 갖췄다.",
      announced: null, effective: null,
      url: "https://www.etnews.com/20261106000038"
    },
    {
      no: 150, date: "2026.11.06", kind: "업계 분석", org: "보험저널",
      thumb: "../../assets/news/news-art-2.jpg",
      topic: "industry", topicLabel: "보험사·GA 이슈", status: "분석",
      title: "GA 특명검사 관련 위반 유형별 처분 기준 분석",
      brief: "보험저널은 특별이익 제공과 부당승환 등 모집질서 위반 유형에 따른 처분 기준을 정리했다. 보도는 GA 법인과 설계사의 책임이 각각 판단될 수 있다고 설명했다.",
      announced: null, effective: null,
      url: "https://www.insjournal.co.kr/news/articleView.html?idxno=33810"
    },
    {
      no: 151, date: "2026.11.06", kind: "입법 후속", org: "대한개원의협의회·대한의사협회",
      thumb: "../../assets/news/news-art-5.jpg",
      topic: "consumer", topicLabel: "소비자·보상", status: "단체 입장",
      title: "의료단체, 비급여 관리 법안 철회 촉구",
      brief: "대한의사협회와 대한개원의협의회가 각각 11월 5일과 6일 비급여 관리 법안 철회를 요구했다. 두 단체는 비급여 진료에 대한 규제가 환자의 치료 선택과 의료진의 진료에 미칠 영향을 우려했다.",
      announced: null, effective: null,
      url: "https://m.medigatenews.com/news/2823172614"
    },
    {
      no: 152, date: "2026.11.06", kind: "GA 내부통제", org: "어센틱금융그룹",
      thumb: "../../assets/news/news-art-1.jpg",
      topic: "industry", topicLabel: "보험사·GA 이슈", status: "회사 운영 사례",
      title: "어센틱금융그룹, 불완전판매 자체 제재 기준 강화",
      brief: "보험저널은 어센틱금융그룹이 불완전판매 자체 제재 기준을 3회에서 2회로 강화했다고 보도했다. 회사는 계약 유지율과 민원도 내부 평가에 반영한다.",
      announced: null, effective: null,
      url: "https://www.insjournal.co.kr/news/articleView.html?idxno=33798"
    },
    {
      no: 153, date: "2026.11.06", kind: "판매 실적 분석", org: "보험저널",
      thumb: "../../assets/news/news-art-3.jpg",
      topic: "industry", topicLabel: "보험사·GA 이슈", status: "분석",
      title: "700종신보험 판매중단 이후 GA 종신보험 판매 구성 변화",
      brief: "보험저널은 10월 GA 판매 실적에서 700종신보험을 제외한 단기납과 건강·인출형 등 종신보험 판매가 전월보다 늘었다고 분석했다.",
      announced: null, effective: null,
      url: "https://www.insjournal.co.kr/news/articleView.html?idxno=33803"
    },
    {
      no: 154, date: "2026.11.05", kind: "건강보험 급여 검토", org: "보건복지부",
      thumb: "../../assets/news/news-art-4.jpg",
      topic: "consumer", topicLabel: "소비자·보상", status: "검토",
      title: "위고비 건강보험 급여 적정성 검토 착수 보도",
      brief: "데일리팜은 보건복지부가 국회 제출자료에서 위고비의 급여 적정성을 검토하고 있다고 밝혔다고 보도했다. 적용 여부와 대상 범위는 심사 절차를 거쳐 결정된다.",
      announced: null, effective: null,
      url: "https://www.dailypharm.com/user/news/344224"
    },
    {
      no: 146, date: "2026.11.04", kind: "감독규정 개정 의결", org: "금융위원회",
      thumb: "../../assets/news/news-art-2.jpg",
      topic: "industry", topicLabel: "보험사·GA 이슈", status: "확정",
      title: "보험업감독규정 개정 의결…GA 판매위탁 위험관리 평가 신설",
      brief: "금융위원회는 11월 4일 보험업감독규정 개정안을 의결했습니다. 보험사의 GA 운영위험 관리 평가항목은 2027년 1월 1일부터 적용되며, 계리가정보고서는 2026회계연도 결산분부터 제출하게 됩니다.",
      announced: null, effective: "2027-01-01",
      url: "https://fsc.go.kr/no010101/88081?curPage=&srchBeginDt=&srchCtgry=&srchEndDt=&srchKey=&srchText="
    },
    {
      no: 147, date: "2026.11.04", kind: "법안 발의 보도", org: "국회 · 백혜련 의원",
      thumb: "../../assets/news/news-art-5.jpg",
      topic: "consumer", topicLabel: "소비자·보상", status: "발의",
      title: "비급여 가격관리·진료내역 제출 법안 발의…시행 확정 아님",
      brief: "데일리팜은 비급여 가격관리 기준과 진료내역 제출, 통합정보시스템 구축 등을 담은 법안이 발의됐다고 보도했습니다. 입법 제안 단계로, 이 보도가 현행 실손보험 지급조건의 변경을 뜻하지는 않습니다.",
      announced: null, effective: null,
      url: "https://www.dailypharm.com/user/news/344179"
    },
    {
      no: 141, date: "2026.11.02", kind: "신상품", org: "현대해상",
      thumb: "../../assets/news/news-art-1.jpg",
      topic: "product", topicLabel: "상품·보장", status: "시행",
      title: "현대해상, 연간 보장형 트래블패스365 해외여행보험 출시",
      brief: "현대해상이 다이렉트 채널에서 1년 동안 여러 차례 해외여행을 보장하는 트래블패스365 해외여행보험을 출시했습니다. 여행 횟수 제한은 없지만 1회 여행의 보장기간은 최대 31일입니다.",
      announced: null, effective: "2026-11-02",
      url: "https://biz.heraldcorp.com/article/10922360"
    },
    {
      no: 143, date: "2026.11.02", kind: "GA·위험관리", org: "보험저널",
      thumb: null,
      topic: "industry", topicLabel: "보험사·GA 이슈", status: "분석",
      title: "2027년 GA 운영위험 평가와 보험사 채널전략 변화 분석",
      brief: "보험저널이 2027년 GA 운영위험 평가와 K-ICS 요구자본 연계를 다뤘습니다. 계약유지·민원·수수료 환수 등 판매품질에 따른 채널전략 변화를 분석한 보도로, GA별 수수료 차등 지급 의무화와는 구분됩니다.",
      announced: null, effective: null,
      url: "https://www.insjournal.co.kr/news/articleView.html?idxno=33734"
    },
    {
      no: 142, date: "2026.11.01", kind: "소비자·보험금 청구", org: "금융감독원",
      thumb: "../../assets/news/news-art-3.jpg",
      topic: "consumer", topicLabel: "소비자·보상", status: "발표",
      title: "금감원, 시민안전보험은 자동가입과 별도로 직접 청구 안내",
      brief: "금융감독원은 시민안전보험이 자동가입돼도 보험금은 사고 당시 계약 보험사·공제회에 직접 청구해야 한다고 안내했습니다. 사고 당시 주소지와 광역·기초 지자체별 계약을 확인하며, 중복 보상은 각 담보의 지급조건에 따라 달라집니다.",
      announced: null, effective: "2026-11-01",
      url: "https://www.ytn.co.kr/_ln/0102_202611011647172551"
    },
    {
      no: 124, date: "2026.10.30", kind: "상품·보장", org: "현대해상",
      thumb: "../../assets/news/news-art-4.jpg",
      topic: "product", topicLabel: "상품·보장", status: "발표",
      title: "현대해상, 암·순환계·비급여수술 통합치료 담보 구성",
      brief: "현대해상의 퍼펙트플러스에서 암·순환계 주요치료와 비급여 질병수술 등을 묶는 담보 및 기가입상품 납입지원이 소개됐습니다. 2Q-PASS 할인과 일부 암 담보의 면책·감액 예외는 별도의 충족 조건이 있는 구조입니다.",
      announced: null, effective: null,
      url: "https://www.insjournal.co.kr/news/articleView.html?idxno=33708"
    },
    {
      no: 125, date: "2026.10.30", kind: "설계지원 서비스", org: "현대해상",
      thumb: "../../assets/news/news-art-2.jpg",
      topic: "product", topicLabel: "상품·보장", status: "발표",
      title: "현대해상, AI 고지심사 결합한 Hi-헬퍼 오픈 발표",
      brief: "현대해상이 보험설계 지원 시스템 Hi-헬퍼를 오픈했다고 밝혔습니다. 고객 고지정보에 따른 가입 가능 상품 선별과 추천 플랜 생성을 지원하는 기능을 결합했습니다.",
      announced: null, effective: "2026-10-30",
      url: "https://www.insjournal.co.kr/news/articleView.html?idxno=33722"
    },
    {
      no: 130, date: "2026.10.30", kind: "상품 개정", org: "NH농협생명",
      thumb: "../../assets/news/news-art-5.jpg",
      topic: "product", topicLabel: "상품·보장", status: "예정",
      title: "NH농협생명, 투스텝 종신 재판매·11월 16일 간병 가입한도 조정 예고",
      brief: "NH농협생명의 투스텝NH종신보험 재판매와 NH올원더풀간병안심요양보험의 가입한도 변경이 보도됐습니다. 간병인사용입원 한도는 11월 16일부터 연령·입원기간별로 조정 예정이며, 기존 계약의 지급한도를 일괄 줄인다는 뜻은 아닙니다.",
      announced: null, effective: "2026-11-16",
      url: "https://www.insjournal.co.kr/news/articleView.html?idxno=33729"
    },
    {
      no: 131, date: "2026.10.30", kind: "신상품", org: "라이나생명",
      thumb: "../../assets/news/news-art-1.jpg",
      topic: "product", topicLabel: "상품·보장", status: "발표",
      title: "라이나생명, 브레인케어에 3·2·5 간편심사형 신설 소개",
      brief: "라이나브레인케어간편건강보험이 3개월·2년·5년 고지체계로 소개됐습니다. 신경계질환·중증신경계질환과 치매·파킨슨 보장은 담보별 범위와 면책·감액 조건이 구분됩니다.",
      announced: null, effective: null,
      url: "https://www.insjournal.co.kr/news/articleView.html?idxno=33728"
    }
  ]
};
