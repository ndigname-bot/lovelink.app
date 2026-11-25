"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  Mail,
  Camera,
  Send,
  Video,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// 🌹 ANNIVERSARY EXPERIENCE — 100% Isolated, Zero Bleed into Other Occasions
// Scenes (Standard/VIP): bloom-intro → crystal-rose → memory-lane → love-letter → reaction-booth
// Free tier: flat-card (skips all interactive scenes)
// ─────────────────────────────────────────────────────────────────────────────

const PETAL_CHAPTERS = (giftData) => [
  {
    id: 0,
    icon: "🌸",
    title: "The Moment I Knew",
    subtitle: "Chapter I",
    text: giftData?.reasons?.[0] || "From the very first moment, something told me you were extraordinary.",
    color: "from-pink-500/80 to-rose-600/80",
    angle: 72,
  },
  {
    id: 1,
    icon: "✨",
    title: "What I Love About You",
    subtitle: "Chapter II",
    text: giftData?.reasons?.[1] || "Every little thing about you — the way you laugh, the way you care — it all undoes me.",
    color: "from-purple-500/80 to-violet-600/80",
    angle: 144,
  },
  {
    id: 2,
    icon: "💫",
    title: "Our Story",
    subtitle: "Chapter III",
    text: giftData?.reasons?.[2] || "Every chapter we've written together is my favourite. And this one is no exception.",
    color: "from-indigo-500/80 to-blue-600/80",
    angle: 216,
  },
  {
    id: 3,
    icon: "🫶",
    title: "The Small Things",
    subtitle: "Chapter IV",
    text: "It's not the grand gestures — it's the quiet mornings, the inside jokes, the warmth of your hand.",
    color: "from-rose-500/80 to-pink-600/80",
    angle: 288,
  },
  {
    id: 4,
    icon: "💛",
    title: "My Vow to You",
    subtitle: "Golden Heart",
    text: giftData?.letter
      ? giftData.letter.substring(0, 220) + (giftData.letter.length > 220 ? "…" : "")
      : "Whatever comes next, I choose you. Yesterday. Today. Every day after.",
    color: "from-amber-400/90 to-yellow-500/90",
    angle: 360,
    isHeart: true,
  },
];

