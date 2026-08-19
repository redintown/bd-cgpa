/** Shown when no verified universities are available yet. */
export function UniversityEmptyState() {
  return (
    <div className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-black/[.15] bg-white/50 px-6 py-12 text-center dark:border-white/[.18] dark:bg-white/[.02]">
      <p className="text-base font-medium text-foreground">
        No universities available yet
      </p>
      <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        We only publish academic information once it has been sourced from an
        official document and verified. Universities will appear here as they
        are added.
      </p>
    </div>
  );
}
