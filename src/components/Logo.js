"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

// LoveLink Unique Cosmic Cyber-Romance Palette
const LOVE_COLORS = [
  "#38bdf8", // electric cyan
  "#0ea5e9", // sky blue
  "#ec4899", // bright magenta
  "#f43f5e", // cyber rose
  "#a855f7", // ethereal purple
  "#fbbf24", // golden star shimmer
  "#ffffff", // pure crystal light
];

export function Logo({ className = "w-9 h-9 text-pink-500", interactive = true }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef({
    heart: [],
    floats: [],
    bursts: [],
  });

  // Spawn upward electric burst from portal into heart
  const triggerBurst = useCallback(() => {
    const pState = particlesRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 80;
    const height = 80;
    const portalY = height * 0.86;
    const centerX = width / 2;

    const BURST_COUNT = 44;
    for (let i = 0; i < BURST_COUNT; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.15; // upward cone
      const speed = 1.7 + Math.random() * 3.0;
      const color = LOVE_COLORS[Math.floor(Math.random() * LOVE_COLORS.length)];
      pState.bursts.push({
        x: centerX + (Math.random() - 0.5) * 18,
        y: portalY + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
        vy: Math.sin(angle) * speed,
        size: 1.0 + Math.random() * 1.8,
        alpha: 1,
        color: color,
        life: 0,
        maxLife: 26 + Math.random() * 22,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed internal virtual resolution for crisp sub-pixel rendering
    const V_WIDTH = 80;
    const V_HEIGHT = 80;

    // Retina display scaling
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    canvas.width = V_WIDTH * dpr;
    canvas.height = V_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    const centerX = V_WIDTH / 2;
    const centerY = V_HEIGHT * 0.41;
    const scale = V_WIDTH * 0.0225;
    const portalY = V_HEIGHT * 0.86;

    // 1. Initialize Heart Contour & Interior Points
    const HEART_TOTAL = 56;
    const heartParticles = [];
    for (let i = 0; i < HEART_TOTAL; i++) {
      const t = (i / HEART_TOTAL) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      
      const targetX = centerX + hx * scale;
      const targetY = centerY + hy * scale;

      heartParticles.push({
        baseX: targetX,
        baseY: targetY,
        x: targetX,
        y: targetY,
        vx: 0,
        vy: 0,
        size: 1.2 + (i % 3 === 0 ? 0.7 : 0),
        alpha: 0.7 + Math.random() * 0.3,
        color: LOVE_COLORS[i % LOVE_COLORS.length],
        twinkleSpeed: 0.04 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Add 16 heart core interior sparkles
    for (let i = 0; i < 16; i++) {
      const r = Math.random() * 0.68;
      const t = Math.random() * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3) * r;
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r;
      heartParticles.push({
        baseX: centerX + hx * scale,
        baseY: centerY + hy * scale,
        x: centerX + hx * scale,
        y: centerY + hy * scale,
        vx: 0,
        vy: 0,
        size: 0.9 + Math.random() * 0.9,
        alpha: 0.5 + Math.random() * 0.4,
        color: LOVE_COLORS[Math.floor(Math.random() * LOVE_COLORS.length)],
        twinkleSpeed: 0.03 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
      });
    }

    particlesRef.current.heart = heartParticles;
    particlesRef.current.floats = [];
    particlesRef.current.bursts = [];

    // Periodic gentle heart burst (every 4.5 seconds)
    let autoBurstTimer = null;
    if (interactive) {
      autoBurstTimer = setInterval(() => {
        triggerBurst();
      }, 4500);
    }

    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);

      // --- A. DRAW THE GLOWING PORTAL (BASE PUDDLE) ---
      const portalRadiusX = V_WIDTH * 0.28;
      const portalRadiusY = V_HEIGHT * 0.075;
      const pulse = 1 + Math.sin(frameCount * 0.06) * 0.08;

      // Outer ambient portal aura
      const grad = ctx.createRadialGradient(
        centerX,
        portalY,
        1,
        centerX,
        portalY,
        portalRadiusX * pulse
      );
      grad.addColorStop(0, "rgba(56, 189, 248, 0.65)");
      grad.addColorStop(0.45, "rgba(236, 72, 153, 0.4)");
      grad.addColorStop(1, "rgba(56, 189, 248, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(centerX, portalY, portalRadiusX * pulse, portalRadiusY * pulse, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner intense core ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.ellipse(centerX, portalY, portalRadiusX * 0.65 * pulse, portalRadiusY * 0.55 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();

      // --- B. SPAWN & UPDATE CONTINUOUS FLOATING PARTICLES ---
      const pState = particlesRef.current;
      if (frameCount % 3 === 0 && pState.floats.length < 24) {
        const floatX = centerX + (Math.random() - 0.5) * (portalRadiusX * 1.3);
        pState.floats.push({
          x: floatX,
          y: portalY - 1,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -0.45 - Math.random() * 0.45,
          size: 0.7 + Math.random() * 0.8,
          alpha: 0.9,
          color: LOVE_COLORS[Math.floor(Math.random() * LOVE_COLORS.length)],
          life: 0,
          maxLife: 45 + Math.random() * 30,
        });
      }

      // Draw & update floating particles
      for (let i = pState.floats.length - 1; i >= 0; i--) {
        const fp = pState.floats[i];
        fp.x += fp.vx;
        fp.y += fp.vy;
        fp.life++;
        fp.alpha = Math.max(0, 1 - fp.life / fp.maxLife);

        ctx.fillStyle = fp.color;
        ctx.globalAlpha = fp.alpha * 0.85;
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, fp.size, 0, Math.PI * 2);
        ctx.fill();

        if (fp.life >= fp.maxLife || fp.y < centerY - 15) {
          pState.floats.splice(i, 1);
        }
      }

      // --- C. DRAW & UPDATE BURST PARTICLES (SHOCKWAVE) ---
      for (let i = pState.bursts.length - 1; i >= 0; i--) {
        const bp = pState.bursts[i];
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.vx *= 0.96;
        bp.vy *= 0.96;
        bp.life++;
        bp.alpha = Math.max(0, 1 - bp.life / bp.maxLife);

        // Draw glowing particle
        ctx.fillStyle = bp.color;
        ctx.globalAlpha = bp.alpha;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.size * (1 + bp.life * 0.02), 0, Math.PI * 2);
        ctx.fill();

        if (bp.life >= bp.maxLife) {
          pState.bursts.splice(i, 1);
        }
      }

      // --- D. DRAW THE 3D QUANTUM PARTICLE HEART ---
      const heartBreath = 1 + Math.sin(frameCount * 0.05) * 0.035;

      for (let i = 0; i < pState.heart.length; i++) {
        const hp = pState.heart[i];
        hp.phase += hp.twinkleSpeed;
        const twinkle = 0.5 + Math.sin(hp.phase) * 0.5;

        // Subtle harmonic expansion
        const curX = centerX + (hp.baseX - centerX) * heartBreath;
        const curY = centerY + (hp.baseY - centerY) * heartBreath;

        ctx.fillStyle = hp.color;
        ctx.globalAlpha = 0.4 + twinkle * 0.6;
        ctx.beginPath();
        ctx.arc(curX, curY, hp.size * (0.8 + twinkle * 0.4), 0, Math.PI * 2);
        ctx.fill();

        // Optional micro connector lines between neighboring particles
        if (i < 20 && frameCount % 2 === 0) {
          const next = pState.heart[(i + 1) % pState.heart.length];
          const distSq = Math.pow(curX - next.baseX, 2) + Math.pow(curY - next.baseY, 2);
          if (distSq < 40) {
            ctx.strokeStyle = hp.color;
            ctx.globalAlpha = 0.15;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(curX, curY);
            ctx.lineTo(next.baseX, next.baseY);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (autoBurstTimer) clearInterval(autoBurstTimer);
    };
  }, [triggerBurst, interactive]);

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => {
        triggerBurst();
      }}
      title="LoveLink"
      style={{ overflow: "visible" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]"
      />
    </motion.div>
  );
}
