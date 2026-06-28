const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const RAJAONGKIR_KEY = 'omp0ZgIf4281a2c8765a1bd4NvsskRkz';

function requestRajaOngkir(pathUrl, method, data = null) {
    return new Promise((resolve, reject) => {
        const isPost = method === 'POST';
        let postData = '';
        if (isPost && data) {
            postData = Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');
        }

        const options = {
            hostname: 'api.rajaongkir.com',
            path: '/starter' + pathUrl,
            method: method,
            headers: {
                'key': RAJAONGKIR_KEY,
                'Content-Type': isPost ? 'application/x-www-form-urlencoded' : 'application/json'
            }
        };

        if (isPost && postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (parsed.rajaongkir && parsed.rajaongkir.status && parsed.rajaongkir.status.code === 200) {
                        resolve(parsed.rajaongkir.results);
                    } else {
                        const errMsg = (parsed.rajaongkir && parsed.rajaongkir.status && parsed.rajaongkir.status.description) || 'RajaOngkir error';
                        reject(new Error(errMsg));
                    }
                } catch (e) {
                    reject(new Error('Invalid JSON response from RajaOngkir'));
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (isPost && postData) {
            req.write(postData);
        }
        req.end();
    });
}

const PORT = 3000;

// Read config from index.html
function getConfig() {
    const htmlPath = path.join(__dirname, 'index.html');
    if (!fs.existsSync(htmlPath)) {
        throw new Error('index.html not found in current directory');
    }
    const html = fs.readFileSync(htmlPath, 'utf8');
    const startMarker = '// --- MAHKOTA CONFIG START ---';
    const endMarker = '// --- MAHKOTA CONFIG END ---';
    const startIndex = html.indexOf(startMarker);
    const endIndex = html.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
        throw new Error('Config markers not found in index.html');
    }

    let configBlock = html.substring(startIndex + startMarker.length, endIndex).trim();
    configBlock = configBlock.replace(/^\s*const\s+mahkotaConfig\s*=\s*/, '');
    if (configBlock.endsWith(';')) {
        configBlock = configBlock.substring(0, configBlock.length - 1).trim();
    }

    // Safely evaluate javascript object
    const configObj = new Function('return ' + configBlock)();
    return configObj;
}

// Write config back to index.html
function saveConfig(configObj) {
    const htmlPath = path.join(__dirname, 'index.html');
    if (!fs.existsSync(htmlPath)) {
        throw new Error('index.html not found in current directory');
    }
    const html = fs.readFileSync(htmlPath, 'utf8');
    const startMarker = '// --- MAHKOTA CONFIG START ---';
    const endMarker = '// --- MAHKOTA CONFIG END ---';
    const startIndex = html.indexOf(startMarker);
    const endIndex = html.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
        throw new Error('Config markers not found in index.html');
    }

    const configStr = 'const mahkotaConfig = ' + JSON.stringify(configObj, null, 4) + ';';
    const newHtml = html.substring(0, startIndex + startMarker.length) 
        + '\n            ' + configStr 
        + '\n            ' + html.substring(endIndex);

    fs.writeFileSync(htmlPath, newHtml, 'utf8');
}

