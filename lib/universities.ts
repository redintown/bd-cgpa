import { universities } from "@/data/universities";
import type { GradingPolicy, University } from "@/types/university";

/**
 * Data-access layer for universities.
 *
 * UI components must go through these accessors instead of importing the raw
 * dataset directly. This keeps the storage detail (currently a static array,
 * later a Supabase/PostgreSQL query) behind a stable interface.
 */

/** Returns all universities. */
export function getAllUniversities(): readonly University[] {
  return universities;
}

/** Returns the number of universities currently available. */
export function getUniversityCount(): number {
  return universities.length;
}

/** Returns every university slug (useful for `generateStaticParams`/sitemap). */
export function getUniversitySlugs(): string[] {
  return universities.map((university) => university.slug);
}

/** Finds a university by its slug, or `undefined` if not found. */
export function getUniversityBySlug(slug: string): University | undefined {
  return universities.find((university) => university.slug === slug);
}

/** Returns the currently active grading policy for a university, if any. */
export function getActiveGradingPolicy(
  university: University,
): GradingPolicy | undefined {
  return university.gradingPolicies.find((policy) => policy.isActive);
}
