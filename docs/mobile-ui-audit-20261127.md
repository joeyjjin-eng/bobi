# 보비 모바일 UI 적합성 점검

점검일 2026-11-27 · 기준 `docs/mobile-design-standard.md` · 캡처 `docs/audit-shots/`
**개정 2026-11-27** — 기준 1-4 개정 2건 반영.
① 고정 요소에 하단 액션 바 1개 허용 → R5 재집계, S4 신설.
② 주요 CTA 를 하단 플로팅(FAB)으로 확정 → **6개 화면에 적용 완료**, R4 재집계.
③ 검색·기간·필터를 한 줄로, 기간/필터는 아이콘 버튼 → **5개 화면에 적용 완료**, R3·R4 재집계.
   (②③ 두 항목만 코드를 고쳤다. 나머지 위반은 그대로 두고 측정만 했다)
정적 점검 원본 `docs/mobile-ui-audit-20261127-static.txt` · 적용 규칙 [`mobile-ui-rules.md`](mobile-ui-rules.md)

## 점검 대상과 한계 — 먼저 읽을 것

요청서는 **weplatbobi.kr 라이브 사이트**(PHP 템플릿 `div.m-app > header.m-appbar + main.m-body`,
`/css/bobi/mobile.css`, 로그인 필요)를 대상으로 쓰였다.
이 작업공간은 **디자인 저장소 `bobi design v2`** 이고, 라이브 사이트 코드가 들어 있지 않다.

확인한 내용
- `.php` 파일 0개, `/css/bobi/` 경로 없음, `div.m-app` 마크업 없음, weplatbobi 참조 0건.
- 다만 요청서가 인용한 PC 토큰값(`--fs-h1 24 / --fs-h2 19 / --fs-body 15 / --fs-option 13`,
  `--s1~--s10 = 4·8·12·16·20·24·32·40·48·64`)은 이 저장소 `styles/tokens.css` 와 **정확히 일치**한다.
  클래스 이름도 상당 부분 공유한다(`.pill` `.tr-name` `.sb-help-btn` `.search-bar` `.table-row` …).
  즉 이 저장소가 라이브 사이트의 디자인 원본이다.

따라서 이번 점검은 **이 저장소의 모바일 화면 21개를 실측**한 결과다.
라이브 사이트 수치(요청서 1-4의 688px·880px 등)와는 다르며, 그대로 대입할 수 없다.

라이브 사이트를 같은 방법으로 점검하려면 아래가 필요하다.
1. 라이브 저장소 경로 또는 스테이징 URL
2. 테스트 계정 (`BOBI_ID` / `BOBI_PW` 환경변수)
3. 해당 호스트로의 네트워크 접근 허용

**이번 작업에서 기존 CSS·마크업·사이트 데이터는 수정하지 않았다.** 새로 만든 파일만 추가했다.

### 점검 환경

- 헤드리스 Chrome + 375×740 iframe (미디어쿼리가 iframe 폭에 반응). 확인 화면 360×640.
- 정적 HTML 이라 로그인·User-Agent 분기가 없다. 데이터는 저장소의 데모 값이고 실제 고객 정보가 아니다.
- 생성·수정·삭제·발송 버튼은 누르지 않았다. 필터 시트 열기까지만 조작했다.

### 라이브 경로 ↔ 이 저장소 대응

| 라이브 | 이 저장소 | 라이브 | 이 저장소 |
|---|---|---|---|
| `/main/` | `home.html` | `/claim/` | `pages/claim/list.html` |
| `/customer/` | `pages/customer/list.html` | `/claim/detail.php` | `pages/claim/detail.html` |
| `/customer/write.php` | `pages/customer/new.html` | `/jjaept/` | `pages/jjaepity/mobile.html` |
| `/customer/write.php?cus_code` | `pages/customer/detail.html` | `/consult/` | `pages/consult/index.html` |
| `/planner/` | `pages/admin/planner/list.html` | `/notice/` | `pages/news/index.html` |
| `/planner/write.php` | `pages/admin/planner/detail.html` | `/mypage/` | `pages/mypage/index.html` |
| `/charts/` | `pages/report/history.html` | `/mypage/plan.php` | `pages/plan/index.html` |
| `/unclaim/` | `pages/unclaimed/history.html` | — | `pages/coverage/history.html` (보장분석) |
| `/unclaim/detail.php` | `pages/unclaimed/result.html` | — | `pages/library/index.html` (자료실) |

대응 화면이 없는 항목: `/main/search.php`, `/counsel/`, `/counsel/faq.php`,
`/sendlog/` `/apilog/` `/paylog/` `/deletelog/` `/excellog/` `/usagelog/`, `/notice/write.php`.
→ **점검 불가**(해당 화면이 저장소에 없음).

---

## 1. 요약

### 영역별 부합률 (해당 없음 제외 · 21개 화면 × 19개 포인트)

| 영역 | 부합 | 비율 | 개정 전 |
|---|---|---|---|
| 데이터 표시 (D1–D4) | 66 / 71 | **93%** | 93% |
| 절제 UI (R1–R6) | 71 / 84 | **85%** | 76% |
| 간격·여백 (S2–S4) | 26 / 35 | **74%** | 75% |
| 글자 크기 (F1–F4) | 48 / 84 | **57%** | 57% |
| 버튼·터치 (B1·B3) | 10 / 42 | **24%** | 24% |

