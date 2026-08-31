// One-off migration: populate `slug` for every article that doesn't have one
// yet (pre-existing rows from before the slug column was added). Safe to
// re-run — it only touches rows where slug IS NULL.
import { db } from "@workspace/db";
import { articlesTable } from "@workspace/db/schema";
import { isNull, eq } from "drizzle-orm";

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

async function isTaken(slug: string): Promise<boolean> {
  const [existing] = await db.select({ id: articlesTable.id }).from(articlesTable).where(eq(articlesTable.slug, slug));
  return !!existing;
}

async function backfill() {
  const rows = await db.select().from(articlesTable).where(isNull(articlesTable.slug));
  console.log(`Found ${rows.length} article(s) without a slug.`);

  for (const row of rows) {
    const baseSlug = slugify(row.title) || `article-${row.id}`;
    let slug = baseSlug;
    let suffix = 2;
    while (await isTaken(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }
    await db.update(articlesTable).set({ slug }).where(eq(articlesTable.id, row.id));
    console.log(`  #${row.id} "${row.title}" -> ${slug}`);
  }

  console.log("Done.");
}

backfill()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
