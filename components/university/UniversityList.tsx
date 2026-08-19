import type { University } from "@/types/university";
import { UniversityEmptyState } from "@/components/university/UniversityEmptyState";

interface UniversityListProps {
  universities: readonly University[];
}

/**
 * Renders the list of universities, or an empty state when none exist.
 *
 * This is a presentational component: it receives data as a prop and never
 * reads the raw dataset directly (that stays behind `lib/universities.ts`).
 */
export function UniversityList({ universities }: UniversityListProps) {
  if (universities.length === 0) {
    return <UniversityEmptyState />;
  }

  return (
    <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {universities.map((university) => (
        <li
          key={university.id}
          className="rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.145] dark:bg-black"
        >
          <p className="text-base font-semibold text-foreground">
            {university.shortName}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {university.name}
          </p>
        </li>
      ))}
    </ul>
  );
}
