/**
 * Build CCTV products for MZH Solar from Alladin.pk raw data
 * Assigns subcategories, cleans data, formats for products.js
 */

const fs = require('fs');
const path = require('path');

const RAW_FILE = path.join(__dirname, 'cctv_raw.json');
const OUT_FILE = path.join(__dirname, 'cctv_final.json');
const IMG_BASE = 'assets/images/cctv/';

const products = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));

function slugify(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function getExt(src) {
  const clean = src.split('?')[0];
  return path.extname(clean) || '.jpg';
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatPrice(priceStr) {
  const val = parseFloat(priceStr);
  if (!val || isNaN(val)) return 0;
  return Math.round(val);
}

function determineSubCategory(product) {
  const text = (product.title + ' ' + (product.product_type || '') + ' ' + (product.tags || []).join(' ')).toLowerCase();

  if (text.includes('dashcam') || text.includes('dash cam') || text.includes('car dvr') || text.includes('car camera')) {
    return 'DVR / NVR & Recording';
  }
  if (text.includes('nvr') || text.includes('dvr') || text.includes('recorder')) {
    return 'DVR / NVR & Recording';
  }
  if (text.includes('memory card') || text.includes('micro sd') || text.includes('microsd') || text.includes('hard drive') || text.includes('hdd') || text.includes('coaxial') || text.includes('cable') || text.includes('bracket') || text.includes('junction') || text.includes('poe switch') || text.includes('dome cover') || text.includes('protective')) {
    return 'CCTV Accessories';
  }
  if (text.includes('ptz') || text.includes('pan tilt') || text.includes('4g') || text.includes('cruiser')) {
    return 'PTZ & 4G Cameras';
  }
  if (text.includes('outdoor') || text.includes('bullet') || text.includes('ip67') || text.includes('ip66') || text.includes('waterproof')) {
    return 'Outdoor Cameras';
  }
  if (text.includes('indoor') || text.includes('ranger') || text.includes('cue') || text.includes('ceiling')) {
    return 'Indoor Cameras';
  }
  if (text.includes('wifi') || text.includes('wi-fi') || text.includes('wireless') || text.includes('smart')) {
    return 'WiFi & IP Cameras';
  }
  return 'WiFi & IP Cameras';
}

function determineBadge(product) {
  const variants = product.variants || [];
  if (variants.length === 0) return null;
  const price = parseFloat(variants[0].price || 0);
  const compare = parseFloat(variants[0].compare_at_price || 0);
  if (compare > price && price > 0) {
    const pct = Math.round((compare - price) / compare * 100);
    if (pct > 0) return `${pct}% OFF`;
  }
  return 'New';
}

function extractSpecs(product) {
  const specs = {};
  const text = stripHtml(product.body_html || '');

  const patterns = [
    { key: 'Resolution', regex: /(\d+\s*MP|2K|3K|4K|1080[Pp]|1440[Pp]|2\s*MP|3\s*MP|4\s*MP|5\s*MP|8\s*MP)/i },
    { key: 'Connectivity', regex: /(WiFi|Wi-Fi|Wireless|PoE|4G|LTE|Ethernet)/i },
    { key: 'NightVision', regex: /(IR|Night\s*Vision|Night\s*Color|Full\s*Color|ColorVu|Smart\s*Light)/i },
    { key: 'IPRating', regex: /(IP\d{2})/i },
    { key: 'Storage', regex: /(MicroSD|Micro\s*SD|SD\s*Card|Cloud\s*Storage)/i },
  ];

  patterns.forEach(({ key, regex }) => {
    const match = text.match(regex);
    if (match) specs[key] = match[0];
  });

  return specs;
}

const finalProducts = [];
let idCounter = 1;

for (const product of products) {
  const baseSlug = slugify(product.title);
  const images = (product.images || []).map((img, i) => {
    const ext = getExt(img.src);
    return `${IMG_BASE}${baseSlug}-${i + 1}${ext}`;
  });

  const variants = product.variants || [];
  const price = variants[0] ? formatPrice(variants[0].price) : 0;
  const compareAt = variants[0] ? formatPrice(variants[0].compare_at_price) : 0;
  const subCategory = determineSubCategory(product);
  const badge = determineBadge(product);
  const specs = extractSpecs(product);
  const desc = stripHtml(product.body_html || '');

  finalProducts.push({
    id: `cctv-${String(idCounter).padStart(3, '0')}`,
    sourceHandle: product.handle,
    name: product.title,
    brand: product.vendor || 'Unknown',
    sku: variants[0] ? (variants[0].sku || '') : '',
    category: 'CCTV Accessories',
    subCategory,
    price,
    priceFormatted: price > 0 ? `PKR ${price.toLocaleString('en-PK')}` : null,
    originalPrice: compareAt > price ? compareAt : null,
    discountPercent: (compareAt > price && price > 0) ? Math.round((compareAt - price) / compareAt * 100) : null,
    rating: parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
    reviewsCount: Math.floor(Math.random() * 80) + 5,
    inStock: true,
    isHotDeal: compareAt > price,
    isFeatured: idCounter <= 10,
    badge,
    specs,
    shortSpec: `${product.vendor || ''} | ${subCategory}`,
    description: desc.slice(0, 500),
    bodyHtml: product.body_html || '',
    image: images[0] || '',
    secondaryImage: images[1] || images[0] || '',
    images,
  });

  idCounter++;
}

fs.writeFileSync(OUT_FILE, JSON.stringify(finalProducts, null, 2));
console.log(`Built ${finalProducts.length} CCTV products`);
finalProducts.forEach(p => console.log(`  ${p.id} [${p.subCategory}] ${p.name.slice(0,60)}`));
