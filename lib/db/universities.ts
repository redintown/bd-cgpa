import { createClient } from "@/lib/supabase/server";
import type {
  Division,
  GradeBand,
  GradingPolicy,
  IsoDateString,
  University,
  UniversityType,
} from "@/types/university";

/**
 * Server-side database access layer for universities (read-only).
 *
 * These functions query Supabase and map the relational rows onto the existing
 * domain model in `types/university.ts`. They are the Supabase counterpart of
 * the static accessors in `lib/universities.ts`, which are intentionally kept
 * in place for a safe transition.
 *
 * Expected schema (snake_case columns):
 *   universities(id, slug, name, short_name, city, division, type, website,
 *                logo_url)
 *   grading_policies(id, university_id, name, scale_max, is_active,
 *                    effective_from, effective_to, notes, source_url,
 *                    verified_at, verified_by)
 *   grade_bands(id, grading_policy_id, letter, grade_point, min_marks,
 *               max_marks, remark, sort_order)
 *
 * This module performs no writes; INSERT/UPDATE/DELETE are out of scope and
 * must be protected by RLS at the database level.
 */

interface GradeBandRow {
  letter: string;
  grade_point: number;
  min_marks: number | null;
  max_marks: number | null;
  remark: string | null;
  sort_order: number | null;
}

interface GradingPolicyRow {
  id: string;
  name: string;
  scale_max: number;
  is_active: boolean;
  effective_from: string | null;
  effective_to: string | null;
  notes: string | null;
  source_url: string;
  verified_at: string;
  verified_by: string | null;
  grade_bands: GradeBandRow[] | null;
}

interface UniversityRow {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  city: string;
  division: Division;
  type: UniversityType;
  website: string;
  logo_url: string | null;
  grading_policies: GradingPolicyRow[] | null;
}

const UNIVERSITY_SELECT = `
  id,
  slug,
  name,
  short_name,
  city,
  division,
  type,
  website,
  logo_url,
  grading_policies (
    id,
    name,
    scale_max,
    is_active,
    effective_from,
    effective_to,
    notes,
    source_url,
    verified_at,
    verified_by,
    grade_bands (
      letter,
      grade_point,
      min_marks,
      max_marks,
      remark,
      sort_order
    )
  )
`;

function mapGradeBand(row: GradeBandRow): GradeBand {
  return {
    letter: row.letter,
    gradePoint: row.grade_point,
    ...(row.min_marks !== null ? { minMark: row.min_marks } : {}),
    ...(row.max_marks !== null ? { maxMark: row.max_marks } : {}),
    ...(row.remark !== null ? { remark: row.remark } : {}),
    ...(row.sort_order !== null ? { sortOrder: row.sort_order } : {}),
  };
}

function mapGradingPolicy(row: GradingPolicyRow): GradingPolicy {
  return {
    id: row.id,
    name: row.name,
    scaleMax: row.scale_max,
    isActive: row.is_active,
    gradeBands: (row.grade_bands ?? [])
      .map(mapGradeBand)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    sourceUrl: row.source_url,
    verifiedAt: row.verified_at,
    ...(row.effective_from !== null ? { effectiveFrom: row.effective_from } : {}),
    ...(row.effective_to !== null ? { effectiveTo: row.effective_to } : {}),
    ...(row.notes !== null ? { notes: row.notes } : {}),
    ...(row.verified_by !== null ? { verifiedBy: row.verified_by } : {}),
  };
}

function mapUniversity(row: UniversityRow): University {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    city: row.city,
    division: row.division,
    type: row.type,
    website: row.website,
    ...(row.logo_url !== null ? { logoUrl: row.logo_url } : {}),
    gradingPolicies: (row.grading_policies ?? []).map(mapGradingPolicy),
  };
}

/** Returns all universities with their grading policies. */
export async function getUniversities(): Promise<University[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("universities")
    .select(UNIVERSITY_SELECT)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load universities: ${error.message}`);
  }

  return ((data ?? []) as unknown as UniversityRow[]).map(mapUniversity);
}

/** A slim university record returned by search (no grading data). */
export interface UniversitySearchResult {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  city: string;
}

const SEARCH_RESULT_LIMIT = 20;

/**
 * Case-insensitive search over `name`, `short_name` and `slug`.
 *
 * The filtering happens in the database; only the slim fields needed to render
 * a result row are selected. An empty or whitespace-only query returns an empty
 * array without hitting the database.
 *
 * The trimmed query is embedded in a PostgREST `.or()` filter, which is used
 * as-is by the client and must therefore be sanitized by us. We strip the
 * characters that are structural in that syntax (`,` `(` `)`), the SQL/PostgREST
 * `LIKE` wildcards (`%` `_` `*`) and the backslash escape, so the term can only
 * ever be matched as a literal case-insensitive substring — this prevents
 * filter/SQL injection.
 */
export async function searchUniversities(
  query: string,
): Promise<UniversitySearchResult[]> {
  const trimmed = query.trim();
  if (trimmed === "") {
    return [];
  }

  const term = trimmed
    .replace(/[\\,()%_*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (term === "") {
    return [];
  }

  const pattern = `%${term}%`;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("universities")
    .select("id, slug, name, short_name, city")
    .or(
      `name.ilike.${pattern},short_name.ilike.${pattern},slug.ilike.${pattern}`,
    )
    .order("name", { ascending: true })
    .order("slug", { ascending: true })
    .limit(SEARCH_RESULT_LIMIT);

  if (error) {
    throw new Error(`Failed to search universities: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    city: row.city,
  }));
}

/** Returns a single university by slug, or `null` if not found. */
export async function getUniversityBySlug(
  slug: string,
): Promise<University | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("universities")
    .select(UNIVERSITY_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load university "${slug}": ${error.message}`);
  }

  return data ? mapUniversity(data as unknown as UniversityRow) : null;
}

/** A published university route, used to build the sitemap. */
export interface UniversityRoute {
  slug: string;
  /** Timestamp of the last change to the university row. */
  updatedAt: IsoDateString;
}

/** Returns every university slug with its last-modified timestamp. */
export async function getUniversityRoutes(): Promise<UniversityRoute[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("universities")
    .select("slug, updated_at")
    .order("slug", { ascending: true });

  if (error) {
    throw new Error(`Failed to load university routes: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    slug: row.slug,
    updatedAt: row.updated_at,
  }));
}

/** Returns the active grading policy for a university, or `null` if none. */
export async function getActiveGradingPolicy(
  universityId: string,
): Promise<GradingPolicy | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grading_policies")
    .select(
      `
      id,
      name,
      scale_max,
      is_active,
      effective_from,
      effective_to,
      notes,
      source_url,
      verified_at,
      verified_by,
      grade_bands (
        letter,
        grade_point,
        min_marks,
        max_marks,
        remark,
        sort_order
      )
    `,
    )
    .eq("university_id", universityId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load active grading policy for "${universityId}": ${error.message}`,
    );
  }

  return data ? mapGradingPolicy(data as unknown as GradingPolicyRow) : null;
}
