const fs = require('fs');

function patchNav(filePath, isLanding) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Adjust padding from px-8 to px-4 md:px-8
  code = code.replace(/px-8 py-6/g, 'px-4 md:px-8 py-4 md:py-6');
  code = code.replace(/px-6 pt-6/g, 'px-4 md:px-8 pt-4 md:pt-6');
  code = code.replace(/p-6 flex/g, 'px-4 md:px-8 py-4 flex');

  // Adjust gap-4 md:gap-6 to gap-2 md:gap-6
  code = code.replace(/gap-4 md:gap-6/g, 'gap-2 md:gap-6');

  // Adjust Sign In button to whitespace-nowrap and smaller padding
  code = code.replace(
    'className="text-sm text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors"',
    'className="text-xs md:text-sm whitespace-nowrap text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors"'
  );

  // Adjust Start Building / New Gift button
  code = code.replace(
    'className="text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full hover:bg-slate-800 dark:hover:bg-gray-200 transition-colors shadow-lg"',
    'className="text-xs md:text-sm font-medium whitespace-nowrap bg-slate-900 text-white dark:bg-white dark:text-black px-3 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-slate-800 dark:hover:bg-gray-200 transition-colors shadow-lg"'
  );
  code = code.replace(
    'className="text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-full hover:bg-slate-800 dark:hover:bg-gray-200 transition-colors shadow-lg flex items-center gap-2"',
    'className="text-xs md:text-sm font-medium whitespace-nowrap bg-slate-900 text-white dark:bg-white dark:text-black px-3 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-slate-800 dark:hover:bg-gray-200 transition-colors shadow-lg flex items-center gap-1 md:gap-2"'
  );

  fs.writeFileSync(filePath, code);
}

patchNav('src/app/page.js', true);
patchNav('src/app/dashboard/page.js', false);
patchNav('src/app/my-gifts/page.js', false);
