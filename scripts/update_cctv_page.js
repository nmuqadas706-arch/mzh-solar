const fs = require('fs');

let content = fs.readFileSync('pages/cctv-security.html', 'utf8');

// Replace the camera type filter section
const oldFilters = `<div class="filter-box">
            <h4 class="filter-title">Camera Type</h4>
            <div class="filter-list">
              <label class="filter-label"><input type="radio" name="cctvType" value="All" checked onchange="applyCctvFilters()"> All Security Equipment</label>
              <label class="filter-label"><input type="radio" name="cctvType" value="IP Cameras" onchange="applyCctvFilters()"> IP PoE Cameras</label>
              <label class="filter-label"><input type="radio" name="cctvType" value="Wi-Fi Cameras" onchange="applyCctvFilters()"> Wireless Wi-Fi PTZ</label>
              <label class="filter-label"><input type="radio" name="cctvType" value="DVR / NVR" onchange="applyCctvFilters()"> NVR / DVR Recorders</label>
              <label class="filter-label"><input type="radio" name="cctvType" value="CCTV Accessories" onchange="applyCctvFilters()"> Surveillance HDDs & Wire</label>
            </div>
          </div>

          <div class="filter-box">
            <h4 class="filter-title">Brand</h4>
            <div class="filter-list" id="cctvBrandList">
              <label class="filter-label"><input type="checkbox" value="Hikvision" onchange="applyCctvFilters()"> Hikvision</label>
              <label class="filter-label"><input type="checkbox" value="Dahua" onchange="applyCctvFilters()"> Dahua</label>
              <label class="filter-label"><input type="checkbox" value="Imou (Dahua)" onchange="applyCctvFilters()"> Imou</label>
              <label class="filter-label"><input type="checkbox" value="Western Digital" onchange="applyCctvFilters()"> WD Purple</label>
            </div>
          </div>`;

const newFilters = `<div class="filter-box">
            <h4 class="filter-title">Camera Type</h4>
            <div class="filter-list">
              <label class="filter-label"><input type="radio" name="cctvType" value="All" checked onchange="applyCctvFilters()"> All Security Equipment</label>
              <label class="filter-label"><input type="radio" name="cctvType" value="Indoor Cameras" onchange="applyCctvFilters()"> Indoor Cameras</label>
              <label class="filter-label"><input type="radio" name="cctvType" value="Outdoor Cameras" onchange="applyCctvFilters()"> Outdoor Cameras</label>
              <label class="filter-label"><input type="radio" name="cctvType" value="WiFi & IP Cameras" onchange="applyCctvFilters()"> WiFi &amp; IP Cameras</label>
              <label class="filter-label"><input type="radio" name="cctvType" value="PTZ & 4G Cameras" onchange="applyCctvFilters()"> PTZ &amp; 4G Cameras</label>
              <label class="filter-label"><input type="radio" name="cctvType" value="DVR / NVR & Recording" onchange="applyCctvFilters()"> DVR / NVR &amp; Recording</label>
              <label class="filter-label"><input type="radio" name="cctvType" value="CCTV Accessories" onchange="applyCctvFilters()"> Accessories &amp; Storage</label>
            </div>
          </div>

          <div class="filter-box">
            <h4 class="filter-title">Brand</h4>
            <div class="filter-list" id="cctvBrandList">
              <label class="filter-label"><input type="checkbox" value="imou" onchange="applyCctvFilters()"> IMOU</label>
              <label class="filter-label"><input type="checkbox" value="OKASHA" onchange="applyCctvFilters()"> OKASHA</label>
              <label class="filter-label"><input type="checkbox" value="Hikvision" onchange="applyCctvFilters()"> Hikvision</label>
            </div>
          </div>`;

if (content.includes(oldFilters)) {
  content = content.replace(oldFilters, newFilters);
  console.log('Replaced filter section successfully');
} else {
  console.error('Could not find old filters! Attempting string-based replacement...');
  // Fallback: regex replacement
  content = content.replace(
    /(<div class="filter-box">[\s\S]*?<h4 class="filter-title">Camera Type<\/h4>[\s\S]*?<\/div>\s*<\/div>)[\s\S]*?(<div class="filter-box">[\s\S]*?id="cctvBrandList"[\s\S]*?<\/div>\s*<\/div>)/,
    newFilters
  );
  console.log('Used regex replacement');
}

