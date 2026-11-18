"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Cake,
  Gift,
  Heart,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Mail,
  Camera,
  Send,
  Video,
  CheckCircle2,
  Users,
  Image as ImageIcon,
  PartyPopper,
  ArrowRight,
  RotateCw,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function BirthdayExperience({
  giftData,
  onStartAudio,
  actualGiftId,
  styles,
}) {
  // Main Scenes: 'dark-candle' | 'cake-reveal' | 'box-ready' | 'box-unboxing' | 'photo-impact' | 'kudoboard-playlist' | 'box-letter' | 'grand-banner' | 'reaction-booth'
  const [scene, setScene] = useState("dark-candle");
  const [roomLit, setRoomLit] = useState(false);
  const [candleBlown, setCandleBlown] = useState(false);
  const [isLidOff, setIsLidOff] = useState(false);

  // Photo Stream State
  const photoUrls = giftData?.photoUrls || [];
  const photoCaptions = giftData?.photoCaptions || [];
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isPhotoPaused, setIsPhotoPaused] = useState(false);
  const [isPhotoBlowingOff, setIsPhotoBlowingOff] = useState(false);
  const photoTimerRef = useRef(null);

  // Group Kudoboard State
  const isGroupMode = giftData?.giftMode === "group" || (giftData?.wishes && giftData?.wishes.length > 0);
  const wishes = giftData?.wishes || [];
  const [selectedWish, setSelectedWish] = useState(null);

  // Letter State
  const hasLetter = Boolean(giftData?.letter && giftData.letter.trim().length > 0);
  const [isLetterOpen, setIsLetterOpen] = useState(false);

  // Reaction Booth State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replySent, setReplySent] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Preload images silently
  useEffect(() => {
    if (typeof window !== "undefined" && photoUrls.length > 0) {
      photoUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [photoUrls]);

  // Handle Initial Screen Tap: Ignites audio and illuminates room
  const handleIgniteCelebration = () => {
    if (scene !== "dark-candle") return;

    if (onStartAudio) {
      onStartAudio();
    }

    setRoomLit(true);

    // Shockwave confetti flash
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#fbbf24", "#f59e0b", "#ec4899", "#ffffff"],
      });
    } catch (e) {}

    // Light up room and transition to 3D cake reveal
    setTimeout(() => {
      setScene("cake-reveal");

      // 3 seconds later, slide the 3D Birthday Box in
      setTimeout(() => {
        setScene("box-ready");
      }, 3000);
    }, 1000);
  };

  // Blow out candle interactivity
  const handleBlowCandle = (e) => {
    if (e) e.stopPropagation();
    if (candleBlown) return;

    setCandleBlown(true);
    try {
      confetti({
        particleCount: 75,
        spread: 85,
        origin: { y: 0.42 },
        colors: ["#fbbf24", "#f59e0b", "#ec4899", "#a855f7", "#ffffff"],
      });
    } catch (err) {}

    // Advance to box if not yet shown
    setTimeout(() => {
      setScene("box-ready");
    }, 1200);
  };

  // Box shake state before lid pops
  const [isBoxShaking, setIsBoxShaking] = useState(false);
  const [showLightRays, setShowLightRays] = useState(false);
  const [photoImpactFlash, setPhotoImpactFlash] = useState(false);

  // Open the 3D Gift Box — with shake → lid pop → light rays sequence
  const handleOpenGiftBox = () => {
    if (isBoxShaking || isLidOff) return;
    setIsBoxShaking(true);

    // 3 dramatic shakes, then lid pops
    setTimeout(() => {
      setIsBoxShaking(false);
      setIsLidOff(true);
      setShowLightRays(true);
      setScene("box-unboxing");

      try {
        confetti({
          particleCount: 180,
          spread: 130,
          startVelocity: 45,
          origin: { y: 0.65 },
          colors: ["#ec4899", "#fbbf24", "#8b5cf6", "#10b981", "#ffffff", "#f97316"],
        });
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 70,
            origin: { x: 0, y: 0.6 },
            colors: ["#fbbf24", "#ec4899", "#ffffff"],
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 70,
            origin: { x: 1, y: 0.6 },
            colors: ["#fbbf24", "#ec4899", "#ffffff"],
          });
        }, 300);
      } catch (err) {}

      // Hide light rays after 3s, then transition
      setTimeout(() => setShowLightRays(false), 3000);

      setTimeout(() => {
        if (isGroupMode && wishes.length > 0) {
          setScene("kudoboard-playlist");
        } else if (photoUrls.length > 0) {
          setActivePhotoIdx(0);
          setIsPhotoBlowingOff(false);
          setScene("photo-impact");
        } else if (hasLetter) {
          setScene("box-letter");
        } else {
          setScene("grand-banner");
        }
      }, 4500);
    }, 900);
  };

  // Auto-advance photo stream with "blow off" effect
  const triggerNextPhoto = () => {
    setIsPhotoBlowingOff(true);
    setTimeout(() => {
      if (activePhotoIdx < photoUrls.length - 1) {
        setActivePhotoIdx((prev) => prev + 1);
        setIsPhotoBlowingOff(false);
      } else {
        // All photos completed! Transition to 90° box tilt / letter or grand banner
        if (hasLetter) {
          setScene("box-letter");
        } else {
          setScene("grand-banner");
        }
      }
    }, 550);
  };

  useEffect(() => {
    if (scene === "photo-impact" && !isPhotoPaused && !isPhotoBlowingOff && photoUrls.length > 0) {
      photoTimerRef.current = setTimeout(() => {
        triggerNextPhoto();
      }, 4500);
    }
    return () => clearTimeout(photoTimerRef.current);
  }, [scene, activePhotoIdx, isPhotoPaused, isPhotoBlowingOff, photoUrls.length]);

  // Trigger flash on new photo impact
  useEffect(() => {
    if (scene === "photo-impact") {
      setPhotoImpactFlash(true);
      setTimeout(() => setPhotoImpactFlash(false), 400);
    }
  }, [scene, activePhotoIdx]);

  // Richer dummy mini-polaroid cards — varied colors, realistic polaroid style
  const dummyPictures = [
    { emoji: "🎂", label: "Cake Time!", delay: 0,    x: -80,  drift: -50, rot: -20, bg: "from-pink-400 to-rose-500" },
    { emoji: "✨", label: "Wishes...", delay: 0.18,  x: 55,   drift: 60,  rot: 16,  bg: "from-amber-400 to-orange-500" },
    { emoji: "💖", label: "With love", delay: 0.32,  x: -20,  drift: -35, rot: -9,  bg: "from-fuchsia-400 to-pink-500" },
    { emoji: "👑", label: "Queen/King", delay: 0.48, x: 85,   drift: 75,  rot: 22,  bg: "from-yellow-400 to-amber-500" },
    { emoji: "🎈", label: "Celebrate!", delay: 0.62, x: -95,  drift: -80, rot: -24, bg: "from-red-400 to-rose-600" },
    { emoji: "🎉", label: "Party on!",  delay: 0.78, x: 25,   drift: 40,  rot: 13,  bg: "from-violet-400 to-purple-600" },
    { emoji: "⭐", label: "Superstar",  delay: 0.95, x: -50,  drift: -45, rot: -15, bg: "from-cyan-400 to-blue-500" },
    { emoji: "🎁", label: "Surprise!",  delay: 1.12, x: 60,   drift: 65,  rot: 18,  bg: "from-emerald-400 to-teal-600" },
    { emoji: "🥂", label: "Cheers!",    delay: 1.28, x: -110, drift: -90, rot: -26, bg: "from-lime-400 to-green-500" },
    { emoji: "🌟", label: "Shine on",   delay: 1.44, x: 100,  drift: 85,  rot: 28,  bg: "from-sky-400 to-indigo-500" },
    { emoji: "💫", label: "Magic!",     delay: 1.60, x: -35,  drift: -55, rot: -12, bg: "from-pink-500 to-fuchsia-600" },
    { emoji: "🫶", label: "Big love",   delay: 1.75, x: 40,   drift: 50,  rot: 10,  bg: "from-rose-400 to-pink-600" },
  ];

  // Reaction Booth Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        setRecordedVideo(blob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Camera permission error:", err);
      alert("Camera access was not permitted. You can type your thank-you message below!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() && !recordedVideo) {
      alert("Please enter a thank-you note or record a video reaction!");
      return;
    }
    setIsSendingReply(true);
    try {
      setReplySent(true);
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (e) {
      console.error(e);
      alert("Failed to send reaction.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const recipient = giftData?.recipientName || "Cutie";
  const creator = giftData?.creatorName || "Someone who loves you";
  // The exact imputed age from the user
  const rawAge = giftData?.birthdayAge ? String(giftData.birthdayAge).replace(/[^0-9]/g, "") : "";
  const displayAge = rawAge ? rawAge : null;

  return (
    <div
      className={`relative w-full min-h-[92vh] flex flex-col items-center justify-center transition-colors duration-1000 ${
        scene === "dark-candle" && !roomLit
          ? "bg-[#030305] text-white"
          : "bg-transparent text-white"
      }`}
    >
      {/* GOD RAYS / LIGHT BEAMS BURSTING FROM OPEN BOX */}
      <AnimatePresence>
        {showLightRays && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0.9, 0.7, 0], scale: [0.3, 1.2, 1.4, 1.7] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.2, ease: "easeOut" }}
            className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden"
          >
            <div className="relative w-[34rem] h-[34rem] animate-spin-slow">
              {[...Array(12)].map((_, idx) => (
                <div
                  key={idx}
                  style={{ transform: `rotate(${idx * 30}deg)` }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-2 h-full bg-gradient-to-t from-amber-300/50 via-pink-400/30 to-transparent blur-md" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING MINI POLAROID CARDS (Alexx.dev Balloon Physics) */}
      <AnimatePresence>
        {isLidOff && (
          <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            {dummyPictures.map((d, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  y: "65vh",
                  x: `calc(50vw + ${d.x}px)`,
                  scale: 0.3,
                  rotate: 0,
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: ["65vh", "22vh", "-30vh"],
                  x: [
                    `calc(50vw + ${d.x}px)`,
                    `calc(50vw + ${d.x + d.drift * 0.5}px)`,
                    `calc(50vw + ${d.x + d.drift}px)`,
                  ],
                  scale: [0.3, 0.95, 1.15],
                  rotate: [0, d.rot * 0.7, d.rot * 1.8],
                }}
                transition={{
                  duration: 5.8,
                  delay: d.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute w-16 h-20 rounded-xl bg-white p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.35)] flex flex-col items-center justify-between border-2 border-pink-300/80"
              >
                <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${d.bg} flex items-center justify-center text-xl shadow-inner`}>
                  {d.emoji}
                </div>
                <span className="text-[7px] font-mono font-bold text-slate-600 tracking-wider uppercase">
                  {d.label}
                </span>
                {/* Dangling Balloon / Polaroid String */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-7 bg-pink-400/50 rounded-full" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* SCENE 1: PITCH BLACK ROOM WITH THE PERSON'S IMPUTED AGE CANDLE */}
      <AnimatePresence mode="wait">
        {scene === "dark-candle" && (
          <motion.div
            key="scene-dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.9 }}
            onClick={handleIgniteCelebration}
            className="fixed inset-0 z-50 bg-[#030305] flex flex-col items-center justify-center cursor-pointer select-none p-6 text-center"
          >
            {/* The Person's Imputed Age Burning Candle */}
            <div className="relative flex flex-col items-center">
              {/* Flame Radiance Halo */}
              <motion.div
                animate={{
                  scale: [1, 1.25, 0.95, 1.3, 1],
                  opacity: [0.65, 0.95, 0.6, 1, 0.65],
                }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="absolute -top-20 w-48 h-48 rounded-full bg-amber-400/25 blur-3xl pointer-events-none"
              />

              {/* Number Candles for the Imputed Age */}
              <div className="relative z-10 flex items-center justify-center gap-3">
                {displayAge ? (
                  displayAge.split("").map((digit, idx) => (
                    <div key={idx} className="relative flex flex-col items-center">
                      {/* Flickering Flame */}
                      <motion.div
                        animate={{
                          rotate: [-3, 4, -2, 3, -3],
                          scaleY: [1, 1.18, 0.92, 1.12, 1],
                        }}
                        transition={{ repeat: Infinity, duration: 1.1 + idx * 0.15, ease: "easeInOut" }}
                        className="relative w-6 h-10 mb-1"
                      >
                        <div className="w-full h-full rounded-[50%_50%_20%_20%_/_70%_70%_30%_30%] bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-100 shadow-[0_0_30px_rgba(251,191,36,0.95)]" />
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-4 rounded-full bg-cyan-200/90 blur-[0.5px]" />
                      </motion.div>

                      {/* Candle Wick */}
                      <div className="w-1 h-2 bg-slate-900 rounded-t-xs" />

                      {/* Number Candle Body */}
                      <div className="px-4 py-2 rounded-2xl bg-gradient-to-br from-amber-100 via-amber-300 to-amber-500 text-amber-950 font-black text-4xl sm:text-5xl font-mono shadow-[0_10px_25px_rgba(251,191,36,0.4)] border-2 border-white/80">
                        {digit}
                      </div>
                    </div>
                  ))
                ) : (
                  /* Single Spiral Birthday Candle if Age Omitted */
                  <div className="relative flex flex-col items-center">
                    <motion.div
                      animate={{
                        rotate: [-3, 3, -2, 2, -3],
                        scaleY: [1, 1.15, 0.95, 1.1, 1],
                      }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      className="relative w-7 h-12 mb-1"
                    >
                      <div className="w-full h-full rounded-[50%_50%_20%_20%_/_70%_70%_30%_30%] bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-100 shadow-[0_0_35px_rgba(251,191,36,1)]" />
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-4.5 rounded-full bg-cyan-200/90 blur-[0.5px]" />
                    </motion.div>
                    <div className="w-1 h-2.5 bg-slate-900" />
                    <div className="w-8 h-24 rounded-t-xl bg-gradient-to-b from-rose-200 via-pink-400 to-rose-500 border border-white/60 shadow-2xl flex items-center justify-center font-bold text-white text-xs">
                      ✨
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tap Instruction */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-14 space-y-2"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-mono tracking-widest uppercase text-amber-300 shadow-2xl">
                <Sparkles className="w-4 h-4 animate-spin-slow text-amber-400" />
                <span>Tap Anywhere to Light Up</span>
              </div>
              <p className="text-sm text-slate-400 font-sans tracking-wide">
                Touch your screen to ignite the celebration 🎂
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* SCENE 2: ROOM ILLUMINATES & 3D CAKE IS REVEALED */}
        {scene === "cake-reveal" && (
          <motion.div
            key="scene-cake"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-lg mx-auto flex flex-col items-center text-center px-4 py-8 select-none"
          >
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1 mb-8"
            >
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full">
                🎂 Happy Birthday, {recipient}!
              </span>
              <h1 className="text-3xl sm:text-5xl font-serif italic font-bold text-white drop-shadow-md">
                Make a Wish.
              </h1>
            </motion.div>

            {/* 3D Birthday Cake */}
            <div
              className="relative flex flex-col items-center cursor-pointer group my-4"
              onClick={handleBlowCandle}
              title="Tap candle to blow it out!"
            >
              {!candleBlown && (
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-16 w-36 h-36 rounded-full bg-amber-400/25 blur-3xl pointer-events-none"
                />
              )}

              {/* Number Candles on Top of Cake */}
              <div className="relative z-10 flex items-center justify-center gap-2 mb-1">
                {displayAge ? (
                  displayAge.split("").map((digit, idx) => (
                    <div key={idx} className="relative flex flex-col items-center">
                      {!candleBlown && (
                        <motion.div
                          animate={{ scaleY: [1, 1.15, 0.9, 1.1], rotate: [-2, 3, -2] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="w-4 h-7 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-100 shadow-[0_0_20px_rgba(251,191,36,0.9)] mb-1"
                        />
                      )}
                      <div className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 text-amber-950 font-black text-2xl sm:text-3xl font-mono shadow-lg border border-white/70">
                        {digit}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative flex flex-col items-center">
                    {!candleBlown && (
                      <motion.div
                        animate={{ scaleY: [1, 1.2, 1], rotate: [-3, 3, -3] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-5 h-8 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_25px_rgba(251,191,36,1)] mb-1"
                      />
                    )}
                    <div className="w-6 h-12 rounded-t-lg bg-gradient-to-b from-pink-300 via-rose-400 to-pink-500 border border-white/50 shadow-md flex items-center justify-center text-xs font-bold text-white">
                      ✨
                    </div>
                  </div>
                )}
              </div>

              {/* 3D Tiered Cake Stand */}
              <div className="w-56 sm:w-64 flex flex-col items-center">
                <div className="w-36 h-14 rounded-t-2xl bg-gradient-to-r from-pink-300 via-rose-200 to-pink-300 border-2 border-white/50 shadow-md relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-0 inset-x-0 h-3 bg-white/70 rounded-full blur-[1px]" />
                  <span className="text-xs font-serif italic text-rose-900 font-bold">celebrate</span>
                </div>
                <div className="w-52 sm:w-60 h-20 rounded-t-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 border-2 border-pink-300/60 shadow-2xl relative overflow-hidden flex items-center justify-around px-4">
                  <div className="absolute top-0 inset-x-0 h-4 bg-white/40 [clip-path:polygon(0_0,100%_0,95%_100%,85%_60%,75%_100%,65%_60%,55%_100%,45%_60%,35%_100%,25%_60%,15%_100%,5%_60%,0_100%)]" />
                  <span className="text-xl">🍓</span>
                  <span className="text-xl">✨</span>
                  <span className="text-xl">💖</span>
                  <span className="text-xl">🍓</span>
                </div>
                <div className="w-64 sm:w-72 h-4 rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 border border-amber-100 shadow-xl" />
              </div>

              {/* Candle Prompt */}
              <p className="text-xs text-amber-200/90 mt-4 font-sans flex items-center gap-1.5">
                {candleBlown ? (
                  <span className="text-emerald-400 font-semibold">✨ Wish made! Opening your package...</span>
                ) : (
                  <span>💨 Tap candle to blow it out</span>
                )}
              </p>
            </div>
          </motion.div>
        )}

        {/* SCENE 3: 3D BIRTHDAY BOX READY TO OPEN */}
        {(scene === "box-ready" || scene === "box-unboxing") && (
          <motion.div
            key="scene-box"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center px-4 py-8 select-none"
            style={{ perspective: 1200 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-pink-500/30 backdrop-blur-xl shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-pink-300 font-semibold tracking-wider uppercase">
                Special Birthday Package 🎁
              </span>
            </div>

            {/* 3D GIFT BOX WITH SHAKE & ROTATION */}
            <motion.div
              animate={
                isBoxShaking
                  ? {
                      x: [-4, 4, -7, 7, -4, 4, -2, 2, 0],
                      y: [-2, 2, -3, 3, -1, 1, 0],
                      rotateZ: [-2, 2, -3, 3, -1, 1, 0],
                      transition: { duration: 0.9, ease: "easeInOut" },
                    }
                  : {
                      rotateY: [-4, 4, -4],
                      rotateX: [2, -2, 2],
                      transition: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                    }
              }
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-72 sm:w-80 h-72 sm:h-80 flex flex-col items-center justify-center cursor-pointer group"
              onClick={handleOpenGiftBox}
            >
              {/* Box Ambient Glow */}
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-r from-pink-500/30 via-rose-500/25 to-amber-500/20 blur-3xl pointer-events-none" />

              {/* 3D BOX LID */}
              <motion.div
                animate={
                  isLidOff
                    ? {
                        y: -140,
                        rotateX: -115,
                        rotateZ: -12,
                        opacity: 0,
                        scale: 0.85,
                        transition: { duration: 0.85, ease: "easeOut" },
                      }
                    : {
                        y: [0, -4, 0],
                        transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                      }
                }
                style={{ transformStyle: "preserve-3d", transformOrigin: "top center" }}
                className="absolute -top-3 z-30 w-[104%] h-20 rounded-2xl bg-gradient-to-r from-rose-100 via-pink-50 to-rose-100 border-2 border-pink-300 shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center overflow-visible"
              >
                {/* Horizontal Ribbon on Lid (Unravels) */}
                <motion.div
                  animate={isLidOff ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-x-0 h-6 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 shadow-md border-y border-pink-200/60"
                />
                {/* Vertical Ribbon on Lid (Unravels) */}
                <motion.div
                  animate={isLidOff ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-y-0 w-6 bg-gradient-to-b from-pink-500 via-rose-400 to-pink-500 shadow-md border-x border-pink-200/60"
                />

                {/* Ribbon Bow with Untie / Spin / Dissolve animation */}
                <motion.div
                  animate={
                    isLidOff
                      ? { scale: [1, 1.4, 0], rotate: 180, opacity: 0, transition: { duration: 0.6 } }
                      : isBoxShaking
                      ? { scale: [1, 1.2, 0.9, 1.15, 1], rotate: [-10, 10, -8, 8, 0], transition: { duration: 0.9 } }
                      : { rotate: [0, 3, -3, 0], transition: { repeat: Infinity, duration: 4 } }
                  }
                  className="relative -top-4 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 via-rose-500 to-pink-600 border-2 border-white shadow-lg flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                  <div className="absolute -left-3 w-5 h-7 rounded-full border-2 border-pink-300 bg-pink-500/50 -rotate-35" />
                  <div className="absolute -right-3 w-5 h-7 rounded-full border-2 border-pink-300 bg-pink-500/50 rotate-35" />
                </motion.div>
              </motion.div>

              {/* BOX BODY */}
              <div className="relative w-full h-64 mt-12 rounded-3xl bg-gradient-to-b from-rose-500 via-pink-600 to-rose-700 border-2 border-pink-300/40 shadow-[0_25px_60px_-10px_rgba(244,63,94,0.5)] overflow-hidden flex flex-col items-center justify-between p-6">
                {/* Ribbon Cross on Body (Unravels) */}
                <motion.div
                  animate={isLidOff ? { scaleY: 0, opacity: 0 } : { scaleY: 1, opacity: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-y-0 w-6 bg-gradient-to-b from-pink-400 via-rose-300 to-pink-400 border-x border-white/30 pointer-events-none origin-bottom"
                />
                <motion.div
                  animate={isLidOff ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 bg-gradient-to-r from-pink-400 via-rose-300 to-pink-400 border-y border-white/30 pointer-events-none"
                />

                {/* Front Plaque */}
                <div className="relative z-10 w-full flex flex-col items-center text-center mt-3">
                  <div className="px-3 py-0.5 rounded-full bg-black/40 border border-white/20 text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold mb-1">
                    {displayAge ? `${displayAge}th Birthday Reveal` : "Exclusive Reveal"}
                  </div>
                  <h2 className="text-3xl font-serif italic font-bold text-white drop-shadow-md">
                    {recipient}
                  </h2>
                  <p className="text-xs text-pink-100 opacity-90 mt-1">
                    Made with love by <strong className="underline decoration-amber-300">{creator}</strong>
                  </p>
                </div>

                {/* Tap to Open CTA */}
                <button
                  type="button"
                  onClick={handleOpenGiftBox}
                  className="relative z-10 w-full py-3 rounded-xl bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Gift className="w-4 h-4 text-amber-950" />
                  <span>Tap Box to Open 🎁</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* SCENE 4: ACTUAL UPLOADED PICTURES FLY FORWARD & "HIT THE SCREEN" */}
        {scene === "photo-impact" && photoUrls.length > 0 && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            {/* Impact Flash Shockwave */}
            <AnimatePresence>
              {photoImpactFlash && (
                <motion.div
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-0 bg-white pointer-events-none z-30"
                />
              )}
            </AnimatePresence>

            {/* Header / Memory Progress */}
            <div className="absolute top-6 inset-x-0 max-w-md mx-auto px-6 flex items-center justify-between text-xs text-white z-20">
              <span className="font-mono text-pink-400 font-bold bg-black/60 px-3.5 py-1.5 rounded-full border border-pink-500/30 backdrop-blur-md shadow-md">
                📸 Memory {activePhotoIdx + 1} of {photoUrls.length}
              </span>
              <button
                type="button"
                onClick={() => setIsPhotoPaused((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-slate-300 text-xs transition-colors backdrop-blur-md shadow-md"
              >
                {isPhotoPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                <span>{isPhotoPaused ? "Resume" : "Pause"}</span>
              </button>
            </div>

            {/* THE PHOTO THAT FLIES FORWARD AND SLAMS / HITS THE SCREEN */}
            <AnimatePresence mode="wait">
              {!isPhotoBlowingOff && (
                <motion.div
                  key={`photo-${activePhotoIdx}`}
                  initial={{
                    scale: 0.08,
                    y: 180,
                    opacity: 0,
                    rotate: -15,
                    filter: "blur(10px)",
                  }}
                  animate={{
                    scale: [0.08, 1.14, 0.98, 1.0],
                    y: [180, -12, 3, 0],
                    opacity: [0, 1, 1, 1],
                    rotate: [-15, 2, -1, 0],
                    filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(0px)"],
                  }}
                  exit={{
                    x: 850,
                    y: -250,
                    rotate: 45,
                    rotateZ: 25,
                    scale: 1.25,
                    opacity: 0,
                    filter: "blur(10px)",
                    transition: { duration: 0.52, ease: [0.32, 0, 0.67, 0] },
                  }}
                  transition={{
                    duration: 0.85,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={triggerNextPhoto}
                  className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_0_90px_rgba(236,72,153,0.55)] border-4 border-white bg-slate-950 flex flex-col justify-between p-3 select-none cursor-pointer group"
                >
                  {/* Photo Image */}
                  <div className="relative w-full h-[82%] rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                    <img
                      src={photoUrls[activePhotoIdx]}
                      alt={`Memory ${activePhotoIdx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>

                  {/* Caption Strip */}
                  <div className="h-[18%] flex items-center justify-between px-3 text-left">
                    <p className="text-xs sm:text-sm font-serif italic text-white line-clamp-2 pr-2">
                      &quot;{photoCaptions[activePhotoIdx] || `Cherished memory #${activePhotoIdx + 1}`}&quot;
                    </p>
                    <span className="text-[10px] font-mono font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full shrink-0">
                      0{activePhotoIdx + 1}
                    </span>
                  </div>

                  {/* 4.5-Second Glowing Progress Bar */}
                  {!isPhotoPaused && (
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4.5, ease: "linear" }}
                      className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skip / Next Controls */}
            <div className="absolute bottom-6 inset-x-0 max-w-md mx-auto px-6 flex items-center justify-between z-20">
              <button
                type="button"
                disabled={activePhotoIdx === 0}
                onClick={() => {
                  if (activePhotoIdx > 0) {
                    setActivePhotoIdx((prev) => prev - 1);
                    setIsPhotoBlowingOff(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-black/70 hover:bg-black/90 disabled:opacity-30 text-xs font-semibold text-white border border-white/10 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <button
                type="button"
                onClick={triggerNextPhoto}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl shadow-pink-500/30"
              >
                <span>{activePhotoIdx < photoUrls.length - 1 ? "Next Memory ➔" : "Read Birthday Letter"}</span>
              </button>
            </div>
          </div>
        )}

        {/* SCENE 4D: KUDOBOARD WISH PLAYLIST (Group Mode) */}
        {scene === "kudoboard-playlist" && (
          <motion.div
            key="scene-kudoboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-xl mx-auto px-4 py-6"
          >
            <div className="text-center mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                🎉 Group Tribute Playlist
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif italic font-bold text-white mt-2">
                Words from Your Squad
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {wishes.length} friends sealed their wishes inside your 3D box. Tap any track to read!
              </p>
            </div>

            {/* Playlist Track Items */}
            <div className="space-y-3 mb-8">
              {wishes.map((w, i) => (
                <motion.div
                  key={w.id || i}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedWish(w)}
                  className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-md group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-amber-500/20 border border-pink-500/30 flex items-center justify-center shrink-0 overflow-hidden text-sm font-bold text-amber-300">
                      {w.photoUrl ? (
                        <img src={w.photoUrl} alt={w.authorName} className="w-full h-full object-cover" />
                      ) : (
                        w.authorName?.charAt(0)?.toUpperCase() || "🎉"
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white truncate">{w.authorName}</p>
                        <span className="text-[10px] text-pink-400 font-medium px-2 py-0.5 rounded-full bg-pink-500/10">
                          {w.relationship || "Friend"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5 italic">
                        &quot;{w.message}&quot;
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 transition-colors" />
                </motion.div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setScene("reaction-booth")}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25"
            >
              <span>Record Video Reaction or Thank Your Squad 🎥</span>
            </button>
          </motion.div>
        )}

        {/* SCENE 5: 90° CAMERA TILT INTO BOX & WAX-SEALED LETTER */}
        {scene === "box-letter" && (
          <motion.div
            key="scene-letter"
            initial={{ opacity: 0, rotateX: 60 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center select-none"
            style={{ perspective: 1200 }}
          >
            {!isLetterOpen ? (
              <div
                onClick={() => setIsLetterOpen(true)}
                className="w-full max-w-md p-8 rounded-3xl bg-gradient-to-br from-[#2a131b] via-[#1a0c12] to-slate-950 border-2 border-pink-500/40 shadow-2xl flex flex-col items-center text-center cursor-pointer hover:scale-102 transition-transform group"
              >
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(244,63,94,0.4)] mb-4 group-hover:scale-110 transition-transform">
                  💌
                </div>
                <h3 className="text-xl font-serif italic font-bold text-white mb-1">
                  Private Birthday Letter
                </h3>
                <p className="text-xs text-pink-300 font-mono tracking-wide mb-6">
                  From: {creator} • To: {recipient}
                </p>
                <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Tap to Break Seal &amp; Read</span>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-[#160d1b]/95 border border-pink-500/30 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-2xl text-left space-y-6"
              >
                <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-pink-400 font-bold">
                    💌 Birthday Letter
                  </span>
                  <span className="text-xs text-slate-400">For {recipient}</span>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-base sm:text-lg font-serif italic text-pink-100/90 leading-relaxed whitespace-pre-line">
                    {giftData?.letter || "Wishing you the happiest birthday filled with joy and blessings!"}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <p className="text-xs font-serif italic text-amber-300">
                    — Forever with love, {creator}
                  </p>
                  <button
                    type="button"
                    onClick={() => setScene("reaction-booth")}
                    className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Send Reaction</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* SCENE 5B: GRAND OVAL RIBBON BANNER (When No Letter is Provided) */}
        {scene === "grand-banner" && (
          <motion.div
            key="scene-banner"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center text-center space-y-6"
          >
            <div className="w-full py-8 px-6 rounded-[3rem] bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 border-4 border-amber-300 shadow-[0_0_50px_rgba(244,63,94,0.5)] text-white">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-200">
                ⭐ Official Birthday Toast ⭐
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif italic font-extrabold mt-2">
                Happy Birthday, {recipient}!
              </h2>
              <p className="text-xs text-white/90 mt-2 font-sans font-medium">
                May your new chapter be packed with breakthroughs, unforgettable memories, and non-stop joy!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setScene("reaction-booth")}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Send Reaction / Thank You
            </button>
          </motion.div>
        )}

        {/* SCENE 6: LIVE REACTION BOOTH & REPLY */}
        {scene === "reaction-booth" && (
          <motion.div
            key="scene-reaction"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mx-auto px-4 py-8"
          >
            <div className="bg-slate-900/90 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full">
                  🎥 Reaction Booth
                </span>
                <h3 className="text-2xl font-serif italic font-bold text-white mt-2">
                  Send Your Reaction to {creator}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Record a quick video reaction or send a warm thank-you message!
                </p>
              </div>

              {/* Video Recording Area */}
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center">
                {recordedVideo ? (
                  <video
                    src={URL.createObjectURL(recordedVideo)}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${isRecording ? "block" : "hidden"}`}
                    />
                    {!isRecording && (
                      <div className="flex flex-col items-center text-slate-500 gap-2">
                        <Video className="w-8 h-8 text-pink-500" />
                        <span className="text-xs">Camera preview will appear here</span>
                      </div>
                    )}
                  </>
                )}

                {/* Recording controls */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                  {!recordedVideo && (
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        isRecording
                          ? "bg-rose-600 text-white animate-pulse"
                          : "bg-white/20 hover:bg-white/30 text-white"
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isRecording ? "Stop Recording" : "Record Video Reaction"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Reply Note Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Your Thank-You Message
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Thank ${creator} for this incredible birthday surprise...`}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-pink-500 transition-colors resize-none"
                />
              </div>

              {/* Send Button */}
              {replySent ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center">
                  ✨ Reaction Delivered! Thank you for sharing the love.
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isSendingReply}
                  onClick={handleSendReply}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingReply ? "Sending..." : "Send Birthday Reaction"}</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL FOR VIEWING INDIVIDUAL KUDOBOARD WISH */}
      <AnimatePresence>
        {selectedWish && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedWish(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-amber-500/30 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-amber-500 flex items-center justify-center text-white font-bold text-base overflow-hidden shrink-0">
                  {selectedWish.photoUrl ? (
                    <img src={selectedWish.photoUrl} alt={selectedWish.authorName} className="w-full h-full object-cover" />
                  ) : (
                    selectedWish.authorName?.charAt(0)?.toUpperCase() || "🎉"
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{selectedWish.authorName}</h4>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-full">
                    {selectedWish.relationship || "Squad Contributor"}
                  </span>
                </div>
              </div>

              {selectedWish.photoUrl && (
                <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-black border border-white/10">
                  <img src={selectedWish.photoUrl} alt="Wish" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-sm text-slate-200 italic font-serif leading-relaxed whitespace-pre-line mb-6">
                &quot;{selectedWish.message}&quot;
              </p>

              <button
                type="button"
                onClick={() => setSelectedWish(null)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                Close Card
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