// Dashboard HTML String
const adminHtml = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin - Mahkota Aaronros</title>
    <!-- Google Fonts Outfit -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap" rel="stylesheet">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Outfit', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            red: '#C1121F',
                            darkred: '#780000',
                            yellow: '#F2BB05',
                            cream: '#FDF0D5',
                            dark: '#121212',
                            panel: '#1A1A1A'
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #121212;
            color: #FDF0D5;
        }
        .glass-panel {
            background: rgba(26, 26, 26, 0.85);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .gradient-btn {
            background: linear-gradient(135deg, #C1121F 0%, #780000 100%);
            transition: all 0.3s ease;
        }
        .gradient-btn:hover {
            box-shadow: 0 0 15px rgba(193, 18, 31, 0.4);
            transform: scale(1.02);
        }
        .tab-btn.active {
            border-bottom: 3px solid #F2BB05;
            color: #F2BB05;
            font-weight: 700;
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #121212;
        }
        ::-webkit-scrollbar-thumb {
            background: #2D2D2D;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #C1121F;
        }
    </style>
</head>
<body class="font-sans min-h-screen pb-12">
    <!-- Header banner -->
    <header class="bg-brand-panel border-b border-white/5 py-5 px-6 sticky top-0 z-40 shadow-xl">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <svg class="w-10 h-10 text-brand-red" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M15,75 L85,75 L80,85 L20,85 Z" />
                    <path d="M15,75 L12,40 L16,40 L18,70 Z" />
                    <path d="M32,75 L28,30 L32,30 L34,70 Z" />
                    <path d="M50,75 L50,18 L53,22 L47,22 Z" />
                    <circle cx="50" cy="18" r="5" fill="#F2BB05" />
                    <path d="M68,75 L72,30 L68,30 L66,70 Z" />
                    <path d="M85,75 L88,40 L84,40 L82,70 Z" />
                </svg>
                <div>
                    <h1 class="text-xl font-black tracking-wider text-brand-red">MAHKOTA <span class="text-white">AARONROS</span></h1>
                    <p class="text-xs text-gray-400 font-semibold tracking-widest uppercase">Admin Panel Dashboard</p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <a href="http://localhost:3000/preview" target="_blank" class="px-4 py-2 text-sm font-semibold border border-white/10 rounded-full hover:bg-white/5 transition-all">Lihat Web</a>
                <button onclick="saveAllSettings()" class="px-6 py-2 rounded-full font-bold text-black bg-brand-yellow hover:bg-yellow-500 transition-all shadow-lg hover:scale-105">Simpan Perubahan</button>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">        <!-- Tabs Nav -->
        <div class="flex border-b border-white/5 mb-8 overflow-x-auto">
            <button onclick="switchTab('store')" id="tab-store" class="tab-btn active px-6 py-3 font-semibold text-gray-400 hover:text-white transition-all whitespace-nowrap">Toko & WhatsApp</button>
            <button onclick="switchTab('travel')" id="tab-travel" class="tab-btn px-6 py-3 font-semibold text-gray-400 hover:text-white transition-all whitespace-nowrap">Perjalanan Rasa</button>
            <button onclick="switchTab('products')" id="tab-products" class="tab-btn px-6 py-3 font-semibold text-gray-400 hover:text-white transition-all whitespace-nowrap">Katalog Produk</button>
            <button onclick="switchTab('media')" id="tab-media" class="tab-btn px-6 py-3 font-semibold text-gray-400 hover:text-white transition-all whitespace-nowrap">Galeri Media</button>
            <button onclick="switchTab('invoice')" id="tab-invoice" class="tab-btn px-6 py-3 font-semibold text-gray-400 hover:text-white transition-all whitespace-nowrap">Invoice TipTop</button>
            <button onclick="switchTab('shipping')" id="tab-shipping" class="tab-btn px-6 py-3 font-semibold text-gray-400 hover:text-white transition-all whitespace-nowrap">Kalkulator Shipping</button>
            <button onclick="switchTab('qrcode')" id="tab-qrcode" class="tab-btn px-6 py-3 font-semibold text-gray-400 hover:text-white transition-all whitespace-nowrap">Generator QR Code</button>
        </div>
        <!-- Notification Banner -->
        <div id="toast" class="fixed top-24 right-6 glass-panel text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 transition-all duration-300 transform translate-y-[-20px] opacity-0 pointer-events-none z-50">
            <span class="text-2xl" id="toast-icon">🎉</span>
            <div>
                <h4 class="font-bold text-sm" id="toast-title">Berhasil!</h4>
                <p class="text-xs text-gray-400" id="toast-desc">Perubahan telah disimpan ke website.</p>
            </div>
        </div>

        <!-- STORE CONFIG TAB -->
        <section id="sect-store" class="space-y-6">
            <div class="grid md:grid-cols-12 gap-8">
                <!-- Inputs -->
                <div class="md:col-span-8 glass-panel p-8 rounded-3xl space-y-6">
                    <h3 class="text-xl font-extrabold text-brand-yellow border-b border-white/5 pb-3">Profil Kontak & Alamat</h3>
                    
                    <div class="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Nomor WA Order (Tanpa Simbol)</label>
                            <input type="text" id="waNumber" class="w-full bg-[#222] border border-white/10 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all" placeholder="Contoh: 628118776635">
                            <span class="text-[10px] text-gray-400 mt-1 block">Format: 62 + nomor hp (Gunakan kode negara, no + atau 0)</span>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Display Nomor WA di Footer</label>
                            <input type="text" id="waDisplay" class="w-full bg-[#222] border border-white/10 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all" placeholder="Contoh: 0811-8776-635 / 0811-979-3011">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Alamat Lengkap Toko</label>
                        <textarea id="storeAddress" rows="4" class="w-full bg-[#222] border border-white/10 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all" placeholder="Tuliskan nama blok, kelurahan, kecamatan, kota..."></textarea>
                    </div>
                </div>

                <!-- Info Help -->
                <div class="md:col-span-4 bg-[#1A1A1A]/50 p-6 rounded-3xl border border-white/5 space-y-4">
                    <div class="text-3xl text-brand-yellow">💡 Info Setup</div>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        Data ini digunakan oleh formulir kalkulator pesanan cepat untuk mengirim pesan WhatsApp ke admin.
                    </p>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        Pastikan <strong>Nomor WA Order</strong> diisi dengan format digit murni (tanpa tanda tambah atau tanda pisah) agar link WhatsApp API tidak error.
                    </p>
                </div>
            </div>
        </section>

        <!-- TRAVEL LOG CONFIG TAB -->
        <section id="sect-travel" class="hidden space-y-6">
            <div class="glass-panel p-8 rounded-3xl space-y-6">
                <h3 class="text-xl font-extrabold text-brand-yellow border-b border-white/5 pb-3">Perjalanan Inspirasi & Bekal Resep</h3>
                <p class="text-sm text-gray-400">Sunting catatan perjalanan kuliner Ibu Rosniati, ST di setiap kota inspirasi:</p>

                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-brand-red mb-2">1. Pekanbaru & Duri</label>
                        <textarea id="travel-pekanbaru" rows="4" class="w-full bg-[#222] border border-white/10 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm"></textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-brand-red mb-2">2. Batam</label>
                        <textarea id="travel-batam" rows="4" class="w-full bg-[#222] border border-white/10 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm"></textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-brand-red mb-2">3. Ipoh (Malaysia)</label>
                        <textarea id="travel-malaysia" rows="4" class="w-full bg-[#222] border border-white/10 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm"></textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-brand-red mb-2">4. Jakarta & Tangsel</label>
                        <textarea id="travel-jakarta" rows="4" class="w-full bg-[#222] border border-white/10 px-4 py-3 rounded-xl focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all text-sm"></textarea>
                    </div>
                </div>
            </div>
        </section>

        <!-- PRODUCT CONFIG TAB -->
        <section id="sect-products" class="hidden space-y-6">
            <div class="flex justify-between items-center">
                <h3 class="text-xl font-extrabold text-brand-yellow">Katalog Produk Terdaftar</h3>
                <button onclick="openProductModal(null)" class="px-5 py-2.5 rounded-full text-sm font-bold text-black bg-brand-yellow hover:bg-yellow-500 transition-all flex items-center space-x-2">
                    <span>➕ Tambah Produk</span>
                </button>
            </div>

            <div class="glass-panel rounded-3xl overflow-hidden shadow-2xl">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-white/5 text-xs font-bold uppercase tracking-wider border-b border-white/5">
                            <th class="p-6">Produk</th>
                            <th class="p-6">Kategori</th>
                            <th class="p-6">Visual Kemasan</th>
                            <th class="p-6">Harga Calculator</th>
                            <th class="p-6 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="product-rows" class="divide-y divide-white/5 text-sm">
                        <!-- Loaded dynamically -->
                    </tbody>
                </table>
            </div>
        </section>

        <!-- MEDIA GALLERY TAB -->
        <section id="sect-media" class="hidden space-y-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 class="text-xl font-extrabold text-brand-yellow">Galeri Media & Gambar</h3>
                    <p class="text-sm text-gray-400">Unggah foto produk, logo, atau dokumentasi pelatihan ke folder <code class="bg-black/30 px-1.5 py-0.5 rounded text-brand-yellow">gambar/</code>.</p>
                </div>
                <div class="flex items-center space-x-3">
                    <label class="px-5 py-2.5 rounded-full text-sm font-bold text-black bg-brand-yellow hover:bg-yellow-500 transition-all cursor-pointer flex items-center space-x-2 shadow-lg">
                        <span>📤 Unggah File</span>
                        <input type="file" id="media-upload-input" class="hidden" accept="image/*,video/mp4" onchange="handleMediaUpload(this)">
                    </label>
                </div>
            </div>

            <!-- Upload Status Banner -->
            <div id="upload-status" class="hidden glass-panel p-4 rounded-2xl text-sm border-brand-yellow/20 flex items-center justify-between">
                <span class="text-gray-300 font-medium" id="upload-status-text">Mengunggah file...</span>
                <div class="w-48 bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div id="upload-progress" class="bg-brand-yellow h-full w-0 transition-all duration-300"></div>
                </div>
            </div>

            <!-- Media Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" id="media-grid">
                <!-- Loaded dynamically -->
            </div>
        </section>
        
        <!-- INVOICE TAB -->
        <section id="sect-invoice" class="hidden space-y-6">
            <iframe src="/invoice" class="w-full h-[75vh] border-0 rounded-3xl overflow-hidden glass-panel"></iframe>
        </section>
        
        <!-- SHIPPING TAB -->
        <section id="sect-shipping" class="hidden space-y-6">
            <iframe src="/shipping" class="w-full h-[75vh] border-0 rounded-3xl overflow-hidden glass-panel"></iframe>
        </section>

        <!-- QRCODE TAB -->
        <section id="sect-qrcode" class="hidden space-y-6">
            <iframe src="/qrcode" class="w-full h-[75vh] border-0 rounded-3xl overflow-hidden glass-panel"></iframe>
        </section>
    </main>

    <!-- PRODUCT DETAIL MODAL -->
    <div id="product-modal" class="hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="glass-panel w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-12 max-h-[90vh] overflow-y-auto">
            <!-- Modal Form (Left) -->
            <div class="md:col-span-7 p-8 space-y-6">
                <div class="flex justify-between items-center">
                    <h3 id="modal-title" class="text-xl font-black text-brand-yellow">Edit/Tambah Produk</h3>
                    <button onclick="closeProductModal()" class="text-gray-400 hover:text-white font-bold">&times; Tutup</button>
                </div>

                <input type="hidden" id="prod-index">

                <div class="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">ID Unik Produk (a-z, _)</label>
                        <input type="text" id="prod-id" class="w-full bg-[#222] border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-yellow" placeholder="Contoh: mustofa_teri">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Nama Menu Utama</label>
                        <input type="text" id="prod-name" onkeyup="updateLivePreview()" class="w-full bg-[#222] border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-yellow" placeholder="Kering Kentang Mustofa (Teri)">
                    </div>
                </div>

                <div class="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Kategori</label>
                        <select id="prod-category" class="w-full bg-[#222] border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-yellow text-white">
                            <option value="mustofa">Mustofa</option>
                            <option value="sambal">Sambal Botol</option>
                            <option value="cookies">Nastar & Kue</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Visual Pouch/Jar</label>
                        <select id="prod-imageType" onchange="updateLivePreview()" class="w-full bg-[#222] border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-yellow text-white">
                            <option value="mustofa">Mustofa Pouch</option>
                            <option value="sambal">Sambal Jar</option>
                            <option value="cookies">Cookies Jar</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Varian (Label SVG)</label>
                        <input type="text" id="prod-variant" onkeyup="updateLivePreview()" class="w-full bg-[#222] border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-yellow" placeholder="TERI KACANG">
                    </div>
                </div>

                <div class="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Harga (Murni Digit)</label>
                        <input type="number" id="prod-price" onkeyup="updateLivePreview()" class="w-full bg-[#222] border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-yellow" placeholder="50000">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Harga Display Katalog</label>
                        <input type="text" id="prod-priceDisplay" onkeyup="updateLivePreview()" class="w-full bg-[#222] border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-yellow" placeholder="Rp 30.000 - 50.000">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Kemasan / Berat</label>
                        <input type="text" id="prod-weight" onkeyup="updateLivePreview()" class="w-full bg-[#222] border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-yellow" placeholder="150g">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">URL / Path Gambar Kustom (Opsional)</label>
                    <input type="text" id="prod-imageUrl" onkeyup="updateLivePreview()" class="w-full bg-[#222] border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-yellow" placeholder="Contoh: gambar/20220522_080218.jpg (Kosongkan untuk visual SVG default)">
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Satuan (pouch/botol/toples)</label>
                        <input type="text" id="prod-unit" class="w-full bg-[#222] border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-yellow" placeholder="pouch">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Badge Promo / Tag (opsional)</label>
                        <input type="text" id="prod-tag" onkeyup="updateLivePreview()" class="w-full bg-[#222] border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-yellow" placeholder="Favorit / Baru">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Deskripsi Produk</label>
                    <textarea id="prod-description" onkeyup="updateLivePreview()" rows="3" class="w-full bg-[#222] border border-white/10 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-brand-yellow" placeholder="Deskripsi singkat rasa produk..."></textarea>
                </div>

                <div class="flex justify-end space-x-3 pt-2">
                    <button onclick="closeProductModal()" class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#2D2D2D] hover:bg-zinc-800 transition-all">Batal</button>
                    <button onclick="saveProductModal()" class="px-6 py-2.5 rounded-xl text-sm font-bold text-black bg-brand-yellow hover:bg-yellow-500 transition-all shadow-md">Simpan Produk</button>
                </div>
            </div>

            <!-- Modal Visual Preview (Right) -->
            <div class="md:col-span-5 bg-black/40 border-l border-white/5 p-8 flex flex-col justify-center items-center space-y-6">
                <span class="text-xs font-black uppercase tracking-widest text-brand-yellow block border-b border-white/10 pb-2 w-full text-center">Live Preview Card</span>
                
                <!-- Catalog Card Mockup -->
                <div class="w-full max-w-[270px] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden text-brand-dark">
                    <div class="p-6 bg-brand-cream/60 flex justify-center relative min-h-[190px] items-center" id="prev-svg-container">
                        <!-- Loaded dynamically -->
                    </div>
                    <div class="p-5 space-y-3">
                        <h3 id="prev-name" class="text-md font-extrabold text-brand-dark leading-snug">Nama Produk</h3>
                        <p id="prev-desc" class="text-xs text-gray-500 line-clamp-2">Deskripsi singkat produk yang menjelaskan rasa dan kemasan.</p>
                        <div class="flex items-center justify-between border-t border-gray-100 pt-3">
                            <div>
                                <span id="prev-weight" class="text-[10px] text-gray-400 block">Kemasan 150g</span>
                                <span id="prev-price" class="text-sm font-black text-brand-red">Rp 45.000</span>
                            </div>
                            <div class="bg-brand-red text-white p-2 rounded-full text-xs">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Frontend logic scripts -->
    <script>
        let config = null;

        // Fetch config on load
        async function fetchConfig() {
            try {
                const res = await fetch('/api/config');
                config = await res.json();
                populateForm();
            } catch (err) {
                showToast('Gagal memuat konfigurasi', 'Silakan coba jalankan ulang server.', 'warning');
            }
        }

        // Show toast feedback
        function showToast(title, desc, type = 'success') {
            const toast = document.getElementById('toast');
            const icon = document.getElementById('toast-icon');
            const tTitle = document.getElementById('toast-title');
            const tDesc = document.getElementById('toast-desc');

            tTitle.textContent = title;
            tDesc.textContent = desc;
            icon.textContent = type === 'warning' ? '⚠️' : '🎉';

            toast.classList.remove('translate-y-[-20px]', 'opacity-0', 'pointer-events-none');
            toast.classList.add('translate-y-0', 'opacity-100');

            setTimeout(() => {
                toast.classList.add('translate-y-[-20px]', 'opacity-0', 'pointer-events-none');
                toast.classList.remove('translate-y-0', 'opacity-100');
            }, 3000);
        }

        // Populate HTML fields with loaded config
        function populateForm() {
            if (!config) return;
            
            // Store
            document.getElementById('waNumber').value = config.waNumber || '';
            document.getElementById('waDisplay').value = config.waDisplay || '';
            document.getElementById('storeAddress').value = config.storeAddress || '';

            // Travel
            document.getElementById('travel-pekanbaru').value = config.travelData.pekanbaru || '';
            document.getElementById('travel-batam').value = config.travelData.batam || '';
            document.getElementById('travel-malaysia').value = config.travelData.malaysia || '';
            document.getElementById('travel-jakarta').value = config.travelData.jakarta || '';

            // Products
            renderProductsList();        }

        // Render products rows in the manager table
        function renderProductsList() {
            const tbody = document.getElementById('product-rows');
            tbody.innerHTML = '';

            config.products.forEach((prod, index) => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-white/5 transition-all';
                tr.innerHTML = \`
                    <td class="p-6">
                        <span class="block font-bold text-white text-md">\${prod.name}</span>
                        <span class="text-xs text-gray-400">\${prod.description ? prod.description.substring(0, 70) : ''}...</span>
                    </td>
                    <td class="p-6">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-[#2D2D2D] text-gray-300 capitalize">\${prod.category}</span>
                    </td>
                    <td class="p-6">
                        \${prod.imageUrl ? \`<img src="\${prod.imageUrl}" class="w-12 h-12 object-cover rounded-xl border border-white/10 shadow-md inline-block">\` : \`<div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-extrabold text-gray-400 capitalize">\${prod.imageType.substring(0,3)}</div>\`}
                    </td>
                    <td class="p-6 font-semibold text-white">
                        Rp \${prod.price.toLocaleString('id-ID')} <span class="text-xs text-gray-400">/ \${prod.unit}</span>
                    </td>
                    <td class="p-6 text-right space-x-2">
                        <button onclick="openProductModal(\${index})" class="px-4 py-1.5 text-xs font-semibold rounded-full border border-white/10 hover:bg-brand-yellow hover:text-black transition-all">Edit</button>
                        <button onclick="deleteProduct(\${index})" class="px-4 py-1.5 text-xs font-semibold rounded-full bg-red-950 text-red-400 border border-red-900/50 hover:bg-red-600 hover:text-white transition-all">Hapus</button>
                    </td>
                \`;
                tbody.appendChild(tr);
            });
        }

        // Switch active tab view
        function switchTab(tabId) {
            // tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById('tab-' + tabId).classList.add('active');

            // sections
            document.getElementById('sect-store').classList.add('hidden');
            document.getElementById('sect-travel').classList.add('hidden');
            document.getElementById('sect-products').classList.add('hidden');
            document.getElementById('sect-media').classList.add('hidden');
            document.getElementById('sect-invoice').classList.add('hidden');
            document.getElementById('sect-shipping').classList.add('hidden');
            document.getElementById('sect-qrcode').classList.add('hidden');

            document.getElementById('sect-' + tabId).classList.remove('hidden');

            if (tabId === 'media') {
                fetchMedia();
            }
        }

        // Delete product
        function deleteProduct(index) {
            if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                config.products.splice(index, 1);
                renderProductsList();
                showToast('Produk Dihapus', 'Simpan perubahan untuk memperbarui website.');
            }
        }

        // Open modal to add/edit product
        function openProductModal(index) {
            const modal = document.getElementById('product-modal');
            modal.classList.remove('hidden');

            if (index !== null) {
                // Edit mode
                const prod = config.products[index];
                document.getElementById('modal-title').textContent = 'Edit Produk Katalog';
                document.getElementById('prod-index').value = index;
                document.getElementById('prod-id').value = prod.id;
                document.getElementById('prod-name').value = prod.name;
                document.getElementById('prod-category').value = prod.category;
                document.getElementById('prod-imageType').value = prod.imageType;
                document.getElementById('prod-variant').value = prod.variant;
                document.getElementById('prod-price').value = prod.price;
                document.getElementById('prod-priceDisplay').value = prod.priceDisplay;
                document.getElementById('prod-weight').value = prod.weight;
                document.getElementById('prod-unit').value = prod.unit;
                document.getElementById('prod-tag').value = prod.tag;
                document.getElementById('prod-description').value = prod.description;
                document.getElementById('prod-imageUrl').value = prod.imageUrl || '';
            } else {
                // Add mode
                document.getElementById('modal-title').textContent = 'Tambah Produk Baru';
                document.getElementById('prod-index').value = '';
                document.getElementById('prod-id').value = 'menu_' + Math.random().toString(36).substring(2, 7);
                document.getElementById('prod-name').value = '';
                document.getElementById('prod-category').value = 'mustofa';
                document.getElementById('prod-imageType').value = 'mustofa';
                document.getElementById('prod-variant').value = '';
                document.getElementById('prod-price').value = '';
                document.getElementById('prod-priceDisplay').value = '';
                document.getElementById('prod-weight').value = '';
                document.getElementById('prod-unit').value = 'pouch';
                document.getElementById('prod-tag').value = '';
                document.getElementById('prod-description').value = '';
                document.getElementById('prod-imageUrl').value = '';
            }

            updateLivePreview();
        }

        // Close product modal
        function closeProductModal() {
            document.getElementById('product-modal').classList.add('hidden');
        }

        // Save product in modal
        function saveProductModal() {
            const indexVal = document.getElementById('prod-index').value;
            const newProd = {
                id: document.getElementById('prod-id').value.trim(),
                category: document.getElementById('prod-category').value,
                name: document.getElementById('prod-name').value.trim(),
                priceDisplay: document.getElementById('prod-priceDisplay').value.trim(),
                price: parseInt(document.getElementById('prod-price').value.trim()) || 0,
                unit: document.getElementById('prod-unit').value.trim(),
                description: document.getElementById('prod-description').value.trim(),
                tag: document.getElementById('prod-tag').value.trim(),
                imageType: document.getElementById('prod-imageType').value,
                variant: document.getElementById('prod-variant').value.trim(),
                weight: document.getElementById('prod-weight').value.trim(),
                imageUrl: document.getElementById('prod-imageUrl').value.trim(),
            };

            if (!newProd.id || !newProd.name || !newProd.price) {
                alert('ID, Nama, dan Harga wajib diisi!');
                return;
            }

            if (indexVal !== '') {
                // Update
                config.products[parseInt(indexVal)] = newProd;
                showToast('Produk Diperbarui', 'Pembaruan berhasil. Klik Simpan Perubahan.');
            } else {
                // Add
                config.products.push(newProd);
                showToast('Produk Ditambahkan', 'Produk baru siap. Klik Simpan Perubahan.');
            }

            renderProductsList();
            closeProductModal();
        }

        // Live SVG mockup generator for visual edit feedback
        function updateLivePreview() {
            const name = document.getElementById('prod-name').value.trim() || 'Nama Produk';
            const desc = document.getElementById('prod-description').value.trim() || 'Keterangan deskripsi produk...';
            const weight = document.getElementById('prod-weight').value.trim() || '150g';
            const priceDisplay = document.getElementById('prod-priceDisplay').value.trim() || 'Rp 0';
            const tag = document.getElementById('prod-tag').value.trim();
            const imageType = document.getElementById('prod-imageType').value;
            const variant = document.getElementById('prod-variant').value.trim() || 'VARIAN';

            document.getElementById('prev-name').textContent = name;
            document.getElementById('prev-desc').textContent = desc;
            document.getElementById('prev-weight').textContent = 'Kemasan ' + weight;
            document.getElementById('prev-price').textContent = priceDisplay;

            // Generate SVG dynamic string
            const container = document.getElementById('prev-svg-container');
            container.innerHTML = '';

            let svgHtml = '';
            const imageUrl = document.getElementById('prod-imageUrl').value.trim();
            if (imageUrl) {
                svgHtml = \`<div class="w-full h-32 flex items-center justify-center overflow-hidden rounded-2xl bg-brand-cream/20 border border-gray-100 shadow-inner">
                    <img src="\${imageUrl}" alt="\${name}" class="object-cover w-full h-full">
                </div>\`;
            } else if (imageType === 'mustofa') {
                svgHtml = \`<svg class="w-24 h-32 drop-shadow-md" viewBox="0 0 100 130">
                    <path d="M15,10 C35,12 65,12 85,10 L82,115 C82,122 72,125 50,125 C28,125 18,122 18,115 Z" fill="#C1121F" />
                    <path d="M15,18 L85,18 L84,20 L16,20 Z" fill="#780000" />
                    <path d="M18,95 C30,105 70,105 82,95 L82,115 C82,122 72,125 50,125 C28,125 18,122 18,115 Z" fill="#F2BB05" />
                    <text x="50" y="58" font-family="sans-serif" font-weight="900" font-size="7" fill="#F2BB05" text-anchor="middle" letter-spacing="1">KENTANG</text>
                    <text x="50" y="68" font-family="sans-serif" font-weight="950" font-size="10" fill="#FFFFFF" text-anchor="middle">MUSTOFA</text>
                    <text x="50" y="76" font-family="sans-serif" font-weight="bold" font-size="5" fill="#FFFFFF" text-anchor="middle">Varian: \${variant.toUpperCase()}</text>
                    <circle cx="28" cy="110" r="5" fill="#FFFFFF" />
                    <text x="28" y="112" font-family="sans-serif" font-weight="bold" font-size="4" fill="#008000" text-anchor="middle">حلال</text>
                </svg>\`;
            } else if (imageType === 'sambal') {
                svgHtml = \`<svg class="w-20 h-32 drop-shadow-md" viewBox="0 0 80 120">
                    <path d="M15,35 C15,35 15,25 22,25 L58,25 C65,25 65,35 65,35 L65,105 C65,115 55,115 40,115 C25,115 15,115 15,105 Z" fill="#780000" opacity="0.95" />
                    <rect x="22" y="12" width="36" height="13" rx="3" fill="#FFFFFF" />
                    <path d="M17,40 C20,42 60,38 63,40 L63,103 C63,110 50,113 40,113 C30,113 17,110 17,103 Z" fill="#4A0000" />
                    <rect x="15" y="45" width="50" height="45" fill="#F2BB05" />
                    <g transform="translate(34, 48) scale(0.12)">
                        <path d="M15,75 L85,75 L80,85 L20,85 Z" fill="#C1121F" />
                        <path d="M15,75 L12,40 L16,40 L18,70 Z" fill="#C1121F" />
                        <path d="M32,75 L28,30 L32,30 L34,70 Z" fill="#C1121F" />
                        <path d="M50,75 L50,18 L53,22 L47,22 Z" fill="#C1121F" />
                    </g>
                    <text x="40" y="68" font-family="sans-serif" font-weight="bold" font-size="5" fill="#C1121F" text-anchor="middle">SAMBEL</text>
                    <text x="40" y="76" font-family="sans-serif" font-weight="900" font-size="6.5" fill="#C1121F" text-anchor="middle">\${variant.toUpperCase()}</text>
                    <text x="40" y="84" font-family="sans-serif" font-weight="bold" font-size="3" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">NETTO: \${weight.toUpperCase()}</text>
                </svg>\`;
            } else {
                svgHtml = \`<svg class="w-24 h-32 drop-shadow-md" viewBox="0 0 100 120">
                    <rect x="20" y="25" width="60" height="85" rx="10" fill="#EAEAEA" opacity="0.6" stroke="#CCCCCC" stroke-width="2" />
                    <ellipse cx="50" cy="25" rx="30" ry="10" fill="#F2BB05" />
                    <rect x="25" y="45" width="50" height="40" rx="3" fill="#C1121F" />
                    <text x="50" y="58" font-family="sans-serif" font-weight="black" font-size="5" fill="#FFFFFF" text-anchor="middle">MAHKOTA</text>
                    <text x="50" y="68" font-family="sans-serif" font-weight="black" font-size="9" fill="#F2BB05" text-anchor="middle">COOKIES</text>
                    <text x="50" y="78" font-family="sans-serif" font-weight="bold" font-size="4.5" fill="#FFFFFF" text-anchor="middle">\&nbsp;\${variant.toUpperCase()}</text>
                    <circle cx="35" cy="100" r="4.5" fill="#F2BB05" />
                    <circle cx="50" cy="102" r="4.5" fill="#F2BB05" />
                    <circle cx="65" cy="100" r="4.5" fill="#F2BB05" />
                </svg>\`;
            }

            container.innerHTML = svgHtml;

            // Render tag if exists
            if (tag) {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'absolute top-4 right-4 bg-brand-yellow text-brand-dark font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md';
                tagSpan.textContent = tag;
                container.appendChild(tagSpan);
            }
        }

        // --- MEDIA GALLERY LOGIC ---
        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        async function fetchMedia() {
            try {
                const res = await fetch('/api/images');
                const images = await res.json();
                renderMediaGrid(images);
            } catch (err) {
                showToast('Gagal memuat galeri', 'Tidak dapat mengambil daftar gambar.', 'warning');
            }
        }

        function renderMediaGrid(images) {
            const grid = document.getElementById('media-grid');
            if (!grid) return;
            grid.innerHTML = '';

            if (images.length === 0) {
                grid.className = 'block';
                grid.innerHTML = \`<div class="glass-panel p-12 text-center rounded-3xl border border-white/5">
                    <span class="text-4xl block mb-3">📁</span>
                    <p class="text-gray-400 italic">Belum ada file di folder gambar. Silakan unggah file baru.</p>
                </div>\`;
                return;
            }

            grid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6';
            images.forEach(file => {
                const card = document.createElement('div');
                card.className = 'glass-panel rounded-2xl overflow-hidden group border border-white/5 flex flex-col justify-between';
                
                let previewHtml = '';
                if (file.isImage) {
                    previewHtml = \`<img src="\${file.url}" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-300">\`;
                } else if (file.isVideo) {
                    previewHtml = \`<video src="\${file.url}" class="w-full h-full object-cover" muted loop onmouseover="this.play()" onmouseout="this.pause(); this.currentTime=0;"></video>
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span class="bg-black/50 text-white p-2 rounded-full text-xs">▶ Video</span>
                    </div>\`;
                } else {
                    previewHtml = \`<div class="w-full h-full bg-white/5 flex items-center justify-center text-4xl">📄</div>\`;
                }

                card.innerHTML = \`
                    <div class="aspect-square relative overflow-hidden bg-black/20 flex items-center justify-center border-b border-white/5">
                        \${previewHtml}
                        <!-- Hover Overlay -->
                        <div class="absolute inset-0 bg-brand-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-2">
                            <button onclick="copyMediaPath('gambar/\${file.name}')" class="w-full py-2 bg-brand-yellow hover:bg-yellow-500 text-black font-bold text-xs rounded-xl transition-all shadow-md">Salin Path</button>
                            <button onclick="deleteMedia('\${file.name}')" class="w-full py-2 bg-red-950 hover:bg-red-600 text-red-300 hover:text-white font-bold text-xs rounded-xl border border-red-900/50 transition-all shadow-md">Hapus</button>
                        </div>
                    </div>
                    <div class="p-3 bg-[#1E1E1E]/50">
                        <span class="block text-xs font-bold text-white truncate" title="\${file.name}">\${file.name}</span>
                        <span class="block text-[10px] text-gray-500 mt-0.5">\${formatBytes(file.size)}</span>
                    </div>
                \`;
                grid.appendChild(card);
            });
        }

        async function copyMediaPath(pathStr) {
            try {
                await navigator.clipboard.writeText(pathStr);
                showToast('Path Disalin!', \`Copied: \${pathStr} to clipboard.\`, 'success');
            } catch (err) {
                showToast('Gagal menyalin', 'Salin manual: ' + pathStr, 'warning');
            }
        }

        async function handleMediaUpload(input) {
            const file = input.files[0];
            if (!file) return;

            const statusBanner = document.getElementById('upload-status');
            const statusText = document.getElementById('upload-status-text');
            const progressBar = document.getElementById('upload-progress');

            statusBanner.classList.remove('hidden');
            statusText.textContent = \`Mengunggah \${file.name}...\`;
            progressBar.style.width = '0%';

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'x-filename': file.name
                    },
                    body: file
                });
                const result = await res.json();
                
                if (result.success) {
                    progressBar.style.width = '100%';
                    showToast('Upload Berhasil!', \`\${file.name} berhasil disimpan ke folder gambar.\`, 'success');
                    setTimeout(() => statusBanner.classList.add('hidden'), 2000);
                    fetchMedia();
                } else {
                    throw new Error(result.error || 'Server error during upload');
                }
            } catch (err) {
                statusText.textContent = \`Gagal mengunggah file.\`;
                progressBar.classList.add('bg-red-600');
                showToast('Upload Gagal', err.message, 'warning');
                setTimeout(() => statusBanner.classList.add('hidden'), 4000);
            } finally {
                input.value = '';
            }
        }

        async function deleteMedia(filename) {
            if (!confirm(\`Apakah Anda yakin ingin menghapus "\${filename}" secara permanen?\`)) return;
            try {
                const res = await fetch('/api/images/' + encodeURIComponent(filename), {
                    method: 'DELETE'
                });
                const result = await res.json();
                if (result.success) {
                    showToast('File Dihapus', \`\${filename} berhasil dibersihkan dari server.\`, 'success');
                    fetchMedia();
                } else {
                    throw new Error(result.error);
                }
            } catch (err) {
                showToast('Gagal menghapus', err.message, 'warning');
            }
        }

        // Post saved config back to server
        async function saveAllSettings() {
            if (!config) return;

            // Read store data
            config.waNumber = document.getElementById('waNumber').value.trim();
            config.waDisplay = document.getElementById('waDisplay').value.trim();
            config.storeAddress = document.getElementById('storeAddress').value.trim();

            // Read travel data
            config.travelData.pekanbaru = document.getElementById('travel-pekanbaru').value.trim();
            config.travelData.batam = document.getElementById('travel-batam').value.trim();
            config.travelData.malaysia = document.getElementById('travel-malaysia').value.trim();
            config.travelData.jakarta = document.getElementById('travel-jakarta').value.trim();

            try {
                const res = await fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
                const result = await res.json();
                if (result.success) {
                    showToast('Konfigurasi Disimpan!', 'index.html berhasil diperbarui secara langsung.', 'success');
                } else {
                    showToast('Gagal menyimpan', 'Ada kesalahan pada penyimpanan server.', 'warning');
                }
            } catch (err) {
                showToast('Gagal Menyimpan', 'Tidak dapat berkomunikasi dengan server.', 'warning');
            }
        }

        // Fetch configs on page load
        window.addEventListener('DOMContentLoaded', fetchConfig);
    </script>
</body>
</html>`;

// Setup Router Server
const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    if (url.startsWith('/gambar/')) {
        const decodedUrl = decodeURIComponent(url);
        const filePath = path.join(__dirname, decodedUrl);
        const gambarDir = path.join(__dirname, 'gambar');
        if (filePath.startsWith(gambarDir) && fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.gif') contentType = 'image/gif';
            else if (ext === '.svg') contentType = 'image/svg+xml';
            else if (ext === '.mp4') contentType = 'video/mp4';
            
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    } else if (method === 'GET' && url === '/') {
        // Serve Admin UI
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(adminHtml);
    } else if (method === 'GET' && url === '/preview') {
        // Serve index.html as a live preview
        const indexFile = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexFile)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fs.readFileSync(indexFile, 'utf8'));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('index.html not found');
        }
    } else if (method === 'GET' && (url === '/invoice' || url === '/invoice.html')) {
        // Serve invoice.html
        const invoiceFile = path.join(__dirname, 'invoice.html');
        if (fs.existsSync(invoiceFile)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fs.readFileSync(invoiceFile, 'utf8'));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('invoice.html not found');
        }
    } else if (method === 'GET' && (url === '/shipping' || url === '/shipping_calc.html')) {
        // Serve shipping_calc.html
        const shippingFile = path.join(__dirname, 'shipping_calc.html');
        if (fs.existsSync(shippingFile)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fs.readFileSync(shippingFile, 'utf8'));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('shipping_calc.html not found');
        }
    } else if (method === 'GET' && (url === '/qrcode' || url === '/qrcode.html')) {
        // Serve qrcode.html
        const qrcodeFile = path.join(__dirname, 'qrcode.html');
        if (fs.existsSync(qrcodeFile)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fs.readFileSync(qrcodeFile, 'utf8'));
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('qrcode.html not found');
        }
    } else if (method === 'GET' && url === '/api/shipping/provinces') {
        // RajaOngkir proxy: get provinces
        requestRajaOngkir('/province', 'GET')
            .then(results => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(results));
            })
            .catch(err => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            });
    } else if (method === 'GET' && url.startsWith('/api/shipping/cities')) {
        // RajaOngkir proxy: get cities
        const urlParams = new URL(req.url, `http://${req.headers.host}`);
        const provinceId = urlParams.searchParams.get('province');
        const pathStr = provinceId ? `/city?province=${provinceId}` : '/city';
        requestRajaOngkir(pathStr, 'GET')
            .then(results => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(results));
            })
            .catch(err => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            });
    } else if (method === 'POST' && url === '/api/shipping/cost') {
        // RajaOngkir proxy: post cost calculation
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const postPayload = {
                    origin: '444', // Tangerang Selatan
                    destination: payload.destination,
                    weight: payload.weight,
                    courier: payload.courier || 'jne'
                };
                requestRajaOngkir('/cost', 'POST', postPayload)
                    .then(results => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(results));
                    })
                    .catch(err => {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: err.message }));
                    });
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
    } else if (method === 'GET' && url === '/api/config') {
        // GET configuration json
        try {
            const data = getConfig();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
    } else if (method === 'POST' && url === '/api/config') {
        // POST save configuration
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const configObj = JSON.parse(body);
                saveConfig(configObj);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else if (method === 'GET' && url === '/api/images') {
        // GET list of images in /gambar
        try {
            const gambarDir = path.join(__dirname, 'gambar');
            if (!fs.existsSync(gambarDir)) {
                fs.mkdirSync(gambarDir);
            }
            const files = fs.readdirSync(gambarDir);
            const imageList = files.map(file => {
                const filePath = path.join(gambarDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: stats.size,
                    url: `/gambar/${file}`,
                    isImage: /\.(jpg|jpeg|png|gif|svg)$/i.test(file),
                    isVideo: /\.(mp4|webm|ogg)$/i.test(file)
                };
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(imageList));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
    } else if (method === 'POST' && url === '/api/upload') {
        // POST file upload to /gambar
        try {
            const filename = req.headers['x-filename'];
            if (!filename) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing x-filename header' }));
                return;
            }
            const safeFilename = path.basename(filename);
            const gambarDir = path.join(__dirname, 'gambar');
            if (!fs.existsSync(gambarDir)) {
                fs.mkdirSync(gambarDir);
            }
            const filePath = path.join(gambarDir, safeFilename);
            const writeStream = fs.createWriteStream(filePath);
            req.pipe(writeStream);
            req.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, name: safeFilename }));
            });
            req.on('error', (err) => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            });
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
    } else if (method === 'DELETE' && url.startsWith('/api/images/')) {
        // DELETE file in /gambar
        try {
            const filename = path.basename(decodeURIComponent(url));
            const filePath = path.join(__dirname, 'gambar', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'File not found' }));
            }
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` MAHKOTA AARONROS ADMIN PORTAL RUNNING ACTIVE    `);
    console.log(`-------------------------------------------------`);
    console.log(` Server is running at: http://localhost:${PORT}   `);
    console.log(` Preview website at:   http://localhost:${PORT}/preview `);
    console.log(`=================================================`);
});
