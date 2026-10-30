const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync('scripts/alladin_inverters_batteries_raw.json', 'utf8'));

const invertersDir = path.join('assets', 'images', 'solar-inverters');
const batteriesDir = path.join('assets', 'images', 'batteries');

if (!fs.existsSync(invertersDir)) fs.mkdirSync(invertersDir, { recursive: true });
if (!fs.existsSync(batteriesDir)) fs.mkdirSync(batteriesDir, { recursive: true });

function cleanSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

const downloadTasks = [];
const processedProducts = [];

rawData.forEach((prod) => {
  const isBattery = prod.subCategory === 'Batteries';
  const targetDir = isBattery ? batteriesDir : invertersDir;
  const relBase = isBattery ? 'assets/images/batteries' : 'assets/images/solar-inverters';
  const slug = cleanSlug(prod.handle || prod.title);
  const localImages = [];

  prod.images.forEach((imgObj, idx) => {
    const rawSrc = imgObj.src;
    const cleanUrl = rawSrc.split('?')[0];
    let ext = path.extname(cleanUrl) || '.jpg';
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext.toLowerCase())) {
      ext = '.jpg';
    }
    const fileName = `${slug}-${idx + 1}${ext}`;
    const destPath = path.join(targetDir, fileName);
    const relPath = `${relBase}/${fileName}`;
    localImages.push(relPath);

    downloadTasks.push({
      prodTitle: prod.title,
      src: rawSrc,
      dest: destPath
    });
  });

  processedProducts.push({
    ...prod,
    localImages,
    primaryLocalImage: localImages[0] || '',
    secondaryLocalImage: localImages[1] || ''
  });
});

console.log(`Prepared ${downloadTasks.length} download tasks for ${processedProducts.length} products.`);

async function downloadOne(task, retries = 3) {
  if (fs.existsSync(task.dest) && fs.statSync(task.dest).size > 1000) {
    return true;
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(task.src, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(task.dest, buffer);
      return true;
    } catch (err) {
      if (attempt === retries) {
        console.error(`Error downloading ${task.dest}: ${err.message}`);
        return false;
      }
      await new Promise(r => setTimeout(r, 600));
    }
  }
  return false;
}

async function runAll() {
  const concurrency = 6;
  let active = 0;
  let index = 0;
  let successCount = 0;
  let failCount = 0;

  return new Promise((resolve) => {
    function next() {
      if (index >= downloadTasks.length && active === 0) {
        return resolve();
      }

      while (active < concurrency && index < downloadTasks.length) {
        const task = downloadTasks[index++];
        active++;
        downloadOne(task)
          .then(ok => {
            if (ok) successCount++;
            else failCount++;
            if ((successCount + failCount) % 30 === 0 || (successCount + failCount) === downloadTasks.length) {
              console.log(`Progress: ${successCount + failCount}/${downloadTasks.length} (success: ${successCount}, failed: ${failCount})`);
            }
          })
          .finally(() => {
            active--;
            next();
          });
      }
    }
    next();
  });
}

async function main() {
  const t0 = Date.now();
  await runAll();
  console.log(`All images downloaded in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
  fs.writeFileSync('scripts/alladin_inverters_batteries_processed.json', JSON.stringify(processedProducts, null, 2), 'utf8');
  console.log('Saved scripts/alladin_inverters_batteries_processed.json');
}

main().catch(console.error);

