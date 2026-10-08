const fs = require('fs');
let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

const oldUnlock = `  const triggerUnlock = () => {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: styles.particles });
    setTimeout(() => setStage(1), 800);
  };`;

const newUnlock = `  const triggerUnlock = () => {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: styles.particles });
    const nextStage = giftData?.skipTrivia ? (giftData?.questions?.length || 2) + 1 : 1;
    setTimeout(() => setStage(nextStage), 800);
  };`;

code = code.replace(oldUnlock, newUnlock);
fs.writeFileSync('src/app/gift/[id]/page.js', code);
