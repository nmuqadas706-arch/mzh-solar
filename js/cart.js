/**
 * MZH Solar - Cart & Wishlist System (Vanilla JavaScript & LocalStorage)
 * Handles client-side cart operations, wishlist management, and toast notifications.
 */

const STORAGE_KEYS = {
  CART: "mzh_cart_items",
  WISHLIST: "mzh_wishlist_items",
  PROMO: "mzh_active_promo"
};

// Initialize Cart State from LocalStorage
function getCartItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading cart from localStorage", e);
    return [];
  }
}

function saveCartItems(items) {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
    updateHeaderBadges();
    renderCartDrawer();
    // Dispatch custom event so other components can react
    window.dispatchEvent(new CustomEvent("mzh:cartUpdated", { detail: { items } }));
  } catch (e) {
    console.error("Error saving cart to localStorage", e);
  }
}

// Add product to cart
function addToCart(productId, quantity = 1, showNotification = true) {
  const product = getProductById(productId);
  if (!product) {
    showToast("Error", "Product not found.", "error");
    return;
  }

  const items = getCartItems();
  const existing = items.find(item => item.id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      id: productId,
      quantity: quantity
    });
  }

  saveCartItems(items);

  if (showNotification) {
    showToast(
      "Added to Cart",
      `"${product.name}" added (${quantity > 1 ? quantity + ' items' : '1 item'}).`,
      "success"
    );
  }
}

// Remove single product from cart
function removeFromCart(productId) {
  const items = getCartItems();
  const filtered = items.filter(item => item.id !== productId);
  saveCartItems(filtered);
  showToast("Item Removed", "Product removed from your shopping cart.", "info");
}

// Update quantity
function updateCartQuantity(productId, delta) {
  const items = getCartItems();
  const item = items.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCartItems(items);
}

function setCartQuantity(productId, qty) {
  const items = getCartItems();
  const item = items.find(i => i.id === productId);
  if (!item) return;

  const validQty = parseInt(qty, 10);
  if (isNaN(validQty) || validQty <= 0) {
    removeFromCart(productId);
    return;
  }
  item.quantity = validQty;
  saveCartItems(items);
}

// Clear all items
function clearCart() {
  saveCartItems([]);
}

// Calculate financial totals
function getCartFinancials() {
  const items = getCartItems();
  let subtotal = 0;
  let totalItemsCount = 0;

  const hydratedItems = items.map(cartItem => {
    const product = getProductById(cartItem.id);
    if (!product) return null;
    const itemSubtotal = product.price * cartItem.quantity;
    subtotal += itemSubtotal;
    totalItemsCount += cartItem.quantity;
    return {
      ...product,
      quantity: cartItem.quantity,
      itemTotal: itemSubtotal
    };
  }).filter(Boolean);

  // Simulated shipping rule: Free delivery across Pakistan for orders above PKR 50,000, else PKR 2,500
  let shippingCost = subtotal > 50000 || subtotal === 0 ? 0 : 2500;

  // Coupon / promo code
  let promoDiscount = 0;
  const activePromo = localStorage.getItem(STORAGE_KEYS.PROMO);
  if (activePromo && activePromo.toUpperCase() === "MZHSOLAR5") {
    promoDiscount = Math.round(subtotal * 0.05); // 5% discount
  }

  const grandTotal = Math.max(0, subtotal + shippingCost - promoDiscount);

  return {
    items: hydratedItems,
    count: totalItemsCount,
    subtotal,
    shippingCost,
    promoDiscount,
    activePromo,
    grandTotal
  };
}

// --- Wishlist Management ---
function getWishlistItems() {
  try {
    let raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    // Backward compatibility check
    if (!raw) {
      raw = localStorage.getItem("mzh_wishlist");
      if (raw) {
        localStorage.setItem(STORAGE_KEYS.WISHLIST, raw);
      }
    }
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Ensure unique string IDs and filter empty
    return [...new Set(parsed.map(id => typeof id === "object" && id !== null ? (id.id || "") : String(id)).filter(Boolean))];
  } catch (e) {
    console.error("Error reading wishlist:", e);
    return [];
  }
}

// Global function alias for universal compatibility
function getWishlist() {
  return getWishlistItems();
}

if (typeof window !== "undefined") {
  window.getWishlistItems = getWishlistItems;
  window.getWishlist = getWishlistItems;
}

function isInWishlist(productId) {
  if (!productId) return false;
  const items = getWishlistItems();
  return items.includes(String(productId));
}

function addToWishlist(productId) {
  if (!productId) return false;
  const idStr = String(productId);
  let items = getWishlistItems();
  if (!items.includes(idStr)) {
    items.push(idStr);
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(items));
      localStorage.setItem("mzh_wishlist", JSON.stringify(items));
    } catch (e) {
      console.error("Error saving wishlist", e);
    }
    const product = typeof getProductById === "function" ? getProductById(idStr) : null;
    showToast("Added to Wishlist", `"${product ? product.name : 'Product'}" saved to your wishlist.`, "success");
    updateHeaderBadges();
    syncWishlistUI(idStr, true);
    window.dispatchEvent(new CustomEvent("mzh:wishlistUpdated", { detail: { items, addedId: idStr } }));
  }
  return true;
}

