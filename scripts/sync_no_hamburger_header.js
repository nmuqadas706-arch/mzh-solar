const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const pagesDir = path.join(rootDir, 'pages');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

// Extract Header from index.html
const headerStart = indexHtml.indexOf('<header class="main-header">');
const headerEnd = indexHtml.indexOf('</header>', headerStart) + 9;
const headerCanonical = indexHtml.slice(headerStart, headerEnd);

// Extract Cart Drawer from index.html
const cartStart = indexHtml.indexOf('<div id="cartDrawerOverlay" class="cart-drawer-overlay"></div>');
const cartEnd = indexHtml.indexOf('</div>\n\n  <main>', cartStart);
const cartCanonical = indexHtml.slice(cartStart, cartEnd + 6);

function buildHeaderForPage(filename) {
  let header = headerCanonical;

  // Replace root logo path and link
  header = header.replace(/href="index\.html"/g, 'href="../index.html"');
  header = header.replace(/src="assets\/images\/mzh-solar-logo\.png"/g, 'src="../assets/images/mzh-solar-logo.png"');
  header = header.replace(/href="pages\/([^"]+)"/g, 'href="$1"');

  // Navigation active state
  header = header.replace('<a href="../index.html" class="nav-link active">Home</a>', '<a href="../index.html" class="nav-link">Home</a>');

  if (filename === 'about.html') {
    header = header.replace('<a href="about.html" class="nav-link">About Us</a>', '<a href="about.html" class="nav-link active">About Us</a>');
  } else if (filename === 'installation.html') {
    header = header.replace('<a href="installation.html" class="nav-link">Services</a>', '<a href="installation.html" class="nav-link active">Services</a>');
  } else if (['inverters.html', 'coffee-machines.html', 'cctv-security.html', 'shop.html', 'batteries.html', 'solar-panels.html'].includes(filename)) {
    header = header.replace('class="nav-item nav-dropdown"', 'class="nav-item nav-dropdown active"');
    header = header.replace('class="nav-link dropdown-toggle"', 'class="nav-link dropdown-toggle active"');
    if (['inverters.html', 'batteries.html', 'solar-panels.html'].includes(filename)) {
      header = header.replace('href="inverters.html" class="dropdown-menu-item"', 'href="inverters.html" class="dropdown-menu-item active"');
    } else if (filename === 'coffee-machines.html') {
      header = header.replace('href="coffee-machines.html" class="dropdown-menu-item"', 'href="coffee-machines.html" class="dropdown-menu-item active"');
    } else if (filename === 'cctv-security.html') {
      header = header.replace('href="cctv-security.html" class="dropdown-menu-item"', 'href="cctv-security.html" class="dropdown-menu-item active"');
    }
  }

  return header;
}

function buildCartDrawerForPage() {
  let cart = cartCanonical;
  cart = cart.replace(/href="pages\/([^"]+)"/g, 'href="$1"');
  return cart;
}

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

console.log(`Updating ${files.length} pages in pages/...`);

let updatedCount = 0;

files.forEach(f => {
  const filePath = path.join(pagesDir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Locate <header class="main-header">
  const hStart = content.indexOf('<header class="main-header">');
  if (hStart === -1) {
    console.warn(`No <header class="main-header"> found in ${f}`);
    return;
  }

  // 2. Locate <main
  const mainIdx = content.indexOf('<main', hStart);
  if (mainIdx === -1) {
    console.warn(`No <main found in ${f}`);
    return;
  }

  // Slice before header and from main onwards
  const beforeHeader = content.slice(0, hStart);
  const fromMain = content.slice(mainIdx);

  const pageHeader = buildHeaderForPage(f);
  const pageCart = buildCartDrawerForPage();

  const newContent = beforeHeader + pageHeader + '\n\n  <!-- Slide-Over Shopping Cart Drawer -->\n  ' + pageCart + '\n\n  ' + fromMain;

  fs.writeFileSync(filePath, newContent, 'utf8');
  updatedCount++;
  console.log(`Synced header in ${f}`);
});

console.log(`Successfully updated ${updatedCount} pages with the new mobile-friendly header and cart drawer.`);
