import type { University } from "@/types/university";

interface UniversityHeaderProps {
  university: University;
}

const typeLabels: Record<University["type"], string> = {
  public: "Public",
  private: "Private",
};

/**
 * Identity block for a university: name, abbreviation, location, governance
 * type and official website. Purely presentational — the page supplies data.
 */
export function UniversityHeader({ university }: UniversityHeaderProps) {
  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          {university.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-black/[.12] px-3 py-1 text-sm font-medium text-foreground dark:border-white/[.18]">
            {university.shortName}
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600 dark:bg-white/[.08] dark:text-zinc-300">
            {typeLabels[university.type]}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 rounded-xl border border-black/[.08] bg-white p-5 sm:grid-cols-2 dark:border-white/[.145] dark:bg-black">
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">
            Short name
          </dt>
          <dd className="text-base text-foreground">{university.shortName}</dd>
        </div>

        <div className="flex flex-col gap-1">
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">City</dt>
          <dd className="text-base text-foreground">{university.city}</dd>
        </div>

        <div className="flex flex-col gap-1">
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">Division</dt>
          <dd className="text-base text-foreground">{university.division}</dd>
        </div>

        <div className="flex flex-col gap-1">
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">Type</dt>
          <dd className="text-base text-foreground">
            {typeLabels[university.type]}
          </dd>
        </div>

        <div className="flex min-w-0 flex-col gap-1 sm:col-span-2">
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">
            Official website
          </dt>
          <dd className="min-w-0 text-base">
            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Official website of ${university.name} (opens in a new tab)`}
              className="break-all text-foreground underline underline-offset-4 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {university.website}
            </a>
          </dd>
        </div>
      </dl>
    </header>
  );
}
