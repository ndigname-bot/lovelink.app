const fs = require('fs');

// --- 1. Patch dashboard/page.js ---
let dashCode = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// Add storage imports
dashCode = dashCode.replace(
  /import { auth, db } from "\.\.\/\.\.\/lib\/firebase";/,
  'import { auth, db, storage } from "../../lib/firebase";\nimport { ref, uploadBytes, getDownloadURL } from "firebase/storage";'
);

// Replace Photo Upload logic
const oldPhotoLogic = `      // Upload Multiple Photos to Cloudinary
      if (photos.length > 0) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        
        if (!cloudName || !uploadPreset) {
          throw new Error("Cloudinary environment variables are missing. Please configure them in Vercel.");
        }

        const uploadPromises = photos.map(async (photo) => {
          const formData = new FormData();
          formData.append("file", photo);
          formData.append("upload_preset", uploadPreset);

          const res = await fetch(\`https://api.cloudinary.com/v1_1/\${cloudName}/image/upload\`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error("Failed to upload image to Cloudinary");
          }

          const data = await res.json();
          return data.secure_url;
        });

        photoUrls = await Promise.all(uploadPromises);
      }`;

const newPhotoLogic = `      // Upload Multiple Photos to Firebase Storage
      if (photos.length > 0) {
        const uploadPromises = photos.map(async (photo) => {
          const fileRef = ref(storage, \`gifts/\${auth.currentUser.uid}/\${Date.now()}_\${photo.name}\`);
          const snapshot = await uploadBytes(fileRef, photo);
          return getDownloadURL(snapshot.ref);
        });
        photoUrls = await Promise.all(uploadPromises);
      }`;

dashCode = dashCode.replace(oldPhotoLogic, newPhotoLogic);

// Replace Audio Upload logic
const oldAudioLogic = `      let finalSongUrl = formData.songQuery;
      if (formData.songQuery === "upload" && audioFile) {
        const audioData = new FormData();
        audioData.append("file", audioFile);
        audioData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        const audioRes = await fetch(\`https://api.cloudinary.com/v1_1/\${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload\`, {
          method: "POST",
          body: audioData,
        });
        if (!audioRes.ok) throw new Error("Failed to upload audio to Cloudinary");
        const audioJson = await audioRes.json();
        finalSongUrl = audioJson.secure_url;
      }`;

// Wait, the original code had:
// const audioData = new FormData();
// audioData.append("file", audioFile);
// audioData.append("upload_preset", uploadPreset);
// const audioRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { ...

const oldAudioLogicRegex = /let finalSongUrl = formData\.songQuery;\s*if \(formData\.songQuery === "upload" && audioFile\) \{[\s\S]*?finalSongUrl = audioJson\.secure_url;\s*\}/;

const newAudioLogic = `let finalSongUrl = formData.songQuery;
      if (formData.songQuery === "upload" && audioFile) {
        const audioRef = ref(storage, \`gifts/\${auth.currentUser.uid}/audio_\${Date.now()}_\${audioFile.name}\`);
        const snapshot = await uploadBytes(audioRef, audioFile);
        finalSongUrl = await getDownloadURL(snapshot.ref);
      }`;

dashCode = dashCode.replace(oldAudioLogicRegex, newAudioLogic);
fs.writeFileSync('src/app/dashboard/page.js', dashCode);


// --- 2. Patch gift/[id]/page.js ---
let giftCode = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

// Add storage import
giftCode = giftCode.replace(
  /import { db } from "\.\.\/\.\.\/\.\.\/lib\/firebase";/,
  'import { db, storage } from "../../../lib/firebase";\nimport { ref, uploadBytes, getDownloadURL } from "firebase/storage";'
);

const oldReactionUploadRegex = /if \(type === 'voice' && blob\) \{[\s\S]*?finalContent = data\.secure_url;\s*\}/;
const newReactionUpload = `if (type === 'voice' && blob) {
        const audioRef = ref(storage, \`reactions/\${id}/\${Date.now()}_voicenote.webm\`);
        const snapshot = await uploadBytes(audioRef, blob);
        finalContent = await getDownloadURL(snapshot.ref);
      }`;

giftCode = giftCode.replace(oldReactionUploadRegex, newReactionUpload);
fs.writeFileSync('src/app/gift/[id]/page.js', giftCode);

