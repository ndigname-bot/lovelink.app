"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, ArrowRight, ChevronLeft, ChevronRight, X, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function CrystalFlower({ giftData, onOpen, onStartAudio, styles }) {
  const [activeChapter, setActiveChapter] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [discoveredPetals, setDiscoveredPetals] = useState({});

  // 5 Chapter themes mapped to reasons/sentiments
  const reasons = giftData?.reasons || [];
  const defaultChapters = [
    {
      title: "The Reflection of Your Light",
      subtitle: "Like a crystal petal catching the morning dawn",
      text: reasons[0] || "From the very first moment our eyes met, my world was filled with magical colors and peace.",
      petalNum: 1,
    },
    {
      title: "My Safe Haven",
      subtitle: "Unwavering strength and gentle tenderness",
      text: reasons[1] || "Just as this crystal flower blooms without breaking, your love brings me a serenity I never knew existed.",
      petalNum: 2,
    },
    {
      title: "Our Own Universe",
      subtitle: "Every dream I want to fulfill walking beside you",
      text: reasons[2] || "Inside our story lives every hope, late-night laughter, and promise of a lifetime together.",
      petalNum: 3,
    },
    {
      title: "Heartbeats Written in Crystal",
      subtitle: "Turning the simplest moments into forever",
      text: reasons[3] || "Every beat of my heart carries your name. Thank you for making every day extraordinary.",
      petalNum: 4,
    },
    {
      title: "The Golden Heart: Everlasting Love",
      subtitle: "Brighter than a thousand suns together",
      text: giftData?.letter?.slice(0, 220) || "What we have built together is pure, sincere, and unbreakable. Happy Anniversary my love.",
      petalNum: 5,
      isGolden: true,
    },
  ];

  const handleOpenPetal = (index) => {
    setActiveChapter(index);
    setDiscoveredPetals((prev) => ({ ...prev, [index]: true }));

    if (!hasInteracted) {
      setHasInteracted(true);
      if (onStartAudio) onStartAudio();
    }

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#ec4899", "#38bdf8", "#fbbf24"],
      });
    } catch (e) {}
  };

  const showerHeartsAndLight = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#ec4899", "#fbbf24", "#38bdf8", "#f43f5e", "#ffffff"],
      });
    } catch (e) {}
  };

  const nextChapter = () => {
    if (activeChapter !== null) {
      const next = (activeChapter + 1) % defaultChapters.length;
      handleOpenPetal(next);
    }
  };

  const prevChapter = () => {
    if (activeChapter !== null) {
      const prev = (activeChapter - 1 + defaultChapters.length) % defaultChapters.length;
      handleOpenPetal(prev);
    }
  };

  // 6 Petal layout positions & rotation angles
  const petals = [
    { angle: 0, rotate: 0, color: "from-pink-400/40 via-purple-300/30 to-cyan-300/40" },
    { angle: 60, rotate: 60, color: "from-purple-400/40 via-pink-300/30 to-amber-300/40" },
    { angle: 120, rotate: 120, color: "from-cyan-400/40 via-blue-300/30 to-purple-300/40" },
    { angle: 180, rotate: 180, color: "from-rose-400/40 via-pink-300/30 to-fuchsia-300/40" },
    { angle: 240, rotate: 240, color: "from-amber-300/40 via-rose-300/30 to-purple-300/40" },
    { angle: 300, rotate: 300, color: "from-blue-300/40 via-cyan-300/30 to-pink-300/40" },
  ];

  return (
    <div className="z-10 w-full max-w-lg mx-auto select-none px-4 flex flex-col items-center">
      {/* WhatsApp Delivery Pill */}
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-purple-500/30 backdrop-blur-xl shadow-lg"
      >
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[11px] font-mono text-purple-200 font-semibold tracking-wider uppercase">
          The Eternal Crystal Rose 🌸✨
        </span>
      </motion.div>

      {/* Recipient & Occasion Subtitle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-6 space-y-1"
      >
        <h1 className="text-3xl sm:text-4xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 font-bold drop-shadow-md">
          For {giftData?.recipientName}
        </h1>
        <p className="text-xs text-purple-200/70 font-sans">
          Real roses wither in 3 days. Your crystal flower blooms forever in the cloud.
        </p>
      </motion.div>

      {/* THE 3D GLOWING CRYSTAL FLOWER STAGE */}
      <div className="relative w-80 h-96 flex flex-col items-center justify-center">
        {/* Ambient meadow aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/20 via-pink-500/20 to-cyan-400/15 blur-3xl pointer-events-none" />

        {/* FLOATING GOLDEN HEART BEACON (Top of flower) */}
        <motion.div
          animate={{
            y: [-8, 6, -8],
            scale: [1, 1.08, 1],
            filter: [
              "drop-shadow(0 0 15px rgba(251,191,36,0.5))",
              "drop-shadow(0 0 30px rgba(251,191,36,0.9))",
              "drop-shadow(0 0 15px rgba(251,191,36,0.5))",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-3 z-30 flex flex-col items-center cursor-pointer group"
          onClick={() => handleOpenPetal(4)}
        >
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-500 border-2 border-white/80 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6 text-amber-950 fill-amber-950/40" />
            <span className="absolute -inset-1 rounded-full border border-amber-300/60 animate-ping pointer-events-none opacity-60" />
          </div>
          <span className="mt-1.5 text-[9px] font-mono tracking-widest uppercase text-amber-300 bg-black/60 px-2 py-0.5 rounded-full border border-amber-400/30 backdrop-blur-md">
            Golden Message ✨
          </span>
        </motion.div>

        {/* FLOWER HEAD: Circular Petals Array */}
        <div className="relative w-56 h-56 flex items-center justify-center mt-6">
          {petals.map((petal, i) => {
            const isDiscovered = Boolean(discoveredPetals[i]);
            return (
              <motion.div
                key={i}
                style={{
                  transformOrigin: "center center",
                  rotate: `${petal.rotate}deg`,
                }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOpenPetal(i % defaultChapters.length)}
                className="absolute w-20 h-32 cursor-pointer transition-all flex flex-col items-center"
              >
                {/* Individual Iridescent Crystal Glass Petal */}
                <div
                  className={`w-full h-full rounded-full bg-gradient-to-b ${petal.color} backdrop-blur-md border-2 border-white/40 shadow-[0_8px_32px_rgba(168,85,247,0.3),inset_0_2px_8px_rgba(255,255,255,0.6)] hover:border-white transition-all`}
                  style={{
                    clipPath: "ellipse(48% 50% at 50% 50%)",
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center -rotate-[inherit] text-white/80">
                    <Sparkles className="w-3.5 h-3.5 text-white/70" />
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Central Crystal Core */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 360] }}
            transition={{
              scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            }}
            onClick={() => handleOpenPetal(0)}
            className="relative z-20 w-16 h-16 rounded-full bg-gradient-to-br from-white via-pink-200 to-purple-300 border-2 border-white shadow-[0_0_35px_rgba(236,72,153,0.8),inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-center cursor-pointer cursor-pointer"
          >
            <Heart className="w-8 h-8 text-pink-600 fill-pink-500/40 animate-pulse" />
          </motion.div>
        </div>

        {/* Stem & Leaves */}
        <div className="relative w-full flex flex-col items-center -mt-2 pointer-events-none">
          {/* Glass stem */}
          <div className="w-1.5 h-28 bg-gradient-to-b from-emerald-400/60 via-teal-400/50 to-emerald-600/40 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)] border border-white/20" />
          {/* Glowing Leaves */}
          <div className="absolute top-8 -left-6 w-8 h-4 rounded-full bg-emerald-400/40 border border-white/30 -rotate-25 backdrop-blur-sm shadow-md" />
          <div className="absolute top-14 -right-6 w-8 h-4 rounded-full bg-emerald-400/40 border border-white/30 rotate-25 backdrop-blur-sm shadow-md" />
        </div>

        {/* Tap Prompt */}
        {!hasInteracted && (
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-2 z-30 px-4 py-1.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-[11px] font-medium text-purple-200 tracking-wide flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Touch any crystal petal to reveal a chapter</span>
          </motion.div>
        )}
      </div>

      {/* Sound Hint */}
      <p className="text-[11px] opacity-60 tracking-wider uppercase mt-3 flex items-center gap-1.5 font-sans">
        <Volume2 className="w-3.5 h-3.5 text-pink-400" />
        <span>Turn sound on for romantic soundtrack 🎵</span>
      </p>

      {/* Continue to Letter Button */}
      <div className="mt-6 w-full flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (onOpen) onOpen();
          }}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-purple-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <span>Continue to Our Love Letter</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* FROSTED GLASS CHAPTER MODAL (As seen in Video 2) */}
      <AnimatePresence>
        {activeChapter !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setActiveChapter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-lg w-full bg-gradient-to-br from-slate-900/90 via-purple-950/80 to-slate-950/95 border-2 border-purple-400/40 rounded-3xl p-6 sm:p-8 text-white shadow-[0_25px_60px_rgba(168,85,247,0.3)] backdrop-blur-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveChapter(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Chapter Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-[10px] font-mono tracking-widest uppercase text-purple-200 font-bold mb-4 self-start">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>
                  {defaultChapters[activeChapter].isGolden
                    ? "Golden Heart Chapter"
                    : `Crystal Petal 0${defaultChapters[activeChapter].petalNum}`}
                </span>
              </div>

              {/* Chapter Title */}
              <h3 className="text-2xl sm:text-3xl font-serif italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 mb-1">
                {defaultChapters[activeChapter].title}
              </h3>
              <p className="text-xs text-purple-200/60 font-sans mb-5 italic">
                {defaultChapters[activeChapter].subtitle}
              </p>

              {/* Romantic Text Body */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-sm sm:text-base leading-relaxed text-slate-100 font-serif italic mb-6">
                "{defaultChapters[activeChapter].text}"
              </div>

              {/* Action Controls */}
              <div className="flex flex-col gap-3">
                {/* Shower with Hearts and Light Button (From Video 2) */}
                <button
                  type="button"
                  onClick={showerHeartsAndLight}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Heart className="w-4 h-4 fill-pink-500 text-pink-500 animate-pulse" />
                  <span>Shower with Hearts &amp; Light 💖</span>
                </button>

                {/* Continue to Love Letter shortcut if on Golden Chapter or final petal */}
                {activeChapter === defaultChapters.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveChapter(null);
                      if (onOpen) onOpen();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <span>Read Our Full Love Letter 💌</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Chapter Navigation Arrows */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-300">
                  <button
                    type="button"
                    onClick={prevChapter}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {/* Step dots */}
                  <div className="flex items-center gap-1.5">
                    {defaultChapters.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        onClick={() => handleOpenPetal(dotIdx)}
                        className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                          dotIdx === activeChapter
                            ? "bg-purple-400 w-5"
                            : "bg-white/30 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextChapter}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
