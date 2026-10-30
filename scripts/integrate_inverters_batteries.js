const fs = require('fs');

const alladinProds = JSON.parse(fs.readFileSync('scripts/alladin_inverters_batteries_final.json', 'utf8'));
const currentJs = fs.readFileSync('js/products.js', 'utf8');

const inverters = alladinProds.filter(p => p.subCategory === 'Solar Inverters');
const batteries = alladinProds.filter(p => p.subCategory === 'Batteries');

console.log(`Integrating ${inverters.length} Inverters and ${batteries.length} Batteries into js/products.js...`);

// Marker 1: Inverters
const invStart = '// --- SOLAR INVERTERS (Hybrid, On-Grid, Off-Grid) ---';
const invEnd = '// --- SOLAR PANELS ---';

const idxInvStart = currentJs.indexOf(invStart);
const idxInvEnd = currentJs.indexOf(invEnd);

if (idxInvStart === -1 || idxInvEnd === -1) {
  console.error('Inverter markers not found!');
  process.exit(1);
}

// Marker 2: Batteries
const batStart = '// --- SOLAR BATTERIES (Lithium & Deep Cycle) ---';
const batEnd = '// --- SOLAR CHARGE CONTROLLERS ---';

const idxBatStart = currentJs.indexOf(batStart);
const idxBatEnd = currentJs.indexOf(batEnd);

if (idxBatStart === -1 || idxBatEnd === -1) {
  console.error('Battery markers not found!');
  process.exit(1);
}

// Format inverters
let invBlock = '// --- SOLAR INVERTERS (Imported from Alladin.pk - ' + inverters.length + ' Products) ---\n';
inverters.forEach((p, i) => {
  invBlock += '  ' + JSON.stringify(p, null, 4).replace(/\n/g, '\n  ');
  invBlock += (i < inverters.length - 1 ? ',\n' : ',\n\n  ');
});

// Format batteries
let batBlock = '// --- SOLAR BATTERIES (Imported from Alladin.pk - ' + batteries.length + ' Products) ---\n';
batteries.forEach((p, i) => {
  batBlock += '  ' + JSON.stringify(p, null, 4).replace(/\n/g, '\n  ');
  batBlock += (i < batteries.length - 1 ? ',\n' : ',\n\n  ');
});

// Assemble
const part1 = currentJs.substring(0, idxInvStart);
const part2 = currentJs.substring(idxInvEnd, idxBatStart);
const part3 = currentJs.substring(idxBatEnd);

const updatedJs = part1 + invBlock + part2 + batBlock + part3;

fs.writeFileSync('js/products.js', updatedJs, 'utf8');
console.log('Successfully updated js/products.js!');

