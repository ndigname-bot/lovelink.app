const fs = require('fs');
let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

const finalLetterSignOffEnd = "                <p className={`text-2xl ${styles.font} italic ${styles.accentText} whitespace-pre-wrap`}>\n                  {giftData.signOff}\n                </p>\n              </div>";

const finalLetterWithContinue = "                <p className={`text-2xl ${styles.font} italic ${styles.accentText} whitespace-pre-wrap`}>\n                  {giftData.signOff}\n                </p>\n              </div>\n              <div className=\"mt-12 w-full flex justify-center\">\n                <button onClick={() => setStage(prev => prev + 1)} className={`px-8 py-4 bg-gradient-to-r ${styles.accentGradient} rounded-full font-bold shadow-lg hover:scale-105 transition-transform text-slate-900 dark:text-white text-lg flex items-center justify-center gap-2`}>\n                  Continue <ArrowRight className=\"w-5 h-5\" />\n                </button>\n              </div>";
code = code.replace(finalLetterSignOffEnd, finalLetterWithContinue);

const animatePresenceEnd = "      </AnimatePresence>\n    </div>";

const missingStages = `        {/* STAGE: PROPOSAL (ONLY IF OCCASION === PROPOSAL) */}
        {stage === (giftData?.questions?.length || 2) + 4 && giftData?.occasion === 'proposal' && (
          <motion.div key="proposal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:2}} className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{opacity:0, scale:0.9, y: 50}} animate={{opacity:1, scale:1, y: 0}} transition={{delay: 1, duration:2}} className="flex flex-col items-center w-full max-w-2xl">
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
          </motion.div>
        )}

        {/* STAGE: REACTION BOOTH */}
        {stage === (giftData?.questions?.length || 2) + (giftData?.occasion === 'proposal' ? 5 : 4) && (
          <motion.div key="reaction" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className={\`w-full max-w-xl \${styles.glass} p-8 md:p-12 rounded-[3rem] border \${styles.border} text-center shadow-2xl relative z-10\`}>
            <h2 className={\`text-3xl md:text-5xl \${styles.font} italic mb-6\`}>Leave a Reaction</h2>
            <p className="text-lg opacity-80 mb-10">
              Record a voice note or write a message to let {giftData.creatorName} know you received this!
            </p>
            
            <div className="flex flex-col gap-6">
              {!isRecording && audioChunks.length === 0 && (
                <button onClick={startRecording} className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
                  🎤 Record Voice Note
                </button>
              )}
              
              {isRecording && (
                <div className="w-full py-4 bg-red-500/20 text-red-500 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 animate-pulse border border-red-500/50">
                  <span>Recording... {recordingTime}s</span>
                  <button onClick={stopRecording} className="px-4 py-2 bg-red-500 text-white rounded-full text-sm mt-2">Stop</button>
                </div>
              )}
              
              {audioChunks.length > 0 && !isRecording && (
                <div className="w-full py-4 bg-green-500/20 text-green-500 rounded-2xl font-bold flex flex-col items-center border border-green-500/50">
                  <span>Voice Note Ready! 🎵</span>
                  <button onClick={() => submitReaction('voice', new Blob(audioChunks, { type: 'audio/webm' }))} disabled={isSubmittingReaction} className="mt-4 px-6 py-2 bg-green-500 text-white rounded-full disabled:opacity-50">
                    {isSubmittingReaction ? "Sending..." : "Send Voice Note"}
                  </button>
                </div>
              )}

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-black text-white/50">OR</span></div>
              </div>
              
              <textarea 
                value={reactionText} 
                onChange={e => setReactionText(e.target.value)} 
                placeholder="Type a message instead..." 
                className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white outline-none focus:border-pink-500 resize-none h-32"
              />
              <button onClick={() => submitReaction('text')} disabled={!reactionText || isSubmittingReaction} className="w-full py-4 bg-white text-black rounded-2xl font-bold disabled:opacity-50">
                {isSubmittingReaction ? "Sending..." : "Send Message"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>`;

code = code.replace(animatePresenceEnd, missingStages);
fs.writeFileSync('src/app/gift/[id]/page.js', code);
