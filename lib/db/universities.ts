import { createClient } from "@/lib/supabase/server";
import type {
  Division,
  GradeBand,
  GradingPolicy,
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
 *   grade_bands(id, grading_policy_id, letter, grade_point, min_mark, max_mark,
 *               remark, sort_order)
 *
 * This module performs no writes; INSERT/UPDATE/DELETE are out of scope and
 * must be protected by RLS at the database level.
 */

interface GradeBandRow {
  letter: string;
  grade_point: number;
  min_mark: number | null;
  max_mark: number | null;
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
      min_mark,
      max_mark,
      remark,
      sort_order
    )
  )
`;

function mapGradeBand(row: GradeBandRow): GradeBand {
  return {
    letter: row.letter,
    gradePoint: row.grade_point,
    ...(row.min_mark !== null ? { minMark: row.min_mark } : {}),
    ...(row.max_mark !== null ? { maxMark: row.max_mark } : {}),
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
    gradeBands: (row.grade_bands ?? []).map(mapGradeBand),
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
        min_mark,
        max_mark,
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
