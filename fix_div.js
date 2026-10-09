const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.js', 'utf8');

// Find the Invisible YouTube Player block to inject the missing </div>
code = code.replace(
`                  {/* Invisible YouTube Player for Previews */}
                  {previewSong && previewSong.includes('youtube') && (
                     <iframe 
                        width="0" height="0" 
                        src={\`https://www.youtube.com/embed/\${previewSong.includes("v=") ? previewSong.split("v=")[1]?.split("&")[0] : previewSong.split("youtu.be/")[1]?.split("?")[0]}?autoplay=1&loop=1&playlist=\${previewSong.includes("v=") ? previewSong.split("v=")[1]?.split("&")[0] : previewSong.split("youtu.be/")[1]?.split("?")[0]}\`}
                        allow="autoplay" 
                        style={{display: "none"}}
                     ></iframe>
                  )}
              </div>`, 
`                  {/* Invisible YouTube Player for Previews */}
                  {previewSong && previewSong.includes('youtube') && (
                     <iframe 
                        width="0" height="0" 
                        src={\`https://www.youtube.com/embed/\${previewSong.includes("v=") ? previewSong.split("v=")[1]?.split("&")[0] : previewSong.split("youtu.be/")[1]?.split("?")[0]}?autoplay=1&loop=1&playlist=\${previewSong.includes("v=") ? previewSong.split("v=")[1]?.split("&")[0] : previewSong.split("youtu.be/")[1]?.split("?")[0]}\`}
                        allow="autoplay" 
                        style={{display: "none"}}
                     ></iframe>
                  )}
              </div>
            </div>`);

fs.writeFileSync('src/app/dashboard/page.js', code);
