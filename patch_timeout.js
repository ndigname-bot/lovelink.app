const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

const oldTimeout = `      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Network timeout - please check your connection and disable adblockers")), 15000));
      
      await Promise.race([publishTask(), timeoutPromise]);`;

const newTimeout = `      // Increased timeout to 3 minutes to allow for large photo uploads
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timed out. If you added large photos, try connecting to a faster network.")), 180000));
      
      await Promise.race([publishTask(), timeoutPromise]);`;

code = code.replace(oldTimeout, newTimeout);
fs.writeFileSync('src/app/dashboard/page.js', code);
