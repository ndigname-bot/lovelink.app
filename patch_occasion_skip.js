const fs = require('fs');
let dash = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

dash = dash.replace(
  "onClick={() => updateForm('occasion', occ.id)}",
  "onClick={() => { updateForm('occasion', occ.id); if (occ.id === 'family' || occ.id === 'birthday') { updateForm('skipTrivia', true); } else { updateForm('skipTrivia', false); } }}"
);

fs.writeFileSync('src/app/dashboard/page.js', dash);
