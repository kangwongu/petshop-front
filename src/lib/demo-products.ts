// 디자인 확인용 임시 정적 데이터. petshop-frontend-prev/src/data/products.ts를 그대로 이식.
// Phase 1에서 lib/api.ts(백엔드) + lib/product-meta.ts(PRODUCT_META)로 대체되면 이 파일은 삭제한다.
export type DemoProduct = {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  model: "뚱이" | "요미" | "뚱이요미";
  image: string;
  tag?: string;
};

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 1,
    name: "뚱이 포토카드 3종 세트",
    price: 9900,
    categoryId: 1,
    model: "뚱이",
    image: "/images/ddungi-studio.png",
    tag: "인기",
  },
  {
    id: 2,
    name: "요미 A4 포스터",
    price: 12000,
    categoryId: 1,
    model: "요미",
    image: "/images/yomi-studio.png",
  },
  {
    id: 3,
    name: "뚱이요미 스티커팩 (10종)",
    price: 6900,
    categoryId: 1,
    model: "뚱이요미",
    image: "/images/yomi-cells.png",
    tag: "신상",
  },
  {
    id: 4,
    name: "뚱이 얼굴 머그컵",
    price: 18000,
    categoryId: 2,
    model: "뚱이",
    image: "/images/ddungi-outdoor.png",
  },
  {
    id: 5,
    name: "요미 얼굴 에코백",
    price: 22000,
    categoryId: 2,
    model: "요미",
    image: "/images/yomi-indoor.png",
    tag: "인기",
  },
  {
    id: 6,
    name: "뚱이요미 아크릴 키링 세트",
    price: 14000,
    categoryId: 3,
    model: "뚱이요미",
    image: "/images/ddungi-cells.png",
  },
  {
    id: 7,
    name: "요미 폰케이스",
    price: 19000,
    categoryId: 3,
    model: "요미",
    image: "/images/yomi-outdoor.png",
    tag: "신상",
  },
];
