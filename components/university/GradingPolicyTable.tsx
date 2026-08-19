import { formatGradePoint, formatMarksRange } from "@/lib/grading";
import type { GradeBand } from "@/types/university";

interface GradingPolicyTableProps {
  gradeBands: readonly GradeBand[];
  /** Accessible caption, e.g. "IUB Uniform Grading System". */
  caption: string;
}

/**
 * Renders the rows of a grading policy as an accessible data table.
 *
 * Marks ranges are formatted from the stored bounds; open-ended bands read
 * "90+" or "Below 45" rather than inventing a missing boundary.
 */
export function GradingPolicyTable({
  gradeBands,
  caption,
}: GradingPolicyTableProps) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="w-full overflow-x-auto rounded-xl border border-black/[.08] bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/[.145] dark:bg-black"
    >
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-black/[.08] bg-zinc-50 dark:border-white/[.145] dark:bg-white/[.03]">
            <th scope="col" className="px-4 py-3 font-medium text-foreground">
              Letter grade
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-foreground">
              Marks (%)
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right font-medium text-foreground"
            >
              Grade point
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-foreground">
              Remark
            </th>
          </tr>
        </thead>
        <tbody>
          {gradeBands.map((band) => {
            const marks = formatMarksRange(band);

            return (
              <tr
                key={band.letter}
                className="border-b border-black/[.06] last:border-b-0 dark:border-white/[.09]"
              >
                <th
                  scope="row"
                  className="px-4 py-3 font-semibold text-foreground"
                >
                  {band.letter}
                </th>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                  {marks ?? "Not specified"}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                  {formatGradePoint(band.gradePoint)}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {band.remark ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
