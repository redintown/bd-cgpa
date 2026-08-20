import { createClient } from "@/lib/supabase/server";
import type { Division, UniversityType } from "@/types/university";
import type { UniversityInput } from "@/lib/validation/university";

/**
 * Server-side write/read helpers for admin university management.
 *
 * Writes go through the cookie-bound publishable-key client. Authorization is
 * enforced twice: the caller must have already verified the admin session, and
 * RLS (`public.is_admin()`) is the database-level gate. No service-role key is
 * used. DELETE is intentionally not implemented in this step.
 */

export interface AdminUniversityRecord {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  city: string;
  division: Division;
  type: UniversityType;
  website: string;
}

interface UniversityWriteRow {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  city: string;
  division: Division;
  type: UniversityType;
  website: string;
}

const ADMIN_UNIVERSITY_SELECT =
  "id, slug, name, short_name, city, division, type, website";

function mapRecord(row: UniversityWriteRow): AdminUniversityRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    city: row.city,
    division: row.division,
    type: row.type,
    website: row.website,
  };
}

function toRow(input: UniversityInput) {
  return {
    slug: input.slug,
    name: input.name,
    short_name: input.shortName,
    city: input.city,
    division: input.division,
    type: input.type,
    website: input.website,
  };
}

export type AdminWriteErrorCode =
  | "duplicate_slug"
  | "not_found"
  | "unauthorized"
  | "unknown";

export interface AdminWriteError {
  code: AdminWriteErrorCode;
}

export type AdminWriteResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AdminWriteError };

function classifyWriteError(error: { code?: string; message: string }): AdminWriteErrorCode {
  if (error.code === "23505") {
    return "duplicate_slug";
  }
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return "unauthorized";
  }
  return "unknown";
}

/** Lists universities for the admin table (no nested grading data). */
export async function listUniversitiesForAdmin(): Promise<AdminUniversityRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("universities")
    .select(ADMIN_UNIVERSITY_SELECT)
    .order("name", { ascending: true })
    .order("slug", { ascending: true });

  if (error) {
    throw new Error(`Failed to list universities: ${error.message}`);
  }

  return ((data ?? []) as UniversityWriteRow[]).map(mapRecord);
}

export async function getUniversityByIdForAdmin(
  id: string,
): Promise<AdminUniversityRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("universities")
    .select(ADMIN_UNIVERSITY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load university: ${error.message}`);
  }

  return data ? mapRecord(data as UniversityWriteRow) : null;
}

export async function slugExists(
  slug: string,
  exceptId?: string,
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from("universities")
    .select("id")
    .eq("slug", slug);

  if (exceptId) {
    query = query.neq("id", exceptId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Failed to check slug: ${error.message}`);
  }

  return data !== null;
}

export async function createUniversity(
  input: UniversityInput,
): Promise<AdminWriteResult<AdminUniversityRecord>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("universities")
    .insert(toRow(input))
    .select(ADMIN_UNIVERSITY_SELECT)
    .single();

  if (error) {
    console.error("Failed to create university:", error.message);
    return { ok: false, error: { code: classifyWriteError(error) } };
  }

  return { ok: true, data: mapRecord(data as UniversityWriteRow) };
}

export async function updateUniversity(
  id: string,
  input: UniversityInput,
): Promise<AdminWriteResult<AdminUniversityRecord>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("universities")
    .update(toRow(input))
    .eq("id", id)
    .select(ADMIN_UNIVERSITY_SELECT)
    .maybeSingle();

  if (error) {
    console.error("Failed to update university:", error.message);
    return { ok: false, error: { code: classifyWriteError(error) } };
  }

  if (!data) {
    return { ok: false, error: { code: "not_found" } };
  }

  return { ok: true, data: mapRecord(data as UniversityWriteRow) };
}
