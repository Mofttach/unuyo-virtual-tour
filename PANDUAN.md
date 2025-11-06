# 📚 PANDUAN LENGKAP - Virtual Tour UNU Yogyakarta

## 🎯 Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Instalasi](#instalasi)
3. [Cara Menggunakan](#cara-menggunakan)
4. [Menambah Lokasi Baru](#menambah-lokasi-baru)
5. [Kustomisasi Desain](#kustomisasi-desain)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## 📖 Pendahuluan

Virtual Tour UNU Yogyakarta adalah aplikasi web untuk menjelajahi kampus secara virtual menggunakan foto panorama 360°. Aplikasi ini terdiri dari:

- **Backend**: Django REST API untuk menyimpan dan mengelola data
- **Frontend**: Website interaktif dengan viewer panorama 360°
- **Admin Panel**: Dashboard untuk mengelola konten

### Fitur Utama:
✅ Panorama 360° interaktif  
✅ Navigasi antar lokasi dengan hotspot  
✅ Galeri thumbnail  
✅ Info panel dengan deskripsi  
✅ Responsive (mobile & desktop)  
✅ Admin panel yang user-friendly  

---

## 💻 Instalasi

### Prasyarat
- Python 3.8 atau lebih baru
- pip (Python package manager)
- Web browser modern (Chrome, Firefox, Safari, Edge)
- VS Code dengan Live Server extension (recommended)

### Langkah-langkah:

#### 1. Download/Clone Project
```bash
# Jika dari GitHub
git clone https://github.com/ulililzam/unuyo-virtual-tour.git
cd unuyo-virtual-tour

# Atau download ZIP dan extract
```

#### 2. Jalankan Quick Start Script
```bash
chmod +x quickstart.sh
./quickstart.sh
```

Script ini akan otomatis:
- Membuat virtual environment
- Install dependencies
- Migrate database
- Membuat superuser (username: `admin`, password: `admin123`)
- Generate 10 lokasi dummy

#### 3. Start Django Server
```bash
# Pastikan virtual environment aktif
source venv/bin/activate  # macOS/Linux
# atau
venv\Scripts\activate     # Windows

# Jalankan server
python manage.py runserver
```

Server akan berjalan di: **http://127.0.0.1:8000**

#### 4. Buka Frontend
Ada 2 cara:

**Cara 1: Live Server (Recommended)**
1. Install extension "Live Server" di VS Code
2. Klik kanan pada `frontend/index.html`
3. Pilih "Open with Live Server"
4. Browser akan otomatis membuka aplikasi

**Cara 2: Python HTTP Server**
```bash
# Terminal baru (biarkan Django server tetap jalan)
cd frontend
python3 -m http.server 5500
```
Buka browser: **http://localhost:5500**

---

## 🎮 Cara Menggunakan

### A. Mengakses Virtual Tour (Frontend)

1. **Welcome Screen**
   - Baca informasi singkat
   - Klik tombol "Mulai Tur Virtual"

2. **Navigasi Panorama**
   - **Drag** dengan mouse untuk melihat sekeliling
   - **Scroll** untuk zoom in/out
   - **Klik hotspot** (lingkaran berwarna) untuk pindah lokasi
   - **Klik ikon info** untuk membaca deskripsi

3. **Tombol Kontrol**
   - 🖼️ **Galeri**: Lihat semua lokasi dalam grid
   - ℹ️ **Info**: Buka panel informasi lokasi
   - ⛶ **Fullscreen**: Mode layar penuh

4. **Keyboard Shortcuts**
   - `I` - Toggle info panel
   - `G` - Toggle gallery
   - `Ctrl + F` - Toggle fullscreen
   - `ESC` - Tutup panel

### B. Mengelola Konten (Django Admin)

1. **Login ke Admin**
   - Buka: http://127.0.0.1:8000/admin/
   - Username: `admin`
   - Password: `admin123` (atau yang Anda buat)

2. **Dashboard Admin**
   Anda akan melihat:
   - **Scenes Virtual Tour**: Lokasi-lokasi 360°
   - **Hotspots**: Navigasi antar lokasi

---

## 📸 Menambah Lokasi Baru

### Persiapan Foto

#### 1. Foto Panorama 360°
**Spesifikasi:**
- Format: JPG/PNG
- Ratio: 2:1 (contoh: 4096x2048px, 8192x4096px)
- Projection: Equirectangular
- Size: Max 10MB per file

**Cara Mengambil Foto 360°:**

**Opsi 1: Menggunakan Kamera 360°**
- Ricoh Theta
- Insta360
- GoPro Max

**Opsi 2: Menggunakan Smartphone**
- Download app: Google Street View (iOS/Android)
- Atau: Cardboard Camera (Android)
- Atau: 360 Panorama (iOS)

**Opsi 3: Menggunakan DSLR**
- Ambil foto berputar 360° (overlap 30%)
- Stitch menggunakan software:
  - PTGui (Paid)
  - Hugin (Free)
  - Adobe Photoshop (Photomerge)

#### 2. Foto Thumbnail
**Spesifikasi:**
- Format: JPG/PNG
- Ratio: 16:9 (contoh: 640x360px, 1280x720px)
- Size: Max 1MB
- **Cara membuat**: Crop dari foto panorama atau screenshot

### Langkah Menambah Scene

1. **Login ke Admin**
   http://127.0.0.1:8000/admin/

2. **Klik "Scenes Virtual Tour" → "Add Scene"**

3. **Isi Form:**

   **Informasi Dasar:**
   - **Title**: Nama lokasi (contoh: "Gedung Kuliah Fakultas Syariah")
   - **Slug**: Auto-generate (atau custom, gunakan huruf kecil, dash)
   - **Description**: Deskripsi lengkap lokasi (support line break)

   **Lokasi & Tanggal:**
   - **Location**: Kota/Kabupaten (contoh: "Sleman, Yogyakarta")
   - **Published date**: Tanggal publikasi (format: YYYY-MM-DD)
   - **Author**: Nama fotografer (default: "Tim Virtual Tour UNU")

   **Media:**
   - **Panorama image**: Upload foto 360° Anda
   - **Thumbnail**: Upload thumbnail

   **Pengaturan Kamera 360°** (Advanced - Opsional):
   - **Initial pitch**: Sudut vertikal awal (-90 to 90)
     - 0 = horizontal
     - 90 = melihat ke atas
     - -90 = melihat ke bawah
   - **Initial yaw**: Sudut horizontal awal (-180 to 180)
     - 0 = depan
     - 90 = kanan
     - -90 = kiri
     - 180 / -180 = belakang
   - **Initial fov**: Field of view (50-120, default: 90)

   **Status Publikasi:**
   - ☑️ **Is active**: Scene ditampilkan di frontend
   - ☑️ **Is featured**: Scene pertama yang muncul (hanya 1 scene)

4. **Scroll ke bawah ke bagian "HOTSPOTS"**

   Hotspot adalah tombol navigasi dalam panorama.

   **Menambah Hotspot:**
   - Klik "Add another Hotspot"
   - **From scene**: (auto-fill, scene yang sedang diedit)
   - **Hotspot type**: Pilih tipe
     - **Scene Link**: Pindah ke lokasi lain
     - **Info Point**: Popup informasi saja
   - **To scene**: (jika type = Scene Link) Pilih tujuan
   - **Text**: Label yang muncul (contoh: "Ke Masjid")
   - **Pitch**: Koordinat vertikal hotspot (-90 to 90)
   - **Yaw**: Koordinat horizontal hotspot (-180 to 180)
   - **Info description**: (jika type = Info Point) Isi popup

   **Tips Menentukan Koordinat Hotspot:**
   1. Buka panorama Anda di viewer
   2. Cari posisi yang ingin diberi hotspot
   3. Perkirakan koordinat:
      - Pitch: Tinggi rendah hotspot
      - Yaw: Kiri kanan hotspot
   4. Bisa trial & error, edit lagi kalau salah

5. **Klik "Save"**

   Scene baru Anda akan langsung muncul di:
   - Gallery thumbnail
   - API endpoint
   - Virtual tour viewer

### Contoh Data Real

```
Title: Gedung Rektorat UNU Yogyakarta
Slug: gedung-rektorat
Location: Sleman, Yogyakarta
Published Date: 2025-11-05
Author: Tim Virtual Tour UNU
Description:
  Gedung Rektorat adalah pusat administrasi dan pimpinan 
  Universitas Nahdlatul Ulama Yogyakarta. Di gedung megah 
  ini, Rektor bersama jajaran pimpinan universitas 
  merumuskan visi dan misi pengembangan kampus...

Panorama Image: [Upload file 4096x2048.jpg]
Thumbnail: [Upload file 640x360.jpg]

Initial Pitch: 5
Initial Yaw: 0
Initial FOV: 90

Is Active: ✓
Is Featured: □

Hotspots:
  1. Type: Scene Link
     To Scene: Masjid Al-Muttaqien
     Text: Ke Masjid
     Pitch: 0
     Yaw: 45
  
  2. Type: Info Point
     Text: Info Gedung
     Pitch: 10
     Yaw: 0
     Info Description: Gedung ini dibangun tahun 2020...
```

---

## 🎨 Kustomisasi Desain

### Mengubah Warna Brand

Edit file: `frontend/style.css`

```css
:root {
    /* Warna Utama */
    --primary-color: #0a5f38;      /* Hijau UNU - ganti sesuai brand */
    --primary-dark: #083d25;
    --primary-light: #0d7a48;
    
    /* Warna Aksen */
    --secondary-color: #f39c12;    /* Orange */
    --accent-color: #e74c3c;       /* Red */
}
```

**Contoh Palet Warna:**
- **UNU (Hijau)**: `#0a5f38`
- **UGM (Kuning)**: `#ffc600`
- **UI (Kuning)**: `#fecc02`
- **ITB (Biru)**: `#003d7a`
- **UNPAD (Merah)**: `#b71c1c`

### Mengubah Font

```css
:root {
    --font-primary: 'Poppins', sans-serif;
    --font-heading: 'Montserrat', sans-serif;
}
```

Import font di `<head>` HTML:
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins&family=Montserrat:wght@600&display=swap" rel="stylesheet">
```

### Mengubah Logo

Edit `frontend/index.html`, cari:
```html
<div class="logo">
    <i class="fas fa-university"></i>  <!-- Ganti icon atau gunakan image -->
</div>
```

Ganti dengan gambar:
```html
<div class="logo">
    <img src="logo-unu.png" alt="UNU Logo" style="width: 100%; height: 100%;">
</div>
```

---

## 🔧 Troubleshooting

### ❌ CORS Error

**Gejala:**
```
Access to fetch at 'http://127.0.0.1:8000/api/scenes/' 
from origin 'http://localhost:5500' has been blocked by CORS policy
```

**Solusi:**
1. Buka `unu_tour/settings.py`
2. Cek `CORS_ALLOWED_ORIGINS`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:5500",  # Tambahkan URL frontend Anda
       "http://127.0.0.1:5500",
   ]
   ```
3. Restart Django server

### ❌ Gambar Tidak Muncul

**Gejala:**
- Panorama atau thumbnail kosong/broken
- Console browser: 404 Not Found pada image URL

**Solusi:**
1. Check file exists di folder `media/`
2. Check `MEDIA_URL` dan `MEDIA_ROOT` di `settings.py`
3. Pastikan Django server serve media files:
   ```python
   # unu_tour/urls.py
   from django.conf import settings
   from django.conf.urls.static import static
   
   if settings.DEBUG:
       urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
   ```

### ❌ "No scenes found"

**Solusi:**
```bash
python generate_dummy_data.py
```

### ❌ Admin Login Tidak Bisa

**Solusi:**
Reset password:
```bash
python manage.py changepassword admin
```

Atau buat superuser baru:
```bash
python manage.py createsuperuser
```

### ❌ Live Server Not Working

**Solusi alternatif:**
```bash
cd frontend
python3 -m http.server 5500
```

### ❌ Port 8000 Already in Use

**Solusi:**
```bash
# Gunakan port lain
python manage.py runserver 8001

# Atau kill process di port 8000
lsof -ti:8000 | xargs kill -9  # macOS/Linux
```

---

## ❓ FAQ (Frequently Asked Questions)

### 1. Berapa ukuran maksimal file foto 360°?
**Default Django**: 2.5MB. Bisa diubah di `settings.py`:
```python
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
```

### 2. Apakah bisa pakai video 360°?
Saat ini belum support. Tapi bisa dikembangkan dengan library seperti Video.js 360.

### 3. Apakah bisa pakai foto biasa (bukan 360°)?
Tidak. Pannellum hanya support foto equirectangular. Gunakan app khusus untuk buat foto 360°.

### 4. Berapa jumlah maksimal lokasi yang bisa ditambahkan?
Tidak ada batasan. Tapi untuk performa, disarankan max 50 lokasi dengan foto 4K.

### 5. Bagaimana cara deploy ke production?
Lihat section "Deployment" di README.md. Recommended:
- Backend: Render.com / Railway
- Frontend: Netlify / Vercel
- Media: Cloudinary / AWS S3

### 6. Apakah bisa diakses offline?
Frontend bisa dijadikan PWA. Tapi data tetap butuh koneksi ke API.

### 7. Apakah support VR headset?
Belum secara native. Tapi Pannellum support WebVR dengan konfigurasi tambahan.

### 8. Bagaimana cara backup data?
```bash
# Backup database
python manage.py dumpdata > backup.json

# Backup media files
tar -czf media_backup.tar.gz media/

# Restore
python manage.py loaddata backup.json
tar -xzf media_backup.tar.gz
```

### 9. Apakah ada batasan browser?
Support browser modern:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### 10. Bagaimana cara kontribusi ke project?
1. Fork repository
2. Buat branch: `git checkout -b feature/nama-fitur`
3. Commit: `git commit -m 'Add fitur baru'`
4. Push: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## 📞 Kontak & Support

Jika menemui masalah atau ada pertanyaan:

1. **GitHub Issues**: [Create issue](https://github.com/ulililzam/unuyo-virtual-tour/issues)
2. **Email**: admin@unu.ac.id
3. **Documentation**: Baca README.md

---

**Terakhir diupdate**: 5 November 2025  
**Versi**: 1.0.0

🎓 **Universitas Nahdlatul Ulama Yogyakarta**
