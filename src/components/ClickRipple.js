"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Global glowing aqua water-ripple trail on mouse movement (and taps on touch devices).
 */
export default function ClickRipple() {
  const [ripples, setRipples] = useState([]);
  const lastSpawnRef = useRef({ time: 0, x: -999, y: -999 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    const spawnRipple = (x, y) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setRipples((prev) => [...prev.slice(-14), { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 1150);
    };

    const handlePointerMove = (e) => {
      const now = performance.now();
      const dx = e.clientX - lastSpawnRef.current.x;
      const dy = e.clientY - lastSpawnRef.current.y;
      const distSq = dx * dx + dy * dy;

      // Throttle by time (45ms) and minimum distance (18px) for a silky trail
      if (now - lastSpawnRef.current.time < 45 || distSq < 324) return;

      lastSpawnRef.current = { time: now, x: e.clientX, y: e.clientY };
      spawnRipple(e.clientX, e.clientY);
    };

    const handlePointerDown = (e) => {
      lastSpawnRef.current = { time: performance.now(), x: e.clientX, y: e.clientY };
      spawnRipple(e.clientX, e.clientY);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
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
            {/* Glowing aqua water orb */}
            <motion.span
              initial={{ width: 16, height: 16, opacity: 0.72 }}
              animate={{ width: 130, height: 130, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
              className="block rounded-full bg-cyan-300/55 blur-[6px] shadow-[0_0_28px_rgba(103,232,249,0.75)]"
            />
            {/* Soft outer water ripple ring */}
            <motion.span
              initial={{ width: 12, height: 12, opacity: 0.55 }}
              animate={{ width: 155, height: 155, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.15, delay: 0.05, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 block rounded-full border-2 border-cyan-300/50 blur-[1px]"
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
