"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Global water-ripple feedback on every mouse click or touch tap.
 */
export default function ClickRipple() {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const handlePointerDown = (e) => {
      // Ignore non-primary mouse buttons (e.g. right-click)
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const ripple = { id, x: e.clientX, y: e.clientY };

      setRipples((prev) => [...prev.slice(-6), ripple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {ripples.map((r) => (
          <div
            key={r.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: r.x, top: r.y }}
          >
            {/* Outer water ripple */}
            <motion.span
              initial={{ width: 8, height: 8, opacity: 0.75 }}
              animate={{ width: 76, height: 76, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.62, ease: "easeOut" }}
              className="block rounded-full border-2 border-pink-400/80 shadow-[0_0_12px_rgba(244,114,182,0.45)]"
            />
            {/* Inner secondary water ring */}
            <motion.span
              initial={{ width: 4, height: 4, opacity: 0.65 }}
              animate={{ width: 44, height: 44, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.48, delay: 0.08, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 block rounded-full border border-white/75"
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
