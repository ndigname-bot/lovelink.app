const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

const startStr = '<label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2"><Music className="w-4 h-4 text-pink-400" /> Background Song</label>';
const endStr = '{/* Skip Trivia Toggle */}';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    const before = code.substring(0, startIndex);
    const after = code.substring(endIndex);

    const newMusicUI = `<label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2"><Music className="w-4 h-4 text-pink-400" /> Background Song (Tap play to preview)</label>
              
              <div className="flex flex-col gap-3 mt-4">
                  {PRESET_SONGS.map((song, idx) => (
                    <div key={idx} className={\`flex items-center justify-between p-3 rounded-xl border transition-all \${formData.songQuery === song.url ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-500' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-pink-300/50'}\`}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); setPreviewSong(previewSong === song.url ? null : song.url); }} 
                          className={\`w-8 h-8 flex items-center justify-center rounded-full \${previewSong === song.url ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300 hover:bg-pink-100 hover:text-pink-600 dark:hover:bg-pink-500/20 dark:hover:text-pink-400'} transition-all shrink-0\`}
                        >
                          {previewSong === song.url ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <span className="font-medium text-sm text-slate-700 dark:text-gray-200 truncate">{song.title}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); updateForm('songQuery', song.url); }}
                        className={\`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 \${formData.songQuery === song.url ? 'bg-pink-500 text-white shadow-md' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-300 dark:hover:bg-white/20'}\`}
                      >
                        {formData.songQuery === song.url ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  ))}
                  
                  {/* Custom YouTube Link */}
                  <div className={\`flex flex-col gap-2 p-3 rounded-xl border transition-all \${formData.songQuery && !PRESET_SONGS.find(s => s.url === formData.songQuery) && formData.songQuery !== 'upload' ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-500' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'}\`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-slate-700 dark:text-gray-200">Custom YouTube Link</span>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); updateForm('songQuery', 'https://www.youtube.com/watch?v='); }}
                        className={\`px-4 py-1.5 rounded-lg text-xs font-bold transition-all \${formData.songQuery && !PRESET_SONGS.find(s => s.url === formData.songQuery) && formData.songQuery !== 'upload' ? 'bg-pink-500 text-white shadow-md' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-300 dark:hover:bg-white/20'}\`}
                      >
                        Use Custom
                      </button>
                    </div>
                    {formData.songQuery && !PRESET_SONGS.find(s => s.url === formData.songQuery) && formData.songQuery !== 'upload' && (
                      <div className="mt-2 flex gap-2">
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
                          className={\`w-10 h-10 flex items-center justify-center rounded-lg \${previewSong === formData.songQuery ? 'bg-pink-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300 hover:bg-pink-100 hover:text-pink-600'} transition-all shrink-0\`}
                        >
                          {previewSong === formData.songQuery ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Custom MP3 Upload */}
                  <div className={\`flex flex-col gap-2 p-3 rounded-xl border transition-all \${formData.songQuery === 'upload' ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-500' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'}\`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-slate-700 dark:text-gray-200">Upload MP3 from Device</span>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); updateForm('songQuery', 'upload'); }}
                        className={\`px-4 py-1.5 rounded-lg text-xs font-bold transition-all \${formData.songQuery === 'upload' ? 'bg-pink-500 text-white shadow-md' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-300 dark:hover:bg-white/20'}\`}
                      >
                        Upload MP3
                      </button>
                    </div>
                    {formData.songQuery === "upload" && (
                        <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="w-full mt-2 bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-gray-300 focus:border-pink-500 outline-none animate-in fade-in slide-in-from-top-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                    )}
                  </div>
                  
                  {/* Invisible YouTube Player for Previews */}
                  {previewSong && previewSong.includes('youtube') && (
                     <iframe 
                        width="0" height="0" 
                        src={\`https://www.youtube.com/embed/\${previewSong.includes("v=") ? previewSong.split("v=")[1]?.split("&")[0] : previewSong.split("youtu.be/")[1]?.split("?")[0]}?autoplay=1&loop=1&playlist=\${previewSong.includes("v=") ? previewSong.split("v=")[1]?.split("&")[0] : previewSong.split("youtu.be/")[1]?.split("?")[0]}\`}
                        allow="autoplay" 
                        style={{display: "none"}}
                     ></iframe>
                  )}
              </div>
              `;
    
    code = before + newMusicUI + after;
    fs.writeFileSync('src/app/dashboard/page.js', code);
    console.log("Success");
} else {
    console.log("Not found", startIndex, endIndex);
}
