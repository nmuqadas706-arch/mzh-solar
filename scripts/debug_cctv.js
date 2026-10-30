const fs = require('fs');
const js = fs.readFileSync('js/products.js', 'utf8');
const matches1 = [...js.matchAll(/"id": "cctv-\d+"/g)];
const matches2 = [...js.matchAll(/id: "cctv-\d+"/g)];
console.log('Quoted key matches:', matches1.length);
console.log('Unquoted key matches:', matches2.length);
const allMatches = [...matches1, ...matches2].sort((a,b) => a.index - b.index);
if (allMatches.length) {
  const last = allMatches[allMatches.length - 1];
  console.log('Last CCTV id match:', last[0], 'at index:', last.index);
}
const cctvIdx = js.indexOf('// --- CCTV');
console.log('CCTV comment block at index:', cctvIdx, '(line ~', js.slice(0, cctvIdx).split('\n').length, ')');

