const fs = require('fs');
let dash = fs.readFileSync('src/app/dashboard/page.js', 'utf8');
dash = dash.replace(
  "className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ",
  "className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 "
);
fs.writeFileSync('src/app/dashboard/page.js', dash);
