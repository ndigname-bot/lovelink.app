const fs = require('fs');

let dashCode = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// 1. Add audioFile state
dashCode = dashCode.replace('const [photoPreviews, setPhotoPreviews] = useState([]);', 'const [photoPreviews, setPhotoPreviews] = useState([]);\n  const [audioFile, setAudioFile] = useState(null);');

// 2. Update the dropdown
const oldSelect = `<option value="custom">👉 Paste my own YouTube Link...</option>`;
const newSelect = `<option value="custom">👉 Paste my own YouTube Link...</option>\n                  <option value="upload">👉 Upload MP3 from my device...</option>`;
dashCode = dashCode.replace(oldSelect, newSelect);

// 3. Update the input section
const oldInputSection = `{(!PRESET_SONGS.find(s => s.url === formData.songQuery) && formData.songQuery !== "") && (
                  <input type="text" value={formData.songQuery} onChange={(e) => updateForm('songQuery', e.target.value)} placeholder="Paste custom YouTube link here..." className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none animate-in fade-in slide-in-from-top-2" />
                )}`;
const newInputSection = `{(!PRESET_SONGS.find(s => s.url === formData.songQuery) && formData.songQuery !== "" && formData.songQuery !== "upload") && (
                  <input type="text" value={formData.songQuery} onChange={(e) => updateForm('songQuery', e.target.value)} placeholder="Paste custom YouTube link here..." className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none animate-in fade-in slide-in-from-top-2" />
                )}
                {formData.songQuery === "upload" && (
                  <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-slate-600 dark:text-gray-300 focus:border-pink-500 outline-none animate-in fade-in slide-in-from-top-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                )}`;
dashCode = dashCode.replace(oldInputSection, newInputSection);

// 4. Update the handlePublish to upload audio
const uploadImagesRegex = /(photoUrls = await Promise.all\(uploadPromises\);\n      })/;
const audioUploadLogic = `$1\n\n      let finalSongUrl = formData.songQuery;\n      if (formData.songQuery === "upload" && audioFile) {\n        const audioData = new FormData();\n        audioData.append("file", audioFile);\n        audioData.append("upload_preset", uploadPreset);\n        const audioRes = await fetch(\`https://api.cloudinary.com/v1_1/\${cloudName}/auto/upload\`, {\n          method: "POST",\n          body: audioData,\n        });\n        if (!audioRes.ok) throw new Error("Failed to upload audio to Cloudinary");\n        const audioJson = await audioRes.json();\n        finalSongUrl = audioJson.secure_url;\n      } else if (formData.songQuery === "upload") {\n        finalSongUrl = "";\n      }`;
dashCode = dashCode.replace(uploadImagesRegex, audioUploadLogic);

// 5. Save finalSongUrl to firestore instead of formData.songQuery directly
dashCode = dashCode.replace('...formData,', '...formData,\n        songQuery: finalSongUrl,');

fs.writeFileSync('src/app/dashboard/page.js', dashCode);


let giftCode = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

// 6. Fix the gift rendering
const oldGiftAudio = `{giftData?.songQuery ? <iframe width="0" height="0" src={\`https://www.youtube.com/embed/\${giftData.songQuery.split("v=")[1]?.split("&")[0] || "dQw4w9WgXcQ"}?autoplay=1&loop=1&playlist=\${giftData.songQuery.split("v=")[1]?.split("&")[0] || "dQw4w9WgXcQ"}\`} allow="autoplay" style={{display: "none"}}></iframe> : <audio autoPlay loop src="https://cdn.pixabay.com/download/audio/2022/05/16/audio_0cb9b119cb.mp3" />}`;
const newGiftAudio = `
            {(!giftData?.songQuery || giftData.songQuery === "") && <audio autoPlay loop src="https://cdn.pixabay.com/download/audio/2022/05/16/audio_0cb9b119cb.mp3" />}
            {giftData?.songQuery?.includes("youtube.com") && <iframe width="0" height="0" src={\`https://www.youtube.com/embed/\${giftData.songQuery.split("v=")[1]?.split("&")[0]}?autoplay=1&loop=1&playlist=\${giftData.songQuery.split("v=")[1]?.split("&")[0]}\`} allow="autoplay" style={{display: "none"}}></iframe>}
            {giftData?.songQuery && !giftData.songQuery.includes("youtube.com") && <audio autoPlay loop src={giftData.songQuery} />}
`;
giftCode = giftCode.replace(oldGiftAudio, newGiftAudio);

fs.writeFileSync('src/app/gift/[id]/page.js', giftCode);
