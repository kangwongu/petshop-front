export type Category = { id: number; name: string };

// FR-06/카테고리 API 부재로 인한 하드코딩 (specification.md Out of Scope 참고).
// 브랜드 콘텐츠는 petshop-frontend-prev/src/data/products.ts의 categories와 동일하게 유지.
// id: 0은 "전체"를 의미하는 프론트 전용 pseudo-category.
export const CATEGORIES: Category[] = [
  { id: 0, name: "전체" },
  { id: 1, name: "인쇄류" },
  { id: 2, name: "생활용품" },
  { id: 3, name: "액세서리" },
];
