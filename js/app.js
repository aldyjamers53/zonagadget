// STATE MANAGEMENT CONTEXT CLIENT
let currentFilterCategory = "Semua";
let currentFilterBrand = "Semua";
let currentSort = "terbaru";
let currentSearchQuery = "";
let currentPage = 1;
const productsPerPage = 12; // Jumlah batasan limit produk per halaman link pagination

const appView = document.getElementById('app-view');
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');
const storeClosedNotice = document.getElementById('store-closed-notice');

function updateStoreNoticeBar() {
    if (settings.store_status === "CLOSED") {
        storeClosedNotice.textContent = settings.closed_message;
        storeClosedNotice.style.display = "block";
    } else {
        storeClosedNotice.style.display = "none";
    }
}
updateStoreNoticeBar();

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

searchInput.addEventListener('input', (e) => {
    currentPage = 1; // Reset halaman ke awal ketika mengetik pencarian baru
    currentSearchQuery = e.target.value.toLowerCase();
    if (window.location.hash === "#/" || window.location.hash === "") {
        renderProductGrid();
    }
});

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

function router() {
    const hash = window.location.hash || '#/';
    document.getElementById('global-search-box').style.display = hash.includes('/admin-panel-secret') ? 'none' : 'block';

    if (hash === '#/') renderHomepage();
    else if (hash.startsWith('#/product/')) renderProductDetail(hash.replace('#/product/', ''));
    else if (hash === '#/privacy-policy') renderPrivacyPolicy();
    else if (hash === '#/sitemap') renderSitemapView();
    else if (hash === '#/admin-panel-secret/') renderAdminDashboard();
    else appView.innerHTML = `<h2 style="text-align:center; padding:48px;">Halaman Tidak Ditemukan (404)</h2>`;
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
        currentPage = 1;
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

function setCategoryFilter(cat) { currentPage = 1; currentFilterCategory = cat; renderCategoryPills(); renderProductGrid(); }
defineGlobal('setCategoryFilter', setCategoryFilter);

function setBrandFilter(b) { currentPage = 1; currentFilterBrand = b; renderBrandFilters(); renderProductGrid(); }
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

    // LOGIKA GENERATOR PAGINATION
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / productsPerPage);
    if (currentPage > totalPages) currentPage = 1;

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filtered.slice(startIndex, endIndex);

    let productsHtml = paginatedProducts.map(p => {
        let disc = Math.round(((p.old_price - p.price) / p.old_price) * 100);
        return `
            <div class="product-card">
                ${disc > 0 ? `<div class="badge-discount">-${disc}%</div>` : ''}
                <div class="product-thumb-wrapper">
                    <img class="product-thumb" src="${p.thumbnail}" alt="${p.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400'">
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

    let paginationHtml = '';
    if (totalPages > 1) {
        paginationHtml = `<div class="pagination-container" style="grid-column:1/-1; display:flex; justify-content:center; align-items:center; gap:8px; margin-top:32px;">`;
        paginationHtml += `<button class="brand-btn" style="width:auto;" ${currentPage === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : `onclick="changePage(${currentPage - 1})"`}>&larr; Prev</button>`;
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<button class="brand-btn ${currentPage === i ? 'active' : ''}" style="width:auto; padding:8px 16px;" onclick="changePage(${i})">${i}</button>`;
        }
        paginationHtml += `<button class="brand-btn" style="width:auto;" ${currentPage === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : `onclick="changePage(${currentPage + 1})"`}>Next &rarr;</button></div>`;
    }

    gridTarget.innerHTML = productsHtml + paginationHtml;
}

function changePage(pageNumber) {
    currentPage = pageNumber;
    renderProductGrid();
    document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' });
}
defineGlobal('changePage', changePage);

function renderProductDetail(slug) {
    const p = products.find(prod => prod.slug === slug);
    if (!p) { appView.innerHTML = `<h2>Produk Tidak Ditemukan</h2>`; return; }

    let disc = Math.round(((p.old_price - p.price) / p.old_price) * 100);
    document.title = `${p.title} - Promo Zona Gadget`;

    let btnHtml = settings.store_status === "CLOSED" 
        ? `<p style="background:#fee2e2; color:#991b1b; padding:12px; border-radius:12px; font-weight:700; text-align:center;">Toko Sedang Tutup Sementara</p>`
        : `<button class="btn-affiliate" onclick="window.open('${p.affiliate_url}', '_blank')">🛒 Beli di Shopee</button>`;

    let allImages = Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.thumbnail];

    appView.innerHTML = `
        <div style="margin-top:12px;"><a href="#/" style="color:var(--color-primary); font-weight:600;">&larr; Kembali</a></div>
        <div class="detail-layout">
            <div>
                <div class="detail-img-box"><img id="main-detail-img" src="${allImages[0]}"></div>
                <div style="display:flex; gap:8px; margin-top:12px; overflow-x:auto; padding-bottom:4px;">
                    ${allImages.map((imgUrl, index) => `
                        <div style="width:60px; height:60px; border:2px solid ${index===0?'var(--color-primary)':'var(--border-color)'}; border-radius:8px; cursor:pointer; background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;" 
                             onclick="document.getElementById('main-detail-img').src='${imgUrl}'; this.parentElement.querySelectorAll('div').forEach(d=>d.style.borderColor='var(--border-color)'); this.style.borderColor='var(--color-primary)';">
                            <img src="${imgUrl}" style="max-height:100%; width:auto; object-fit:contain;">
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="detail-info">
                <span style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">${p.brand}</span>
                <h1 style="margin-top:4px;">${p.title}</h1>
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
    appView.innerHTML = `<div style="background:var(--bg-surface); padding:32px; border-radius:16px;"><h1>Sitemap Produk</h1><ul><li><a href="#/">Home</a></li>${products.map(p=>`<li><a href="#/product/${p.slug}">${p.title}</a></li>`).join('')}</ul></div>`;
}

function defineGlobal(name, fn) { window[name] = fn; }