절제 UI 는 R5 4 → 2, R4 10 → 4(FAB + 필터 아이콘화), R3 2 → 1 로 85%.
간격은 S4 가 신설되며 해당 화면이 2 → 7 로 늘었고(FAB 5개는 safe-area 반영됨) 그중 2건이 위반이다.

### 가장 시급한 위반 5개

| # | 포인트 | 내용 | 범위 | 심각도 |
|---|---|---|---|---|
| 1 | **B1** | 탭 가능 요소 123종이 44×44 미만. 특히 높이 **8–17px** 짜리 컨트롤 — `button.tr-go` 24×8, `a.more` 53×15, `button.info-trigger` 90×15, `select#sort-select` 82×17, 기간 입력 `input#rp-start` 98×17 | 21 / 21 화면 | **상** — 오조작 |
| 2 | **F3** | 입력·선택상자 글자가 13–15px. iOS Safari 가 포커스 시 화면을 확대하고 되돌리지 않는다 | 14 / 21 화면 | **상** |
| 3 | **F1** | 기준 밖 글자 크기 **19px 이 104회**. `--fs-h2` 를 모바일에 그대로 쓴 결과 | 20 / 21 화면 | **중** — 토큰 1개 |
| 4 | **D3 · R1** | `/customer/` 목록 행 **161px**(4줄, 날짜 중복), 첫 데이터 **461px**, 첫 화면 **1행**. `/planner/` 143px | 목록 5화면 | **중** |
| 5 | **D3** | 목록 행이 4줄·96px 초과 — `/customer/` 161px(날짜 중복), `/planner/` 143px, 보장분석 114px | 목록 4화면 | **중** |

### 지난 점검 대비 해소된 것

요청서 2-4 의 라이브 위반 중 이 저장소에서 이미 해결된 항목 — 아래 5절에서 항목별로 대조한다.
필터 칩 3줄 펼침(R3), 이름·금액 줄바꿈(D2), 가로 넘침(L1)은 재현되지 않는다.

---

## 2. 절제 UI 측정표

375×740 / 360×640. 단위 px.

괄호 안은 ②③ 적용 전 값.

| 페이지 | 첫 데이터 시작 | 첫 화면 행 수 | 검색+필터 높이 | 첫 데이터 위를 차지하는 것 |
|---|---|---|---|---|
| `/customer/` | **425** (461) | **1** / **1** | **58** (94) | 제목, KPI 3개 **세로 적층**, 검색 한 줄 |
| `/claim/` | **404** (442) | 3 / **1** | **98** (134) | 제목, KPI 4개(2×2), 검색 2줄 |
| `/unclaim/` | **261** (315) | 6 / 5 | **58** (94) | 제목+안내문+잔여, 검색 한 줄 |
| `/charts/` | **243** (297) | 5 / 4 | **58** (94) | 제목+잔여, 검색 한 줄 |
| `/consult/` | 277 (295) | 5 / 3 | **120** | 제목, 검색 46, 정렬 줄 58 |
| 보장분석 내역 | 221 | 4 / 3 | 46 | 제목, 검색 46 |
| `/planner/` | **233** (269) | 3 / 2 | **58** (94) | 제목+내보내기, 검색 한 줄 |
| 자료실 | 176 | 2 / **1** | – | 제목 (행 자체가 275px 로 큼 → D3) |
| `/notice/` | 430 / 448 | **0** / **0** | – | 제목, 탭 3개, 섹션 제목+설명, 누적자료, 헤드라인 캡션 |
| `/mypage/plan.php` | 146 | 1 / 1 | – | 제목 (플랜 카드 414–430px → 1화면 1장) |

기준: 첫 데이터 **320px 이내**, 첫 화면 **3행 이상**, 검색+필터 **100px 이하**.

- 320px 초과: `/customer/` `/claim/` `/notice/` — 셋 다 원인은 검색·필터가 아니라 그 위의 KPI·탭이다
- 3행 미만: `/customer/` `/claim/`(360px) `자료실` `/notice/` `/mypage/plan.php`
- 100px 초과: `/consult/`(120) — 유일하게 남음. 정렬 줄을 검색 줄에 합치면 해소된다

---

## 3. 페이지 × 점검 포인트 매트릭스

O 부합 · **X** 위반 · – 해당 없음

