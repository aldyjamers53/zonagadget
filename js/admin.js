let isAdminLoggedIn = false;
let activeAdminTab = "stats";
let editingProductId = null;

function renderAdminDashboard() {
    const appView = document.getElementById('app-view');
    if (!isAdminLoggedIn) {
        renderAdminLogin();
        return;
    }

    appView.innerHTML = `
        <div class="admin-layout">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin-bottom:16px; gap:12px;">
                <h2>🔐 Panel Manajemen Katalog</h2>
                <button class="btn-danger" onclick="logoutAdmin()">Log Out</button>
            </div>

            <div class="admin-grid-nav">
                <button class="admin-tab-btn ${activeAdminTab==='stats'?'active':''}" onclick="switchAdminTab('stats')">📊 Statistik</button>
                <button class="admin-tab-btn ${activeAdminTab==='add-product'?'active':''}" onclick="switchAdminTab('add-product')">➕ ${editingProductId ? 'Edit' : 'Tambah'} Produk</button>
                <button class="admin-tab-btn ${activeAdminTab==='manage-products'?'active':''}" onclick="switchAdminTab('manage-products')">🛠 Kelola Produk</button>
                <button class="admin-tab-btn ${activeAdminTab==='settings'?'active':''}" onclick="switchAdminTab('settings')">⚙ Pengaturan & SEO</button>
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
    editingProductId = null;
    window.location.hash = "#/";
}

function switchAdminTab(tabName) {
    if (tabName !== 'add-product') editingProductId = null;
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
        `;
    } 
    else if (activeAdminTab === 'add-product') {
        const p = editingProductId ? products.find(prod => prod.id === editingProductId) : null;
        const imagesValue = p ? (Array.isArray(p.images) ? p.images.join(', ') : p.thumbnail) : '';

        target.innerHTML = `
            <h3 style="margin-bottom:16px;">${p ? '✏️ Edit Produk: ' + p.title : '➕ Form Tambah Produk Baru'}</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div class="form-group">
                    <label>Nama Produk</label>
                    <input type="text" id="form-title" class="form-control" value="${p ? p.title : ''}" placeholder="Contoh: POCO X7 Pro">
                </div>
                <div class="form-group">
                    <label>Slug URL</label>
                    <input type="text" id="form-slug" class="form-control" value="${p ? p.slug : ''}" placeholder="poco-x7-pro">
                </div>
                <div class="form-group">
                    <label>Brand</label>
                    <select id="form-brand" class="form-control">
                        ${BRANDS_LIST.map(b=>`<option value="${b}" ${p && p.brand===b ? 'selected':''}>${b}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Kategori</label>
                    <select id="form-category" class="form-control">
                        ${CATEGORIES_LIST.map(c=>`<option value="${c}" ${p && p.category===c ? 'selected':''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Harga Normal</label>
                    <input type="number" id="form-oldprice" class="form-control" value="${p ? p.old_price : 0}">
                </div>
                <div class="form-group">
                    <label>Harga Promo</label>
                    <input type="number" id="form-price" class="form-control" value="${p ? p.price : 0}">
                </div>
                <div class="form-group">
    <label for="product-images-input" style="font-weight: 600; display: block; margin-bottom: 8px;">
        URL Foto Produk (Bisa isi sampai 8 foto, pisahkan dengan tanda koma)
    </label>
    <input type="text" id="product-images-input" class="form-control" placeholder="Contoh: https://link.com/foto1.jpg, https://link.com/foto2.jpg" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px;">
</div>
                <div class="form-group" style="grid-column: 1/-1;">
                    <label>Link Affiliate Shopee</label>
                    <input type="text" id="form-aff" class="form-control" value="${p ? p.affiliate_url : 'https://shopee.co.id'}">
                </div>
                <div class="form-group" style="grid-column: 1/-1;">
                    <label>Deskripsi Lengkap</label>
                    <textarea id="form-desc" class="form-control" rows="4">${p ? p.description : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="form-status" class="form-control">
                        <option value="active" ${p && p.status==='active'?'selected':''}>Active</option>
                        <option value="inactive" ${p && p.status==='inactive'?'selected':''}>Inactive</option>
                    </select>
                </div>
            </div>
            <button class="btn-primary" style="margin-top:16px;" onclick="saveProductData()">${p ? 'Simpan Perubahan' : 'Publikasikan Produk'}</button>
        `;
        
        const titleIn = document.getElementById('form-title');
        const slugIn = document.getElementById('form-slug');
        if(!p) {
            titleIn.addEventListener('input', () => {
                slugIn.value = titleIn.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            });
        }
        updateAdminImagePreview(imagesValue);
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
                    <td>
                        <button class="btn-primary" style="padding:4px 8px; font-size:0.8rem; margin-right:4px;" onclick="startEditProduct(${p.id})">Edit</button>
                        <button class="btn-danger" style="padding:4px 8px; font-size:0.8rem;" onclick="deleteProduct(${p.id})">Hapus</button>
                    </td>
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

function updateAdminImagePreview(rawUrls) {
    const previewBox = document.getElementById('form-img-preview-box');
    if(!previewBox) return;
    previewBox.innerHTML = '';
    if(!rawUrls.trim()) return;

    let urls = rawUrls.split(',').map(url => url.trim()).filter(url => url !== '');
    if(urls.length > 8) urls = urls.slice(0, 8);

    urls.forEach(url => {
        let div = document.createElement('div');
        div.className = 'img-preview';
        div.innerHTML = `<img src="${url}" onerror="this.parentElement.innerHTML='<span style=color:red;font-size:10px>Error</span>'">`;
        previewBox.appendChild(div);
    });
}

function startEditProduct(id) {
    editingProductId = id;
    activeAdminTab = "add-product";
    renderAdminDashboard();
}

function saveProductData() {
    const title = document.getElementById('form-title').value;
    const slug = document.getElementById('form-slug').value;
    const brand = document.getElementById('form-brand').value;
    const category = document.getElementById('form-category').value;
    const old_price = parseInt(document.getElementById('form-oldprice').value) || 0;
    const price = parseInt(document.getElementById('form-price').value) || 0;
    const rawThumb = document.getElementById('form-thumb').value;
    const affiliate_url = document.getElementById('form-aff').value;
    const description = document.getElementById('form-desc').value;
    const status = document.getElementById('form-status').value;

    if(!title || !slug) { alert("Judul dan Slug wajib diisi!"); return; }

    let imageArray = rawThumb.split(',').map(url => url.trim()).filter(url => url !== '');
    if(imageArray.length === 0) {
        imageArray.push("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop");
    }
    const mainThumbnail = imageArray[0];

    if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = {
                ...products[index], title, slug, brand, category, price, old_price, description, affiliate_url, status,
                thumbnail: mainThumbnail, images: imageArray
            };
            alert("Produk berhasil diperbarui!");
        }
    } else {
        const newId = products.length > 0 ? Math.max(...products.map(p=>p.id)) + 1 : 1;
        products.unshift({
            id: newId, title, slug, brand, category, price, old_price, description, affiliate_url, status,
            thumbnail: mainThumbnail, images: imageArray
        });
        alert("Produk baru berhasil diterbitkan!");
    }
    
    localStorage.setItem('zg_products', JSON.stringify(products));
    editingProductId = null;
    switchAdminTab('manage-products');
}

function deleteProduct(id) {
    if(confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
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
