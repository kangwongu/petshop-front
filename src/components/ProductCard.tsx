import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { DemoProduct } from "@/lib/demo-products";

type Props = {
  product: DemoProduct;
};

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative w-full aspect-square overflow-hidden bg-card">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />

        {product.tag && (
          <span className="absolute top-2 left-2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 tracking-tight z-10">
            {product.tag}
          </span>
        )}

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      <div className="mt-2.5 space-y-0.5">
        <p className="text-[13px] text-muted font-medium">{product.model}</p>
        <p className="text-[14px] text-white font-medium leading-snug line-clamp-2">
          {product.name}
        </p>
        <p className="text-[15px] text-white font-bold mt-1">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