| 페이지 | F1 | F2 | F3 | F4 | S2 | S3 | S4 | B1 | B3 | R1 | R2 | R3 | R4 | R5 | R6 | D1 | D2 | D3 | D4 | L1 |
| /main/ 홈 | **X** | O | O | O | O | – | – | **X** | O | – | – | – | O | O | O | O | O | – | O | O |
| /customer/ 내고객 | **X** | O | **X** | O | O | **X** | O | **X** | **X** | **X** | **X** | O | **X** | O | O | O | O | **X** | O | O |
| /customer/write 등록 | **X** | O | **X** | O | O | – | – | **X** | O | – | – | – | O | O | **X** | O | O | – | O | O |
| /customer/write?code 상세 | **X** | O | O | O | O | – | – | **X** | O | – | – | – | **X** | O | **X** | O | O | – | O | O |
| /planner/ 설계사관리 | **X** | O | **X** | O | O | **X** | – | **X** | **X** | O | O | O | O | O | O | O | O | **X** | O | O |
| /planner/write 상세 | **X** | O | **X** | O | O | – | – | **X** | O | – | – | – | **X** | O | **X** | O | O | – | O | O |
| /charts/ 리포트내역 | **X** | O | **X** | O | O | **X** | O | **X** | **X** | O | O | O | O | O | O | O | O | **X** | O | O |
| /charts/ 리포트본문 | **X** | O | **X** | O | O | – | – | **X** | O | – | – | – | O | O | O | O | O | **X** | O | O |
| /unclaim/ 미청구 | **X** | O | **X** | O | O | **X** | O | **X** | **X** | O | O | O | O | O | O | O | O | O | O | O |
| /unclaim/detail | **X** | O | O | **X** | O | – | – | **X** | **X** | – | – | – | O | O | O | O | O | – | O | O |
| /claim/ 보험금청구 | **X** | **X** | **X** | O | O | **X** | O | **X** | **X** | **X** | O | O | O | **X** | O | O | O | O | O | O |
| /claim/detail | **X** | O | O | O | O | – | – | **X** | **X** | – | – | – | O | O | O | O | O | – | O | O |
| /claim/write | **X** | O | **X** | O | O | – | **X** | **X** | **X** | – | – | – | O | O | O | O | O | – | O | O |
| /jjaept/ 째피티 | O | O | **X** | O | O | – | – | **X** | O | – | – | – | **X** | O | O | O | O | – | O | O |
| /consult/ 재무상담 | **X** | O | **X** | O | O | **X** | – | **X** | **X** | O | O | **X** | O | O | O | O | O | O | O | O |
| /notice/ 보험인사이트 | **X** | O | **X** | O | O | – | – | **X** | **X** | – | – | – | O | O | O | O | O | – | O | O |
| 자료실 | **X** | O | O | O | O | – | – | **X** | O | – | – | – | O | O | O | O | O | – | O | O |
| 보장분석 내역 | **X** | O | **X** | O | O | **X** | O | **X** | **X** | O | O | O | O | O | O | O | O | **X** | O | O |
| /mypage/ | **X** | O | **X** | O | O | – | **X** | **X** | O | – | – | – | O | **X** | O | O | O | – | O | O |
| /mypage/plan.php | **X** | O | O | O | O | – | – | **X** | O | – | – | – | O | O | O | O | O | – | O | O |
| 결제하기 | **X** | O | O | O | O | – | – | **X** | O | – | – | – | O | O | O | O | O | – | O | O |

포인트별 위반 화면 수 — F1 20, F2 1, F3 14, F4 1, S2 0, S3 7/7, **S4 2/2**, B1 21, B3 11, R1 2/7, R2 1/7, **R3 1/7**, **R4 4**, **R5 2**, R6 3, D1 0, D2 0, D3 5/8, D4 0, L1 0.

---

## 4. 위반 상세

### B1 — 터치 범위 44×44 미만 · 심각도 상

123종. 높이가 작은 순으로.

| 선택자 | 현재 | 기준 | 페이지 | 캡처 |
|---|---|---|---|---|
| `button.tr-go` | 24×8 | 44×44 | `/consult/` | `consult.png` |
| `button.view` | 22×15 | 44×44 | 결제하기 | `plan-checkout.png` |
| `button#edit-info-btn.h-action` | 39×15 | 44×44 | `/customer/write?code` | `customer-detail.png` |
| `a#rec-viewall-top.more`, `a.lib-more` | 53×15 | 44×44 | 리포트 본문, 자료실 | `charts-report.png` |
| `button#act-detail-btn.h-action` | 75×15 | 44×44 | `/customer/write?code` | `customer-detail.png` |
| `button.info-trigger` | 90×15 | 44×44 | 리포트 본문 | `charts-report.png` |
| `select#sort-select` | 82×**17** | 44 높이 | `/customer/` `/planner/` `/claim/` | `customer.png` |
| `input#rp-start`, `input#rp-ref` | 98×**17** | 44 높이 | 리포트 본문 | `charts-report.png` |
| `input[type=checkbox]` (약관 6개) | 18×18 | 44×44 | 결제하기 | `plan-checkout.png` |
| `button.ft-link` / `.bold` | 52×18 / 104×18 | 44 높이 | 전 화면 푸터 | — |
| `a.dname.dname-link` | 233×19 | 44 높이 | 리포트 본문 | `charts-report.png` |
| `a.m-logo` | 51×20 | 44×44 | 전 화면 상단 바 | — |
| `input#insurer-query` | 281×**20** | 44 높이 | `/claim/write` | `claim-write.png` |
| `input#ns-q` | 264×23 | 44 높이 | `/notice/` | `notice.png` |
| `a.view-link` | 60×27 | 44×44 | `/customer/write?code` | `customer-detail.png` |
| `a.ps-cta` | 95×27 | 44×44 | `/main/` | `main.png` |
| `a.kwchip` | 56–78×31 | 44 터치 | 리포트 본문 | `charts-report.png` |
| `input#search-input` | 191–287×**32** | 44 높이 | 목록 6화면 | `customer.png` |
| `button.pg-btn`, `button.uc-pg` | 32×32 (`.dots` 27×32) | 44×44 | 목록 6화면 | `customer.png` |
| `button#btn-insurers`, `button#btn-docs` | 32×32 | 44×44 | `/claim/` | `claim.png` |
| `button#period-trigger` | 86×32 | 44 터치 | `/charts/` `/unclaim/` | `charts.png` |
| `.pill` (필터 시트 안) | **"남"·"여" 41×32** | 폭·터치 44 | 목록 5화면 | `customer.png` |
| `button.sort-pill` | 48–146×32 | 44 터치 | `/consult/` | `consult.png` |
| `button.jm-chip` | 75–141×35 | 44 터치 | `/jjaept/` | `jjaept.png` |
| `button.m-ham`, `button.m-bell` | 42×42 | 44×44 | 전 화면 상단 바 | — |
| `button.rec-tab` | 92–184×34–43 | 44 높이 | 리포트 본문, `/unclaim/detail` | — |

