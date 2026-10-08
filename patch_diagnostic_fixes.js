const fs = require('fs');

// 1. Fix hardcoded setStage in Reasons stage
let viewer = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');
viewer = viewer.replace(
  'onClick={() => setStage(5)}',
  'onClick={() => setStage(prev => prev + 1)}'
);
// Also double check any other hardcoded setStages in the viewer
// Wait, is there any other?
viewer = viewer.replace(
  'setTimeout(() => setStage(1), 800);',
  'setTimeout(() => setStage(prev => prev + 1), 800);'
);
fs.writeFileSync('src/app/gift/[id]/page.js', viewer);

// 2. Fix Cloudinary in Dashboard -> Firebase
let dash = fs.readFileSync('src/app/dashboard/page.js', 'utf8');
const cloudinaryBlock = `      // Upload Multiple Photos to Cloudinary
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

const firebaseStorageBlock = `      // Upload Multiple Photos to Firebase Storage
      if (photos.length > 0) {
        const uploadPromises = photos.map(async (photo) => {
          const photoRef = ref(storage, \`gifts/\${auth.currentUser.uid}/photos/\${Date.now()}_\${photo.name}\`);
          const snapshot = await uploadBytes(photoRef, photo);
          return await getDownloadURL(snapshot.ref);
        });
        photoUrls = await Promise.all(uploadPromises);
      }`;

dash = dash.replace(cloudinaryBlock, firebaseStorageBlock);
fs.writeFileSync('src/app/dashboard/page.js', dash);
