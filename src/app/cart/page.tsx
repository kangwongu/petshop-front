"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { api, type ApiProduct } from "@/lib/api";
import { formatPrice } from "@/lib/format";

type CartRow = { productId: number; quantity: number; product: ApiProduct };

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const itemsKey = items.map((item) => `${item.productId}:${item.quantity}`).join(",");
  const [fetchedRows, setFetchedRows] = useState<CartRow[]>([]);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated || items.length === 0) return;

    let cancelled = false;

    Promise.all(
      items.map((item) =>
        api.products
          .get(item.productId)
          .then((product) => ({ ...item, product }))
          .catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return;
      setFetchedRows(results.filter((row): row is CartRow => row !== null));
      setFetchedKey(itemsKey);
    });

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, items, itemsKey]);

  const rows = items.length === 0 ? [] : fetchedRows;
  const totalAmount = rows.reduce((sum, row) => sum + row.product.price * row.quantity, 0);
  const isLoading = !hasHydrated || (items.length > 0 && fetchedKey !== itemsKey);

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
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-placeholder"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <p className="text-subtle text-[15px]">장바구니가 비어있어요</p>
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
      <h1 className="text-xl font-bold text-white mb-8">
        장바구니 <span className="text-subtle text-base font-normal">{rows.length}</span>
      </h1>

      <section className="mb-8 border border-border divide-y divide-border">
        {rows.map((row) => (
          <div key={row.productId} className="p-4 flex gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-subtle mb-0.5">{row.product.categoryName}</p>
              <Link
                href={`/products/${row.productId}`}
                className="text-[14px] text-white font-medium hover:text-muted transition-colors line-clamp-2"
              >
                {row.product.name}
              </Link>
              <p className="text-[13px] text-muted mt-0.5">{formatPrice(row.product.price)}</p>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center border border-border-strong">
                  <button
                    type="button"
                    onClick={() => updateQuantity(row.productId, row.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-muted hover:text-white hover:bg-skeleton transition-colors"
                    aria-label="수량 감소"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-white text-sm">{row.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(row.productId, row.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-muted hover:text-white hover:bg-skeleton transition-colors"
                    aria-label="수량 증가"
                  >
                    +
                  </button>
                </div>
                <span className="text-[15px] text-white font-bold">
                  {formatPrice(row.product.price * row.quantity)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeItem(row.productId)}
              className="flex-shrink-0 self-start text-faint hover:text-white transition-colors mt-0.5"
              aria-label="삭제"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
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

      <div className="flex gap-3">
        <Link
          href="/"
          className="flex-1 h-14 border border-border-hover text-white text-sm font-semibold hover:border-white transition-colors flex items-center justify-center"
        >
          쇼핑 계속하기
        </Link>
        <button
          type="button"
          // TODO(Phase 3): router.push("/order?from=cart")
          onClick={() => {}}
          className="flex-1 h-14 bg-white text-black text-sm font-bold hover:bg-cream transition-colors"
        >
          {formatPrice(totalAmount)} 주문하기
        </button>
      </div>
    </div>
  );
}