예외로 둔 것: 본문 문장 안 인라인 링크 2건(`display:inline`) — 기준 1-3 의 예외.

### B3 — 인접 탭 요소 간격 8px 미만 · 심각도 중

| 쌍 | 현재 | 기준 | 페이지 |
|---|---|---|---|
| `button.pg-btn` ↔ `button.pg-btn` | 4px | 8px | 목록 6화면 |
| `button.report-viewseg-btn` ↔ 다음 버튼 | 2px | 8px | 리포트 본문 |

위반으로 세지 않은 것 — 목록 행끼리(`a.table-row`, `button.ns-row`, `a.lib-row`) 0px 과
분절 컨트롤(`button.seg-btn`, `button.rec-tab`, `button.cd-tab`) 0px.
기준 1-2 가 "목록 행 사이는 구분선(간격 0)" 을 허용하고, 분절 컨트롤은 하나의 컨트롤이다.

### F3 — 입력 글자 16px 미만 · 심각도 상

| 선택자 | 현재 | 페이지 수 |
|---|---|---|
| `input#search-input` | 15px | 6 |
| `select#sort-select` | 13px | 3 |
| `input#rp-start`, `input#rp-ref` | 13px | 1 |
| `select#account-status`, `select#role-select` | 13px | 1 |
| `input#f-name`, `#f-phone`, `#f-birth` (등록 폼) | 15px | 1 |
| `input#insurer-query`, `#jmInput`, `#q`, `#ns-q`, `select#ns-kind` | 15px | 각 1 |
| `/mypage/` 입력·선택 9개 | 13–15px | 1 |

기준 16px. 이 한 값만 올리면 해소된다.

### F1 — 기준 밖 글자 크기 · 심각도 중

| 크기 | 횟수 | 성격 | 대체 |
|---|---|---|---|
| **19px** | **104** | `--fs-h2` 를 모바일에 그대로 사용 | 페이지 제목 → 20, 섹션 제목 → 17 |
| 24px | 6 | 상세 제목·플랜 이름·섹션 인트로 | 20 |
| 22px | 5 | 아바타 이니셜, KPI | 20 |
| 32px | 2 | `/mypage/plan.php` 가격 | 20 |
| 28px | 1 | 설계사 상세 아바타 | 20 |
| 26px | 1 | `/unclaim/detail` 금액 | 20 |

19px 을 뺀 실제 개별 수정 지점은 15곳이다.

### F2 — 12px 미만 · 심각도 중

`button#btn-insurers.sb-help-btn`, `button#btn-docs.sb-help-btn` — `font-size: 0`
(`/claim/`, `pages/claim/list.html:169`). 아이콘만 남기려고 글자를 0 으로 죽인 방식이다.
기준 1-1 위반이자 B1 위반(32×32). 아이콘 버튼 44×44 + `aria-label` 로 바꾼다.

### F4 — 제목 2줄 · 심각도 하

`/unclaim/detail` `h1` "홍길동님의 미청구보험금 조회 결과" — 19px 에서 2줄.
20px 로 올리면 더 넘친다. 제목을 "미청구보험금 조회 결과" 로 줄이고 이름은 아래 13px 줄로 내린다.

### S3 — 목록 행 안쪽 상하 여백 · 심각도 하

7개 목록 화면 전부 **14px**. 기준 12 또는 16(4px 배수).
`styles/mobile-rules.css` 의 `--m-row-y: 14px` 한 곳에서 나온다.

### R1 · R2 — 첫 데이터 위치와 행 수 · 심각도 중

| 페이지 | 현재 | 기준 | 원인 |
|---|---|---|---|
| `/customer/` | 461px · 1행 | 320px · 3행 | KPI 3개 세로 적층(170px) |
| `/claim/` | 442px(375) / 486px(360) · 1행(360) | 320px · 3행 | KPI 4개 2×2(150px) + 검색바 2줄(86px) |
| `/notice/` | 430px · 0행 | 320px · 3행 | 탭 + 섹션 인트로 + 누적자료 + 헤드라인 캡션 |
| `/consult/` | 333px(360) | 320px | 정렬 줄 58px |

### R3 — 검색+필터 영역 · 심각도 중

- `/claim/` **134px** — 검색바가 2줄(86px). 정렬 select 와 안내 아이콘 버튼 2개가 한 줄에 못 들어간다.
- `/consult/` **120px** — 검색 46 + 정렬 줄 58(건수 줄 + 칩 줄).

### R4 — KPI · CTA · 보조 링크 · 심각도 중

**(가) 주요 CTA → 하단 플로팅 — 적용 완료 ✅**

6개 화면의 CTA 를 `.m-fab` 으로 전환했다. 데스크탑 마크업·동작(`data-quota` 등)은 그대로 두고
`@media (max-width: 960px)` 에서 위치만 옮겼다.

