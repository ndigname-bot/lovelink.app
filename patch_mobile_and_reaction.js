const fs = require('fs');

let giftCode = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

// 1. Fix Mobile Spacing (The "Unprofessional Text Spread")
// Replace huge mobile paddings with smaller ones, let text breathe
giftCode = giftCode.replace(/p-10 md:p-16/g, 'p-6 md:p-12');
giftCode = giftCode.replace(/p-10/g, 'p-6 md:p-10');
giftCode = giftCode.replace(/text-lg md:text-xl/g, 'text-base md:text-xl');
giftCode = giftCode.replace(/text-3xl md:text-4xl/g, 'text-2xl md:text-4xl');
giftCode = giftCode.replace(/text-4xl md:text-6xl/g, 'text-3xl md:text-5xl');

// 2. Add Reaction Booth UI and Logic
const importRegex = /(import { Heart, Sparkles, Image as ImageIcon, ChevronRight, Volume2, VolumeX, Quote } from "lucide-react";)/;
giftCode = giftCode.replace(importRegex, 'import { Heart, Sparkles, Image as ImageIcon, ChevronRight, Volume2, VolumeX, Quote, Mic, Send, MessageSquare, Loader2 } from "lucide-react";');

const stateRegex = /(const \[audioContext, setAudioContext\] = useState\(null\);)/;
const reactionStates = `$1
  const [reactionMode, setReactionMode] = useState(null); // 'voice' or 'text'
  const [reactionText, setReactionText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isSubmittingReaction, setIsSubmittingReaction] = useState(false);
  const [reactionSent, setReactionSent] = useState(false);
`;
giftCode = giftCode.replace(stateRegex, reactionStates);

const recordLogic = `
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
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        
        const formData = new FormData();
        formData.append("file", blob, "voicenote.webm");
        formData.append("upload_preset", uploadPreset);
        
        const res = await fetch(\`https://api.cloudinary.com/v1_1/\${cloudName}/auto/upload\`, {
          method: "POST",
          body: formData
        });
        
        if (!res.ok) throw new Error("Failed to upload audio");
        const data = await res.json();
        finalContent = data.secure_url;
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
`;

