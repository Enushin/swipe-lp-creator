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

  // Determine if using custom colors or default gradient
  const useCustomColors = backgroundColor && backgroundColor !== "#2563eb";

  return (
    <div
      className={cn(
        position === "fixed" ? "cta-button" : "relative w-full p-4",
        className
      )}
    >
      <button
        onClick={handleClick}
        className={cn(
          "relative w-full overflow-hidden",
          "rounded-2xl px-6 py-4",
          "text-center text-lg font-semibold",
          "transition-all duration-300",
          "hover:scale-[1.02] active:scale-[0.98]",
          "font-display"
        )}
        style={
          useCustomColors
            ? {
                backgroundColor: backgroundColor,
                color: textColor || "#ffffff",
                boxShadow: `0 8px 30px ${backgroundColor}66`,
              }
            : {
                background: "var(--gradient-brand)",
                color: "#ffffff",
                boxShadow: "0 8px 30px rgba(14, 165, 233, 0.4)",
              }
        }
      >
        {/* Shine effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />

        {/* Button text */}
        <span className="relative flex items-center justify-center gap-2">
          {text || "詳しく見る"}
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </span>
      </button>
    </div>
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
