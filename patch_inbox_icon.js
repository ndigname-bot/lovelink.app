const fs = require('fs');
let myGifts = fs.readFileSync('src/app/my-gifts/page.js', 'utf8');

// Ensure Mail is imported
if (!myGifts.includes('Mail')) {
  myGifts = myGifts.replace('Edit3 }', 'Edit3, Mail }');
}

// Replace the Inbox text link with a Mail icon
const oldInboxLink = '<Link href="/inbox" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1">Inbox <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div></Link>';

const newInboxLink = `<Link href="/inbox" className="relative p-2 text-slate-500 hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400 transition-colors" title="Inbox">
            <Mail className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse border-2 border-white dark:border-[#0a0a0a]"></span>
          </Link>`;

myGifts = myGifts.replace(oldInboxLink, newInboxLink);
fs.writeFileSync('src/app/my-gifts/page.js', myGifts);
