const fs = require('fs');

// --- Patch dashboard/page.js ---
let dashCode = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// 1. Add occasion to formData
dashCode = dashCode.replace(
  'theme: "blush",',
  'occasion: "standard",\n    theme: "blush",'
);

// 2. Add Occasion UI to Step 1
const oldThemesEnd = `                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">`;
              
const newThemesEnd = `                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/10">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-300">What is the occasion?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { id: 'standard', name: 'Just Because', emoji: '💌' },
                    { id: 'birthday', name: 'Birthday', emoji: '🎂' },
                    { id: 'anniversary', name: 'Anniversary', emoji: '🥂' },
                    { id: 'proposal', name: 'Proposal', emoji: '💍' }
                  ].map(occ => (
                    <button 
                      key={occ.id} 
                      onClick={() => updateForm('occasion', occ.id)}
                      className={\`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 \${formData.occasion === occ.id ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400 shadow-md' : 'border-slate-200 dark:border-white/10 hover:border-pink-500/50 bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300'}\`}
                    >
                      <span className="text-2xl">{occ.emoji}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-center">{occ.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">`;
dashCode = dashCode.replace(oldThemesEnd, newThemesEnd);

// 3. Update Step 3 text based on occasion
dashCode = dashCode.replace(
  '<label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400" /> 3 Reasons I Love You</label>',
  '<label className="text-sm font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-400" /> {formData.occasion === "proposal" ? "3 Promises For Our Future" : formData.occasion === "birthday" ? "3 Birthday Wishes" : "3 Reasons I Love You"}</label>'
);
dashCode = dashCode.replace(
  /placeholder=\{\`Reason \$\{i\+1\}\.\.\. \(e\.g\. Your beautiful smile\)\`\}/g,
  `placeholder={\`\${formData.occasion === "proposal" ? "Promise" : formData.occasion === "birthday" ? "Wish" : "Reason"} \${i+1}... (e.g. \${formData.occasion === "proposal" ? "I promise to always listen" : "Your beautiful smile"})\`}`
);

fs.writeFileSync('src/app/dashboard/page.js', dashCode);
