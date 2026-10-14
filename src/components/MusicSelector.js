import { Music, Play, Pause, ChevronDown } from "lucide-react";
import { useState } from "react";

export const PRESET_SONGS = [
  // 💖 Romantic & Lovers
  { title: "Romantic Piano (Default)", url: "/audio/romantic.mp3", category: "romantic" },
  { title: "A Thousand Years - Christina Perri", url: "/audio/a-thousand-years.mp3", category: "romantic" },
  { title: "Perfect - Ed Sheeran", url: "/audio/perfect.mp3", category: "romantic" },
  { title: "All of Me - John Legend", url: "/audio/all-of-me.mp3", category: "romantic" },
  { title: "No One Like You - P-Square", url: "/audio/no-one-like-you.mp3", category: "romantic" },
  { title: "African Queen - 2Baba", url: "/audio/african-queen.mp3", category: "romantic" },
  { title: "Thinking Out Loud - Ed Sheeran", url: "/audio/thinking-out-loud.mp3", category: "romantic" },
  { title: "Best Part - H.E.R. ft. Daniel Caesar", url: "/audio/best-part.mp3", category: "romantic" },
  { title: "Just The Way You Are - Bruno Mars", url: "/audio/just-the-way-you-are.mp3", category: "romantic" },
  { title: "Can't Help Falling In Love - Elvis Presley", url: "/audio/cant-help-falling-in-love.mp3", category: "romantic" },

  // 👨‍👩‍👧 Parents & Family Appreciation
  { title: "A Song For Mama - Boyz II Men", url: "/audio/a-song-for-mama.mp3", category: "family" },
  { title: "Dance With My Father - Luther Vandross", url: "/audio/dance-with-my-father.mp3", category: "family" },
  { title: "What A Wonderful World - Louis Armstrong", url: "/audio/what-a-wonderful-world.mp3", category: "family" },
  { title: "Lean On Me - Bill Withers", url: "/audio/lean-on-me.mp3", category: "family" },
  { title: "Duduke - Simi", url: "/audio/duduke.mp3", category: "family" },

  // 🎉 Congratulations & Milestones
  { title: "Celebration - Kool & The Gang", url: "/audio/celebration.mp3", category: "celebration" },
  { title: "Happy Birthday - Stevie Wonder", url: "/audio/happy-birthday.mp3", category: "celebration" },
  { title: "Stand By Me - Ben E. King", url: "/audio/stand-by-me.mp3", category: "celebration" },
  { title: "Congratulations - Post Malone", url: "/audio/congratulations.mp3", category: "celebration" },

  // Extra Romantic Classics
  { title: "Make You Feel My Love - Adele", url: "https://www.youtube.com/watch?v=0put0_a--Ng", category: "romantic" },
  { title: "I Will Always Love You - Whitney Houston", url: "https://www.youtube.com/watch?v=3JWTaaS7LdU", category: "romantic" },
  { title: "My Heart Will Go On - Celine Dion", url: "https://www.youtube.com/watch?v=DNyKDI9pn0Q", category: "romantic" },
  { title: "Running (To You) - Chike ft. Simi", url: "https://www.youtube.com/watch?v=9DpeQbECK14", category: "romantic" },
  { title: "At Last - Etta James", url: "https://www.youtube.com/watch?v=1qJU8G7gR_g", category: "romantic" },
  { title: "I'm Yours - Jason Mraz", url: "https://www.youtube.com/watch?v=EkHTsc9PU2A", category: "romantic" },
  { title: "Love Me Like You Do - Ellie Goulding", url: "https://www.youtube.com/watch?v=AJtDXIazrMo", category: "romantic" },
  { title: "Beyond - Leon Bridges", url: "https://www.youtube.com/watch?v=OepXY20E_3g", category: "romantic" },
  { title: "Tattoo - Fireboy DML", url: "https://www.youtube.com/watch?v=R2_0-R5E2Z0", category: "romantic" }
];

