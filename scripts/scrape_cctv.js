/**
 * Alladin.pk CCTV Scraper
 * Fetches all CCTV & Security products from Alladin.pk using Shopify JSON endpoints
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE = 'alladin.pk';
const OUTPUT = path.join(__dirname, 'cctv_raw.json');

const CCTV_COLLECTIONS = [
  'cameras-security-systems-cctv-cameras-ip-cameras-security-accessories',
  'ip-cameras',
  'outdoor-cameras',
  'indoor-cameras',
  'wifi-cameras',
  'wireless-cameras',
  'ptz-cameras',
  '4g-cameras',
  'hikvision-cameras',
  'imou-cameras',
  'dahua-cameras',
  'dvr-nvr',
  'nvr',
  'dvr',
  'cctv-accessories',
  'surveillance-hard-drives',
  'security-cameras',
  'okasha-cameras',
];

function get(url) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE,
      path: url,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

async function fetchCollectionPage(slug, page) {
  try {
    const url = `/collections/${slug}/products.json?limit=250&page=${page}`;
    const res = await get(url);
    if (res.status !== 200) return [];
    const json = JSON.parse(res.body);
    return json.products || [];
  } catch (e) {
    return [];
  }
}

async function fetchAllFromCollection(slug) {
  const products = [];
  let page = 1;
  while (true) {
    const batch = await fetchCollectionPage(slug, page);
    if (batch.length === 0) break;
    products.push(...batch);
    if (batch.length < 250) break;
    page++;
  }
  return products;
}

const CCTV_KEYWORDS = [
  'camera', 'cctv', 'security', 'nvr', 'dvr', 'surveillance', 'hikvision', 'dahua', 'imou',
  'okasha', 'ptz', 'ip camera', 'wifi camera', 'bullet camera', 'dome camera', 'turret',
  '4g camera', 'night vision', 'colorvu', 'wizsense', 'acusense', 'monitoring', 'coaxial',
  'bnc', 'poe switch', 'cctv cable', 'rg59', 'rg6', 'hard drive surveillance', 'wd purple',
  'seagate skyhawk', 'memory card camera', 'sd card camera', 'mounting bracket camera',
  'junction box camera', 'weatherproof camera', 'ir camera', 'infrared camera',
];

const EXCLUDE_KEYWORDS = [
  'solar', 'inverter', 'battery', 'coffee', 'kettle', 'dispenser', 'router', 'wifi router',
  'door lock', 'smart lock', 'fingerprint lock', 'electric lock', 'access control',
  'alarm system', 'siren', 'motion sensor', 'smoke detector', 'fire alarm',
];

function isCctvProduct(product) {
  const text = (product.title + ' ' + product.product_type + ' ' +
    (product.tags || []).join(' ') + ' ' + (product.vendor || '')).toLowerCase();

  const hasExclude = EXCLUDE_KEYWORDS.some(k => text.includes(k));
  if (hasExclude) return false;

  const hasCctv = CCTV_KEYWORDS.some(k => text.includes(k));
  return hasCctv;
}

async function main() {
  console.log('Fetching CCTV products from Alladin.pk...');

  const allProductsMap = new Map(); // handle -> product

  for (const slug of CCTV_COLLECTIONS) {
    console.log(`  Fetching collection: ${slug}`);
    const products = await fetchAllFromCollection(slug);
    console.log(`    Found ${products.length} products`);
    for (const p of products) {
      if (!allProductsMap.has(p.handle)) {
        allProductsMap.set(p.handle, p);
      }
    }
    // Small delay to be polite
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nTotal unique products before filter: ${allProductsMap.size}`);

  const filtered = [];
  for (const [handle, product] of allProductsMap) {
    if (isCctvProduct(product)) {
      filtered.push(product);
    }
  }

  console.log(`Total CCTV products after filter: ${filtered.length}`);

  fs.writeFileSync(OUTPUT, JSON.stringify(filtered, null, 2));
  console.log(`\nSaved to ${OUTPUT}`);

  // Summary
  const brands = {};
  filtered.forEach(p => {
    const b = p.vendor || 'Unknown';
    brands[b] = (brands[b] || 0) + 1;
  });
  console.log('\nBrand breakdown:');
  Object.entries(brands).sort((a,b) => b[1]-a[1]).forEach(([b,c]) => console.log(`  ${b}: ${c}`));
}

main().catch(console.error);

