/**
 * MZH SOLAR — Core Application JavaScript
 * Handles navigation, interactive modals, search autocomplete,
 * product card generation, live filters, order tracking, and client validations.
 */

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    initStickyHeader();
    initMobileNav();
    initCompactSearchToggle();
    initEcommerceDropdowns();
    initFloatingWhatsApp();
    initCategoriesDropdown();
    initSearchAutocomplete();
    initQuickViewModal();
    initCartDrawerTriggers();
    initBackToTop();
    initDealsCountdown();
    initFAQAccordion();
    initQuoteModal();
    initHeaderAuth();
    initHeroSlideshow();
    initCategoryCarousel();
    initHotDealsCarousel();
    initTouchImageSwaps();
  });
}

// --- 1. Sticky Header ---
function initStickyHeader() {
  const header = document.querySelector(".main-header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// --- 2. Mobile Navigation Drawer ---
function initMobileNav() {
  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  const drawer = document.querySelector(".mobile-nav-drawer");
  const overlay = document.querySelector(".mobile-nav-overlay");
  const closeBtn = document.querySelector(".mobile-nav-close");

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add("active");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  toggleBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);

  // Mobile submenu accordion toggle (Ecommerce)
  const subToggles = drawer.querySelectorAll(".mobile-nav-sub-toggle");
  subToggles.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const parent = btn.closest(".mobile-nav-has-sub");
      if (parent) {
        const isOpen = parent.classList.toggle("open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
    });
  });
}

// --- 2b. Ecommerce Dropdowns (Mobile & Desktop) ---
function initEcommerceDropdowns() {
  // Mobile Dropdown Toggle
  const mobileToggles = document.querySelectorAll("#mobileEcommerceToggle, .mobile-dropdown-toggle");
  mobileToggles.forEach(toggle => {
    const parentDropdown = toggle.closest(".mobile-nav-dropdown");
    if (!parentDropdown) return;

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const isOpen = parentDropdown.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  // Close mobile dropdown when tapping outside
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".mobile-nav-dropdown.open").forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
        const toggle = dropdown.querySelector(".mobile-dropdown-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".mobile-nav-dropdown.open").forEach(dropdown => {
        dropdown.classList.remove("open");
        const toggle = dropdown.querySelector(".mobile-dropdown-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    }
  });
}

// --- 2c. Compact Search Toggle (Mobile) ---
function initCompactSearchToggle() {
  const toggleBtn = document.getElementById("mobileSearchToggleBtn");
  const searchWrapper = document.getElementById("headerSearchWrapper") || document.querySelector(".alladin-search-wrapper");
  const closeBtn = document.getElementById("mobileSearchCloseBtn") || (searchWrapper && searchWrapper.querySelector(".search-close-btn"));
  if (!searchWrapper) return;

  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = searchWrapper.classList.toggle("mobile-expanded");
      toggleBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      toggleBtn.classList.toggle("active", isExpanded);
      if (isExpanded) {
        const input = searchWrapper.querySelector(".alladin-search-input, .header-search-input");
        if (input) {
          setTimeout(() => input.focus(), 60);
        }
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      searchWrapper.classList.remove("mobile-expanded");
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.classList.remove("active");
      }
    });
  }

  // Close search when clicking outside
  document.addEventListener("click", (e) => {
    if (searchWrapper.classList.contains("mobile-expanded")) {
      if (!searchWrapper.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
        searchWrapper.classList.remove("mobile-expanded");
        if (toggleBtn) {
          toggleBtn.setAttribute("aria-expanded", "false");
          toggleBtn.classList.remove("active");
        }
      }
    }
  });

  // Close search on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchWrapper.classList.contains("mobile-expanded")) {
      searchWrapper.classList.remove("mobile-expanded");
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.classList.remove("active");
      }
    }
  });
}

// --- 2c. Floating WhatsApp Button Guarantee ---
function initFloatingWhatsApp() {
  if (document.querySelector(".floating-whatsapp-btn")) return;
  const wa = document.createElement("a");
  wa.href = "https://wa.me/923001234567?text=Hello%20MZH%20Solar,%20I%20am%20interested%20in%20solar%20products";
  wa.target = "_blank";
  wa.rel = "noopener noreferrer";
  wa.className = "floating-whatsapp-btn";
  wa.title = "Chat on WhatsApp";
  wa.setAttribute("aria-label", "Chat with MZH Solar on WhatsApp");
  wa.innerHTML = `
    <span class="floating-whatsapp-pulse"></span>
    <svg viewBox="0 0 24 24" class="floating-whatsapp-icon" width="30" height="30" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
    <span class="floating-whatsapp-tooltip">Chat with us</span>
  `;
  document.body.appendChild(wa);
}

