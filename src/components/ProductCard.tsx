import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ApiProduct } from "@/lib/api";

type Props = {
  product: ApiProduct;
};

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="flex aspect-square w-full flex-col justify-between border border-border bg-card p-4 transition-colors group-hover:border-border-hover">
        <p className="text-[13px] text-subtle">{product.categoryName}</p>
        <p className="text-[15px] font-medium leading-snug text-white line-clamp-3">
          {product.name}
        </p>
      </div>

      <div className="mt-2.5">
        <p className="text-[15px] font-bold text-white">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
