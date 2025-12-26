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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
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
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Firebase設定が必要です
          </h2>
          <p className="mb-4 text-gray-600">
            アプリケーションを使用するには、Firebase環境変数を設定してください。
          </p>
          <div className="rounded-md bg-gray-100 p-4 text-left">
            <p className="mb-2 text-sm font-medium text-gray-700">
              必要な環境変数:
            </p>
            <code className="text-xs text-gray-600">
              NEXT_PUBLIC_FIREBASE_API_KEY
              <br />
              NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
              <br />
              NEXT_PUBLIC_FIREBASE_PROJECT_ID
              <br />
              NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
              <br />
              NEXT_PUBLIC_FIREBASE_APP_ID
            </code>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            詳細は{" "}
            <a
              href="https://github.com/Enushin/swipe-lp-creator#environment-setup"
              className="text-primary-600 hover:underline"
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
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          <p className="mt-4 text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader>
        <CreateLPButton onCreate={createLP} />
      </DashboardHeader>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">マイLP</h1>
          <p className="mt-1 text-gray-500">作成したLPの管理・編集ができます</p>
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
