"use client";
import { useState, useEffect, use, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Music, Lock, Unlock, ArrowRight, Image as ImageIcon, Clock, Hourglass } from "lucide-react";
import confetti from "canvas-confetti";
import { db, storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const PRESET_SONGS = [
  { title: "Daniel Caesar - Get You", url: "https://www.youtube.com/watch?v=uQFVqltOXRg" },
  { title: "Bazzi - Beautiful", url: "https://www.youtube.com/watch?v=Uk1hqVGREy0" },
  { title: "Ed Sheeran - Perfect", url: "https://www.youtube.com/watch?v=2Vv-BfVoq4g" },
  { title: "John Legend - All of Me", url: "https://www.youtube.com/watch?v=450p7goxZqg" },
  { title: "Bruno Mars - Just The Way You Are", url: "https://www.youtube.com/watch?v=LjhCEhWiKXk" },
  { title: "Christina Perri - A Thousand Years", url: "https://www.youtube.com/watch?v=rtOvBOTyX00" },
  { title: "Celine Dion - My Heart Will Go On", url: "https://www.youtube.com/watch?v=pWtCBSmWn2A" },
];

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
  const INTROS = [
    "You have a highly classified digital package from",
    "Someone has been thinking about you a lot... Sender:",
    "Warning: The following message might cause uncontrollable smiling. Sender:",
    "Top Secret clearance required. Authorized by:"
  ];

  const CHEEKY_REWARDS = [
    "Damn right you know it 😉",
    "Okay, I see you... 😏",
    "Lucky guess... or maybe you just love me too much 🙄❤️",
    "You passed the test... this time. 💅",
    "I knew you were obsessed with me. 😂❤️",
    "Look at you, paying attention and stuff! 👏"
  ];

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

  // Reaction Booth State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [reactionText, setReactionText] = useState("");
  const [isSubmittingReaction, setIsSubmittingReaction] = useState(false);

  
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
        const audioRef = ref(storage, `reactions/${giftId}/${Date.now()}_voicenote.webm`);
        const snapshot = await uploadBytes(audioRef, blob);
        finalContent = await getDownloadURL(snapshot.ref);
      }
      
      // Update Firestore
      const giftRef = doc(db, "gifts", giftId);
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
              skipTrivia: draftData.skipTrivia || false,
              theme: draftData.theme || "blush",
              occasion: draftData.occasion || "standard",
              recipientName: draftData.recipientName || "Cutie",
              creatorName: draftData.creatorName || "Me",
              songQuery: draftData.songQuery || "Daniel Caesar - Get You",
              photoUrls: draftData.photoUrls || [], 
              photoCaptions: draftData.photoCaptions || [],
              reasons: draftData.reasons || ["Your smile", "Your laugh", "Your kindness"],
              questions: [
                ...(draftData.q1?.question ? [{ question: draftData.q1.question, type: draftData.q1.type, options: [{text:draftData.q1.correct, isCorrect:true}, {text:draftData.q1.wrong1, isCorrect:false}, {text:draftData.q1.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : []),
                ...(draftData.q2?.question ? [{ question: draftData.q2.question, type: draftData.q2.type, options: [{text:draftData.q2.correct, isCorrect:true}, {text:draftData.q2.wrong1, isCorrect:false}, {text:draftData.q2.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : []),
                ...(draftData.q3?.question ? [{ question: draftData.q3.question, type: draftData.q3.type, options: [{text:draftData.q3.correct, isCorrect:true}, {text:draftData.q3.wrong1, isCorrect:false}, {text:draftData.q3.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : []),
                ...(draftData.q4?.question ? [{ question: draftData.q4.question, type: draftData.q4.type, options: [{text:draftData.q4.correct, isCorrect:true}, {text:draftData.q4.wrong1, isCorrect:false}, {text:draftData.q4.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : [])
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
            skipTrivia: dbData.skipTrivia || false,
            theme: dbData.theme || "blush",
            occasion: dbData.occasion || "standard",
            recipientName: dbData.recipientName || "Cutie",
            creatorName: dbData.creatorName || "Me",
            songQuery: dbData.songQuery || "Daniel Caesar - Get You",
            photoUrls: dbData.photoUrls || (dbData.photoUrl ? [dbData.photoUrl] : []),
            photoCaptions: dbData.photoCaptions || [],
            reasons: dbData.reasons || ["Your beautiful smile", "How you care for me", "Your incredible patience"],
            questions: [
              ...(dbData.q1?.question ? [{ question: dbData.q1.question, type: dbData.q1.type, options: [{text:dbData.q1.correct, isCorrect:true}, {text:dbData.q1.wrong1, isCorrect:false}, {text:dbData.q1.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : []),
              ...(dbData.q2?.question ? [{ question: dbData.q2.question, type: dbData.q2.type, options: [{text:dbData.q2.correct, isCorrect:true}, {text:dbData.q2.wrong1, isCorrect:false}, {text:dbData.q2.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : []),
              ...(dbData.q3?.question ? [{ question: dbData.q3.question, type: dbData.q3.type, options: [{text:dbData.q3.correct, isCorrect:true}, {text:dbData.q3.wrong1, isCorrect:false}, {text:dbData.q3.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : []),
              ...(dbData.q4?.question ? [{ question: dbData.q4.question, type: dbData.q4.type, options: [{text:dbData.q4.correct, isCorrect:true}, {text:dbData.q4.wrong1, isCorrect:false}, {text:dbData.q4.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : [])
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
        theme: "blush", occasion: "standard", recipientName: "Yuri", creatorName: "Emmanuel", songQuery: "Beautiful - Bazzi", 
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

  // Handle TikTok Scroll Carousel Sequence
  const [isSpinningOut, setIsSpinningOut] = useState(false);
  
  useEffect(() => {
    const qLen = giftData?.questions?.length || 2;
    if (stage === qLen + 1 && giftData?.photoUrls?.length > 0) {
      let currentPhoto = 0;
      
      const runSequence = () => {
        if (currentPhoto < giftData.photoUrls.length - 1) {
          currentPhoto++;
          setActivePhoto(currentPhoto);
          setTimeout(runSequence, 3000); // Pause for 3s on each photo
        } else {
          // Trigger the crazy spin out after the last photo
          setTimeout(() => {
            setIsSpinningOut(true);
            
            // Wait for crazy spin to finish, then go to next stage
            setTimeout(() => {
              setIsSpinningOut(false);
              setStage(prev => prev + 1);
            }, 1500);
          }, 3000);
        }
      };
      
      const timer = setTimeout(runSequence, 3000);
      return () => clearTimeout(timer);
    }
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
    const nextStage = giftData?.skipTrivia ? (giftData?.questions ? giftData.questions.length : 0) + 1 : 1;
    setTimeout(() => setStage(nextStage), 800);
  };

  // Time Capsule Sequence Logic
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (stage === 'tc_1') {
      let t = 0;
      const interval = setInterval(() => {
        t++;
        setTick(t);
        if (t === 2) {
          clearInterval(interval);
          setTimeout(() => setStage('tc_2'), 1500);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else if (stage === 'tc_2') {
      setTimeout(() => setStage('tc_3'), 5000);
    } else if (stage === 'tc_3') {
      let t = 0;
      setTick(0);
      const interval = setInterval(() => {
        t++;
        setTick(t);
        if (t === 3) {
          clearInterval(interval);
          setTimeout(() => setStage((giftData?.questions ? giftData.questions.length : 0) + 1), 1500);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stage, giftData]);

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
      {((giftData?.occasion === "family" ? (typeof stage === "number" && stage >= (giftData?.questions ? giftData.questions.length : 0) + 1) : (typeof stage === "number" && stage >= -1))) && (
        <>
          {(!giftData?.songQuery || giftData.songQuery === "") && <audio autoPlay loop src="https://cdn.pixabay.com/download/audio/2022/05/16/audio_0cb9b119cb.mp3" />}
          {giftData?.songQuery?.includes("youtube") && <iframe width="0" height="0" src={`https://www.youtube.com/embed/${giftData.songQuery.includes("v=") ? giftData.songQuery.split("v=")[1]?.split("&")[0] : giftData.songQuery.split("youtu.be/")[1]?.split("?")[0]}?autoplay=1&loop=1&playlist=${giftData.songQuery.includes("v=") ? giftData.songQuery.split("v=")[1]?.split("&")[0] : giftData.songQuery.split("youtu.be/")[1]?.split("?")[0]}`} allow="autoplay" style={{display: "none"}}></iframe>}
          {giftData?.songQuery && !giftData.songQuery.includes("youtube") && <audio autoPlay loop src={giftData.songQuery} />}
        </>
      )}

      
      {((giftData?.occasion === "family" ? (typeof stage === "number" && stage >= (giftData?.questions ? giftData.questions.length : 0) + 1) : (typeof stage === "number" && stage >= -1))) && (
        <motion.div initial={{y:-50, opacity:0}} animate={{y:0, opacity:1}} className={`absolute top-6 left-1/2 -translate-x-1/2 ${styles.glass} ${styles.border} px-4 py-2 rounded-full border flex items-center gap-2 z-50`}>
          <Music className={`w-3 h-3 ${styles.accentText} animate-pulse`} />
          <span className="text-xs font-medium tracking-wide">Playing: {PRESET_SONGS.find(s => s.url === giftData.songQuery)?.title || (giftData.songQuery.startsWith("http") ? "Our Special Song 🎵" : giftData.songQuery)}</span>
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
              {INTROS[(giftId?.length || 0) % INTROS.length]} <span className={`${styles.accentText} font-semibold`}>{giftData.creatorName}</span>.
            </h1>
            <p className="text-lg opacity-80 mb-8 font-medium">But before you can open it, you must prove your identity.</p>
            <p className={`text-sm opacity-40 tracking-widest uppercase animate-pulse ${styles.font}`}>Tap anywhere to continue</p>
          </motion.div>
        )}

        {stage === 0 && giftData?.occasion !== 'family' && (
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

        

        {stage === 0 && giftData?.occasion === 'family' && (
          <motion.div key="tc_start" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.1}} transition={{duration:1}} className="text-center z-10 flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full ${styles.glass} ${styles.border} border flex items-center justify-center mb-10 shadow-2xl relative`}>
              <Clock className={`w-10 h-10 ${styles.accentText} animate-pulse`} />
            </div>
            <motion.button onClick={() => setStage('tc_1')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white text-black px-10 py-4 rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Open Time Capsule
            </motion.button>
          </motion.div>
        )}

        {stage === 'tc_1' && (
          <motion.div key="tc_1" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center z-10 flex flex-col items-center justify-center h-full">
            <motion.div 
              animate={{ rotate: tick * 30, scale: [1, 1.2, 1] }} 
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className={`w-40 h-40 rounded-full ${styles.glass} border ${styles.border} flex items-center justify-center shadow-[0_0_100px_rgba(255,255,255,0.1)]`}
            >
              <Clock className={`w-20 h-20 ${styles.accentText}`} />
            </motion.div>
          </motion.div>
        )}

        {stage === 'tc_2' && (
          <motion.div key="tc_2" initial={{opacity:0, filter:"blur(10px)"}} animate={{opacity:1, filter:"blur(0px)"}} exit={{opacity:0, filter:"blur(10px)"}} transition={{duration:2}} className="text-center z-10 max-w-xl px-6">
            <p className={`text-2xl md:text-3xl font-light leading-relaxed tracking-wide opacity-90 italic ${styles.font}`}>
              Time is the most precious gift we have. This is a journey back through the moments that built us... prepare to go back.
            </p>
          </motion.div>
        )}

        {stage === 'tc_3' && (
          <motion.div key="tc_3" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration: 1}} className="text-center z-10 flex flex-col items-center justify-center h-full">
            <motion.div 
              animate={{ rotate: tick * -45, scale: [1, 1.3, 1] }} 
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className={`w-48 h-48 rounded-full border-4 ${styles.border} flex items-center justify-center shadow-[0_0_150px_rgba(255,255,255,0.2)]`}
            >
              <Hourglass className={`w-24 h-24 ${styles.accentText}`} />
            </motion.div>
          </motion.div>
        )}

        {/* TRIVIA STAGES */}
        {stage >= 1 && stage <= (giftData?.questions ? giftData.questions.length : 0) && !activeModal && (
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
              <button onClick={() => nextStage()} className="mt-8 text-sm text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors underline underline-offset-4 decoration-slate-300 dark:decoration-gray-600">
                Skip this question
              </button>
            </motion.div>
        )}

        {activeModal === "reward" && (
          <motion.div key="reward" initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} exit={{opacity:0, scale:0.9}} className={`w-full max-w-md ${styles.glass} p-6 md:p-10 rounded-[2rem] border ${styles.border} text-center shadow-2xl z-20`}>
            <Heart className={`w-20 h-20 ${styles.heart} mx-auto mb-6 animate-bounce`} />
            <p className="text-xl opacity-90 mb-10 leading-relaxed font-medium">"{giftData.questions[stage-1].reward || CHEEKY_REWARDS[(stage + (giftId?.length || 0)) % CHEEKY_REWARDS.length]}"</p>
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
        {stage === (giftData?.questions ? giftData.questions.length : 0) + 1 && (
          <motion.div key="carousel" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full max-w-2xl text-center z-10 flex flex-col items-center overflow-hidden">
            
            <AnimatePresence mode="wait">
              {!isSpinningOut ? (
                <motion.div key="normal-photos" exit={{ opacity: 0, scale: 0.5 }} className="w-full flex flex-col items-center">
                  <h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light leading-relaxed mb-8`}>Memory Lane...</h1>
                  
                  {giftData.photoUrls && giftData.photoUrls.length > 0 && (
                    <div className={`relative w-72 h-96 md:w-96 md:h-[30rem] rounded-[2rem] overflow-hidden border-4 ${styles.border} shadow-[0_0_80px_rgba(255,255,255,0.1)] mb-10`}>
                      <AnimatePresence initial={false}>
                        <motion.div 
                          key={activePhoto}
                          initial={{ y: "100%", opacity: 0.5 }}
                          animate={{ y: "0%", opacity: 1 }}
                          exit={{ y: "-100%", opacity: 0.5 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="absolute inset-0 w-full h-full bg-black"
                        >
                          <img src={giftData.photoUrls[activePhoto]} className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none" />
                          
                          {giftData.photoCaptions && giftData.photoCaptions[activePhoto] && (
                            <motion.div 
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                              className="absolute bottom-0 left-0 w-full p-8 text-center"
                            >
                              <p className="text-white text-lg md:text-2xl font-semibold tracking-wide drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] leading-snug">
                                "{giftData.photoCaptions[activePhoto]}"
                              </p>
                            </motion.div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                  
                  <motion.button onClick={() => setStage(prev => prev + 1)} className={`px-8 py-4 bg-gradient-to-r ${styles.accentGradient} rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform text-slate-900 dark:text-white text-lg flex items-center justify-center gap-2 opacity-50 hover:opacity-100`}>
                    Skip <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  key="crazy-spin"
                  initial={{ opacity: 0, scale: 0.5, rotateX: 0 }}
                  animate={{ opacity: 1, scale: [1, 1.2, 0], rotateX: [0, -720, -1440, -3600], filter: ["blur(0px)", "blur(10px)", "blur(30px)"] }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className={`relative w-72 h-96 md:w-96 md:h-[30rem] rounded-[2rem] overflow-hidden border-4 ${styles.border} shadow-[0_0_150px_rgba(255,255,255,0.4)] flex items-center justify-center bg-black`}
                >
                  {giftData.photoUrls && giftData.photoUrls.length > 0 && (
                    <img src={giftData.photoUrls[giftData.photoUrls.length - 1]} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  )}
                  <Heart className="w-32 h-32 text-pink-500 animate-pulse relative z-10" />
                </motion.div>
              )}
            </AnimatePresence>
            
          </motion.div>
        )}

        {/* STAGE 4: REASONS WHY (Floating Bubbles) */}
        {stage === (giftData?.questions ? giftData.questions.length : 0) + 2 && (
          <motion.div key="reasons" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:1}} className="w-full h-full flex flex-col items-center justify-center z-10 min-h-[60vh]">
            <h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light mb-16 text-center`}>{giftData?.occasion === "proposal" ? "My Promises to You..." : giftData?.occasion === "birthday" ? "My Birthday Wishes..." : giftData?.occasion === "family" ? "Things I Appreciate About You..." : "Why I love you..."}</h1>
            
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
                <motion.button initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} onClick={() => setStage(prev => prev + 1)} className={`mt-16 px-8 py-3 bg-gradient-to-r ${styles.accentGradient} rounded-full font-bold shadow-lg hover:scale-105 transition-transform text-slate-900 dark:text-white text-lg flex items-center gap-2`}>
                  Read My Letter <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STAGE 5: FINAL LETTER */}
        {stage === (giftData?.questions ? giftData.questions.length : 0) + 3 && (
          <motion.div key="letter" initial={{opacity:0, y:40}} animate={{opacity:1, y:0}} transition={{duration:1.5}} className={`w-full max-w-2xl bg-slate-100 dark:bg-black/60 backdrop-blur-2xl border ${styles.border} p-6 md:p-12 rounded-[3rem] shadow-2xl relative z-10 text-center mt-12 mb-12`}>
            
            

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
              <div className="mt-12 w-full flex justify-center">
                <button onClick={() => setStage(prev => prev + 1)} className={`px-8 py-4 bg-gradient-to-r ${styles.accentGradient} rounded-full font-bold shadow-lg hover:scale-105 transition-transform text-slate-900 dark:text-white text-lg flex items-center justify-center gap-2`}>
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STAGE: PROPOSAL (ONLY IF OCCASION === PROPOSAL) */}
        {stage === (giftData?.questions ? giftData.questions.length : 0) + 4 && giftData?.occasion === 'proposal' && (
          <motion.div key="proposal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:2}} className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{opacity:0, scale:0.9, y: 50}} animate={{opacity:1, scale:1, y: 0}} transition={{delay: 1, duration:2}} className="flex flex-col items-center w-full max-w-2xl">
              <h1 className={`text-4xl md:text-7xl font-serif italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] font-light leading-relaxed mb-12`}>Will you marry me? 💍</h1>
              <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
                <button 
                  onClick={() => {
                    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FF69B4', '#FFFFFF'] });
                    confetti({ particleCount: 100, spread: 120, origin: { y: 0.3 }, colors: ['#FFD700', '#FFA500', '#FF69B4', '#FFFFFF'] });
                    setStage(prev => prev + 1);
                  }} 
                  className="w-full py-5 bg-white text-black rounded-full font-bold text-2xl shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:scale-110 transition-transform"
                >
                  YES! ❤️
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* STAGE: REACTION BOOTH */}
        {stage === (giftData?.questions ? giftData.questions.length : 0) + (giftData?.occasion === 'proposal' ? 5 : 4) && (
          <motion.div key="reaction" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className={`w-full max-w-xl ${styles.glass} p-8 md:p-12 rounded-[3rem] border ${styles.border} text-center shadow-2xl relative z-10`}>
            <h2 className={`text-3xl md:text-5xl ${styles.font} italic mb-6`}>Leave a Reaction</h2>
            <p className="text-lg opacity-80 mb-10">
              Record a voice note or write a message to let {giftData.creatorName} know you received this!
            </p>
            
            <div className="flex flex-col gap-6">
              {!isRecording && audioChunks.length === 0 && (
                <button onClick={startRecording} className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
                  🎤 Record Voice Note
                </button>
              )}
              
              {isRecording && (
                <div className="w-full py-4 bg-red-500/20 text-red-500 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 animate-pulse border border-red-500/50">
                  <span>Recording... {recordingTime}s</span>
                  <button onClick={stopRecording} className="px-4 py-2 bg-red-500 text-white rounded-full text-sm mt-2">Stop</button>
                </div>
              )}
              
              {audioChunks.length > 0 && !isRecording && (
                <div className="w-full py-4 bg-green-500/20 text-green-500 rounded-2xl font-bold flex flex-col items-center border border-green-500/50">
                  <span>Voice Note Ready! 🎵</span>
                  <button onClick={() => submitReaction('voice', new Blob(audioChunks, { type: 'audio/webm' }))} disabled={isSubmittingReaction} className="mt-4 px-6 py-2 bg-green-500 text-white rounded-full disabled:opacity-50">
                    {isSubmittingReaction ? "Sending..." : "Send Voice Note"}
                  </button>
                </div>
              )}

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-black text-white/50">OR</span></div>
              </div>
              
              <textarea 
                value={reactionText} 
                onChange={e => setReactionText(e.target.value)} 
                placeholder="Type a message instead..." 
                className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white outline-none focus:border-pink-500 resize-none h-32"
              />
              <button onClick={() => submitReaction('text')} disabled={!reactionText || isSubmittingReaction} className="w-full py-4 bg-white text-black rounded-2xl font-bold disabled:opacity-50">
                {isSubmittingReaction ? "Sending..." : "Send Message"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
