const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// 1. Add Play and Pause to lucide-react import
code = code.replace(/import \{ ([^}]+) \} from "lucide-react";/, (match, group) => {
    let icons = group.split(',').map(s => s.trim());
    if (!icons.includes('Play')) icons.push('Play');
    if (!icons.includes('Pause')) icons.push('Pause');
    if (!icons.includes('Check')) icons.push('Check');
    return `import { ${icons.join(', ')} } from "lucide-react";`;
});

// 2. Add previewSong state
if (!code.includes('const [previewSong, setPreviewSong] = useState(null);')) {
    code = code.replace('const [isPublishing, setIsPublishing] = useState(false);', 'const [isPublishing, setIsPublishing] = useState(false);\n  const [previewSong, setPreviewSong] = useState(null);');
}

// 3. The old song select block
const regexSongSelect = /<select[\s\S]*?className="appearance-none w-full bg-white dark:bg-black\/40 border border-slate-200 dark:border-white\/10 rounded-xl pl-4 pr-12 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500\/50 focus:border-pink-500 outline-none mb-3 transition-colors cursor-pointer shadow-sm"[\s\S]*?<\/select>\s*<ChevronDown className="absolute right-4 top-1\/2 -translate-y-1\/2 w-5 h-5 text-slate-400 pointer-events-none" \/>/;

const newMusicUI = `<div className="flex flex-col gap-3 mt-4">
                  {PRESET_SONGS.map((song, idx) => (
                    <div key={idx} className={\`flex items-center justify-between p-3 rounded-xl border transition-all \${formData.songQuery === song.url ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-500' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-pink-300'}\`}>
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
                          className={\`w-10 h-10 flex items-center justify-center rounded-lg \${previewSong === formData.songQuery ? 'bg-pink-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-300'} transition-all shrink-0\`}
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
                </div>`;

code = code.replace(regexSongSelect, newMusicUI);
fs.writeFileSync('src/app/dashboard/page.js', code);
