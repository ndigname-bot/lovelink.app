"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Heart, UploadCloud, ChevronRight, ChevronLeft, Sparkles, Image as ImageIcon, Music, Lock, MessageSquare, Loader2, Link as LinkIcon, Plus, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { auth, db, storage } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

import { useRouter } from "next/navigation";

const PRESET_SONGS = [
  { title: "A Thousand Years - Christina Perri", url: "https://www.youtube.com/watch?v=rtOvBOTyX00" },
  { title: "Perfect - Ed Sheeran", url: "https://www.youtube.com/watch?v=2Vv-BfVoq4g" },
  { title: "All of Me - John Legend", url: "https://www.youtube.com/watch?v=450p7goxZqg" },
  { title: "No One Like You - P-Square", url: "https://www.youtube.com/watch?v=ty2advRiWJM" },
  { title: "African Queen - 2Baba", url: "https://www.youtube.com/watch?v=_TzXhN4-xGE" },
  { title: "Thinking Out Loud - Ed Sheeran", url: "https://www.youtube.com/watch?v=alZZqaXbUSM" },
  { title: "Best Part - H.E.R. ft. Daniel Caesar", url: "https://www.youtube.com/watch?v=vBGiFtb8xaw" },
  { title: "Just The Way You Are - Bruno Mars", url: "https://www.youtube.com/watch?v=LjhCEhWiKXk" },
  { title: "Can't Help Falling In Love - Elvis Presley", url: "https://www.youtube.com/watch?v=vGJTaP6anOU" },
  { title: "Running (To You) - Chike ft. Simi", url: "https://www.youtube.com/watch?v=9DpeQbECK14" },
  { title: "Make You Feel My Love - Adele", url: "https://www.youtube.com/watch?v=0put0_a--Ng" },
  { title: "I Will Always Love You - Whitney Houston", url: "https://www.youtube.com/watch?v=3JWTaaS7LdU" },
  { title: "My Heart Will Go On - Celine Dion", url: "https://www.youtube.com/watch?v=DNyKDI9pn0Q" },
  { title: "At Last - Etta James", url: "https://www.youtube.com/watch?v=1qJU8G7gR_g" },
  { title: "Romeo & Juliet - Johnny Drille", url: "https://www.youtube.com/watch?v=xxx" },
  { title: "Duduke - Simi", url: "https://www.youtube.com/watch?v=-L8hLkg21MQ" },
  { title: "I'm Yours - Jason Mraz", url: "https://www.youtube.com/watch?v=EkHTsc9PU2A" },
  { title: "Love Me Like You Do - Ellie Goulding", url: "https://www.youtube.com/watch?v=AJtDXIazrMo" },
  { title: "Beyond - Leon Bridges", url: "https://www.youtube.com/watch?v=OepXY20E_3g" },
  { title: "Tattoo - Fireboy DML", url: "https://www.youtube.com/watch?v=R2_0-R5E2Z0" }
];

