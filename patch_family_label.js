const fs = require('fs');
let dash = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

dash = dash.replace(
  "{ id: 'family', name: 'Family', emoji: '👨‍👩‍👧' }",
  "{ id: 'family', name: 'Family (Time Capsule)', emoji: '🕰️' }"
);

// If we want a recommended badge
dash = dash.replace(
  '<span className="text-xs font-bold uppercase tracking-wider text-center">{occ.name}</span>',
  '<span className="text-xs font-bold uppercase tracking-wider text-center">{occ.name}</span>\n                      {occ.id === "family" && <span className="absolute -top-3 bg-pink-500 text-white text-[9px] px-2 py-1 rounded-full animate-bounce shadow-lg shadow-pink-500/50">Recommended</span>}'
);

fs.writeFileSync('src/app/dashboard/page.js', dash);
