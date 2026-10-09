const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// The ugly select for Trivia:
/*
<select 
  value={formData[qId].type || "multiple_choice"} 
  onChange={(e) => updateQuestion(qId, 'type', e.target.value)}
  className="appearance-none bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl pl-3 pr-8 py-1.5 text-sm text-slate-600 dark:text-gray-300 outline-none focus:border-pink-500 cursor-pointer shadow-sm"
>
*/
// Let's replace the native select with two distinct buttons to avoid dropdown hell on mobile completely.
const triviaSelectOld = `<select 
                      value={formData[qId].type || "multiple_choice"} 
                      onChange={(e) => updateQuestion(qId, 'type', e.target.value)}
                      className="appearance-none bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl pl-3 pr-8 py-1.5 text-sm text-slate-600 dark:text-gray-300 outline-none focus:border-pink-500 cursor-pointer shadow-sm"
                    >
                      <option className="bg-white dark:bg-[#111] text-slate-900 dark:text-white" value="multiple_choice">Multiple Choice</option>
                      <option className="bg-white dark:bg-[#111] text-slate-900 dark:text-white" value="open_ended">Open Ended (Text)</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />`;

const triviaButtonsNew = `<div className="flex bg-slate-200 dark:bg-white/10 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuestion(qId, 'type', 'multiple_choice')}
                        className={\`px-3 py-1.5 text-xs font-medium rounded-md transition-all \${(!formData[qId].type || formData[qId].type === 'multiple_choice') ? 'bg-white dark:bg-black text-pink-500 shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'}\`}
                      >
                        Multiple Choice
                      </button>
                      <button 
                        onClick={() => updateQuestion(qId, 'type', 'open_ended')}
                        className={\`px-3 py-1.5 text-xs font-medium rounded-md transition-all \${formData[qId].type === 'open_ended' ? 'bg-white dark:bg-black text-pink-500 shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'}\`}
                      >
                        Open Ended
                      </button>
                    </div>`;

code = code.replace(triviaSelectOld, triviaButtonsNew);

// Replace song select as well to look much better, or use buttons for "Preset vs Custom vs Upload"
const songSelectOld = `<select 
                  value={PRESET_SONGS.find(s => s.url === formData.songQuery) ? formData.songQuery : (formData.songQuery ? "custom" : "")} 
                  onChange={(e) => updateForm('songQuery', e.target.value === "custom" ? "https://www.youtube.com/watch?v=" : e.target.value)}
                  className="appearance-none w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none mb-3 transition-colors cursor-pointer shadow-sm"
                >
                  <option className="bg-white dark:bg-[#111] text-slate-900 dark:text-white" value="">Select a romantic song...</option>
                  {PRESET_SONGS.map((song, idx) => (
                    <option className="bg-white dark:bg-[#111] text-slate-900 dark:text-white" key={idx} value={song.url}>{song.title}</option>
                  ))}
                  <option className="bg-white dark:bg-[#111] text-slate-900 dark:text-white" value="custom">👉 Paste my own YouTube Link...</option>
                  <option className="bg-white dark:bg-[#111] text-slate-900 dark:text-white" value="upload">👉 Upload MP3 from my device...</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />`;

const songSelectNew = `<select 
                  value={PRESET_SONGS.find(s => s.url === formData.songQuery) ? formData.songQuery : (formData.songQuery ? "custom" : "")} 
                  onChange={(e) => updateForm('songQuery', e.target.value === "custom" ? "https://www.youtube.com/watch?v=" : e.target.value)}
                  className="appearance-none w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 outline-none mb-3 transition-colors cursor-pointer shadow-sm"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  <option value="">Select a romantic song...</option>
                  {PRESET_SONGS.map((song, idx) => (
                    <option key={idx} value={song.url}>{song.title}</option>
                  ))}
                  <option value="custom">👉 Paste my own YouTube Link...</option>
                  <option value="upload">👉 Upload MP3 from my device...</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />`;

code = code.replace(songSelectOld, songSelectNew);

fs.writeFileSync('src/app/dashboard/page.js', code);
