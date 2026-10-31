// Demographic helpers shared by the admin dashboard and its statistics page.

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

export function uniqueSorted(values: (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.map((v) => v?.trim()).filter(Boolean) as string[]))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));
}
