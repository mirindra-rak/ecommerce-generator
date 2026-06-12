import Link from "next/link";
import { getRootCategories } from "@/lib/catalog";

// Univers parapharmacie réels (catégories racines du module catalog, lot 4.1).
// Emoji décoratif mappé par slug, avec repli neutre.
const EMOJI_BY_SLUG: Record<string, string> = {
  "visage-soin": "🧴",
  "corps-bain": "🛁",
  cheveux: "💆",
  "complements-alimentaires": "💊",
  "maman-bebe": "🍼",
  solaires: "☀️",
};

export async function CategoryGrid() {
  const categories = await getRootCategories();
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Nos univers</h2>
          <p className="mt-1 text-sm text-muted">Trouvez le bon produit, par catégorie.</p>
        </div>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <li key={cat.slug}>
            <Link
              href={`/categorie/${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-surface p-5 text-center transition-all hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-md"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-2xl transition-colors group-hover:bg-brand-600/10">
                {EMOJI_BY_SLUG[cat.slug] ?? "🧪"}
              </span>
              <span className="text-sm font-medium text-foreground">{cat.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
