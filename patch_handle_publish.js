const fs = require('fs');
let dash = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

const oldSave = `      // Save to Firestore
      const docRef = await addDoc(collection(db, "gifts"), {
        ...formData,
        photoUrls, 
        creatorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        paid: isFreePromo 
      });

      if (isFreePromo) {
        window.location.href = \`/success?giftId=\${docRef.id}\`;
        return;
      }`;

const newSave = `      // Save to Firestore
      let finalGiftId = editGiftId;
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
          createdAt: serverTimestamp(),
          paid: isFreePromo 
        });
        finalGiftId = docRef.id;
        
        if (isFreePromo) {
          window.location.href = \`/success?giftId=\${finalGiftId}\`;
          return;
        }
      }`;

dash = dash.replace(oldSave, newSave);

const oldStripe = `      // Request Stripe Checkout Session
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: docRef.id, recipientName: formData.recipientName, email: auth.currentUser?.email })
      });`;

const newStripe = `      // Request Stripe Checkout Session
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: finalGiftId, recipientName: formData.recipientName, email: auth.currentUser?.email })
      });`;

dash = dash.replace(oldStripe, newStripe);
fs.writeFileSync('src/app/dashboard/page.js', dash);
