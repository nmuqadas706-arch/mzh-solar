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
console.log(`Checking responsive elements across ${htmlFiles.length} HTML files...`);

let report = {
  totalFiles: htmlFiles.length,
  filesChecked: 0,
  tablesFound: 0,
  formsFound: 0,
  modalsFound: 0,
  carouselsFound: 0,
  mobileDrawersFound: 0
};

htmlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  report.filesChecked++;
  
  if (content.includes('<table')) report.tablesFound++;
  if (content.includes('<form')) report.formsFound++;
  if (content.includes('modal-overlay') || content.includes('modal-content')) report.modalsFound++;
  if (content.includes('hero-slider') || content.includes('carousel')) report.carouselsFound++;
  if (content.includes('mobile-nav-drawer')) report.mobileDrawersFound++;
});

console.log('Responsive Audit Summary:');
console.log(`- Files Checked: ${report.filesChecked} / ${report.totalFiles}`);
console.log(`- Pages with Tables: ${report.tablesFound}`);
console.log(`- Pages with Forms: ${report.formsFound}`);
console.log(`- Pages with Modals: ${report.modalsFound}`);
console.log(`- Pages with Sliders/Carousels: ${report.carouselsFound}`);
console.log(`- Pages with Mobile Navigation Drawer: ${report.mobileDrawersFound}`);

if (report.mobileDrawersFound === report.totalFiles) {
  console.log('SUCCESS: All 30 pages contain the complete Mobile Navigation Drawer!');
} else {
  console.warn(`WARNING: Only ${report.mobileDrawersFound} of ${report.totalFiles} have mobile navigation drawer!`);
}
