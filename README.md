# Handoff: BoBi v2 리뉴얼 — 시안 E (A-Light Hybrid)

보험설계사(FC)용 영업 보조 서비스 **BoBi v2**의 리뉴얼 시안 중 **시안 E**로 확정된 디자인 핸드오프 패키지입니다.
데스크톱(1440px)과 모바일(390px) 두 폼팩터의 **홈 대시보드 + 진료기록 리포트** 화면을 포함합니다.

## Overview
- **시안 E = "A-Light Hybrid"**: 시안 A의 깔끔한 화이트 리테일 스타일링을 기반으로, 좌측 사이드바 GNB(데스크톱) + 데이터 밀도 높은 KPI 카드(시안 B 차용) + 라디얼 진료구성 차트(시그니처)를 결합한 방향입니다.
- 브랜드 액션 컬러는 기존 BoBi 톤인 **`#42BAFF`(시안 블루)** 패밀리를 사용합니다.
- 타이포는 **Pretendard** 단일 패밀리, 8px 그리드, 5단계 타입 스케일을 따릅니다.

## About the Design Files
이 번들의 HTML/CSS/JSX 파일은 **디자인 레퍼런스(프로토타입)** 입니다 — 의도한 룩앤필과 동작을 보여주기 위한 것이며, 그대로 프로덕션에 복붙할 코드가 아닙니다.
작업 목표는 이 디자인을 **대상 코드베이스의 기존 환경(React/Vue/Next 등)과 패턴·컴포넌트 라이브러리**로 재구현하는 것입니다. 아직 환경이 없다면 프로젝트에 가장 적합한 프레임워크를 선택해 구현하세요.
- React는 CDN UMD + 인라인 Babel로 데모용으로만 구성돼 있습니다. 실제 빌드에서는 번들러/디자인시스템에 맞게 컴포넌트화하세요.
- 모든 SVG 아이콘은 Lucide 스타일의 currentColor 라인 아이콘입니다(`concepts/icons.jsx`). 사내 아이콘 세트가 있으면 교체하세요.

## Fidelity
**High-fidelity (hifi).** 최종 컬러·타이포·간격·라운드·차트·인터랙션이 모두 확정된 수준입니다. UI는 코드베이스의 기존 라이브러리로 픽셀에 가깝게 재현하되, 토큰 값(아래)을 정확히 반영하세요.

---

## Screens / Views

### 1. 홈 대시보드 (Home)
사용자가 로그인 후 처음 보는 화면. 핵심 지표 확인 + 주요 기능 진입.

**데스크톱 레이아웃** (`concepts/concept-e.jsx` → `ConceptEHome`, 루트 클래스 `cA cE bobi`)
- 좌측 고정 사이드바 `aside.eside` **248px** (화이트 배경, 우측 1px 보더). 로고 → 프로필 카드(아바타+이름+소속, 마이페이지 버튼) → 내비게이션(`enav`, 6항목) → 하단 로그아웃.
- 우측 메인 `main.emain` (패딩 28/36/48). 상단 인사 영역(`etop`: h1 인사말 + 서브 + 스마트보비 CTA) → KPI 4열(`kpis`) → 본문 2열 그리드(`grid2`, `1.55fr / 1fr`).
- 좌측 컬럼: 피처 카드(그라데이션) + 액션 3열. 우측 컬럼: 공지 패널.

**모바일 레이아웃** (`mobile/mobile-e.jsx` → `MEHome`, 폰 폭 **390px**)
- 상단 앱바 `m-appbar`(화이트, 하단 1px 보더): 햄버거 / BoBi 로고(중앙) / 알림 벨(빨강 도트) + 아바타.
- 인사 영역 `m-greet` → KPI **2×2 그리드**(`m-kpis`) → 피처 카드(그라데이션, 마스코트) → 액션 3열(`m-acts`) → 공지 섹션헤더 + 공지 패널(`m-npanel`).
- **하단 탭바 없음**(시안 E·B 공통 결정). `.m-e .m-body`는 하단 패딩 22px.

**KPI 카드** (4종, 데스크톱 4열 / 모바일 2×2)
- 항목: ① 현재 내 고객 `3,045명` (+24 이번 주) ② 이번 달 리포트 `12건` (+3 전월) ③ 미청구 탐색 `7건` (대기 중) ④ 남은 무료 `1 / 10` (FREE 플랜).
- 구성: 라벨(좌측 컬러 도트 8px) → 큰 수치(28px/모바일 24px, 800) → 추세 텍스트(증가는 `--success` 녹색, 중립은 `--ink-3`) → 우하단 스파크라인(막대 5개, 카테고리 컬러).
- 스타일: 흰 배경, 1px `--line` 보더, `--r-md`(16px), 플랫(그림자 없음).

**피처 카드 ("진료기록 리포트 새로 만들기")**
- 배경 `linear-gradient(150deg, #42BAFF 0%, #1C50A1 135%)`, 텍스트 흰색, 라운드 `--r-lg`(22px).
- 좌상단 아이콘 칩(반투명 흰 18%) → 제목(22px, 800, 2줄) → 설명(13px, 85% 흰색) → 흰색 pill CTA "새 리포트 시작 →". 우하단 마스코트(흰색 실루엣, `brightness(0) invert(1)`).

