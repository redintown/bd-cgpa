import type { University } from "@/types/university";

/**
 * The raw university dataset.
 *
 * This is intentionally EMPTY. No universities or grading policies are added
 * until they can be sourced from an official document and verified (see the
 * `VerifiedSource` requirement on grading policies).
 *
 * Do not import this array directly from UI components. Access it only through
 * the accessors in `lib/universities.ts`.
 */
export const universities: readonly University[] = [];
