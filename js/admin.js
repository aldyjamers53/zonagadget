let isAdminLoggedIn = false;
let activeAdminTab = "stats";

function renderAdminDashboard() {
    const appView = document.getElementById('app-view');
    if (!isAdminLoggedIn) {
        renderAdminLogin();
        return;
    }

    appView.innerHTML = `
        <div class="admin-layout">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin-bottom:16px; gap:12px;">
                <h2>🔐 Secret Management Panel</h2>
                <button class="btn-danger" onclick="logoutAdmin()">Log Out Dashboard</button>
            </div>

            <div class="admin-grid-nav">
                <button class="admin-tab-btn ${activeAdminTab==='stats'?'active':''}" onclick="switchAdminTab('stats')">📊 Ringkasan Statistik</button>
                <button class="admin-tab-btn ${activeAdminTab==='add-product'?'active':''}" onclick="switchAdminTab('add-product')">➕ Tambah Produk</button>
                <button class="admin-tab-btn ${activeAdminTab==='manage-products'?'active':''}" onclick="switchAdminTab('manage-products')">🛠 Kelola Semua Produk</button>
                <button class="admin-tab-btn ${activeAdminTab==='settings'?'active':''}" onclick="switchAdminTab('settings')">⚙ Pengaturan Toko & SEO</button>
            </div>

            <div id="admin-tab-content"></div>
        </div>
    `;
    renderActiveTabContent();
}

function renderAdminLogin() {
    document.getElementById('app-view').innerHTML = `
        <div class="admin-login-box">
            <h2 style="text-align:center; margin-bottom:20px;">Admin Login Panel</h2>
            <div id="login-err" style="color:var(--color-accent); font-weight:600; text-align:center; margin-bottom:12px; display:none;">Kredensial Login Salah!</div>
            <div class="form-group">
                <label>Username</label>
                <input type="text" id="adm-user" class="form-control" placeholder="Masukkan username">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="adm-pass" class="form-control" placeholder="Masukkan password">
            </div>
            <button class="btn-primary" style="width:100%; margin-top:8px;" onclick="handleAdminLogin()">Masuk Ke Dashboard</button>
        </div>
    `;
}

