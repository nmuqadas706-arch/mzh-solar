/**
 * Download CCTV product images from Alladin.pk
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const RAW_FILE = path.join(__dirname, 'cctv_raw.json');
const IMG_DIR = path.join(__dirname, '..', 'assets', 'images', 'cctv');

if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

function slugify(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function downloadImage(imgUrl, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest)) { resolve(true); return; }
    const cleanUrl = imgUrl.split('?')[0];
    const parsed = url.parse(cleanUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    const file = fs.createWriteStream(dest);
    const req = lib.get(cleanUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        resolve(false);
      }
    });
    req.on('error', () => { file.close(); fs.unlink(dest, () => {}); resolve(false); });
    req.setTimeout(15000, () => { req.destroy(); file.close(); fs.unlink(dest, () => {}); resolve(false); });
  });
}

async function main() {
  const products = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));
  let downloaded = 0, failed = 0;

  for (const product of products) {
    const baseSlug = slugify(product.title);
    const images = product.images || [];

    for (let i = 0; i < images.length; i++) {
      const imgSrc = images[i].src;
      const ext = path.extname(imgSrc.split('?')[0]) || '.jpg';
      const filename = `${baseSlug}-${i + 1}${ext}`;
      const dest = path.join(IMG_DIR, filename);

      const ok = await downloadImage(imgSrc, dest);
      if (ok) { downloaded++; process.stdout.write(`✓`); }
      else { failed++; process.stdout.write(`✗`); }
    }
  }

  console.log(`\n\nDownloaded: ${downloaded}, Failed: ${failed}`);
  console.log(`Images saved to: ${IMG_DIR}`);
}

main().catch(console.error);

