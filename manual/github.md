repo: joeyjjin-eng/bobi
branch: main

## Last sync
date: 2026-07-27T07:40:00Z

### Updated in this project
- 저장소의 실제 화면(회원가입·로그인·홈·고객·리포트)을 프로젝트로 가져와 스크린샷 소스로 사용
- 화면에 노출되는 모든 고객명·연락처를 가명(아이유 등)·샘플번호(010-1234-XXXX)로 치환
- 리포트 진입 애니메이션(barRise·radDraw·trackFill)을 제거해 정적 캡처가 가능하도록 조정
- A4 8페이지 사용매뉴얼(보비 사용매뉴얼.dc.html) 신규 제작

## Screen map
| 프로젝트 화면 / 스크린샷 | 저장소 파일 |
|---|---|
| shots/signup-1~3.png | signup.html, styles/auth.css |
| shots/login.png | login.html, styles/auth.css |
| shots/home.png | home.html, components/layout.js, styles/concept-a.css, styles/concept-e.css |
| shots/customer-list.png | pages/customer/list.html |
| shots/customer-new.png | pages/customer/new.html |
| shots/customer-detail.png | pages/customer/detail.html |
| shots/report-new.png, shots/report-verify.png | pages/report/new.html |
| shots/rep-*.png | pages/report/main.html |
| shots/mobile-home.png, shots/mobile-report.png | mobile.html, styles/mobile.css |
| 보비 사용매뉴얼.dc.html | 위 화면 캡처 조합 + styles/tokens.css (토큰) |
