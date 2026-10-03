import Link from "next/link";
import RetryButton from "@/components/RetryButton";

type Props = {
  searchParams: Promise<{ code?: string; message?: string; orderId?: string }>;
};

export default async function PaymentFailPage({ searchParams }: Props) {
  const { code, message } = await searchParams;

  return (
    <div className="max-w-[720px] mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center">
      <div>
        <h1 className="text-xl font-bold text-white mb-3">결제가 취소됐어요</h1>
        <p className="text-sm text-muted">{message || "결제가 취소되었거나 실패했습니다."}</p>
        {code && <p className="mt-1 text-xs text-faint">{code}</p>}
      </div>
      <div className="flex items-center gap-3">
        <RetryButton />
        <Link
          href="/"
          className="h-11 px-6 border border-border-hover text-sm text-white transition-colors hover:border-white flex items-center"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
