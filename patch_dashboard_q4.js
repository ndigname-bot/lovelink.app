const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// 1. Add ChevronDown to imports
code = code.replace(/import { UploadCloud, ChevronRight, ChevronLeft/g, "import { UploadCloud, ChevronRight, ChevronLeft, ChevronDown");

// 2. Fix formData initial state
const oldState = `    q2: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    reasons: ["", "", ""],`;
const newState = `    q2: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    q3: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    q4: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    reasons: ["", "", ""],`;
code = code.replace(oldState, newState);

// 3. Fix the photo caption input CSS
// Change it to bg-transparent so it inherits the parent card color perfectly without glitching.
const oldCaptionClass = `className="w-full bg-slate-50 dark:bg-[#111] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm px-3 py-3 border-2 border-transparent focus:border-pink-500 rounded-b-xl outline-none border-t border-slate-200 dark:border-white/10 transition-colors"`;
const newCaptionClass = `className="w-full bg-transparent text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm px-3 py-3 border-2 border-transparent focus:border-pink-500 rounded-b-xl outline-none border-t border-slate-200 dark:border-white/10 transition-colors"`;
code = code.replace(oldCaptionClass, newCaptionClass);

// 4. Style the song dropdown
const oldSongSelect = `<select 
                  value={PRESET_SONGS.find(s => s.url === formData.songQuery) ? formData.songQuery : (formData.songQuery ? "custom" : "")} 
                  onChange={(e) => updateForm('songQuery', e.target.value === "custom" ? "https://www.youtube.com/watch?v=" : e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none mb-3"
                >`;
const newSongSelect = `<div className="relative">
                <select 
                  value={PRESET_SONGS.find(s => s.url === formData.songQuery) ? formData.songQuery : (formData.songQuery ? "custom" : "")} 
                  onChange={(e) => updateForm('songQuery', e.target.value === "custom" ? "https://www.youtube.com/watch?v=" : e.target.value)}
                  className="appearance-none w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-10 py-3 text-slate-900 dark:text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none mb-3 transition-all"
                >
                  <option value="">Select a romantic song...</option>
                  {PRESET_SONGS.map((song, idx) => (
                    <option key={idx} value={song.url}>{song.title}</option>
                  ))}
                  <option value="custom">👉 Paste my own YouTube Link...</option>
                  <option value="upload">👉 Upload MP3 from my device...</option>
                </select>
                <ChevronDown className="absolute right-3 top-[22px] -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>`;
// Actually the options are inside the select in old code, let's just replace the exact opening tag.
// It's safer to regex the <select ...> tag and put <div class="relative"> around it.
