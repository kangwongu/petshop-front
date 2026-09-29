# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

petshop-back(반려동물 용품 쇼핑몰 백엔드, 별도 저장소)의 API를 소비하는 게스트 전용 커머스 프론트엔드. 인증 없이 상품 조회 → 장바구니 → 주문서 작성 → Toss Payments 결제까지 이어지는 구매 플로우를 제공한다.

**작업 전 반드시 `docs/` 폴더를 먼저 읽을 것.** 이 저장소는 요구사항/설계를 코드가 아니라 `docs/`에 문서로 추적한다:
- `docs/constitution.md` — 목적, 성공 기준, 제약사항
- `docs/specification.md` — FR/NFR/TR ID가 붙은 요구사항 (기능/비기능/기술), UI/UX 및 브랜드 규정
- `docs/plan.md` — Phase별 구현 순서 (FR/NFR/TR ID로 진행 상황 추적)
- `docs/phase{N}-todo.md` — 현재 진행 중인 Phase의 세부 체크리스트

코드를 작성하기 전에 관련 FR/NFR/TR ID를 `docs/specification.md`에서 확인하고, 새로운 요구사항이 생기면 코드에 바로 반영하지 말고 먼저 `docs/`에 ID를 부여해 기록한다.

## 명령어

```bash
npm run dev      # 개발 서버 (Turbopack, http://localhost:3000)
npm run build    # 프로덕션 빌드 (타입 체크 포함)
npm run start    # 빌드 결과 실행
npm run lint     # ESLint
```

테스트 프레임워크는 아직 설정되어 있지 않다.

## Next.js 버전 관련 주의사항

`package.json` 기준 Next.js 16.x / React 19.x — 학습 데이터 시점보다 최신 버전일 수 있다. 코드 작성 전 `AGENTS.md`(자동 생성/갱신됨)의 안내를 따를 것. 특히 `page.tsx`의 `params`/`searchParams`는 **Promise**다.

## 커밋 컨벤션

커밋 작성 전 반드시 @.claude/commit.md 를 확인하고 그대로 따를 것.

## 아키텍처 원칙 (TR-07)

인증이 필요 없는 읽기 전용 데이터는 **Server Component**에서 fetch하고, 브라우저 API/로컬 상태가 필요한 부분만 `"use client"`로 분리한다. URL(`searchParams`)만으로 표현 가능한 UI(카테고리 필터 등)는 클라이언트 JS 없이 `<Link>` 기반 Server Component로 구현한다 — `src/components/CategoryFilter.tsx` 참고. 상세 규칙/이유는 `docs/specification.md`의 TR-07, NFR-02(디자인 토큰만 사용), NFR-03(불필요한 라이브러리 지양) 참고.

## 브랜드/콘텐츠 — 절대 임의로 바꾸지 말 것

쇼핑몰 이름은 **"뚱이요미 샵"**이며, 이전 프로토타입(petshop-frontend-prev)의 디자인·브랜드·콘텐츠를 petshop-back의 상품 도메인(일반 반려용품)과 무관하게 그대로 유지하는 것이 명시적 결정이다. petshop-back이 캐릭터 개념이 없다고 해서 브랜드를 임의로 일반화하지 말 것 — 상세는 `docs/specification.md`의 "브랜드/콘텐츠" 절 참고.

`src/lib/demo-products.ts`는 디자인 확인용 mock일 뿐, 실제 백엔드 연동(Phase 1) 시 그대로 재사용하지 않는다.
