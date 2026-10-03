const fs = require('fs');

let dashCode = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// Update Firestore imports to include query functions
dashCode = dashCode.replace(
  /import { collection, addDoc, serverTimestamp } from "firebase\/firestore";/,
  'import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";'
);

// Remove hardcoded IS_LAUNCH_PROMO
dashCode = dashCode.replace('const IS_LAUNCH_PROMO = false;', '');

const publishRegex = /(const handlePublish = async \(\) => {\n    if \(!auth\.currentUser\) return router\.push\("\/login"\);\n    setIsPublishing\(true\);\n    try {)/;

const newPublishLogic = `$1
      // Freemium Logic: First 2 links are free
      const q = query(collection(db, "gifts"), where("creatorId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const isFreePromo = querySnapshot.size < 2;
`;
dashCode = dashCode.replace(publishRegex, newPublishLogic);


// Replace the document creation paid flag and success redirect
const oldDocLogic = `        creatorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        paid: IS_LAUNCH_PROMO ? true : false 
      });

      if (IS_LAUNCH_PROMO) {
        window.location.href = \`/success?giftId=\${docRef.id}\`;
        return;
      }`;

const newDocLogic = `        creatorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        paid: isFreePromo 
      });

      if (isFreePromo) {
        window.location.href = \`/success?giftId=\${docRef.id}\`;
        return;
      }`;

dashCode = dashCode.replace(oldDocLogic, newDocLogic);

fs.writeFileSync('src/app/dashboard/page.js', dashCode);
