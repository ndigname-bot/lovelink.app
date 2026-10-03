const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// Add Family to occasion selector
const occButtons = `                    { id: 'standard', name: 'Just Because', emoji: '💌' },
                    { id: 'birthday', name: 'Birthday', emoji: '🎂' },
                    { id: 'anniversary', name: 'Anniversary', emoji: '🥂' },
                    { id: 'proposal', name: 'Proposal', emoji: '💍' }`;
const newOccButtons = `                    { id: 'standard', name: 'Just Because', emoji: '💌' },
                    { id: 'birthday', name: 'Birthday', emoji: '🎂' },
                    { id: 'anniversary', name: 'Anniversary', emoji: '🥂' },
                    { id: 'proposal', name: 'Proposal', emoji: '💍' },
                    { id: 'family', name: 'Family', emoji: '👨‍👩‍👧' }`;
code = code.replace(occButtons, newOccButtons);
// Change grid from grid-cols-4 to grid-cols-5 if on large screens, or just grid-cols-2 md:grid-cols-5
code = code.replace('<div className="grid grid-cols-2 md:grid-cols-4 gap-4">', '<div className="grid grid-cols-2 md:grid-cols-5 gap-4">');

// Adjust labels for Family
code = code.replace(
  'formData.occasion === "proposal" ? "3 Promises For Our Future" : formData.occasion === "birthday" ? "3 Birthday Wishes" : "3 Reasons I Love You"',
  'formData.occasion === "proposal" ? "3 Promises For Our Future" : formData.occasion === "birthday" ? "3 Birthday Wishes" : formData.occasion === "family" ? "3 Things I Appreciate About You" : "3 Reasons I Love You"'
);
code = code.replace(
  'formData.occasion === "proposal" ? "Promise" : formData.occasion === "birthday" ? "Wish" : "Reason"',
  'formData.occasion === "proposal" ? "Promise" : formData.occasion === "birthday" ? "Wish" : formData.occasion === "family" ? "Appreciation" : "Reason"'
);
code = code.replace(
  'formData.occasion === "proposal" ? "I promise to always listen" : "Your beautiful smile"',
  'formData.occasion === "proposal" ? "I promise to always listen" : formData.occasion === "family" ? "Always supporting my dreams" : "Your beautiful smile"'
);

fs.writeFileSync('src/app/dashboard/page.js', code);
