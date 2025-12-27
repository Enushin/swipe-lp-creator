"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface DashboardHeaderProps {
  children?: React.ReactNode;
}

export function DashboardHeader({ children }: DashboardHeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    if (confirm("ログアウトしますか？")) {
      await signOut();
    }
  };

  return (
    <header className="glass bg-[var(--surface-base)]/80 sticky top-0 z-50 border-b border-[var(--glass-border)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="font-display text-xl font-bold text-[var(--text-primary)]"
          >
            <span className="text-gradient">Swipe LP</span>{" "}
            <span className="text-[var(--text-secondary)]">Creator</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {children}

          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-[var(--text-muted)] sm:block">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-lg px-3 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--glass-light)] hover:text-[var(--text-primary)]"
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
