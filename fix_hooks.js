const fs = require('fs');
let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

// 1. Remove the tick and useEffect from their current location
const oldTimeCapsuleHook = `  // Time Capsule Sequence Logic
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (stage === 'tc_1') {
      let t = 0;
      const interval = setInterval(() => {
        t++;
        setTick(t);
        if (t === 2) {
          clearInterval(interval);
          setTimeout(() => setStage('tc_2'), 1500);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else if (stage === 'tc_2') {
      setTimeout(() => setStage('tc_3'), 5000);
    } else if (stage === 'tc_3') {
      let t = 0;
      setTick(0);
      const interval = setInterval(() => {
        t++;
        setTick(t);
        if (t === 3) {
          clearInterval(interval);
          setTimeout(() => setStage((giftData?.questions ? giftData.questions.length : 0) + 1), 1500);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stage, giftData]);`;

code = code.replace(oldTimeCapsuleHook, '');

// 2. Insert it RIGHT BEFORE the early return
const earlyReturn = `  if (!giftData) return <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center"><Heart className="w-10 h-10 text-pink-500 animate-pulse" /></div>;`;

code = code.replace(earlyReturn, oldTimeCapsuleHook + '\n\n' + earlyReturn);

fs.writeFileSync('src/app/gift/[id]/page.js', code);
