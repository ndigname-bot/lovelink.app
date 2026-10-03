const fs = require('fs');

let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

// 1. Add occasion parsing
code = code.replace(
  'theme: draftData.theme || "blush",',
  'theme: draftData.theme || "blush",\n              occasion: draftData.occasion || "standard",'
);
code = code.replace(
  'theme: dbData.theme || "blush",',
  'theme: dbData.theme || "blush",\n            occasion: dbData.occasion || "standard",'
);
code = code.replace(
  'theme: "blush", recipientName: "Yuri",',
  'theme: "blush", occasion: "standard", recipientName: "Yuri",'
);

// 2. Adjust "Reasons" header
code = code.replace(
  '<h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light leading-relaxed mb-12`}>And {giftData.reasons.length} Reasons Why...</h1>',
  '<h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light leading-relaxed mb-12`}>{giftData.occasion === "proposal" ? "My Promises to You..." : giftData.occasion === "birthday" ? "My Wishes for You..." : `And ${giftData.reasons.length} Reasons Why...`}</h1>'
);

// 3. Add The Proposal UI stage
// Current Reaction Booth stage is `{stage === (giftData?.questions?.length || 2) + 4 && (`
// We will change it to `{stage === (giftData?.questions?.length || 2) + (giftData?.occasion === 'proposal' ? 5 : 4) && (`
code = code.replace(
  /\{stage === \(giftData\?\.questions\?\.length \|\| 2\) \+ 4 && \(/g,
  `{stage === (giftData?.questions?.length || 2) + 4 && giftData?.occasion === 'proposal' && (
          <motion.div key="proposal" initial={{opacity:0, scale:0.9, y: 50}} animate={{opacity:1, scale:1, y: 0}} exit={{opacity:0, scale:1.1}} transition={{duration:2}} className="w-full max-w-2xl text-center z-10 flex flex-col items-center px-4">
            <h1 className={\`text-4xl md:text-7xl font-serif italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] font-light leading-relaxed mb-12\`}>Will you marry me? 💍</h1>
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
              <button 
                onClick={() => {
                  confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FF69B4', '#FFFFFF'] });
                  confetti({ particleCount: 100, spread: 120, origin: { y: 0.3 }, colors: ['#FFD700', '#FFA500', '#FF69B4', '#FFFFFF'] });
                  setStage(prev => prev + 1);
                }} 
                className="w-full py-5 bg-white text-black rounded-full font-bold text-2xl shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:scale-110 transition-transform"
              >
                YES! ❤️
              </button>
            </div>
          </motion.div>
        )}

        {stage === (giftData?.questions?.length || 2) + (giftData?.occasion === 'proposal' ? 5 : 4) && (`
);

fs.writeFileSync('src/app/gift/[id]/page.js', code);
