const fs = require('fs');
let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

// 1. Add Arrays for Intros and Cheeky Rewards at the top of the component
const componentStart = 'export default function GiftViewer({ params }) {';
const arraysToAdd = `
  const INTROS = [
    "You have a highly classified digital package from",
    "Someone has been thinking about you a lot... Sender:",
    "Warning: The following message might cause uncontrollable smiling. Sender:",
    "Top Secret clearance required. Authorized by:"
  ];

  const CHEEKY_REWARDS = [
    "Damn right you know it 😉",
    "Okay, I see you... 😏",
    "Lucky guess... or maybe you just love me too much 🙄❤️",
    "You passed the test... this time. 💅",
    "I knew you were obsessed with me. 😂❤️",
    "Look at you, paying attention and stuff! 👏"
  ];
`;
if (!code.includes('CHEEKY_REWARDS')) {
  code = code.replace(componentStart, componentStart + arraysToAdd);
}

// 2. Replace the Suspense Text with the randomized array based on giftId length (to keep it consistent per link but random across links)
const oldSuspense = '<h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light leading-relaxed mb-6`}>\n              You have a classified digital package from <span className={`${styles.accentText} font-semibold`}>{giftData.creatorName}</span>.\n            </h1>';

const newSuspense = '<h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light leading-relaxed mb-6`}>\n              {INTROS[(giftId?.length || 0) % INTROS.length]} <span className={`${styles.accentText} font-semibold`}>{giftData.creatorName}</span>.\n            </h1>';

code = code.replace(oldSuspense, newSuspense);

// 3. Replace the Reward text with a cheeky one
const oldReward = '<p className="text-xl opacity-90 mb-10 leading-relaxed font-medium">"{giftData.questions[stage-1].reward || \\"You know me so well! ❤️\\"}"</p>';
// The literal in the file is '"You know me so well! ❤️"'
const oldReward2 = '<p className="text-xl opacity-90 mb-10 leading-relaxed font-medium">"{giftData.questions[stage-1].reward || "You know me so well! ❤️"}"</p>';

const newReward = '<p className="text-xl opacity-90 mb-10 leading-relaxed font-medium">"{giftData.questions[stage-1].reward || CHEEKY_REWARDS[(stage + (giftId?.length || 0)) % CHEEKY_REWARDS.length]}"</p>';

code = code.replace(oldReward, newReward);
code = code.replace(oldReward2, newReward); // Just in case

fs.writeFileSync('src/app/gift/[id]/page.js', code);
