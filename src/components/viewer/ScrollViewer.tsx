"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import type { Slide } from "@/types";

interface ScrollViewerProps {
  slides: Slide[];
  onSlideChange?: (index: number) => void;
  showProgressBar?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export function ScrollViewer({
  slides,
  onSlideChange,
  showProgressBar = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  className = "",
}: ScrollViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const sortedSlides = useMemo(
    () => [...slides].sort((a, b) => a.order - b.order),
    [slides]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const slideHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / slideHeight);

      if (
        newIndex !== activeIndex &&
        newIndex >= 0 &&
        newIndex < sortedSlides.length
      ) {
        setActiveIndex(newIndex);
        onSlideChange?.(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeIndex, sortedSlides.length, onSlideChange]);

  useEffect(() => {
    if (!autoPlay || sortedSlides.length <= 1) return;
    const interval = window.setInterval(() => {
      const container = containerRef.current;
      if (!container) return;
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % sortedSlides.length;
        container.scrollTo({
          top: nextIndex * container.clientHeight,
          behavior: "smooth",
        });
        onSlideChange?.(nextIndex);
        return nextIndex;
      });
    }, autoPlayInterval);

    return () => window.clearInterval(interval);
  }, [autoPlay, autoPlayInterval, sortedSlides.length, onSlideChange]);

  if (sortedSlides.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">スライドがありません</p>
      </div>
    );
  }

  return (
    <div className={`scroll-viewer relative ${className}`}>
      {/* Progress Bar */}
      {showProgressBar && (
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${((activeIndex + 1) / sortedSlides.length) * 100}%`,
            }}
          />
        </div>
      )}

      <div
        ref={containerRef}
        className="h-screen w-full snap-y snap-mandatory overflow-y-scroll"
        style={{ scrollBehavior: "smooth" }}
      >
        {sortedSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="relative h-screen w-full flex-shrink-0 snap-start"
          >
            <Image
              src={slide.imageUrl}
              alt={slide.alt || `Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-20 left-4 z-40 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
        {activeIndex + 1} / {sortedSlides.length}
      </div>
    </div>
  );
}

export default ScrollViewer;