**액션 타일 3종**: 최근 리포트 조회 / 미청구보험금 찾기 / 청구한 내역. 흰 배경, 1px 보더, 컬러 아이콘 칩(out=핑크, in=틸, surg=퍼플).

**공지 패널**: 제목 + "전체보기 ›". 각 행 = 태그 pill(필독/중요는 빨강 `imp`, 그 외 브랜드 페일) + 제목(13px, 600) + 날짜(11px, `--ink-4`).

### 2. 진료기록 리포트 (Report)
고객의 최대 5년 진료내역 분석 리포트.

**구성 순서** (`ConceptEReport` / `MEReport` 공통)
1. **환자 헤더**: 원형 사진 + 이름 + 메타(성별·생년월일·만나이·보험나이·연락처·지역) + 우측 조회일자. 데스크톱은 한 줄, 모바일은 메타 줄바꿈(각 span은 nowrap).
2. **조회기간**: 시작/종료 날짜 인풋 + 프리셋 pill(3개월/1년/3년/5년, 활성=잉크 배경 흰 글씨) + "조회하기" 브랜드 버튼. 모바일은 세로 스택.
3. **주요정보**: 4개 그라데이션 카드(통원/입원/수술/투약). 값 0원이면 `zero`(회색 톤). 데스크톱 4열 / 모바일 2×2.
   - 그라데이션: out `#FF96A0→#FF6675`, in `#43D6BE→#1FA48F`, surg `#AC85F7→#7E4FE6`, med `#6FD0FF→#2B9FF0`.
