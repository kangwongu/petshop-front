"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { api, type ApiProduct } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import AddressSearchModal from "@/components/AddressSearchModal";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";

type BuyerForm = {
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerAddressDetail: string;
};

type OrderRow = { productId: number; quantity: number; product: ApiProduct };

function parsePositiveInt(raw: string | null): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function OrderPageContent() {
  const searchParams = useSearchParams();
  const isFromCart = searchParams.get("from") === "cart";
  const singleProductId = isFromCart ? null : parsePositiveInt(searchParams.get("productId"));
  const singleQuantity = parsePositiveInt(searchParams.get("quantity")) ?? 1;

  const cartItems = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const cartItemsKey = cartItems.map((item) => `${item.productId}:${item.quantity}`).join(",");

  const [cartFetchedRows, setCartFetchedRows] = useState<OrderRow[]>([]);
  const [cartFetchedKey, setCartFetchedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isFromCart || !hasHydrated || cartItems.length === 0) return;

    let cancelled = false;

    Promise.all(
      cartItems.map((item) =>
        api.products
          .get(item.productId)
          .then((product) => ({ ...item, product }))
          .catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return;
      setCartFetchedRows(results.filter((row): row is OrderRow => row !== null));
      setCartFetchedKey(cartItemsKey);
    });

    return () => {
      cancelled = true;
    };
  }, [isFromCart, hasHydrated, cartItems, cartItemsKey]);

  const [singleProduct, setSingleProduct] = useState<ApiProduct | null>(null);
  const [singleFetchedId, setSingleFetchedId] = useState<number | null>(null);

  useEffect(() => {
    if (isFromCart || singleProductId === null) return;

    let cancelled = false;

    api.products
      .get(singleProductId)
      .then((product) => {
        if (cancelled) return;
        setSingleProduct(product);
        setSingleFetchedId(singleProductId);
      })
      .catch(() => {
        if (cancelled) return;
        setSingleProduct(null);
        setSingleFetchedId(singleProductId);
      });

    return () => {
      cancelled = true;
    };
  }, [isFromCart, singleProductId]);

  const cartRows = isFromCart && cartItems.length > 0 ? cartFetchedRows : [];
  const cartLoading = isFromCart && (!hasHydrated || (cartItems.length > 0 && cartFetchedKey !== cartItemsKey));

  const singleRows: OrderRow[] =
    !isFromCart && singleProductId !== null && singleFetchedId === singleProductId && singleProduct
      ? [{ productId: singleProductId, quantity: singleQuantity, product: singleProduct }]
      : [];
  const singleLoading = !isFromCart && singleProductId !== null && singleFetchedId !== singleProductId;

  const rows = isFromCart ? cartRows : singleRows;
  const isLoading = isFromCart ? cartLoading : singleLoading;
  const totalAmount = rows.reduce((sum, row) => sum + row.product.price * row.quantity, 0);

  const [form, setForm] = useState<BuyerForm>({
    buyerName: "",
    buyerPhone: "",
    buyerAddress: "",
    buyerAddressDetail: "",
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const clearCart = useCartStore((s) => s.clearCart);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleAddressComplete(address: string) {
    setForm((prev) => ({ ...prev, buyerAddress: address }));
    setShowAddressModal(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (rows.length === 0) return;

    setSubmitting(true);
    setError("");

    try {
      const fullAddress = form.buyerAddressDetail
        ? `${form.buyerAddress} ${form.buyerAddressDetail}`
        : form.buyerAddress;

      const order = await api.orders.create({
        buyerName: form.buyerName,
        buyerPhone: form.buyerPhone,
        buyerAddress: fullAddress,
        items: rows.map((row) => ({ productId: row.productId, quantity: row.quantity })),
      });

      if (isFromCart) clearCart();

      const orderName =
        rows.length === 1
          ? rows[0].product.name
          : `${rows[0].product.name} 외 ${rows.length - 1}건`;

      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: order.totalAmount },
        orderId: order.orderNumber,
        orderName,
        customerName: form.buyerName,
        customerMobilePhone: form.buyerPhone.replace(/-/g, ""),
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch {
      setError("주문 처리 중 오류가 발생했어요. 다시 시도해주세요.");
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-[720px] mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-6 w-1/4 bg-skeleton" />
        {[1, 2].map((n) => (
          <div key={n} className="h-24 bg-skeleton" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="max-w-[720px] mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center">
        <p className="text-subtle text-[15px]">주문할 상품이 없어요</p>
        <Link
          href="/"
          className="h-11 px-6 bg-white text-black text-sm font-bold hover:bg-cream transition-colors flex items-center"
        >
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 py-8 pb-16">
      <h1 className="text-xl font-bold text-white mb-8">주문서</h1>

      <section className="mb-8">
        <h2 className="text-[13px] text-subtle font-semibold uppercase tracking-widest mb-3">
          주문 상품
        </h2>
        <div className="border border-border divide-y divide-border">
          {rows.map((row) => (
            <div key={row.productId} className="p-4">
              <p className="text-[12px] text-subtle mb-0.5">{row.product.categoryName}</p>
              <p className="text-[14px] text-white font-medium">{row.product.name}</p>
              <div className="mt-2 flex items-center justify-between text-[13px] text-muted">
                <span>
                  {formatPrice(row.product.price)} × {row.quantity}
                </span>
                <span className="text-[15px] text-white font-bold">
                  {formatPrice(row.product.price * row.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit}>
        <section className="mb-8">
          <h2 className="text-[13px] text-subtle font-semibold uppercase tracking-widest mb-3">
            주문자 정보
          </h2>
          <div className="border border-border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <label htmlFor="buyerName" className="w-20 shrink-0 text-sm text-muted">
                이름
              </label>
              <input
                id="buyerName"
                type="text"
                required
                value={form.buyerName}
                onChange={(e) => setForm((prev) => ({ ...prev, buyerName: e.target.value }))}
                className="h-10 flex-1 border border-border-strong bg-card px-3 text-sm text-white placeholder:text-placeholder"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="buyerPhone" className="w-20 shrink-0 text-sm text-muted">
                연락처
              </label>
              <input
                id="buyerPhone"
                type="tel"
                required
                value={form.buyerPhone}
                onChange={(e) => setForm((prev) => ({ ...prev, buyerPhone: e.target.value }))}
                className="h-10 flex-1 border border-border-strong bg-card px-3 text-sm text-white placeholder:text-placeholder"
                placeholder="01012345678"
              />
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="buyerAddress" className="w-20 shrink-0 text-sm text-muted">
                주소
              </label>
              <input
                id="buyerAddress"
                type="text"
                required
                readOnly
                value={form.buyerAddress}
                onClick={() => setShowAddressModal(true)}
                className="h-10 flex-1 border border-border-strong bg-card px-3 text-sm text-white placeholder:text-placeholder cursor-pointer"
                placeholder="주소 검색을 눌러주세요"
              />
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="h-10 shrink-0 border border-border-hover px-3 text-sm text-white transition-colors hover:border-white"
              >
                검색
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="buyerAddressDetail" className="w-20 shrink-0 text-sm text-muted">
                상세주소
              </label>
              <input
                id="buyerAddressDetail"
                type="text"
                value={form.buyerAddressDetail}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, buyerAddressDetail: e.target.value }))
                }
                className="h-10 flex-1 border border-border-strong bg-card px-3 text-sm text-white placeholder:text-placeholder"
                placeholder="상세주소 (선택)"
              />
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-[13px] text-subtle font-semibold uppercase tracking-widest mb-3">
            결제 금액
          </h2>
          <div className="border border-border p-4 space-y-2">
            <div className="flex justify-between text-[14px]">
              <span className="text-muted">상품금액</span>
              <span className="text-white">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-muted">배송비</span>
              <span className="text-white">무료</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-[14px] font-semibold text-white">최종 결제금액</span>
              <span className="text-lg font-black text-white">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </section>

        {error && <p className="mb-3 border border-border-hover px-4 py-3 text-sm text-white">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="h-14 w-full bg-white text-black text-sm font-bold transition-colors hover:bg-cream disabled:opacity-50"
        >
          {submitting ? "처리 중..." : `${formatPrice(totalAmount)} 결제하기`}
        </button>
      </form>

      {showAddressModal && (
        <AddressSearchModal
          onComplete={handleAddressComplete}
          onClose={() => setShowAddressModal(false)}
        />
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[720px] mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-6 w-1/4 bg-skeleton" />
          <div className="h-24 bg-skeleton" />
        </div>
      }
    >
      <OrderPageContent />
    </Suspense>
  );
}
