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
  const { user, loading: authLoading } = useAuth();
  const { lps, loading, createLP, deleteLP, togglePublish } = useUserLPs(
    user?.uid
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

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
