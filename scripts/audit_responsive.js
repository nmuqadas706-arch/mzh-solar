const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      files = files.concat(getHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

const htmlFiles = getHtmlFiles('.');
console.log(`Auditing ${htmlFiles.length} HTML files...`);

const issues = {
  missingViewport: [],
  missingStyleCss: [],
  missingResponsiveCss: [],
  hasHorizontalOverflowStyle: [],
  hasFixedPixelWidthContainers: []
};

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('name="viewport"') && !content.includes("name='viewport'")) {
    issues.missingViewport.push(file);
  }
  
  if (!content.includes('style.css')) {
    issues.missingStyleCss.push(file);
  }
  
  if (!content.includes('responsive.css')) {
    issues.missingResponsiveCss.push(file);
  }

  // Look for fixed width elements > 500px that aren't max-width
  const fixedWidthMatch = content.match(/style="[^"]*width:\s*([6-9]\d{2}|[1-9]\d{3,})px/g);
  if (fixedWidthMatch) {
    issues.hasFixedPixelWidthContainers.push({ file, matches: fixedWidthMatch });
  }
}

console.log('Missing Viewport:', issues.missingViewport);
console.log('Missing style.css:', issues.missingStyleCss);
console.log('Missing responsive.css:', issues.missingResponsiveCss);
console.log('Fixed pixel widths > 500px:', JSON.stringify(issues.hasFixedPixelWidthContainers, null, 2));

console.log('\n--- Responsive Audit Completed ---');
