// petshop-back API 계약 (TR-06). petshop-frontend-prev/src/lib/api.ts를 원본으로 이식했다.
// Product는 실제 응답(ProductController/ProductRes)으로 재검증 완료 (docs/specification.md TR-06 참고).
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.");
}
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type ApiProduct = {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName: string;
  imageUrl: string | null;
};

export type ApiOrder = {
  id: number;
  orderNumber: string;
  buyerName: string;
  status: string;
  totalAmount: number;
};

export type CreateOrderPayload = {
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  items: { productId: number; quantity: number }[];
};

export type PaymentConfirmPayload = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

export type ApiPayment = {
  paymentId: number;
  paymentKey: string;
  orderId: number;
  amount: number;
  status: string;
  approvedAt: string;
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`);
  return res.json();
}

export const api = {
  products: {
    list: (categoryId?: number) =>
      get<ApiProduct[]>(
        categoryId ? `/api/products?categoryId=${categoryId}` : "/api/products"
      ),
    get: (id: number) => get<ApiProduct>(`/api/products/${id}`),
  },
  orders: {
    create: (payload: CreateOrderPayload) => post<ApiOrder>("/api/orders", payload),
  },
  payments: {
    confirm: (payload: PaymentConfirmPayload) =>
      post<ApiPayment>("/api/payments/confirm", payload),
  },
};
