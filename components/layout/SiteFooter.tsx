/** Site footer. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-6 py-6 text-sm text-zinc-500 dark:text-zinc-400">
        <p>BD CGPA &middot; {year}</p>
        <p>
          Academic information is published with an official source and a
          verification date.
        </p>
      </div>
    </footer>
  );
}
