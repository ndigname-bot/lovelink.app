const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

if (!code.includes('browser-image-compression')) {
    code = code.replace('import { doc, setDoc,', 'import imageCompression from "browser-image-compression";\nimport { doc, setDoc,');
    if (!code.includes('import imageCompression')) {
        // Fallback insertion at the top
        code = 'import imageCompression from "browser-image-compression";\n' + code;
    }
}

const oldPhotoUpload = `        if (photos.length > 0) {
          setPublishStatus("Uploading " + photos.length + " photos...");
          const uploadPromises = photos.map(async (photo) => {
            const photoRef = ref(storage, \\\`gifts/\\\${auth.currentUser.uid}/photos/\\\${Date.now()}_\\\${photo.name}\\\`);
            const snapshot = await uploadBytes(photoRef, photo);
            return await getDownloadURL(snapshot.ref);
          });
          photoUrls = await Promise.all(uploadPromises);
        }`;

// Using Regex to reliably match the old upload block:
const regex = /if \(photos\.length > 0\) \{\s*setPublishStatus\("Uploading " \+ photos\.length \+ " photos\.\.\."\);\s*const uploadPromises = photos\.map\(async \(photo\) => \{\s*const photoRef = ref\(storage, `gifts\/\$\{auth\.currentUser\.uid\}\/photos\/\$\{Date\.now\(\)\}_\$\{photo\.name\}`\);\s*const snapshot = await uploadBytes\(photoRef, photo\);\s*return await getDownloadURL\(snapshot\.ref\);\s*\}\);\s*photoUrls = await Promise\.all\(uploadPromises\);\s*\}/;

const newPhotoUpload = `        if (photos.length > 0) {
          setPublishStatus("Compressing " + photos.length + " photos...");
          const uploadPromises = photos.map(async (photo) => {
            try {
              const options = {
                maxSizeMB: 0.8,
                maxWidthOrHeight: 1920,
                useWebWorker: true
              };
              const compressedFile = await imageCompression(photo, options);
              const photoRef = ref(storage, \`gifts/\${auth.currentUser.uid}/photos/\${Date.now()}_\${compressedFile.name}\`);
              const snapshot = await uploadBytes(photoRef, compressedFile);
              return await getDownloadURL(snapshot.ref);
            } catch (error) {
              console.error("Compression error:", error);
              const photoRef = ref(storage, \`gifts/\${auth.currentUser.uid}/photos/\${Date.now()}_\${photo.name}\`);
              const snapshot = await uploadBytes(photoRef, photo);
              return await getDownloadURL(snapshot.ref);
            }
          });
          photoUrls = await Promise.all(uploadPromises);
        }`;

code = code.replace(regex, newPhotoUpload);

fs.writeFileSync('src/app/dashboard/page.js', code);
