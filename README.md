# Viola Kasir - Sistem Kasir Web

Sistem kasir modern untuk restoran dan cafe yang dapat digunakan sebagai Progressive Web App (PWA) tanpa perlu server lokal seperti XAMPP. Mendukung penyimpanan gambar di Cloudinary untuk sinkronisasi antar device.

## 🚀 Cara Menggunakan Tanpa XAMPP

### Opsi 1: Deploy ke Hosting Gratis (Rekomendasi)

#### 1. GitHub Pages (Gratis & Mudah)

**Langkah-langkah:**
1. Buat akun GitHub di https://github.com
2. Buat repository baru dengan nama `viola-kasir`
3. Upload semua file dari folder `Viola_kasir` ke repository
4. Masuk ke Settings → Pages
5. Pilih branch `main` dan folder `root`
6. Klik Save
7. Tunggu beberapa menit, aplikasi akan tersedia di `https://username.github.io/viola-kasir`

#### 2. Netlify Drop (Gratis & Sangat Mudah)

**Langkah-langkah:**
1. Buka https://app.netlify.com/drop
2. Drag & drop folder `Viola_kasir` ke area upload
3. Tunggu proses upload selesai
4. Aplikasi akan langsung tersedia dengan URL random
5. Bisa rename URL menjadi custom di dashboard Netlify

#### 3. Vercel (Gratis & Profesional)

**Langkah-langkah:**
1. Install Vercel CLI: `npm i -g vercel`
2. Buka terminal di folder `Viola_kasir`
3. Jalankan: `vercel`
4. Ikuti instruksi di terminal
5. Aplikasi akan deploy ke Vercel dengan URL gratis

### Opsi 2: Install sebagai PWA di Mobile

#### Android (Chrome Browser)

**Langkah 1: Buka Aplikasi di Chrome**
1. Buka browser Chrome di Android
2. Ketik URL aplikasi: `https://username.github.io/viola-kasir`
3. Tunggu halaman terload sepenuhnya

**Langkah 2: Tunggu Prompt Install**
- Chrome akan otomatis menampilkan prompt "Add to Home Screen"
- Biasanya muncul di bagian bawah layar
- Prompt berisi: "Add Viola Kasir to Home Screen"

**Langkah 3: Install PWA**
- Klik tombol "Add" atau "Install"
- Tunggu proses install selesai
- Aplikasi akan muncul di home screen

**Langkah 4: Buka dari Home Screen**
- Aplikasi akan berjalan seperti native app
- Full screen tanpa address bar
- Icon akan muncul di app drawer

**Jika Prompt Tidak Muncul:**
1. Tap menu (tiga titik) di pojok kanan atas Chrome
2. Pilih "Add to Home Screen" atau "Install App"
3. Konfirmasi dengan tap "Add"
4. Aplikasi akan terinstall

#### iOS (Safari Browser)

**Langkah 1: Buka Aplikasi di Safari**
1. Buka browser Safari di iPhone/iPad
2. Ketik URL aplikasi: `https://username.github.io/viola-kasir`
3. Tunggu halaman terload sepenuhnya

**Langkah 2: Tap Tombol Share**
- Tap tombol Share (kotak dengan panah ke atas)
- Biasanya di bagian bawah layar

**Langkah 3: Pilih Add to Home Screen**
- Scroll ke bawah menu
- Tap "Add to Home Screen"

**Langkah 4: Konfirmasi**
- Tap "Add" di pojok kanan atas
- Aplikasi akan muncul di home screen

**Langkah 5: Buka dari Home Screen**
- Tap icon aplikasi di home screen
- Aplikasi akan berjalan seperti native app

### Opsi 3: Convert ke APK (Advanced)

**Menggunakan Capacitor:**

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize
npx cap init ViolaKasir com.viola.kasir

# Build web app
npx cap add android

# Copy web assets
npx cap sync

# Open Android Studio
npx cap open android
```

**Menggunakan Cordova:**

```bash
# Install Cordova
npm install -g cordova

# Create project
cordova create viola-kasir com.viola.kasir ViolaKasir

# Add platform
cd viola-kasir
cordova platform add android

