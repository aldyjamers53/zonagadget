// STATE MANAGEMENT CONTEXT CLIENT
let currentFilterCategory = "Semua";
let currentFilterBrand = "Semua";
let currentSort = "terbaru";
let currentSearchQuery = "";

const appView = document.getElementById('app-view');
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');
const storeClosedNotice = document.getElementById('store-closed-notice');

// SIKLUS CONTROL OPERASIONAL TOKO TUTUP
function updateStoreNoticeBar() {
    if (settings.store_status === "CLOSED") {
        storeClosedNotice.textContent = settings.closed_message;
        storeClosedNotice.style.display = "block";
    } else {
        storeClosedNotice.style.display = "none";
    }
}
updateStoreNoticeBar();

// THEME TOGGLE CONTROLLER
if (localStorage.getItem('zg_theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = "☀️";
}
themeToggle.addEventListener('click', () => {
    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('zg_theme', 'light');
        themeToggle.textContent = "🌙";
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('zg_theme', 'dark');
        themeToggle.textContent = "☀️";
    }
});

// EVENT LISTENERS REAL-TIME SEARCHING
searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.toLowerCase();
    if (window.location.hash === "#/" || window.location.hash === "") {
        renderProductGrid();
    }
});

// ROUTING SPA ENGINE
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

function router() {
    const hash = window.location.hash || '#/';
    
    // Sembunyikan search-box otomatis ketika admin sedang bekerja di dashboard rahasia
    document.getElementById('global-search-box').style.display = hash.includes('/admin-panel-secret') ? 'none' : 'block';

    if (hash === '#/') {
        renderHomepage();
    } else if (hash.startsWith('#/product/')) {
        renderProductDetail(hash.replace('#/product/', ''));
    } else if (hash === '#/privacy-policy') {
        renderPrivacyPolicy();
    } else if (hash === '#/sitemap') {
        renderSitemapView();
    } else if (hash === '#/admin-panel-secret/') {
        renderAdminDashboard();
    } else {
        appView.innerHTML = `<h2 style="text-align:center; padding:48px;">Halaman Tidak Ditemukan (404)</h2>`;
    }
    window.scrollTo(0, 0);
}

function renderHomepage() {
    appView.innerHTML = `
        <section class="hero">
            <h1>Promo Smartphone Terbaru</h1>
            <p>Temukan smartphone dan gadget elektronik modern terbaik dengan harga promo coret spesial.</p>
            <button class="btn-primary" onclick="document.getElementById('catalog-section').scrollIntoView();">Jelajahi Produk</button>
        </section>

        <div class="categories" id="categories-container"></div>

        <div class="catalog-layout" id="catalog-section">
            <aside class="sidebar">
                <div class="filter-group">
                    <span class="filter-label">Urutan Harga</span>
                    <select id="sort-select" class="sort-select">
                        <option value="terbaru">Terbaru & Populer</option>
                        <option value="murah">Harga Termurah</option>
                        <option value="mahal">Harga Tertinggi</option>
                        <option value="diskon">Diskon Terbesar</option>
                    </select>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Filter Brand</span>
                    <div id="brand-filters-container" class="brand-grid"></div>
                </div>
            </aside>
            <div>
                <div class="products-grid" id="products-grid-target"></div>
            </div>
        </div>
    `;

    renderCategoryPills();
    renderBrandFilters();
    renderProductGrid();

    document.getElementById('sort-select').value = currentSort;
    document.getElementById('sort-select').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderProductGrid();
    });
}

function renderCategoryPills() {
    const container = document.getElementById('categories-container');
    const icons = { "Smartphone":"📱", "Laptop":"💻", "Smartwatch":"⌚", "Headset":"🎧", "Power Bank":"🔋", "Charger":"🔌" };
    let html = `<div class="category-pill ${currentFilterCategory === 'Semua' ? 'active' : ''}" onclick="setCategoryFilter('Semua')">🔥 Semua</div>`;
    CATEGORIES_LIST.forEach(cat => {
        html += `<div class="category-pill ${currentFilterCategory === cat ? 'active' : ''}" onclick="setCategoryFilter('${cat}')">${icons[cat] || "📦"} ${cat}</div>`;
    });
    container.innerHTML = html;
}

function renderBrandFilters() {
    const container = document.getElementById('brand-filters-container');
    let html = `<button class="brand-btn ${currentFilterBrand === 'Semua' ? 'active' : ''}" onclick="setBrandFilter('Semua')">Semua Brand</button>`;
    BRANDS_LIST.forEach(b => {
        html += `<button class="brand-btn ${currentFilterBrand === b ? 'active' : ''}" onclick="setBrandFilter('${b}')">${b}</button>`;
    });
    container.innerHTML = html;
}