| 페이지 | 선택자 | 데스크탑 라벨 | 모바일 라벨 | FAB 크기 |
|---|---|---|---|---|
| `/customer/` | `a.add-btn.m-fab` | 고객 추가 | 고객 추가 | 123×48 |
| `/claim/` | `a.add-btn.m-fab` | 새롭게 청구하기 | 청구하기 | 119×48 |
| `/charts/` | `a.new-rep-btn.m-fab` | 새 리포트 시작하기 | 새 리포트 | 123×48 |
| `/unclaim/` | `a.new-uc-btn.m-fab` | 새롭게 조회하기 | 조회하기 | 119×48 |
| 보장분석 내역 | `a.new-cov-btn.m-fab` | 새롭게 작성하기 | 작성하기 | 119×48 |
| `/consult/` | `a.ct-btn.primary.m-fab` | 새로운 상담하기 | 상담하기 | 119×48 |

전부 `right:16 / bottom:16+safe-area`, 높이 48, 글자 16, `z-index:20`.
모바일 라벨은 수식어를 `<span class="m-fab-ext">` 로 감싸 접었다 — "+" 아이콘이 이미 '새로'를 말하고,
접지 않으면 FAB 이 182px 까지 커져 목록을 절반 가린다. 데스크탑에서는 전체 라벨이 그대로 나온다.
푸터에는 `body:has(.m-fab) .ft { padding-bottom: 80px + safe-area }` 로 FAB 자리를 비웠다.

`/planner/` 의 `button.export-btn`(내보내기)은 만들지 않는 보조 동작이라 FAB 대상이 아니다. 헤더에 그대로 뒀다.

적용 전후 실측 (375×740):

| 페이지 | 첫 데이터 | 첫 화면 행 |
|---|---|---|
| `/charts/` | 297 → **279** | 4 → 4 |
| `/unclaim/` | 315 → **297** | 5 → **6** |
| `/consult/` | 295 → **277** | 5 → 5 |
| `/claim/` | 442 → 440 | 3 → 3 |
| 보장분석 내역 | 221 → 221 | 4 → 4 |
| `/customer/` | 461 → 461 | 1 → 1 |

`/customer/` `보장분석` 은 제목 블록이 버튼보다 높아 세로 이득이 0 이다.
여기서 FAB 의 값어치는 공간이 아니라 **엄지가 닿는 위치**이고, `/customer/` 461px 의 진짜 원인은 KPI 적층이다.

딸려 나온 조정 — `/unclaim/` 은 CTA 가 빠지자 잔여 뱃지가 제목 옆으로 올라와 제목이 2줄로 밀렸다(F4 위반).
`.hist-title-inner:has(.quota-pill) .ht-l { flex: 1 1 100%; }` 로 제목에 한 줄을 통째로 줘서 되돌렸다.
그 대가로 `/charts/` 는 뱃지가 아랫줄로 내려가 첫 데이터가 269 → 279 가 됐다(기준 320 안, 4행 유지).

**(나) 그 밖의 전체 폭 단독 줄 · KPI 적층**

| 페이지 | 내용 | 현재 |
|---|---|---|
| `/customer/` | KPI 3개 세로 적층 | `div.kpi-row` 1열 × 3개, 170px |
| `/customer/write?code` | `a.trig.alert` "알릴의무 정리" 전체 폭 단독 줄 | 343px |
| `/planner/write` | `a.back-link` 전체 폭 단독 줄 | 343px (R6 과 중복) |
| `/jjaept/` | `button#jmNoticeToggle` 전체 폭 단독 줄 | 375×39 |

**(다) 필터 트리거 전체 폭 — 해소 ✅**

5개 화면(`/customer/` `/planner/` `/charts/` `/unclaim/` `/claim/`)에서 `button#filter-trigger` 가
**343×32 전체 폭 바**였다. `.cE .emain > * { width: 100% }` 가 `inline-flex` 버튼에도 걸린 탓이다.

필터 트리거를 `.search-bar` **안으로** 옮기고 기간 선택과 함께 **44×44 아이콘 버튼**으로 바꿨다.

| | 전 | 후 |
|---|---|---|
| 필터 | `☰ 필터 ▾` 343×32, 한 줄 차지 | 아이콘 44×44, 검색 줄 안 |
| 기간 선택 | `📅 기간 선택 ▾` 86×32 (B1 위반) | 아이콘 44×44 |
| 검색+필터 영역 | 94px (2줄) | **58px (1줄)** |

- 라벨(`<span>`)과 꺾쇠는 모바일에서만 숨긴다. 데스크탑은 글자 그대로다.
- 값이 선택되면 브랜드 색으로 채운다 — `.period-trigger.has-value`, `.filter-trigger.on`.
- 필터 아이콘은 상단 바 햄버거와 겹치지 않게 `#i-filter`(조절손잡이)를 새로 넣었다.
- `aria-label="기간 선택"` / `aria-label="필터"` 를 붙였다.
- 덤으로 B1 2종(`#period-trigger` 86×32, `#filter-trigger` 343×32)이 44×44 가 되어 해소됐다.

### R5 — 고정 요소 구성 · 심각도 중

개정된 기준: **상단 바 1개 + 하단 액션 바 1개(72px 이하)**까지. 바텀시트·모달은 셈에서 뺀다.

