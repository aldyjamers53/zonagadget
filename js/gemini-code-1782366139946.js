// =========================================================================
// CORE CONFIG & STATE MANAGEMENT
// =========================================================================
let currentFilterCategory = "Semua";
let currentFilterBrand = "Semua";
let currentSort = "terbaru";
let currentSearchQuery = "";
let currentPage = 1;
const productsPerPage = 12;

// Sinkronisasi data awal dari LocalStorage jika sudah ada
if (localStorage.getItem('zg_products')) {
    products = JSON.parse(localStorage.getItem('zg_products'));
}

const appView = document.getElementById('app-view');
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');
const storeClosedNotice = document.getElementById('store-closed-notice');

// Fungsi global untuk memperbarui baris pemberitahuan toko tutup
function updateStoreNoticeBar() {
    if (settings && settings.store_status === "CLOSED") {
        storeClosedNotice.textContent = settings.closed_message;
        storeClosedNotice.style.display = "block";
    } else {
        storeClosedNotice.style.display = "none";
    }
}
updateStoreNoticeBar();

// =========================================================================
// FITUR DARK MODE / THEME TOGGLE
// =========================================================================
if (localStorage.getItem('zg_theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = "☀️";
}

themeToggle.addEventListener('click', () => {
    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.textContent = "🌙";
        localStorage.setItem('zg_theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = "☀️";
        localStorage.setItem('zg_theme', 'dark');
    }
});

// =========================================================================
// GLOBAL SEARCH ACTION
// =========================================================================
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.trim().toLowerCase();
        currentPage = 1;
        if (window.location.hash === '#/' || window.location.hash === '') {
            renderHomepage();
        }
    });
}

