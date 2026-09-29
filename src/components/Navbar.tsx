"use client";

import Link from "next/link";

// TODO(Phase 2): 실제 카트 개수는 lib/store/cart.ts(Zustand)에서 구독한다. 지금은 디자인 확인용 placeholder.
export default function Navbar() {
  const cartCount = 0;

  return (
    <header className="sticky top-0 z-50 bg-bg border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-white font-black text-lg tracking-tight">
          뚱이요미 샵
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span>장바구니</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
