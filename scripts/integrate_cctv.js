/**
 * Integrate CCTV products into js/products.js
 * Replaces the 6 placeholder CCTV products with 31 real products from Alladin.pk
 */

const fs = require('fs');
const path = require('path');

const FINAL_FILE = path.join(__dirname, 'cctv_final.json');
const PRODUCTS_FILE = path.join(__dirname, '..', 'js', 'products.js');

const newProducts = JSON.parse(fs.readFileSync(FINAL_FILE, 'utf8'));

let js = fs.readFileSync(PRODUCTS_FILE, 'utf8');

// Find the CCTV comment block start
const blockStart = js.indexOf('// --- CCTV');
if (blockStart === -1) {
  console.error('Cannot find // --- CCTV block!');
  process.exit(1);
}

// Find the last cctv-006 id (unquoted style: id: "cctv-006")
const lastIdMatch = [...js.matchAll(/id: "cctv-\d+"/g)].pop();
if (!lastIdMatch) {
  console.error('Cannot find last cctv id!');
  process.exit(1);
}

// Walk from the last id match backwards to find the opening { of that object
// Then walk forward to find the closing } + optional comma
let searchFrom = lastIdMatch.index;

// Walk backwards to opening brace
let objStart = searchFrom;
while (objStart > 0 && js[objStart] !== '{') objStart--;

// Walk forward, counting braces to find the closing
let depth = 0;
let objEnd = objStart;
while (objEnd < js.length) {
  if (js[objEnd] === '{') depth++;
  if (js[objEnd] === '}') {
    depth--;
    if (depth === 0) { objEnd++; break; }
  }
  objEnd++;
}

// Skip trailing comma
if (js[objEnd] === ',') objEnd++;

console.log(`Block starts at char: ${blockStart}`);
console.log(`Last product ends at char: ${objEnd}`);
console.log(`Replacing chars ${blockStart} to ${objEnd}`);

// Helper: convert JSON object to JS literal (unquoted keys, double-quoted string values)
function toJsLiteral(obj, indent = '  ') {
  const inner = indent + '  ';
  const lines = Object.entries(obj).map(([k, v]) => {
    if (v === null || v === undefined) {
      return `${inner}${k}: null`;
    } else if (typeof v === 'boolean') {
      return `${inner}${k}: ${v}`;
    } else if (typeof v === 'number') {
      return `${inner}${k}: ${v}`;
    } else if (Array.isArray(v)) {
      if (v.length === 0) return `${inner}${k}: []`;
      const items = v.map(item => {
        if (typeof item === 'string') return `${inner}    "${item.replace(/"/g, '\\"')}"`;
        return `${inner}    ${JSON.stringify(item)}`;
      }).join(',\n');
      return `${inner}${k}: [\n${items}\n${inner}]`;
    } else if (typeof v === 'object') {
      const subLines = Object.entries(v).map(([sk, sv]) => {
        const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(sk) ? sk : `"${sk}"`;
        return `${inner}    ${keyStr}: ${JSON.stringify(sv)}`;
      }).join(',\n');
      return `${inner}${k}: {\n${subLines}\n${inner}}`;
    } else if (typeof v === 'string') {
      // Use JSON.stringify to safely encode any special chars (newlines, backslashes, etc.)
      return `${inner}${k}: ${JSON.stringify(v)}`;
    }
    return `${inner}${k}: ${JSON.stringify(v)}`;
  });
  return `${indent}{\n${lines.join(',\n')}\n${indent}}`;
}

// Build replacement block
const productEntries = newProducts.map(p => toJsLiteral(p)).join(',\n');
const replacement = `// --- CCTV & Security Products (Imported from Alladin.pk - ${newProducts.length} Products) ---\n${productEntries}`;

const before = js.slice(0, blockStart);
const after = js.slice(objEnd);

const newJs = before + replacement + ',\n' + after;

fs.writeFileSync(PRODUCTS_FILE, newJs, 'utf8');
console.log(`\nIntegrated ${newProducts.length} CCTV products into products.js`);

// Quick verify
const { MZH_PRODUCTS } = require('../js/products.js');
const cctvCount = MZH_PRODUCTS.filter(p => p.category === 'CCTV Accessories').length;
console.log(`Verified: ${cctvCount} CCTV products in catalog. Total: ${MZH_PRODUCTS.length}`);
