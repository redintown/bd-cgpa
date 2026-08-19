import Link from "next/link";

/** Top site header with BD CGPA branding. */
export function SiteHeader() {
  return (
    <header className="w-full border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            BD CGPA
          </span>
        </Link>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Bangladesh university academic info
        </span>
      </div>
    </header>
  );
}
