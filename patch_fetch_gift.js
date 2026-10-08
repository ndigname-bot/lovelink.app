const fs = require('fs');
let dash = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

const regex = /useEffect\(\(\) => \{\s*if \(editGiftId && auth\.currentUser\) \{\s*const fetchGift = async \(\) => \{[\s\S]*?\}\s*fetchGift\(\);\s*\}\s*\}, \[editGiftId, auth\.currentUser\]\);/;

const replacement = `useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && editGiftId) {
        const fetchGift = async () => {
          setIsEditing(true);
          try {
            const docRef = doc(db, "gifts", editGiftId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().creatorId === user.uid) {
              const data = docSnap.data();
              const loadedData = {
                theme: data.theme || "blush",
                occasion: data.occasion || "standard",
                recipientName: data.recipientName || "",
                creatorName: data.creatorName || "",
                songQuery: data.songQuery || "",
                photoCaptions: data.photoCaptions || [],
                reasons: data.reasons || ["", "", ""],
                q1: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "", ...data.q1 },
                q2: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "", ...data.q2 },
                q3: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "", ...data.q3 },
                skipTrivia: data.skipTrivia || false,
                q4: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "", ...data.q4 },
                letter: data.letter || "",
              };
              setFormData(loadedData);
              if (data.photoUrls) setPhotoPreviews(data.photoUrls);
              
              // Automatically jump to Step 2 if editing, since Step 1 is mostly locked names
              setStep(2);
            }
          } catch(e) { console.error(e); }
          setIsEditing(false);
        };
        fetchGift();
      }
    });
    return () => unsubscribe();
  }, [editGiftId]);`;

dash = dash.replace(regex, replacement);

fs.writeFileSync('src/app/dashboard/page.js', dash);
