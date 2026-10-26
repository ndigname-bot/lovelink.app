"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { 
  Sparkles, 
  Link as LinkIcon, 
  CheckCircle2, 
  MessageCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowRight,
  Heart,
  Share2
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const giftId = searchParams.get("giftId");
  
  const [loading, setLoading] = useState(true);
  const [publishedLink, setPublishedLink] = useState("");
  const [recipientName, setRecipientName] = useState("Cutie");
  const [creatorName, setCreatorName] = useState("");
  const [occasion, setOccasion] = useState("standard");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!giftId) {
      router.push("/dashboard");
      return;
    }

    const verifyPaymentAndActivate = async () => {
      try {
        let slug = null;
        let recipient = "Cutie";
        let creator = "";
        let occ = "standard";

        try {
          const snap = await getDoc(doc(db, "gifts", giftId));
          if (snap.exists()) {
            const data = snap.data();
            slug = data.slug;
            recipient = data.recipientName || "Cutie";
            creator = data.creatorName || "";
            occ = data.occasion || "standard";
          }
        } catch (e) {
          console.error("Error reading gift details:", e);
        }

        setRecipientName(recipient);
        setCreatorName(creator);
        setOccasion(occ);

        const finalUrl = slug 
          ? `${window.location.origin}/for/${slug}` 
          : `${window.location.origin}/gift/${giftId}`;
        setPublishedLink(finalUrl);
        setLoading(false);

        // Fire festive celebration confetti
        try {
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.55 } });
          setTimeout(() => {
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.4 } });
          }, 400);
        } catch (e) {}

      } catch (err) {
        console.error("Error activating gift:", err);
      }
    };

    verifyPaymentAndActivate();
  }, [giftId, router]);

  // Occasion-tailored WhatsApp share message
  const getShareMessage = () => {
    if (occasion === "family") {
      return `Hey ${recipientName}, I made a private digital time capsule just for you. Open it here: ${publishedLink}`;
    } else if (occasion === "birthday") {
      return `Happy Birthday ${recipientName}! 🎂 I made a special digital celebration surprise for you. Open it here: ${publishedLink}`;
    } else if (occasion === "proposal") {
      return `Hey ${recipientName} ❤️ I have a very special question for you. Please open this with your headphones on: ${publishedLink}`;
    }
    return `Hey ${recipientName} ❤️ I made a special digital surprise just for you. Open it here: ${publishedLink}`;
  };

  const shareToWhatsApp = () => {
    const message = getShareMessage();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleCopy = () => {
    if (!publishedLink) return;
    navigator.clipboard.writeText(publishedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Preview card dynamic OG URL
  const ogPreviewUrl = `/api/og?name=${encodeURIComponent(recipientName)}&creator=${encodeURIComponent(creatorName)}&occasion=${encodeURIComponent(occasion)}`;

  const getCardTitle = () => {
    if (occasion === "family") return `A Private Time Capsule for ${recipientName} ⏳`;
    if (occasion === "birthday") return `Happy Birthday, ${recipientName}! 🎂 A special gift awaits`;
    if (occasion === "proposal") return `A Very Special Message for ${recipientName} 💍`;
    return `A private surprise for ${recipientName} 💌`;
  };

  const getCardDescription = () => {
    if (occasion === "family") {
      return `${creatorName || "Your loved one"} sealed a family memory capsule for ${recipientName} with photos, music, and an appreciation letter. Tap to open!`;
    } else if (occasion === "birthday") {
      return `${creatorName || "Someone special"} created a private birthday celebration package for ${recipientName}. Tap to open your surprise!`;
    } else if (occasion === "proposal") {
      return `A private digital journey through our most precious moments, sealed by ${creatorName || "someone special"}. Tap to open!`;
    }
    return `${creatorName ? `${creatorName} crafted` : "Someone special sealed"} a special digital experience with music and memories for ${recipientName}. Tap to open!`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white px-6">
        <div className="flex flex-col items-center text-center">
          <Sparkles className="w-12 h-12 text-pink-500 mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Generating your LoveLink...</h2>
          <p className="text-gray-400 text-sm max-w-sm">Sealing memories, audio, and personal digital envelope.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-pink-500/30 py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        
        {/* Glow ambient header accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b from-emerald-500/15 via-pink-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center mb-2">
          Your Gift is Live! 🎉
        </h1>
        <p className="text-slate-400 text-center text-sm sm:text-base mb-8 max-w-md mx-auto">
          Your digital envelope for <strong className="text-white">{recipientName}</strong> is sealed and ready to be delivered.
        </p>

        {/* WhatsApp Preview Card Container */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Link Preview
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live Preview
            </span>
          </div>

          {/* WhatsApp Chat Bubble Mockup */}
          <div className="bg-[#1f2c34] rounded-2xl p-3 border border-[#2a3942] shadow-xl max-w-lg mx-auto">
            {/* The Floating Card Image */}
            <div className="relative aspect-[1200/630] w-full rounded-xl overflow-hidden bg-slate-800 border border-white/5 mb-3">
              <img 
                src={ogPreviewUrl} 
                alt="WhatsApp Preview Card" 
                className="w-full h-full object-cover" 
              />
            </div>

            {/* Link Meta Details */}
            <div className="px-2 pb-1 space-y-1">
              <h3 className="text-sm font-bold text-slate-100 line-clamp-1">
                {getCardTitle()}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {getCardDescription()}
              </p>
              <div className="text-[11px] text-slate-500 font-mono pt-0.5">
                {typeof window !== "undefined" ? window.location.host : "lovelink.app"}
              </div>
            </div>

            {/* Simulated Outgoing WhatsApp Message */}
            <div className="mt-3 pt-3 border-t border-[#2a3942] text-xs text-slate-300 font-sans flex items-end justify-between gap-2 px-2">
              <span className="italic opacity-85">"{getShareMessage()}"</span>
              <span className="text-[10px] text-slate-500 shrink-0 font-mono">Just now ✓✓</span>
            </div>
          </div>
        </div>

        {/* Shareable URL Copy Box */}
        <div className="flex items-center gap-2 w-full bg-slate-950/70 p-2.5 sm:p-3 rounded-2xl border border-slate-800 mb-6">
          <LinkIcon className="w-4 h-4 text-pink-400 shrink-0 ml-2" />
          <input 
            type="text" 
            readOnly 
            value={publishedLink} 
            className="bg-transparent w-full outline-none text-white text-xs sm:text-sm font-mono truncate px-1" 
          />
          <button 
            type="button"
            onClick={handleCopy}
            className="bg-white text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-200 active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Copy</>
            )}
          </button>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col gap-3">
          {/* Primary: WhatsApp 1-Tap */}
          <button 
            type="button"
            onClick={shareToWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 px-6 py-4 rounded-2xl font-bold shadow-[0_10px_30px_rgba(37,211,102,0.3)] hover:scale-[1.01] active:scale-98 transition-all text-base flex items-center justify-center gap-2 group"
          >
            <MessageCircle className="w-5 h-5 text-slate-950 fill-current" />
            <span>Send Directly on WhatsApp</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* View Live Gift */}
            <button 
              type="button"
              onClick={() => window.open(publishedLink, "_blank")} 
              className="w-full py-3 px-4 rounded-xl border border-slate-800 hover:border-pink-500/40 text-slate-300 hover:text-white bg-slate-950/50 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-pink-400" />
              <span>Preview Live Gift</span>
            </button>

            {/* Return to Dashboard / Hub */}
            <Link 
              href="/my-gifts"
              className="w-full py-3 px-4 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white bg-slate-950/50 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Go to My Gifts Hub</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <SuccessContent />
    </Suspense>
  );
}
