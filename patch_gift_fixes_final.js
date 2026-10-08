const fs = require('fs');
let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

// 1. Move Audio Tags
const oldAudio = `{(!giftData?.songQuery || giftData.songQuery === "") && <audio autoPlay loop src="https://cdn.pixabay.com/download/audio/2022/05/16/audio_0cb9b119cb.mp3" />}
            {giftData?.songQuery?.includes("youtube.com") && <iframe width="0" height="0" src={\`https://www.youtube.com/embed/\${giftData.songQuery.split("v=")[1]?.split("&")[0]}?autoplay=1&loop=1&playlist=\${giftData.songQuery.split("v=")[1]?.split("&")[0]}\`} allow="autoplay" style={{display: "none"}}></iframe>}
            {giftData?.songQuery && !giftData.songQuery.includes("youtube.com") && <audio autoPlay loop src={giftData.songQuery} />}`;

code = code.replace(oldAudio, "");

const wrapperDiv = `<div className={\`min-h-screen \${styles.bg} \${styles.text} \${styles.font} flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000\`}>`;
const newAudio = `
      {stage >= 1 && (
        <>
          {(!giftData?.songQuery || giftData.songQuery === "") && <audio autoPlay loop src="https://cdn.pixabay.com/download/audio/2022/05/16/audio_0cb9b119cb.mp3" />}
          {giftData?.songQuery?.includes("youtube") && <iframe width="0" height="0" src={\`https://www.youtube.com/embed/\${giftData.songQuery.includes("v=") ? giftData.songQuery.split("v=")[1]?.split("&")[0] : giftData.songQuery.split("youtu.be/")[1]?.split("?")[0]}?autoplay=1&loop=1&playlist=\${giftData.songQuery.includes("v=") ? giftData.songQuery.split("v=")[1]?.split("&")[0] : giftData.songQuery.split("youtu.be/")[1]?.split("?")[0]}\`} allow="autoplay" style={{display: "none"}}></iframe>}
          {giftData?.songQuery && !giftData.songQuery.includes("youtube") && <audio autoPlay loop src={giftData.songQuery} />}
        </>
      )}
`;
code = code.replace(wrapperDiv, wrapperDiv + newAudio);

// 2. Fix Playing Text with PRESET_SONGS reverse lookup
const PRESET_SONGS_ARR = `const PRESET_SONGS = [
  { title: "Daniel Caesar - Get You", url: "https://www.youtube.com/watch?v=uQFVqltOXRg" },
  { title: "Bazzi - Beautiful", url: "https://www.youtube.com/watch?v=Uk1hqVGREy0" },
  { title: "Ed Sheeran - Perfect", url: "https://www.youtube.com/watch?v=2Vv-BfVoq4g" },
  { title: "John Legend - All of Me", url: "https://www.youtube.com/watch?v=450p7goxZqg" },
  { title: "Bruno Mars - Just The Way You Are", url: "https://www.youtube.com/watch?v=LjhCEhWiKXk" },
  { title: "Christina Perri - A Thousand Years", url: "https://www.youtube.com/watch?v=rtOvBOTyX00" },
  { title: "Celine Dion - My Heart Will Go On", url: "https://www.youtube.com/watch?v=pWtCBSmWn2A" },
];`;

const importMatch = `import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";`;
if (!code.includes("PRESET_SONGS")) {
    code = code.replace(importMatch, importMatch + "\\n\\n" + PRESET_SONGS_ARR);
}

code = code.replace(
  '<span className="text-xs font-medium tracking-wide">Playing: {giftData.songQuery}</span>',
  '<span className="text-xs font-medium tracking-wide">Playing: {PRESET_SONGS.find(s => s.url === giftData.songQuery)?.title || (giftData.songQuery.startsWith("http") ? "Our Special Song 🎵" : giftData.songQuery)}</span>'
);

// 3. Suspense text
code = code.replace(
  '<h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light leading-relaxed mb-6`}>\\n              I made something <br/><span className={`${styles.accentText} font-semibold`}>special</span> just for you.\\n            </h1>',
  '<h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light leading-relaxed mb-6`}>\\n              You have a classified digital package from <span className={`${styles.accentText} font-semibold`}>{giftData.creatorName}</span>.\\n            </h1>\\n            <p className="text-lg opacity-80 mb-8">But before you can open it, you must prove your identity.</p>'
);

// 4. Reward text fallback
code = code.replace(
  '<p className="text-xl opacity-90 mb-10 leading-relaxed font-medium">"{giftData.questions[stage-1].reward}"</p>',
  '<p className="text-xl opacity-90 mb-10 leading-relaxed font-medium">"{giftData.questions[stage-1].reward || \\"You know me so well! ❤️\\"}"</p>'
);

fs.writeFileSync('src/app/gift/[id]/page.js', code);
