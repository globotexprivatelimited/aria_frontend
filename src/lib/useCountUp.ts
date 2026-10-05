"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook for smooth animated number count-up using easeOutExpo
 * @param target The target number to count up to
 * @param duration Duration in milliseconds (default 900ms)
 */
export function useCountUp(target: number, duration: number = 900): number {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const easeOutExpo = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      setVal(Math.round(from + (target - from) * easeOutExpo(k)));
      if (k < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return val;
}
