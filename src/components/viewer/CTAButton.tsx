"use client";

import type { CTAConfig } from "@/types";
import { cn } from "@/lib/utils";

interface CTAButtonProps {
  config: CTAConfig;
  className?: string;
}

export function CTAButton({ config, className }: CTAButtonProps) {
  const { text, url, backgroundColor, textColor, position } = config;

  const handleClick = () => {
    // Track CTA click if tracking is enabled
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "cta_click", {
        event_category: "engagement",
        event_label: text,
        cta_url: url,
      });
    }

    // Open URL in new tab for external links
    if (url.startsWith("http")) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "cta-button",
        position === "fixed"
          ? "fixed bottom-4 left-4 right-4"
          : "relative w-full",
        className
      )}
      style={{
        backgroundColor: backgroundColor || "#2563eb",
        color: textColor || "#ffffff",
      }}
    >
      {text || "詳しく見る"}
    </button>
  );
}

// Add type for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

export default CTAButton;
