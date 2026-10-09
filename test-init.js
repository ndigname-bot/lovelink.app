const { initializeApp } = require('firebase/app');
const { initializeFirestore, persistentLocalCache } = require('firebase/firestore');

const app = initializeApp({
  apiKey: "AIzaSyDJtdVgaL8YKIzC5KlHcBuxuFw4OxMio6c",
  projectId: "lovelink-81048",
});

try {
  const db = initializeFirestore(app, {
    experimentalForceLongPolling: true
  });
  console.log("Success 1");
} catch(e) {
  console.error("Error 1:", e.message);
}
