import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";

interface AdminShellProps {
  children: React.ReactNode;
}

/** Shared chrome for protected admin pages. */
export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="w-full border-b border-black/[.08] dark:border-white/[.145]">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            BD CGPA{" "}
            <span className="text-zinc-500 dark:text-zinc-400">Admin</span>
          </span>
          <AdminSignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
