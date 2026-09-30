# Implementation Plan

이 문서는 `constitution.md`와 `specification.md`(FR/NFR/TR ID)를 바탕으로 구현 순서를 정의한다.

## 구현 원칙

- 진행 상황은 `specification.md`의 요구사항 ID(FR/NFR/TR)로 추적한다.
- 백엔드 의존 순서를 따른다: Product/Category(petshop-back Phase 1) → Order(Phase 2) → Payment(Phase 3). 프론트도 동일한 순서로 화면을 완성한다.
- 각 Phase는 목(mock) 백엔드로 먼저 동작 확인한 뒤, 실제 petshop-back의 해당 Phase가 완료되면 실백엔드로 전환해 재검증한다.

## Phase 0. 프로젝트 초기 설정

- `create-next-app`으로 스캐폴딩 (TR-01)
- 패키지 설치: zustand, @tosspayments/tosspayments-sdk, react-daum-postcode (TR-03,04,05)
- 디자인 토큰 이식 (`globals.css`, TR-02, NFR-02)
- petshop-frontend-prev의 `public/images/*.png` 7개를 그대로 복사
- 레이아웃(브랜드 metadata "뚱이요미 샵")/Navbar(로고 "뚱이요미 샵") 골격

**완료 기준**: `npm run dev`로 "뚱이요미 샵" 레이아웃(Navbar 포함)이 정상 렌더링된다.

## Phase 1. 상품 목록/상세

- `lib/api.ts` 작성 (TR-06)
- `lib/constants.ts`(CATEGORIES: 전체/인쇄류/생활용품/액세서리)
- `lib/demo-products.ts`/mock `PRODUCT_META`는 실제 상품 데이터에 재사용하지 않는다. 실제 백엔드 상품은 이미지/캐릭터 매핑 없이 이름/가격/카테고리만 표시하고, 이미지·캐릭터 매핑을 붙일지는 petshop-back의 FR-06 시딩 데이터가 정해진 뒤 별도로 다시 설계한다.
- 홈(`app/page.tsx`, 히어로 카피 "뚱이 & 요미 / 굿즈 컬렉션" 포함) + `CategoryFilter`(Server Component, Link 기반) — FR-01
- 상품 상세(`app/products/[id]/page.tsx`) + `ProductActions`(client) — FR-02

**완료 기준**: 목 백엔드 기준으로 카테고리 필터, 상세 진입이 정상 동작한다.

## Phase 2. 장바구니

- `lib/store/cart.ts` (Zustand + persist, `skipHydration` + rehydrate 처리) — FR-03, TR-03
- `app/cart/page.tsx`, Navbar 카트 배지 연동

**완료 기준**: 담기 → 새로고침 후에도 카트 내용 유지, 배지 숫자 정확.

## Phase 3. 주문서 및 결제 요청

- `app/order/page.tsx`(client), `AddressSearchModal.tsx` — FR-04
- 주문 생성 → TossPayments `requestPayment` 호출 (금액은 서버 응답 그대로, NFR-01) — FR-05

**완료 기준**: 목 백엔드 기준으로 주문 생성 후 Toss 결제창(테스트 키)이 정상적으로 열린다.

## Phase 4. 결제 결과 처리

- `app/payment/success/page.tsx`(server, confirm 호출) + `loading.tsx` — FR-05, NFR-01
- `app/payment/fail/page.tsx`(server) + `RetryButton`(client)
- `app/order/complete/page.tsx`(server) — FR-06

**완료 기준**: 성공/실패 양쪽 리다이렉트가 각각 올바른 화면으로 이어진다.

## Phase 5. 백엔드 연동 검증

- 임시 목 백엔드(`scripts/dev-mock-backend.mjs`)로 전체 플로우 1차 검증 후 삭제
- petshop-back Phase 1~3 완료 시점에 맞춰 `NEXT_PUBLIC_API_URL`을 실제 백엔드로 전환, Swagger로 `lib/api.ts` 계약 재검증 (TR-06)
- petshop-back Phase 4(연동 검증)와 동일한 전체 구매 플로우 최종 확인

**완료 기준**: `constitution.md`의 성공 기준 충족.

## Phase 6. 배포 (TR-08)

- Vercel 프로젝트 생성, GitHub 저장소 연동 (push 시 자동 배포)
- 환경변수(`NEXT_PUBLIC_API_URL` 등) Vercel 프로젝트 설정에 등록 (Production/Preview 분리 고려)
- petshop-back(AWS) CORS 허용 오리진에 Vercel 배포 도메인 추가 확인
- 커스텀 도메인 연결 여부 결정 (필요 시)

**완료 기준**: Vercel 배포 URL에서 홈 → 상품 상세 → 장바구니 → 주문서 → Toss 결제 팝업 → 결제 완료 플로우가 실제 배포 환경에서 끊김 없이 동작한다.
