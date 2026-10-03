const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');
css = css.replace(
  /.dark \{([\s\S]*?)\}/,
  '.dark {\n  --background: #0a0a0a;\n  --foreground: #ededed;\n  color-scheme: dark;\n}'
);

fs.writeFileSync('src/app/globals.css', css);

