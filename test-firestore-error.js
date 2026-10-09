const { initializeApp } = require('firebase/app');
const { getFirestore, addDoc, collection } = require('firebase/firestore');

const app = initializeApp({
  apiKey: "AIzaSyDJtdVgaL8YKIzC5KlHcBuxuFw4OxMio6c",
  projectId: "lovelink-81048",
});

const db = getFirestore(app);

(async () => {
  console.log("Starting addDoc...");
  const start = Date.now();
  try {
    await addDoc(collection(db, "gifts"), { test: 1 });
    console.log("Success!");
  } catch (e) {
    console.log("Error caught after", Date.now() - start, "ms:", e.message);
  }
  process.exit(0);
})();