import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedLink, setPublishedLink] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  const [formData, setFormData] = useState({
    theme: "blush",
    recipientName: "",
    creatorName: "",
    songQuery: "",
    q1: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    q2: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    q3: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    q4: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    reasons: ["", "", ""],
    letter: "",
    photoCaptions: []
  });

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [audioFile, setAudioFile] = useState(null);

  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  const updateQuestion = (q, key, value) => setFormData(prev => ({ ...prev, [q]: { ...prev[q], [key]: value } }));
  const updateReason = (index, value) => {
    const newReasons = [...formData.reasons];
    newReasons[index] = value;
    setFormData(prev => ({ ...prev, reasons: newReasons }));
  };
  const updateCaption = (index, value) => {
    const newCaptions = [...formData.photoCaptions];
    newCaptions[index] = value;
    setFormData(prev => ({ ...prev, photoCaptions: newCaptions }));
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 10) {
      alert("You can only upload up to 10 photos!");
      return;
    }
    
    setPhotos(prev => [...prev, ...files]);
    setFormData(prev => ({
      ...prev,
      photoCaptions: [...prev.photoCaptions, ...Array(files.length).fill("")]
    }));
    
    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setPhotoPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photoCaptions: prev.photoCaptions.filter((_, i) => i !== index)
    }));
  };

  const handlePreview = () => {
    localStorage.setItem("lovelink_draft", JSON.stringify({ ...formData,
        songQuery: finalSongUrl, photoUrls: photoPreviews }));
    window.open("/gift/draft", "_blank");
  };

  

  const handlePublish = async () => {
    if (!auth.currentUser) return router.push("/login");
    setIsPublishing(true);
    try {
      // Freemium Logic: First 2 links are free
      const q = query(collection(db, "gifts"), where("creatorId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const isFreePromo = true; // Temporarily free for all testing

      let photoUrls = [];

      // Upload Multiple Photos to Cloudinary
      if (photos.length > 0) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        
        if (!cloudName || !uploadPreset) {
          throw new Error("Cloudinary environment variables are missing. Please configure them in Vercel.");
        }

        const uploadPromises = photos.map(async (photo) => {
          const formData = new FormData();
          formData.append("file", photo);
          formData.append("upload_preset", uploadPreset);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error("Failed to upload image to Cloudinary");
          }

          const data = await res.json();
          return data.secure_url;
        });
        photoUrls = await Promise.all(uploadPromises);
      }

      let finalSongUrl = formData.songQuery;
      if (formData.songQuery === "upload" && audioFile) {
        const audioRef = ref(storage, `gifts/${auth.currentUser.uid}/audio_${Date.now()}_${audioFile.name}`);
        const snapshot = await uploadBytes(audioRef, audioFile);
        finalSongUrl = await getDownloadURL(snapshot.ref);
      } else if (formData.songQuery === "upload") {
        finalSongUrl = "";
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, "gifts"), {
        ...formData,
        photoUrls, 
        creatorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        paid: isFreePromo 
      });

      if (isFreePromo) {
        window.location.href = `/success?giftId=${docRef.id}`;
        return;
      }

      // Request Stripe Checkout Session
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: docRef.id, recipientName: formData.recipientName, email: auth.currentUser?.email })
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start checkout: " + data.error);
        setIsPublishing(false);
      }
    } catch (e) {
      console.error("Error publishing:", e);
      alert("Failed to save gift: " + e.message);
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans selection:bg-pink-500/30 pb-32">
      <nav className="w-full border-b border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-6 text-pink-500" />
              <span className="font-bold text-xl tracking-tight hidden sm:block">LoveLink Builder</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm text-slate-500 dark:text-gray-400 font-medium tracking-wide">Step {step} of 3</div>
            <a href="/my-gifts" className="text-sm font-semibold text-slate-900 dark:text-white/70 hover:text-slate-900 dark:text-white transition-colors">My Gifts</a>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-10">
              <div>
                <h1 className="text-3xl font-bold mb-2">Let's set the mood.</h1>
                <p className="text-slate-500 dark:text-gray-400">Choose a theme and tell us who this is for.</p>
              </div>
              <div className="flex flex-row items-center justify-start gap-8 pt-2">
                {[
                  { id: 'blush', name: 'Blush', gradient: 'from-pink-400 to-rose-500', shadow: 'rgba(236,72,153,0.6)' },
                  { id: 'midnight', name: 'Midnight', gradient: 'from-indigo-900 to-purple-900', shadow: 'rgba(79,70,229,0.6)' },
                  { id: 'ocean', name: 'Ocean', gradient: 'from-cyan-400 to-blue-600', shadow: 'rgba(6,182,212,0.6)' }
                ].map((t) => (
                  <div key={t.id} className="flex flex-col items-center gap-3">
                    <button 
                      onClick={() => updateForm('theme', t.id)} 
                      className={`relative w-14 h-14 rounded-full transition-all duration-300 bg-gradient-to-br ${t.gradient} ${formData.theme === t.id ? 'ring-4 ring-offset-4 ring-offset-slate-50 dark:ring-offset-[#0a0a0a] ring-pink-500 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                      style={{ boxShadow: formData.theme === t.id ? `0 0 30px ${t.shadow}` : 'none' }}
                    />
                    <span className={`text-xs font-medium capitalize ${formData.theme === t.id ? 'text-pink-500 font-bold' : 'text-slate-500'}`}>{t.name}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-600 dark:text-gray-300">Who is this for?</label>
                  <input type="text" value={formData.recipientName} onChange={(e) => updateForm('recipientName', e.target.value)} placeholder="e.g. Sarah" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-600 dark:text-gray-300">Your Name / Nickname</label>
                  <input type="text" value={formData.creatorName} onChange={(e) => updateForm('creatorName', e.target.value)} placeholder="e.g. John" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-10">
              <div>
                <h1 className="text-3xl font-bold mb-2">Music & Memories</h1>
                <p className="text-slate-500 dark:text-gray-400">Add their favorite song and inside jokes.</p>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2"><Music className="w-4 h-4 text-pink-400" /> Background Song</label>
                <div className="relative">
                <select 
                  value={PRESET_SONGS.find(s => s.url === formData.songQuery) ? formData.songQuery : (formData.songQuery ? "custom" : "")} 
                  onChange={(e) => updateForm('songQuery', e.target.value === "custom" ? "https://www.youtube.com/watch?v=" : e.target.value)}
                  className="appearance-none w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none mb-3 transition-colors cursor-pointer shadow-sm"
                >
                  <option value="">Select a romantic song...</option>
                  {PRESET_SONGS.map((song, idx) => (
                    <option key={idx} value={song.url}>{song.title}</option>
                  ))}
                  <option value="custom">👉 Paste my own YouTube Link...</option>
                  <option value="upload">👉 Upload MP3 from my device...</option>
                </select>
                <ChevronDown className="absolute right-4 top-[22px] -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
                
                {(!PRESET_SONGS.find(s => s.url === formData.songQuery) && formData.songQuery !== "" && formData.songQuery !== "upload") && (
                  <input type="text" value={formData.songQuery} onChange={(e) => updateForm('songQuery', e.target.value)} placeholder="Paste custom YouTube link here..." className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none animate-in fade-in slide-in-from-top-2" />
                )}
                {formData.songQuery === "upload" && (
                  <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-slate-600 dark:text-gray-300 focus:border-pink-500 outline-none animate-in fade-in slide-in-from-top-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                )}
              </div>
              {['q1', 'q2', 'q3', 'q4'].map((qId, index) => (
              <div key={qId} className="p-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl space-y-6 relative group">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Lock className="w-5 h-5 text-pink-500" /> Trivia Question {index + 1}</h3>
                  <div className="relative">
                    <select 
                      value={formData[qId].type || "multiple_choice"} 
                      onChange={(e) => updateQuestion(qId, 'type', e.target.value)}
                      className="appearance-none bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl pl-3 pr-8 py-1.5 text-sm text-slate-600 dark:text-gray-300 outline-none focus:border-pink-500 cursor-pointer shadow-sm"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="open_ended">Open Ended (Text)</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-4">
                  <input type="text" value={formData[qId].question} onChange={(e) => updateQuestion(qId, 'question', e.target.value)} placeholder={`e.g. ${index === 0 ? "What is my favorite thing about you?" : index === 1 ? "Where was our first date?" : "What is my biggest pet peeve?"}`} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none transition-colors" />
                  
                  {formData[qId].type === "open_ended" ? (
                    <div className="bg-slate-100 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 rounded-xl p-4 text-center">
                      <p className="text-sm text-slate-500 dark:text-gray-400">The recipient will type their own answer in a text box.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input type="text" value={formData[qId].correct} onChange={(e) => updateQuestion(qId, 'correct', e.target.value)} placeholder="Correct ✅" className="w-full bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-green-500 outline-none transition-colors" />
                      <input type="text" value={formData[qId].wrong1} onChange={(e) => updateQuestion(qId, 'wrong1', e.target.value)} placeholder="Wrong ❌" className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none transition-colors" />
                      <input type="text" value={formData[qId].wrong2} onChange={(e) => updateQuestion(qId, 'wrong2', e.target.value)} placeholder="Wrong ❌" className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none transition-colors" />
                    </div>
                  )}
                </div>
              </div>
            ))}
  );
}
