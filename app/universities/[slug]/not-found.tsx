import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/** Rendered with a 404 status when a university slug does not exist. */
export default function UniversityNotFound() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start gap-4 px-6 py-20">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          University not found
        </h1>
        <p className="max-w-xl text-base text-zinc-600 dark:text-zinc-400">
          We could not find a university at this address. It may not have been
          added yet — we only publish a university once its academic
          information has been sourced from an official document and verified.
        </p>
        <Link
          href="/"
          className="text-base text-foreground underline underline-offset-4 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Back to all universities
        </Link>
      </main>

      <SiteFooter />
    </div>
  );
}
