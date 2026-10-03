const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// Replace all <option with <option className="bg-white dark:bg-[#111] text-slate-900 dark:text-white"
code = code.replace(/<option value/g, '<option className="bg-white dark:bg-[#111] text-slate-900 dark:text-white" value');
code = code.replace(/<option key=\{idx\} value/g, '<option className="bg-white dark:bg-[#111] text-slate-900 dark:text-white" key={idx} value');

fs.writeFileSync('src/app/dashboard/page.js', code);
