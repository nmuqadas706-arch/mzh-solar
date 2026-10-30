const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

let updatedCount = 0;
files.forEach(f => {
  const filePath = path.join(pagesDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('Solar / Inverters / Batteries')) {
    content = content.replace(/Solar \/ Inverters \/ Batteries/g, 'Solar Inverters / Batteries');
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`Updated ${f}`);
  }
});

console.log(`Finished updating ${updatedCount} files.`);

