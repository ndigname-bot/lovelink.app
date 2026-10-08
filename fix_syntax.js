const fs = require('fs');

let myGifts = fs.readFileSync('src/app/my-gifts/page.js', 'utf8');
myGifts = myGifts.replace('} , Edit3 } from "lucide-react";', ', Edit3 } from "lucide-react";');
fs.writeFileSync('src/app/my-gifts/page.js', myGifts);

let gift = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');
gift = gift.replace('} from "firebase/firestore";\\n\\nconst PRESET_SONGS = [', '} from "firebase/firestore";\n\nconst PRESET_SONGS = [');
fs.writeFileSync('src/app/gift/[id]/page.js', gift);
