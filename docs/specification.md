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
| TR-06 | API 계약 | `petshop-frontend-prev/src/lib/api.ts`를 계약 원본으로 이식 (`ApiProduct`, `ApiOrder`, `CreateOrderPayload`, `PaymentConfirmPayload`, `ApiPayment`, 엔드포인트: `GET /api/products`, `GET /api/products/:id`, `POST /api/orders`, `POST /api/payments/confirm`). petshop-back Phase 1~3 구현 후 Swagger(`/swagger-ui.html`)로 재검증 필요. **Product 재검증 완료(Phase 1)**: petshop-back `ProductController`/`ProductRes` 기준 실응답은 `{ id, name, price, categoryId, categoryName, imageUrl }` — petshop-frontend-prev의 `ApiProduct`에는 없던 `imageUrl: string \| null` 필드가 추가되어 있다(S3 미연동으로 현재 시딩 데이터는 전부 `null`). `GET /api/products`는 `categoryId` 쿼리 파라미터를 선택적으로 지원한다. `imageUrl`은 계약 타입에는 반영하되, 실제 값이 채워지기 전까지 Phase 1 UI에서는 사용하지 않는다(브랜드/콘텐츠 절 참고). **Order/Payment 재검증 완료(Phase 3)**: `POST /api/orders`는 `ApiOrder` 그대로(`{ id, orderNumber, buyerName, status, totalAmount }`) 응답한다 — 실응답 예시 `{"id":7,"orderNumber":"ORD-20260930225123-T5C3VM","buyerName":"테스트","status":"PENDING","totalAmount":10000}`. `POST /api/payments/confirm`도 존재 확인(정상 파라미터로는 미검증, 빈 payload에 400 응답으로 엔드포인트 존재만 확인). **Payment 재검증 완료(Phase 4)**: petshop-back 소스(`PaymentWriteService`/`ConfirmPaymentReq`/`PaymentRes`/`PaymentStatus`)를 직접 열람해 계약을 재검증했다. `ConfirmPaymentReq {paymentKey, orderId, amount}`, `PaymentRes {paymentId, paymentKey, orderId, amount, status, approvedAt}`는 기존 `PaymentConfirmPayload`/`ApiPayment`와 필드명·타입이 정확히 일치해 `lib/api.ts` 변경은 불필요하다. 단, `PaymentWriteService.create()`는 Toss 승인이 실패(`TossConfirmFailedException`)해도 예외를 던지지 않고 `Payment.fail(...)`로 만든 응답을 `200 OK` + `status: "FAILED"`로 그대로 반환하므로(주문이 이미 처리됐거나 금액이 불일치하면 `BadRequestException`으로 throw됨), success 페이지는 confirm 호출이 throw하지 않아도 `status === "PAID"`를 명시적으로 확인해 최종 성공/실패를 판단한다. **Swagger 기준 최종 재검증 완료(Phase 5)**: 로컬 petshop-back(`main`, `dd0931d`)을 기동해 `/v3/api-docs`(springdoc OpenAPI JSON, `/swagger-ui.html`과 동일한 스펙 소스)로 4개 엔드포인트 전부를 재검증했다. `GET /api/products`(`categoryId` 쿼리 파라미터 포함)·`GET /api/products/{id}`의 `ProductRes`, `POST /api/orders`의 `CreateOrderReq`/`OrderRes`, `POST /api/payments/confirm`의 `ConfirmPaymentReq`/`PaymentRes` 모두 기존 `lib/api.ts`의 `ApiProduct`/`CreateOrderPayload`·`ApiOrder`/`PaymentConfirmPayload`·`ApiPayment`와 필드명·타입이 100% 일치해 코드 변경이 불필요했다. `POST /api/orders`는 실제 payload(`{buyerName, buyerPhone, buyerAddress, items:[{productId:1, quantity:2}]}`)로 "Try it out"에 해당하는 실호출까지 수행해 `{"id":14,"orderNumber":"ORD-20261003111116-BPHVK6","buyerName":"스웨거검증","status":"PENDING","totalAmount":10000}` 응답을 확인했다(`totalAmount`가 상품가 5000원 × 수량 2로 정확히 계산됨). `POST /api/payments/confirm`은 실제 Toss `paymentKey`가 필요해 Try it out 실호출은 이번에도 불가능했으나, OpenAPI 스펙 문서(`ConfirmPaymentReq`/`PaymentRes`)가 Phase 4의 소스 열람 결과와 정확히 일치함을 재확인했다. 카테고리 시딩 데이터(`categoryId` 1=인쇄류/2=생활용품/3=액세서리)도 `lib/constants.ts`의 `CATEGORIES`와 정확히 일치한다. **전체 구매 플로우 실측 완료(Phase 5)**: Claude in Chrome으로 홈→상품상세→장바구니→주문서→Toss 결제(토스뱅크, 실제 PUSH 인증)→`/payment/success`→`/order/complete`까지 장바구니 경유·바로구매 경유 두 경로 모두 끊김 없이 완주해, `POST /api/payments/confirm`을 실제 Toss `paymentKey`로 호출하는 런타임 동작까지 처음으로 직접 검증했다(기존에는 소스 열람·스펙 비교로만 교차 확인했음). 결제 취소(`/payment/fail`) 플로우는 로컬 테스트 클라이언트 키 샌드박스가 거절(decline) 시나리오를 재현하지 못해 이번 Phase 5 범위에서는 미검증으로 남았다 |
| TR-07 | 렌더링 원칙 | 인증이 필요 없는 읽기 전용 데이터(상품 목록/상세, 결제 승인 결과)는 Server Component에서 fetch. 브라우저 API/로컬 상태가 필요한 부분(장바구니, 주문 폼, 주소 검색, Toss SDK 호출)만 Client Component로 분리 |
| TR-08 | 배포 | Vercel에 배포한다. GitHub 저장소 연동으로 push 시 자동 빌드/배포(프리뷰+프로덕션)되는 것을 CI/CD로 사용하고 별도 파이프라인은 구성하지 않는다. petshop-back은 AWS에 별도로 배포되므로, 프론트(Vercel)↔백엔드(AWS) 간 CORS 허용 오리진과 `NEXT_PUBLIC_API_URL` 등 환경변수를 Vercel 프로젝트 설정에 등록해야 한다 |

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
- **이미지 렌더링 추가(Phase 6 중 결정)**: petshop-back 시딩 데이터의 `imageUrl`(TR-06, `ApiProduct.imageUrl`)에 실제 URL 값이 채워지기 시작해, 상품 목록(`ProductCard.tsx`)과 상세(`products/[id]/page.tsx`)에서 `imageUrl`을 일반 `<img>` 태그로 렌더링한다(값이 없으면 기존 플레이스홀더 박스를 유지). `next/image`는 사용하지 않는다 — 이미지 호스트(S3 등 도메인)가 아직 확정되지 않아 `next.config.ts`의 `remotePatterns`를 미리 고정하면 도메인 변경 시 깨지므로, 호스트가 확정된 뒤 `next/image` 전환을 재검토한다. 캐릭터(뚱이/요미)·태그(인기/신상) 매핑은 여전히 petshop-back에 해당 데이터가 없어 이번 변경 범위에 포함하지 않는다.
