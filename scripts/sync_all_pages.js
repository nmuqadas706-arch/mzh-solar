const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const pagesDir = path.join(rootDir, 'pages');
const backupDir = path.join(rootDir, 'pages_backup');

// Backup pages directory if not yet backed up
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  fs.readdirSync(pagesDir).forEach(f => {
    fs.copyFileSync(path.join(pagesDir, f), path.join(backupDir, f));
  });
  console.log(`Backed up ${fs.readdirSync(pagesDir).length} files to pages_backup/`);
}

// 1. Read index.html as single source of truth
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

// 2. Extract Marquee Block
const marqueeStart = indexHtml.indexOf('<div class="announcement-bar-scroll"');
const marqueeEnd = indexHtml.indexOf('</div>\n\n  <!-- 2. Main Header:', marqueeStart);
const marqueeCanonical = indexHtml.slice(marqueeStart, marqueeEnd + 6);

// 3. Extract Header Block
const headerStart = indexHtml.indexOf('<header class="main-header">');
const headerEnd = indexHtml.indexOf('</header>', headerStart) + 9;
const headerCanonical = indexHtml.slice(headerStart, headerEnd);

// 4. Extract Mobile Drawer Block
const drawerStart = indexHtml.indexOf('<div class="mobile-nav-overlay"></div>');
const drawerEnd = indexHtml.indexOf('</aside>', drawerStart) + 8;
const drawerCanonical = indexHtml.slice(drawerStart, drawerEnd);

// 5. Extract Cart Drawer Block
const cartStart = indexHtml.indexOf('<div id="cartDrawerOverlay" class="cart-drawer-overlay"></div>');
const cartEnd = indexHtml.indexOf('</div>\n\n  <main>', cartStart);
const cartCanonical = indexHtml.slice(cartStart, cartEnd + 6);

// 6. Extract Footer Block
const footerStart = indexHtml.indexOf('<footer class="main-footer">');
const footerEnd = indexHtml.indexOf('</footer>', footerStart) + 9;
const footerCanonical = indexHtml.slice(footerStart, footerEnd);

// Navigation active mapping
const activeMap = {
  'about.html': 'about.html',
  'shop.html': 'shop.html',
  'hot-deals.html': 'hot-deals.html',
  'inverters.html': 'inverters.html',
  'charge-controllers.html': 'charge-controllers.html',
  'solar-panels.html': 'solar-panels.html',
  'batteries.html': 'batteries.html',
  'cctv-security.html': 'cctv-security.html',
  'packages.html': 'packages.html',
  'installation.html': 'installation.html',
  'track-order.html': 'track-order.html',
  'coffee-machines.html': 'coffee-machines.html'
};

function buildHeaderForPage(filename) {
  let header = headerCanonical;
  
  // Replace root logo path and link globally
  header = header.replace(/href="index\.html"/g, 'href="../index.html"');
  header = header.replace(/src="assets\/images\/mzh-solar-logo\.png"/g, 'src="../assets/images/mzh-solar-logo.png"');
  
  // Search action
  header = header.replace(/action="pages\/search\.html"/g, 'action="search.html"');
  
  // Header action wishlist link
  header = header.replace(/href="pages\/wishlist\.html"/g, 'href="wishlist.html"');
  
  // Replace categories dropdown links
  header = header.replace(/href="pages\/([^"]+)"/g, 'href="$1"');
  
  // Navigation active state
  // First, remove active from Home
  header = header.replace('<a href="../index.html" class="nav-link-dark active">Home</a>', '<a href="../index.html" class="nav-link-dark">Home</a>');
  
  const targetActive = activeMap[filename];
  if (targetActive) {
    if (targetActive === 'hot-deals.html') {
      header = header.replace(
        '<a href="hot-deals.html" class="nav-link-dark">',
        '<a href="hot-deals.html" class="nav-link-dark active">'
      );
    } else {
      header = header.replace(
        `href="${targetActive}" class="nav-link-dark"`,
        `href="${targetActive}" class="nav-link-dark active"`
      );
    }
  }
  
  return header;
}

function buildDrawerForPage() {
  let drawer = drawerCanonical;
  drawer = drawer.replace(/src="assets\/images\/mzh-solar-logo\.png"/g, 'src="../assets/images/mzh-solar-logo.png"');
  drawer = drawer.replace(/action="pages\/search\.html"/g, 'action="search.html"');
  drawer = drawer.replace(/href="index\.html"/g, 'href="../index.html"');
  drawer = drawer.replace(/href="pages\/([^"]+)"/g, 'href="$1"');
  return drawer;
}

function buildCartDrawerForPage() {
  let cart = cartCanonical;
  cart = cart.replace(/href="pages\/([^"]+)"/g, 'href="$1"');
  return cart;
}

