import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const { category } = await searchParams;
  const activeId = category ? Number(category) : 0;

  const products = await api.products.list();
  const filtered =
    activeId === 0 ? products : products.filter((p) => p.categoryId === activeId);

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      <section
        className="relative w-full mt-6 flex items-end overflow-hidden bg-surface"
        style={{ height: "280px" }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #ffffff10 0, #ffffff10 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 p-8">
          <p className="text-muted text-sm font-medium tracking-widest uppercase mb-2">
            New Collection
          </p>
          <h1 className="text-white text-4xl font-black leading-tight tracking-tight">
            뚱이 &amp; 요미
            <br />
            굿즈 컬렉션
          </h1>
          <p className="text-muted text-sm mt-3">두 강아지의 사진으로 만든 특별한 굿즈</p>
        </div>
      </section>

      <CategoryFilter activeId={activeId} countsById={{ 0: products.length }} />

      <section className="mt-6 mb-16">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] text-subtle">
            총 <span className="text-white font-semibold">{filtered.length}</span>개
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-faint text-sm">
            해당 카테고리의 상품이 없습니다.
          </div>
        )}
      </section>
    </div>
  );
}
