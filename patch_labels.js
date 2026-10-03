const fs = require('fs');
let dashCode = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

dashCode = dashCode.replace(
  '<label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-pink-400" /> Final Love Letter</label>',
  '<label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-pink-400" /> {formData.occasion === "proposal" ? "The Big Proposal Letter" : "Final Love Letter"}</label>'
);
fs.writeFileSync('src/app/dashboard/page.js', dashCode);

let giftCode = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');
giftCode = giftCode.replace(
  'className="w-full max-w-2xl text-center z-10 flex flex-col items-center px-4"',
  'className="w-full max-w-2xl text-center z-10 flex flex-col items-center px-4 relative"'
);
// add a huge dark gradient if it's the proposal stage
giftCode = giftCode.replace(
  '<motion.div key="proposal" initial={{opacity:0, scale:0.9, y: 50}} animate={{opacity:1, scale:1, y: 0}} exit={{opacity:0, scale:1.1}} transition={{duration:2}} className="w-full max-w-2xl text-center z-10 flex flex-col items-center px-4 relative">',
  `<motion.div key="proposal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:2}} className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{opacity:0, scale:0.9, y: 50}} animate={{opacity:1, scale:1, y: 0}} transition={{delay: 1, duration:2}} className="flex flex-col items-center w-full max-w-2xl">`
);
giftCode = giftCode.replace(
  `          </motion.div>
        )}

        {stage === (giftData?.questions?.length || 2) + (giftData?.occasion === 'proposal' ? 5 : 4) && (`,
  `            </motion.div>
          </motion.div>
        )}

        {stage === (giftData?.questions?.length || 2) + (giftData?.occasion === 'proposal' ? 5 : 4) && (`
);

fs.writeFileSync('src/app/gift/[id]/page.js', giftCode);
