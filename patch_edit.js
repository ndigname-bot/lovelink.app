const fs = require('fs');

// PATCH MY GIFTS PAGE
let myGifts = fs.readFileSync('src/app/my-gifts/page.js', 'utf8');
if (!myGifts.includes('Edit3')) {
  myGifts = myGifts.replace('from "lucide-react";', ', Edit3 } from "lucide-react";');
}
const oldButtons = `<button onClick={() => copyToClipboard(gift.id)} className="flex-1 flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/20 py-2 rounded-xl text-sm font-medium transition-colors">
                              <LinkIcon className="w-4 h-4" /> Copy Link
                            </button>
                            <Link href={\`/gift/\${gift.id}\`} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-pink-500/20">
                              View <ExternalLink className="w-4 h-4" />
                            </Link>`;
const newButtons = `<button onClick={() => copyToClipboard(gift.id)} className="flex-1 flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/20 py-2 rounded-xl text-sm font-medium transition-colors" title="Copy Link">
                              <LinkIcon className="w-4 h-4" /> <span className="hidden sm:inline">Copy</span>
                            </button>
                            <Link href={\`/dashboard?edit=\${gift.id}\`} className="flex-1 flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/20 py-2 rounded-xl text-sm font-medium transition-colors" title="Edit Gift">
                              <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">Edit</span>
                            </Link>
                            <Link href={\`/gift/\${gift.id}\`} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-pink-500/20 text-white" title="View Live">
                              <ExternalLink className="w-4 h-4" /> <span className="hidden sm:inline">View</span>
                            </Link>`;
myGifts = myGifts.replace(oldButtons, newButtons);
fs.writeFileSync('src/app/my-gifts/page.js', myGifts);

// PATCH DASHBOARD PAGE
let dash = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// 1. imports
if (!dash.includes('useSearchParams')) {
  dash = dash.replace('useRouter } from "next/navigation";', 'useRouter, useSearchParams } from "next/navigation";');
}
dash = dash.replace('import { doc, setDoc', 'import { doc, setDoc, getDoc, updateDoc');

// 2. Add searchParams check
const stateBlock = `  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);`;

const newBlock = `  const router = useRouter();
  const searchParams = useSearchParams();
  const editGiftId = searchParams.get('edit');
  const [isEditing, setIsEditing] = useState(false);

  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);`;
dash = dash.replace(stateBlock, newBlock);

// 3. Add useEffect to fetch existing gift
const fetchHook = `  useEffect(() => {
    if (editGiftId && auth.currentUser) {
      const fetchGift = async () => {
        setIsEditing(true);
        try {
          const docRef = doc(db, "gifts", editGiftId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().creatorId === auth.currentUser.uid) {
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
              q4: { type: "multiple_choice", question: "", correct: "", wrong1: "", wrong2: "", ...data.q4 },
              letter: data.letter || "",
            };
            setFormData(loadedData);
            if (data.photoUrls) setPhotoPreviews(data.photoUrls);
          }
        } catch(e) { console.error(e); }
        setIsEditing(false);
      };
      fetchGift();
    }
  }, [editGiftId, auth.currentUser]);`;

dash = dash.replace('  useEffect(() => {', fetchHook + '\n\n  useEffect(() => {');

// 4. Modify handlePublish to use updateDoc if editing!
const publishLogic = `        // Create Document Reference
        const newGiftRef = doc(collection(db, "gifts"));
        const giftId = newGiftRef.id;

        await setDoc(newGiftRef, {
          ...formData,
          photoUrls: finalPhotoUrls,
          creatorId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          paid: isFreePromo ? true : false,
          views: 0
        });

        // Store locally to persist while navigating
        localStorage.setItem('lovelink_draft_id', giftId);

        if (isFreePromo) {
          router.push(\`/success?giftId=\${giftId}\`);
        } else {
          router.push(\`/api/checkout?giftId=\${giftId}\`);
        }`;

const newPublishLogic = `        let giftId = editGiftId;
        if (editGiftId) {
          // UPDATE
          const docRef = doc(db, "gifts", editGiftId);
          await updateDoc(docRef, {
            ...formData,
            ...(finalPhotoUrls.length > 0 && { photoUrls: finalPhotoUrls }),
            updatedAt: serverTimestamp(),
          });
          router.push('/my-gifts');
        } else {
          // Create Document Reference
          const newGiftRef = doc(collection(db, "gifts"));
          giftId = newGiftRef.id;

          await setDoc(newGiftRef, {
            ...formData,
            photoUrls: finalPhotoUrls,
            creatorId: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            paid: isFreePromo ? true : false,
            views: 0
          });

          // Store locally to persist while navigating
          localStorage.setItem('lovelink_draft_id', giftId);

          if (isFreePromo) {
            router.push(\`/success?giftId=\${giftId}\`);
          } else {
            router.push(\`/api/checkout?giftId=\${giftId}\`);
          }
        }`;
dash = dash.replace(publishLogic, newPublishLogic);

fs.writeFileSync('src/app/dashboard/page.js', dash);
