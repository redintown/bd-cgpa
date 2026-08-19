import type { GradeBand } from "@/types/university";

/**
 * Pure CGPA calculation and validation helpers.
 *
 * This module contains no React and no data access. Grade points are never
 * hardcoded here: callers supply the grade bands that come from a university's
 * active grading policy (sourced from Supabase), and these helpers only look up
 * and arithmetic over those supplied values.
 */

/** Longest accepted course name. */
export const MAX_COURSE_NAME_LENGTH = 100;
/** Largest accepted credit value for a single course. */
export const MAX_COURSE_CREDIT = 12;

export interface CgpaTotals {
  totalCredits: number;
  totalQualityPoints: number;
  cgpa: number;
}

/**
 * Rounds to two decimals, nudging by EPSILON first so values that are only
 * imprecise due to binary floating point (e.g. 11.100000000000001) round the
 * way a human expects and never display as 3.699999.
 */
export function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Formats a value to a fixed two-decimal string, e.g. 3.85 => "3.85". */
export function formatTwoDecimals(value: number): string {
  return roundToTwo(value).toFixed(2);
}

/** Formats a credit total without trailing zeros, e.g. 6 => "6", 4.5 => "4.5". */
export function formatCredits(value: number): string {
  return String(roundToTwo(value));
}

/** Builds a letter → grade point lookup from the supplied grade bands. */
export function buildGradePointLookup(
  gradeBands: readonly GradeBand[],
): Map<string, number> {
  return new Map(gradeBands.map((band) => [band.letter, band.gradePoint]));
}

/**
 * Sums credits and quality points for already-validated courses.
 *
 * quality points = credit × grade point (per course)
 * CGPA           = Σ quality points / Σ credits
 *
 * With no credits the CGPA is `0`; callers decide whether that should be shown
 * (it should not be presented as a real result).
 */
export function calculateTotals(
  courses: readonly { credit: number; gradePoint: number }[],
): CgpaTotals {
  let totalCredits = 0;
  let totalQualityPoints = 0;

  for (const course of courses) {
    totalCredits += course.credit;
    totalQualityPoints += course.credit * course.gradePoint;
  }

  const cgpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

  return { totalCredits, totalQualityPoints, cgpa };
}
