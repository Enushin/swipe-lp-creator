"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserLPs } from "@/hooks/useUserLPs";
import {
  DashboardHeader,
  LPGrid,
  CreateLPButton,
} from "@/components/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isConfigured } = useAuth();
  const { lps, loading, createLP, deleteLP, togglePublish } = useUserLPs(
    user?.uid
  );

  // Redirect to login if not authenticated (only if Firebase is configured)
  useEffect(() => {
    if (!authLoading && !user && isConfigured) {
      router.push("/login");
    }
  }, [authLoading, user, router, isConfigured]);

  // Show configuration error when Firebase is not set up
  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-base)]">
        <div className="mesh-bg fixed inset-0 -z-10" />
        <div className="glass-card mx-4 max-w-md p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <svg
              className="h-10 w-10 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-3 font-display text-xl font-bold text-[var(--text-primary)]">
            Firebase設定が必要です
          </h2>
          <p className="mb-6 text-[var(--text-secondary)]">
            アプリケーションを使用するには、Firebase環境変数を設定してください。
          </p>
          <div className="rounded-xl bg-[var(--surface-raised)] p-4 text-left">
            <p className="mb-3 text-sm font-medium text-[var(--text-secondary)]">
              必要な環境変数:
            </p>
            <code className="block space-y-1 font-mono text-xs text-[var(--text-muted)]">
              <span className="block">NEXT_PUBLIC_FIREBASE_API_KEY</span>
              <span className="block">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</span>
              <span className="block">NEXT_PUBLIC_FIREBASE_PROJECT_ID</span>
              <span className="block">NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</span>
              <span className="block">NEXT_PUBLIC_FIREBASE_APP_ID</span>
            </code>
          </div>
          <p className="mt-6 text-sm text-[var(--text-muted)]">
            詳細は{" "}
            <a
              href="https://github.com/Enushin/swipe-lp-creator#environment-setup"
              className="text-[var(--color-brand)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              README
            </a>{" "}
            を参照してください。
          </p>
        </div>
      </div>
    );
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-base)]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--glass-strong)] border-t-[var(--color-brand)]" />
          <p className="mt-4 text-[var(--text-muted)]">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[var(--surface-base)]">
      {/* Background effects */}
      <div className="mesh-bg fixed inset-0 -z-10" />
      <div className="-z-5 fixed left-0 top-0 h-[400px] w-[400px] rounded-full bg-[var(--color-brand)] opacity-5 blur-[100px]" />
      <div className="-z-5 fixed bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[var(--color-accent-violet)] opacity-5 blur-[80px]" />

      <DashboardHeader>
        <CreateLPButton onCreate={createLP} />
      </DashboardHeader>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
            マイLP
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            作成したLPの管理・編集ができます
          </p>
        </div>

        <LPGrid
          lps={lps}
          loading={loading}
          onDelete={deleteLP}
          onTogglePublish={togglePublish}
        />
      </main>
    </div>
  );
}
