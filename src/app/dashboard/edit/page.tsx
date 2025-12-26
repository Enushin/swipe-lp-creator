"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLP } from "@/hooks/useLP";
import { EditorSidebar, PreviewPane } from "@/components/editor";

function EditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { user, loading: authLoading } = useAuth();
  const { lp, loading, saving, updateLP, publish, unpublish } = useLP(
    id || undefined
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Redirect to dashboard if no ID
  useEffect(() => {
    if (!id) {
      router.push("/dashboard");
    }
  }, [id, router]);

  // Show loading
  if (authLoading || loading || !id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          <p className="mt-4 text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  // LP not found
  if (!lp) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            LPが見つかりません
          </h1>
          <p className="mt-2 text-gray-500">
            指定されたLPは存在しないか、アクセス権限がありません。
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-primary-600 hover:underline"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  // Check ownership
  if (user && lp.userId !== user.uid) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            アクセス権限がありません
          </h1>
          <p className="mt-2 text-gray-500">
            このLPを編集する権限がありません。
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-primary-600 hover:underline"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  const handlePublishToggle = async () => {
    if (lp.status === "published") {
      await unpublish();
    } else {
      await publish();
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            戻る
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-semibold text-gray-900">{lp.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {saving && <span className="text-sm text-gray-400">保存中...</span>}

          <button
            onClick={handlePublishToggle}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              lp.status === "published"
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {lp.status === "published" ? "非公開にする" : "公開する"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar lp={lp} onUpdate={updateLP} saving={saving} />
        <PreviewPane lp={lp} />
      </div>
    </div>
  );
}

export default function EditLPPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            <p className="mt-4 text-gray-500">読み込み中...</p>
          </div>
        </div>
      }
    >
      <EditPageContent />
    </Suspense>
  );
}
