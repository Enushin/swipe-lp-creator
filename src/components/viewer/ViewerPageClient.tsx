"use client";

import { useEffect, useState } from "react";
import { ViewerContainer } from "@/components/viewer/ViewerContainer";
import { getLP } from "@/lib/firebase/firestore";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { LP } from "@/types";

const fallbackLP: LP = {
  id: "demo",
  title: "Demo LP",
  description: "デモ用のランディングページ",
  slides: [
    {
      id: "slide-1",
      imageUrl: "https://picsum.photos/seed/slide1/1080/1920",
      alt: "スライド1",
      order: 0,
    },
    {
      id: "slide-2",
      imageUrl: "https://picsum.photos/seed/slide2/1080/1920",
      alt: "スライド2",
      order: 1,
    },
    {
      id: "slide-3",
      imageUrl: "https://picsum.photos/seed/slide3/1080/1920",
      alt: "スライド3",
      order: 2,
    },
  ],
  cta: {
    text: "詳しく見る",
    url: "https://example.com",
    backgroundColor: "#2563eb",
    textColor: "#ffffff",
    position: "fixed",
  },
  tracking: {
    gtmId: "",
    metaPixelId: "",
  },
  settings: {
    viewerType: "swipe",
    autoPlay: false,
    autoPlayInterval: 3000,
  },
  status: "published",
  userId: "demo-user",
  createdAt: new Date(),
  updatedAt: new Date(),
};

interface ViewerPageClientProps {
  lpId: string;
}

export function ViewerPageClient({ lpId }: ViewerPageClientProps) {
  const [lp, setLp] = useState<LP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchLP() {
      if (!isFirebaseConfigured()) {
        if (mounted) {
          setLp(lpId === "demo" ? fallbackLP : null);
          setLoading(false);
        }
        return;
      }

      try {
        const result = await getLP(lpId);
        if (mounted) {
          setLp(result);
        }
      } catch {
        if (mounted) {
          setError("LPの取得に失敗しました");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchLP();
    return () => {
      mounted = false;
    };
  }, [lpId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-base)]">
        <p className="text-[var(--text-secondary)]">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-base)]">
        <p className="text-[var(--text-secondary)]">{error}</p>
      </div>
    );
  }

  if (!lp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-base)]">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--glass-light)]">
            <svg
              className="h-10 w-10 text-[var(--text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="mb-3 font-display text-2xl font-bold text-[var(--text-primary)]">
            ページが見つかりません
          </h1>
          <p className="text-[var(--text-secondary)]">
            指定されたLPは存在しないか、
            <br />
            非公開になっています。
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <ViewerContainer lp={lp} />
    </main>
  );
}

export default ViewerPageClient;
