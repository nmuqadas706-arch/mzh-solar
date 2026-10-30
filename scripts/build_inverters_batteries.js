const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scripts/alladin_inverters_batteries_processed.json', 'utf8'));

function cleanText(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractBrand(p) {
  const t = p.title;
  const v = p.vendor || '';

  // Recognizable brands
  if (/Knox/i.test(t) || /Knox/i.test(v)) return 'Knox';
  if (/Inverex/i.test(t) || /Inverex/i.test(v)) return 'Inverex';
  if (/GoodWe/i.test(t) || /GoodWe/i.test(v)) return 'GoodWe';
  if (/Sungrow/i.test(t) || /Sungrow/i.test(v)) return 'Sungrow';
  if (/SolarMax/i.test(t) || /SolarMax/i.test(v)) return 'SolarMax';
  if (/INVT/i.test(t) || /INVT/i.test(v)) return 'INVT';
  if (/MaxPower/i.test(t) || /MaxPower/i.test(v)) return 'MaxPower';
  if (/Growatt/i.test(t) || /Growatt/i.test(v)) return 'Growatt';
  if (/Crown/i.test(t) || /Crown/i.test(v)) return 'Crown Micro';
  if (/Tesla/i.test(t) || /Tesla/i.test(v)) return 'Tesla Solar';
  if (/Fronus/i.test(t) || /Fronus/i.test(v)) return 'Fronus';
  if (/EcoFlow/i.test(t) || /EcoFlow/i.test(v)) return 'EcoFlow';
  if (/BYD/i.test(t) || /BYD/i.test(v)) return 'BYD';
  if (/Apex/i.test(t) || /Apex/i.test(v)) return 'Apex';
  if (/Simtek/i.test(t) || /Simtek/i.test(v)) return 'Simtek';
  if (/Ronikal/i.test(t) || /Ronikal/i.test(v)) return 'Ronikal';
  if (/Hisel/i.test(t) || /Hisel/i.test(v)) return 'Hisel';
  if (/Primax/i.test(t) || /Primax/i.test(v)) return 'Primax';
  if (/Tiger Solar/i.test(t) || /Tiger/i.test(v)) return 'Tiger Solar';
  if (/Jolta/i.test(t) || /Jolta/i.test(v)) return 'Jolta';
  if (/Luminey/i.test(t) || /Luminey/i.test(v)) return 'Luminey';
  if (/anicsun/i.test(t) || /anicsun/i.test(v)) return 'Anicsun';
  if (/itel/i.test(t) || /itel/i.test(v)) return 'Itel';

  if (v && v !== 'Alladin Store' && v !== 'Green Energy' && v !== 'Default') return v;
  return p.subCategory === 'Batteries' ? 'Solar Battery' : 'Solar Inverter';
}

function extractSpecs(bodyHtml, title) {
  const specs = {};
  if (!bodyHtml) return specs;

  // 1. Table rows: <tr><td>Key</td><td>Value</td></tr>
  const trMatches = bodyHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
  if (trMatches) {
    for (const tr of trMatches) {
      const cells = tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
      if (cells && cells.length >= 2) {
        const k = cleanText(cells[0]).replace(/:$/, '').trim();
        const v = cleanText(cells[1]).trim();
        if (k && v && k.length < 35 && v.length < 100 && !k.toLowerCase().includes('http')) {
          specs[k] = v;
        }
      }
    }
  }

  // 2. Colon-separated lines
  if (Object.keys(specs).length < 2) {
    const lines = bodyHtml.split(/<br\s*\/?>|<\/p>|<\/li>|<\/div>/i);
    for (const line of lines) {
      const text = cleanText(line);
      if (text.includes(':')) {
        const parts = text.split(':');
        const k = parts[0].trim();
        const v = parts.slice(1).join(':').trim();
        if (k && v && k.length < 35 && v.length < 100 && !k.toLowerCase().includes('http')) {
          specs[k] = v;
        }
      }
    }
  }

  // 3. Fallback specs extracted from title
  if (Object.keys(specs).length === 0) {
    const kwMatch = title.match(/(\d+(?:\.\d+)?)\s*(kw|kva)/i);
    if (kwMatch) specs['Capacity'] = `${kwMatch[1]} ${kwMatch[2].toUpperCase()}`;

    const vMatch = title.match(/(\d{2,3})\s*v(?:olt)?/i);
    if (vMatch) specs['System Voltage'] = `${vMatch[1]}V DC`;

    const ahMatch = title.match(/(\d{2,4})\s*ah/i);
    if (ahMatch) specs['Battery Capacity'] = `${ahMatch[1]} Ah`;

    if (/hybrid/i.test(title)) specs['Type'] = 'Hybrid Solar Inverter (On/Off Grid)';
    else if (/on-grid/i.test(title)) specs['Type'] = 'On-Grid Net Metering Inverter';
    else if (/off-grid/i.test(title)) specs['Type'] = 'Off-Grid Solar Inverter';
    else if (/lithium|lifepo4/i.test(title)) specs['Type'] = 'Lithium LiFePO4 Energy Storage';
    else if (/tubular/i.test(title)) specs['Type'] = 'Deep Cycle Tubular Battery';
  }

  return specs;
}

let invCount = 0;
let batCount = 0;

const finalProducts = raw.map((p) => {
  const isBattery = p.subCategory === 'Batteries';
  let id = '';
  if (isBattery) {
    batCount++;
    id = `bat-${String(batCount).padStart(3, '0')}`;
  } else {
    invCount++;
    id = `inv-${String(invCount).padStart(3, '0')}`;
  }

  const brand = extractBrand(p);
  const plainDesc = cleanText(p.body_html) || `${p.title} - high efficiency, verified Tier-1 equipment available at MZH Solar Pakistan.`;
  const specs = extractSpecs(p.body_html, p.title);

  const variant = p.variants && p.variants[0] ? p.variants[0] : {};
  let price = parseFloat(variant.price || 0);
  let originalPrice = parseFloat(variant.compare_at_price || 0);
  if (!originalPrice || originalPrice <= price) {
    originalPrice = price > 0 ? Math.round(price * 1.07) : 0;
  }
  let discountPercent = (price > 0 && originalPrice > price) ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  // Short spec for card display
  const shortParts = [];
  if (specs['Capacity']) shortParts.push(specs['Capacity']);
  if (specs['Battery Capacity']) shortParts.push(specs['Battery Capacity']);
  if (specs['System Voltage']) shortParts.push(specs['System Voltage']);
  if (specs['Type']) shortParts.push(specs['Type']);
  if (shortParts.length === 0) {
    shortParts.push(brand);
    shortParts.push(isBattery ? 'Solar Energy Storage' : 'Solar Inverter');
  }
  const shortSpec = shortParts.slice(0, 3).join(' | ');

  let badge = '';
  if (/ip65/i.test(p.title)) badge = 'IP65 Rated';
  else if (/hybrid/i.test(p.title)) badge = 'Hybrid Solar';
  else if (/lithium/i.test(p.title)) badge = 'LiFePO4';
  else if (discountPercent >= 10) badge = `${discountPercent}% OFF`;
  else if (p.images.length >= 3) badge = 'Popular';

  return {
    id,
    sourceHandle: p.handle,
    name: p.title.trim(),
    brand,
    sku: variant.sku || (isBattery ? `MZH-BAT-${String(batCount).padStart(3, '0')}` : `MZH-INV-${String(invCount).padStart(3, '0')}`),
    category: "Inverters / Batteries",
    subCategory: isBattery ? "Batteries" : "Solar Inverters",
    price,
    priceFormatted: price > 0 ? null : "Call for Quote",
    originalPrice,
    discountPercent,
    rating: Number((4.7 + ((batCount + invCount) % 3) * 0.1).toFixed(1)),
    reviewsCount: 14 + (((batCount + invCount) * 5) % 40),
    inStock: variant.available !== false,
    isHotDeal: discountPercent > 0,
    isFeatured: (isBattery ? batCount : invCount) <= 6,
    badge,
    specs,
    shortSpec,
    description: plainDesc,
    bodyHtml: p.body_html || '',
    image: p.primaryLocalImage,
    secondaryImage: p.secondaryLocalImage || p.primaryLocalImage,
    images: p.localImages
  };
});

fs.writeFileSync('scripts/alladin_inverters_batteries_final.json', JSON.stringify(finalProducts, null, 2), 'utf8');
console.log(`Successfully built ${finalProducts.length} final products:`);
console.log(` - Solar Inverters: ${invCount}`);
console.log(` - Batteries: ${batCount}`);

