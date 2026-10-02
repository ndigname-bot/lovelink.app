"use client";
import { useState, useEffect, use, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Music, Lock, Unlock, ArrowRight, Image as ImageIcon } from "lucide-react";
import confetti from "canvas-confetti";
import { db, storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const getThemeStyles = (theme) => {
  switch (theme) {
    case 'midnight':
      return {
        bg: 'bg-gradient-to-br from-slate-950 via-black to-indigo-950',
        text: 'text-indigo-50',
        accentText: 'text-indigo-400',
        accentGradient: 'from-indigo-600 to-blue-500',
        heart: 'text-indigo-500 fill-indigo-500/20',
        glass: 'bg-indigo-950/30 backdrop-blur-2xl',
        border: 'border-indigo-500/20',
        font: 'font-sans',
        particles: ['#4f46e5', '#3b82f6', '#8b5cf6']
      };
    case 'ocean':
      return {
        bg: 'bg-gradient-to-br from-cyan-950 via-teal-950 to-black',
        text: 'text-cyan-50',
        accentText: 'text-cyan-400',
        accentGradient: 'from-teal-500 to-cyan-500',
        heart: 'text-cyan-500 fill-cyan-500/20',
        glass: 'bg-cyan-950/20 backdrop-blur-3xl',
        border: 'border-cyan-500/30',
        font: 'font-sans',
        particles: ['#06b6d4', '#14b8a6', '#3b82f6']
      };
    case 'blush':
    default:
      return {
        bg: 'bg-white dark:bg-[#0a0a0a]',
        text: 'text-slate-900 dark:text-white/90',
        accentText: 'text-pink-400',
        accentGradient: 'from-pink-500 to-rose-500',
        heart: 'text-pink-500 fill-pink-500/20',
        glass: 'bg-slate-200 dark:bg-white/10 backdrop-blur-2xl',
        border: 'border-slate-300 dark:border-white/20',
        font: 'font-serif',
        particles: ['#ec4899', '#f43f5e', '#ffffff']
      };
  }
};

export default function GiftViewer({ params }) {
  const unwrappedParams = use(params);
  const giftId = unwrappedParams?.id || "demo-gift";
  
  const [giftData, setGiftData] = useState(null);
  
  // Stages: -2 (Greeting), -1 (Buildup), 0 (Lock), 1 (Q1), 2 (Q2), 3 (Carousel), 4 (Reasons), 5 (Letter)
  const [stage, setStage] = useState(-2); 
  const [activeModal, setActiveModal] = useState(null); 
  const [openEndedText, setOpenEndedText] = useState("");
  const [pressProgress, setPressProgress] = useState(0);
  const [activePhoto, setActivePhoto] = useState(0);
  const [poppedReasons, setPoppedReasons] = useState([false, false, false]);
  const pressInterval = useRef(null);

  
  // --- REACTION BOOTH LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setAudioChunks((prev) => [...prev, e.data]);
      };
      
      recorder.start();
      setIsRecording(true);
      
      // Stop automatically after 60s
      setTimeout(() => {
        if (recorder.state === "recording") stopRecording();
      }, 60000);
    } catch (err) {
      alert("Microphone access denied. Please allow microphone access to record a voice note.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const submitReaction = async (type, blob = null) => {
    setIsSubmittingReaction(true);
    try {
      let finalContent = reactionText;
      
      if (type === 'voice' && blob) {
        const audioRef = ref(storage, `reactions/${id}/${Date.now()}_voicenote.webm`);
        const snapshot = await uploadBytes(audioRef, blob);
        finalContent = await getDownloadURL(snapshot.ref);
      }
      
      // Update Firestore
      const giftRef = doc(db, "gifts", id);
      await updateDoc(giftRef, {
        response: {
          type,
          content: finalContent,
          createdAt: new Date().toISOString()
        }
      });
      
      setReactionSent(true);
    } catch (err) {
      console.error(err);
      alert("Failed to send reaction. Please try again.");
    }
    setIsSubmittingReaction(false);
  };

  
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const fetchGiftData = async () => {
      if (giftId === "draft") {
        try {
          const saved = localStorage.getItem("lovelink_draft");
          if (saved) {
            const draftData = JSON.parse(saved);
            setGiftData({
              theme: draftData.theme || "blush",
              recipientName: draftData.recipientName || "Cutie",
              creatorName: draftData.creatorName || "Me",
              songQuery: draftData.songQuery || "Daniel Caesar - Get You",
              photoUrls: draftData.photoUrls || [], 
              photoCaptions: draftData.photoCaptions || [],
              reasons: draftData.reasons || ["Your smile", "Your laugh", "Your kindness"],
              questions: [
                {
                  question: draftData.q1?.question || "What is my favorite thing about you?",
                  options: [{ text: draftData.q1?.correct || "Your smile", isCorrect: true }, { text: draftData.q1?.wrong1 || "Your cooking", isCorrect: false }, { text: draftData.q1?.wrong2 || "Your jokes", isCorrect: false }].sort(() => Math.random() - 0.5),
                  reward: "You already know! ❤️"
                },
                {
                  question: draftData.q2?.question || "Where was our first date?",
                  options: [{ text: draftData.q2?.correct || "The coffee shop", isCorrect: true }, { text: draftData.q2?.wrong1 || "The movies", isCorrect: false }, { text: draftData.q2?.wrong2 || "The park", isCorrect: false }].sort(() => Math.random() - 0.5),
                  reward: "Best day of my life. 🎉"
                }
              ],
              letter: draftData.letter || "I just wanted to make something special...",
              signOff: `Yours forever,\n${draftData.creatorName || "Me"}`,
              paid: true
            });
            return;
          }
        } catch (e) { console.error(e); }
      }

      try {
        const docRef = doc(db, "gifts", giftId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const dbData = docSnap.data();
          setGiftData({
            theme: dbData.theme || "blush",
            recipientName: dbData.recipientName || "Cutie",
            creatorName: dbData.creatorName || "Me",
            songQuery: dbData.songQuery || "Daniel Caesar - Get You",
            photoUrls: dbData.photoUrls || (dbData.photoUrl ? [dbData.photoUrl] : []),
            photoCaptions: dbData.photoCaptions || [],
            reasons: dbData.reasons || ["Your beautiful smile", "How you care for me", "Your incredible patience"],
            questions: [
              {
                question: dbData.q1?.question || "Question 1?",
                options: [{ text: dbData.q1?.correct || "Correct", isCorrect: true }, { text: dbData.q1?.wrong1 || "Wrong", isCorrect: false }, { text: dbData.q1?.wrong2 || "Wrong", isCorrect: false }].sort(() => Math.random() - 0.5),
                reward: "You got it! ❤️"
              },
              {
                question: dbData.q2?.question || "Question 2?",
                options: [{ text: dbData.q2?.correct || "Correct", isCorrect: true }, { text: dbData.q2?.wrong1 || "Wrong", isCorrect: false }, { text: dbData.q2?.wrong2 || "Wrong", isCorrect: false }].sort(() => Math.random() - 0.5),
                reward: "Amazing! 🎉"
              }
            ],
            letter: dbData.letter || "This is my letter to you...",
            signOff: `Yours forever,\n${dbData.creatorName || "Me"}`,
            paid: dbData.paid !== false, 
          });
          return;
        }
      } catch (err) { console.error(err); }

      // Default Fallback
      setGiftData({
        theme: "blush", recipientName: "Yuri", creatorName: "Emmanuel", songQuery: "Beautiful - Bazzi", 
        photoUrls: ["https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80", "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=500&q=80"],
        reasons: ["Your radiant energy", "How safe I feel with you", "Your endless creativity"],
        paid: true,
        questions: [
          { question: "Where is our dream vacation? ✈️", options: [{ text: "Japan 🇯🇵", isCorrect: true }, { text: "Paris", isCorrect: false }, { text: "China", isCorrect: false }], reward: "Can't wait to travel the world with you." },
          { question: "How does my love connect with yours? 💧", options: [{ text: "Like a river into your ocean", isCorrect: true }, { text: "Like ice melting", isCorrect: false }, { text: "Like a pond", isCorrect: false }], reward: "Deeper than the ocean." }
        ],
        letter: "Hey there my love,\n\nI'm here as a messenger to tell you that God loves you sooo deeply that He is letting me love you too. ❤️",
        signOff: "Love forever,\nEmmanuel"
      });
    };

    fetchGiftData();
  }, [giftId]);

  // Handle Photo Carousel Autoplay
  useEffect(() => {
    let interval;
    if (stage === 3 && giftData?.photoUrls?.length > 1) {
      interval = setInterval(() => {
        setActivePhoto((prev) => (prev + 1) % giftData.photoUrls.length);
      }, 3500); // Change photo every 3.5s
    }
    return () => clearInterval(interval);
  }, [stage, giftData?.photoUrls?.length]);

  if (!giftData) return <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center"><Heart className="w-10 h-10 text-pink-500 animate-pulse" /></div>;

  if (giftData.paid === false) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center text-slate-900 dark:text-white px-6 text-center">
        <div className="max-w-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 md:p-10 rounded-3xl">
          <Lock className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">This gift is locked.</h1>
          <p className="text-slate-500 dark:text-gray-400">The creator has not completed payment for this digital letter yet.</p>
        </div>
      </div>
    );
  }

  const styles = getThemeStyles(giftData.theme);

  const startPress = () => {
    pressInterval.current = setInterval(() => {
      setPressProgress((prev) => {
        if (prev >= 100) {
          clearInterval(pressInterval.current);
          triggerUnlock();
          return 100;
        }
        return prev + 2;
      });
    }, 20);
  };
  const stopPress = () => {
    clearInterval(pressInterval.current);
    if (pressProgress < 100) setPressProgress(0);
  };

  const triggerUnlock = () => {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: styles.particles });
    setTimeout(() => setStage(1), 800);
  };

  const handleAnswer = async (isCorrect, text) => {
    // Silently save their answer to the database if it's a real gift
    if (giftId !== "demo-gift" && giftId !== "draft" && giftData.paid !== false) {
      try {
        const docRef = doc(db, "gifts", giftId);
        await updateDoc(docRef, {
          [`partnerAnswerQ${stage}`]: text,
          lastOpened: serverTimestamp()
        });
      } catch(e) {
        console.error("Could not save answer tracking", e);
      }
    }

    if (isCorrect) {
      setActiveModal("reward");
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: styles.particles });
    } else {
      setActiveModal("wrong");
      setTimeout(() => setActiveModal(null), 1500);
    }
  };

  const nextStage = () => {
    setActiveModal(null);
    setStage(prev => prev + 1);
  };

  const popReason = (index) => {
    const newPopped = [...poppedReasons];
    newPopped[index] = true;
    setPoppedReasons(newPopped);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 }, colors: styles.particles });
  };

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text} ${styles.font} flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000`}>
      
      {stage >= 0 && (
        <motion.div initial={{y:-50, opacity:0}} animate={{y:0, opacity:1}} className={`absolute top-6 left-1/2 -translate-x-1/2 ${styles.glass} ${styles.border} px-4 py-2 rounded-full border flex items-center gap-2 z-50`}>
          <Music className={`w-3 h-3 ${styles.accentText} animate-pulse`} />
          <span className="text-xs font-medium tracking-wide">Playing: {giftData.songQuery}</span>
        </motion.div>
      )}

      {stage >= 1 && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:2}} className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br ${styles.accentGradient} opacity-[0.05] blur-[100px]`} />
          <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl ${styles.accentGradient} opacity-[0.05] blur-[100px]`} />
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        
        {stage === -2 && (
          <motion.div key="greeting" initial={{opacity:0, filter:"blur(10px)"}} animate={{opacity:1, filter:"blur(0px)"}} exit={{opacity:0, filter:"blur(10px)"}} transition={{duration:1.5}} className="text-center z-10 cursor-pointer" onClick={() => setStage(-1)}>
            <h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light mb-6`}>Hey, {giftData.recipientName}...</h1>
            <p className={`text-sm opacity-40 tracking-widest uppercase animate-pulse ${styles.font}`}>Tap anywhere to continue</p>
          </motion.div>
        )}

        {stage === -1 && (
          <motion.div key="buildup" initial={{opacity:0, filter:"blur(10px)"}} animate={{opacity:1, filter:"blur(0px)"}} exit={{opacity:0, filter:"blur(10px)"}} transition={{duration:1.5}} className="text-center z-10 cursor-pointer" onClick={() => setStage(0)}>
            <h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light leading-relaxed mb-6`}>
              I made something <br/><span className={`${styles.accentText} font-semibold`}>special</span> just for you.
            </h1>
            <p className={`text-sm opacity-40 tracking-widest uppercase animate-pulse ${styles.font}`}>Tap anywhere to continue</p>
          </motion.div>
        )}

        {stage === 0 && (
          <motion.div key="lock" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.1}} transition={{duration:1}} className="text-center z-10 flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full ${styles.glass} ${styles.border} border flex items-center justify-center mb-10 shadow-2xl relative`}>
              {pressProgress >= 100 ? <Unlock className={`w-10 h-10 ${styles.accentText}`} /> : <Lock className="w-10 h-10 opacity-50" />}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="46" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <circle cx="48" cy="48" r="46" fill="none" stroke={styles.particles[0]} strokeWidth="4" strokeDasharray="289" strokeDashoffset={289 - (289 * pressProgress) / 100} className="transition-all duration-75" />
              </svg>
            </div>
            <motion.button onPointerDown={startPress} onPointerUp={stopPress} onPointerLeave={stopPress} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white text-black px-10 py-4 rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.2)] select-none touch-none">
              Press and Hold to Unlock
            </motion.button>
          </motion.div>
        )}

        {/* TRIVIA STAGES */}
        {(stage === 1 || stage === 2) && !activeModal && (
          <motion.div key={`q-${stage}`} initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-30}} className={`w-full max-w-md ${styles.glass} p-8 rounded-[2rem] border ${styles.border} shadow-2xl relative z-10`}>
            <h2 className={`text-xs uppercase tracking-widest font-bold mb-4 ${styles.accentText}`}>Memory #{stage}</h2>
            <p className="text-2xl md:text-3xl font-semibold mb-10 leading-snug">{giftData.questions[stage-1].question}</p>
            <div className="space-y-4">
              {giftData.questions[stage-1].type === "open_ended" ? (
                <div className="flex flex-col gap-4">
                  <input 
                    type="text" 
                    value={openEndedText} 
                    onChange={e => setOpenEndedText(e.target.value)} 
                    placeholder="Type your answer here..." 
                    className={`w-full p-4 bg-white dark:bg-black/50 border border-slate-300 dark:border-white/20 rounded-2xl outline-none focus:border-white transition-colors text-slate-900 dark:text-white text-lg ${styles.border}`} 
                  />
                  <button 
                    onClick={() => {
                      if(openEndedText.trim()) {
                        handleAnswer(true, openEndedText);
                        setOpenEndedText("");
                      }
                    }} 
                    className={`w-full py-4 bg-gradient-to-r ${styles.accentGradient} rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform text-slate-900 dark:text-white text-lg`}
                  >
                    Submit Answer
                  </button>
                </div>
              ) : (
                giftData.questions[stage-1].options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(opt.isCorrect, opt.text)} className={`w-full p-5 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl hover:bg-slate-200 dark:bg-white/10 hover:${styles.border} transition-all text-left font-medium flex items-center justify-between group`}>
                    <span className="text-lg opacity-90 group-hover:opacity-100">{opt.text}</span>
                    <div className={`w-6 h-6 rounded-full border border-slate-300 dark:border-white/20 group-hover:bg-slate-300 dark:bg-white/20 transition-colors`} />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeModal === "reward" && (
          <motion.div key="reward" initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{opacity:0, scale:0.9}} className={`w-full max-w-md ${styles.glass} p-6 md:p-10 rounded-[2rem] border ${styles.border} text-center shadow-2xl z-20`}>
            <Heart className={`w-20 h-20 ${styles.heart} mx-auto mb-6 animate-bounce`} />
            <p className="text-xl opacity-90 mb-10 leading-relaxed font-medium">"{giftData.questions[stage-1].reward}"</p>
            <button onClick={nextStage} className={`w-full py-4 bg-gradient-to-r ${styles.accentGradient} rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform text-slate-900 dark:text-white text-lg flex items-center justify-center gap-2`}>
              Next Step <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
        {activeModal === "wrong" && (
          <motion.div key="wrong" initial={{x:-20, opacity:0}} animate={{x:[0, -10, 10, -10, 10, 0], opacity:1}} className="w-full max-w-md bg-red-950/80 backdrop-blur-2xl p-8 rounded-[2rem] border border-red-500/50 text-center shadow-2xl z-20">
            <h2 className="text-3xl font-extrabold text-red-400 mb-2">Not quite!</h2>
            <p className="text-red-200/80">Think a little harder...</p>
          </motion.div>
        )}

        {/* STAGE 3: MEMORY CAROUSEL */}
        {stage === 3 && (
          <motion.div key="carousel" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.1}} transition={{duration:1.5}} className="w-full max-w-2xl text-center z-10 flex flex-col items-center">
            <h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light leading-relaxed mb-8`}>Memory Lane...</h1>
            
            {giftData.photoUrls && giftData.photoUrls.length > 0 ? (
              <div className={`relative w-72 h-96 md:w-96 md:h-[30rem] rounded-3xl overflow-hidden border-2 ${styles.border} shadow-[0_0_80px_rgba(255,255,255,0.1)] mb-10`}>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activePhoto}
                    initial={{opacity: 0, scale: 1.1}}
                    animate={{opacity: 1, scale: 1}}
                    exit={{opacity: 0, scale: 0.9}}
                    transition={{duration: 1.5}}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img src={giftData.photoUrls[activePhoto]} className="absolute inset-0 w-full h-full object-cover" />
                    {giftData.photoCaptions && giftData.photoCaptions[activePhoto] && (
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-8 px-6 text-center">
                        <p className="text-slate-900 dark:text-white text-base md:text-xl font-medium tracking-wide drop-shadow-md">
                          "{giftData.photoCaptions[activePhoto]}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 z-10">
                  {giftData.photoUrls.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === activePhoto ? 'bg-white scale-125' : 'bg-white/30'}`} />
                  ))}
                </div>
              </div>
            ) : (
              <div className={`w-72 h-96 rounded-3xl border-2 ${styles.border} flex items-center justify-center bg-slate-100 dark:bg-white/5 mb-10`}>
                <ImageIcon className="w-12 h-12 opacity-20" />
              </div>
            )}

            <button onClick={() => setStage(4)} className={`px-8 py-3 bg-gradient-to-r ${styles.accentGradient} rounded-full font-bold shadow-lg hover:scale-105 transition-transform text-slate-900 dark:text-white text-lg flex items-center gap-2`}>
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* STAGE 4: REASONS WHY (Floating Bubbles) */}
        {stage === 4 && (
          <motion.div key="reasons" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:1}} className="w-full h-full flex flex-col items-center justify-center z-10 min-h-[60vh]">
            <h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light mb-16 text-center`}>Why I love you...</h1>
            
            <div className="relative w-full max-w-md h-64 flex flex-col items-center justify-center">
              {giftData.reasons.map((reason, idx) => {
                const positions = [
                  { x: -80, y: -40, delay: 0 },
                  { x: 80, y: 20, delay: 0.3 },
                  { x: 0, y: -100, delay: 0.6 }
                ];
                
                return (
                  <motion.button
                    key={idx}
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                    animate={{ 
                      scale: poppedReasons[idx] ? 1.5 : [1, 1.1, 1],
                      opacity: poppedReasons[idx] ? 0 : 1,
                      x: poppedReasons[idx] ? positions[idx].x : [positions[idx].x, positions[idx].x + 30, positions[idx].x - 20, positions[idx].x], 
                      y: poppedReasons[idx] ? positions[idx].y : [positions[idx].y, positions[idx].y - 40, positions[idx].y + 30, positions[idx].y],
                      backgroundColor: poppedReasons[idx] ? "transparent" : ["rgba(255,255,255,0.05)", "rgba(236,72,153,0.2)", "rgba(56,189,248,0.2)", "rgba(255,255,255,0.05)"]
                    }}
                    transition={{
                      scale: { duration: poppedReasons[idx] ? 0.3 : 2, repeat: poppedReasons[idx] ? 0 : Infinity, ease: "easeInOut" },
                      opacity: { duration: 0.3 },
                      x: { duration: 5 + idx, repeat: poppedReasons[idx] ? 0 : Infinity, ease: "easeInOut" },
                      y: { duration: 6 + idx, repeat: poppedReasons[idx] ? 0 : Infinity, ease: "easeInOut" },
                      backgroundColor: { duration: 4, repeat: poppedReasons[idx] ? 0 : Infinity, ease: "linear" }
                    }}
                    onClick={() => popReason(idx)}
                    className={`absolute w-32 h-32 rounded-full backdrop-blur-xl border ${styles.border} flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:border-pink-400 transition-colors p-4 z-20`}
                  >
                    <span className="text-sm font-bold text-center line-clamp-3 tracking-wider uppercase text-slate-900 dark:text-white/80">Tap Me</span>
                  </motion.button>
                );
              })}
              
              {/* Display popped reasons text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
                {giftData.reasons.map((reason, idx) => (
                  <AnimatePresence key={`text-${idx}`}>
                    {poppedReasons[idx] && (
                      <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="text-xl md:text-2xl font-bold text-center bg-white dark:bg-black/50 px-6 py-2 rounded-full backdrop-blur-md">
                        {reason}
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {poppedReasons.every(Boolean) && (
                <motion.button initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} onClick={() => setStage(5)} className={`mt-16 px-8 py-3 bg-gradient-to-r ${styles.accentGradient} rounded-full font-bold shadow-lg hover:scale-105 transition-transform text-slate-900 dark:text-white text-lg flex items-center gap-2`}>
                  Read My Letter <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STAGE 5: FINAL LETTER */}
        {stage === 5 && (
          <motion.div key="letter" initial={{opacity:0, y:40}} animate={{opacity:1, y:0}} transition={{duration:1.5}} className={`w-full max-w-2xl bg-slate-100 dark:bg-black/60 backdrop-blur-2xl border ${styles.border} p-6 md:p-12 rounded-[3rem] shadow-2xl relative z-10 text-center mt-12 mb-12`}>
            
            {(!giftData?.songQuery || giftData.songQuery === "") && <audio autoPlay loop src="https://cdn.pixabay.com/download/audio/2022/05/16/audio_0cb9b119cb.mp3" />}
            {giftData?.songQuery?.includes("youtube.com") && <iframe width="0" height="0" src={`https://www.youtube.com/embed/${giftData.songQuery.split("v=")[1]?.split("&")[0]}?autoplay=1&loop=1&playlist=${giftData.songQuery.split("v=")[1]?.split("&")[0]}`} allow="autoplay" style={{display: "none"}}></iframe>}
            {giftData?.songQuery && !giftData.songQuery.includes("youtube.com") && <audio autoPlay loop src={giftData.songQuery} />}

            <div className="relative z-10 flex flex-col items-center">
              
              <Heart className={`w-16 h-16 ${styles.heart} mx-auto mb-8 animate-pulse`} />
              
              <h2 className={`text-2xl md:text-4xl ${styles.font} italic mb-10 text-transparent bg-clip-text bg-gradient-to-r ${styles.accentGradient}`}>
                My dearest {giftData.recipientName},
              </h2>
              
              <div className="text-base md:text-xl opacity-90 leading-loose whitespace-pre-wrap font-medium mb-12 text-left">
                {giftData.letter}
              </div>
              
              <div className={`pt-8 border-t ${styles.border} text-right w-full`}>
                <p className={`text-2xl ${styles.font} italic ${styles.accentText} whitespace-pre-wrap`}>
                  {giftData.signOff}
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
