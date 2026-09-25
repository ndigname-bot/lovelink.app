"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Sparkles, Link as LinkIcon, CheckCircle2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const giftId = searchParams.get("giftId");
  
  const [loading, setLoading] = useState(true);
  const [publishedLink, setPublishedLink] = useState("");

  useEffect(() => {
    if (!giftId) {
      router.push("/dashboard");
      return;
    }

    const verifyPaymentAndActivate = async () => {
      try {
        // The Webhook handles marking the gift as paid securely in the background.
        // We just display the success screen to the user.
        setPublishedLink(`${window.location.origin}/gift/${giftId}`);
        setLoading(false);
      } catch (err) {
        console.error("Error activating gift:", err);
      }
    };

    verifyPaymentAndActivate();
  }, [giftId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <Sparkles className="w-10 h-10 text-pink-500 mb-4 animate-spin" />
          <p className="text-xl font-medium">Verifying payment and generating link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white px-6">
      <div className="w-full max-w-xl bg-gradient-to-br from-green-900/50 to-emerald-900/20 border border-green-500/30 p-10 rounded-3xl text-center shadow-2xl">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Payment Successful! 🎉</h1>
        <p className="text-gray-300 mb-8 text-lg">Your cinematic love letter is officially unlocked and ready to share forever.</p>
        
        <div className="flex items-center gap-3 w-full bg-black/50 p-4 rounded-xl border border-white/10 mb-8">
          <LinkIcon className="w-5 h-5 text-pink-400 shrink-0" />
          <input 
            type="text" 
            readOnly 
            value={publishedLink} 
            className="bg-transparent w-full outline-none text-white font-medium truncate" 
          />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(publishedLink);
              alert("Copied to clipboard!");
            }}
            className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors shrink-0"
          >
            Copy
          </button>
        </div>

        <button 
          onClick={() => window.open(publishedLink, "_blank")} 
          className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-4 rounded-full font-bold shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:scale-[1.02] transition-all text-lg"
        >
          View Live Gift
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <SuccessContent />
    </Suspense>
  );
}
