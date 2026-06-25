// =========================================================================
// SUNTIKAN SCRIPT PENYELAMAT ADMIN PANEL (VERSI PERBAIKAN FINAL)
// =========================================================================
function handlePublishProduct() {
    try {
        // Mengambil elemen secara presisi menggunakan selektor ID / Placeholder teks pembantu
        const nameInput = document.getElementById('product-name-input')?.value.trim() || 
                          document.querySelector('input[placeholder*="POCO"]')?.value.trim() || '';
                          
        const slugInput = document.getElementById('product-slug-input')?.value.trim() || 
                          document.querySelector('input[placeholder*="slug"]')?.value.trim() || '';
                          
        const brandSelect = document.getElementById('product-brand-select')?.value || 
                            document.querySelector('select')?.value || 'Samsung';
                            
        const categorySelect = document.getElementById('product-category-select')?.value || 'Smartphone';
        
        // Ambil elemen harga secara spesifik berdasarkan tipe angka
        const priceInputs = document.querySelectorAll('input[type="number"]');
        const oldPriceInput = parseFloat(priceInputs[0]?.value) || 0;
        const priceInput = parseFloat(priceInputs[1]?.value) || 0;
        
        const imagesInput = document.getElementById('product-images-input')?.value.trim() || 
                            document.querySelector('input[placeholder*="https://link.com"]')?.value.trim() || '';
                            
        const affiliateInput = document.getElementById('product-affiliate-input')?.value.trim() || 
                               document.querySelector('input[placeholder*="shopee"]')?.value.trim() || '';
                               
        const descInput = document.getElementById('product-desc-input')?.value.trim() || 
                          document.querySelector('textarea')?.value.trim() || '';
                          
        const statusSelect = document.getElementById('product-status-select')?.value || 'Active';

        // Validasi minimal nama produk wajib diisi
        if (!nameInput) {
            alert("Gagal memproses: Nama Produk tidak boleh kosong!");
            return;
        }

        // 2. Olah string URL gambar menjadi Array jika dipisah koma
        const imagesArray = imagesInput.split(',').map(url => url.trim()).filter(url => url !== '');
        const thumbnailImg = imagesArray.length > 0 ? imagesArray[0] : 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400';

        // 3. Susun objek produk baru sesuai struktur database.js
        const newProduct = {
            id: Date.now(), // Generate ID unik otomatis
            title: nameInput,
            slug: slugInput || nameInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            brand: brandSelect,
            category: categorySelect,
            old_price: oldPriceInput || priceInput,
            price: priceInput,
            thumbnail: thumbnailImg,
            images: imagesArray.length > 0 ? imagesArray : [thumbnailImg],
            affiliate_url: affiliateInput,
            description: descInput,
            status: statusSelect.toLowerCase() // Diubah ke 'active' kecil agar lolos filter grid depan
        };

        // 4. Ambil database lokal saat ini, gabungkan produk baru di urutan paling atas
        let currentProducts = JSON.parse(localStorage.getItem('zg_products')) || products;
        currentProducts.unshift(newProduct);

        // 5. Kunci penyimpanan ke LocalStorage dan Variabel Global App
        localStorage.setItem('zg_products', JSON.stringify(currentProducts));
        products = currentProducts;

        // 6. Tampilkan notifikasi sukses
        alert("🎉 Produk \"" + nameInput + "\" Berhasil Diterbitkan!");

        // 7. Alihkan halaman kembali ke beranda untuk melihat produk baru Anda
        window.location.hash = "#/";

    } catch (error) {
        alert("Sistem mendeteksi error saat menyimpan: " + error.message);
        console.error(error);
    }
}

// Daftarkan fungsi ke ranah global window agar atribut onclick HTML bisa memanggilnya
window.handlePublishProduct = handlePublishProduct;
defineGlobal('handlePublishProduct', handlePublishProduct);