// Replace the JS filter function
const oldScript = `    function applyCctvFilters() {
      const selectedType = document.querySelector('input[name="cctvType"]:checked')?.value || "All";
      const brands = Array.from(document.querySelectorAll('#cctvBrandList input:checked')).map(cb => cb.value);
      const sort = document.getElementById("cctvSort").value;

      let items = getProductsByCategory("CCTV & Security Products");

      if (selectedType !== "All") {
        items = items.filter(p => p.subCategory === selectedType);
      }
      if (brands.length > 0) {
        items = items.filter(p => brands.includes(p.brand));
      }

      if (sort === "price-low") items.sort((a, b) => a.price - b.price);
      else if (sort === "price-high") items.sort((a, b) => b.price - a.price);
      else if (sort === "rating") items.sort((a, b) => b.rating - a.rating);

      document.getElementById("cctvCount").textContent = items.length;
      document.getElementById("cctvGridContainer").innerHTML = items.map(renderProductCard).join("");
    }

    document.addEventListener("DOMContentLoaded", () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sub = urlParams.get("sub");
      if (sub) {
        const subMap = {
          "ip": "IP Cameras",
          "wifi": "Wi-Fi Cameras",
          "recorders": "DVR / NVR",
          "accessories": "CCTV Accessories"
        };
        const targetVal = subMap[sub.toLowerCase()];
        if (targetVal) {
          const radio = document.querySelector(\`input[name="cctvType"][value="\${targetVal}"]\`);
          if (radio) radio.checked = true;
        }
      }
      applyCctvFilters();
    });`;

const newScript = `    function applyCctvFilters() {
      const selectedType = document.querySelector('input[name="cctvType"]:checked')?.value || "All";
      const brands = Array.from(document.querySelectorAll('#cctvBrandList input:checked')).map(cb => cb.value);
      const sort = document.getElementById("cctvSort").value;

      let items = MZH_PRODUCTS.filter(p => p.category === "CCTV Accessories");

      if (selectedType !== "All") {
        items = items.filter(p => p.subCategory === selectedType);
      }
      if (brands.length > 0) {
        items = items.filter(p => brands.includes(p.brand));
      }

      if (sort === "price-low") items.sort((a, b) => a.price - b.price);
      else if (sort === "price-high") items.sort((a, b) => b.price - a.price);
      else if (sort === "rating") items.sort((a, b) => b.rating - a.rating);

      document.getElementById("cctvCount").textContent = items.length;
      document.getElementById("cctvGridContainer").innerHTML = items.map(renderProductCard).join("");
    }

    document.addEventListener("DOMContentLoaded", () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sub = urlParams.get("sub");
      if (sub) {
        const subMap = {
          "indoor": "Indoor Cameras",
          "outdoor": "Outdoor Cameras",
          "wifi": "WiFi & IP Cameras",
          "ptz": "PTZ & 4G Cameras",
          "recorders": "DVR / NVR & Recording",
          "accessories": "CCTV Accessories"
        };
        const targetVal = subMap[sub.toLowerCase()];
        if (targetVal) {
          const radio = document.querySelector(\`input[name="cctvType"][value="\${targetVal}"]\`);
          if (radio) radio.checked = true;
        }
      }
      applyCctvFilters();
    });`;

if (content.includes('getProductsByCategory("CCTV & Security Products")')) {
  content = content.replace(oldScript, newScript);
  console.log('Replaced JS filter function');
} else {
  // Simpler targeted replacement
  content = content.replace(
    'let items = getProductsByCategory("CCTV & Security Products");',
    'let items = MZH_PRODUCTS.filter(p => p.category === "CCTV Accessories");'
  );
  // Also update the subMap
  content = content.replace(
    `"ip": "IP Cameras",\n          "wifi": "Wi-Fi Cameras",\n          "recorders": "DVR / NVR",\n          "accessories": "CCTV Accessories"`,
    `"indoor": "Indoor Cameras",\n          "outdoor": "Outdoor Cameras",\n          "wifi": "WiFi & IP Cameras",\n          "ptz": "PTZ & 4G Cameras",\n          "recorders": "DVR / NVR & Recording",\n          "accessories": "CCTV Accessories"`
  );
  console.log('Did targeted JS replacements');
}

fs.writeFileSync('pages/cctv-security.html', content, 'utf8');
console.log('Saved cctv-security.html');