function removeFromWishlist(productId) {
  if (!productId) return false;
  const idStr = String(productId);
  let items = getWishlistItems();
  const exists = items.includes(idStr);
  if (exists) {
    items = items.filter(id => id !== idStr);
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(items));
      localStorage.setItem("mzh_wishlist", JSON.stringify(items));
    } catch (e) {
      console.error("Error updating wishlist", e);
    }
    const product = typeof getProductById === "function" ? getProductById(idStr) : null;
    showToast("Removed from Wishlist", `"${product ? product.name : 'Product'}" removed.`, "info");
    updateHeaderBadges();
    syncWishlistUI(idStr, false);
    window.dispatchEvent(new CustomEvent("mzh:wishlistUpdated", { detail: { items, removedId: idStr } }));
  }
  return true;
}

function toggleWishlist(productId) {
  if (!productId) return false;
  const idStr = String(productId);
  if (isInWishlist(idStr)) {
    removeFromWishlist(idStr);
    return false;
  } else {
    addToWishlist(idStr);
    return true;
  }
}

function syncWishlistUI(productId, isActive) {
  const idStr = String(productId);
  
  // 1. All product card heart buttons
  document.querySelectorAll(`.wishlist-btn[data-id="${idStr}"], .pca-action-btn[data-id="${idStr}"], .product-wishlist-btn[data-id="${idStr}"]`).forEach(btn => {
    btn.classList.toggle("active", isActive);
    btn.classList.toggle("active-heart", isActive);
    const icon = btn.querySelector("svg");
    if (icon) {
      icon.style.fill = isActive ? "#DC2626" : "none";
      icon.style.stroke = isActive ? "#DC2626" : "currentColor";
    }
  });

  // 2. Product Details Page wishlist button
  const pdpBtn = document.getElementById("pdpWishlistBtn");
  if (pdpBtn && typeof currentProduct !== "undefined" && currentProduct && String(currentProduct.id) === idStr) {
    pdpBtn.classList.toggle("active", isActive);
    const icon = pdpBtn.querySelector("svg");
    if (icon) {
      icon.style.fill = isActive ? "#DC2626" : "none";
      icon.style.stroke = isActive ? "#DC2626" : "currentColor";
    }
    const label = pdpBtn.querySelector(".pdp-wish-text");
    if (label) {
      label.textContent = isActive ? "Saved in Wishlist" : "Save to Wishlist";
    }
  }
}

// Expose functions globally on window
if (typeof window !== "undefined") {
  window.isInWishlist = isInWishlist;
  window.addToWishlist = addToWishlist;
  window.removeFromWishlist = removeFromWishlist;
  window.toggleWishlist = toggleWishlist;
  window.syncWishlistUI = syncWishlistUI;
}

// --- Header Badge Updater ---
function updateHeaderBadges() {
  const financials = getCartFinancials();
  const wishlist = getWishlistItems();

  document.querySelectorAll(".cart-count-badge").forEach(badge => {
    badge.textContent = financials.count;
    badge.style.display = financials.count > 0 ? "inline-flex" : "none";
  });

  document.querySelectorAll(".wishlist-count-badge").forEach(badge => {
    badge.textContent = wishlist.length;
    badge.style.display = wishlist.length > 0 ? "inline-flex" : "none";
  });
}

// --- Render Slide-Over Cart Drawer ---
function renderCartDrawer() {
  const container = document.getElementById("cartDrawerItems");
  const subtotalEl = document.getElementById("cartDrawerSubtotal");
  const footerEl = document.getElementById("cartDrawerFooter");
  const emptyEl = document.getElementById("cartDrawerEmpty");

  if (!container) return;

  const financials = getCartFinancials();

  if (financials.items.length === 0) {
    container.innerHTML = "";
    if (emptyEl) emptyEl.style.display = "flex";
    if (footerEl) footerEl.style.display = "none";
    if (subtotalEl) subtotalEl.textContent = formatPKR(0);
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";
  if (footerEl) footerEl.style.display = "block";
  if (subtotalEl) subtotalEl.textContent = formatPKR(financials.subtotal);

  container.innerHTML = financials.items.map(item => `
    <div class="cart-drawer-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="cart-drawer-img" onerror="this.src='https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=200&q=80'">
      <div class="cart-drawer-details">
        <h4 class="cart-drawer-title" title="${item.name}">${item.name}</h4>
        <div class="cart-drawer-price">${formatPKR(item.price)}</div>
        <div class="cart-drawer-qty-row">
          <div class="qty-stepper">
            <button type="button" class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)" aria-label="Decrease quantity">−</button>
            <span class="qty-val">${item.quantity}</span>
            <button type="button" class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="cart-remove-btn" onclick="removeFromCart('${item.id}')" aria-label="Remove item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

// --- Toast Notification Engine ---
function showToast(title, message, type = "success") {
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const icons = {
    success: `<svg class="toast-icon success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg class="toast-icon error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg class="toast-icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  };

  const toast = document.createElement("div");
  toast.className = `mzh-toast mzh-toast-${type}`;
  toast.innerHTML = `
    <div class="toast-body">
      ${icons[type] || icons.info}
      <div class="toast-text">
        <strong class="toast-heading">${title}</strong>
        <p class="toast-desc">${message}</p>
      </div>
      <button type="button" class="toast-close" aria-label="Close notification">&times;</button>
    </div>
  `;

  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.classList.add("toast-hiding");
    setTimeout(() => toast.remove(), 300);
  });

  toastContainer.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add("toast-showing");
  });

  // Auto remove after 4.2 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add("toast-hiding");
      setTimeout(() => toast.remove(), 300);
    }
  }, 4200);
}

// Auto init when document is ready
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    updateHeaderBadges();
    renderCartDrawer();
  });
}
