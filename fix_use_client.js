const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

code = code.replace('import imageCompression from "browser-image-compression";\n"use client";', '"use client";\nimport imageCompression from "browser-image-compression";');

fs.writeFileSync('src/app/dashboard/page.js', code);
