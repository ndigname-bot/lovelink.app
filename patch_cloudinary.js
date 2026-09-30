const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// Replace Firebase Storage imports
code = code.replace(/import { ref, uploadBytes, getDownloadURL } from "firebase\/storage";/, '');
// Remove storage from firebase import
code = code.replace(/import { auth, db, storage } from "\.\.\/\.\.\/lib\/firebase";/, 'import { auth, db } from "../../lib/firebase";');

// Replace upload logic
const oldUploadCode = `      // Upload Multiple Photos (Parallelized for Speed)
      if (photos.length > 0) {
        const uploadPromises = photos.map(async (photo, i) => {
          const fileRef = ref(storage, \`gifts/\${auth.currentUser.uid}/\${Date.now()}_\${i}_\${photo.name}\`);
          await uploadBytes(fileRef, photo);
          return await getDownloadURL(fileRef);
        });
        photoUrls = await Promise.all(uploadPromises);
      }`;

const newUploadCode = `      // Upload Multiple Photos to Cloudinary
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

code = code.replace(oldUploadCode, newUploadCode);
fs.writeFileSync('src/app/dashboard/page.js', code);
