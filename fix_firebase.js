const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.js', 'utf8');

code = code.replace(/} else {\n  db = getFirestore\(app\);\n}\);\n}/, `} else {
  db = getFirestore(app);
}`);
fs.writeFileSync('src/lib/firebase.js', code);