4. **키워드 배너**: "재검사 소견 키워드 3가지 발견" + 칩(#CT #X-RAY #영상). 배경 `--brand-pale`.
5. **의료비 정보**: 총 의료비/연 평균 수치 + **막대그래프**(연도별, 최고값 막대는 브랜드 컬러, 연 평균 점선 = `--c-surg` 퍼플). 진입 시 높이 애니메이션(0→값, 0.7s).
6. **진료 구성 비중 — 라디얼 (시안 E 시그니처)**: 통원 48% / 투약 48% / 기타 4%. 각 라디얼 = SVG 원형 진행바(트랙 `#EAEFF4`, 진행 `#42BAFF`, strokeLinecap round, -90° 시작) + 중앙 % + 우측 라벨/서브. 진입 애니메이션 `stroke-dasharray 0.9s`.
7. **10대 주요질환**: 순위 배지 + 질환명 + 의료비 + 통계(외래/입원/투약/수술 등) + 진행 트랙(채움 = `--brand-grad`) + 최초진단일.
8. **전체 진료기록**: 데스크톱은 표(7열: 진료시작일·병의원·질병·진단코드·입원외래·내원일수·의료비). **모바일은 레코드 카드 리스트**로 변환(날짜+타입칩+의료비 / 병원명 / 질병·코드). 하단 페이저.

---

## Interactions & Behavior
- **프리셋 pill**: 클릭 시 `useState`로 활성 토글. 활성 = 잉크(검정) 배경 / 흰 글씨(시안 E·A 규칙). 실제 구현에선 클릭 시 조회기간 날짜를 함께 갱신해야 함.
- **차트 진입 애니메이션**: 마운트 후 60~120ms 타임아웃으로 `on=true` → 막대 높이 / 라디얼 dasharray / 질환 트랙 width가 0→목표로 전이. `prefers-reduced-motion` 대응을 권장(현재 데모는 미적용).
- **호버**(데스크톱): 액션 타일 보더가 브랜드 컬러로, 공지 행 텍스트가 `--brand-deep`로, 테이블 행 배경 `--brand-pale`. 트랜지션 150~300ms ease.
- **버튼**: pill 형태. 1차 액션은 브랜드 솔리드 + 그림자 `--sh-brand`. 누름 상태는 약간 어둡게.
- **반응형**: 데스크톱(사이드바 고정 1440 캔버스)과 모바일(390 단일 컬럼)은 별도 레이아웃. 태블릿 구간은 미정의 — 구현 시 사이드바 collapse + 1열 그리드 규칙 추가 필요.

## State Management
화면 단위 로컬 상태만 필요(전역 스토어 불필요):
- `preset` — 조회기간 프리셋 선택값 (기본 `"5년"`).
- 차트 마운트 플래그 `on` / `dia` — 진입 애니메이션 트리거용 boolean.
- 실제 서비스에서 추가 필요: 인증된 사용자/고객 컨텍스트, 리포트 데이터 fetch(고객 ID + 조회기간 → 진료내역/의료비/질환 집계), 페이지네이션(현재 `pages: 5`), 로딩/에러/빈 상태.
- 모든 표시 데이터의 단일 소스는 `concepts/data.js`(`window.BOBI`) — API 응답 스키마 설계 시 참고하세요.

## Design Tokens
전체 정의는 `styles/tokens.css`. 핵심 값:

**브랜드 (#42BAFF 패밀리)**
- `--brand #42BAFF` · `--brand-bright #66E1FF` · `--brand-soft #C2F3FF` · `--brand-pale #EEF9FF` · `--brand-hover #2BA4EE` · `--brand-deep #1C50A1` · `--brand-ink #092535`
- `--brand-grad linear-gradient(135deg,#66E1FF 0%,#42BAFF 45%,#1C50A1 100%)`

**중립**
- `--white #FFFFFF` · `--bg-soft #F4F7FA` · `--bg-warm #F8FAFC` · `--line #E6EBF0` · `--line-strong #D4DBE2`
- 텍스트: `--ink #0E1A24` · `--ink-2 #44545F` · `--ink-3 #7C8B97` · `--ink-4 #AEB9C2`

**진료 카테고리 시맨틱**
- 통원 `--c-out #FF7A85` / bg `#FFF0F1` · 입원 `--c-in #2ABBA7` / bg `#E7FAF6` · 수술 `--c-surg #9360F7` / bg `#F3EDFF` · 투약 `--c-med #42BAFF` / bg `#EAF7FF`
- `--success #1FA463` · `--warning #F6A609`

**타입 스케일 (5단계, Pretendard)**
- `--fs-display 30px` · `--fs-title 22px` · `--fs-sub 17px` · `--fs-body 15px` · `--fs-label 13px`
- 가중치: 제목 800, 서브 700, 본문 400, 라벨 500. `letter-spacing` 헤드라인 -0.02em. `font-feature-settings: "ss01","ss02"`.

**라운드** `--r-sm 10` · `--r-md 16` · `--r-lg 22` · `--r-pill 100`
**그림자** `--sh-1`(은은) · `--sh-2`(카드) · `--sh-brand`(브랜드 글로우) · `--sh-glow`
**간격(8px 그리드)** `--s1 4` … `--s10 64`

## Assets
`assets/` 폴더:
- `bobi-logo.png` — BoBi 로고(헤더/사이드바). 모바일 앱바·데스크톱 사이드바에서 사용.
- `bobi-wordmark.png` — 워드마크(보조).
- `bobi-mascot.svg` — 보비 마스코트(피처 카드/히어로). 다크 배경 위에서는 `filter: brightness(0) invert(1)`로 흰색 실루엣 처리.
- `fig-image.png` — 리포트 환자 프로필 placeholder 사진. 실제 서비스에선 고객 사진 또는 이니셜 아바타로 대체.
- 폰트: `styles/fonts/PretendardVariable.woff2` (가변 폰트 100~900). `tokens.css`의 `@font-face`가 `fonts/PretendardVariable.woff2`(스타일시트 기준 상대경로)로 참조합니다.
- 아이콘: 별도 파일 없이 `concepts/icons.jsx`에 path로 인라인 정의(Lucide 스타일).

## Files
```
design_handoff_bobi_v2_concept_e/
├── README.md                  ← 이 문서
├── desktop.html               ← 시안 E 데스크톱 미리보기 (홈 + 리포트, 1440px)
├── mobile.html                ← 시안 E 모바일 미리보기 (홈 + 리포트, 390px)
├── styles/
│   ├── tokens.css             ← 디자인 토큰 + @font-face + 타입 유틸 (.bobi/.t-*)
│   ├── concept-a.css          ← 시안 A 스타일 (시안 E 데스크톱이 .cA 클래스로 상속)
│   ├── concept-e.css          ← 시안 E 델타 (좌측 GNB·홈 그리드·라디얼 등)
│   ├── mobile.css             ← 모바일 전체 스타일 (.phone/.m-e/* 사용)
│   └── fonts/PretendardVariable.woff2
├── concepts/
│   ├── data.js                ← 모든 화면의 단일 데이터 소스 (window.BOBI)
│   ├── icons.jsx              ← 라인 아이콘 컴포넌트 (window.Icon)
│   └── concept-e.jsx          ← 데스크톱: ConceptEHome / ConceptEReport
├── mobile/
│   ├── mobile-shared.jsx      ← 폰 셸·상태바·탭바 (MPhone/MStatusBar/MTabBar)
│   └── mobile-e.jsx           ← 모바일: MEHome / MEReport
└── assets/                    ← bobi-logo.png · bobi-wordmark.png · bobi-mascot.svg · fig-image.png
```

> **참고 — 데스크톱 시안 E의 CSS 상속 구조**: `ConceptEHome/Report`의 루트 클래스는 `cA cE bobi`입니다. 즉 카드·차트·표·색상 등 공통 스타일은 **`concept-a.css`(.cA)** 에서 오고, 좌측 사이드바·홈 2열 그리드·라디얼 등 **델타만 `concept-e.css`(.cE)** 에 정의됩니다. 두 CSS를 함께 로드해야 데스크톱이 정상 렌더링됩니다(모바일은 `mobile.css` 단독).

> **실행 방법**: 정적 파일이라 빌드가 필요 없습니다. 폴더 루트에서 간단한 정적 서버를 띄우고(`npx serve` 또는 VS Code Live Server) `desktop.html` / `mobile.html`을 여세요. (인라인 Babel + 폰트 fetch 때문에 `file://` 직접 열기보다 로컬 서버 권장.)
