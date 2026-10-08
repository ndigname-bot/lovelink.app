const fs = require('fs');
let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

// Fix qLen logic bug
code = code.replace(
  'const qLen = giftData?.questions?.length || 2;',
  'const qLen = giftData?.questions ? giftData.questions.length : 0;'
);

// Fix Memory Lane empty photos bug
const oldMemoryLane = `  useEffect(() => {
    const qLen = giftData?.questions?.length || 2;
    if (stage === qLen + 1 && giftData?.photoUrls?.length > 0) {
      let currentPhoto = 0;
      
      const runSequence = () => {
        if (currentPhoto < giftData.photoUrls.length - 1) {
          currentPhoto++;
          setActivePhoto(currentPhoto);
          setTimeout(runSequence, 3000); // Pause for 3s on each photo
        } else {
          // Trigger the crazy spin out after the last photo
          setTimeout(() => {
            setIsSpinningOut(true);
            
            // Wait for crazy spin to finish, then go to next stage
            setTimeout(() => {
              setIsSpinningOut(false);
              setStage(prev => prev + 1);
            }, 1500);
          }, 3000);
        }
      };
      
      const timer = setTimeout(runSequence, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage, giftData?.photoUrls?.length]);`;

const newMemoryLane = `  useEffect(() => {
    const qLen = giftData?.questions ? giftData.questions.length : 0;
    if (stage === qLen + 1) {
      if (!giftData?.photoUrls || giftData.photoUrls.length === 0) {
        // If no photos, skip memory lane entirely
        setStage(prev => prev + 1);
        return;
      }
      
      let currentPhoto = 0;
      let activeTimer;
      
      const runSequence = () => {
        if (currentPhoto < giftData.photoUrls.length - 1) {
          currentPhoto++;
          setActivePhoto(currentPhoto);
          activeTimer = setTimeout(runSequence, 3000);
        } else {
          activeTimer = setTimeout(() => {
            setIsSpinningOut(true);
            setTimeout(() => {
              setIsSpinningOut(false);
              setStage(prev => prev + 1);
            }, 1500);
          }, 3000);
        }
      };
      
      activeTimer = setTimeout(runSequence, 3000);
      return () => clearTimeout(activeTimer);
    }
  }, [stage, giftData]);`;

code = code.replace(oldMemoryLane, newMemoryLane);

// Ensure memory lane render handles empty correctly
const oldMemoryRender = `{giftData?.photoUrls?.length > 0 && (
                    <motion.div`;
const newMemoryRender = `{(giftData?.photoUrls && giftData.photoUrls.length > 0) && (
                    <motion.div`;
code = code.replace(oldMemoryRender, newMemoryRender);

fs.writeFileSync('src/app/gift/[id]/page.js', code);