function setCategoryFilter(cat) { currentFilterCategory = cat; renderCategoryPills(); renderProductGrid(); }
defineGlobal('setCategoryFilter', setCategoryFilter);

function setBrandFilter(b) { currentFilterBrand = b; renderBrandFilters(); renderProductGrid(); }
defineGlobal('setBrandFilter', setBrandFilter);

function renderProductGrid() {
    const gridTarget = document.getElementById('products-grid-target');
    let filtered = products.filter(p => p.status === 'active');

    if (currentFilterCategory !== 'Semua') filtered = filtered.filter(p => p.category === currentFilterCategory);
    if (currentFilterBrand !== 'Semua') filtered = filtered.filter(p => p.brand === currentFilterBrand);
    if (currentSearchQuery.trim() !== "") {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(currentSearchQuery) || p.brand.toLowerCase().includes(currentSearchQuery));
    }

    if (currentSort === "murah") filtered.sort((a,b) => a.price - b.price);
    else if (currentSort === "mahal") filtered.sort((a,b) => b.price - a.price);
    else if (currentSort === "diskon") filtered.sort((a,b) => ((b.old_price-b.price)/b.old_price) - ((a.old_price-a.price)/a.old_price));
    else filtered.sort((a,b) => b.id - a.id);

    if (filtered.length === 0) {
        gridTarget.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:48px; color:var(--text-secondary);">Produk tidak ditemukan.</p>`;
        return;
    }

    gridTarget.innerHTML = filtered.map(p => {
        let disc = Math.round(((p.old_price - p.price) / p.old_price) * 100);
        return `
            <div class="product-card">
                ${disc > 0 ? `<div class="badge-discount">-${disc}%</div>` : ''}
                <div class="product-thumb-wrapper">
                    <img class="product-thumb" src="${p.thumbnail}" alt="${p.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&auto=format&fit=crop'">
                </div>
                <span class="product-brand">${p.brand}</span>
                <h2 class="product-title">${p.title}</h2>
                <div class="product-prices">
                    <div class="price-old">Rp ${p.old_price.toLocaleString('id-ID')}</div>
                    <div class="price-promo">Rp ${p.price.toLocaleString('id-ID')}</div>
                </div>
                <a href="#/product/${p.slug}" class="btn-detail">Lihat Detail</a>
            </div>
        `;
    }).join('');
}

function renderProductDetail(slug) {
    const p = products.find(prod => prod.slug === slug);
    if (!p) { appView.innerHTML = `<h2>Produk Tidak Ditemukan</h2>`; return; }

    let disc = Math.round(((p.old_price - p.price) / p.old_price) * 100);
    document.title = `${p.title} - Promo Zona Gadget`;

    let btnHtml = settings.store_status === "CLOSED" 
        ? `<p style="background:#fee2e2; color:#991b1b; padding:12px; border-radius:12px; font-weight:700; text-align:center;">Toko Sedang Tutup Sementara</p>`
        : `<button class="btn-affiliate" onclick="window.open('${p.affiliate_url}', '_blank')">🛒 Beli di Shopee</button>`;

    appView.innerHTML = `
        <div style="margin-top:12px;"><a href="#/" style="color:var(--color-primary); font-weight:600;">&larr; Kembali</a></div>
        <div class="detail-layout">
            <div class="detail-img-box"><img src="${p.thumbnail}"></div>
            <div class="detail-info">
                <h1>${p.title}</h1>
                <div class="detail-prices-box">
                    <div>
                        <span style="text-decoration:line-through; font-size:0.8rem; color:var(--text-secondary)">Rp ${p.old_price.toLocaleString('id-ID')}</span>
                        <span class="detail-price-promo">Rp ${p.price.toLocaleString('id-ID')}</span>
                    </div>
                    ${disc > 0 ? `<div class="detail-discount-pill">Hemat ${disc}%</div>` : ''}
                </div>
                <p class="detail-desc">${p.description}</p>
                ${btnHtml}
            </div>
        </div>
    `;
}

function renderPrivacyPolicy() {
    appView.innerHTML = `<div style="background:var(--bg-surface); padding:32px; border-radius:16px;"><h1>Kebijakan Privasi</h1><p>Kami tidak memproses data finansial pribadi secara langsung.</p></div>`;
}

function renderSitemapView() {
    appView.innerHTML = `
        <div style="background:var(--bg-surface); padding:32px; border-radius:16px;">
            <h1>Sitemap Produk</h1>
            <ul>
                <li><a href="#/">Home</a></li>
                ${products.map(p=>`<li><a href="#/product/${p.slug}">${p.title}</a></li>`).join('')}
            </ul>
        </div>`;
}

// Global scope injection helper agar modul HTML inline onclick jalan lancar
function defineGlobal(name, fn) { window[name] = fn; }
