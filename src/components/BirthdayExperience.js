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
  Flame,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function BirthdayExperience({
  giftData,
  onStartAudio,
  actualGiftId,
  styles,
}) {
  // Main Scenes: 'dark-candle' | 'cake-reveal' | 'box-unbox' | 'photo-stream' | 'kudoboard-playlist' | 'box-letter' | 'reaction-booth'
  const [scene, setScene] = useState("dark-candle");
  const [roomLit, setRoomLit] = useState(false);
  const [candleBlown, setCandleBlown] = useState(false);
  const [showBoxPrompt, setShowBoxPrompt] = useState(false);

  // Photo Stream State
  const photoUrls = giftData?.photoUrls || [];
  const photoCaptions = giftData?.photoCaptions || [];
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isPhotoPaused, setIsPhotoPaused] = useState(false);
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

  // Preload images silently during dark candle phase
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

    // Light up room and transition to 3D cake reveal
    setTimeout(() => {
      setScene("cake-reveal");

      // 3 seconds later, slide the 3D Birthday Box in
      setTimeout(() => {
        setShowBoxPrompt(true);
      }, 3000);
    }, 900);
  };

  // Blow out candle interactivity
  const handleBlowCandle = (e) => {
    if (e) e.stopPropagation();
    if (candleBlown) return;

    setCandleBlown(true);
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.45 },
        colors: ["#fbbf24", "#f59e0b", "#ec4899", "#ffffff"],
      });
    } catch (err) {}
  };

  // Open the 3D Gift Box
  const handleOpenGiftBox = () => {
    setScene("box-unbox");

    try {
      confetti({
        particleCount: 110,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#ec4899", "#fbbf24", "#8b5cf6", "#10b981", "#ffffff"],
      });
    } catch (err) {}

    setTimeout(() => {
      if (isGroupMode && wishes.length > 0) {
        // Group Kudoboard: burst into playlist
        setScene("kudoboard-playlist");
      } else if (photoUrls.length > 0) {
        // Solo with photos: start photo stream
        setScene("photo-stream");
      } else if (hasLetter) {
        // Solo without photos: go straight to letter
        setScene("box-letter");
      } else {
        // Solo without photos & without letter: grand banner
        setScene("grand-banner");
      }
    }, 1200);
  };

  // Auto-advance photo stream every 3.2 seconds
  useEffect(() => {
    if (scene === "photo-stream" && !isPhotoPaused && photoUrls.length > 0) {
      photoTimerRef.current = setTimeout(() => {
        if (activePhotoIdx < photoUrls.length - 1) {
          setActivePhotoIdx((prev) => prev + 1);
        } else {
          // Photos finished! Transition to 90° box tilt / letter or grand banner
          if (hasLetter) {
            setScene("box-letter");
          } else {
            setScene("grand-banner");
          }
        }
      }, 3200);
    }
    return () => clearTimeout(photoTimerRef.current);
  }, [scene, activePhotoIdx, isPhotoPaused, photoUrls.length, hasLetter]);

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
      console.warn("Webcam access declined or unavailable:", err);
      alert("Camera access was not permitted. You can still type your reply below!");
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
      alert("Please enter a thank-you note or record a quick video reaction!");
      return;
    }
    setIsSendingReply(true);
    try {
      // In production, update Firestore doc with recipient's reaction response
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
  const age = giftData?.birthdayAge ? String(giftData.birthdayAge).replace(/[^0-9]/g, "") : null;

  return (
    <div
      className={`relative w-full min-h-[90vh] flex flex-col items-center justify-center transition-colors duration-1000 ${
        scene === "dark-candle" && !roomLit
          ? "bg-[#050505] text-white"
          : "bg-transparent text-white"
      }`}
    >
      {/* SCENE 1: PITCH BLACK ROOM WITH FLICKERING CANDLE */}
      <AnimatePresence mode="wait">
        {scene === "dark-candle" && (
          <motion.div
            key="scene-dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            onClick={handleIgniteCelebration}
            className="fixed inset-0 z-40 bg-[#050505] flex flex-col items-center justify-center cursor-pointer select-none p-6 text-center"
          >
            {/* Candle Container */}
            <div className="relative flex flex-col items-center">
              {/* Flame Glow Ambient Light */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 0.95, 1.2, 1],
                  opacity: [0.7, 0.9, 0.65, 0.95, 0.7],
                }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="absolute -top-16 w-36 h-36 rounded-full bg-amber-500/20 blur-3xl pointer-events-none"
              />

              {/* Animated Flame */}
              <motion.div
                animate={{
                  rotate: [-2, 3, -1, 2, -2],
                  scaleY: [1, 1.1, 0.95, 1.08, 1],
                }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="relative z-10 w-8 h-14"
              >
                {/* Outer Yellow Flame */}
                <div className="w-full h-full rounded-[50%_50%_20%_20%_/_70%_70%_30%_30%] bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 shadow-[0_0_35px_rgba(251,191,36,0.9)]" />
                {/* Inner Cyan Core */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-5 rounded-full bg-cyan-200/90 blur-[1px]" />
              </motion.div>

              {/* Candle Wick */}
              <div className="w-1 h-3 bg-slate-900 rounded-t-sm" />

              {/* Candle Body */}
              <div className="w-10 h-28 rounded-t-lg bg-gradient-to-b from-rose-100 via-rose-200 to-rose-300 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-rose-200 rounded-t-lg" />
                <div className="absolute top-2 left-2 w-1.5 h-6 bg-white/70 rounded-full blur-[0.5px]" />
              </div>
            </div>

            {/* Tap Prompt */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-12 space-y-2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono tracking-widest uppercase text-amber-300 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Tap Anywhere to Begin</span>
              </div>
              <p className="text-sm text-slate-400 font-sans tracking-wide">
                Touch the screen to light up your special day ✨
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* SCENE 2: ROOM ILLUMINATES & 3D CAKE WITH NUMBER CANDLE */}
        {scene === "cake-reveal" && (
          <motion.div
            key="scene-cake"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl mx-auto flex flex-col items-center text-center px-4 py-8 select-none"
          >
            {/* Header Title */}
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

            {/* 3D Cake with Milestone Age Candle */}
            <div
              className="relative flex flex-col items-center cursor-pointer group my-4"
              onClick={handleBlowCandle}
              title="Tap candle to make a wish & blow it out!"
            >
              {/* Flame Glow */}
              {!candleBlown && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-16 w-32 h-32 rounded-full bg-amber-400/25 blur-2xl pointer-events-none"
                />
              )}

              {/* Number Candle(s) */}
              <div className="relative z-10 flex items-center justify-center gap-2 mb-1">
                {age ? (
                  age.split("").map((digit, i) => (
                    <div key={i} className="relative flex flex-col items-center">
                      {!candleBlown && (
                        <motion.div
                          animate={{ scaleY: [1, 1.15, 0.9, 1.1], rotate: [-2, 3, -2] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="w-4 h-7 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 shadow-[0_0_20px_rgba(251,191,36,0.9)] mb-1"
                        />
                      )}
                      <div className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 text-amber-950 font-black text-2xl sm:text-3xl font-mono shadow-lg border border-white/60">
                        {digit}
                      </div>
                    </div>
                  ))
                ) : (
                  /* Spiral Sparkler Candle when Age is omitted */
                  <div className="relative flex flex-col items-center">
                    {!candleBlown && (
                      <motion.div
                        animate={{ scaleY: [1, 1.2, 1], rotate: [-3, 3, -3] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-5 h-8 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_25px_rgba(251,191,36,1)] mb-1"
                      />
                    )}
                    <div className="w-6 h-12 rounded-t-lg bg-gradient-to-b from-pink-300 via-rose-400 to-pink-500 border border-white/40 shadow-md flex items-center justify-center text-xs font-bold text-white">
                      ✨
                    </div>
                  </div>
                )}
              </div>

              {/* Cake Stand & Tiers */}
              <div className="w-56 sm:w-64 flex flex-col items-center">
                {/* Top Tier */}
                <div className="w-36 h-14 rounded-t-2xl bg-gradient-to-r from-pink-300 via-rose-200 to-pink-300 border-2 border-white/50 shadow-md relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-0 inset-x-0 h-3 bg-white/70 rounded-full blur-[1px]" />
                  <span className="text-xs font-serif italic text-rose-900 font-bold">celebrate</span>
                </div>
                {/* Bottom Tier */}
                <div className="w-52 sm:w-60 h-20 rounded-t-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 border-2 border-pink-300/60 shadow-2xl relative overflow-hidden flex items-center justify-around px-4">
                  <div className="absolute top-0 inset-x-0 h-4 bg-white/40 [clip-path:polygon(0_0,100%_0,95%_100%,85%_60%,75%_100%,65%_60%,55%_100%,45%_60%,35%_100%,25%_60%,15%_100%,5%_60%,0_100%)]" />
                  <span className="text-xl">🍓</span>
                  <span className="text-xl">✨</span>
                  <span className="text-xl">💖</span>
                  <span className="text-xl">🍓</span>
                </div>
                {/* Golden Platter */}
                <div className="w-64 sm:w-72 h-4 rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 border border-amber-100 shadow-xl" />
              </div>

              {/* Blow Candle Prompt */}
              <p className="text-xs text-amber-200/90 mt-4 font-sans flex items-center gap-1.5">
                {candleBlown ? (
                  <span className="text-emerald-400 font-semibold">✨ Wish made! The universe is listening.</span>
                ) : (
                  <span>💨 Tap candle to make your wish and blow it out</span>
                )}
              </p>
            </div>

            {/* 3 Seconds Later: The 3D Birthday Gift Box Appears */}
            <AnimatePresence>
              {showBoxPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="mt-8 w-full p-6 rounded-3xl bg-gradient-to-br from-pink-500/20 via-rose-500/10 to-amber-500/20 border border-pink-500/30 shadow-2xl backdrop-blur-xl flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-amber-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-pink-500/30 mb-3 animate-bounce">
                    🎁
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Here is your birthday gift, {recipient}!
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xs mb-5">
                    Made with love by <strong className="text-pink-400">{creator}</strong>
                    {isGroupMode && wishes.length > 0 && ` & ${wishes.length} friends`}.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenGiftBox}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Tap Box to Open 🎁</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* SCENE 3: BOX UNBOXING EXPLOSION */}
        {scene === "box-unbox" && (
          <motion.div
            key="scene-unbox"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.15, 1], opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1 }}
              className="text-8xl mb-6"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-serif italic font-bold text-white mb-2">
              Unboxing Your Surprises...
            </h2>
            <p className="text-xs text-pink-300 font-mono tracking-widest uppercase">
              Release the confetti ✨
            </p>
          </motion.div>
        )}

        {/* SCENE 4A: PHOTO STREAM (Solo with Photos) */}
        {scene === "photo-stream" && photoUrls.length > 0 && (
          <motion.div
            key="scene-photos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg mx-auto flex flex-col items-center px-4 py-6"
          >
            {/* Header Indicator */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-4 px-2">
              <span className="font-mono text-pink-400 font-bold">
                Memory {activePhotoIdx + 1} of {photoUrls.length}
              </span>
              <button
                type="button"
                onClick={() => setIsPhotoPaused((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition-colors"
              >
                {isPhotoPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                <span>{isPhotoPaused ? "Resume" : "Pause"}</span>
              </button>
            </div>

            {/* Main Zoomed Photo Display */}
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-2 border-pink-500/30 bg-black">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activePhotoIdx}
                  src={photoUrls[activePhotoIdx]}
                  alt={`Memory ${activePhotoIdx + 1}`}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.15, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Caption Overlay */}
              {photoCaptions[activePhotoIdx] && (
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <p className="text-sm font-medium text-white italic text-center drop-shadow-md">
                    &quot;{photoCaptions[activePhotoIdx]}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between w-full mt-6 px-2">
              <button
                type="button"
                disabled={activePhotoIdx === 0}
                onClick={() => setActivePhotoIdx((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-semibold flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activePhotoIdx < photoUrls.length - 1) {
                    setActivePhotoIdx((prev) => prev + 1);
                  } else {
                    setScene(hasLetter ? "box-letter" : "grand-banner");
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-pink-500/25"
              >
                <span>{activePhotoIdx < photoUrls.length - 1 ? "Next Memory" : "View Birthday Letter"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
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
                    {/* Track Number / Avatar */}
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

            {/* Action Button to Transition to Reaction / Next */}
            <button
              type="button"
              onClick={() => setScene("reaction-booth")}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25"
            >
              <span>Record Video Reaction or Thank Your Squad 🎥</span>
            </button>
          </motion.div>
        )}

        {/* SCENE 5: 90° CAMERA TILT & WAX-SEALED LETTER */}
        {scene === "box-letter" && (
          <motion.div
            key="scene-letter"
            initial={{ opacity: 0, rotateX: 45 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl mx-auto px-4 py-8 flex flex-col items-center select-none"
          >
            {!isLetterOpen ? (
              /* Sealed Wax Envelope inside Box */
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
              /* Unfolded Heartfelt Letter */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-[#160d1b]/90 border border-pink-500/30 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-2xl text-left space-y-6"
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
            {/* Grand Oval Ribbon */}
            <div className="w-full py-8 px-6 rounded-[3rem] bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 border-4 border-amber-300 shadow-[0_0_50px_rgba(244,63,94,0.5)] text-white">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-200">
                ⭐ Official Birthday Toast ⭐
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif italic font-extrabold mt-2">
                Happy Birthday, {recipient}!
              </h2>
              <p className="text-xs text-white/90 mt-2 font-sans font-medium">
                May your new year be packed with breakthroughs, unforgettable memories, and non-stop joy!
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