// =========================================================================
// ROUTER SYSTEM (NAVIGASI)
// =========================================================================
function router() {
    // Selalu pastikan data sinkron dari localStorage setiap kali pindah halaman
    if (localStorage.getItem('zg_products')) {
        products = JSON.parse(localStorage.getItem('zg_products'));
    }
    if (localStorage.getItem('zg_settings')) {
        settings = JSON.parse(localStorage.getItem('zg_settings'));
    }

    const hash = window.location.hash || '#/';
    const searchBox = document.getElementById('global-search-box');

    // Sembunyikan kotak pencarian jika berada di luar halaman utama
    if (searchBox) {
        searchBox.style.display = (hash === '#/' || hash === '') ? 'block' : 'none';
    }

    if (hash === '#/' || hash === '') {
        renderHomepage();
    } else if (hash.startsWith('#/product/')) {
        const slug = hash.replace('#/product/', '');
        renderProductDetail(slug);
    } else if (hash === '#/privacy-policy') {
        renderPrivacyPolicy();
    } else if (hash === '#/sitemap') {
        renderSitemapView();
    } else if (hash.startsWith('#/admin-panel-secret')) {
        if (typeof renderAdminDashboard === 'function') {
            renderAdminDashboard();
        } else {
            appView.innerHTML = `<h2>Modul Admin belum dimuat dengan benar.</h2>`;
        }
    } else {
        appView.innerHTML = `<h2 style="text-align:center; padding:48px;">Halaman Tidak Ditemukan (404)</h2>`;
    }
    window.scrollTo(0, 0);
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// =========================================================================
// RENDER PAGES & VIEWS
// =========================================================================

function renderHomepage() {
    // 1. Filter Produk berdasarkan Kategori, Brand, dan Pencarian
    let filtered = products.filter(p => {
        // Cek kecocokan status (abaikan huruf besar/kecil)
        const isProductActive = p.status && (p.status.toLowerCase() === 'active');
        if (!isProductActive) return false;

        const matchCategory = currentFilterCategory === "Semua" || p.category === currentFilterCategory;
        const matchBrand = currentFilterBrand === "Semua" || p.brand === currentFilterBrand;
        const matchSearch = !currentSearchQuery || 
                            p.title.toLowerCase().includes(currentSearchQuery) || 
                            p.brand.toLowerCase().includes(currentSearchQuery);

        return matchCategory && matchBrand && matchSearch;
    });

    // 2. Pengurutan / Sorting
    if (currentSort === "termurah") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === "termahal") {
        filtered.sort((a, b) => b.price - a.price);
    } else {
        // Terbaru (berdasarkan ID terbesar)
        filtered.sort((a, b) => b.id - a.id);
    }

    // 3. Sistem Pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / productsPerPage) || 1;
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filtered.slice(startIndex, startIndex + productsPerPage);

    // 4. Bangun Komponen Filter Navigasi di HTML
    let html = `
        <div class="filter-wrapper" style="margin-bottom:20px;">
            <div class="filter-group">
                <select id="filter-category" class="sort-select" onchange="setFilter('category', this.value)">
                    <option value="Semua">Semua Kategori</option>
                    ${CATEGORIES_LIST.map(c => `<option value="${c}" ${currentFilterCategory===c?'selected':''}>${c}</option>`).join('')}
                </select>
                <select id="filter-brand" class="sort-select" onchange="setFilter('brand', this.value)">
                    <option value="Semua">Semua Brand</option>
                    ${BRANDS_LIST.map(b => `<option value="${b}" ${currentFilterBrand===b?'selected':''}>${b}</option>`).join('')}
                </select>
                <select id="sort-by" class="sort-select" onchange="setFilter('sort', this.value)">
                    <option value="terbaru" ${currentSort==='terbaru'?'selected':''}>Urutkan: Terbaru</option>
                    <option value="termurah" ${currentSort==='termurah'?'selected':''}>Urutkan: Termurah</option>
                    <option value="termahal" ${currentSort==='termahal'?'selected':''}>Urutkan: Termahal</option>
                </select>
            </div>
        </div>
    `;

    // 5. Render Grid Produk
    if (paginatedProducts.length === 0) {
        html += `<div style="text-align:center; padding:48px; color:var(--text-secondary);"><h3>Produk tidak ditemukan</h3></div>`;
    } else {
        html += `<div class="product-grid">`;
        paginatedProducts.forEach(p => {
            const hasDiscount = p.old_price && p.old_price > p.price;
            const discountPercentage = hasDiscount ? Math.round(((p.old_price - p.price) / p.old_price) * 100) : 0;

            html += `
                <div class="product-card" onclick="window.location.hash='#/product/${p.slug}'">
                    ${hasDiscount ? `<span class="badge-discount">-${discountPercentage}%</span>` : ''}
                    <div class="product-img-container">
                        <img src="${p.thumbnail}" alt="${p.title}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <span class="product-brand-tag">${p.brand}</span>
                        <h3 class="product-title">${p.title}</h3>
                        <div class="product-price-row">
                            <span class="price-current">Rp ${p.price.toLocaleString('id-ID')}</span>
                            ${hasDiscount ? `<span class="price-old">Rp ${p.old_price.toLocaleString('id-ID')}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        // Render Pagination Control
        if (totalPages > 1) {
            html += `<div class="pagination" style="display:flex; justify-content:center; gap:8px; margin-top:32px;">`;
            for (let page = 1; page <= totalPages; page++) {
                html += `
                    <button class="sort-select ${currentPage === page ? 'active' : ''}" 
                            style="${currentPage === page ? 'background:var(--color-primary); color:white;' : ''}"
                            onclick="changePage(${page})">${page}</button>
                `;
            }
            html += `</div>`;
        }
    }

    appView.innerHTML = html;
}

window.setFilter = function(type, value) {
    if (type === 'category') currentFilterCategory = value;
    if (type === 'brand') currentFilterBrand = value;
    if (type === 'sort') currentSort = value;
    currentPage = 1;
    renderHomepage();
};

window.changePage = function(page) {
    currentPage = page;
    renderHomepage();
    window.scrollTo(0, 0);
};

// =========================================================================
// VIEW: DETAIL PRODUK
// =========================================================================
function renderProductDetail(slug) {
    const p = products.find(prod => prod.slug === slug);
    if (!p) {
        appView.innerHTML = `<h2 style="text-align:center; padding:48px;">Produk Tidak Ditemukan</h2>`;
        return;
    }

    const images = Array.isArray(p.images) ? p.images : [p.thumbnail];
    const isStoreClosed = settings && settings.store_status === "CLOSED";

    appView.innerHTML = `
        <div style="margin-bottom: 16px;"><a href="#/" style="color:var(--color-primary); text-decoration:none; font-weight:600;">← Kembali ke Katalog</a></div>
        <div class="detail-container" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:24px; background:var(--bg-surface); padding:24px; border-radius:12px;">
            <div>
                <div style="border-radius:8px; overflow:hidden; background:#fff; text-align:center; margin-bottom:12px;">
                    <img id="main-detail-img" src="${p.thumbnail}" style="max-width:100%; height:auto; max-height:400px; object-fit:contain;">
                </div>
                <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px;">
                    ${images.map((img, i) => `
                        <img src="${img}" style="width:60px; height:60px; object-fit:cover; border-radius:4px; border:1px solid var(--border-color); cursor:pointer;" 
                             onclick="document.getElementById('main-detail-img').src='${img}'">
                    `).join('')}
                </div>
            </div>
            <div>
                <span class="product-brand-tag">${p.brand} | ${p.category}</span>
                <h1 style="margin-top:8px; margin-bottom:12px; font-size:1.8rem;">${p.title}</h1>
                <div style="margin-bottom:16px;">
                    <span style="font-size:1.6rem; font-weight:700; color:var(--color-accent);">Rp ${p.price.toLocaleString('id-ID')}</span>
                    ${p.old_price && p.old_price > p.price ? `<span style="text-decoration:line-through; color:var(--text-secondary); margin-left:12px;">Rp ${p.old_price.toLocaleString('id-ID')}</span>` : ''}
                </div>
                <div style="border-top:1px solid var(--border-color); padding-top:16px; margin-bottom:24px;">
                    <h3 style="margin-bottom:8px;">Deskripsi Produk</h3>
                    <p style="white-space:pre-line; line-height:1.6; color:var(--text-secondary);">${p.description}</p>
                </div>
                
                ${isStoreClosed ? `
                    <div style="background:#fee2e2; color:#ef4444; padding:12px; border-radius:8px; text-align:center; font-weight:600;">
                        🔒 ${settings.closed_message}
                    </div>
                ` : `
                    <a href="${p.affiliate_url}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="display:block; text-align:center; text-decoration:none; font-size:1.1rem; padding:14px;">
                        🛒 Beli Sekarang di Shopee
                    </a>
                `}
            </div>
        </div>
    `;
}

// =========================================================================
// VIEW: PRIVASI & SITEMAP
// =========================================================================
function renderPrivacyPolicy() {
    appView.innerHTML = `
        <div style="background:var(--bg-surface); padding:24px; border-radius:12px;">
            <h2>Kebijakan Privasi</h2>
            <p style="margin-top:12px; color:var(--text-secondary); line-height:1.6;">
                Zona Gadget Indonesia menghormati privasi Anda. Kami tidak mengumpulkan data pribadi atau informasi pelacakan sensitif apa pun di luar fungsionalitas penyimpanan lokal browser (LocalStorage) untuk preferensi tema halaman Anda. Semua tautan keluar ditujukan langsung ke marketplace Shopee resmi dan aman.
            </p>
        </div>
    `;
}

function renderSitemapView() {
    let sitemapLinks = products.map(p => `<li><a href="#/product/${p.slug}" style="color:var(--color-primary);">${p.title}</a></li>`).join('');
    appView.innerHTML = `
        <div style="background:var(--bg-surface); padding:24px; border-radius:12px;">
            <h2>Sitemap Referensi Katalog</h2>
            <ul style="margin-top:16px; padding-left:20px; line-height:2;">
                <li><a href="#/" style="color:var(--color-primary);">Halaman Utama Katalog</a></li>
                <li><a href="#/privacy-policy" style="color:var(--color-primary);">Kebijakan Privasi</a></li>
                ${sitemapLinks}
            </ul>
        </div>
    `;
}