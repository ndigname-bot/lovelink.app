const { initializeApp } = require('firebase/app');
const { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } = require('firebase/firestore');

const app = initializeApp({
  apiKey: "AIzaSyDJtdVgaL8YKIzC5KlHcBuxuFw4OxMio6c",
  projectId: "lovelink-81048",
});

try {
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}),
    experimentalForceLongPolling: true
  });
  console.log("Success with both!");
} catch(e) {
  console.error("Error with both:", e.message);
}
