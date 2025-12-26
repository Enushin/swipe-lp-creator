import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://swipe-lp-creator.pages.dev"
  ),
  title: "Swipe LP Creator",
  description: "AI-Powered Swipe LP Builder - 最短で売れるスワイプLPを作成",
  keywords: ["LP", "ランディングページ", "スワイプ", "AI", "広告"],
  authors: [{ name: "Swipe LP Creator" }],
  robots: "index, follow",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
