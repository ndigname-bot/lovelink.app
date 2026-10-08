const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

const oldPublish = `  const handlePublish = async () => {
    if (!auth.currentUser) return router.push("/login");
    setIsPublishing(true);
    try {
      // Freemium Logic: First 2 links are free
      const q = query(collection(db, "gifts"), where("creatorId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const isFreePromo = true; // Temporarily free for all testing`;

const newPublish = `  const handlePublish = async () => {
    if (!auth.currentUser) return router.push("/login");
    setIsPublishing(true);
    try {
      // Add strict timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Network timeout - please check your connection and disable adblockers")), 15000));
      
      const publishTask = async () => {
        const isFreePromo = true; // Temporarily free for all testing`;

code = code.replace(oldPublish, newPublish);

const oldSave = `      let finalGiftId = editGiftId;
      if (editGiftId) {
        const docRef = doc(db, "gifts", editGiftId);
        await updateDoc(docRef, {
          ...formData,
          ...(photoUrls.length > 0 && { photoUrls }), 
          updatedAt: serverTimestamp(),
        });
        window.location.href = '/my-gifts';
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
          window.location.href = \`/success?giftId=\${finalGiftId}\`;
          return;
        }
      }

      // Request Stripe Checkout Session
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: finalGiftId, recipientName: formData.recipientName, email: auth.currentUser?.email })
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start checkout: " + data.error);
        setIsPublishing(false);
      }
    } catch (e) {`;

const newSave = `      let finalGiftId = editGiftId;
      if (editGiftId) {
        const docRef = doc(db, "gifts", editGiftId);
        await updateDoc(docRef, {
          ...formData,
          ...(photoUrls.length > 0 && { photoUrls }), 
          updatedAt: serverTimestamp(),
        });
        window.location.href = '/my-gifts';
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
          window.location.href = \`/success?giftId=\${finalGiftId}\`;
          return;
        }
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: finalGiftId, recipientName: formData.recipientName, email: auth.currentUser?.email })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error);
    };

    await Promise.race([publishTask(), timeoutPromise]);
    } catch (e) {`;

code = code.replace(oldSave, newSave);
fs.writeFileSync('src/app/dashboard/page.js', code);
