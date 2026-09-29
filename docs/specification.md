# Specification

각 요구사항은 고유 ID를 부여해 추적한다 (커밋/PR/코드 주석 등에서 ID로 참조 가능).

## 기능 요구사항 (Functional Requirements)

| ID | 요구사항 | 설명 |
|---|---|---|
| FR-01 | 상품 목록 화면 | 카테고리 필터링을 지원하는 상품 그리드. Server Component에서 `searchParams.category` 기반으로 fetch |
| FR-02 | 상품 상세 화면 | 단일 상품 상세 정보, 수량 선택 후 담기/바로구매 |
| FR-03 | 장바구니 | 클라이언트 상태(Zustand + localStorage persist)로 담긴 상품 관리 (추가/수량변경/삭제) |
| FR-04 | 주문서 작성 | 게스트 buyer 정보(이름/연락처/주소) 입력, 주소는 팝업 검색 (react-daum-postcode) |
| FR-05 | 결제 요청 및 처리 | 주문 생성 후 TossPayments SDK로 결제창 호출, 성공/실패 리다이렉트 처리 (`/payment/success`, `/payment/fail`) |
| FR-06 | 주문 완료 안내 | 결제 승인 후 주문 완료 화면 표시 |

### 범위 제외 (Out of Scope)

- 회원가입/로그인 등 인증 화면
- 서버 측 장바구니 저장/동기화
- 재고 관련 UI (품절 표시 등)
- 결제 취소/환불 화면
- 관리자 화면
- 카테고리 목록 조회 API 호출 (대신 하드코딩된 값 사용, `lib/constants.ts`)

## 비기능 요구사항 (Non-functional Requirements)

| ID | 요구사항 | 설명 |
|---|---|---|
| NFR-01 | 결제 정합성 | 주문 생성 응답의 총액을 그대로 Toss 결제 요청 금액으로 사용하고, `/payment/success`에서도 리다이렉트로 받은 amount를 그대로 confirm에 전달한다 (프론트에서 재계산 금지) |
| NFR-02 | 디자인 일관성 | 색상은 `@theme` 토큰만 사용하고 raw hex 값(`text-[#666]` 등)을 코드에 직접 쓰지 않는다 |
| NFR-03 | 유지보수 용이성 | 유지보수 인원 1명이 이해 가능한 단순 구조 유지, 프로젝트 규모에 맞지 않는 라이브러리(React Query, 폼 라이브러리 등) 도입 지양 |

## 기술 요구사항 및 제약사항 (Technical Requirements & Constraints)

| ID | 요구사항 | 설명 |
|---|---|---|
| TR-01 | 프레임워크 | Next.js 최신 안정 버전, App Router, TypeScript strict, `src/` 디렉토리, import alias `@/*` |
| TR-02 | 스타일링 | Tailwind CSS v4 (CSS-first `@theme`), Pretendard Variable 폰트 |
| TR-03 | 상태관리 | Zustand(+ persist)는 장바구니에 한해 사용. 그 외 상태는 `useState`로 충분 |
| TR-04 | 결제 연동 | `@tosspayments/tosspayments-sdk` |
| TR-05 | 주소 검색 | `react-daum-postcode` |
| TR-06 | API 계약 | `petshop-frontend-prev/src/lib/api.ts`를 계약 원본으로 이식 (`ApiProduct`, `ApiOrder`, `CreateOrderPayload`, `PaymentConfirmPayload`, `ApiPayment`, 엔드포인트: `GET /api/products`, `GET /api/products/:id`, `POST /api/orders`, `POST /api/payments/confirm`). petshop-back Phase 1~3 구현 후 Swagger(`/swagger-ui.html`)로 재검증 필요 |
| TR-07 | 렌더링 원칙 | 인증이 필요 없는 읽기 전용 데이터(상품 목록/상세, 결제 승인 결과)는 Server Component에서 fetch. 브라우저 API/로컬 상태가 필요한 부분(장바구니, 주문 폼, 주소 검색, Toss SDK 호출)만 Client Component로 분리 |

## UI/UX

- 다크, near-black 미니멀 테마. 한국어 UI/콘텐츠. 아이콘 라이브러리 없이 인라인 SVG.
- 디자인 토큰 (petshop-frontend-prev 값 기준, 세분화):
  - 배경: `--color-bg`(#0a0a0a) / `--color-surface`(#111111) / `--color-card`(#141414) / `--color-skeleton`(#1a1a1a)
  - 보더: `--color-border`(#222222) / `--color-border-strong`(#333333) / `--color-border-hover`(#444444)
  - 텍스트: `--color-muted`(#999999) / `--color-subtle`(#666666) / `--color-faint`(#555555) / `--color-placeholder`(#444444)
  - 액센트: `--color-cream`(#F5F0E8) — 흰색 CTA 버튼 hover

### 브랜드/콘텐츠 (petshop-frontend-prev와 동일하게 유지)

- 쇼핑몰 이름: **뚱이요미 샵** (Navbar 로고, `layout.tsx`의 `metadata.title`/`description`에도 동일하게 사용)
- 히어로 카피: "New Collection" / "뚱이 & 요미\n굿즈 컬렉션" / "두 강아지의 사진으로 만든 특별한 굿즈"
- 카테고리(하드코딩, `lib/constants.ts`): 전체(0) / 인쇄류(1) / 생활용품(2) / 액세서리(3) — petshop-frontend-prev/src/data/products.ts의 `categories`와 동일
- 데모/placeholder 상품 7종과 이미지·model(뚱이/요미/뚱이요미)·tag(인기/신상)는 petshop-frontend-prev/src/data/products.ts의 `products` 배열을 그대로 이식하고, 실제 이미지 파일 7개(`public/images/*.png`)도 petshop-frontend-prev에서 복사한다.
- `PRODUCT_META`(상품 ID → {image, model, tag})는 **디자인 확인용 mock 데이터로만 유지**한다. 실제 백엔드 상품(petshop-back FR-06 시딩)과 연결되는 Phase 1에서는 이미지/캐릭터 매핑을 상품 데이터에 강제로 끼워 맞추지 않는다 — 백엔드가 실제로 어떤 상품을 시딩하는지 정해지기 전까지는 이미지/태그 매핑 자체를 붙이지 않거나(상품명/가격만 표시), 붙이더라도 그때 가서 다시 설계한다. 지금 단계의 `PRODUCT_META`/`DEMO_PRODUCTS`를 그대로 실데이터에 재사용하려 하지 않는다.
