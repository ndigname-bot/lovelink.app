const fs = require('fs');
let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

const regex = /<\/div>\s*<\/motion\.div>\s*\)\}\s*\{activeModal === "reward"/;

const replacement = `</div>
              <button onClick={() => nextStage()} className="mt-8 text-sm text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors underline underline-offset-4 decoration-slate-300 dark:decoration-gray-600">
                Skip this question
              </button>
            </motion.div>
        )}

        {activeModal === "reward"`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/gift/[id]/page.js', code);
