const fs = require('fs');

// Patch dashboard
let dashCode = fs.readFileSync('src/app/dashboard/page.js', 'utf8');
const oldDashNav = `<Link href="/my-gifts" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors">My Links</Link>`;
const newDashNav = `<Link href="/my-gifts" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors">My Links</Link>
          <Link href="/inbox" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1">Inbox <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div></Link>`;
dashCode = dashCode.replace(oldDashNav, newDashNav);
fs.writeFileSync('src/app/dashboard/page.js', dashCode);

// Patch my-gifts
let myGiftsCode = fs.readFileSync('src/app/my-gifts/page.js', 'utf8');
const oldMyGiftsNav = `<ThemeToggle />
          <button onClick={() => auth.signOut()}`;
const newMyGiftsNav = `<ThemeToggle />
          <Link href="/inbox" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1">Inbox <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div></Link>
          <button onClick={() => auth.signOut()}`;
myGiftsCode = myGiftsCode.replace(oldMyGiftsNav, newMyGiftsNav);
fs.writeFileSync('src/app/my-gifts/page.js', myGiftsCode);

