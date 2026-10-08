const { initializeApp } = require("firebase/app");
const { getFirestore, collection, query, where, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDJtdVgaL8YKIzC5KlHcBuxuFw4OxMio6c",
  authDomain: "lovelink-81048.firebaseapp.com",
  projectId: "lovelink-81048",
  storageBucket: "lovelink-81048.firebasestorage.app",
  messagingSenderId: "456623557713",
  appId: "1:456623557713:web:7a7b8169296dcca1acfc70"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Starting DB getDocs test...");
  try {
    const q = query(collection(db, "gifts"), where("creatorId", "==", "test_user_id"));
    const querySnapshot = await getDocs(q);
    console.log("Success! Docs:", querySnapshot.size);
  } catch (e) {
    console.error("Firebase Error:", e.message);
  }
  process.exit(0);
}

test();
