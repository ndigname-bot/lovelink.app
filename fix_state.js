const fs = require('fs');
let dash = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

dash = dash.replace(
  'const router = useRouter();\n  const [step, setStep] = useState(1);',
  'const router = useRouter();\n  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;\n  const editGiftId = searchParams?.get("edit");\n  const [isEditing, setIsEditing] = useState(false);\n  const [step, setStep] = useState(1);'
);

// I should wrap the entire dashboard component inside Suspense in another file or just use `window.location.search` directly since it's "use client".
// using window.location.search is safer to avoid NextJS Suspense prerender errors!

fs.writeFileSync('src/app/dashboard/page.js', dash);
