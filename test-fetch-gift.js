const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

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
  try {
    const docRef = doc(db, "gifts", "aSGRg8THjEwucdGxrqbe");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log(JSON.stringify(docSnap.data(), null, 2));
    } else {
      console.log("Document does not exist!");
    }
  } catch (e) {
    console.error("Firebase Error:", e.message);
  }
  process.exit(0);
}

test();
