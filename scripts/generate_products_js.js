const fs = require('fs');

const finalProducts = JSON.parse(fs.readFileSync('scripts/coffee_products_final.json', 'utf8'));
const currentProductsJs = fs.readFileSync('js/products.js', 'utf8');

// Find start and end of coffee machines section in js/products.js
const startMarker = '// --- COFFEE MACHINES (Espresso, Bean-to-Cup, Capsule & Pod) ---';
const endMarker = '];\n\n// Pre-defined Solar System Packages';

const startIndex = currentProductsJs.indexOf(startMarker);
const endIndex = currentProductsJs.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers in js/products.js');
  process.exit(1);
}

const prefix = currentProductsJs.substring(0, startIndex);
const suffix = currentProductsJs.substring(endIndex);

let coffeeJs = '// --- COFFEE MACHINES (Imported from Beverages Solution - All 36 Products) ---\n';

finalProducts.forEach((p, idx) => {
  coffeeJs += '  ' + JSON.stringify(p, null, 4).replace(/\n/g, '\n  ');
  if (idx < finalProducts.length - 1) {
    coffeeJs += ',\n';
  } else {
    coffeeJs += '\n';
  }
});

const updatedProductsJs = prefix + coffeeJs + suffix;
fs.writeFileSync('js/products.js', updatedProductsJs, 'utf8');
console.log('Successfully updated js/products.js with all', finalProducts.length, 'coffee machines!');

