const fs = require('fs');
let dash = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// 1. Add skipTrivia to default formData
dash = dash.replace(
  'q4: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },',
  'skipTrivia: false,\n    q4: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "" },'
);

// Add it to loadedData in fetchGift
dash = dash.replace(
  'q4: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "", ...data.q4 },',
  'skipTrivia: data.skipTrivia || false,\n              q4: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "", ...data.q4 },'
);

// 2. Add the Toggle UI to Step 2
const qTitleSearch = '<h3 className="font-bold text-lg flex items-center gap-2"><Lock className="w-5 h-5 text-pink-500" /> Trivia Question {index + 1}</h3>';
if (!dash.includes('skipTriviaToggle')) {
  dash = dash.replace(
    '{[\'q1\', \'q2\', \'q3\', \'q4\'].map((qId, index) => (',
    `{/* Skip Trivia Toggle */}
              <div className="flex items-center justify-between p-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl cursor-pointer hover:border-pink-500/50 transition-colors" onClick={() => updateForm('skipTrivia', !formData.skipTrivia)} id="skipTriviaToggle">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-pink-500" /> Skip Trivia Section</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">If enabled, your recipient will go straight to the photos without answering questions.</p>
                </div>
                <div className={\`w-12 h-6 rounded-full flex items-center p-1 transition-colors \${formData.skipTrivia ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-700'}\`}>
                  <div className={\`w-4 h-4 bg-white rounded-full transition-transform \${formData.skipTrivia ? 'translate-x-6' : 'translate-x-0'}\`} />
                </div>
              </div>

              {!formData.skipTrivia && ['q1', 'q2', 'q3', 'q4'].map((qId, index) => (`
  );
  // Add closing bracket for the map condition
  dash = dash.replace(
    '</div>\n              ))}</div>',
    '</div>\n              ))}\n              </div>'
  ); // Need to be careful. Let's just do a regex replace for the end of the map
}

fs.writeFileSync('src/app/dashboard/page.js', dash);
