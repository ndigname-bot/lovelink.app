const { initializeApp } = require('firebase/app');
const { getFirestore, updateDoc, doc } = require('firebase/firestore');

const app = initializeApp({
  apiKey: "AIzaSyDJtdVgaL8YKIzC5KlHcBuxuFw4OxMio6c",
  projectId: "lovelink-81048",
});

const db = getFirestore(app);

(async () => {
  const start = Date.now();
  try {
    console.log("Updating fake doc...");
    await updateDoc(doc(db, "gifts", "FAKE_ID_12345"), { test: 1 });
    console.log("Success!");
  } catch (e) {
    console.log("Error caught after", Date.now() - start, "ms:", e.message);
  }
  process.exit(0);
})();
