import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

type Props = {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
};

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="max-w-[720px] mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center">
      <p className="mb-3 border border-border-hover px-4 py-3 text-sm text-white">{message}</p>
      <Link
        href="/"
        className="h-11 px-6 bg-white text-black text-sm font-bold hover:bg-cream transition-colors flex items-center"
      >
        홈으로
      </Link>
    </div>
  );
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { paymentKey, orderId: orderNumber, amount: amountRaw } = await searchParams;
  const amount = Number(amountRaw);

  if (!paymentKey || !orderNumber || !amountRaw || !Number.isFinite(amount)) {
    return <ErrorBanner message="결제 정보를 확인할 수 없어요." />;
  }

  let payment;
  try {
    payment = await api.payments.confirm({ paymentKey, orderId: orderNumber, amount });
  } catch {
    payment = null;
  }

  if (!payment || payment.status !== "PAID") {
    return <ErrorBanner message="결제 승인에 실패했어요. 다시 시도해주세요." />;
  }

  redirect(`/order/complete?orderNumber=${encodeURIComponent(orderNumber)}&amount=${amount}`);
}