# Copy web files to www folder
# Build
cordova build android
```

## 📱 Fitur PWA

- ✅ Install ke home screen seperti native app
- ✅ Offline capability (bisa digunakan tanpa internet)
- ✅ Push notifications (opsional)
- ✅ Full screen mode
- ✅ Auto-update
- ✅ Data tersimpan di localStorage
- ✅ Optimized untuk Android dan iOS
- ✅ Portrait mode untuk mobile
- ✅ Responsive design untuk berbagai ukuran layar

## 🌐 Hosting Gratis yang Direkomendasikan

1. **GitHub Pages** - Gratis, unlimited bandwidth, GitHub integration
2. **Netlify** - Gratis, drag & drop deployment, custom domain
3. **Vercel** - Gratis, fast CDN, automatic SSL
4. **Firebase Hosting** - Gratis 10GB transfer, fast performance
5. **Cloudflare Pages** - Gratis, unlimited bandwidth, global CDN

## 🔧 Konfigurasi

### Manifest.json
File ini mengatur tampilan app saat diinstall:
- Icon app
- Warna tema
- Orientation (portrait/landscape)
- Start URL

### Service Worker
Mengaktifkan offline capability dan caching:
- Cache semua file statis
- Serve dari cache saat offline
- Auto-update cache saat ada perubahan

## 📦 Struktur File

```
Viola_kasir/
├── index.html          # Halaman utama
├── style.css           # Styling
├── script.js           # Logic aplikasi
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker untuk offline
└── README.md          # Panduan ini
```

## 💾 Data Storage

Semua data tersimpan di localStorage browser:
- Keranjang belanja
- Daftar produk
- Data pelanggan
- Riwayat penjualan
- Pengaturan

Data akan tetap tersimpan meskipun browser ditutup atau device restart.

## 🎯 Keuntungan PWA vs Native App

| PWA | Native App |
|-----|------------|
| Gratis deploy | Perlu bayar developer account |
| Cross-platform | Perlu develop per platform |
| Auto-update | Perlu update manual |
| Ukuran kecil | Ukuran besar |
| Instant loading | Perlu install |

## 📞 Support

Jika mengalami masalah:
1. Pastikan browser mendukung PWA (Chrome, Safari, Edge)
2. Clear cache browser jika ada masalah loading
3. Pastikan semua file sudah terupload dengan benar
4. Cek console browser untuk error message

## 🔐 Keamanan

- Data tersimpan lokal di device user
- Tidak ada koneksi ke server eksternal (kecuali Cloudinary untuk gambar)
- Tidak perlu database server
- 100% client-side application

## ☁️ Setup Cloudinary untuk Gambar

Untuk sinkronisasi gambar antar device, gunakan Cloudinary:

### Langkah-langkah Setup:

1. **Buat Akun Cloudinary**
   - Buka https://cloudinary.com
   - Sign up gratis
   - Verifikasi email

2. **Dapatkan Credentials**
   - Masuk ke Dashboard
   - Copy **Cloud Name** dari dashboard
   - Copy **API Key** dari dashboard

3. **Buat Upload Preset Unsigned**
   - Masuk ke Settings → Upload
   - Scroll ke "Upload presets"
   - Klik "Add upload preset"
   - Beri nama (misal: `viola-kasir`)
   - Set "Signing mode" ke "Unsigned"
   - Klik Save
   - Copy nama preset yang dibuat

4. **Update Konfigurasi di script.js**
   ```javascript
   this.cloudinaryConfig = {
       cloudName: 'YOUR_CLOUD_NAME', // Ganti dengan cloud name Anda
       uploadPreset: 'YOUR_UPLOAD_PRESET', // Ganti dengan upload preset unsigned
       apiKey: 'YOUR_API_KEY' // Ganti dengan API key Anda
   };
   ```

5. **Deploy ke GitHub**
   - Push perubahan ke GitHub
   - GitHub Pages akan otomatis update

### Keuntungan Cloudinary:
- ✅ Gambar tersimpan di cloud
- ✅ Dapat diakses dari semua device
- ✅ Auto-optimization dan CDN
- ✅ Gratis tier cukup untuk penggunaan kasir
- ✅ Fallback ke base64 jika gagal

### Tanpa Cloudinary:
Jika tidak ingin menggunakan Cloudinary, sistem akan otomatis menggunakan base64 encoding (fallback). Namun:
- ❌ Gambar tidak sinkron antar device
- ❌ Batas ukuran localStorage (5-10MB)
- ✅ Tetap berfungsi normal di satu device

## 📝 Catatan Penting

1. **Backup Data**: Data di localStorage bisa hilang jika browser cache dihapus
2. **Export/Import**: Gunakan fitur export CSV untuk backup data
3. **Testing**: Test di multiple device sebelum production
4. **Browser Support**: Gunakan browser modern (Chrome, Safari, Edge)

## 🎉 Selamat Menggunakan!

Sistem kasir Viola siap digunakan tanpa XAMPP. Deploy ke hosting gratis dan install sebagai PWA di mobile device Anda.
