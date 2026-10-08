const fs = require('fs');
let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

// 1. Add skipTrivia to setGiftData
code = code.replace(
  'theme: dbData.theme || "blush",',
  'skipTrivia: dbData.skipTrivia || false,\n            theme: dbData.theme || "blush",'
);

code = code.replace(
  'theme: draftData.theme || "blush",',
  'skipTrivia: draftData.skipTrivia || false,\n              theme: draftData.theme || "blush",'
);

// 2. Fix the qLen logic everywhere. (giftData?.questions?.length || 2) -> (giftData?.questions ? giftData.questions.length : 2)
// Actually, giftData.questions is always an array because of how it's constructed, so giftData.questions.length is 0.
// Let's replace `(giftData?.questions?.length || 2)` with `(giftData?.questions?.length ?? 0)` or similar.
// Wait, for demo gifts, we use the fallback object, which has length 2.
// Let's replace `(giftData?.questions?.length || 2)` with `(giftData?.questions ? giftData.questions.length : 0)`
// Because if length is 0, `|| 2` makes it 2! Which breaks everything.
code = code.replace(/\(giftData\?\.questions\?\.length \|\| 2\)/g, '(giftData?.questions ? giftData.questions.length : 0)');

fs.writeFileSync('src/app/gift/[id]/page.js', code);
