const fs = require('fs');
let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

const targetSuspense = `<h1 className={\`text-3xl md:text-5xl \${styles.font} italic opacity-90 font-light leading-relaxed mb-6\`}>
              I made something <br/><span className={\`\${styles.accentText} font-semibold\`}>special</span> just for you.
            </h1>`;

const newSuspense = `<h1 className={\`text-3xl md:text-5xl \${styles.font} italic opacity-90 font-light leading-relaxed mb-6\`}>
              You have a classified digital package from <span className={\`\${styles.accentText} font-semibold\`}>{giftData.creatorName}</span>.
            </h1>
            <p className="text-lg opacity-80 mb-8 font-medium">But before you can open it, you must prove your identity.</p>`;

code = code.replace(targetSuspense, newSuspense);

fs.writeFileSync('src/app/gift/[id]/page.js', code);