giftCode = giftCode.replace(/(useEffect\(\(\) => {)/, `${recordLogic}\n  $1`);

// Timer effect
const timerEffect = `
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);
`;
giftCode = giftCode.replace(/(useEffect\(\(\) => {\n    const fetchGift)/, `${timerEffect}\n  $1`);


const letterEndRegex = /(<p className={\`text-2xl \${styles.font} italic \${styles.accentText} whitespace-pre-wrap\`}>\n                  {giftData.signature}\n                <\/p>\n              <\/div>)/;

const reactionUI = `$1

              {/* REACTION BOOTH */}
              {!reactionSent ? (
                <div className="mt-16 pt-10 border-t border-slate-200/20 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 opacity-90">Send a Reaction</h3>
                  <p className="text-sm opacity-70 mb-8 text-center max-w-sm">
                    They put a lot of love into this. Send a voice note or write a message back so they can see your reaction!
                  </p>
                  
                  {!reactionMode ? (
                    <div className="flex gap-4 w-full max-w-sm">
                      <button onClick={() => setReactionMode('voice')} className={\`flex-1 bg-white/10 hover:bg-white/20 border \${styles.border} p-4 rounded-2xl flex flex-col items-center gap-3 transition-all\`}>
                        <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                          <Mic className="w-6 h-6 text-pink-400" />
                        </div>
                        <span className="font-semibold text-sm">Voice Note</span>
                      </button>
                      
                      <button onClick={() => setReactionMode('text')} className={\`flex-1 bg-white/10 hover:bg-white/20 border \${styles.border} p-4 rounded-2xl flex flex-col items-center gap-3 transition-all\`}>
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-purple-400" />
                        </div>
                        <span className="font-semibold text-sm">Text Reply</span>
                      </button>
                    </div>
                  ) : reactionMode === 'voice' ? (
                    <div className="w-full max-w-sm flex flex-col items-center gap-4">
                      {audioChunks.length === 0 && !isRecording ? (
                        <button onClick={startRecording} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                          <Mic className="w-8 h-8 text-white" />
                        </button>
                      ) : isRecording ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="text-3xl font-mono font-bold text-red-400 animate-pulse">
                            00:{recordingTime.toString().padStart(2, '0')}
                          </div>
                          <button onClick={stopRecording} className="w-20 h-20 bg-white/10 border border-white/20 rounded-full flex items-center justify-center hover:scale-105 transition-all">
                            <div className="w-8 h-8 bg-red-500 rounded-sm" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full flex flex-col gap-4">
                          <div className="bg-white/10 p-4 rounded-xl flex items-center justify-center">
                            <span className="text-green-400 font-bold flex items-center gap-2"><Volume2 className="w-5 h-5"/> Audio Recorded</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => {setAudioChunks([]); setReactionMode(null);}} disabled={isSubmittingReaction} className="flex-1 px-4 py-3 bg-white/10 rounded-xl font-bold text-sm">Cancel</button>
                            <button onClick={() => submitReaction('voice', new Blob(audioChunks, { type: 'audio/webm' }))} disabled={isSubmittingReaction} className="flex-1 px-4 py-3 bg-pink-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                              {isSubmittingReaction ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Note</>}
                            </button>
                          </div>
                        </div>
                      )}
                      {!isRecording && audioChunks.length === 0 && <button onClick={() => setReactionMode(null)} className="text-sm opacity-60 hover:opacity-100 underline mt-2">Go back</button>}
                    </div>
                  ) : (
                    <div className="w-full max-w-sm flex flex-col gap-4">
                      <textarea 
                        value={reactionText}
                        onChange={(e) => setReactionText(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-pink-500 resize-none text-sm"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setReactionMode(null)} disabled={isSubmittingReaction} className="flex-1 px-4 py-3 bg-white/10 rounded-xl font-bold text-sm">Cancel</button>
                        <button onClick={() => submitReaction('text')} disabled={isSubmittingReaction || !reactionText.trim()} className="flex-1 px-4 py-3 bg-pink-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                          {isSubmittingReaction ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-16 pt-10 border-t border-slate-200/20 w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-green-400 fill-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">Sent!</h3>
                  <p className="opacity-70 text-sm">Your reaction was sent straight to their inbox.</p>
                </div>
              )}
`;

giftCode = giftCode.replace(letterEndRegex, reactionUI);

fs.writeFileSync('src/app/gift/[id]/page.js', giftCode);


let inboxCode = fs.readFileSync('src/app/my-gifts/page.js', 'utf8');

const inboxImportRegex = /(import { Heart, Clock, AlertCircle, Link as LinkIcon, Gift } from "lucide-react";)/;
inboxCode = inboxCode.replace(inboxImportRegex, 'import { Heart, Clock, AlertCircle, Link as LinkIcon, Gift, MessageSquare, Mic, Play } from "lucide-react";');

const inboxUIRegex = /(<div className="mt-4 pt-4 border-t border-slate-200 dark:border-white\/10 flex justify-between items-center">)/g;
const newInboxUI = `
                      {/* INBOX SECTION */}
                      {gift.response && (
                        <div className="mt-4 p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl animate-in fade-in">
                          <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            {gift.response.type === 'voice' ? <Mic className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                            Partner's Reaction
                          </h4>
                          {gift.response.type === 'voice' ? (
                            <div className="flex items-center gap-3">
                              <audio controls src={gift.response.content} className="w-full h-10" />
                            </div>
                          ) : (
                            <p className="text-sm italic text-slate-700 dark:text-slate-300 border-l-2 border-pink-500/50 pl-3 py-1">
                              "{gift.response.content}"
                            </p>
                          )}
                        </div>
                      )}
                      
                      $1`;
inboxCode = inboxCode.replace(inboxUIRegex, newInboxUI);

fs.writeFileSync('src/app/my-gifts/page.js', inboxCode);
