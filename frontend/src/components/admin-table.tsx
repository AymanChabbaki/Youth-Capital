import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const PAGE_SIZE = 10;

// Must match AGE_RANGES in backend/src/routes/sahara.ts
export const AGE_RANGES = ["Under 18", "18-24", "25-34", "35-44", "45+", "Prefer not to say"] as const;
export const GENDERS = ["Male", "Female", "Prefer not to say"] as const;

export function ageRangeOf(age: number | null | undefined): string {
  if (age == null || Number.isNaN(Number(age))) return "Prefer not to say";
  const a = Number(age);
  if (a < 18) return "Under 18";
  if (a <= 24) return "18-24";
  if (a <= 34) return "25-34";
  if (a <= 44) return "35-44";
  return "45+";
}

// Case- and accent-insensitive A→Z comparator; empty values sort last.
export function byText<T>(get: (item: T) => string | null | undefined) {
  return (a: T, b: T) => {
    const x = (get(a) || "").trim();
    const y = (get(b) || "").trim();
    if (!x && y) return 1;
    if (x && !y) return -1;
    return x.localeCompare(y, undefined, { sensitivity: "base", numeric: true });
  };
}

export function sortedAZ<T>(items: T[] | undefined | null, get: (item: T) => string | null | undefined): T[] {
  return [...(items || [])].sort(byText(get));
}

export function uniqueSorted(values: (string | null | undefined)[]): string[] {
  return sortedAZ(Array.from(new Set(values.map((v) => v?.trim()).filter(Boolean) as string[])), (v) => v);
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    page: current,
    totalPages,
    total: items.length,
    pageSize,
  };
}

export function Pagination({ page, totalPages, total, pageSize = PAGE_SIZE, onChange }: {
  page: number; totalPages: number; total: number; pageSize?: number; onChange: (page: number) => void;
}) {
  const { t } = useLanguage();
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Compact page list: first, last, and a window around the current page.
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  const btn = "min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed";
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap px-6 py-3 border-t border-border bg-secondary/20">
      <span className="text-xs text-muted-foreground">
        {from}–{to} {t("of", "من")} {total}
      </span>
      <div className="flex items-center gap-1">
        <button type="button" className={`${btn} hover:bg-secondary`} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label={t("Previous page", "الصفحة السابقة")}>
          <ChevronLeft className="w-4 h-4 mx-auto rtl:rotate-180" />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
          ) : (
            <button
              type="button"
              key={p}
              onClick={() => onChange(p)}
              className={`${btn} ${p === page ? "bg-primary text-white" : "hover:bg-secondary text-foreground/80"}`}
            >
              {p}
            </button>
          )
        )}
        <button type="button" className={`${btn} hover:bg-secondary`} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label={t("Next page", "الصفحة التالية")}>
          <ChevronRight className="w-4 h-4 mx-auto rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
