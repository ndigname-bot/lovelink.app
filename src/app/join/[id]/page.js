"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";
import imageCompression from "browser-image-compression";
import confetti from "canvas-confetti";
import { Logo } from "@/components/Logo";
import {
  Sparkles,
  Cake,
  Heart,
  Send,
  UploadCloud,
  CheckCircle2,
  Users,
  Image as ImageIcon,
  Loader2,
  PartyPopper,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

export default function JoinBirthdayBox() {
  const params = useParams();
  const giftId = params?.id;
  const router = useRouter();

  const [giftData, setGiftData] = useState(null);
  const [existingWishes, setExistingWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [authorName, setAuthorName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [message, setMessage] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!giftId) return;

    const fetchGiftAndWishes = async () => {
      try {
        setLoading(true);
        const giftRef = doc(db, "gifts", giftId);
        const snap = await getDoc(giftRef);

        if (!snap.exists()) {
          setError("This celebration box could not be found or has expired.");
          return;
        }

        const data = snap.data();
        setGiftData(data);

        // Fetch existing wishes
        try {
          const wishesRef = collection(db, "gifts", giftId, "wishes");
          const wishesSnap = await getDocs(query(wishesRef, orderBy("createdAt", "desc")));
          const wishes = [];
          wishesSnap.forEach((w) => wishes.push({ id: w.id, ...w.data() }));
          setExistingWishes(wishes);
        } catch (err) {
          console.warn("Could not load existing wishes:", err);
        }
      } catch (e) {
        console.error("Error fetching gift details:", e);
        setError("Error loading celebration box.");
      } finally {
        setLoading(false);
      }
    };

    fetchGiftAndWishes();
  }, [giftId]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 0.15,
        maxWidthOrHeight: 1000,
        useWebWorker: false,
        fileType: "image/jpeg",
        initialQuality: 0.8,
      };
      const compressed = await imageCompression(file, options);
      const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
      setPhotoFile(file);
      setPhotoPreview(dataUrl);
    } catch (err) {
      console.warn("Image compression fallback:", err);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const applyQuickMessage = (text) => {
    setMessage((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) {
      alert("Please enter your name and a birthday wish!");
      return;
    }

    setIsSubmitting(true);
    try {
      const wishesRef = collection(db, "gifts", giftId, "wishes");
      const newWish = {
        authorName: authorName.trim(),
        relationship: relationship.trim() || "Friend",
        message: message.trim(),
        photoUrl: photoPreview || "",
        createdAt: serverTimestamp(),
      };

      await addDoc(wishesRef, newWish);

      // Trigger celebratory confetti burst!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#ec4899", "#f59e0b", "#8b5cf6", "#10b981"],
        });
      } catch (err) {}

      setExistingWishes((prev) => [
        { id: "new-" + Date.now(), ...newWish, createdAt: new Date() },
        ...prev,
      ]);
      setSubmitted(true);
    } catch (e) {
      console.error("Error submitting wish:", e);
      alert("Failed to submit wish. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Opening celebration package...</p>
      </div>
    );
  }

  if (error || !giftData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-2xl text-rose-400 mb-4">
          🎁
        </div>
        <h1 className="text-2xl font-bold mb-2">Celebration Box Unavailable</h1>
        <p className="text-sm text-slate-400 max-w-sm mb-6">{error || "Could not find this gift."}</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          Go to LoveLink Home
        </button>
      </div>
    );
  }

  const recipientName = giftData.recipientName || "the Birthday Star";
  const creatorName = giftData.creatorName || "a close friend";
  const birthdayAge = giftData.birthdayAge ? `${giftData.birthdayAge} ` : "";

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-pink-500/30 flex flex-col justify-between">
      {/* Top Navigation */}
      <nav className="w-full border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 text-pink-500" />
            <span className="font-bold text-lg tracking-tight">LoveLink Squad</span>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            🎉 Group Tribute
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-10 w-full flex-1">
        {/* Header Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Cake className="w-4 h-4 text-amber-400" />
            <span>{birthdayAge}Birthday Celebration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif italic font-bold mb-2 text-white">
            Sign {recipientName}&apos;s 3D Birthday Box 🎂
          </h1>
          <p className="text-sm text-slate-300/80 max-w-md mx-auto">
            Organized by <span className="text-pink-400 font-semibold">{creatorName}</span>. Add your photo, inside joke, or heartfelt birthday wish to seal inside their interactive 3D box!
          </p>
        </div>

        {/* Existing Contributors Pill */}
        {existingWishes.length > 0 && (
          <div className="mb-8 p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-400 shrink-0" />
              <span>
                <strong className="text-white font-mono">{existingWishes.length}</strong> {existingWishes.length === 1 ? "friend has" : "friends have"} signed so far:
              </span>
            </div>
            <div className="flex -space-x-2 overflow-hidden">
              {existingWishes.slice(0, 4).map((w, idx) => (
                <div
                  key={w.id || idx}
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                  title={w.authorName}
                >
                  {w.authorName?.charAt(0)?.toUpperCase() || "🎉"}
                </div>
              ))}
              {existingWishes.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[9px] font-bold text-slate-300">
                  +{existingWishes.length - 4}
                </div>
              )}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleSubmit}
              className="space-y-6 bg-slate-900/60 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl"
            >
              {/* Contributor Name & Relationship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Kwame or Sarah"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-pink-500 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Who Are You to {recipientName}?
                  </label>
                  <input
                    type="text"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="e.g. Bestie, Sister, Coworker"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-pink-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Birthday Wish Message */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Your Birthday Wish / Toast *
                  </label>
                  <span className="text-[10px] text-pink-400 font-mono">Will be revealed in 3D</span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Write your birthday message, inside joke, or blessing for ${recipientName}...`}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-pink-500 outline-none transition-colors resize-none leading-relaxed"
                />

                {/* Quick 1-Click Stickers / Inspiration */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 mr-1">Quick add:</span>
                  {[
                    "Happy Birthday legend! 👑",
                    "To more wild stories & unforgettable nights! 🥂",
                    "Keep shining and inspiring everyone! ✨",
                    "Never stop laughing at your own jokes 😂",
                    "May all your biggest dreams come true this year! 🚀",
                  ].map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyQuickMessage(phrase)}
                      className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2.5 py-1 text-slate-300 hover:text-white transition-all"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Photo Upload */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Photo or Selfie (Optional)</span>
                  <span className="text-[10px] text-amber-400 font-normal">Flips over in polaroid mode</span>
                </label>

                {photoPreview ? (
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-pink-500/40 group">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-xs font-bold text-white shadow-lg"
                      >
                        Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/15 hover:border-pink-500/50 rounded-2xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-all text-center">
                    <UploadCloud className="w-8 h-8 text-pink-400 mb-2" />
                    <span className="text-xs font-semibold text-white">Tap to upload a memory photo or selfie</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG (Auto-compressed for fast viewing)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sealing Your Wish into the 3D Box...</span>
                  </>
                ) : (
                  <>
                    <PartyPopper className="w-5 h-5 text-amber-200" />
                    <span>Seal My Card Into the 3D Box 🎁</span>
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/80 border border-emerald-500/30 p-8 rounded-3xl text-center shadow-2xl backdrop-blur-xl space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-white mb-2">
                  You&apos;re In! Card Sealed 🎉
                </h2>
                <p className="text-sm text-slate-300 max-w-sm mx-auto">
                  Your birthday wish and photo are now safely stored inside <span className="text-pink-400 font-semibold">{recipientName}&apos;s</span> 3D unboxing box.
                </p>
              </div>

              {/* Preview of the card just created */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-black/50 border border-white/10 text-left flex items-start gap-4">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={authorName}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-pink-500/30"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl shrink-0">
                    👑
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white truncate">{authorName}</p>
                    <span className="text-[10px] text-pink-400 font-medium">{relationship || "Friend"}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 italic line-clamp-3">
                    &quot;{message}&quot;
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage("");
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Add Another Wish
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-xs font-bold text-white hover:opacity-90 shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Create a LoveLink for Someone You Love</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-500 border-t border-white/5">
        <p>LoveLink • 3D Emotional Keepsakes &amp; Celebration Packages</p>
      </footer>
    </div>
  );
}
