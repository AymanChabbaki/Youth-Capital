export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents (é -> e)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/**
 * Appends -2, -3, ... to the base slug until `isTaken` reports it's free.
 * `isTaken` should exclude the current row's own id when regenerating a slug
 * for an existing article, or every collision looks taken forever.
 */
export async function generateUniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = slugify(base) || "article";
  let slug = baseSlug;
  let suffix = 2;
  while (await isTaken(slug)) {
    slug = `${baseSlug}-${suffix++}`;
  }
  return slug;
}
