const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// Replace isPublishing state
code = code.replace(/const \[isPublishing, setIsPublishing\] = useState\(false\);/, 
  `const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState("");`);

// Replace handlePublish function
const oldHandlePublishRegex = /const handlePublish = async \(\) => \{[\s\S]*?catch \(e\) \{[\s\S]*?setIsPublishing\(false\);\n    \}\n  \};/;

const newHandlePublish = `const handlePublish = async () => {
    if (!auth.currentUser) return router.push("/login");
    setIsPublishing(true);
    setPublishStatus("Starting...");
    
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timed out. If you added large photos, try connecting to a faster network.")), 180000));
      
      const publishTask = async () => {
        const isFreePromo = true; 

        let photoUrls = [];

        if (photos.length > 0) {
          setPublishStatus("Uploading " + photos.length + " photos...");
          const uploadPromises = photos.map(async (photo) => {
            const photoRef = ref(storage, \`gifts/\${auth.currentUser.uid}/photos/\${Date.now()}_\${photo.name}\`);
            const snapshot = await uploadBytes(photoRef, photo);
            return await getDownloadURL(snapshot.ref);
          });
          photoUrls = await Promise.all(uploadPromises);
        }

        let finalSongUrl = formData.songQuery;
        if (formData.songQuery === "upload" && audioFile) {
          setPublishStatus("Uploading audio...");
          const audioRef = ref(storage, \`gifts/\${auth.currentUser.uid}/audio_\${Date.now()}_\${audioFile.name}\`);
          const snapshot = await uploadBytes(audioRef, audioFile);
          finalSongUrl = await getDownloadURL(snapshot.ref);
        } else if (formData.songQuery === "upload") {
          finalSongUrl = "";
        }

        setPublishStatus("Saving to database...");
        let finalGiftId = editGiftId;
        
        if (editGiftId) {
          const docRef = doc(db, "gifts", editGiftId);
          await updateDoc(docRef, {
            ...formData,
            ...(photoUrls.length > 0 && { photoUrls }), 
            updatedAt: serverTimestamp(),
          });
          setPublishStatus("Done!");
          router.push('/my-gifts');
          return;
        } else {
          const docRef = await addDoc(collection(db, "gifts"), {
            ...formData,
            photoUrls, 
            creatorId: auth.currentUser.uid,
            creatorEmail: auth.currentUser.email || "",
            createdAt: serverTimestamp(),
            paid: isFreePromo 
          });
          finalGiftId = docRef.id;
          
          if (isFreePromo) {
            setPublishStatus("Redirecting...");
            router.push(\`/success?giftId=\${finalGiftId}\`);
            return;
          }
        }

        setPublishStatus("Initializing Payment...");
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftId: finalGiftId, recipientName: formData.recipientName, email: auth.currentUser?.email })
        });
        const data = await res.json();
        if (data.url) router.push(data.url);
        else throw new Error(data.error);
      };

      await Promise.race([publishTask(), timeoutPromise]);
    } catch (e) {
      console.error("Error publishing:", e);
      alert("Failed to save gift: " + e.message);
      setIsPublishing(false);
      setPublishStatus("");
    }
  };`;

code = code.replace(oldHandlePublishRegex, newHandlePublish);

// Replace button text
code = code.replace(/\{isPublishing \? <Loader2 className="w-5 h-5 animate-spin" \/> : <><Sparkles className="w-5 h-5" \/> Generate Link<\/>\}/, 
  `{isPublishing ? <><Loader2 className="w-5 h-5 animate-spin" /> {publishStatus}</> : <><Sparkles className="w-5 h-5" /> Generate Link</>}`);

fs.writeFileSync('src/app/dashboard/page.js', code);