// ─── Starfield Particles ───────────────────────────────────────────────────
function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 4,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.1, 0.9, 0.1], scale: [1, 1.4, 1] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Crystal Petal ────────────────────────────────────────────────────────
function CrystalPetal({ chapter, discovered, onTap, petalIndex }) {
  const radius = 108;
  const angleRad = ((chapter.angle - 90) * Math.PI) / 180;
  const cx = 50 + radius * Math.cos(angleRad);
  const cy = 50 + radius * Math.sin(angleRad);

  return (
    <motion.button
      type="button"
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer border-2 shadow-xl transition-all duration-300 ${
        discovered
          ? "bg-gradient-to-br " + chapter.color + " border-white/50 shadow-pink-500/40"
          : "bg-white/5 border-white/20 backdrop-blur-sm hover:border-white/50"
      }`}
      style={{
        left: `${cx}%`,
        top: `${cy}%`,
        width: "54px",
        height: "54px",
      }}
      whileTap={{ scale: 0.88 }}
      animate={discovered ? { scale: [1, 1.18, 1], boxShadow: ["0 0 10px rgba(236,72,153,0.4)", "0 0 30px rgba(236,72,153,0.8)", "0 0 10px rgba(236,72,153,0.4)"] } : {}}
      transition={discovered ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
      onClick={() => onTap(petalIndex)}
      title={discovered ? chapter.title : "Tap to reveal"}
    >
      <span className="text-xl">{discovered ? chapter.icon : "✦"}</span>
    </motion.button>
  );
}

// ─── Chapter Modal ─────────────────────────────────────────────────────────
function ChapterModal({ chapter, onClose, onPrev, onNext, hasPrev, hasNext, onShowerHearts, styles }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 via-purple-950 to-black border border-white/10 rounded-3xl p-6 text-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="text-5xl mb-2">{chapter.icon}</div>
          <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold">{chapter.subtitle}</p>
          <h3 className="text-xl font-serif font-bold text-white leading-tight">{chapter.title}</h3>
          <p className="text-sm text-white/80 leading-relaxed italic">"{chapter.text}"</p>
        </div>

        {/* Shower Hearts Button */}
        <button
          type="button"
          onClick={onShowerHearts}
          className="mt-5 w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500/80 to-rose-500/80 border border-pink-400/40 text-white text-sm font-semibold hover:from-pink-500 hover:to-rose-500 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Heart className="w-4 h-4 fill-white" /> Shower Hearts & Light ✨
        </button>

        {/* Prev / Next navigation */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-medium flex items-center justify-center gap-1 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-medium flex items-center justify-center gap-1 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function AnniversaryExperience({ giftData, actualGiftId, onStartAudio, styles }) {
  const isFree = giftData?.tier === "free";

  const rawPhotoUrls = giftData?.photoUrls || [];
  const rawCaptions = giftData?.photoCaptions || [];
  const photoUrls = isFree ? rawPhotoUrls.slice(0, 1) : rawPhotoUrls;
  const photoCaptions = isFree ? rawCaptions.slice(0, 1) : rawCaptions;

  const recipient = giftData?.recipientName || "My Love";
  const creator = giftData?.creatorName || "Someone who loves you";
  const years = giftData?.anniversaryYears || giftData?.birthdayAge || null;

  // Scene machine — free tier never leaves flat-card
  const [scene, setScene] = useState(isFree ? "flat-card" : "bloom-intro");
  const [hasInteracted, setHasInteracted] = useState(false);

  // Crystal Rose state
  const chapters = PETAL_CHAPTERS(giftData);
  const [discoveredPetals, setDiscoveredPetals] = useState({ 0: false, 1: false, 2: false, 3: false, 4: false });
  const [activeChapter, setActiveChapter] = useState(null);
  const allDiscovered = Object.values(discoveredPetals).every(Boolean);

  // Memory Lane
  const [photoIdx, setPhotoIdx] = useState(0);
  const [photoFlipping, setPhotoFlipping] = useState(false);

  // Love Letter
  const [isLetterOpen, setIsLetterOpen] = useState(false);

  // Reaction Booth
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySent, setReplySent] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // ─── Open Tracking (fires once on first interaction) ─────────────────────
  const handleFirstInteraction = () => {
    if (hasInteracted) return;
    setHasInteracted(true);

    if (!isFree && onStartAudio) onStartAudio();

    const targetId = actualGiftId || giftData?.id;
    if (targetId && targetId !== "demo-gift" && targetId !== "draft") {
      try {
        const ref = doc(db, "gifts", targetId);
        updateDoc(ref, {
          lastOpened: new Date().toISOString(),
          firstOpenedAt: giftData?.firstOpenedAt || new Date().toISOString(),
        }).catch(console.warn);

        if (!giftData?.firstOpenedAt) {
          fetch("/api/notify-reaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ giftId: targetId, reactionType: "opened" }),
          }).catch(console.warn);
        }
      } catch (e) {
        console.warn("Anniversary open tracking error", e);
      }
    }
  };

  // ─── Petal tap ───────────────────────────────────────────────────────────
  const handlePetalTap = (idx) => {
    if (!discoveredPetals[idx]) {
      setDiscoveredPetals((prev) => ({ ...prev, [idx]: true }));
      try {
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.5 },
          colors: ["#ec4899", "#a855f7", "#f59e0b", "#ffffff"],
        });
      } catch (e) {}
    }
    setActiveChapter(idx);
  };

  const showerHearts = () => {
    try {
      confetti({ particleCount: 120, spread: 100, startVelocity: 40, origin: { y: 0.5 }, colors: ["#ec4899", "#f43f5e", "#fbbf24", "#ffffff", "#a855f7"] });
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 80, origin: { x: 0, y: 0.6 }, colors: ["#f43f5e", "#ec4899"] });
        confetti({ particleCount: 60, angle: 120, spread: 80, origin: { x: 1, y: 0.6 }, colors: ["#f43f5e", "#ec4899"] });
      }, 250);
    } catch (e) {}
  };

  const navigateChapter = (dir) => {
    const next = activeChapter + dir;
    if (next >= 0 && next < chapters.length) setActiveChapter(next);
  };

  // ─── Photo navigation ─────────────────────────────────────────────────────
  const goNextPhoto = () => {
    setPhotoFlipping(true);
    setTimeout(() => {
      setPhotoIdx((p) => Math.min(p + 1, photoUrls.length - 1));
      setPhotoFlipping(false);
    }, 400);
  };
  const goPrevPhoto = () => {
    setPhotoFlipping(true);
    setTimeout(() => {
      setPhotoIdx((p) => Math.max(p - 1, 0));
      setPhotoFlipping(false);
    }, 400);
  };

  // ─── Reaction Booth ───────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      recordedChunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      mr.onstop = () => { setRecordedVideo(new Blob(recordedChunksRef.current, { type: "video/webm" })); };
      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Camera error:", err);
      alert("Camera access denied — just type your message below instead!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() && !recordedVideo) {
      alert("Please record a video or write a message!");
      return;
    }
    setIsSendingReply(true);
    try {
      let videoContent = null;
      if (recordedVideo) {
        const reader = new FileReader();
        videoContent = await new Promise((res, rej) => {
          reader.onloadend = () => res(reader.result);
          reader.onerror = rej;
          reader.readAsDataURL(recordedVideo);
        });
      }
      const targetId = actualGiftId || giftData?.id;
      if (targetId && targetId !== "demo-gift" && targetId !== "draft") {
        const ref = doc(db, "gifts", targetId);
        await updateDoc(ref, {
          response: {
            type: recordedVideo ? "video" : "text",
            content: videoContent || replyText.trim(),
            message: replyText.trim() || "",
            createdAt: new Date().toISOString(),
          },
        });
        await fetch("/api/notify-reaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId: targetId, reactionType: recordedVideo ? "video" : "text" }),
        }).catch(console.warn);
      }
      setReplySent(true);
      try { confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ["#ec4899", "#f59e0b", "#a855f7"] }); } catch (e) {}
    } catch (e) {
      console.error("Anniversary reaction error:", e);
      alert("Failed to send — please try again.");
    } finally {
      setIsSendingReply(false);
    }
  };

  // ─── Stop webcam on scene change ──────────────────────────────────────────
  useEffect(() => {
    if (scene !== "reaction-booth" && streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [scene]);

  // ══════════════════════════════════════════════════════════════════════════
  // FREE TIER — Flat Anniversary Card
  // ══════════════════════════════════════════════════════════════════════════
  if (isFree) {
    return (
      <div
        className="relative w-full min-h-[92vh] flex flex-col items-center justify-center px-4 py-10 overflow-hidden bg-gradient-to-br from-purple-950 via-slate-900 to-black text-white"
        onClick={handleFirstInteraction}
      >
        <StarField />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 w-full max-w-sm mx-auto text-center space-y-6"
        >
          {/* Anniversary Badge */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">💍</span>
            <div>
              <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold">Happy Anniversary</p>
              {years && <p className="text-xs text-pink-400 font-medium">{years} Beautiful Year{years !== "1" ? "s" : ""} Together ✨</p>}
            </div>
            <span className="text-3xl">💍</span>
          </div>

          {/* Recipient Name */}
          <h1 className="text-4xl font-serif italic font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent leading-tight">
            For {recipient}
          </h1>

          {/* Hero Photo */}
          {photoUrls[0] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative mx-auto w-64 h-64 rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.25)]"
            >
              <img src={photoUrls[0]} alt="Anniversary memory" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>
          )}

          {/* Letter */}
          {giftData?.letter && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-sm text-white/80 italic leading-relaxed px-2 font-serif"
            >
              "{giftData.letter.substring(0, 300)}{giftData.letter.length > 300 ? "…" : ""}"
            </motion.p>
          )}

          {/* From */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-xs text-pink-300/80 font-medium"
          >
            — with love, {creator} 💕
          </motion.p>

          {/* Floating hearts */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-pink-400 pointer-events-none select-none"
              style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, fontSize: `${12 + i * 2}px` }}
              animate={{ y: [0, -18, 0], opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 3 + i * 0.5, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            >
              ♥
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STANDARD / VIP TIER — Full 5-Scene Interactive Flow
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="relative w-full min-h-[92vh] flex flex-col items-center justify-center overflow-hidden text-white">
      <StarField />

      <AnimatePresence mode="wait">

        {/* ── SCENE 1: BLOOM INTRO ─────────────────────────────────────────── */}
        {scene === "bloom-intro" && (
          <motion.div
            key="bloom-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer select-none px-6 text-center"
            onClick={() => {
              handleFirstInteraction();
              try {
                confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 }, colors: ["#ec4899", "#a855f7", "#f59e0b", "#ffffff"] });
              } catch (e) {}
              setScene("crystal-rose");
            }}
          >
            {/* Glow aura */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-black" />
            <div className="absolute w-72 h-72 rounded-full bg-purple-600/20 blur-[80px] pointer-events-none" />

            {/* Pulsing crystal bud */}
            <motion.div
              animate={{ scale: [1, 1.12, 1], filter: ["drop-shadow(0 0 12px rgba(216,180,254,0.5))", "drop-shadow(0 0 32px rgba(216,180,254,0.9))", "drop-shadow(0 0 12px rgba(216,180,254,0.5))"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 mb-8"
            >
              <div className="text-7xl">🌹</div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.9 }}
              className="relative z-10 text-3xl sm:text-4xl font-serif italic font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent mb-3"
            >
              For {recipient}
            </motion.h1>

            {years && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="relative z-10 text-sm text-purple-300 font-medium mb-6"
              >
                {years} Year{years !== "1" ? "s" : ""} of Us ✨
              </motion.p>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.6, 1] }}
              transition={{ delay: 1.4, duration: 2, repeat: Infinity }}
              className="relative z-10 text-xs text-white/50 tracking-widest uppercase"
            >
              Tap anywhere to begin
            </motion.p>
          </motion.div>
        )}

        {/* ── SCENE 2: CRYSTAL ROSE ────────────────────────────────────────── */}
        {scene === "crystal-rose" && (
          <motion.div
            key="crystal-rose"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full min-h-[92vh] flex flex-col items-center justify-center px-4 py-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-black" />

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative z-10 text-center mb-6"
            >
              <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-1">Our Love Story</p>
              <h2 className="text-2xl font-serif italic font-bold text-white">The Crystal Rose 🌹</h2>
              <p className="text-xs text-white/50 mt-1">
                {Object.values(discoveredPetals).filter(Boolean).length} / {chapters.length} petals discovered
              </p>
            </motion.div>

            {/* Flower Container */}
            <div className="relative z-10" style={{ width: "280px", height: "280px" }}>
              {/* Center golden heart */}
              <motion.button
                type="button"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/90 to-yellow-500/90 border-2 border-amber-300/60 shadow-[0_0_30px_rgba(251,191,36,0.5)] flex items-center justify-center cursor-pointer z-20"
                animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 20px rgba(251,191,36,0.4)", "0 0 40px rgba(251,191,36,0.8)", "0 0 20px rgba(251,191,36,0.4)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                onClick={() => handlePetalTap(4)}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-2xl">{discoveredPetals[4] ? "💛" : "✦"}</span>
              </motion.button>

              {/* 4 Surrounding Petals */}
              {chapters.slice(0, 4).map((ch, idx) => (
                <CrystalPetal
                  key={ch.id}
                  chapter={ch}
                  discovered={discoveredPetals[idx]}
                  onTap={handlePetalTap}
                  petalIndex={idx}
                />
              ))}
            </div>

            {/* Discover hint */}
            {!allDiscovered && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.5, 1] }}
                transition={{ delay: 1, duration: 2.5, repeat: Infinity }}
                className="relative z-10 mt-5 text-xs text-white/40 text-center"
              >
                Tap each petal to reveal a chapter 🌸
              </motion.p>
            )}

            {/* Continue button when all discovered */}
            <AnimatePresence>
              {allDiscovered && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    try { confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 }, colors: ["#ec4899", "#a855f7", "#f59e0b", "#ffffff"] }); } catch (e) {}
                    setScene("memory-lane");
                  }}
                  className="relative z-10 mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm flex items-center gap-2 shadow-xl hover:from-pink-400 hover:to-purple-500 active:scale-95 transition-all"
                >
                  Continue to Memory Lane <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── SCENE 3: MEMORY LANE ─────────────────────────────────────────── */}
        {scene === "memory-lane" && (
          <motion.div
            key="memory-lane"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.7 }}
            className="relative w-full min-h-[92vh] flex flex-col items-center justify-center px-4 py-10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-black" />

            <div className="relative z-10 w-full max-w-sm text-center space-y-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-1">Memory Lane</p>
                <h2 className="text-2xl font-serif italic font-bold text-white">Our Favourite Moments 📸</h2>
              </div>

              {photoUrls.length > 0 ? (
                <>
                  {/* Polaroid Card */}
                  <motion.div
                    animate={{ opacity: photoFlipping ? 0 : 1, rotateY: photoFlipping ? 90 : 0 }}
                    transition={{ duration: 0.35 }}
                    className="mx-auto w-64 bg-white p-3 pb-8 rounded-sm shadow-2xl"
                    style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)" }}
                  >
                    <div className="w-full h-56 overflow-hidden rounded-sm bg-gray-200">
                      <img
                        src={photoUrls[photoIdx]}
                        alt={`Memory ${photoIdx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {photoCaptions[photoIdx] && (
                      <p className="mt-2 text-center text-xs text-gray-700 font-serif italic leading-snug">
                        {photoCaptions[photoIdx]}
                      </p>
                    )}
                  </motion.div>

                  {/* Photo counter */}
                  <p className="text-xs text-white/40">
                    {photoIdx + 1} / {photoUrls.length}
                  </p>

                  {/* Prev / Next */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={goPrevPhoto}
                      disabled={photoIdx === 0}
                      className="p-2 rounded-full bg-white/10 border border-white/20 disabled:opacity-30 hover:bg-white/20 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={goNextPhoto}
                      disabled={photoIdx === photoUrls.length - 1}
                      className="p-2 rounded-full bg-white/10 border border-white/20 disabled:opacity-30 hover:bg-white/20 transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="mx-auto w-64 h-64 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 text-white/40">
                  <span className="text-5xl">📷</span>
                  <p className="text-sm">No photos added</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setScene("love-letter")}
                className="mt-2 mx-auto px-8 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm flex items-center gap-2 shadow-xl hover:from-indigo-400 hover:to-purple-500 active:scale-95 transition-all"
              >
                Continue to Our Love Letter <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── SCENE 4: LOVE LETTER ─────────────────────────────────────────── */}
        {scene === "love-letter" && (
          <motion.div
            key="love-letter"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full min-h-[92vh] flex flex-col items-center justify-center px-4 py-10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-rose-950 to-black" />

            <div className="relative z-10 w-full max-w-sm text-center space-y-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-rose-400 font-semibold mb-1">A Letter From The Heart</p>
                <h2 className="text-2xl font-serif italic font-bold text-white">Our Love Letter 💌</h2>
              </div>

              {/* Wax seal envelope */}
              {!isLetterOpen ? (
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsLetterOpen(true)}
                  className="mx-auto w-72 cursor-pointer select-none"
                >
                  <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl p-6 shadow-2xl border border-amber-200/40 flex flex-col items-center gap-4"
                    style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
                  >
                    {/* Envelope flap */}
                    <div className="w-full h-16 bg-gradient-to-b from-rose-100 to-amber-100 rounded-t-xl relative overflow-hidden border-b border-rose-200/40"
                      style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                    />
                    {/* Wax seal */}
                    <div className="text-5xl -mt-6">🔴</div>
                    <p className="text-rose-700 text-sm font-serif italic font-semibold">Sealed with Love</p>
                    <p className="text-rose-600/70 text-xs">Tap to open your letter</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20, rotateX: -15 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.7 }}
                  className="mx-auto w-full max-w-xs bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl p-5 shadow-2xl border border-amber-200/40 text-left"
                  style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
                >
                  <p className="text-xs text-rose-400 uppercase tracking-widest font-semibold mb-3 text-center">With all my heart</p>
                  <p className="text-gray-800 text-sm font-serif italic leading-relaxed whitespace-pre-line">
                    {giftData?.letter || `Dear ${recipient},\n\nEvery moment with you is a gift. Thank you for being my person.`}
                  </p>
                  <p className="mt-4 text-right text-xs text-rose-600 font-serif italic">— {creator} 💕</p>
                </motion.div>
              )}

              {isLetterOpen && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setScene("reaction-booth")}
                  className="mx-auto px-8 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-sm flex items-center gap-2 shadow-xl hover:from-rose-400 hover:to-pink-500 active:scale-95 transition-all"
                >
                  Record Your Reaction <Video className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── SCENE 5: REACTION BOOTH ──────────────────────────────────────── */}
        {scene === "reaction-booth" && (
          <motion.div
            key="reaction-booth"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full min-h-[92vh] flex flex-col items-center justify-center px-4 py-10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-black" />

            <div className="relative z-10 w-full max-w-sm text-center space-y-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-1">Reaction Booth</p>
                <h2 className="text-2xl font-serif italic font-bold text-white">Send Your Love Back 💌</h2>
                <p className="text-xs text-white/50 mt-1">Your reaction goes straight to {creator}'s inbox</p>
              </div>

              {replySent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 py-8"
                >
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full border border-emerald-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Love Sent! 💕</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {creator} will see your reaction in their inbox. Happy Anniversary! 🎉
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Webcam / Preview */}
                  <div className="mx-auto w-64 h-48 rounded-2xl overflow-hidden bg-black/50 border border-white/10 shadow-xl relative">
                    {recordedVideo ? (
                      <video
                        src={URL.createObjectURL(recordedVideo)}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                    {isRecording && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500/80 rounded-full px-2 py-1">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-white text-[10px] font-bold">REC</span>
                      </div>
                    )}
                  </div>

                  {/* Record / Stop / Re-record */}
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {!recordedVideo ? (
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 ${
                          isRecording
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
                        }`}
                      >
                        {isRecording ? (
                          <><div className="w-3 h-3 rounded bg-white animate-pulse" /> Stop Recording</>
                        ) : (
                          <><Camera className="w-4 h-4" /> Start Recording</>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRecordedVideo(null)}
                        className="px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                      >
                        <RotateCw className="w-4 h-4" /> Re-record
                      </button>
                    )}
                  </div>

                  {/* Text reply */}
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Write a message to ${creator}... 💕`}
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 resize-none focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                  />

                  {/* Send button */}
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={isSendingReply || (!replyText.trim() && !recordedVideo)}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl hover:from-pink-400 hover:to-purple-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSendingReply ? (
                      <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send My Reaction 💕</>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter Modal */}
      <AnimatePresence>
        {activeChapter !== null && scene === "crystal-rose" && (
          <ChapterModal
            chapter={chapters[activeChapter]}
            onClose={() => setActiveChapter(null)}
            onPrev={() => navigateChapter(-1)}
            onNext={() => navigateChapter(1)}
            hasPrev={activeChapter > 0}
            hasNext={activeChapter < chapters.length - 1}
            onShowerHearts={showerHearts}
            styles={styles}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
