import Link from "next/link";
import { formatPrice } from "@/lib/format";

type Props = {
  searchParams: Promise<{ orderNumber?: string; amount?: string }>;
};

export default async function OrderCompletePage({ searchParams }: Props) {
  const { orderNumber, amount: amountRaw } = await searchParams;
  const amount = Number(amountRaw);

  if (!orderNumber || !amountRaw || !Number.isFinite(amount)) {
    return (
      <div className="max-w-[720px] mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center">
        <p className="text-subtle text-[15px]">주문 정보를 확인할 수 없어요</p>
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
    <div className="max-w-[720px] mx-auto px-4 py-20 flex flex-col items-center gap-8">
      <h1 className="text-xl font-bold text-white">주문 완료</h1>

      <div className="w-full border border-border divide-y divide-border">
        <div className="flex justify-between p-4 text-[14px]">
          <span className="text-muted">주문번호</span>
          <span className="text-white font-medium">{orderNumber}</span>
        </div>
        <div className="flex justify-between p-4 text-[14px]">
          <span className="text-muted">결제금액</span>
          <span className="text-white font-medium">{formatPrice(amount)}</span>
        </div>
      </div>

      <Link
        href="/"
        className="h-11 px-6 bg-white text-black text-sm font-bold hover:bg-cream transition-colors flex items-center"
      >
        쇼핑 계속하기
      </Link>
    </div>
  );
}
