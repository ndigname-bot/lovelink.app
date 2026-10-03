const fs = require('fs');

let dashCode = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

const oldThemeUI = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['blush', 'midnight', 'ocean'].map((t) => (
                  <button key={t} onClick={() => updateForm('theme', t)} className={\`p-6 rounded-2xl border-2 text-left capitalize font-medium transition-all \${formData.theme === t ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.15)]' : 'border-slate-200 dark:border-white/10 hover:border-white/30 bg-slate-100 dark:bg-white/5'}\`}>
                    <div className="text-lg mb-1">{t}</div>
                    <div className="text-sm text-slate-500 dark:text-gray-400 font-normal">
                      {t === 'blush' ? 'Classic, romantic, rose-tinted.' : t === 'midnight' ? 'Cyberpunk, neon, energetic.' : 'Calm, deep, watery blues.'}
                    </div>
                  </button>
                ))}
              </div>`;

const newThemeUI = `<div className="flex flex-row items-center justify-start gap-8 pt-2">
                {[
                  { id: 'blush', name: 'Blush', gradient: 'from-pink-400 to-rose-500', shadow: 'rgba(236,72,153,0.6)' },
                  { id: 'midnight', name: 'Midnight', gradient: 'from-indigo-900 to-purple-900', shadow: 'rgba(79,70,229,0.6)' },
                  { id: 'ocean', name: 'Ocean', gradient: 'from-cyan-400 to-blue-600', shadow: 'rgba(6,182,212,0.6)' }
                ].map((t) => (
                  <div key={t.id} className="flex flex-col items-center gap-3">
                    <button 
                      onClick={() => updateForm('theme', t.id)} 
                      className={\`relative w-14 h-14 rounded-full transition-all duration-300 bg-gradient-to-br \${t.gradient} \${formData.theme === t.id ? 'ring-4 ring-offset-4 ring-offset-slate-50 dark:ring-offset-[#0a0a0a] ring-pink-500 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}\`}
                      style={{ boxShadow: formData.theme === t.id ? \`0 0 30px \${t.shadow}\` : 'none' }}
                    />
                    <span className={\`text-xs font-medium capitalize \${formData.theme === t.id ? 'text-pink-500 font-bold' : 'text-slate-500'}\`}>{t.name}</span>
                  </div>
                ))}
              </div>`;

dashCode = dashCode.replace(oldThemeUI, newThemeUI);

fs.writeFileSync('src/app/dashboard/page.js', dashCode);
