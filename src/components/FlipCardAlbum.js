"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, ArrowRight, RotateCw, CheckCircle2, Image as ImageIcon, Users } from "lucide-react";
import confetti from "canvas-confetti";

export default function FlipCardAlbum({ photoUrls = [], photoCaptions = [], wishes = [], onContinue, styles }) {
  const [activeTab, setActiveTab] = useState(photoUrls.length > 0 ? "photos" : (wishes.length > 0 ? "wishes" : "photos"));
  const [flippedCards, setFlippedCards] = useState({});
  const [selectedPreview, setSelectedPreview] = useState(null);

  const toggleCard = (key) => {
    setFlippedCards((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      // If newly flipped to back, trigger soft celebratory burst
      if (!prev[key]) {
        try {
          confetti({
            particleCount: 25,
            spread: 50,
            origin: { y: 0.7 },
            colors: ["#ec4899", "#fbbf24", "#ffffff"],
          });
        } catch (e) {}
      }
      return newState;
    });
  };

  const showerHearts = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#ec4899", "#f43f5e", "#fbbf24", "#a855f7"],
        shapes: ["circle"],
      });
    } catch (e) {}
  };

  const currentItems = activeTab === "photos" ? photoUrls : wishes;
  const flippedCount = currentItems.map((_, i) => `${activeTab}_${i}`).filter(k => Boolean(flippedCards[k])).length;
  const totalCards = currentItems.length || 0;

  const cardIcons = ["👑", "💖", "✨", "🎂", "🌸", "⭐", "🎁", "💫"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto z-10 px-4 pt-6 pb-28 flex flex-col items-center"
    >
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-3">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Interactive Keepsake Album</span>
      </div>

      <h2 className="text-3xl md:text-5xl font-serif italic text-white text-center mb-2 drop-shadow-md">
        Because you deserve everything beautiful.
      </h2>
      <p className="text-xs sm:text-sm text-slate-300/80 text-center max-w-md mb-8">
        Touch each polaroid card to flip it over, reveal our favorite memory, and read what was written for you ✨
      </p>

      {/* Tab Switcher if both Photos and Squad Wishes exist */}
      {photoUrls.length > 0 && wishes.length > 0 && (
        <div className="flex items-center gap-2 mb-6 bg-black/40 border border-white/10 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "photos"
                ? "bg-pink-500 text-white shadow-md shadow-pink-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Memories ({photoUrls.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("wishes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "wishes"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/30 font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Squad Wishes ({wishes.length})</span>
          </button>
        </div>
      )}

      {/* Progress pill */}
      <div className="flex items-center gap-2 mb-8 bg-slate-900/60 border border-white/10 px-4 py-1.5 rounded-full text-xs text-slate-300">
        <span className="font-mono text-pink-400 font-bold">{flippedCount}</span>
        <span>of</span>
        <span className="font-mono text-white font-bold">{totalCards}</span>
        <span>{activeTab === "photos" ? "memories revealed" : "wishes revealed"}</span>
        {flippedCount === totalCards && totalCards > 0 && (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-1 inline" />
        )}
      </div>

      {/* 3D CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full mb-10">
        {activeTab === "photos" ? (
          photoUrls.map((url, i) => {
            const cardKey = `photos_${i}`;
            const isFlipped = Boolean(flippedCards[cardKey]);
            const caption = photoCaptions[i] || `Memory #${i + 1}`;
            const icon = cardIcons[i % cardIcons.length];

            return (
              <div
                key={cardKey}
                className="relative w-full h-64 sm:h-72 cursor-pointer group"
                style={{ perspective: 1000 }}
                onClick={() => toggleCard(cardKey)}
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative w-full h-full rounded-2xl shadow-xl transition-shadow group-hover:shadow-[0_15px_30px_rgba(236,72,153,0.25)]"
                >
                  {/* FRONT OF CARD (Unflipped) */}
                  <div
                    style={{ backfaceVisibility: "hidden" }}
                    className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-[#150a18] border-2 border-pink-500/30 p-5 flex flex-col items-center justify-between text-center overflow-hidden"
                  >
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-pink-500/10 rounded-full blur-xl pointer-events-none" />

                    <div className="w-full flex items-center justify-between text-[10px] font-mono text-pink-400/80">
                      <span>POLAROID</span>
                      <span>0{i + 1}</span>
                    </div>

                    <div className="flex flex-col items-center my-auto">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/40 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(236,72,153,0.2)] group-hover:scale-110 transition-transform">
                        {icon}
                      </div>
                      <span className="text-xs font-bold text-white mt-3">Memory #{i + 1}</span>
                      <span className="text-[10px] text-slate-400 mt-1">Tap to flip &amp; reveal</span>
                    </div>

                    <div className="w-full pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-pink-300 font-semibold">
                      <RotateCw className="w-3 h-3 animate-spin-slow" />
                      <span>Flip Card</span>
                    </div>
                  </div>

                  {/* BACK OF CARD (Flipped: Photo + Caption) */}
                  <div
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                    className="absolute inset-0 w-full h-full rounded-2xl bg-slate-950 border-2 border-pink-400/60 overflow-hidden flex flex-col"
                  >
                    <div className="relative w-full h-44 sm:h-52 bg-black overflow-hidden">
                      <img
                        src={url}
                        alt={caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPreview({ url, caption });
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                        title="View full screen"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900/90 flex-1 flex flex-col justify-center text-center">
                      <p className="text-xs text-white font-medium line-clamp-2 leading-relaxed">
                        "{caption}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })
        ) : (
          wishes.map((w, i) => {
            const cardKey = `wishes_${i}`;
            const isFlipped = Boolean(flippedCards[cardKey]);

            return (
              <div
                key={cardKey}
                className="relative w-full h-64 sm:h-72 cursor-pointer group"
                style={{ perspective: 1000 }}
                onClick={() => toggleCard(cardKey)}
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative w-full h-full rounded-2xl shadow-xl transition-shadow group-hover:shadow-[0_15px_30px_rgba(251,191,36,0.25)]"
                >
                  {/* FRONT OF WISH CARD (Unflipped) */}
                  <div
                    style={{ backfaceVisibility: "hidden" }}
                    className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-[#1e1307] border-2 border-amber-500/40 p-5 flex flex-col items-center justify-between text-center overflow-hidden"
                  >
                    <div className="w-full flex items-center justify-between text-[10px] font-mono text-amber-400">
                      <span>WISH CARD</span>
                      <span>0{i + 1}</span>
                    </div>

                    <div className="flex flex-col items-center my-auto w-full">
                      {w.photoUrl ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-lg mb-2">
                          <img src={w.photoUrl} alt={w.authorName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/50 flex items-center justify-center text-xl font-bold text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] mb-2">
                          {w.authorName?.charAt(0)?.toUpperCase() || "🎉"}
                        </div>
                      )}
                      <h4 className="text-sm font-bold text-white truncate max-w-[140px]">{w.authorName}</h4>
                      <span className="text-[10px] font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full mt-1 border border-amber-400/20">
                        {w.relationship || "Squad"}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-2">Tap to read wish ✨</span>
                    </div>

                    <div className="w-full pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-amber-300 font-semibold">
                      <RotateCw className="w-3 h-3 animate-spin-slow" />
                      <span>Flip Card</span>
                    </div>
                  </div>

                  {/* BACK OF WISH CARD (Flipped: Message + Photo) */}
                  <div
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                    className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-slate-950 via-[#120a17] to-slate-900 border-2 border-amber-400/60 overflow-hidden flex flex-col p-4 text-center justify-between"
                  >
                    {w.photoUrl && (
                      <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2 bg-black shrink-0">
                        <img src={w.photoUrl} alt={w.authorName} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPreview({ url: w.photoUrl, caption: `${w.authorName}'s Birthday Wish` });
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white"
                        >
                          <ImageIcon className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex-1 flex flex-col justify-center items-center overflow-y-auto px-1 py-1">
                      <p className="text-xs text-white italic font-serif leading-relaxed line-clamp-5">
                        &quot;{w.message}&quot;
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                      <span className="truncate max-w-[120px]">— {w.authorName}</span>
                      <span className="text-[9px] text-slate-400">{w.relationship || "Squad"}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })
        )}
      </div>

      {/* ACTION CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
        {/* Rain of Hearts Button (As seen in Video 1) */}
        <button
          type="button"
          onClick={showerHearts}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/40 text-pink-300 hover:text-white hover:bg-pink-500/30 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <Heart className="w-4 h-4 fill-pink-500 text-pink-500 animate-pulse" />
          <span>Shower with Hearts 💖</span>
        </button>

        {/* Continue to Letter Button */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25 active:scale-95 transition-all"
        >
          <span>Continue to Letter</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* FULL-SCREEN PHOTO PREVIEW MODAL */}
      <AnimatePresence>
        {selectedPreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full max-h-[85vh] flex flex-col items-center"
            >
              <img
                src={selectedPreview.url}
                alt={selectedPreview.caption}
                className="max-h-[70vh] w-auto rounded-2xl shadow-2xl object-contain border border-white/20"
              />
              <p className="mt-4 text-center text-sm font-medium text-white bg-black/60 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
                "{selectedPreview.caption}"
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
