const fs = require('fs');

const code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

const presetSongs = `
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
`;

const importRegex = /(import { useRouter } from "next\/navigation";)/;
let newCode = code.replace(importRegex, "$1\n" + presetSongs);

const musicSectionRegex = /<label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2"><Music className="w-4 h-4 text-pink-400" \/> Background Song.*?<\/div>/s;

const newMusicSection = `<label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2"><Music className="w-4 h-4 text-pink-400" /> Background Song</label>
                <select 
                  value={PRESET_SONGS.find(s => s.url === formData.songQuery) ? formData.songQuery : (formData.songQuery ? "custom" : "")} 
                  onChange={(e) => updateForm('songQuery', e.target.value === "custom" ? "https://www.youtube.com/watch?v=" : e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none mb-3"
                >
                  <option value="">Select a romantic song...</option>
                  {PRESET_SONGS.map((song, idx) => (
                    <option key={idx} value={song.url}>{song.title}</option>
                  ))}
                  <option value="custom">👉 Paste my own YouTube Link...</option>
                </select>
                
                {(!PRESET_SONGS.find(s => s.url === formData.songQuery) && formData.songQuery !== "") && (
                  <input type="text" value={formData.songQuery} onChange={(e) => updateForm('songQuery', e.target.value)} placeholder="Paste custom YouTube link here..." className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none animate-in fade-in slide-in-from-top-2" />
                )}
              </div>`;

newCode = newCode.replace(musicSectionRegex, newMusicSection);

fs.writeFileSync('src/app/dashboard/page.js', newCode);
