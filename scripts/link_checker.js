const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const pagesDir = path.join(rootDir, 'pages');

const allHtmlFiles = [
  path.join(rootDir, 'index.html'),
  ...fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')).map(f => path.join(pagesDir, f))
];

let brokenLinksCount = 0;
let totalLinksChecked = 0;

allHtmlFiles.forEach(file => {
  const fileDir = path.dirname(file);
  const content = fs.readFileSync(file, 'utf8');
  
  // Find all href="..." and src="..." and action="..."
  const linkRegex = /(?:href|src|action)=["']([^"']+)["']/gi;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const rawLink = match[1].trim();
    
    // Ignore dynamic template expressions, anchors, protocols, javascript, mailto, tel
    if (
      !rawLink ||
      rawLink.includes('${') ||
      rawLink.startsWith('#') ||
      rawLink.startsWith('javascript:') ||
      rawLink.startsWith('http://') ||
      rawLink.startsWith('https://') ||
      rawLink.startsWith('mailto:') ||
      rawLink.startsWith('tel:') ||
      rawLink.startsWith('data:')
    ) {
      continue;
    }
    
    // Strip query parameters and hash
    const cleanPath = rawLink.split('?')[0].split('#')[0];
    if (!cleanPath) continue;
    
    totalLinksChecked++;
    const resolvedPath = path.resolve(fileDir, cleanPath);
    
    if (!fs.existsSync(resolvedPath)) {
      console.error(`[BROKEN LINK] in ${path.relative(rootDir, file)} -> "${rawLink}" (resolved: ${resolvedPath})`);
      brokenLinksCount++;
    }
  }
});

console.log(`\nLink Check Completed: Checked ${totalLinksChecked} internal links across ${allHtmlFiles.length} files.`);
if (brokenLinksCount === 0) {
  console.log('SUCCESS: ZERO (0) broken links found across the entire website!');
} else {
  console.error(`FAILURE: Found ${brokenLinksCount} broken links!`);
  process.exit(1);
}
