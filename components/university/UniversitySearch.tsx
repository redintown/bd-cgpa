"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { SearchInput } from "@/components/ui/SearchInput";
import type { UniversitySearchResult } from "@/lib/db/universities";

type Status = "idle" | "loading" | "success" | "error";

const DEBOUNCE_MS = 250;

export function UniversitySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UniversitySearchResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  const statusId = useId();
  const trimmed = query.trim();

  useEffect(() => {
    const controller = new AbortController();

    // Debounce so we don't issue a request on every keystroke. State updates
    // happen inside this async callback (never synchronously in the effect
    // body), and the effect cleanup aborts any superseded/in-flight request.
    const timer = setTimeout(
      () => {
        // Empty / whitespace-only input resets to the normal homepage state.
        if (trimmed === "") {
          setResults([]);
          setStatus("idle");
          return;
        }

        setStatus("loading");
        fetch(`/api/universities/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error("Request failed");
            }
            const data = (await response.json()) as {
              results: UniversitySearchResult[];
            };
            setResults(data.results);
            setStatus("success");
          })
          .catch((error: unknown) => {
            if (error instanceof DOMException && error.name === "AbortError") {
              return; // Superseded by a newer query; ignore.
            }
            setResults([]);
            setStatus("error");
          });
      },
      trimmed === "" ? 0 : DEBOUNCE_MS,
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  return (
    <div className="flex w-full flex-col gap-4">
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="w-full max-w-xl"
      >
        <SearchInput
          label="Search universities"
          placeholder="Search by name, short name (e.g. IUB), or code…"
          value={query}
          onChange={setQuery}
          describedById={statusId}
        />
      </form>

      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className="text-sm text-zinc-500 dark:text-zinc-400"
      >
        {status === "idle" &&
          "Start typing to find a Bangladeshi university."}
        {status === "loading" && "Searching…"}
        {status === "error" &&
          "Something went wrong while searching. Please try again."}
        {status === "success" &&
          (results.length === 0
            ? `No universities match “${trimmed}”.`
            : `${results.length} ${
                results.length === 1 ? "university" : "universities"
              } found.`)}
      </p>

      {status === "success" && results.length > 0 ? (
        <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {results.map((university) => (
            <li key={university.id}>
              <Link
                href={`/universities/${university.slug}`}
                className="flex flex-col rounded-xl border border-black/[.08] bg-white p-5 transition-colors hover:border-black/[.2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/[.145] dark:bg-black dark:hover:border-white/[.3]"
              >
                <span className="text-base font-semibold text-foreground">
                  {university.shortName}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {university.name}
                </span>
                <span className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {university.city}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
