"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Admin sign-in form (email + password only).
 *
 * Authentication goes straight to Supabase Auth from the browser using the
 * publishable key, so this app never handles or stores raw credentials and
 * exposes no credential-accepting API endpoint. After a successful sign-in we
 * also verify the account is on the database-backed admin allowlist purely for
 * UX; the authoritative check lives in the protected `/admin` Server Component.
 *
 * Error messages are intentionally generic so we never leak whether an email
 * exists or reveal internal auth/database details.
 */
export function AdminLoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (trimmedEmail === "" || password === "") {
      setError("Enter your email and password.");
      return;
    }

    setError(null);
    setPending(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

      if (signInError || !data.user) {
        setError("Invalid email or password.");
        return;
      }

      // UX-only authorization check. Non-admin accounts are signed out
      // immediately so no stale, unauthorized session lingers.
      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        setError("This account is not authorized to access the admin area.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong while signing in. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={emailId}
          className="text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={pending}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          className="h-12 w-full rounded-lg border border-black/[.12] bg-white px-4 text-base text-foreground outline-none transition-colors placeholder:text-zinc-400 focus:border-black/[.35] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[.18] dark:bg-black dark:focus:border-white/[.45]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={passwordId}
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>
        <input
          id={passwordId}
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={pending}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          className="h-12 w-full rounded-lg border border-black/[.12] bg-white px-4 text-base text-foreground outline-none transition-colors placeholder:text-zinc-400 focus:border-black/[.35] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[.18] dark:bg-black dark:focus:border-white/[.45]"
        />
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-foreground px-4 text-base font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
