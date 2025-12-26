"use client";

import { useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import Image from "next/image";
import type { Slide } from "@/types";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface SwipeViewerProps {
  slides: Slide[];
  onSlideChange?: (index: number) => void;
  className?: string;
}

export function SwipeViewer({
  slides,
  onSlideChange,
  className = "",
}: SwipeViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      setActiveIndex(swiper.activeIndex);
      onSlideChange?.(swiper.activeIndex);
    },
    [onSlideChange]
  );

  if (slides.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">スライドがありません</p>
      </div>
    );
  }

  return (
    <div className={`swipe-viewer h-screen w-full ${className}`}>
      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            width: `${((activeIndex + 1) / slides.length) * 100}%`,
          }}
        />
      </div>

      <Swiper
        modules={[Pagination, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          type: "progressbar",
          progressbarFillClass: "swiper-pagination-progressbar-fill",
        }}
        onSlideChange={handleSlideChange}
        className="h-full w-full"
        speed={300}
        threshold={10}
        resistance={true}
        resistanceRatio={0.85}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="relative h-full w-full">
            <div className="relative h-full w-full">
              <Image
                src={slide.imageUrl}
                alt={slide.alt || `Slide ${index + 1}`}
                fill
                className="object-contain"
                priority={index === 0}
                sizes="100vw"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Slide Counter */}
      <div className="absolute bottom-20 left-4 z-40 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
        {activeIndex + 1} / {slides.length}
      </div>
    </div>
  );
}

export default SwipeViewer;
