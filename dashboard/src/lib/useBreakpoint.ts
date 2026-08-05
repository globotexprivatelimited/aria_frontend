"use client";

import { useState, useEffect } from "react";

// Watches viewport width and reports which breakpoint we're in.
// mobile: < 640px  |  tablet: 640-1024px  |  desktop: > 1024px
export function useBreakpoint(): { isMobile: boolean; isTablet: boolean; isDesktop: boolean; width: number } {
  const [width, setWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1280);

  useEffect(() => {
    function onResize() { setWidth(window.innerWidth); }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
}