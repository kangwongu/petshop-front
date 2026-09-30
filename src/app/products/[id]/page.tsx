import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import ProductActions from "@/components/ProductActions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId)) notFound();

  const product = await api.products.get(productId).catch(() => null);
  if (!product) notFound();

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <nav className="mb-6 text-[13px] text-subtle">
        <Link href="/" className="hover:text-muted">
          홈
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-muted">{product.categoryName}</span>
      </nav>

      <div className="max-w-[480px]">
        <p className="text-[13px] text-subtle">{product.categoryName}</p>
        <h1 className="mt-1 text-2xl font-bold text-white">{product.name}</h1>
        <p className="mt-3 text-xl font-bold text-white">{formatPrice(product.price)}</p>

        <div className="mt-8 border-t border-border pt-8">
          <ProductActions productId={product.id} price={product.price} />
        </div>
      </div>
    </div>
  );
}
