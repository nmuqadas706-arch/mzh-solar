const fs = require('fs');

const inverterHandles = [
  'solar-inverters',
  'solar-inverters-ups',
  'hybrid-solar-inverter',
  'off-grid-solar-inverter',
  'on-grid-solar-inverters',
  'knox-hybrid-inverters',
  'knox-inverters-brand',
  'solar-inverter-2-5-10kw',
  '10kw',
  '11kw-inverters',
  '3-6kw-inverters',
  '3kw-inverters',
  '4kw-inverters',
  '5kw-inverters',
  '6kw-inverters',
  '8kw-inverters',
  'ip65-inverters'
];

const batteryHandles = [
  '12v-batteries',
  'lithium-battery',
  'apex-lithium-battery',
  'inverex-batteries',
  'inverex-inv-batteries',
  'knox-lithium-batteries',
  'dry-batteries'
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

async function fetchCollectionProducts(handle) {
  let products = [];
  let page = 1;
  while (true) {
    try {
      const url = `https://alladin.pk/collections/${handle}/products.json?limit=250&page=${page}`;
      const res = await fetch(url, { headers });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.products || data.products.length === 0) break;
      products = products.concat(data.products);
      if (data.products.length < 250) break;
      page++;
    } catch (err) {
      console.error(`Error fetching ${handle} page ${page}:`, err.message);
      break;
    }
  }
  return products;
}

function isSolarInverter(p) {
  const t = (p.title + ' ' + (p.product_type || '')).toLowerCase();
  // Filter out unrelated accessories like breakers, wifi dongles, cables if requested, but keep full inverters
  if (t.includes('breaker') || t.includes('wire') || t.includes('cable') || t.includes('tool') || t.includes('panel')) {
    if (!t.includes('inverter') && !t.includes('ups')) return false;
  }
  return t.includes('inverter') || t.includes('ups') || t.includes('hybrid') || t.includes('kw') || t.includes('kva');
}

function isBattery(p) {
  const t = (p.title + ' ' + (p.product_type || '')).toLowerCase();
  if (t.includes('battery') || t.includes('batteries') || t.includes('lithium') || t.includes('ah') || t.includes('tubular') || t.includes('agm') || t.includes('gel')) {
    return true;
  }
  return false;
}

async function main() {
  console.log('Fetching Inverter collections...');
  const invertersMap = new Map();
  for (const h of inverterHandles) {
    const list = await fetchCollectionProducts(h);
    console.log(` - ${h}: ${list.length} products found.`);
    for (const p of list) {
      if (isSolarInverter(p) && !invertersMap.has(p.id)) {
        invertersMap.set(p.id, { ...p, subCategory: 'Solar Inverters' });
      }
    }
  }

  console.log('Fetching Battery collections...');
  const batteriesMap = new Map();
  for (const h of batteryHandles) {
    const list = await fetchCollectionProducts(h);
    console.log(` - ${h}: ${list.length} products found.`);
    for (const p of list) {
      if (isBattery(p) && !batteriesMap.has(p.id) && !invertersMap.has(p.id)) {
        batteriesMap.set(p.id, { ...p, subCategory: 'Batteries' });
      }
    }
  }

  console.log(`\nUnique Solar Inverters: ${invertersMap.size}`);
  console.log(`Unique Batteries: ${batteriesMap.size}`);
  console.log(`Total Inverters + Batteries: ${invertersMap.size + batteriesMap.size}`);

  const combined = [
    ...Array.from(invertersMap.values()),
    ...Array.from(batteriesMap.values())
  ];

  fs.writeFileSync('scripts/alladin_inverters_batteries_raw.json', JSON.stringify(combined, null, 2), 'utf8');
  console.log('Saved to scripts/alladin_inverters_batteries_raw.json');
}

main().catch(console.error);

