const fs = require('fs');
let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

const regex = /\{stage === \(giftData\?\.questions\?\.length \|\| 2\) \+ 1 && \([\s\S]*?<\/motion\.div>\s*\)\}/;

const newCarouselStage = `{stage === (giftData?.questions?.length || 2) + 1 && (
          <motion.div key="carousel" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full max-w-2xl text-center z-10 flex flex-col items-center overflow-hidden">
            
            <AnimatePresence mode="wait">
              {!isSpinningOut ? (
                <motion.div key="normal-photos" exit={{ opacity: 0, scale: 0.5 }} className="w-full flex flex-col items-center">
                  <h1 className={\`text-3xl md:text-5xl \${styles.font} italic opacity-90 font-light leading-relaxed mb-8\`}>Memory Lane...</h1>
                  
                  {giftData.photoUrls && giftData.photoUrls.length > 0 && (
                    <div className={\`relative w-72 h-96 md:w-96 md:h-[30rem] rounded-[2rem] overflow-hidden border-4 \${styles.border} shadow-[0_0_80px_rgba(255,255,255,0.1)] mb-10\`}>
                      <AnimatePresence initial={false}>
                        <motion.div 
                          key={activePhoto}
                          initial={{ y: "100%", opacity: 0.5 }}
                          animate={{ y: "0%", opacity: 1 }}
                          exit={{ y: "-100%", opacity: 0.5 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="absolute inset-0 w-full h-full bg-black"
                        >
                          <img src={giftData.photoUrls[activePhoto]} className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none" />
                          
                          {giftData.photoCaptions && giftData.photoCaptions[activePhoto] && (
                            <motion.div 
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                              className="absolute bottom-0 left-0 w-full p-8 text-center"
                            >
                              <p className="text-white text-lg md:text-2xl font-semibold tracking-wide drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] leading-snug">
                                "{giftData.photoCaptions[activePhoto]}"
                              </p>
                            </motion.div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                  
                  <motion.button onClick={() => setStage(prev => prev + 1)} className={\`px-8 py-4 bg-gradient-to-r \${styles.accentGradient} rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform text-slate-900 dark:text-white text-lg flex items-center justify-center gap-2 opacity-50 hover:opacity-100\`}>
                    Skip <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  key="crazy-spin"
                  initial={{ opacity: 0, scale: 0.5, rotateX: 0 }}
                  animate={{ opacity: 1, scale: [1, 1.2, 0], rotateX: [0, -720, -1440, -3600], filter: ["blur(0px)", "blur(10px)", "blur(30px)"] }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className={\`relative w-72 h-96 md:w-96 md:h-[30rem] rounded-[2rem] overflow-hidden border-4 \${styles.border} shadow-[0_0_150px_rgba(255,255,255,0.4)] flex items-center justify-center bg-black\`}
                >
                  {giftData.photoUrls && giftData.photoUrls.length > 0 && (
                    <img src={giftData.photoUrls[giftData.photoUrls.length - 1]} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  )}
                  <Heart className="w-32 h-32 text-pink-500 animate-pulse relative z-10" />
                </motion.div>
              )}
            </AnimatePresence>
            
          </motion.div>
        )}`;

code = code.replace(regex, newCarouselStage);
fs.writeFileSync('src/app/gift/[id]/page.js', code);
