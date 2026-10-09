const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.js', 'utf8');

const replacement = `let db;
if (typeof window !== "undefined") {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
    });
  } catch (e) {
    db = getFirestore(app);
  }
} else {
  db = getFirestore(app);
}`;

code = code.replace(/let db;[\s\S]*?} else {[\s\S]*?}/, replacement);
fs.writeFileSync('src/lib/firebase.js', code);
