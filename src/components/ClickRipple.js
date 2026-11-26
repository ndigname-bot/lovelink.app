"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Global glowing aqua water-ripple feedback on every mouse click or touch tap.
 */
export default function ClickRipple() {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const handlePointerDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const ripple = { id, x: e.clientX, y: e.clientY };

      setRipples((prev) => [...prev.slice(-6), ripple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 1300);
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
            {/* Main soft glowing aqua water orb */}
            <motion.span
              initial={{ width: 16, height: 16, opacity: 0.78 }}
              animate={{ width: 140, height: 140, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
              className="block rounded-full bg-cyan-300/60 blur-[5px] shadow-[0_0_32px_rgba(103,232,249,0.8)]"
            />
            {/* Secondary outer water ripple ring */}
            <motion.span
              initial={{ width: 12, height: 12, opacity: 0.65 }}
              animate={{ width: 165, height: 165, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.25, delay: 0.06, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 block rounded-full border-2 border-cyan-300/60 blur-[1px]"
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
