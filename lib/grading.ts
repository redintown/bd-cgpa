import type { GradeBand, IsoDateString } from "@/types/university";

/**
 * Presentation helpers for grading data.
 *
 * These only reformat values that already come from a verified source; they
 * never derive, infer or fill in missing academic information.
 */

/**
 * Renders a grade band's marks range.
 *
 * `maxMark` is an exclusive upper bound, so `{ minMark: 85, maxMark: 90 }`
 * reads "85 to below 90". A missing bound means the policy defines none on
 * that side: "90+" for an open top band, "Below 45" for an open bottom band.
 */
export function formatMarksRange(band: GradeBand): string | null {
  const { minMark, maxMark } = band;

  if (minMark !== undefined && maxMark !== undefined) {
    return `${minMark} to below ${maxMark}`;
  }
  if (minMark !== undefined) {
    return `${minMark}+`;
  }
  if (maxMark !== undefined) {
    return `Below ${maxMark}`;
  }
  return null;
}

/** Renders a grade point on a fixed two-decimal scale, e.g. `3.7` => "3.70". */
export function formatGradePoint(gradePoint: number): string {
  return gradePoint.toFixed(2);
}

/** Renders a scale maximum, e.g. `4` => "4.00". */
export function formatScaleMax(scaleMax: number): string {
  return scaleMax.toFixed(2);
}

// Verification dates are recorded against Bangladesh local time, so they are
// formatted in that zone to avoid showing the previous day to any reader.
const verificationDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Dhaka",
});

/** Renders a verification date, falling back to the raw value if unparseable. */
export function formatVerificationDate(value: IsoDateString): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : verificationDateFormatter.format(date);
}
