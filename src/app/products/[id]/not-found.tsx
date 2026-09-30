import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-24 text-center">
      <p className="text-lg font-semibold text-white">상품을 찾을 수 없습니다</p>
      <p className="mt-2 text-sm text-subtle">
        삭제되었거나 존재하지 않는 상품이에요.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block border border-border-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-border-hover"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
