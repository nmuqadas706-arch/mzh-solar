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
  header = header.replace('class="mobile-top-nav-link active" data-nav="home"', 'class="mobile-top-nav-link" data-nav="home"');
  
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

  // Set active state on mobile top nav
  if (filename === 'about.html') {
    header = header.replace('class="mobile-top-nav-link" data-nav="about"', 'class="mobile-top-nav-link active" data-nav="about"');
  } else if (filename === 'installation.html') {
    header = header.replace('class="mobile-top-nav-link" data-nav="services"', 'class="mobile-top-nav-link active" data-nav="services"');
  } else if (filename === 'contact.html') {
    header = header.replace('class="mobile-top-nav-link" data-nav="contact"', 'class="mobile-top-nav-link active" data-nav="contact"');
  } else {
    // Ecommerce active
    header = header.replace('class="mobile-top-nav-item mobile-nav-dropdown" data-nav="ecommerce"', 'class="mobile-top-nav-item mobile-nav-dropdown active" data-nav="ecommerce"');
    header = header.replace('class="mobile-top-nav-link mobile-dropdown-toggle"', 'class="mobile-top-nav-link mobile-dropdown-toggle active"');
    
    // Highlight specific dropdown item in mobile dropdown
    if (filename === 'coffee-machines.html') {
      header = header.replace('href="coffee-machines.html" class="mobile-dropdown-item"', 'href="coffee-machines.html" class="mobile-dropdown-item active"');
    } else if (filename === 'cctv-security.html') {
      header = header.replace('href="cctv-security.html" class="mobile-dropdown-item"', 'href="cctv-security.html" class="mobile-dropdown-item active"');
    } else if (filename === 'shop.html') {
      header = header.replace('href="shop.html?cat=solar" class="mobile-dropdown-item"', 'href="shop.html?cat=solar" class="mobile-dropdown-item active"');
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
  newHtml += '  <!-- Floating WhatsApp Contact Button -->\n';
  newHtml += '  <a href="https://wa.me/923001234567?text=Hello%20MZH%20Solar,%20I%20am%20interested%20in%20solar%20products" target="_blank" rel="noopener noreferrer" class="floating-whatsapp-btn" title="Chat on WhatsApp" aria-label="Chat with MZH Solar on WhatsApp">\n';
  newHtml += '    <span class="floating-whatsapp-pulse"></span>\n';
  newHtml += '    <svg viewBox="0 0 24 24" class="floating-whatsapp-icon" width="30" height="30" fill="currentColor">\n';
  newHtml += '      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>\n';
  newHtml += '    </svg>\n';
  newHtml += '    <span class="floating-whatsapp-tooltip">Chat with us</span>\n';
  newHtml += '  </a>\n\n';
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