| 페이지 | 고정 요소 | 판정 |
|---|---|---|
| `/claim/` | 상단 `header.m-topbar` 54px + 상단 `div.search-bar` **sticky 86px** | **위반** — 상단 고정 2개. 2줄짜리 검색바가 고정돼 있다 |
| `/mypage/` | 상단 54px + 하단 `div.mp-savebar-slot` **sticky 100px** | **위반** — 하단 바가 72px 초과. 375px 에서 문구와 버튼이 2줄로 접혀 100px 이 된다 |
| `/claim/write` | 상단 54px + 하단 `div#wizard-cta` sticky **69px** | 부합 — 하단 1개, 72px 이하 (단 safe-area 미반영 → S4 위반) |
| `/charts/` | 상단 54px + `div#preview.preview-panel` fixed 222px | 부합 — 행을 눌러야 올라오는 **바텀시트**(평소 `translateY(100%)` 로 화면 밖). 상시 고정 크롬이 아니다 |

튜토리얼 오버레이(`div.ct-root`, `.ct-shade`, `.ct-spot`)는 일시 레이어라 집계에서 뺐다.

> 점검 대상 목록 밖이지만 같은 성격 — `pages/coverage/result.html`(보장분석 결과)은
> 상단 고정이 **3개**다: `header.m-topbar` 54px + `div.report-viewseg` 40px + `nav.cov-nav` 58px = 152px.
> 요청서의 점검 대상에 없어 매트릭스에는 넣지 않았으나, 수정 묶음 5에 함께 넣기를 권한다.

### S4 — 하단 고정 바의 safe-area 반영 · 심각도 중 (신설)

기준 1-2 에 "하단 고정 요소는 `env(safe-area-inset-bottom)` 반영" 조항이 있었으나 점검 포인트가 없었다.
개정과 함께 신설한다. 하단 고정 바가 있는 화면만 해당.

| 페이지 | 선택자 | 현재 | 기준 |
|---|---|---|---|
| `/claim/write` | `.wizard-cta` (`pages/claim/new.html:286`) | `padding: 12px 16px` | `padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px))` |
| `/mypage/` | `.mp-savebar-slot` (`pages/mypage/index.html:211`) | `bottom: 12px` | `bottom: calc(12px + env(safe-area-inset-bottom, 0px))` |

반영돼 있는 선례 — `pages/claim/sign-mobile.html:121` `.cta-bar`
`padding: 12px 20px calc(16px + env(safe-area-inset-bottom, 0px))`. 이 형태를 따르면 된다.

미반영 시 iPhone 홈 인디케이터에 버튼이 가려진다.

### R6 — 본문 상단 텍스트형 뒤로가기 · 심각도 중

| 페이지 | 선택자 | 위치 | 문구 |
|---|---|---|---|
| `/customer/write` 등록 | `a.back-btn` | top 64px | "뒤로" |
| `/customer/write?code` 상세 | `a.back-btn` | top 70px | "내고객 목록으로" |
| `/planner/write` | `a.back-link` | top 66px | "설계사관리로 돌아가기" |

### D3 — 목록 행 높이 96px 초과 · 심각도 중

| 페이지 | 선택자 | 최대 높이 | 원인 |
|---|---|---|---|
| `/customer/` | `a.table-row` | **161px** (12행) | 4줄 — 이름+생년 / 메타 / 배지+상태 / 날짜. **날짜 중복**: "06.10 발송"(배지 줄)과 "2026.06.10"(4줄째) |
| `/planner/` | `a.table-row` | 143px (12행) | 4줄 — 이름+아이디 / 메타 / 소속+상태 / 날짜 |
| 보장분석 내역 | `a.table-row.rsv-chev` | 114px (8행) | 4줄 — 날짜 / 이름+담당 / 파일명 / 건수+금액 |
| `/charts/` | `div.table-row.rsv-amt` | 101px (8행) | 3줄 + 질환 칩 줄 |
| 리포트 본문 | `tr` | 144px | 진료기록 카드 행 |

해당 없음으로 둔 것 — `/notice/` `button.ns-card` 352px, 자료실 `section.lib-card` 275px,
`/mypage/plan.php` `div.pl-card` 414–430px. 썸네일·플랜 카드라 "목록 행 3줄" 규칙 대상이 아니다.
다만 `/notice/` 는 첫 화면 0행이라 R1·R2 에서 따로 잡았다.

### 부합 확인된 영역

- **D1 표기 형식** — 0건. 생년월일 `1983.02.15`, 연락처 `010-1234-5678`, 금액 `3,842,000원`, 날짜 `2026.06.10` 모두 기준대로.
- **D2 줄바꿈** — 0건. `word-break: keep-all` 전역 적용, 금액·날짜 `nowrap`, `overflow-wrap: anywhere` 잔존 0건.
- **D4 표 가로 넘침** — 0건. 넓은 표는 모두 `overflow-x: auto` 래퍼 안에 있다.
- **L1 가로 넘침** — 360 / 375 / 430px 전부 0건.
- **S2 화면 좌우 여백** — 21개 화면 전부 16px.

---

## 5. 요청서 2-4 "이미 확인된 위반" 대조

라이브에서 확인된 항목이 이 저장소에서도 잡히는지 — 측정이 제대로 도는지 검증한다.