// --- 2d. All Categories Dropdown & Dynamic Consistency Safeguard ---
function initCategoriesDropdown() {
  const dropdown = document.querySelector(".categories-dropdown");
  const menuBtn = document.querySelector(".categories-menu-btn");
  const menu = document.querySelector(".categories-dropdown-menu");

  if (dropdown && menuBtn) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && dropdown.classList.contains("open")) {
        dropdown.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Desktop Ecommerce Dropdown Toggle
  const ecomToggles = document.querySelectorAll(".nav-dropdown-toggle");
  ecomToggles.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const parent = btn.closest(".nav-item-dropdown");
      if (parent) {
        const isOpen = parent.classList.toggle("open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
    });
  });

  document.addEventListener("click", (e) => {
    document.querySelectorAll(".nav-item-dropdown.open").forEach(dd => {
      if (!dd.contains(e.target)) {
        dd.classList.remove("open");
        const btn = dd.querySelector(".nav-dropdown-toggle");
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    });
  });

  // Consistency Safeguard: Ensure Coffee Machines is present in every page's category list
  if (menu) {
    const isInsidePagesDir = window.location.pathname.includes("/pages/");
    const coffeeUrl = isInsidePagesDir ? "coffee-machines.html" : "pages/coffee-machines.html";
    const hasCoffeeLink = Array.from(menu.querySelectorAll("a")).some(a => 
      a.getAttribute("href") && a.getAttribute("href").includes("coffee-machines")
    );

    if (!hasCoffeeLink) {
      const coffeeItem = document.createElement("a");
      coffeeItem.href = coffeeUrl;
      coffeeItem.className = "category-menu-item";
      coffeeItem.innerHTML = `
        <span class="cat-item-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
        </span>
        <span class="cat-item-name">Coffee Machines</span>
        <span class="cat-new-badge">NEW</span>
        <svg class="cat-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      `;
      const installItem = menu.querySelector('a[href*="installation"]');
      if (installItem) {
        menu.insertBefore(coffeeItem, installItem);
      } else {
        menu.appendChild(coffeeItem);
      }
    }
  }
}

// --- 3. Live Search Autocomplete ---
function initSearchAutocomplete() {
  const searchInputs = document.querySelectorAll(".header-search-input, .mobile-search-input");

  searchInputs.forEach(input => {
    const parent = input.closest("form");
    if (!parent) return;

    let dropdown = parent.querySelector(".search-suggestions-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-suggestions-dropdown";
      parent.appendChild(dropdown);
    }

    input.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query.length < 2) {
        dropdown.style.display = "none";
        dropdown.innerHTML = "";
        return;
      }

      const matches = getAllProducts().filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.subCategory.toLowerCase().includes(query) ||
        p.shortSpec.toLowerCase().includes(query)
      ).slice(0, 6);

      if (matches.length === 0) {
        dropdown.innerHTML = `
          <div style="padding: 14px 16px; font-size: 0.8125rem; color: #64748B;">
            No products found matching "<strong>${query}</strong>"
          </div>
        `;
        dropdown.style.display = "block";
        return;
      }

      dropdown.innerHTML = matches.map(item => `
        <a href="javascript:void(0)" class="search-suggestion-item" onclick="openQuickView('${item.id}')">
          <img src="${item.image}" alt="${item.name}" class="search-suggestion-thumb" onerror="this.src='https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=100&q=80'">
          <div class="search-suggestion-info">
            <div class="search-suggestion-name">${item.name}</div>
            <div class="search-suggestion-meta">${formatPKR(item.price)} • ${item.brand}</div>
          </div>
        </a>
      `).join("") + `
        <a href="${getRelativePath()}pages/search.html?q=${encodeURIComponent(query)}" style="display:block; padding:10px 14px; text-align:center; background:#F8FAFC; font-size:0.8125rem; font-weight:700; color:#0D3E2C; border-top:1px solid #E2E8F0;">
          View all results for "${query}" &rarr;
        </a>
      `;

      dropdown.style.display = "block";
    });

    // Close on outside click
    document.addEventListener("click", (evt) => {
      if (!parent.contains(evt.target)) {
        dropdown.style.display = "none";
      }
    });

    // Form submit -> go to search page
    parent.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (q) {
        window.location.href = `${getRelativePath()}pages/search.html?q=${encodeURIComponent(q)}`;
      }
    });
  });
}

// Relative path helper for root vs /pages/
function getRelativePath() {
  return window.location.pathname.includes("/pages/") ? "../" : "";
}

