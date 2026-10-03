const fs = require('fs');
let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

code = code.replace(
  '<h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light mb-16 text-center`}>Why I love you...</h1>',
  '<h1 className={`text-3xl md:text-5xl ${styles.font} italic opacity-90 font-light mb-16 text-center`}>{giftData?.occasion === "proposal" ? "My Promises to You..." : giftData?.occasion === "birthday" ? "My Birthday Wishes..." : giftData?.occasion === "family" ? "Things I Appreciate About You..." : "Why I love you..."}</h1>'
);

fs.writeFileSync('src/app/gift/[id]/page.js', code);