| 포인트 | 라이브 내용 | 이 저장소 결과 |
|---|---|---|
| R1·R2·R4 `/customer/` | 688px, 0행, KPI 3 세로, CTA 단독 줄 | **잡힘** — 461px, 1행, KPI 3 세로 적층. CTA 는 헤더 오른쪽으로 이동되어 해소 |
| R1·R2·R4 `/claim/` | 880px, 0행, KPI 4 세로, 보조 링크 2개 | **일부 잡힘** — 442px, 3행(360px 에서 1행). KPI 는 2×2 라 적층 아님. 보조 링크는 검색바 안 아이콘 버튼으로 접혀 해소. R1·R3·R5 로 잡힘 |
| R3 필터 칩 3줄 | `/customer/` `/charts/` `/unclaim/` | **해소** — 칩 + 바텀시트로 바뀌어 3줄 펼침 없음. 다만 트리거가 전체 폭이라 R4 로 잡힘 |
| D2 `/claim/` `span.tr-name` | 이름 "박성 / 숙" 분리 | **재현 안 됨** — `keep-all` + `nowrap` 적용. 이 저장소 `/claim/` 행에는 이름이 2줄째 메타에 있고 갈라지지 않음 |
| D2 `/unclaim/` `span.cost` | "-343,900 / 원" 분리 | **재현 안 됨** — `.tr-amt` `white-space: nowrap` |
| D1 `/customer/write.php` | 생년월일 `19811111`, 연락처 `01033059150` | **재현 불가** — 이 저장소 등록 폼은 빈 입력 + placeholder(`YYYY.MM.DD`, `010-0000-0000`). 값이 채워진 상세 화면이 없어 포맷 검증 대상이 없다. **라이브에서 반드시 재확인 필요** |
| D3 `/customer/` 177px, `/counsel/` 224px | 카드 높이 | **부분 잡힘** — `/customer/` 161px 로 잡힘. `/counsel/` 화면 없음 |
| D4 `/mypage/plan.php` 표 405/342 | 가로 넘침 | **재현 안 됨** — 이 저장소 플랜 비교표는 `overflow-x: auto` 래퍼 안. 대신 플랜 카드가 414–430px 라 첫 화면 1장(R2) |
| B1·B2 `.pill` 29px, "남"·"여" 37px | 칩 크기 | **잡힘** — `.pill` 32px 높이, "남"·"여" **41×32**. 폭·터치 44 미만 |
| B1 `button.hist-period` 15px | 터치 높이 | **잡힘(대응 컴포넌트)** — `button#period-trigger` 86×32, 같은 성격의 15px 컨트롤 다수(`a.more`, `button.info-trigger`) |
| B1 `button.ham` 38×38 | 아이콘 버튼 | **잡힘** — `button.m-ham` 42×42 |
| B1 `jm-quick-help` 28×28 | 아이콘 버튼 | **부분** — 이 저장소 `/jjaept/` 에는 해당 버튼이 없고 `button.jm-chip` 35px 로 잡힘 |
| B1 `sb-help-btn` 32×28 | 아이콘 버튼 | **잡힘** — 32×32, F2 도 함께 |
| B1 `span.hint-q` 16×16 | 아이콘 버튼 | **재현 안 됨** — 해당 컴포넌트 없음 |
| B1·F3 검색 input 26px / 13–15px | 입력 | **잡힘** — input 실높이 32px(일부 20–23px), 글자 13–15px |
| R6 `a.back-btn` 3곳 | 본문 상단 뒤로가기 | **잡힘** — 등록·상세·설계사상세 3곳 |

재현되지 않은 5건은 모두 **라이브에만 있는 화면·데이터** 때문이며, 측정기 결함이 아니다.
D1(입력 포맷)과 D4(플랜 비교표)는 라이브에서 별도 확인이 필요하다.

---

## 6. 기준 외 값 목록 (정적 점검)

전체 목록은 `docs/mobile-ui-audit-20261127-static.txt`.

### 6-1. 토큰을 거치지 않은 글자 크기 — 33건

| 파일 | 건수 | 비고 |
|---|---|---|
| `styles/landing.css` | 14 | 랜딩 — 이번 기준 범위 밖(별도 스케일 유지) |
| `styles/mobile.css` | 3 | 22·24·22px → `--m-fs-kpi` |
| `pages/coverage/result.html` | 2 | 26·22px |
| `pages/customer/detail-*.html` | 3 | 20px → `--m-fs-page` |
| `pages/admin/planner/list.html:157` | 1 | 17px → `--m-fs-sec` |
| 기타 | 10 | — |

### 6-2. 4px 배수가 아닌 패딩 · 마진 · gap — 687건

| 값 | 건수 | 대체 |
|---|---|---|
| **14px** | 206 | 12 또는 16 |
| **10px** | 125 | 8 또는 12 |
| **18px** | 95 | 16 또는 20 |
| **6px** | 80 | 4 또는 8 |
| 22px | 32 | 20 또는 24 |
| 11px | 24 | 12 |
| 7px / 9px / 13px / 15px / 26px | 46 | 8 / 8 / 12 / 16 / 24 |
| 1–3px | 79 | 광학 보정. 기준 적용 여부 결정 필요 (아래 참고) |

파일별 상위 — `styles/mobile.css` 132, `styles/concept-e.css` 59,
`pages/unclaimed/result.html` 36, `pages/unclaimed/new.html` 34,
`pages/coverage/result.html` 32, `pages/report/new.html` 31, `pages/report/main.html` 31.

이번 점검에서 새로 만든 `styles/mobile-rules.css` 도 10건 걸린다 — 기준이 더 엄격하기 때문이다.

| 줄 | 값 | 대체 |
|---|---|---|
| 206, 270, 333 | `padding: … 14px` | 16px |
| 208, 268, 363, 390 | `gap: 6px` | 8px |
| 438 | `padding: 10px` | 12px |
| 394 | `padding-right: 38px` | 40px |
| 175 | `margin-top: 2px` | `--m-sp-line` 4px |