function handleAdminLogin() {
    const u = document.getElementById('adm-user').value;
    const p = document.getElementById('adm-pass').value;
    if (u === settings.admin_user && p === settings.admin_pass) {
        isAdminLoggedIn = true;
        renderAdminDashboard();
    } else {
        document.getElementById('login-err').style.display = "block";
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    window.location.hash = "#/";
}

function switchAdminTab(tabName) {
    activeAdminTab = tabName;
    renderAdminDashboard();
}

function renderActiveTabContent() {
    const target = document.getElementById('admin-tab-content');
    
    if (activeAdminTab === 'stats') {
        let totalProd = products.length;
        let activeProd = products.filter(p => p.status === 'active').length;
        let inactiveProd = totalProd - activeProd;
        
        target.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-val">${totalProd}</div><div>Total Produk</div></div>
                <div class="stat-card"><div class="stat-val">${activeProd}</div><div>Produk Aktif</div></div>
                <div class="stat-card"><div class="stat-val">${inactiveProd}</div><div>Produk Nonaktif</div></div>
                <div class="stat-card"><div class="stat-val" style="color:${settings.store_status==='OPEN'?'#22c55e':'#ef4444'}">${settings.store_status}</div><div>Status Toko</div></div>
            </div>
            <p style="color:var(--text-secondary);">Gunakan opsi menu navigasi tab admin untuk memperbarui data.</p>
        `;
    } 
    else if (activeAdminTab === 'add-product') {
        target.innerHTML = `
            <h3 style="margin-bottom:16px;">Form Tambah Produk</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div class="form-group">
                    <label>Nama Produk</label>
                    <input type="text" id="form-title" class="form-control" placeholder="Contoh: POCO X7 Pro">
                </div>
                <div class="form-group">
                    <label>Slug URL</label>
                    <input type="text" id="form-slug" class="form-control" placeholder="poco-x7-pro">
                </div>
                <div class="form-group">
                    <label>Brand</label>
                    <select id="form-brand" class="form-control">
                        ${BRANDS_LIST.map(b=>`<option value="${b}">${b}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Kategori</label>
                    <select id="form-category" class="form-control">
                        ${CATEGORIES_LIST.map(c=>`<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Harga Normal</label>
                    <input type="number" id="form-oldprice" class="form-control" value="0">
                </div>
                <div class="form-group">
                    <label>Harga Promo</label>
                    <input type="number" id="form-price" class="form-control" value="0">
                </div>
                <div class="form-group" style="grid-column: 1/-1;">
                    <label>Thumbnail Gambar URL</label>
                    <input type="text" id="form-thumb" class="form-control" value="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop" oninput="updateAdminImagePreview(this.value)">
                    <div class="img-preview" id="form-img-preview-box">
                        <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop">
                    </div>
                </div>
                <div class="form-group" style="grid-column: 1/-1;">
                    <label>Link Affiliate Shopee</label>
                    <input type="text" id="form-aff" class="form-control" value="https://shopee.co.id">
                </div>
                <div class="form-group" style="grid-column: 1/-1;">
                    <label>Deskripsi Lengkap</label>
                    <textarea id="form-desc" class="form-control" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="form-status" class="form-control">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <button class="btn-primary" style="margin-top:16px;" onclick="saveNewProduct()">Publikasikan Produk</button>
        `;
        
        const titleIn = document.getElementById('form-title');
        const slugIn = document.getElementById('form-slug');
        titleIn.addEventListener('input', () => {
            slugIn.value = titleIn.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        });
    }
    else if (activeAdminTab === 'manage-products') {
        let html = `
            <div class="admin-table-wrapper">
                <table class="admin-table">
                    <thead>
                        <tr><th>ID</th><th>Produk</th><th>Brand</th><th>Harga Promo</th><th>Status</th><th>Aksi</th></tr>
                    </thead>
                    <tbody>
        `;
        products.forEach(p => {
            html += `
                <tr>
                    <td>${p.id}</td>
                    <td><strong>${p.title}</strong></td>
                    <td>${p.brand}</td>
                    <td>Rp ${p.price.toLocaleString('id-ID')}</td>
                    <td><span style="color:${p.status==='active'?'#22c55e':'#ef4444'}">${p.status.toUpperCase()}</span></td>
                    <td><button class="btn-danger" onclick="deleteProduct(${p.id})">Hapus</button></td>
                </tr>
            `;
        });
        html += `</tbody></table></div>`;
        target.innerHTML = html;
    }
    else if (activeAdminTab === 'settings') {
        target.innerHTML = `
            <h3 style="margin-bottom:16px;">Konfigurasi Toko & SEO</h3>
            <div class="form-group">
                <label>Status Operasional</label>
                <select id="set-status" class="form-control">
                    <option value="OPEN" ${settings.store_status==='OPEN'?'selected':''}>OPEN (Tombol Beli Aktif)</option>
                    <option value="CLOSED" ${settings.store_status==='CLOSED'?'selected':''}>CLOSED (Toko Tutup)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Pesan Toko Tutup</label>
                <input type="text" id="set-msg" class="form-control" value="${settings.closed_message}">
            </div>
            <div class="form-group">
                <label>Meta Title</label>
                <input type="text" id="set-title" class="form-control" value="${settings.meta_title}">
            </div>
            <div class="form-group">
                <label>Google Verification Code</label>
                <input type="text" id="set-gverify" class="form-control" value="${settings.google_verification}">
            </div>
            <div class="form-group">
                <label>Username Admin</label>
                <input type="text" id="set-user" class="form-control" value="${settings.admin_user}">
            </div>
            <div class="form-group">
                <label>Password Admin</label>
                <input type="password" id="set-pass" class="form-control" value="${settings.admin_pass}">
            </div>
            <button class="btn-primary" style="margin-top:12px;" onclick="saveStoreSettings()">Simpan Perubahan</button>
        `;
    }
}

function updateAdminImagePreview(url) {
    const previewBox = document.getElementById('form-img-preview-box');
    if(!url) { previewBox.innerHTML = ''; return; }
    const img = new Image();
    img.src = url;
    img.onload = () => previewBox.innerHTML = `<img src="${url}">`;
    img.onerror = () => previewBox.innerHTML = `<span style="color:red; font-size:0.75rem;">no-image.webp</span>`;
}

function saveNewProduct() {
    const title = document.getElementById('form-title').value;
    const slug = document.getElementById('form-slug').value;
    const brand = document.getElementById('form-brand').value;
    const category = document.getElementById('form-category').value;
    const old_price = parseInt(document.getElementById('form-oldprice').value) || 0;
    const price = parseInt(document.getElementById('form-price').value) || 0;
    const thumbnail = document.getElementById('form-thumb').value;
    const affiliate_url = document.getElementById('form-aff').value;
    const description = document.getElementById('form-desc').value;
    const status = document.getElementById('form-status').value;

    if(!title || !slug) { alert("Judul dan Slug wajib diisi!"); return; }

    const newId = products.length > 0 ? Math.max(...products.map(p=>p.id)) + 1 : 1;
    products.unshift({ id: newId, title, slug, brand, category, price, old_price, description, affiliate_url, status, thumbnail });
    
    localStorage.setItem('zg_products', JSON.stringify(products));
    alert("Produk berhasil diterbitkan!");
    switchAdminTab('manage-products');
}

function deleteProduct(id) {
    if(confirm("Hapus produk ini?")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('zg_products', JSON.stringify(products));
        renderActiveTabContent();
    }
}

function saveStoreSettings() {
    settings.store_status = document.getElementById('set-status').value;
    settings.closed_message = document.getElementById('set-msg').value;
    settings.meta_title = document.getElementById('set-title').value;
    settings.google_verification = document.getElementById('set-gverify').value;
    settings.admin_user = document.getElementById('set-user').value;
    settings.admin_pass = document.getElementById('set-pass').value;

    localStorage.setItem('zg_settings', JSON.stringify(settings));
    alert("Pengaturan diperbarui!");
    updateStoreNoticeBar();
    renderAdminDashboard();
      }
