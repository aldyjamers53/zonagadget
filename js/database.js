// CONFIG & SEED CONSTANTS
const BRANDS_LIST = ["Samsung", "Apple", "Xiaomi", "POCO", "OPPO", "vivo", "Realme", "Infinix", "Tecno"];
const CATEGORIES_LIST = ["Smartphone", "Laptop", "Smartwatch", "Headset", "Power Bank", "Charger"];

function seedDatabaseIfEmpty() {
    if (!localStorage.getItem('zg_products')) {
        const dummyProducts = [];
        let idCounter = 1;
        
        const sampleModels = {
            "Samsung": [
                { m: "Galaxy S26 Ultra 5G", c: "Smartphone", p: 18999000, o: 19999000 },
                { m: "Galaxy A56 5G", c: "Smartphone", p: 5999000, o: 6499000 },
                { m: "Galaxy M36 5G", c: "Smartphone", p: 3499000, o: 3899000 },
                { m: "Galaxy Watch 8 Pro", c: "Smartwatch", p: 4499000, o: 4999000 },
                { m: "Galaxy Buds 3 Pro", c: "Headset", p: 2499000, o: 2799000 }
            ],
            "Apple": [
                { m: "iPhone 17 Pro Max", c: "Smartphone", p: 23499000, o: 24999000 },
                { m: "iPhone 16 Ultra", c: "Smartphone", p: 17499000, o: 18999000 },
                { m: "MacBook Air M4 Slim", c: "Laptop", p: 16299000, o: 17999000 },
                { m: "Apple Watch Series 11", c: "Smartwatch", p: 7299000, o: 7999000 },
                { m: "AirPods Max Gen 2", c: "Headset", p: 8199000, o: 8999000 }
            ],
            "Xiaomi": [
                { m: "Xiaomi 15 Ultra Pro", c: "Smartphone", p: 12999000, o: 13999000 },
                { m: "Redmi Note 15 Pro+ 5G", c: "Smartphone", p: 4999000, o: 5499000 },
                { m: "Redmi Book 15 Pro", c: "Laptop", p: 9499000, o: 10499000 },
                { m: "Xiaomi Watch S4", c: "Smartwatch", p: 1999000, o: 2299000 },
                { m: "Redmi Buds 6 Wireless", c: "Headset", p: 399000, o: 599000 }
            ],
            "POCO": [
                { m: "POCO F7 Pro Premium", c: "Smartphone", p: 6499000, o: 6999000 },
                { m: "POCO X7 Pro 5G", c: "Smartphone", p: 4199000, o: 4599000 },
                { m: "POCO M7 Pro Speed", c: "Smartphone", p: 2499000, o: 2799000 }
            ],
            "OPPO": [
                { m: "Find X8 Pro Advanced", c: "Smartphone", p: 14999000, o: 15999000 },
                { m: "Reno 13 Pro 5G", c: "Smartphone", p: 7299000, o: 7999000 },
                { m: "OPPO Enco X3 Air", c: "Headset", p: 1199000, o: 1499000 }
            ],
            "vivo": [
                { m: "X100 Ultra Pro Max", c: "Smartphone", p: 15499000, o: 16999000 },
                { m: "V40 Pro 5G Dual", c: "Smartphone", p: 6299000, o: 6799000 },
                { m: "vivo T3 Ultra Speed", c: "Smartphone", p: 3999000, o: 4399000 }
            ],
            "Realme": [
                { m: "Realme GT 6 Pro 5G", c: "Smartphone", p: 8999000, o: 9999000 },
                { m: "Realme 13 Pro+ Flagship", c: "Smartphone", p: 5199000, o: 5699000 },
                { m: "Realme Buds Air 6", c: "Headset", p: 699000, o: 899000 }
            ],
            "Infinix": [
                { m: "Zero 40 Ultra 5G", c: "Smartphone", p: 4699000, o: 5099000 },
                { m: "Note 50 Pro Max", c: "Smartphone", p: 2899000, o: 3299000 },
                { m: "GT 20 Pro Gaming", c: "Smartphone", p: 3599000, o: 3999000 }
            ],
            "Tecno": [
                { m: "Camon 30 Premier 5G", c: "Smartphone", p: 4299000, o: 4799000 },
                { m: "Pova 6 Pro Neo", c: "Smartphone", p: 2599000, o: 2999000 },
                { m: "Phantom V Fold 2", c: "Smartphone", p: 13999000, o: 14999000 }
            ]
        };

        const generalAccessories = [
            { m: "Powerbank GaN 20000mAh", c: "Power Bank", p: 450000, o: 699000, b: "Xiaomi" },
            { m: "Powerbank Magnetic Wireless 10k", c: "Power Bank", p: 389000, o: 550000, b: "Samsung" },
            { m: "Charger GaN 65W Triple Port", c: "Charger", p: 249000, o: 399000, b: "Xiaomi" },
            { m: "Charger SuperVOOC 100W Dual", c: "Charger", p: 350000, o: 499000, b: "OPPO" },
            { m: "MagSafe Fast Charger Duo", c: "Charger", p: 599000, o: 899000, b: "Apple" }
        ];

        // Loop untuk membuat 100+ variasi produk unik demi performa SEO skala besar
        for (let i = 1; i <= 4; i++) { 
            for (const brand in sampleModels) {
                sampleModels[brand].forEach(item => {
                    let slugSuffix = i > 1 ? `-${i}` : "";
                    let finalTitle = `${item.m}${i > 1 ? ' Gen ' + i : ''}`;
                    dummyProducts.push({
                        id: idCounter,
                        title: finalTitle,
                        slug: `${brand.toLowerCase()}-${item.m.toLowerCase().replace(/[^a-z0-9]+/g, '-')}${slugSuffix}`,
                        thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop",
                        brand: brand,
                        category: item.c,
                        price: Math.floor(item.p * (1 - (i * 0.02))), 
                        old_price: item.o,
                        description: `Spesifikasi premium dan bergaransi resmi. ${finalTitle} dirancang untuk memberikan kenyamanan mobilitas tinggi, performa chipset mutakhir, dan kamera profesional. Dapatkan penawaran harga flash sale eksklusif melalui link mitra e-commerce resmi kami hari ini.`,
                        affiliate_url: "https://shopee.co.id",
                        status: "active"
                    });
                    idCounter++;
                });
            }
        }
        
        generalAccessories.forEach(item => {
            dummyProducts.push({
                id: idCounter,
                title: `${item.b} ${item.m}`,
                slug: `${item.b.toLowerCase()}-${item.m.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                thumbnail: "https://images.unsplash.com/photo-1600541519463-ee3745293256?w=400&auto=format&fit=crop",
                brand: item.b,
                category: item.c,
                price: item.p,
                old_price: item.o,
                description: `Aksesoris daya tahan tinggi original ekosistem gadget Anda. Mendukung pengisian daya cepat dan aman.`,
                affiliate_url: "https://shopee.co.id",
                status: "active"
            });
            idCounter++;
        });

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

// Sinkronisasi Variabel State Global dari Local Storage
let products = JSON.parse(localStorage.getItem('zg_products'));
let settings = JSON.parse(localStorage.getItem('zg_settings'));
