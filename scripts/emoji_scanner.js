const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Regex to detect common emojis (Unicode ranges for emojis, pictographs, symbols)
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const rel = path.relative(rootDir, filePath);
  let found = 0;
  
  lines.forEach((line, i) => {
    if (emojiRegex.test(line)) {
      console.warn(`[EMOJI FOUND] ${rel}:${i + 1} -> ${line.trim()}`);
      found++;
    }
  });
  return found;
}

let totalFound = 0;

// Check index.html
totalFound += checkFile(path.join(rootDir, 'index.html'));

// Check pages
const pagesDir = path.join(rootDir, 'pages');
fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')).forEach(f => {
  totalFound += checkFile(path.join(pagesDir, f));
});

// Check css
const cssDir = path.join(rootDir, 'css');
fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).forEach(f => {
  totalFound += checkFile(path.join(cssDir, f));
});

// Check js
const jsDir = path.join(rootDir, 'js');
fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).forEach(f => {
  totalFound += checkFile(path.join(jsDir, f));
});

console.log(`\nEmoji Scan Finished. Total emojis found: ${totalFound}`);
if (totalFound === 0) {
  console.log('SUCCESS: ZERO (0) emojis found across all HTML, CSS, and JS files!');
} else {
  console.error(`FAILURE: Found ${totalFound} emoji occurrences!`);
  process.exit(1);
}
