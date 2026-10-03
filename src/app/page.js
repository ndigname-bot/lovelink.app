"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, ArrowRight, CheckCircle2, Image as ImageIcon, Link as LinkIcon, Star } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

export default function Home() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white selection:bg-pink-500/30 font-sans overflow-x-hidden transition-colors duration-300">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto relative z-50">
        <div className="flex items-center gap-2">
          <Logo className="w-6 h-6 text-pink-500" />
          <span className="text-xl font-bold tracking-tight">LoveLink</span>
        </div>
        <div className="flex gap-2 md:gap-6 items-center">
          <ThemeToggle />
          <Link href="/login" className="text-xs md:text-sm whitespace-nowrap text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors">Sign In</Link>
          <Link href="/dashboard" className="text-xs md:text-sm font-medium whitespace-nowrap bg-slate-900 text-white dark:bg-white dark:text-black px-3 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-slate-800 dark:hover:bg-gray-200 transition-colors shadow-lg">
            Start Building
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-8 pt-16 pb-24 flex flex-col lg:flex-row items-center justify-between gap-16">
        {/* Background Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-pink-500/10 blur-[150px] rounded-full pointer-events-none" />

        {/* Left Side: Copy & CTA */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left flex-1"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>The ultimate digital romantic experience</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            The most <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-600">unforgettable gift</span><br/> you will ever give.
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl px-2 sm:px-0 text-slate-500 dark:text-gray-400 max-w-xl mb-10 leading-relaxed">
            Create a highly personalized, interactive digital love letter in minutes. 
            Complete with mini-games, your favorite memories, and your couple's song.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/dashboard" className="group flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-slate-900 dark:text-white px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(236,72,153,0.4)]">
              Create Yours for $10
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
             <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-black" />
                <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-black" />
                <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-black" />
             </div>
             <p>Over <strong className="text-slate-600 dark:text-gray-300">2,000+</strong> partners surprised</p>
          </div>
        </motion.div>

        {/* Right Side: INTERACTIVE PHONE MOCKUP */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-20 flex-1 flex justify-center lg:justify-end w-full"
        >
          {/* Phone Frame */}
          <div className="relative w-[320px] h-[650px] md:w-[340px] md:h-[700px] bg-slate-100 dark:bg-black rounded-[3rem] border-[12px] border-gray-900 shadow-[0_0_80px_rgba(236,72,153,0.3)] overflow-hidden ring-1 ring-white/10 group">
            {/* iPhone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-2xl z-30 flex justify-center items-center">
               <div className="w-12 h-1 bg-white dark:bg-black/50 rounded-full mt-1" />
            </div>
            
            {/* Playable iframe Demo */}
            <iframe 
              src="/gift/demo-gift" 
              className="w-full h-full border-none bg-slate-100 dark:bg-black"
              title="Interactive Demo"
            />
            
            {/* Hover overlay hint */}
            <div className="absolute top-8 right-[-100px] group-hover:right-4 transition-all duration-500 bg-pink-500 text-slate-900 dark:text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-40 rotate-12">
               Try me! 👉
            </div>
          </div>
          
          {/* Decorative glow behind phone */}
          <div className="absolute -z-10 top-1/4 right-10 w-64 h-64 bg-rose-500/20 rounded-full blur-[80px]" />
        </motion.div>
      </main>

      {/* VIDEO TUTORIAL SECTION */}
      <section className="py-24 max-w-5xl mx-auto px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">See how it works.</h2>
          <p className="text-slate-500 dark:text-gray-400">Watch how easy it is to build a cinematic experience in under 2 minutes.</p>
        </div>
        
        <div className="relative w-full aspect-video bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(236,72,153,0.15)] flex items-center justify-center group">
          {isVideoPlaying ? (
            <iframe 
              className="w-full h-full border-none"
              src="https://www.youtube.com/embed/gPBg_M-C4-A?autoplay=1" 
              allow="autoplay; encrypted-media; fullscreen" 
              allowFullScreen
            />
          ) : (
            <div onClick={() => setIsVideoPlaying(true)} className="absolute inset-0 cursor-pointer flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80" alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Play Button */}
              <div className="relative z-10 w-20 h-20 rounded-full bg-pink-500/90 flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.6)] group-hover:scale-110 group-hover:bg-pink-500 transition-all duration-300">
                <svg className="w-8 h-8 text-slate-900 dark:text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              
              {/* Video Title Bar */}
              <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between z-10">
                <span className="text-slate-900 dark:text-white text-lg font-medium drop-shadow-md">LoveLink Walkthrough</span>
                <span className="text-slate-900 dark:text-white text-sm font-bold bg-slate-100 dark:bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md">2:15</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-24 bg-white/[0.02] border-y border-slate-200 dark:border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">You don't need to be a coder.</h2>
          <p className="text-slate-500 dark:text-gray-400 mb-16">Build a world-class experience for your partner in 3 simple steps.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. The Trivia</h3>
              <p className="text-slate-500 dark:text-gray-400 text-center">Type in 3 custom questions about your relationship to test their memory.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6">
                <ImageIcon className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. The Memories</h3>
              <p className="text-slate-500 dark:text-gray-400 text-center">Upload your favorite couple photos, a voice note, and pick your background song.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6">
                <LinkIcon className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. The Magic Link</h3>
              <p className="text-slate-500 dark:text-gray-400 text-center">Checkout and instantly receive a permanent link to text them. Watch them cry happy tears.</p>
            </div>
          </div>
        </div>
      </section>

      {/* THEME SHOWCASE SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-8 relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center">Three Cinematic Themes.</h2>
        <p className="text-slate-500 dark:text-gray-400 mb-16 text-center max-w-2xl mx-auto">Set the perfect mood. Choose from three hand-crafted visual styles that dynamically alter the colors, fonts, and particle effects of your gift.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Blush */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-pink-500/30 rounded-[2rem] p-8 relative overflow-hidden group hover:scale-105 transition-transform cursor-default">
             <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 blur-[50px]" />
             <h3 className="text-2xl font-serif font-bold text-pink-400 mb-2">Blush</h3>
             <p className="text-slate-500 dark:text-gray-400 text-sm mb-6 font-serif">Classic, romantic, and rose-tinted. Elegant serif typography with soft glowing neon.</p>
             <div className="w-full h-40 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-inner">
                <Heart className="w-12 h-12 text-pink-500 fill-pink-500/20 group-hover:scale-110 transition-transform" />
             </div>
          </div>
          {/* Midnight */}
          <div className="bg-gradient-to-br from-slate-950 via-black to-indigo-950 border border-indigo-500/30 rounded-[2rem] p-8 relative overflow-hidden group hover:scale-105 transition-transform cursor-default">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px]" />
             <h3 className="text-2xl font-sans font-bold text-indigo-400 mb-2">Midnight</h3>
             <p className="text-slate-500 dark:text-gray-400 text-sm mb-6 font-sans">Cyberpunk, high-energy, and modern. Sleek typography with sharp neon blue gradients.</p>
             <div className="w-full h-40 bg-indigo-950/30 rounded-xl border border-indigo-500/20 flex items-center justify-center shadow-inner">
                <Sparkles className="w-12 h-12 text-indigo-400 group-hover:scale-110 transition-transform" />
             </div>
          </div>
          {/* Ocean */}
          <div className="bg-gradient-to-br from-cyan-950 via-teal-950 to-black border border-cyan-500/30 rounded-[2rem] p-8 relative overflow-hidden group hover:scale-105 transition-transform cursor-default">
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-[50px]" />
             <h3 className="text-2xl font-sans font-bold text-cyan-400 mb-2">Ocean</h3>
             <p className="text-slate-500 dark:text-gray-400 text-sm mb-6 font-sans">Calm, deep, and ambient. Heavy glassmorphism with watery teal and cyan ripples.</p>
             <div className="w-full h-40 bg-cyan-950/20 rounded-xl border border-cyan-500/30 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-cyan-400 group-hover:scale-110 transition-transform" />
             </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-24 bg-white/[0.02] border-y border-slate-200 dark:border-white/5 relative z-10">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-bold mb-4">Priceless reactions. <br className="md:hidden"/>One tiny price.</h2>
             <p className="text-slate-500 dark:text-gray-400 text-lg">Skip the expensive developers and the headache of learning to code.</p>
          </div>
          
          <div className="bg-white dark:bg-black/50 backdrop-blur-xl border border-pink-500/30 rounded-[3rem] p-8 md:p-12 shadow-[0_0_80px_rgba(236,72,153,0.15)] flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
             <div className="absolute -left-20 -top-20 w-64 h-64 bg-pink-500/20 blur-[100px] pointer-events-none" />
             
             <div className="flex-1 space-y-6 z-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 text-pink-400 font-bold text-sm uppercase tracking-wider mb-2">
                   Lifetime Access
                </div>
                <h3 className="text-4xl font-bold">The LoveLink</h3>
                <div className="flex items-baseline justify-center md:justify-start gap-3">
                   <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">FREE</span>
                   <span className="text-2xl text-slate-400 line-through decoration-pink-500/50 decoration-2">$15</span>
                </div>
                <p className="text-pink-500 font-bold uppercase tracking-wider text-sm mb-2">🎉 Launch Week Promo</p>
                <p className="text-slate-600 dark:text-gray-300">Everything you need to create a permanent, cinematic memory.</p>
                <Link href="/dashboard" className="inline-block w-full text-center bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-lg py-4 rounded-full hover:bg-slate-800 dark:hover:bg-gray-200 transition-colors shadow-xl mt-4">
                   Start Building Now
                </Link>
             </div>

             <div className="flex-1 space-y-4 z-10 w-full">
                {[
                  "10-Photo Memory Carousel",
                  "3 Custom Trivia Questions",
                  "Interactive Floating Reasons",
                  "Background Music Integration",
                  "Permanent Hosting forever",
                  "100% Private & Secure"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                     <span className="text-slate-700 dark:text-gray-200 font-medium text-lg">{feature}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-8 relative z-10">
        <h2 className="text-3xl font-bold mb-12 text-center">Don't just take our word for it.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "David T.", text: "I sent this to my girlfriend while I was deployed overseas. She called me crying within 5 minutes. Best $15 I've ever spent." },
            { name: "Sarah J.", text: "I made one for my husband for our anniversary. The UI is stunning and the music feature just pushed it over the edge." },
            { name: "Michael R.", text: "I forgot our anniversary and had to scramble. Built this in 10 minutes on my phone and she thought I spent weeks coding it. 10/10." }
          ].map((review, i) => (
            <div key={i} className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-pink-500 text-pink-500" />)}
              </div>
              <p className="text-slate-600 dark:text-gray-300 italic mb-6">"{review.text}"</p>
              <p className="font-semibold text-slate-900 dark:text-white">— {review.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 max-w-3xl mx-auto px-8 relative z-10 border-t border-slate-200 dark:border-white/5">
        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">Questions? We got you.</h2>
        <div className="space-y-6">
           <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-2 text-pink-400">Is my data private?</h3>
              <p className="text-slate-500 dark:text-gray-400 leading-relaxed">Absolutely. Your photos and letters are locked in our secure database. Only someone with the exact, unique 20-character link can view your gift.</p>
           </div>
           <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-2 text-pink-400">Does the link ever expire?</h3>
              <p className="text-slate-500 dark:text-gray-400 leading-relaxed">No! When you pay the one-time $15 fee, your LoveLink is hosted permanently. You can look back on it years from now.</p>
           </div>
           <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-2 text-pink-400">Can I edit it after paying?</h3>
              <p className="text-slate-500 dark:text-gray-400 leading-relaxed">Yes, you can log into your dashboard at any time to fix typos, change the music, or swap out photos for absolutely free.</p>
           </div>
        </div>
      </section>
    </div>
  );
}
