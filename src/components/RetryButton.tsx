"use client";

import { useRouter } from "next/navigation";

export default function RetryButton() {
  const router = useRouter();

  // 바로구매(/order?productId=&quantity=)는 쿼리가 히스토리에 남아 back()만으로 동일 주문서로 복귀한다.
  // 카트 경로는 주문 생성 시 이미 카트가 비워져 있어 back() 후 기존 빈 상태 UI로 자연스럽게 저하된다.
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="h-11 px-6 bg-white text-black text-sm font-bold hover:bg-cream transition-colors"
    >
      다시 시도하기
    </button>
  );
}
