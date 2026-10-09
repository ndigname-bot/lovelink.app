const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.js', 'utf8');

const oldInit = `    db = initializeFirestore(app, {
      localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
    });`;

const newInit = `    db = initializeFirestore(app, {
      localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}),
      experimentalForceLongPolling: true
    });`;

code = code.replace(oldInit, newInit);

const oldCatch = `  } catch (e) {
    db = getFirestore(app);
  }`;

const newCatch = `  } catch (e) {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true
    });
  }`;

code = code.replace(oldCatch, newCatch);

const oldElse = `} else {
  db = getFirestore(app);
}`;

const newElse = `} else {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true
  });
}`;

code = code.replace(oldElse, newElse);

fs.writeFileSync('src/lib/firebase.js', code);
