import { Sparkles, Lock } from "lucide-react";

export function TriviaBuilder({ formData, updateForm, updateQuestion }) {
  return (
    <>
      <div className="flex items-center justify-between p-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl cursor-pointer hover:border-pink-500/50 transition-colors" onClick={() => updateForm('skipTrivia', !formData.skipTrivia)} id="skipTriviaToggle">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-pink-500" /> Skip Trivia Section</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">If enabled, your recipient will go straight to the photos without answering questions.</p>
        </div>
        <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${formData.skipTrivia ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.skipTrivia ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
      </div>

      {!formData.skipTrivia && ['q1', 'q2', 'q3', 'q4'].map((qId, index) => (
        <div key={qId} className="p-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl space-y-6 relative group">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2"><Lock className="w-5 h-5 text-pink-500" /> Trivia Question {index + 1}</h3>
            <div className="relative">
              <div className="flex bg-slate-200 dark:bg-white/10 rounded-lg p-1">
                <button 
                  onClick={() => updateQuestion(qId, 'type', 'multiple_choice')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${(!formData[qId].type || formData[qId].type === 'multiple_choice') ? 'bg-white dark:bg-black text-pink-500 shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  Multiple Choice
                </button>
                <button 
                  onClick={() => updateQuestion(qId, 'type', 'open_ended')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${formData[qId].type === 'open_ended' ? 'bg-white dark:bg-black text-pink-500 shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  Open Ended
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <input type="text" value={formData[qId].question} onChange={(e) => updateQuestion(qId, 'question', e.target.value)} placeholder={`e.g. ${index === 0 ? "What is my favorite thing about you?" : index === 1 ? "Where was our first date?" : "What is my biggest pet peeve?"}`} className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none transition-colors" />
            
            {formData[qId].type === "open_ended" ? (
              <div className="bg-slate-100 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 rounded-xl p-4 text-center">
                <p className="text-sm text-slate-500 dark:text-gray-400">The recipient will type their own answer in a text box.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" value={formData[qId].correct} onChange={(e) => updateQuestion(qId, 'correct', e.target.value)} placeholder="Correct ✅" className="w-full bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-green-500 outline-none transition-colors" />
                <input type="text" value={formData[qId].wrong1} onChange={(e) => updateQuestion(qId, 'wrong1', e.target.value)} placeholder="Wrong ❌" className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none transition-colors" />
                <input type="text" value={formData[qId].wrong2} onChange={(e) => updateQuestion(qId, 'wrong2', e.target.value)} placeholder="Wrong ❌" className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-pink-500 outline-none transition-colors" />
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
