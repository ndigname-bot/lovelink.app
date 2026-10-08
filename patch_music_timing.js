const fs = require('fs');
let viewer = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

viewer = viewer.replace(
  '{stage >= 1 && (\n        <>\n          {(!giftData?.songQuery',
  '{stage >= -1 && (\n        <>\n          {(!giftData?.songQuery'
);

viewer = viewer.replace(
  '{stage >= 0 && (\n        <motion.div initial={{y:-50, opacity:0}} animate={{y:0, opacity:1}} className={`absolute top-6 left-1/2 -translate-x-1/2 ${styles.glass} ${styles.border} px-4 py-2 rounded-full border flex items-center gap-2 z-50`}>',
  '{stage >= -1 && (\n        <motion.div initial={{y:-50, opacity:0}} animate={{y:0, opacity:1}} className={`absolute top-6 left-1/2 -translate-x-1/2 ${styles.glass} ${styles.border} px-4 py-2 rounded-full border flex items-center gap-2 z-50`}>'
);

fs.writeFileSync('src/app/gift/[id]/page.js', viewer);
