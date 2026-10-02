"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Play, Pause, Disc, ArrowLeft, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { auth, db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Inbox() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const q = query(collection(db, "gifts"), where("creatorId", "==", user.uid));
        const snapshot = await getDocs(q);
        const msgs = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.response) {
            msgs.push({ id: doc.id, ...data });
          }
        });
        setMessages(msgs.sort((a, b) => new Date(b.response.createdAt) - new Date(a.response.createdAt)));
      } catch (err) {
        console.error("Error fetching inbox:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const selectMessage = (msg) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setSelectedMsg(msg);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors">
      <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-colors">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
          <Logo className="w-6 h-6 text-pink-500" />
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">LoveLink</Link>
        </motion.div>
        <div className="flex gap-4 md:gap-6 items-center">
          <ThemeToggle />
          <Link href="/my-gifts" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors">My Links</Link>
          <Link href="/dashboard" className="text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-600 text-white px-5 py-2 rounded-full hover:scale-105 transition-transform shadow-lg shadow-pink-500/25">New Gift</Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-8 min-h-screen">
        {/* Left Column: Message List */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-pink-500" />
            </div>
            <h1 className="text-2xl font-bold">Inbox</h1>
            <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">{messages.length}</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
              <Mail className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-gray-400 font-medium">Your inbox is empty.</p>
              <p className="text-sm text-slate-400 dark:text-gray-500 mt-2">When someone replies to your gift, it will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <button 
                  key={msg.id} 
                  onClick={() => selectMessage(msg)}
                  className={`p-4 rounded-2xl border text-left transition-all ${selectedMsg?.id === msg.id ? 'bg-pink-500/10 border-pink-500 shadow-md' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-pink-500/50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{msg.recipientName}</h3>
                    {msg.response.type === 'voice' ? (
                      <Disc className="w-4 h-4 text-pink-500" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-pink-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 capitalize">
                    {msg.response.createdAt ? new Date(msg.response.createdAt).toLocaleDateString() : 'New'} • {msg.response.type} message
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Player UI */}
        <div className="w-full md:w-2/3">
          <AnimatePresence mode="wait">
            {selectedMsg ? (
              <motion.div 
                key={selectedMsg.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-full min-h-[400px] bg-white dark:bg-[#111] rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl"
              >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md">
                  <h2 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-8">From {selectedMsg.recipientName}</h2>
                  
                  {selectedMsg.response.type === 'voice' ? (
                    <>
                      {/* The DVD / CD Player Visual */}
                      <div className="relative mb-10 w-48 h-48 md:w-64 md:h-64">
                        {/* CD Case Shadow / Sleeve */}
                        <div className="absolute inset-0 bg-slate-900 rounded-full translate-x-2 translate-y-2 opacity-20 blur-md"></div>
                        
                        {/* The Disc */}
                        <motion.div 
                          animate={{ rotate: isPlaying ? 360 : 0 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="w-full h-full rounded-full border border-slate-700 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.1)_360deg)] bg-slate-800 shadow-xl relative flex items-center justify-center overflow-hidden"
                          style={{
                            background: "radial-gradient(circle, #333 30%, #111 70%)"
                          }}
                        >
                          {/* Grooves */}
                          <div className="absolute inset-2 rounded-full border border-white/5"></div>
                          <div className="absolute inset-4 rounded-full border border-white/5"></div>
                          <div className="absolute inset-8 rounded-full border border-white/5"></div>
                          
                          {/* Inner Label */}
                          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-inner relative">
                            {/* Spindle Hole */}
                            <div className="w-4 h-4 rounded-full bg-[#111] border border-black/50 shadow-inner z-10"></div>
                            
                            {/* Text on Label */}
                            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]">
                              <path id="curve" d="M 15 50 A 35 35 0 1 1 15 50.001" fill="transparent" />
                              <text className="text-[10px] font-bold fill-white/80 uppercase tracking-widest">
                                <textPath href="#curve" startOffset="50%" textAnchor="middle">
                                  LoveLink Mix •
                                </textPath>
                              </text>
                            </svg>
                          </div>
                        </motion.div>
                      </div>

                      {/* Hidden Audio Element */}
                      <audio 
                        ref={audioRef} 
                        src={selectedMsg.response.content} 
                        onEnded={() => setIsPlaying(false)}
                      />

                      {/* Playback Controls */}
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={handlePlay}
                          className="w-16 h-16 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xl hover:scale-110 transition-all"
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                        </button>
                      </div>
                      <p className="mt-6 text-sm font-medium text-slate-500">{isPlaying ? "Playing Message..." : "Press Play to Listen"}</p>
                    </>
                  ) : (
                    <>
                      {/* Text Note Visual */}
                      <div className="w-full p-8 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl relative mb-8 text-left">
                        <Quote className="absolute top-4 left-4 w-8 h-8 text-pink-500/20" />
                        <p className="text-xl md:text-2xl font-serif italic text-slate-700 dark:text-slate-300 relative z-10 leading-relaxed px-4 py-6">
                          "{selectedMsg.response.content}"
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="w-full h-full min-h-[400px] border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400">
                <Disc className="w-12 h-12 mb-4 opacity-20" />
                <p>Select a message to open.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

const Quote = ({className}) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
  </svg>
);
