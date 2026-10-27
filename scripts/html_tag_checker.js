const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const pagesDir = path.join(rootDir, 'pages');

const allHtmlFiles = [
  path.join(rootDir, 'index.html'),
  ...fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')).map(f => path.join(pagesDir, f))
];

let issues = 0;

allHtmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(rootDir, file);
  
  // Count specific critical tags
  ['header', 'footer', 'main', 'body', 'html'].forEach(tag => {
    const openCount = (content.match(new RegExp(`<${tag}\\b`, 'gi')) || []).length;
    const closeCount = (content.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    
    if (openCount !== 1 || closeCount !== 1) {
      console.warn(`[TAG MISMATCH] ${rel}: <${tag}> open=${openCount}, close=${closeCount}`);
      issues++;
    }
  });
  
  // Check div balance (excluding self-closing, scripts, comments)
  const noComments = content.replace(/<!--[\s\S]*?-->/g, '');
  const noScripts = noComments.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  const openDivs = (noScripts.match(/<div\b[^>]*>/gi) || []).length;
  const closeDivs = (noScripts.match(/<\/div>/gi) || []).length;
  
  if (openDivs !== closeDivs) {
    console.warn(`[DIV MISMATCH] ${rel}: open divs=${openDivs}, close divs=${closeDivs} (diff: ${openDivs - closeDivs})`);
    issues++;
  }
});

console.log(`\nHTML Tag Check Completed. Total structural issues: ${issues}`);
if (issues === 0) {
  console.log('SUCCESS: All pages have 100% balanced critical structural tags!');
}