변수로는 `--m-row-y: 14` → 12, `--m-gap-in: 10` → 8·12, `--m-pad-sm: 14` → 16, `--m-ic: 34` → 36.

1–3px 값 79건은 아이콘·베이스라인 광학 보정이다. 기준(1-2)을 글자 그대로 적용하면 이것도 교체 대상이지만,
눈에 띄는 변화가 없고 양만 많아 **수정 묶음 7의 맨 뒤**로 미룬다. 먼저 손댈 것은 14·10·18·6px 506건이다.

### 6-3. 44px 미만으로 지정된 높이 · 폭 — 178건

파일별 상위 — `styles/mobile.css` 34, `styles/concept-e.css` 15,
`styles/detail-mobile.css` 12, `pages/coverage/new.html` 10,
`pages/unclaimed/new.html` 9, `pages/report/new.html` 9, `styles/mobile-rules.css` 6.

`styles/mobile-rules.css` 해당 줄 — 205 `min-height:36px`(제목줄 버튼), 313 `width:40px`,
416–417 `min-width/height:32px`(페이지네이션), 449 `min-width/min-height:40px`(아이콘 버튼).

---

## 7. 수정 우선순위 제안

이번에는 수정하지 않는다. 승인 뒤 묶음 단위로 진행한다.

| 묶음 | 범위 | 포인트 | 예상 영향 |
|---|---|---|---|
| **1. 터치 범위** | 공통 CSS 한 곳 — 칩·페이지네이션·아이콘 버튼·텍스트형 버튼에 `--m-tap-min` 확장 유틸 적용. 보이는 크기는 유지 | B1, B3 | 전 화면. 화면 높이 변화 없음 |
| **2. 입력 16px** | `input`·`select`·`textarea` 글자 16px, 실높이 44px | F3, B1 | 14화면. 검색바 높이 46 → 56 로 늘어 R3 재측정 필요 |
| **3. 글자 토큰** | `tokens.mobile.css` 적용. 19px → 20/17 재배치, 24·22·26·28·32px 정리 | F1, F2, F4 | 전 화면. 시각 변화 큼 — 디자인 확인 필요 |
| **4. 목록 행** | 4줄 → 3줄, 날짜 중복 제거, 높이 96px 이하 | D3, R1, R2 | `/customer/` `/planner/` 보장분석 `/charts/` |
| **5. 절제 UI** | 필터 트리거 내용 폭으로, `/customer/` KPI 한 줄 요약, `/claim/` 검색바 1줄(고정 해제), `/notice/` 상단 축소, 보장분석 결과 상단 고정 3개 정리 | R1, R3, R4, R5 | 목록 5화면 + `/notice/` + 보장분석 결과 |
| ~~5-1. CTA → FAB~~ | **2026-11-27 적용 완료** — 6화면 `.m-fab` 전환 | R4 | 완료 |
| ~~5-2. 검색 줄 통합~~ | **2026-11-27 적용 완료** — 필터를 검색바 안 아이콘으로, 기간 선택도 아이콘화 | R3, R4, B1 | 완료 (5화면) |
| **8. 하단 바** | `.wizard-cta`·`.mp-savebar` 에 safe-area 반영, `.mp-savebar` 72px 이하로 (문구 축약 또는 한 줄 유지) | S4, R5 | 2화면 |
| **6. 뒤로가기** | `a.back-btn` 3곳 제거, 상단 바 뒤로 버튼으로 | R6 | 3화면 |
| **7. 간격 정리** | 14·10·18·6px → 4px 배수 | S3, 정적-2 | 전 파일. 기계적이지만 양이 많음(608–687건) |

1·2·6 은 시각 변화가 거의 없고 효과가 크다. 3 은 디자인 확인이 먼저다.

---

## 완료 조건 점검

- [x] 산출물 3종 생성 — `docs/mobile-design-standard.md`, `styles/tokens.mobile.css`, 본 리포트 + `docs/audit-shots/` 21장
- [x] 요청서 2-4 의 항목을 전부 대조 (5절). 재현되지 않은 5건은 사유를 적었다
- [x] 색상 관련 기준·토큰·점검 항목 없음
- [x] **점검 자체는 기존 CSS·마크업을 수정하지 않고 측정만 했다.**
      이후 승인된 항목 둘만 적용했다 — ① 주요 CTA → 하단 플로팅(6화면), ② 검색·기간·필터 한 줄 통합(5화면).
      건드린 파일: `styles/mobile-rules.css`, `components/layout.js`(`#i-filter` 아이콘 추가), 해당 화면의 버튼 마크업. 추가된 것은 `docs/` 와 `styles/tokens.mobile.css` 뿐이다.
      (`git status` 에 보이는 수정 파일 66개는 같은 날 **앞선 모바일 정비 작업**의 미커밋 변경이며, 이번 점검과는 별개다.
       이번 점검은 그 상태를 **대상으로** 측정했다)
- [ ] **라이브 사이트(weplatbobi.kr) 점검** — 코드·계정·네트워크 접근이 없어 수행하지 못했다

### 토큰 경로 안내

요청서는 `css/bobi/tokens.mobile.css` 로 적었다. 이 저장소는 같은 역할을 `styles/` 에 두므로
`styles/tokens.mobile.css` 에 만들었다 (`styles/tokens.css` ↔ 라이브 `/css/bobi/tokens.css` 와 같은 대응).
라이브로 옮길 때 경로만 바꾸면 된다.
