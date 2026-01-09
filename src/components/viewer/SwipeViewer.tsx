"use client";

import { useState, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import Image from "next/image";
import type { Slide } from "@/types";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface SwipeViewerProps {
  slides: Slide[];
  onSlideChange?: (index: number) => void;
  showProgressBar?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export function SwipeViewer({
  slides,
  onSlideChange,
  showProgressBar = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  className = "",
}: SwipeViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sortedSlides = useMemo(
    () => [...slides].sort((a, b) => a.order - b.order),
    [slides]
  );

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      setActiveIndex(swiper.activeIndex);
      onSlideChange?.(swiper.activeIndex);
    },
    [onSlideChange]
  );

  if (sortedSlides.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--surface-base)]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--glass-light)]">
            <svg
              className="h-8 w-8 text-[var(--text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-[var(--text-muted)]">スライドがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`swipe-container ${className}`}>
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

      <Swiper
        modules={[Pagination, EffectFade, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        direction="vertical"
        pagination={
          showProgressBar
            ? {
                type: "progressbar",
                progressbarFillClass: "swiper-pagination-progressbar-fill",
              }
            : false
        }
        autoplay={
          autoPlay
            ? {
                delay: autoPlayInterval,
                disableOnInteraction: false,
              }
            : false
        }
        onSlideChange={handleSlideChange}
        className="h-full w-full"
        speed={400}
        threshold={10}
        resistance={true}
        resistanceRatio={0.85}
      >
        {sortedSlides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="relative h-full w-full">
            <div className="relative h-full w-full">
              <Image
                src={slide.imageUrl}
                alt={slide.alt || `Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Slide Counter */}
      <div className="slide-counter">
        <span className="text-[var(--color-brand)]">{activeIndex + 1}</span>
        <span className="mx-1 text-[var(--text-muted)]">/</span>
        <span className="text-[var(--text-secondary)]">
          {sortedSlides.length}
        </span>
      </div>
    </div>
  );
}

export default SwipeViewer;
