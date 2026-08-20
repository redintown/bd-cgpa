import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { UniversitySearch } from "@/components/university/UniversitySearch";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
        <section className="flex flex-col gap-4">
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-foreground">
            Bangladesh university grading policies & CGPA
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Search for a Bangladeshi university to view its official grading
            policy and calculate your CGPA. Every policy is published with an
            official source and a verification date.
          </p>
        </section>

        <section aria-labelledby="search-heading" className="flex flex-col gap-4">
          <h2
            id="search-heading"
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            Find a university
          </h2>
          <UniversitySearch />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