// --- 4. Product Card Template Generator ---
function renderProductCard(product) {
  const isWish = isInWishlist(product.id);
  const heartFill = isWish ? "#DC2626" : "none";
  const heartStroke = isWish ? "#DC2626" : "currentColor";
  const hasSecondary = Boolean(product.secondaryImage);
  const detailsUrl = `${getAuthPagePath('product-details.html')}?id=${encodeURIComponent(product.id)}`;

  return `
    <div class="product-card" data-id="${product.id}" data-category="${product.category}">
      <div class="product-card-top ${hasSecondary ? 'has-secondary-image' : ''}" style="cursor:pointer;" onclick="if(!event.target.closest('.product-wishlist-btn') && !event.target.closest('.card-angle-indicator')) window.location.href='${detailsUrl}';">
        ${product.badge ? `<span class="product-badge ${product.isHotDeal ? 'discount' : ''}">${product.badge}</span>` : ''}
        ${hasSecondary ? `
          <div class="card-angle-indicator" onclick="event.stopPropagation(); toggleCardImage(this);" title="Tap to switch angle" aria-label="Switch product image angle">
            <span class="angle-dot active"></span>
            <span class="angle-dot"></span>
            <span class="angle-label">2 Views</span>
          </div>
        ` : ''}
        <button type="button" class="product-wishlist-btn wishlist-btn ${isWish ? 'active' : ''}" data-id="${product.id}" onclick="event.stopPropagation(); toggleWishlist('${product.id}')" aria-label="Add to Wishlist">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${heartFill}" stroke="${heartStroke}" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <img src="${product.image}" alt="${product.name}" class="product-card-img product-card-img-primary" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=600&q=80'">
        ${hasSecondary ? `<img src="${product.secondaryImage}" alt="${product.name} (Alternate View)" class="product-card-img product-card-img-secondary" loading="lazy" onerror="this.style.display='none'">` : ''}
      </div>
      <div class="product-card-body">
        <span class="product-brand">${product.brand}</span>
        <h3 class="product-title" title="${product.name}">
          <a href="${detailsUrl}" style="color:inherit; text-decoration:none;">${product.name}</a>
        </h3>
        <div class="product-specs-pill" title="${product.shortSpec}">${product.shortSpec}</div>
        <div class="product-stock-status">
          <span class="stock-dot"></span>
          <span>In Stock • Ready to Dispatch</span>
        </div>
        <div class="product-price-row">
          <span class="product-current-price">${formatPKR(product.price)}</span>
          ${product.originalPrice ? `<span class="product-original-price">${formatPKR(product.originalPrice)}</span>` : ''}
          <span class="demo-price-tag">(Demo Price)</span>
        </div>
        <div class="product-action-group">
          <button type="button" class="btn-add-to-cart" onclick="addToCart('${product.id}', 1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Add to Cart
          </button>
          <button type="button" class="btn-quick-view" onclick="openQuickView('${product.id}')" aria-label="Quick View Product">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// --- 5. Quick View Modal ---
function initQuickViewModal() {
  let modal = document.getElementById("quickViewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quickViewModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content-card">
        <button type="button" class="modal-close-btn" onclick="closeQuickView()">&times;</button>
        <div id="quickViewContent" class="quickview-grid">
          <!-- Dynamic Content Injected Here -->
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeQuickView();
    });
  }
}

function switchQvImg(imgSrc, btn) {
  const mainImg = document.getElementById("qvMainImg");
  if (mainImg) mainImg.src = imgSrc;
  if (btn && btn.parentElement) {
    btn.parentElement.querySelectorAll(".qv-thumb-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  }
}

function openQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const content = document.getElementById("quickViewContent");
  const modal = document.getElementById("quickViewModal");
  if (!content || !modal) return;

  let specsHtml = "";
  if (product.specs) {
    specsHtml = Object.entries(product.specs).map(([k, v]) => `
      <tr>
        <td>${k}</td>
        <td><strong>${v}</strong></td>
      </tr>
    `).join("");
  }

  const thumbnailsHtml = product.secondaryImage ? `
    <div class="quickview-thumbs-row" style="display:flex; gap:8px; margin-top:10px;">
      <button type="button" class="qv-thumb-btn active" onclick="switchQvImg('${product.image}', this)" style="border:2px solid var(--color-primary); border-radius:6px; overflow:hidden; width:52px; height:52px; padding:0; background:none; cursor:pointer;" title="Primary Angle">
        <img src="${product.image}" alt="Primary View" style="width:100%; height:100%; object-fit:contain; background:#F8FAFC;">
      </button>
      <button type="button" class="qv-thumb-btn" onclick="switchQvImg('${product.secondaryImage}', this)" style="border:1.5px solid #CBD5E1; border-radius:6px; overflow:hidden; width:52px; height:52px; padding:0; background:none; cursor:pointer;" title="Alternate Angle">
        <img src="${product.secondaryImage}" alt="Alternate View" style="width:100%; height:100%; object-fit:contain; background:#F8FAFC;">
      </button>
    </div>
  ` : '';

  const detailsUrl = `${getAuthPagePath('product-details.html')}?id=${encodeURIComponent(product.id)}`;

  content.innerHTML = `
    <div class="quickview-media-col">
      <div class="quickview-stage-wrap">
        <img id="qvMainImg" src="${product.image}" alt="${product.name}" class="quickview-img" onerror="this.src='https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=700&q=80'">
      </div>
      ${thumbnailsHtml}
      <div class="quickview-guarantee-box" style="margin-top:14px; padding:10px 14px; background:#F8FAFC; border-radius:8px; font-size:0.78125rem; color:#64748B; border:1px solid #E2E8F0;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E5A919" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle; display:inline-block; margin-right:4px;"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg><strong>Official MZH Quality Guaranteed</strong>: Tested for Pakistani voltage fluctuations & temperature extremes.
      </div>
    </div>
    <div class="quickview-info-col" style="display:flex; flex-direction:column;">
      <div class="quickview-brand-sku" style="margin-bottom:6px; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#0D3E2C;">
        ${product.brand} &bull; SKU: ${product.sku}
      </div>
      <h2 class="quickview-title" style="font-size:1.35rem; font-weight:800; margin-bottom:10px; line-height:1.35; color:#192024;">
        <a href="${detailsUrl}" style="color:inherit; text-decoration:none;">${product.name}</a>
      </h2>
      
      <div class="quickview-price-row" style="display:flex; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <span class="quickview-price-val" style="font-size:1.45rem; font-weight:800; color:#0D3E2C;">${formatPKR(product.price)}</span>
        ${product.originalPrice ? `<span class="quickview-price-old" style="text-decoration:line-through; color:#94A3B8; font-size:0.95rem;">${formatPKR(product.originalPrice)}</span>` : ''}
        <span class="quickview-demo-badge" style="background:#EBF5F0; color:#0D3E2C; font-size:0.75rem; font-weight:800; padding:3px 8px; border-radius:4px;">Official Stock</span>
      </div>

      <p class="quickview-desc" style="font-size:0.84375rem; color:#475569; line-height:1.6; margin-bottom:14px;">
        ${product.description}
      </p>

      <div class="quickview-specs-wrapper" style="width:100%; overflow-x:auto; margin-bottom:14px;">
        <table class="quickview-specs-table" style="width:100%; border-collapse:collapse; font-size:0.78125rem;">
          <tbody>
            ${specsHtml}
          </tbody>
        </table>
      </div>

      <div class="quickview-actions-wrap" style="margin-top:auto; padding-top:14px; border-top:1px solid #F1F5F9; display:flex; flex-direction:column; gap:10px;">
        <div class="quickview-qty-row" style="display:flex; gap:10px; align-items:center;">
          <div class="qty-stepper" style="height:44px;">
            <button type="button" class="qty-btn" style="width:36px; height:100%; font-size:1.1rem;" onclick="adjustModalQty(-1)" aria-label="Decrease quantity">−</button>
            <span id="modalQtyVal" class="qty-val" style="min-width:40px; font-size:0.9375rem;">1</span>
            <button type="button" class="qty-btn" style="width:36px; height:100%; font-size:1.1rem;" onclick="adjustModalQty(1)" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="btn btn-primary qv-add-cart-btn" style="flex:1; min-height:44px; justify-content:center; font-weight:700;" onclick="addModalItemToCart('${product.id}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Add to Cart
          </button>
        </div>
        <a href="${detailsUrl}" class="qv-view-full-btn" style="display:inline-flex; align-items:center; justify-content:center; gap:6px; font-size:0.8125rem; font-weight:700; color:#0D3E2C; text-decoration:none; padding:8px; border:1px dashed #CBD5E1; border-radius:6px; background:#F8FAFC;">
          View Full Product Page &amp; Technical Specs &rarr;
        </a>
      </div>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

let currentModalQty = 1;
function adjustModalQty(delta) {
  currentModalQty = Math.max(1, currentModalQty + delta);
  const el = document.getElementById("modalQtyVal");
  if (el) el.textContent = currentModalQty;
}

function addModalItemToCart(productId) {
  addToCart(productId, currentModalQty, true);
  closeQuickView();
  currentModalQty = 1;
}

function closeQuickView() {
  const modal = document.getElementById("quickViewModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    currentModalQty = 1;
  }
}

// --- 6. Cart Drawer Triggers ---
function initCartDrawerTriggers() {
  const openButtons = document.querySelectorAll(".open-cart-drawer-btn");
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartDrawerOverlay");
  const closeBtn = document.getElementById("cartDrawerClose");

  function open() {
    renderCartDrawer();
    if (drawer) drawer.classList.add("active");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (drawer) drawer.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  openButtons.forEach(btn => btn.addEventListener("click", open));
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (overlay) overlay.addEventListener("click", close);
}

// --- 7. Back To Top Button ---
function initBackToTop() {
  let btn = document.querySelector(".back-to-top-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.className = "back-to-top-btn";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>`;
    document.body.appendChild(btn);
  }

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// --- 8. Hot Deals Countdown Timer ---
function initDealsCountdown() {
  const countdownEl = document.getElementById("dealsCountdown");
  if (!countdownEl) return;

  // 48 hours simulated rolling countdown
  function updateTimer() {
    const now = new Date();
    const hours = 23 - (now.getHours() % 24);
    const minutes = 59 - now.getMinutes();
    const seconds = 59 - now.getSeconds();

    const pad = (n) => String(n).padStart(2, "0");
    countdownEl.textContent = `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// --- 9. FAQ Accordions ---
function initFAQAccordion() {
  const items = document.querySelectorAll(".faq-accordion-item");
  items.forEach(item => {
    const trigger = item.querySelector(".faq-accordion-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // Close others
      items.forEach(i => i.classList.remove("open"));
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
}

// --- 10. Solar Quote Request Modal ---
function initQuoteModal() {
  let modal = document.getElementById("quoteModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quoteModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content-card" style="max-width:580px; padding:36px;">
        <button type="button" class="modal-close-btn" onclick="closeQuoteModal()">&times;</button>
        <span class="section-tag" style="margin-bottom:8px;">Custom Engineering</span>
        <h2 style="font-size:1.6rem; font-weight:800; color:#192024; margin-bottom:8px;">Get Your Free Solar Quote</h2>
        <p style="font-size:0.875rem; color:#64748B; margin-bottom:24px;">
          Our certified solar engineers analyze your monthly electricity bill to calculate optimal capacity and ROI.
        </p>
        <form id="quoteModalForm" onsubmit="handleQuoteSubmit(event)">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
            <div>
              <label style="display:block; font-size:0.8125rem; font-weight:700; margin-bottom:6px;">Your Name *</label>
              <input type="text" required placeholder="e.g. Tariq Mehmood" style="width:100%; padding:10px 14px; border:1px solid #CBD5E1; border-radius:8px; font-size:0.875rem;">
            </div>
            <div>
              <label style="display:block; font-size:0.8125rem; font-weight:700; margin-bottom:6px;">Phone / WhatsApp *</label>
              <input type="tel" required placeholder="0300-1234567" style="width:100%; padding:10px 14px; border:1px solid #CBD5E1; border-radius:8px; font-size:0.875rem;">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
            <div>
              <label style="display:block; font-size:0.8125rem; font-weight:700; margin-bottom:6px;">City / Location *</label>
              <input type="text" required placeholder="e.g. Lahore / Islamabad" style="width:100%; padding:10px 14px; border:1px solid #CBD5E1; border-radius:8px; font-size:0.875rem;">
            </div>
            <div>
              <label style="display:block; font-size:0.8125rem; font-weight:700; margin-bottom:6px;">Monthly Avg Bill (PKR) *</label>
              <select required style="width:100%; padding:10px 14px; border:1px solid #CBD5E1; border-radius:8px; font-size:0.875rem; background:#fff;">
                <option value="">Select Range</option>
                <option value="25-50k">PKR 25,000 - 50,000 (3kW - 5kW)</option>
                <option value="50-100k">PKR 50,000 - 100,000 (6kW - 10kW)</option>
                <option value="100-250k">PKR 100,000 - 250,000 (15kW - 25kW)</option>
                <option value="commercial">Commercial / Industrial 30kW+</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom:20px;">
            <label style="display:block; font-size:0.8125rem; font-weight:700; margin-bottom:6px;">System Interest</label>
            <select style="width:100%; padding:10px 14px; border:1px solid #CBD5E1; border-radius:8px; font-size:0.875rem; background:#fff;">
              <option>Hybrid Solar with Lithium Battery Backup</option>
              <option>On-Grid Solar with Net Metering (Green Meter)</option>
              <option>Off-Grid Solar System</option>
              <option>CCTV Security Surveillance Integration</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; font-size:1rem; padding:12px;">
            Request Personalized Proposal &rarr;
          </button>
          <div style="text-align:center; margin-top:12px; font-size:0.75rem; color:#94A3B8;">
            * Frontend demonstration: No personal information is transmitted to servers.
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

function openQuoteModal() {
  const modal = document.getElementById("quoteModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeQuoteModal() {
  const modal = document.getElementById("quoteModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function handleQuoteSubmit(e) {
  e.preventDefault();
  closeQuoteModal();
  showToast(
    "Quote Request Received!",
    "Thank you! Our technical solar consultant will get in touch on WhatsApp within 2 business hours (Simulated Demo).",
    "success"
  );
}

// --- 11. Customer Authentication & Header Account Flyout ---
function getAuthPagePath(pageName) {
  const isPagesDir = window.location.pathname.includes("/pages/") || window.location.pathname.includes("\\pages\\");
  return isPagesDir ? pageName : `pages/${pageName}`;
}

function getStoredAuthUser() {
  try {
    const raw = localStorage.getItem("mzh_auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function initHeaderAuth() {
  const user = getStoredAuthUser();
  const accountBtns = document.querySelectorAll(".header-action-btn[onclick*='openAccountModal']");
  
  accountBtns.forEach(btn => {
    if (user && user.name) {
      btn.title = `Account: ${user.name} (Verified)`;
      btn.style.position = "relative";
      let dot = btn.querySelector(".auth-active-dot");
      if (!dot) {
        dot = document.createElement("span");
        dot.className = "auth-active-dot";
        dot.style.cssText = "position:absolute; top:3px; right:3px; width:9px; height:9px; border-radius:50%; background:#10B981; border:2px solid #FFFFFF; pointer-events:none;";
        btn.appendChild(dot);
      }
    } else {
      btn.title = "Customer Login / Register";
      const dot = btn.querySelector(".auth-active-dot");
      if (dot) dot.remove();
    }
  });

  // Update mobile nav drawer links if present
  const mobileNavList = document.querySelector(".mobile-nav-list");
  if (mobileNavList) {
    let authItem = mobileNavList.querySelector(".mobile-auth-link");
    if (!authItem) {
      const allLinks = mobileNavList.querySelectorAll("li a");
      for (const a of allLinks) {
        const href = a.getAttribute("href") || "";
        if (href.includes("login.html") || href.includes("account.html")) {
          authItem = a.closest("li");
          authItem.classList.add("mobile-auth-link");
          break;
        }
      }
    }
    if (authItem) {
      if (user && user.name) {
        authItem.innerHTML = `<a href="${getAuthPagePath('account.html')}" style="color:var(--color-primary); font-weight:800; display:flex; align-items:center; justify-content:space-between;"><span>Portal: ${user.name}</span><span style="font-size:0.75rem; background:#DEF7EC; color:#03543F; padding:2px 8px; border-radius:10px;">Active</span></a>`;
      } else {
        authItem.innerHTML = `<a href="${getAuthPagePath('login.html')}">Sign In / Register</a>`;
      }
    }
  }
}

function openAccountModal(event) {
  const ev = event || (typeof window !== "undefined" ? window.event : null);
  if (ev) {
    if (ev.stopPropagation) ev.stopPropagation();
    if (ev.preventDefault) ev.preventDefault();
  }

  // Check if popover already exists - toggle behavior
  const existingPopover = document.querySelector(".header-account-popover");
  if (existingPopover) {
    existingPopover.remove();
    return;
  }

  const user = getStoredAuthUser();
  const triggerBtn = (ev && (ev.currentTarget || (ev.target && ev.target.closest(".header-action-btn")))) || document.querySelector(".header-action-btn[onclick*='openAccountModal']");
  const isMobile = window.innerWidth <= 992;

  const popover = document.createElement("div");
  popover.className = "header-account-popover";
  if (!user || !user.name) {
    popover.classList.add("is-guest");
  }

  if (user && user.name) {
    const initials = user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    popover.innerHTML = `
      <div class="popover-user-header">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <div style="width:36px; height:36px; border-radius:50%; background:rgba(229,169,25,0.25); border:1.5px solid var(--color-accent); color:var(--color-accent); font-size:0.875rem; font-weight:800; display:flex; align-items:center; justify-content:center;">${initials}</div>
          <div style="overflow:hidden;">
            <div class="popover-user-name">${user.name}</div>
            <div class="popover-user-email">${user.email || 'Customer Account'}</div>
          </div>
        </div>
        <div style="font-size:0.6875rem; color:#84E1BC; font-weight:700;">Verified Customer &bull; 6kW System Ready</div>
      </div>
      <div class="popover-menu-list">
        <a href="${getAuthPagePath('account.html')}" class="popover-menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard Overview
        </a>
        <a href="${getAuthPagePath('account.html')}#orders" class="popover-menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          My Orders & Shipments
        </a>
        <a href="${getAuthPagePath('account.html')}#addresses" class="popover-menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Saved Delivery Addresses
        </a>
        <a href="${getAuthPagePath('account.html')}#wishlist" class="popover-menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          My Saved Wishlist
        </a>
        <a href="javascript:void(0)" onclick="logoutUser()" class="popover-menu-item logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out of Account
        </a>
      </div>
    `;
  } else {
    popover.innerHTML = `
      <div class="popover-guest-header">
        <div class="popover-guest-title">Welcome to MZH Solar</div>
        <p style="font-size:0.75rem; color:#64748B; margin-bottom:12px;">Sign in to track orders, save solar quotes, and view warranties.</p>
        <a href="${getAuthPagePath('login.html')}" class="btn btn-primary" style="width:100%; padding:10px 14px; font-size:0.875rem; text-align:center; display:block;">
          Sign In to Portal &rarr;
        </a>
      </div>
      <div class="popover-menu-list">
        <div style="padding:10px 16px; font-size:0.8125rem; color:#64748B; border-bottom:1px solid #F1F5F9;">
          New customer? <a href="${getAuthPagePath('register.html')}" style="color:var(--color-primary); font-weight:700;">Start here &rarr;</a>
        </div>
        <a href="${getAuthPagePath('track-order.html')}" class="popover-menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Track Live Freight
        </a>
        <a href="${getAuthPagePath('quote.html')}" class="popover-menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Solar Sizing Calculator
        </a>
        <a href="${getAuthPagePath('packages.html')}" class="popover-menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Turnkey Solar Packages
        </a>
        <a href="${getAuthPagePath('contact.html')}" class="popover-menu-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Support: 0300-1234567
        </a>
      </div>
    `;
  }

  if (isMobile) {
    // Mobile positioning: position directly beneath the mobile navbar and center relative to account icon
    const mobileNav = document.querySelector(".mobile-top-nav");
    const header = (triggerBtn && triggerBtn.closest(".main-header")) || document.querySelector(".main-header");
    let topPos = 115;
    if (mobileNav && window.getComputedStyle(mobileNav).display !== "none") {
      const navRect = mobileNav.getBoundingClientRect();
      topPos = Math.round(navRect.bottom + 4);
    } else if (header) {
      const headerRect = header.getBoundingClientRect();
      topPos = Math.round(headerRect.bottom + 4);
    } else if (triggerBtn) {
      const btnRect = triggerBtn.getBoundingClientRect();
      topPos = Math.round(btnRect.bottom + 8);
    }

    const viewportW = window.innerWidth;
    const popoverWidth = Math.min(290, viewportW - 24);
    let leftPos;
    let caretPos = 145;

    if (triggerBtn) {
      const btnRect = triggerBtn.getBoundingClientRect();
      const btnCenter = btnRect.left + (btnRect.width / 2);
      leftPos = Math.round(btnCenter - (popoverWidth / 2));
      // Clamp within viewport margins
      if (leftPos < 12) leftPos = 12;
      if (leftPos + popoverWidth > viewportW - 12) {
        leftPos = viewportW - popoverWidth - 12;
      }
      caretPos = Math.round(btnCenter - leftPos);
      if (caretPos < 16) caretPos = 16;
      if (caretPos > popoverWidth - 16) caretPos = popoverWidth - 16;
    } else {
      leftPos = Math.round(viewportW - popoverWidth - 12);
    }

    popover.style.setProperty("--account-popover-top", topPos + "px");
    popover.style.setProperty("--account-popover-left", leftPos + "px");
    popover.style.setProperty("--account-popover-width", popoverWidth + "px");
    popover.style.setProperty("--caret-left", caretPos + "px");

    const maxH = Math.min(440, window.innerHeight - topPos - 16);
    popover.style.maxHeight = maxH + "px";

    document.body.appendChild(popover);
  } else {
    // Desktop: attach to .header-actions preserving exact desktop layout and styling
    const parentContainer = triggerBtn ? triggerBtn.closest(".header-actions") : document.querySelector(".header-actions") || document.body;
    if (!parentContainer) {
      window.location.href = user ? getAuthPagePath("account.html") : getAuthPagePath("login.html");
      return;
    }
    parentContainer.style.position = "relative";
    parentContainer.appendChild(popover);
  }

  function closePopover() {
    if (popover && popover.parentNode) {
      popover.remove();
    }
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", onResize);
  }

  function onDocClick(e) {
    if (!popover.contains(e.target) && (!triggerBtn || !triggerBtn.contains(e.target))) {
      closePopover();
    }
  }

  function onKeyDown(e) {
    if (e.key === "Escape" || e.keyCode === 27) {
      closePopover();
    }
  }

  function onResize() {
    closePopover();
  }

  // Close when any menu option or button inside the popover is selected
  popover.addEventListener("click", (e) => {
    const clickable = e.target.closest("a, button, .popover-menu-item");
    if (clickable) {
      setTimeout(closePopover, 80);
    }
  });

  setTimeout(() => {
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize, { passive: true });
  }, 20);
}

function logoutUser() {
  localStorage.removeItem("mzh_auth_user");
  const popover = document.querySelector(".header-account-popover");
  if (popover) popover.remove();
  initHeaderAuth();
  showToast("Logged Out", "You have successfully signed out of your customer account.", "info");

  if (window.location.pathname.includes("account.html")) {
    setTimeout(() => {
      window.location.href = getAuthPagePath("login.html");
    }, 700);
  }
}

// --- 12. Alladin.pk Visual Reference — Card Layout 02 Renderer ---
function renderProductCardAlladin(product) {
  const isWish = isInWishlist(product.id);
  const heartFill = isWish ? "#DC2626" : "none";
  const heartStroke = isWish ? "#DC2626" : "currentColor";
  const savings = (product.originalPrice && product.originalPrice > product.price) 
    ? product.originalPrice - product.price 
    : 0;
  const hasSecondary = Boolean(product.secondaryImage);
  const detailsUrl = `${getAuthPagePath('product-details.html')}?id=${encodeURIComponent(product.id)}`;

  // Rating stars HTML
  const starsCount = Math.floor(product.rating || 5);
  let starsHtml = "";
  for (let s = 1; s <= 5; s++) {
    const isFilled = s <= starsCount;
    starsHtml += `<svg width="12" height="12" viewBox="0 0 24 24" fill="${isFilled ? '#E5A919' : '#E2E8F0'}" stroke="${isFilled ? '#E5A919' : '#CBD5E1'}" stroke-width="1.5" style="display:inline-block; margin-right:1px; vertical-align:middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }

  return `
    <div class="product-card-alladin" data-id="${product.id}" data-category="${product.category}">
      <div class="pca-media ${hasSecondary ? 'has-secondary-image' : ''}" style="cursor:pointer;" onclick="if(!event.target.closest('.pca-quick-actions') && !event.target.closest('.card-angle-indicator')) window.location.href='${detailsUrl}';">
        ${product.discountPercent ? `<span class="pca-badge-discount">-${product.discountPercent}% OFF</span>` : (product.badge ? `<span class="pca-badge-hot">${product.badge}</span>` : '')}
        ${hasSecondary ? `
          <div class="card-angle-indicator" onclick="event.stopPropagation(); toggleCardImage(this);" title="Tap to switch angle" aria-label="Switch product image angle">
            <span class="angle-dot active"></span>
            <span class="angle-dot"></span>
            <span class="angle-label">2 Views</span>
          </div>
        ` : ''}
        
        <div class="pca-quick-actions">
          <button type="button" class="pca-action-btn wishlist-btn ${isWish ? 'active active-heart' : ''}" data-id="${product.id}" onclick="event.stopPropagation(); toggleWishlist('${product.id}')" title="Add to Wishlist" aria-label="Add to Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${heartFill}" stroke="${heartStroke}" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button type="button" class="pca-action-btn" onclick="openQuickView('${product.id}')" title="Quick View" aria-label="Quick View">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        <img src="${product.image}" alt="${product.name}" class="pca-img pca-img-primary" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=600&q=80'">
        ${hasSecondary ? `<img src="${product.secondaryImage}" alt="${product.name} (Alternate View)" class="pca-img pca-img-secondary" loading="lazy" onerror="this.style.display='none'">` : ''}
      </div>

      <div class="pca-body">
        <span class="pca-vendor">${product.brand}</span>
        <h3 class="pca-title" title="${product.name}">
          <a href="${detailsUrl}" style="color:inherit; text-decoration:none;">${product.name}</a>
        </h3>
        
        <div class="pca-rating">
          <span class="pca-stars">${starsHtml}</span>
          <span class="pca-reviews-count">(${product.reviewsCount || 12})</span>
        </div>

        <div class="pca-price-container">
          <div class="pca-price-row">
            <span class="pca-price-current">${formatPKR(product.price)}</span>
            ${product.originalPrice ? `<span class="pca-price-original">${formatPKR(product.originalPrice)}</span>` : ''}
          </div>
          ${savings > 0 ? `<div class="pca-savings-pill">Save ${formatPKR(savings)}</div>` : ''}
        </div>

        <button type="button" class="pca-btn-quick-add" onclick="addToCart('${product.id}', 1)">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Quick Add
        </button>
      </div>
    </div>
  `;
}

// --- Card Two-Image Angle Toggle for Touch Devices ---
function toggleCardImage(el) {
  const container = el.closest(".pca-media") || el.closest(".product-card-top");
  if (!container) return;
  container.classList.toggle("show-secondary");
}

// --- Horizontal Swipe Detection on Mobile to Switch Angles ---
function initTouchImageSwaps() {
  document.addEventListener("touchstart", function(e) {
    const media = e.target.closest(".pca-media.has-secondary-image, .product-card-top.has-secondary-image");
    if (!media) return;
    media._touchStartX = e.touches[0].clientX;
    media._touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener("touchend", function(e) {
    const media = e.target.closest(".pca-media.has-secondary-image, .product-card-top.has-secondary-image");
    if (!media || media._touchStartX === undefined) return;
    const diffX = e.changedTouches[0].clientX - media._touchStartX;
    const diffY = e.changedTouches[0].clientY - media._touchStartY;
    // Horizontal swipe threshold: > 35px horizontal and more horizontal than vertical
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      if (diffX < 0) {
        // Swiped left -> reveal alternate view
        media.classList.add("show-secondary");
      } else {
        // Swiped right -> reveal primary view
        media.classList.remove("show-secondary");
      }
    }
  }, { passive: true });
}

// --- 13. Hero Slideshow Auto-Play & Touch Navigation ---
let currentHeroSlideIndex = 0;
let heroSliderInterval = null;
let heroAutoPlayRestartTimeout = null;

function initHeroSlideshow() {
  const track = document.getElementById("heroSliderTrack");
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const prevBtn = document.getElementById("heroPrevBtn");
  const nextBtn = document.getElementById("heroNextBtn");
  const wrapper = document.querySelector(".hero-slider-wrapper");

  if (!track || slides.length === 0) return;
  if (track.dataset.sliderInitialized === "true") return;
  track.dataset.sliderInitialized = "true";

  function updateSlide(index) {
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    currentHeroSlideIndex = index;

    track.style.transform = `translateX(-${currentHeroSlideIndex * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentHeroSlideIndex);
    });
  }

  function nextSlide() {
    updateSlide(currentHeroSlideIndex + 1);
  }

  function prevSlide() {
    updateSlide(currentHeroSlideIndex - 1);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      queueRestartAutoPlay();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      queueRestartAutoPlay();
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      updateSlide(i);
      queueRestartAutoPlay();
    });
  });

  // Continuous Auto-Play
  function startAutoPlay() {
    stopAutoPlay();
    heroSliderInterval = setInterval(nextSlide, 3200); // Advances smoothly every 3.2 seconds
  }

  function stopAutoPlay() {
    if (heroSliderInterval) {
      clearInterval(heroSliderInterval);
      heroSliderInterval = null;
    }
  }

  function queueRestartAutoPlay(delay = 1800) {
    stopAutoPlay();
    if (heroAutoPlayRestartTimeout) clearTimeout(heroAutoPlayRestartTimeout);
    heroAutoPlayRestartTimeout = setTimeout(startAutoPlay, delay);
  }

  if (wrapper) {
    // Desktop hover: only pause when hovered with a mouse pointer
    wrapper.addEventListener("mouseenter", () => {
      stopAutoPlay();
    });
    wrapper.addEventListener("mouseleave", () => {
      startAutoPlay();
    });

    // Mobile / Tablet Touch Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;

    wrapper.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
      stopAutoPlay();
    }, { passive: true });

    wrapper.addEventListener("touchend", (e) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        // Ensure it was a horizontal swipe, not a vertical page scroll
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
          if (diffX > 0) {
            nextSlide(); // Swiped left -> next slide
          } else {
            prevSlide(); // Swiped right -> prev slide
          }
        }
      }
      queueRestartAutoPlay(1800);
    }, { passive: true });
  }

  // Window resize handler: Keep slide position aligned and autoplay active!
  window.addEventListener("resize", () => {
    updateSlide(currentHeroSlideIndex);
    if (!heroSliderInterval) {
      startAutoPlay();
    }
  });

  // Tab visibility change: resume autoplay when returning to tab
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
  });

  startAutoPlay();
}

// --- 14. Universal Auto-Scrolling Carousel Engine ---
const autoScrollRegistry = {};

function initAutoScrollCarousel(trackId, options = {}) {
  const track = document.getElementById(trackId);
  if (!track) return;

  const intervalTime = options.interval || 2800;
  let timer = null;
  let isInteracting = false;

  function getStep() {
    if (trackId === "hotDealsCarouselTrack" && window.innerWidth <= 768) {
      return track.clientWidth;
    }
    const firstChild = track.firstElementChild;
    if (firstChild) {
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || 0;
      return firstChild.offsetWidth + gap;
    }
    return track.clientWidth || 260;
  }

  function tick() {
    if (isInteracting || !track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 8) return; // not wide enough to scroll

    const step = getStep();
    if (track.scrollLeft >= maxScroll - 12) {
      // Loop smoothly back to beginning
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: step, behavior: "smooth" });
    }
  }

  function start() {
    stop();
    timer = setInterval(tick, intervalTime);
    autoScrollRegistry[trackId] = { start, stop, restart };
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function restart(delay = 2000) {
    stop();
    isInteracting = false;
    setTimeout(() => {
      start();
    }, delay);
  }

  // Hover Pause on Desktop
  track.addEventListener("mouseenter", () => {
    isInteracting = true;
    stop();
  });

  track.addEventListener("mouseleave", () => {
    isInteracting = false;
    start();
  });

  // Touch Interaction Pause on Mobile
  track.addEventListener("touchstart", () => {
    isInteracting = true;
    stop();
  }, { passive: true });

  track.addEventListener("touchend", () => {
    isInteracting = false;
    restart(2000);
  }, { passive: true });

  start();
}

function initCategoryCarousel() {
  initAutoScrollCarousel("categorySliderTrack", { interval: 2600 });
}

function initHotDealsCarousel() {
  initAutoScrollCarousel("hotDealsCarouselTrack", { interval: 3000 });
}

// --- 15. Horizontal Product Carousel Scroller ---
function scrollCarousel(containerId, distance) {
  const container = document.getElementById(containerId);
  if (container) {
    if (containerId === "hotDealsCarouselTrack" && window.innerWidth <= 768) {
      const dir = distance > 0 ? 1 : -1;
      container.scrollBy({ left: dir * container.clientWidth, behavior: "smooth" });
    } else {
      container.scrollBy({ left: distance, behavior: "smooth" });
    }
    if (autoScrollRegistry[containerId]) {
      autoScrollRegistry[containerId].restart(2400);
    }
  }
}

// --- 15. Quick Search via Trending Pill ---
function searchKeyword(term) {
  const input = document.querySelector(".alladin-search-input") || document.querySelector(".header-search-input");
  if (input) {
    input.value = term;
    const form = input.closest("form");
    if (form) form.dispatchEvent(new Event("submit"));
  } else {
    window.location.href = `${getRelativePath()}pages/search.html?q=${encodeURIComponent(term)}`;
  }
}

