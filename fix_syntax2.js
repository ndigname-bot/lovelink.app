const fs = require('fs');
let gift = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');
gift = gift.replace(/\\"You know me so well! ❤️\\"/g, '"You know me so well! ❤️"');
fs.writeFileSync('src/app/gift/[id]/page.js', gift);
