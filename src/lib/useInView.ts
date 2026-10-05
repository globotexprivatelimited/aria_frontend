"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions extends IntersectionObserverInit {
  once?: boolean;
}

/**
 * Custom hook to detect when an element scrolls into the viewport
 * for smooth, performant, native CSS scroll-reveal animations.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(options: UseInViewOptions = {}) {
  const { once = true, threshold = 0.12, rootMargin = "0px 0px -40px 0px", ...rest } = options;
  const [inView, setInView] = useState(false);
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If browser doesn't support IntersectionObserver, reveal immediately
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (once) {
          observer.unobserve(el);
        }
      } else if (!once) {
        setInView(false);
      }
    }, { threshold, rootMargin, ...rest });

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin, rest]);

  return { ref, inView };
}
