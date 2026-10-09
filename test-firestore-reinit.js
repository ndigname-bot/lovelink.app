const { initializeApp, getApps } = require("firebase/app");
const { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDJtdVgaL8YKIzC5KlHcBuxuFw4OxMio6c",
  projectId: "lovelink-81048",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}),
    experimentalForceLongPolling: true
  });
  console.log("First init success");
} catch (e) {
  console.error("First init failed", e.message);
}

try {
  // Simulate hot reload or second import
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}),
    experimentalForceLongPolling: true
  });
  console.log("Second init success");
} catch (e) {
  console.error("Second init failed:", e.message);
}
