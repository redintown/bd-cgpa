/**
 * Core domain model for BD CGPA.
 *
 * These types describe universities and their official academic grading
 * policies. They are intentionally shaped to map cleanly onto a future
 * relational (Supabase/PostgreSQL) schema, where each interface below
 * corresponds to a table and the string ids correspond to primary keys.
 *
 * Data accuracy rule: any academic policy MUST carry a verifiable source
 * (`sourceUrl`) and a `verifiedAt` date. This is enforced at the type level
 * via the `VerifiedSource` interface so unverifiable data cannot be modelled.
 */

/** ISO 8601 date string, e.g. "2026-01-31" or a full timestamp. */
export type IsoDateString = string;

/** The eight official administrative divisions of Bangladesh. */
export type Division =
  | "Barishal"
  | "Chattogram"
  | "Dhaka"
  | "Khulna"
  | "Mymensingh"
  | "Rajshahi"
  | "Rangpur"
  | "Sylhet";

/** Governance/funding type of a university. */
export type UniversityType = "public" | "private";

/**
 * Every piece of academic information must be traceable to an official
 * source and carry the date it was last verified against that source.
 */
export interface VerifiedSource {
  /** URL of the official document/page the information was taken from. */
  sourceUrl: string;
  /** Date the information was last verified against `sourceUrl`. */
  verifiedAt: IsoDateString;
  /** Optional human/handle who performed the verification. */
  verifiedBy?: string;
}

/**
 * A single row of a grading table, e.g. "A+" => 4.00 for marks 80-100.
 * Maps to a `grade_bands` table (foreign key: grading_policy_id).
 */
export interface GradeBand {
  /** Letter grade, e.g. "A+", "A", "B-", "F". */
  letter: string;
  /** Grade point awarded for this band, e.g. 4.0. */
  gradePoint: number;
  /** Inclusive lower bound of the marks range, if the policy defines one. */
  minMark?: number;
  /** Inclusive upper bound of the marks range, if the policy defines one. */
  maxMark?: number;
  /** Optional qualitative remark, e.g. "Outstanding", "Fail". */
  remark?: string;
  /** Explicit ordering for display (highest grade first, etc.). */
  sortOrder?: number;
}

/**
 * A versioned grading policy for a university. A university may have several
 * policies over time; exactly one should be marked `isActive`.
 * Maps to a `grading_policies` table (foreign key: university_id).
 */
export interface GradingPolicy extends VerifiedSource {
  /** Stable identifier (primary key in the future database). */
  id: string;
  /** Human-readable name, e.g. "Undergraduate 4.00 scale". */
  name: string;
  /** Maximum point of the scale, e.g. 4.0. */
  scaleMax: number;
  /** The rows of the grading table. */
  gradeBands: readonly GradeBand[];
  /** Whether this is the currently effective policy. */
  isActive: boolean;
  /** Date this policy took effect, if known. */
  effectiveFrom?: IsoDateString;
  /** Date this policy stopped being effective, if superseded. */
  effectiveTo?: IsoDateString;
  /** Optional notes/caveats about the policy. */
  notes?: string;
}

/**
 * A Bangladeshi university and its grading policies.
 * Maps to a `universities` table.
 */
export interface University {
  /** Stable identifier (primary key in the future database). */
  id: string;
  /** URL-safe unique identifier used in routes, e.g. "buet". */
  slug: string;
  /** Full official name, e.g. "Bangladesh University of Engineering and Technology". */
  name: string;
  /** Common short name/abbreviation, e.g. "BUET". */
  shortName: string;
  /** City where the main campus is located. */
  city: string;
  /** Administrative division. */
  division: Division;
  /** Governance type. */
  type: UniversityType;
  /** Official website URL. */
  website: string;
  /** Optional logo URL. */
  logoUrl?: string;
  /** Grading policies (current and historical). */
  gradingPolicies: readonly GradingPolicy[];
}
