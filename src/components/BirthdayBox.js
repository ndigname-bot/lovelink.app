"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Gift, Cake, Volume2, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export default function BirthdayBox({ giftData, onOpen, onStartAudio, styles }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLidOff, setIsLidOff] = useState(false);
  const [showContents, setShowContents] = useState(false);

  // Floating balloons configuration
  const balloons = [
    { color: "bg-pink-500", text: "🎂", delay: 0, x: -60, drift: -40 },
    { color: "bg-rose-400", text: "✨", delay: 0.15, x: 50, drift: 60 },
    { color: "bg-amber-400", text: "🎉", delay: 0.25, x: -20, drift: -25 },
    { color: "bg-fuchsia-500", text: "💖", delay: 0.35, x: 70, drift: 80 },
    { color: "bg-pink-300", text: "⭐", delay: 0.45, x: -80, drift: -70 },
    { color: "bg-rose-500", text: "🎈", delay: 0.55, x: 20, drift: 30 },
  ];

  const handleUnbox = (e) => {
    if (e) e.stopPropagation();
    if (isOpen) return;

    setIsOpen(true);

    // Trigger audio immediately on recipient interaction
    if (onStartAudio) {
      onStartAudio();
    }

    // 1. Confetti cannon burst
    try {
      confetti({
        particleCount: 75,
        spread: 90,
        origin: { y: 0.65 },
        colors: ["#ec4899", "#f43f5e", "#fbbf24", "#a855f7", "#ffffff"],
      });
    } catch (err) {
      console.warn("Confetti error:", err);
    }

    // 2. Lift lid after ribbon unties
    setTimeout(() => {
      setIsLidOff(true);
    }, 450);

    // 3. Reveal 3D inner birthday cake & gift items
    setTimeout(() => {
      setShowContents(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ["#fbbf24", "#ec4899", "#ffffff"],
        });
      } catch (e) {}
    }, 900);
  };

  return (
    <div className="z-10 w-full max-w-sm sm:max-w-md mx-auto select-none px-4 flex flex-col items-center">
      {/* Balloon particles rising out of box when opened */}
      <AnimatePresence>
        {isLidOff && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {balloons.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: "70vh", x: `calc(50vw + ${b.x}px)`, scale: 0.4 }}
                animate={{
                  opacity: [1, 1, 0],
                  y: "-20vh",
                  x: `calc(50vw + ${b.x + b.drift}px)`,
                  scale: [0.4, 1.2, 1.3],
                }}
                transition={{
                  duration: 3.2,
                  delay: b.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className={`absolute w-14 h-16 rounded-full ${b.color} shadow-lg flex items-center justify-center text-lg drop-shadow-md`}
              >
                {b.text}
                {/* Balloon knot and string */}
                <div className="absolute -bottom-1.5 w-1.5 h-1.5 bg-inherit rotate-45 rounded-xs" />
                <div className="absolute -bottom-6 w-[1px] h-5 bg-white/40" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main 3D Gift Box Stage */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
        transition={{
          opacity: { duration: 0.8 },
          scale: { duration: 0.8 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative w-full flex flex-col items-center cursor-pointer"
        onClick={handleUnbox}
        style={{ perspective: 1200 }}
      >
        {/* Ambient Back Glow */}
        <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-r from-pink-500/30 via-rose-500/25 to-amber-500/20 blur-3xl pointer-events-none" />

        {/* WhatsApp-Style Secret Delivery Tag */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-pink-500/30 backdrop-blur-xl shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-pink-300 font-semibold tracking-wider uppercase">
            Special Birthday Package 🎁
          </span>
        </motion.div>

        {/* 3D GIFT BOX CONTAINER */}
        <div className="relative w-72 sm:w-80 h-72 sm:h-80 flex flex-col items-center justify-center">

          {/* BOX LID (Animated 3D Flip) */}
          <motion.div
            animate={
              isLidOff
                ? {
                    y: -140,
                    rotateX: -115,
                    rotateZ: -12,
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.85, ease: "easeOut" },
                  }
                : isOpen
                ? { y: -20, rotateX: -20, transition: { duration: 0.3 } }
                : { y: 0, rotateX: 0 }
            }
            style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
            className="absolute top-2 z-30 w-[104%] h-20 rounded-2xl bg-gradient-to-b from-pink-500 via-rose-500 to-rose-600 shadow-[0_15px_35px_rgba(244,63,94,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)] border-2 border-pink-300/40 flex items-center justify-center"
          >
            {/* Satin Horizontal Ribbon on Lid */}
            <div className="absolute inset-x-0 h-6 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 shadow-[0_2px_8px_rgba(251,191,36,0.6)] flex items-center justify-center border-y border-amber-100/50">
              <span className="text-[9px] font-serif tracking-widest text-amber-900 font-bold uppercase opacity-80">
                HAPPY BIRTHDAY
              </span>
            </div>

            {/* Vertical Ribbon */}
            <div className="absolute inset-y-0 w-6 bg-gradient-to-b from-amber-300 via-amber-200 to-amber-400 shadow-[0_2px_8px_rgba(251,191,36,0.6)] border-x border-amber-100/50" />

            {/* Luxurious Ribbon Bow Knot */}
            <motion.div
              animate={
                isOpen
                  ? { scale: [1, 1.3, 0], opacity: 0, rotate: 45, transition: { duration: 0.4 } }
                  : { scale: [1, 1.05, 1] }
              }
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="relative -top-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 border-2 border-white/60 shadow-[0_8px_20px_rgba(251,191,36,0.7)] flex items-center justify-center cursor-pointer"
            >
              <Sparkles className="w-6 h-6 text-amber-900 drop-shadow-sm" />
              {/* Bow loops */}
              <div className="absolute -left-3 w-6 h-8 rounded-full border-2 border-amber-300/80 bg-amber-400/40 -rotate-35" />
              <div className="absolute -right-3 w-6 h-8 rounded-full border-2 border-amber-300/80 bg-amber-400/40 rotate-35" />
            </motion.div>
          </motion.div>

          {/* BOX BODY */}
          <div className="relative w-full h-64 mt-12 rounded-3xl bg-gradient-to-b from-rose-500/90 via-pink-600/90 to-rose-700/95 border-2 border-pink-300/30 shadow-[0_25px_60px_-10px_rgba(244,63,94,0.5),inset_0_4px_8px_rgba(255,255,255,0.2)] overflow-hidden flex flex-col items-center justify-between p-6">
            
            {/* Box Body Ribbon Cross */}
            <div className="absolute inset-y-0 w-6 bg-gradient-to-b from-amber-300 via-amber-200 to-amber-400 opacity-90 border-x border-amber-100/40 pointer-events-none" />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 opacity-90 border-y border-amber-100/40 pointer-events-none" />

            {/* Front Plaque / Greeting */}
            <div className="relative z-10 w-full flex flex-col items-center text-center mt-4">
              <div className="px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-mono uppercase tracking-widest text-amber-300 font-semibold mb-2 shadow-inner">
                {giftData.birthdayAge ? `${giftData.birthdayAge} Birthday Reveal` : "Exclusive Reveal"}
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif italic font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {giftData.recipientName}
              </h2>
              <p className="text-xs text-pink-100 font-sans opacity-90 flex items-center gap-1.5 mt-1">
                <span>Made with love by</span>
                <span className="font-bold underline decoration-amber-300 underline-offset-2">
                  {giftData.creatorName}
                </span>
                {giftData.wishes && giftData.wishes.length > 0 && (
                  <span className="text-amber-300 font-semibold">&amp; {giftData.wishes.length} friends</span>
                )}
              </p>
            </div>

            {/* Inner Contents Revealed When Lid Flies Off */}
            <AnimatePresence>
              {showContents && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative z-20 flex flex-col items-center bg-black/60 backdrop-blur-xl border border-white/20 p-5 rounded-2xl w-full text-center shadow-2xl mt-2"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-2 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                    <Cake className="w-6 h-6 animate-bounce" />
                  </div>
                  <h3 className="text-base font-bold text-white">Happy Birthday! 🎉</h3>
                  <p className="text-xs text-pink-200 opacity-90 mt-0.5 mb-4">
                    Your memory album &amp; letter are ready!
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpen) onOpen();
                    }}
                    className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Open My Birthday Surprises 🎁</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Unopened CTA Badge */}
            {!isOpen && (
              <div className="relative z-10 flex flex-col items-center mb-2">
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="px-5 py-2 rounded-full bg-white text-slate-900 font-bold text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(255,255,255,0.4)] flex items-center gap-2"
                >
                  <Gift className="w-4 h-4 text-rose-500" />
                  <span>Tap Box to Unbox</span>
                </motion.div>
                <span className="text-[10px] text-pink-100/70 font-mono tracking-wider uppercase mt-2">
                  Sound on for soundtrack 🎵
                </span>
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
