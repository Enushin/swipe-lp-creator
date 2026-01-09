import { Metadata } from "next";
import { ViewerPageClient } from "@/components/viewer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Swipe LP",
    description: "スワイプ型ランディングページ",
  };
}

export default async function PublicLPPage({ params }: PageProps) {
  const { id } = await params;

  return <ViewerPageClient lpId={id} />;
}

// Generate static params for demo
export function generateStaticParams() {
  return [{ id: "demo" }];
}
