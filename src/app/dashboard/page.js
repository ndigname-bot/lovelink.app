"use client";
import imageCompression from "browser-image-compression";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Heart, UploadCloud, ChevronRight, ChevronLeft, Sparkles, Image as ImageIcon, Music, Lock, MessageSquare, Loader2, Link as LinkIcon, Plus, X, Play, Pause, Check } from "lucide-react";
import { Logo } from "@/components/Logo";
import { auth, db, storage } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

import { useRouter, useSearchParams } from "next/navigation";
import { PhotoUploader } from "../../components/PhotoUploader";
import { TriviaBuilder } from "../../components/TriviaBuilder";
import { MusicSelector } from "../../components/MusicSelector";

import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const editGiftId = searchParams?.get("edit");
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewSong, setPreviewSong] = useState(null);
  const [publishStatus, setPublishStatus] = useState("");
  const [publishedLink, setPublishedLink] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && editGiftId) {
        const fetchGift = async () => {
          setIsEditing(true);
          try {
            const docRef = doc(db, "gifts", editGiftId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().creatorId === user.uid) {
              const data = docSnap.data();
              const loadedData = {
                theme: data.theme || "blush",
                occasion: data.occasion || "standard",
                recipientName: data.recipientName || "",
                creatorName: data.creatorName || "",
                songQuery: data.songQuery || "",
                photoCaptions: data.photoCaptions || [],
                reasons: data.reasons || ["", "", ""],
                q1: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "", ...data.q1 },
                q2: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "", ...data.q2 },
                q3: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "", ...data.q3 },
                skipTrivia: data.skipTrivia || false,
                q4: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "", ...data.q4 },
                letter: data.letter || "",
              };
              setFormData(loadedData);
              if (data.photoUrls) setPhotoPreviews(data.photoUrls);
              
              // Automatically jump to Step 2 if editing
              setStep(2);
            }
          } catch(e) { console.error(e); }
          setIsEditing(false);
        };
        fetchGift();
      }
    });
    return () => unsubscribe();
  }, [editGiftId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  const [formData, setFormData] = useState({
    occasion: "standard",
    theme: "blush",
    recipientName: "",
    creatorName: "",
    songQuery: "",
    q1: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    q2: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    q3: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    skipTrivia: false,
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
    setPublishStatus("Starting...");
    
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timed out. If you added large photos, try connecting to a faster network.")), 180000));
      
      const publishTask = async () => {
        const isFreePromo = true; 

        let photoUrls = [];

                if (photos.length > 0) {
          setPublishStatus("Compressing " + photos.length + " photos...");
          const uploadPromises = photos.map(async (photo) => {
            try {
              const options = {
                maxSizeMB: 0.8,
                maxWidthOrHeight: 1920,
                useWebWorker: false
              };
              const compressedFile = await imageCompression(photo, options);
              const photoRef = ref(storage, `gifts/${auth.currentUser.uid}/photos/${Date.now()}_${compressedFile.name}`);
              const snapshot = await uploadBytes(photoRef, compressedFile);
              return await getDownloadURL(snapshot.ref);
            } catch (error) {
              console.error("Compression error:", error);
              const photoRef = ref(storage, `gifts/${auth.currentUser.uid}/photos/${Date.now()}_${photo.name}`);
              const snapshot = await uploadBytes(photoRef, photo);
              return await getDownloadURL(snapshot.ref);
            }
          });
          photoUrls = await Promise.all(uploadPromises);
        }

        let finalSongUrl = formData.songQuery;
        if (formData.songQuery === "upload" && audioFile) {
          setPublishStatus("Uploading audio...");
          const audioRef = ref(storage, `gifts/${auth.currentUser.uid}/audio_${Date.now()}_${audioFile.name}`);
          const snapshot = await uploadBytes(audioRef, audioFile);
          finalSongUrl = await getDownloadURL(snapshot.ref);
        } else if (formData.songQuery === "upload") {
          finalSongUrl = "";
        }

        setPublishStatus("Saving to database...");
        let finalGiftId = editGiftId;
        
        if (editGiftId) {
          const docRef = doc(db, "gifts", editGiftId);
          await updateDoc(docRef, {
            ...formData,
            ...(photoUrls.length > 0 && { photoUrls }), 
            updatedAt: serverTimestamp(),
          });
          setPublishStatus("Done!");
          router.push('/my-gifts');
          return;
        } else {
          const docRef = await addDoc(collection(db, "gifts"), {
            ...formData,
            photoUrls, 
            creatorId: auth.currentUser.uid,
            creatorEmail: auth.currentUser.email || "",
            createdAt: serverTimestamp(),
            paid: isFreePromo 
          });
          finalGiftId = docRef.id;
          
          if (isFreePromo) {
            setPublishStatus("Redirecting...");
            router.push(`/success?giftId=${finalGiftId}`);
            return;
          }
        }

        setPublishStatus("Initializing Payment...");
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId: finalGiftId, recipientName: formData.recipientName, email: auth.currentUser?.email })
        });
        const data = await res.json();
        if (data.url) router.push(data.url);
        else throw new Error(data.error);
      };

      await Promise.race([publishTask(), timeoutPromise]);
    } catch (e) {
      console.error("Error publishing:", e);
      alert("Failed to save gift: " + e.message);
      setIsPublishing(false);
      setPublishStatus("");
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

              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/10">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-300">What is the occasion?</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { id: 'standard', name: 'Just Because', emoji: '💌' },
                    { id: 'birthday', name: 'Birthday', emoji: '🎂' },
                    { id: 'anniversary', name: 'Anniversary', emoji: '🥂' },
                    { id: 'proposal', name: 'Proposal', emoji: '💍' },
                    { id: 'family', name: 'Family (Time Capsule)', emoji: '🕰️' }
                  ].map(occ => (
                    <button 
                      key={occ.id} 
                      onClick={() => { updateForm('occasion', occ.id); if (occ.id === 'family' || occ.id === 'birthday') { updateForm('skipTrivia', true); } else { updateForm('skipTrivia', false); } }} disabled={isEditing}
                      className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.occasion === occ.id ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400 shadow-md' : 'border-slate-200 dark:border-white/10 hover:border-pink-500/50 bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300'} ${isEditing && formData.occasion !== occ.id ? 'opacity-30 cursor-not-allowed hidden md:flex' : ''}`}
                    >
                      <span className="text-2xl">{occ.emoji}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-center">{occ.name}</span>
                      {occ.id === "family" && <span className="absolute -top-3 bg-pink-500 text-white text-[9px] px-2 py-1 rounded-full animate-bounce shadow-lg shadow-pink-500/50">Recommended</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-600 dark:text-gray-300">Who is this for?</label>
                  <input type="text" value={formData.recipientName} onChange={(e) => updateForm('recipientName', e.target.value)} disabled={isEditing} placeholder="e.g. Sarah" className={`w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none ${isEditing ? "opacity-60 cursor-not-allowed" : ""}`} />
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
              <MusicSelector 
                formData={formData} 
                updateForm={updateForm} 
                previewSong={previewSong} 
                setPreviewSong={setPreviewSong} 
                setAudioFile={setAudioFile} 
              />
              <TriviaBuilder 
                formData={formData} 
                updateForm={updateForm} 
                updateQuestion={updateQuestion} 
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-10">
              <div>
                <h1 className="text-3xl font-bold mb-2">The Deep Journey.</h1>
                <p className="text-slate-500 dark:text-gray-400">Photos, reasons why you love them, and the final letter.</p>
              </div>

              {/* Memory Carousel Photos */}
              <PhotoUploader 
                formData={formData} 
                updateCaption={updateCaption} 
                photoPreviews={photoPreviews} 
                handlePhotoSelect={handlePhotoSelect} 
                removePhoto={removePhoto} 
              />

              {/* Reasons Why */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400" /> {formData.occasion === "proposal" ? "3 Promises For Our Future" : formData.occasion === "birthday" ? "3 Birthday Wishes" : formData.occasion === "family" ? "3 Things I Appreciate About You" : "3 Reasons I Love You"}</label>
                <div className="space-y-3">
                  {[0, 1, 2].map(i => (
                    <input key={i} type="text" value={formData.reasons[i]} onChange={(e) => updateReason(i, e.target.value)} placeholder={`${formData.occasion === "proposal" ? "Promise" : formData.occasion === "birthday" ? "Wish" : formData.occasion === "family" ? "Appreciation" : "Reason"} ${i+1}... (e.g. ${formData.occasion === "proposal" ? "I promise to always listen" : formData.occasion === "family" ? "Always supporting my dreams" : "Your beautiful smile"})`} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none" />
                  ))}
                </div>
              </div>

              {/* Love Letter */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-pink-400" /> {formData.occasion === "proposal" ? "The Big Proposal Letter" : "Final Love Letter"}</label>
                <textarea rows="6" value={formData.letter} onChange={(e) => updateForm('letter', e.target.value)} placeholder="Pour your heart out here..." className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-6 py-5 text-slate-900 dark:text-white outline-none resize-none" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-black/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 py-4 px-8 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => setStep(s => s > 1 ? s - 1 : 1)} className={`flex items-center gap-2 font-medium ${step === 1 ? 'text-gray-600' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white'}`} disabled={step === 1}>
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-black px-8 py-3 rounded-full font-semibold hover:bg-slate-800 dark:hover:bg-gray-200">
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex gap-4">
              <button onClick={handlePreview} className="hidden md:flex items-center gap-2 text-slate-900 dark:text-white/70 hover:text-slate-900 dark:text-white px-6 py-3 font-medium">Preview</button>
              <button onClick={handlePublish} disabled={isPublishing} className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-slate-900 dark:text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 disabled:opacity-50">
                {isPublishing ? <><Loader2 className="w-5 h-5 animate-spin" /> {publishStatus}</> : <><Sparkles className="w-5 h-5" /> Generate Link</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
