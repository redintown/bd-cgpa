import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SearchInput } from "@/components/ui/SearchInput";
import { UniversityList } from "@/components/university/UniversityList";
import { getAllUniversities } from "@/lib/universities";

export default function Home() {
  const universities = getAllUniversities();

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

        <section className="flex w-full max-w-xl flex-col gap-2">
          <SearchInput
            label="Search universities"
            placeholder="Search by university name or short name…"
            disabled
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Search is coming soon.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Universities
          </h2>
          <UniversityList universities={universities} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
