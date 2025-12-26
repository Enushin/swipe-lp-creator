import { Metadata } from "next";
import { ViewerContainer } from "@/components/viewer";
import type { LP } from "@/types";

// Mock data for static generation - in production, this would come from Firestore
const mockLP: LP = {
  id: "demo",
  title: "Demo LP",
  description: "デモ用のランディングページ",
  slides: [
    {
      id: "slide-1",
      imageUrl: "/images/placeholder-1.jpg",
      alt: "スライド1",
      order: 0,
    },
    {
      id: "slide-2",
      imageUrl: "/images/placeholder-2.jpg",
      alt: "スライド2",
      order: 1,
    },
    {
      id: "slide-3",
      imageUrl: "/images/placeholder-3.jpg",
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  // In production, fetch LP data from Firestore
  // const lp = await getLPById(id);
  const lp = id === "demo" ? mockLP : null;

  if (!lp) {
    return {
      title: "ページが見つかりません",
    };
  }

  return {
    title: lp.title,
    description: lp.description,
    openGraph: {
      title: lp.title,
      description: lp.description,
      images: lp.slides[0]?.imageUrl ? [lp.slides[0].imageUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: lp.title,
      description: lp.description,
      images: lp.slides[0]?.imageUrl ? [lp.slides[0].imageUrl] : [],
    },
  };
}

export default async function PublicLPPage({ params }: PageProps) {
  const { id } = await params;

  // In production, fetch LP data from Firestore
  // const lp = await getLPById(id);
  const lp = id === "demo" ? mockLP : null;

  if (!lp) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            ページが見つかりません
          </h1>
          <p className="mt-2 text-gray-600">
            指定されたLPは存在しないか、非公開になっています。
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

// Generate static params for demo
export function generateStaticParams() {
  return [{ id: "demo" }];
}
