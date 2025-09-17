// src/hooks/useMeasure.ts
import { useEffect, useRef, useState, type MutableRefObject } from "react";

/**
 * Measures an element's content-box size using ResizeObserver.
 * Returns: [ref, { width, height }]
 */
export function useMeasure<T extends HTMLElement>(): [
  MutableRefObject<T | null>,
  { width: number; height: number }
] {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () =>
      setSize({
        width: Math.round(el.clientWidth),
        height: Math.round(el.clientHeight),
      });

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    update();

    // Some browsers fire a resize on orientationchange but not always; be safe.
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("orientationchange", update);
      ro.disconnect();
    };
  }, []);

  return [ref, size];
}
