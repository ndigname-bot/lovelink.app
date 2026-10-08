const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

// replace the iframe block
const oldIframe = `            {/* Playable iframe Demo */}
            <iframe 
              src="/gift/demo-gift" 
              className="w-full h-full border-none bg-slate-100 dark:bg-black"
              title="Interactive Demo"
            />`;

const newIframe = `            {/* Playable iframe Demo */}
            <div className="w-full h-full flex flex-col relative">
              <iframe 
                src="/gift/demo-gift" 
                className="w-full h-full border-none bg-slate-100 dark:bg-black"
                title="Interactive Demo"
              />
              <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-white bg-black/50 p-2">
                If the demo above crashed, your connection is too slow for dynamic routing.
              </div>
            </div>`;

code = code.replace(oldIframe, newIframe);
fs.writeFileSync('src/app/page.js', code);
