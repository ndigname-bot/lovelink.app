const fs = require('fs');

let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

// Replace the hardcoded question parsing
const oldDraftRegex = /questions: \[\s*\{\s*question: draftData\.q1[\s\S]*?reward: "Best day of my life\. 🎉"\s*\}\s*\],/;
const newDraftQuestions = `questions: [
                ...(draftData.q1?.question ? [{ question: draftData.q1.question, type: draftData.q1.type, options: [{text:draftData.q1.correct, isCorrect:true}, {text:draftData.q1.wrong1, isCorrect:false}, {text:draftData.q1.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : []),
                ...(draftData.q2?.question ? [{ question: draftData.q2.question, type: draftData.q2.type, options: [{text:draftData.q2.correct, isCorrect:true}, {text:draftData.q2.wrong1, isCorrect:false}, {text:draftData.q2.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : []),
                ...(draftData.q3?.question ? [{ question: draftData.q3.question, type: draftData.q3.type, options: [{text:draftData.q3.correct, isCorrect:true}, {text:draftData.q3.wrong1, isCorrect:false}, {text:draftData.q3.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : []),
                ...(draftData.q4?.question ? [{ question: draftData.q4.question, type: draftData.q4.type, options: [{text:draftData.q4.correct, isCorrect:true}, {text:draftData.q4.wrong1, isCorrect:false}, {text:draftData.q4.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : [])
              ],`;
code = code.replace(oldDraftRegex, newDraftQuestions);

const oldDbRegex = /questions: \[\s*\{\s*question: dbData\.q1[\s\S]*?reward: "Amazing! 🎉"\s*\}\s*\],/;
const newDbQuestions = `questions: [
              ...(dbData.q1?.question ? [{ question: dbData.q1.question, type: dbData.q1.type, options: [{text:dbData.q1.correct, isCorrect:true}, {text:dbData.q1.wrong1, isCorrect:false}, {text:dbData.q1.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : []),
              ...(dbData.q2?.question ? [{ question: dbData.q2.question, type: dbData.q2.type, options: [{text:dbData.q2.correct, isCorrect:true}, {text:dbData.q2.wrong1, isCorrect:false}, {text:dbData.q2.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : []),
              ...(dbData.q3?.question ? [{ question: dbData.q3.question, type: dbData.q3.type, options: [{text:dbData.q3.correct, isCorrect:true}, {text:dbData.q3.wrong1, isCorrect:false}, {text:dbData.q3.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : []),
              ...(dbData.q4?.question ? [{ question: dbData.q4.question, type: dbData.q4.type, options: [{text:dbData.q4.correct, isCorrect:true}, {text:dbData.q4.wrong1, isCorrect:false}, {text:dbData.q4.wrong2, isCorrect:false}].filter(o=>o.text).sort(()=>Math.random()-0.5) }] : [])
            ],`;
code = code.replace(oldDbRegex, newDbQuestions);

// Now replace stage checks dynamically
code = code.replace(/if \(stage === 3 && giftData\?\.photoUrls\?\.length > 1\) \{/g, 'const qLen = giftData?.questions?.length || 2;\n    if (stage === qLen + 1 && giftData?.photoUrls?.length > 1) {');
code = code.replace(/\{\(stage === 1 \|\| stage === 2\) && !activeModal && \(/g, '{stage >= 1 && stage <= (giftData?.questions?.length || 2) && !activeModal && (');
code = code.replace(/\{stage === 3 && \(/g, '{stage === (giftData?.questions?.length || 2) + 1 && (');
code = code.replace(/\{stage === 4 && \(/g, '{stage === (giftData?.questions?.length || 2) + 2 && (');
code = code.replace(/\{stage === 5 && \(/g, '{stage === (giftData?.questions?.length || 2) + 3 && (');

fs.writeFileSync('src/app/gift/[id]/page.js', code);
