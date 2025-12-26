"use client";

import { useState, useEffect } from "react";
import { SwipeViewer } from "./SwipeViewer";
import { ScrollViewer } from "./ScrollViewer";
import { CTAButton } from "./CTAButton";
import { TrackingScripts } from "./TrackingScripts";
import type { LP } from "@/types";

interface ViewerContainerProps {
  lp: LP;
}

export function ViewerContainer({ lp }: ViewerContainerProps) {
  const [isPC, setIsPC] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const checkDevice = () => {
      setIsPC(window.innerWidth >= 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const { slides, cta, tracking, settings } = lp;
  const ViewerComponent =
    settings.viewerType === "scroll" ? ScrollViewer : SwipeViewer;

  // Get first slide image for PC backdrop
  const backdropImage = slides[0]?.imageUrl;

  return (
    <>
      {/* Tracking Scripts */}
      <TrackingScripts config={tracking} />

      {/* PC Layout with blur backdrop */}
      {isPC && backdropImage && (
        <div
          className="viewer-backdrop"
          style={{ backgroundImage: `url(${backdropImage})` }}
        />
      )}

      {/* Viewer Container */}
      <div className={isPC ? "viewer-container" : ""}>
        <ViewerComponent slides={slides} onSlideChange={setCurrentSlide} />

        {/* CTA Button */}
        {cta && <CTAButton config={cta} />}
      </div>

      {/* Slide progress for accessibility */}
      <div className="sr-only" aria-live="polite">
        スライド {currentSlide + 1} / {slides.length}
      </div>
    </>
  );
}

export default ViewerContainer;
