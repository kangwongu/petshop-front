import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

type Props = {
  activeId: number;
  countsById: Record<number, number>;
};

// Server Component: 클릭 시 URL(?category=)이 바뀌고 서버가 새 searchParams로 재렌더링한다.
export default function CategoryFilter({ activeId, countsById }: Props) {
  return (
    <section className="mt-8 border-b border-border">
      <div className="flex gap-0">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.id === 0 ? "/" : `/?category=${cat.id}`}
            className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-[2px] ${
              activeId === cat.id
                ? "text-white border-white"
                : "text-subtle border-transparent hover:text-muted"
            }`}
          >
            {cat.name}
            {cat.id === 0 && (
              <span className="ml-1.5 text-[11px] text-faint">{countsById[0] ?? 0}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
