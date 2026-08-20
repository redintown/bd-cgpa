import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
  description: "Sign in to the BD CGPA admin area.",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "This account is not authorized to access the admin area.",
};

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  // If an already-authorized admin lands here, send them straight to /admin.
  const { isAdmin } = await getAdminSession();
  if (isAdmin) {
    redirect("/admin");
  }

  const params = await searchParams;
  const rawError = params.error;
  const errorCode = Array.isArray(rawError) ? rawError[0] : rawError;
  const initialError = errorCode ? ERROR_MESSAGES[errorCode] : undefined;

  return (
    <div className="flex min-h-svh flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            BD CGPA
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Admin sign in
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Sign in with your admin email and password to continue.
          </p>
        </div>

        <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
          <AdminLoginForm initialError={initialError} />
        </div>
      </main>
    </div>
  );
}
