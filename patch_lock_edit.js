const fs = require('fs');
let dash = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// Lock Occasion buttons
const occButtonSearch = "onClick={() => updateForm('occasion', occ.id)}";
const occButtonReplace = "onClick={() => updateForm('occasion', occ.id)} disabled={isEditing}";
dash = dash.replace(occButtonSearch, occButtonReplace);

// Add locked text for Occasion
const occHeaderSearch = '<h2 className="text-xl font-bold mb-1">Occasion & Details</h2>';
const occHeaderReplace = '<h2 className="text-xl font-bold mb-1">Occasion & Details</h2>\n              {isEditing && <p className="text-sm text-red-500 font-medium mb-2">Occasion and Recipient Name are locked for active links.</p>}';
dash = dash.replace(occHeaderSearch, occHeaderReplace);

// Lock Recipient Name input
const repNameSearch = '<input type="text" value={formData.recipientName} onChange={(e) => updateForm(\'recipientName\', e.target.value)} placeholder="e.g. Sarah" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none" />';
const repNameReplace = '<input type="text" value={formData.recipientName} onChange={(e) => updateForm(\'recipientName\', e.target.value)} disabled={isEditing} placeholder="e.g. Sarah" className={`w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none ${isEditing ? "opacity-60 cursor-not-allowed" : ""}`} />';
dash = dash.replace(repNameSearch, repNameReplace);

// Let's also add opacity to the locked occasion buttons
const occClassSearch = "className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.occasion === occ.id ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400 shadow-md' : 'border-slate-200 dark:border-white/10 hover:border-pink-500/50 bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300'}`}";
const occClassReplace = "className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.occasion === occ.id ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400 shadow-md' : 'border-slate-200 dark:border-white/10 hover:border-pink-500/50 bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300'} ${isEditing && formData.occasion !== occ.id ? 'opacity-30 cursor-not-allowed hidden md:flex' : ''}`}";
dash = dash.replace(occClassSearch, occClassReplace);

fs.writeFileSync('src/app/dashboard/page.js', dash);
