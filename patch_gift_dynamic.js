const fs = require('fs');

let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

// 1. Update fetchGiftData logic
const parseQuestionsFn = `const parseQuestions = (data) => {
              const qs = [];
              if (data.q1?.question) qs.push({
                  question: data.q1.question,
                  type: data.q1.type || "multiple_choice",
                  options: [{ text: data.q1.correct, isCorrect: true }, { text: data.q1.wrong1, isCorrect: false }, { text: data.q1.wrong2, isCorrect: false }].filter(o => o.text).sort(() => Math.random() - 0.5),
              });
              if (data.q2?.question) qs.push({
                  question: data.q2.question,
                  type: data.q2.type || "multiple_choice",
                  options: [{ text: data.q2.correct, isCorrect: true }, { text: data.q2.wrong1, isCorrect: false }, { text: data.q2.wrong2, isCorrect: false }].filter(o => o.text).sort(() => Math.random() - 0.5),
              });
              if (data.q3?.question) qs.push({
                  question: data.q3.question,
                  type: data.q3.type || "multiple_choice",
                  options: [{ text: data.q3.correct, isCorrect: true }, { text: data.q3.wrong1, isCorrect: false }, { text: data.q3.wrong2, isCorrect: false }].filter(o => o.text).sort(() => Math.random() - 0.5),
              });
              if (data.q4?.question) qs.push({
                  question: data.q4.question,
                  type: data.q4.type || "multiple_choice",
                  options: [{ text: data.q4.correct, isCorrect: true }, { text: data.q4.wrong1, isCorrect: false }, { text: data.q4.wrong2, isCorrect: false }].filter(o => o.text).sort(() => Math.random() - 0.5),
              });
              return qs.length > 0 ? qs : [
                { question: "Where is our dream vacation? ✈️", options: [{ text: "Japan 🇯🇵", isCorrect: true }, { text: "Paris", isCorrect: false }, { text: "China", isCorrect: false }] },
                { question: "How does my love connect with yours? 💧", options: [{ text: "Like a river into your ocean", isCorrect: true }, { text: "Like ice melting", isCorrect: false }, { text: "Like a pond", isCorrect: false }] }
              ];
            };`;

// Let's replace the fetchGiftData parsing.
// Actually, it's easier to regex the draftData and dbData blocks, but simpler to just write the new fetchGiftData entirely.
