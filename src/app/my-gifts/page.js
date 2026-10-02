import { Logo } from "@/components/Logo";
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Link as LinkIcon, ExternalLink, Lock, Clock, Plus, AlertCircle, Sparkles, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function MyGifts() {
  const router = useRouter();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewStars, setNewReviewStars] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"), limit(10));
        const snapshot = await getDocs(q);
        const fetchedReviews = [];
        snapshot.forEach((doc) => fetchedReviews.push({ id: doc.id, ...doc.data() }));
        
        if (fetchedReviews.length > 0) {
          setReviews(fetchedReviews);
        } else {
          setReviews([
            { id: '1', text: "She cried within 5 minutes. Best $15 I've spent.", name: "David T.", stars: 5 },
            { id: '2', text: "The UI is stunning. So easy to build on my phone.", name: "Sarah J.", stars: 5 },
            { id: '3', text: "Literally saved my anniversary.", name: "Michael R.", stars: 5 },
          ]);
        }
      } catch (e) {
        console.error("Error fetching reviews", e);
        setReviews([
          { id: '1', text: "She cried within 5 minutes. Best $15 I've spent.", name: "David T.", stars: 5 },
          { id: '2', text: "The UI is stunning. So easy to build on my phone.", name: "Sarah J.", stars: 5 }
        ]);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // Fetch gifts created by this user
        const q = query(collection(db, "gifts"), where("creatorId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const fetchedGifts = [];
        querySnapshot.forEach((doc) => {
          fetchedGifts.push({ id: doc.id, ...doc.data() });
        });

        // Sort locally to avoid needing a complex Firebase composite index right now
        fetchedGifts.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;
          return dateB - dateA; // Newest first
        });

        setGifts(fetchedGifts);
      } catch (error) {
        console.error("Error fetching gifts:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const copyToClipboard = (id) => {
    const url = `${window.location.origin}/gift/${id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard! Send it to your partner.");
  };

  const IS_LAUNCH_PROMO = false;

  const handlePayNow = async (giftId, recipientName) => {
    if (IS_LAUNCH_PROMO) {
      window.location.href = `/success?giftId=${giftId}`;
      return;
    }
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId, recipientName })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error("Checkout failed:", e);
    }
  };

  const submitReview = async () => {
    if (!newReviewText.trim()) return;
    setIsSubmittingReview(true);
    const reviewData = {
      text: newReviewText,
      name: auth.currentUser?.displayName || "Creator",
      stars: newReviewStars,
      createdAt: serverTimestamp()
    };
    
    try {
      await addDoc(collection(db, "reviews"), reviewData);
      setReviews(prev => [{ id: Date.now().toString(), text: newReviewText, name: reviewData.name }, ...prev]);
      setNewReviewText("");
    } catch (e) {
      console.error(e);
      alert("Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white selection:bg-pink-500/30 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-colors">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
          <Logo className="w-6 h-6 text-pink-500" />
          <Link href="/" className="text-xl font-bold tracking-tight">LoveLink</Link>
        </motion.div>
        <div className="flex gap-4 md:gap-6 items-center">
          <ThemeToggle />
          <button onClick={() => auth.signOut()} className="text-sm text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-slate-900 dark:text-white transition-colors">Sign Out</button>
          <Link href="/dashboard" className="text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full hover:bg-slate-800 dark:hover:bg-gray-200 transition-colors shadow-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Gift
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 min-h-screen flex flex-col">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Welcome Hub</h1>
            <p className="text-slate-500 dark:text-gray-400 text-lg">Manage your gifts, track views, and explore the community.</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20 flex-grow">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
            
            {/* Left Column: Gifts (Wider on laptops) */}
            <div className="lg:col-span-8 space-y-6">
              {gifts.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row items-center gap-8 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent pointer-events-none" />
                  
                  <div className="flex-1 space-y-6 text-center md:text-left z-10">
                    <Heart className="w-12 h-12 text-gray-500 mx-auto md:mx-0" />
                    <h2 className="text-3xl font-bold">Your canvas is empty.</h2>
                    <p className="text-slate-500 dark:text-gray-400 max-w-sm mx-auto md:mx-0">You haven't created any digital letters yet. Experience the magic in the preview, then start building your own.</p>
                    <Link href="/dashboard" className="inline-block bg-slate-900 text-white dark:bg-white dark:text-black px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform mt-4">
                      Start Building Now
                    </Link>
                  </div>

                  <div className="flex-1 flex justify-center z-10 w-full pt-6 md:pt-0">
                    <div className="relative w-full max-w-sm aspect-video bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden group shadow-[0_0_50px_rgba(236,72,153,0.15)] flex items-center justify-center">
                      {isVideoPlaying ? (
                        <iframe 
                          className="w-full h-full border-none"
                          src="https://www.youtube.com/embed/gPBg_M-C4-A?autoplay=1" 
                          allow="autoplay; encrypted-media; fullscreen" 
                          allowFullScreen
                        />
                      ) : (
                        <div onClick={() => setIsVideoPlaying(true)} className="absolute inset-0 cursor-pointer flex items-center justify-center">
                          <img src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80" alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          <div className="relative z-10 w-16 h-16 rounded-full bg-pink-500/90 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.6)] group-hover:scale-110 group-hover:bg-pink-500 transition-all">
                            <svg className="w-7 h-7 text-slate-900 dark:text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                            <span className="text-slate-900 dark:text-white text-sm md:text-base font-medium drop-shadow-md">How to build a LoveLink</span>
                            <span className="text-slate-900 dark:text-white text-xs font-bold bg-slate-100 dark:bg-black/60 px-2 py-1 rounded-full backdrop-blur-md">2:15</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {gifts.map((gift) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={gift.id} 
                      className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-pink-500/30 transition-all flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">For {gift.recipientName}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400 mt-1">
                            <Clock className="w-4 h-4" />
                            {gift.createdAt ? new Date(gift.createdAt.toMillis()).toLocaleDateString() : 'Just now'}
                          </div>
                        </div>
                        
                        {gift.paid ? (
                          <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Live</span>
                        ) : (
                          <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Unpaid</span>
                        )}
                      </div>

                      <div className="text-slate-600 dark:text-gray-300 text-sm mb-4 flex-grow line-clamp-2 italic">
                        "{gift.letter || 'No letter content...'}"
                      </div>

                      {(gift.partnerAnswerQ1 || gift.partnerAnswerQ2) && (
                        <div className="mb-6 p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/20 blur-2xl" />
                          <h4 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Sparkles className="w-3 h-3"/> They Answered!
                          </h4>
                          {gift.partnerAnswerQ1 && (
                            <p className="text-sm text-slate-700 dark:text-gray-200 mt-1"><span className="opacity-50 text-xs uppercase">Q1:</span> {gift.partnerAnswerQ1}</p>
                          )}
                          {gift.partnerAnswerQ2 && (
                            <p className="text-sm text-slate-700 dark:text-gray-200 mt-1"><span className="opacity-50 text-xs uppercase">Q2:</span> {gift.partnerAnswerQ2}</p>
                          )}
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                        {gift.paid ? (
                          <>
                            <button onClick={() => copyToClipboard(gift.id)} className="flex-1 flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/20 py-2 rounded-xl text-sm font-medium transition-colors">
                              <LinkIcon className="w-4 h-4" /> Copy Link
                            </button>
                            <Link href={`/gift/${gift.id}`} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-pink-500/20">
                              View <ExternalLink className="w-4 h-4" />
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link href={`/gift/${gift.id}`} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/20 py-2 rounded-xl text-sm font-medium transition-colors text-slate-500 dark:text-gray-400">
                              <Lock className="w-4 h-4" /> Locked
                            </Link>
                            <button onClick={() => handlePayNow(gift.id, gift.recipientName)} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-gray-200 py-2 rounded-xl text-sm font-bold transition-colors">
                              Pay $15 to Unlock
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Marketing & Community */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Affiliate Program Card */}
              <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/5 border border-pink-500/30 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Heart className="w-24 h-24 text-pink-500 fill-pink-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 relative z-10">
                  <Sparkles className="w-5 h-5 text-pink-400" /> Partner Program
                </h3>
                <p className="text-slate-600 dark:text-gray-300 text-sm mb-6 relative z-10 leading-relaxed">
                  Want to make money with us? Refer friends to LoveLink and earn <strong className="text-slate-900 dark:text-white">40% commission</strong> on every purchase they make.
                </p>
                <button className="w-full py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-bold transition-colors relative z-10 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                  Join & Get Link
                </button>
              </div>

              {/* Community Reviews Card */}
              <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Community Love</h3>
                </div>
                
                {/* Scrollable Reviews List */}
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow mb-4">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-slate-100 dark:bg-black/40 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                      <div className="flex gap-1 mb-2">
                        {[1,2,3,4,5].map(star => <Star key={star} className={`w-3 h-3 ${star <= (r.stars || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />)}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-gray-300 italic mb-2">"{r.text}"</p>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">— {r.name}</p>
                    </div>
                  ))}
                </div>

                {/* Leave a review input */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-3 shrink-0">
                   <div className="flex justify-center gap-1">
                      {[1,2,3,4,5].map(star => (
                        <Star 
                          key={star} 
                          onClick={() => setNewReviewStars(star)}
                          className={`w-5 h-5 cursor-pointer transition-colors ${star <= newReviewStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} 
                        />
                      ))}
                   </div>
                   <div className="flex flex-col gap-2">
                     <textarea 
                        rows="3"
                        value={newReviewText}
                        onChange={e => setNewReviewText(e.target.value)}
                        placeholder="Write a review..." 
                        className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-pink-500 resize-none custom-scrollbar" 
                     />
                     <button 
                        onClick={submitReview} 
                        disabled={isSubmittingReview || !newReviewText.trim()}
                        className="w-full bg-pink-500 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-pink-600 disabled:opacity-50 flex items-center justify-center">
                        {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Review"}
                     </button>
                   </div>
                </div>
              </div>

              {/* Community Link */}
              <a href="#" className="block bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/30 rounded-3xl p-6 transition-colors group">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Join the Community</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Follow us on TikTok & X</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-slate-900 dark:text-white transition-colors" />
                </div>
              </a>

            </div>
          </div>
        )}

        {/* FAQ SECTION */}
        {!loading && (
          <div className="mt-16 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 md:p-12 mb-10 w-full">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div>
                  <h3 className="text-lg font-bold mb-2 text-pink-400">Is my data private?</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">Yes. Your photos and letters are locked in our secure database. Only someone with the exact link can view it.</p>
               </div>
               <div>
                  <h3 className="text-lg font-bold mb-2 text-pink-400">Does the link ever expire?</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">No! When you pay the one-time fee, your LoveLink is hosted permanently forever.</p>
               </div>
               <div>
                  <h3 className="text-lg font-bold mb-2 text-pink-400">Can I edit it later?</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">Yes, you can edit it at any time from this dashboard for free to fix typos or swap photos.</p>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
