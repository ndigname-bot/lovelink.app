const fs = require('fs');
let code = fs.readFileSync('src/app/gift/[id]/page.js', 'utf8');

const hookInsertionPoint = `const pressInterval = useRef(null);`;
const missingHooks = `const pressInterval = useRef(null);

  // Reaction Booth State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [reactionText, setReactionText] = useState("");
  const [isSubmittingReaction, setIsSubmittingReaction] = useState(false);`;

code = code.replace(hookInsertionPoint, missingHooks);

fs.writeFileSync('src/app/gift/[id]/page.js', code);