function buildFooterForPage() {
  let footer = footerCanonical;
  footer = footer.replace(/href="index\.html"/g, 'href="../index.html"');
  footer = footer.replace(/src="assets\/images\/mzh-solar-logo\.png"/g, 'src="../assets/images/mzh-solar-logo.png"');
  footer = footer.replace(/href="pages\/([^"]+)"/g, 'href="$1"');
  return footer;
}

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

console.log(`Synchronizing header & footer across ${files.length} pages in pages/...`);

files.forEach(f => {
  const filePath = path.join(pagesDir, f);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Locate <body
  const bodyIdx = content.indexOf('<body');
  if (bodyIdx === -1) {
    console.error(`ERROR: No <body> found in ${f}`);
    return;
  }
  const bodyTagEnd = content.indexOf('>', bodyIdx) + 1;
  const beforeBody = content.slice(0, bodyTagEnd);
  
  // 2. Locate <main
  const mainIdx = content.indexOf('<main');
  if (mainIdx === -1) {
    console.error(`ERROR: No <main found in ${f}`);
    return;
  }
  
  // 3. Locate </main>
  const endMainIdx = content.lastIndexOf('</main>');
  if (endMainIdx === -1) {
    console.error(`ERROR: No </main> found in ${f}`);
    return;
  }
  const mainContent = content.slice(mainIdx, endMainIdx + 7);
  
  // 4. Extract any special modals between </main> and <footer>
  let specialModals = '';
  if (f === 'account.html') {
    const invIdx = content.indexOf('<div id="invoiceModal"');
    const footerStart = content.indexOf('<footer', invIdx);
    if (invIdx !== -1 && footerStart !== -1) {
      const raw = content.slice(invIdx, footerStart).trim();
      specialModals = '\n\n  <!-- Printable Invoice & Address Modals -->\n  ' + raw.replace(/<!--[\s\S]*?-->/g, '').trim() + '\n';
    }
  } else if (f === 'checkout.html') {
    const orderModalIdx = content.indexOf('<div id="orderSuccessModal"');
    const footerStart = content.indexOf('<footer', orderModalIdx);
    if (orderModalIdx !== -1 && footerStart !== -1) {
      const raw = content.slice(orderModalIdx, footerStart).trim();
      specialModals = '\n\n  <!-- Simulated Order Confirmation Modal -->\n  ' + raw.replace(/<!--[\s\S]*?-->/g, '').trim() + '\n';
    }
  }
  
  // 5. Locate <footer> and </footer>
  const footerStartIdx = content.indexOf('<footer', endMainIdx);
  const footerEndIdx = content.indexOf('</footer>', footerStartIdx);
  if (footerStartIdx === -1 || footerEndIdx === -1) {
    console.error(`ERROR: No footer found in ${f}`);
    return;
  }
  
  // 6. Extract any inline scripts after footer
  const afterFooterContent = content.slice(footerEndIdx + 9);
  
  // Extract all inline script blocks
  const inlineScriptRegex = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  const inlineScripts = [];
  let scriptMatch;
  while ((scriptMatch = inlineScriptRegex.exec(afterFooterContent)) !== null) {
    inlineScripts.push(scriptMatch[0].trim());
  }
  
  // 7. Assemble components for this page
  const pageHeader = buildHeaderForPage(f);
  const pageDrawer = buildDrawerForPage();
  const pageCartDrawer = buildCartDrawerForPage();
  const pageFooter = buildFooterForPage();
  
  let newHtml = beforeBody + '\n\n';
  newHtml += '  <!-- 1. Alladin.pk Style Continuous Marquee Announcement Bar -->\n';
  newHtml += '  ' + marqueeCanonical + '\n\n';
  newHtml += '  <!-- 2. Main Header: Alladin.pk Dual-Tier Header -->\n';
  newHtml += '  ' + pageHeader + '\n\n';
  newHtml += '  <!-- Mobile Navigation Drawer -->\n';
  newHtml += '  ' + pageDrawer + '\n\n';
  newHtml += '  <!-- Slide-Over Shopping Cart Drawer -->\n';
  newHtml += '  ' + pageCartDrawer + '\n\n';
  newHtml += '  ' + mainContent;
  
  if (specialModals) {
    newHtml += specialModals;
  }
  
  newHtml += '\n\n  <!-- 16. Alladin.pk Style Premium Footer -->\n';
  newHtml += '  ' + pageFooter + '\n\n';
  newHtml += '  <!-- Scripts -->\n';
  newHtml += '  <script src="../js/products.js"></script>\n';
  newHtml += '  <script src="../js/cart.js"></script>\n';
  newHtml += '  <script src="../js/app.js"></script>\n';
  
  if (inlineScripts.length > 0) {
    newHtml += '\n  ' + inlineScripts.join('\n\n  ') + '\n';
  }
  
  newHtml += '\n</body>\n</html>\n';
  
  fs.writeFileSync(filePath, newHtml, 'utf8');
  console.log(`Synchronized: ${f}`);
});

console.log('\nAll 29 pages successfully synchronized with index.html header and footer!');
