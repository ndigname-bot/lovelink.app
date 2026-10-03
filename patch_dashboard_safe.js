const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// 1. Add ChevronDown to imports
code = code.replace(/import { Heart, UploadCloud/g, "import { ChevronDown, Heart, UploadCloud");
if (!code.includes("ChevronDown")) {
   code = code.replace(/import { UploadCloud/g, "import { ChevronDown, UploadCloud");
}

// 2. Fix formData initial state
const oldState = `    q2: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    reasons: ["", "", ""],`;
const newState = `    q2: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    q3: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    q4: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },
    reasons: ["", "", ""],`;
code = code.replace(oldState, newState);

// 3. Fix Photo Caption input background
const oldCaptionClass = `className="w-full bg-slate-50 dark:bg-[#111] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm px-3 py-3 border-2 border-transparent focus:border-pink-500 rounded-b-xl outline-none border-t border-slate-200 dark:border-white/10 transition-colors"`;
const newCaptionClass = `className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-sm px-3 py-3 border-2 border-transparent focus:border-pink-500 rounded-b-xl outline-none border-t border-slate-200 dark:border-white/10 transition-colors"`;
code = code.replace(oldCaptionClass, newCaptionClass);

// 4. Style Song Select
const oldSongStart = `<select \n                  value={PRESET_SONGS`;
const oldSongEnd = `</select>`;
const qStartIdx = code.indexOf(oldSongStart);
// just use a simpler string replace for the select tag
code = code.replace(/<select \n                  value=\{PRESET_SONGS\.find\([\s\S]*?className="w-full bg-slate-100 dark:bg-white\/5 border border-slate-200 dark:border-white\/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none mb-3"\n                >/, `<div className="relative">
                <select 
                  value={PRESET_SONGS.find(s => s.url === formData.songQuery) ? formData.songQuery : (formData.songQuery ? "custom" : "")} 
                  onChange={(e) => updateForm('songQuery', e.target.value === "custom" ? "https://www.youtube.com/watch?v=" : e.target.value)}
                  className="appearance-none w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none mb-3 transition-colors cursor-pointer shadow-sm"
                >`);
code = code.replace(/<option value="upload">👉 Upload MP3 from my device...<\/option>\n                <\/select>/, `<option value="upload">👉 Upload MP3 from my device...</option>
                </select>
                <ChevronDown className="absolute right-4 top-[22px] -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>`);

// 5. Replace Q1 and Q2 blocks safely
const markerStart = "{/* Question 1 */}";
const markerEnd = "</motion.div>";

const startIndex = code.indexOf(markerStart);
const endIndex = code.indexOf(markerEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const before = code.substring(0, startIndex);
  const after = code.substring(endIndex);
  
  const newQuestionsBlock = `{['q1', 'q2', 'q3', 'q4'].map((qId, index) => (
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
                  <input type="text" value={formData[qId].question} onChange={(e) => updateQuestion(qId, 'question', e.target.value)} placeholder={\`e.g. \${index === 0 ? "What is my favorite thing about you?" : index === 1 ? "Where was our first date?" : "What is my biggest pet peeve?"}\`} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none transition-colors" />
                  
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
            `;
  code = before + newQuestionsBlock + after;
}

fs.writeFileSync('src/app/dashboard/page.js', code);
