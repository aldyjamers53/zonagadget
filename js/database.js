// CONFIG & SEED CONSTANTS
const BRANDS_LIST = ["Samsung", "Apple", "Xiaomi", "POCO", "OPPO", "vivo", "Realme", "Infinix", "Tecno"];
const CATEGORIES_LIST = ["Smartphone", "Laptop", "Smartwatch", "Headset", "Power Bank", "Charger"];

function seedDatabaseIfEmpty() {
    if (!localStorage.getItem('zg_products')) {
        const dummyProducts = [];
        let idCounter = 1;
        
        const sampleModels = {
            "Samsung": [{ m: "Galaxy S26 Ultra 5G", c: "Smartphone", p: 18999000, o: 19999000 }, { m: "Galaxy A56 5G", c: "Smartphone", p: 5999000, o: 6499000 }],
            "Apple": [{ m: "iPhone 17 Pro Max", c: "Smartphone", p: 23499000, o: 24999000 }, { m: "MacBook Air M4", c: "Laptop", p: 16299000, o: 17999000 }],
            "Xiaomi": [{ m: "Xiaomi 15 Ultra", c: "Smartphone", p: 12999000, o: 13999000 }, { m: "Redmi Note 15 Pro", c: "Smartphone", p: 4999000, o: 5499000 }],
            "POCO": [{ m: "POCO F7 Pro", c: "Smartphone", p: 6499000, o: 6999000 }, { m: "POCO X7 Pro 5G", c: "Smartphone", p: 4199000, o: 4599000 }]
        };

        // Buat variasi data berulang agar mencapai puluhan produk untuk simulasi link pagination
        for (let i = 1; i <= 5; i++) { 
            for (const brand in sampleModels) {
                sampleModels[brand].forEach(item => {
                    let slugSuffix = i > 1 ? `-${i}` : "";
                    let finalTitle = `${item.m}${i > 1 ? ' Gen ' + i : ''}`;
                    let imgPlaceholder = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop";
                    
                    dummyProducts.push({
                        id: idCounter,
                        title: finalTitle,
                        slug: `${brand.toLowerCase()}-${item.m.toLowerCase().replace(/[^a-z0-9]+/g, '-')}${slugSuffix}`,
                        thumbnail: imgPlaceholder,
                        images: [imgPlaceholder, "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400", "https://images.unsplash.com/photo-1600541519463-ee3745293256?w=400"],
                        brand: brand,
                        category: item.c,
                        price: Math.floor(item.p * (1 - (i * 0.01))), 
                        old_price: item.o,
                        description: `Spesifikasi premium dan bergaransi resmi. ${finalTitle} dirancang untuk mobilitas tinggi, performa chipset mutakhir, dan kamera profesional. Dapatkan penawaran harga flash sale eksklusif melalui link mitra e-commerce resmi kami hari ini.`,
                        affiliate_url: "https://shopee.co.id",
                        status: "active"
                    });
                    idCounter++;
                });
            }
        }
        localStorage.setItem('zg_products', JSON.stringify(dummyProducts));
    }
    
    if (!localStorage.getItem('zg_settings')) {
        const defaultSettings = {
            store_status: "OPEN", 
            closed_message: "Mohon maaf, pusat katalog Zona Gadget sedang melakukan sinkronisasi harga. Toko tutup sementara.",
            site_name: "Zona Gadget Indonesia",
            admin_user: "admin",
            admin_pass: "admin123",
            meta_title: "Zona Gadget Indonesia - Katalog Smartphone & Elektronik Promo Terbaik",
            meta_desc: "Temukan katalog smartphone dan gadget elektronik terbaru dengan harga promo setiap hari.",
            google_verification: "DEFAULT_VERIFICATION_CODE"
        };
        localStorage.setItem('zg_settings', JSON.stringify(defaultSettings));
    }
}
seedDatabaseIfEmpty();

let products = JSON.parse(localStorage.getItem('zg_products'));
let settings = JSON.parse(localStorage.getItem('zg_settings'));