export function MusicSelector({ formData, updateForm, previewSong, setPreviewSong, setAudioFile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  
  const selectedPreset = PRESET_SONGS.find(s => s.url === formData.songQuery);
  const isCustom = formData.songQuery && !selectedPreset && formData.songQuery !== 'upload';
  const isUpload = formData.songQuery === 'upload';
  
  let selectedDisplay = "Select a song...";
  if (selectedPreset) selectedDisplay = selectedPreset.title;
  else if (isCustom) selectedDisplay = "Custom YouTube Link";
  else if (isUpload) selectedDisplay = "Custom MP3 Upload";

  const filteredSongs = activeCategory === "all" 
    ? PRESET_SONGS 
    : PRESET_SONGS.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2">
        <Music className="w-4 h-4 text-pink-400" /> Background Song (Tap play to preview)
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-pink-500 transition-colors"
        >
          <span className="truncate font-medium">{selectedDisplay}</span>
          <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 max-h-[380px] overflow-y-auto flex flex-col gap-1 p-2">
             {/* Category Filter Pills */}
             <div className="flex items-center gap-1.5 p-1 mb-1 border-b border-slate-200 dark:border-white/10 overflow-x-auto">
               <button 
                 type="button"
                 onClick={(e) => { e.stopPropagation(); setActiveCategory("all"); }}
                 className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${activeCategory === "all" ? "bg-pink-500 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"}`}
               >
                 All ({PRESET_SONGS.length})
               </button>
               <button 
                 type="button"
                 onClick={(e) => { e.stopPropagation(); setActiveCategory("romantic"); }}
                 className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${activeCategory === "romantic" ? "bg-pink-500 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"}`}
               >
                 💖 Romance
               </button>
               <button 
                 type="button"
                 onClick={(e) => { e.stopPropagation(); setActiveCategory("family"); }}
                 className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${activeCategory === "family" ? "bg-pink-500 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"}`}
               >
                 👨‍👩‍👧 Family & Parents
               </button>
               <button 
                 type="button"
                 onClick={(e) => { e.stopPropagation(); setActiveCategory("celebration"); }}
                 className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${activeCategory === "celebration" ? "bg-pink-500 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"}`}
               >
                 🎉 Celebration
               </button>
             </div>

             {filteredSongs.map((song, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer ${formData.songQuery === song.url ? 'bg-pink-50 dark:bg-pink-900/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`} onClick={() => { updateForm('songQuery', song.url); setIsOpen(false); }}>
                   <div className="flex items-center gap-3 overflow-hidden">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setPreviewSong(previewSong === song.url ? null : song.url); }} 
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${previewSong === song.url ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300 hover:bg-pink-100 hover:text-pink-600'} transition-all shrink-0`}
                      >
                        {previewSong === song.url ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <div className="flex flex-col overflow-hidden">
                        <span className={`font-medium text-sm truncate ${formData.songQuery === song.url ? 'text-pink-600 dark:text-pink-400' : 'text-slate-700 dark:text-gray-200'}`}>{song.title}</span>
                        {song.url.startsWith("/audio/") && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">⚡ Instant Audio</span>
                        )}
                      </div>
                   </div>
                </div>
             ))}

             <div className="h-px bg-slate-200 dark:bg-white/10 my-2" />

             <div className="p-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => { updateForm('songQuery', 'https://www.youtube.com/watch?v='); setIsOpen(false); }}>
                <span className="font-medium text-sm text-slate-700 dark:text-gray-200">Use Custom YouTube Link</span>
             </div>
             
             <div className="p-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => { updateForm('songQuery', 'upload'); setIsOpen(false); }}>
                <span className="font-medium text-sm text-slate-700 dark:text-gray-200">Upload MP3 from Device</span>
             </div>
          </div>
        )}
      </div>
      
      {/* If custom is selected, show the input UI below the dropdown */}
      {isCustom && (
        <div className="flex flex-col gap-2 p-4 rounded-xl border bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 animate-in fade-in slide-in-from-top-2">
            <span className="font-medium text-sm text-slate-700 dark:text-gray-200">Custom YouTube Link</span>
            <div className="flex gap-2">
              <input 
                type="text"
                value={formData.songQuery}
                onChange={(e) => updateForm('songQuery', e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="w-full bg-white dark:bg-black/50 border border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-500 text-slate-900 dark:text-white"
              />
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); setPreviewSong(previewSong === formData.songQuery ? null : formData.songQuery); }} 
                className={`w-10 h-10 flex items-center justify-center rounded-lg ${previewSong === formData.songQuery ? 'bg-pink-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300 hover:bg-pink-100 hover:text-pink-600'} transition-all shrink-0`}
              >
                {previewSong === formData.songQuery ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
        </div>
      )}

      {/* If upload is selected, show the file input below the dropdown */}
      {isUpload && (
         <div className="flex flex-col gap-2 p-4 rounded-xl border bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 animate-in fade-in slide-in-from-top-2">
            <span className="font-medium text-sm text-slate-700 dark:text-gray-200">Upload MP3 from Device</span>
            <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-gray-300 focus:border-pink-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
         </div>
      )}
      
      {/* Preview Player */}
      {previewSong && !previewSong.includes('youtube') && (
        <audio autoPlay src={previewSong} />
      )}
      {previewSong && previewSong.includes('youtube') && (
        <iframe 
          className="absolute pointer-events-none opacity-0 -z-50"
          style={{ width: "1px", height: "1px", left: "-9999px", top: "-9999px" }}
          src={`https://www.youtube.com/embed/${previewSong.includes("v=") ? previewSong.split("v=")[1]?.split("&")[0] : previewSong.split("youtu.be/")[1]?.split("?")[0]}?autoplay=1&playsinline=1&enablejsapi=1&loop=1&playlist=${previewSong.includes("v=") ? previewSong.split("v=")[1]?.split("&")[0] : previewSong.split("youtu.be/")[1]?.split("?")[0]}`}
          allow="autoplay; encrypted-media" 
        ></iframe>
      )}
    </div>
  );
}
