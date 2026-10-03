"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart";

type Props = {
  productId: number;
  price: number;
};

export default function ProductActions({ productId, price }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => q + 1);

  const handleAddToCart = () => {
    addItem(productId, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    router.push(`/order?productId=${productId}&quantity=${quantity}`);
  };

  return (
    <div data-product-id={productId}>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">수량</span>
        <div className="flex items-center border border-border">
          <button
            type="button"
            onClick={decrease}
            className="h-8 w-8 text-white transition-colors hover:bg-surface"
            aria-label="수량 감소"
          >
            −
          </button>
          <span className="w-10 text-center text-sm text-white">{quantity}</span>
          <button
            type="button"
            onClick={increase}
            className="h-8 w-8 text-white transition-colors hover:bg-surface"
            aria-label="수량 증가"
          >
            +
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-subtle">
        합계{" "}
        <span className="font-semibold text-white">{formatPrice(price * quantity)}</span>
      </p>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className="h-12 flex-1 border border-border-strong text-sm font-semibold text-white transition-colors hover:border-border-hover"
        >
          {addedToCart ? "✓ 담겼어요" : "장바구니 담기"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="h-12 flex-1 bg-white text-sm font-semibold text-black transition-colors hover:bg-cream"
        >
          바로 구매
        </button>
      </div>
    </div>
  );
}
