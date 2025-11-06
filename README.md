# 🕌 Virtual Tour UNU Yogyakarta

Virtual tour interaktif 360° untuk Kampus Universitas Nahdlatul Ulama (UNU) Yogyakarta menggunakan Django REST Framework dan Pannellum.js.

![Virtual Tour Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![Django](https://img.shields.io/badge/Django-5.2.7-green)
![Python](https://img.shields.io/badge/Python-3.14-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Fitur Utama

✅ **Panorama 360° Interactive** - Jelajahi kampus dengan teknologi panorama equirectangular  
✅ **Navigasi Hotspot** - Pindah antar lokasi dengan klik hotspot interaktif  
✅ **Info Panel** - Deskripsi lengkap setiap lokasi kampus  
✅ **Thumbnail Gallery** - Galeri visual semua lokasi  
✅ **Responsive Design** - Mobile-friendly & desktop-optimized  
✅ **RESTful API** - Backend Django dengan DRF  
✅ **Admin Dashboard** - Kelola scene & hotspot dengan mudah  
✅ **CORS Enabled** - Frontend terpisah dari backend  

## 📸 Screenshot

### Frontend - Virtual Tour Viewer
- **Welcome Screen** dengan intro menarik
- **Panorama Viewer** dengan kontrol Pannellum
- **Info Panel** (slide dari kanan) dengan deskripsi lokasi
- **Thumbnail Gallery** (slide dari bawah) untuk navigasi cepat

### Backend - Django Admin
- Kelola Scene dengan inline Hotspot editor
- Upload panorama & thumbnail images
- Set featured scene, publish dates, dll

## 🏗️ Teknologi Stack

### Backend
- **Django 5.2.7** - Web framework
- **Django REST Framework** - API framework
- **Pillow** - Image processing
- **django-cors-headers** - CORS support
- **SQLite** - Database (development)

### Frontend
- **Vanilla JavaScript (ES6+)** - No framework needed
- **Pannellum.js 2.5.6** - 360° panorama viewer
- **Font Awesome 6** - Icons
- **Google Fonts** - Typography (Inter & Poppins)

## 📁 Struktur Project

```
unuyo-virtual-tour/
├── unu_tour/                    # Django project settings
│   ├── settings.py             # Django configuration
│   ├── urls.py                 # Main URL routing
│   └── wsgi.py
│
├── tour_api/                    # Django app untuk API
│   ├── models.py               # Scene & Hotspot models
│   ├── serializers.py          # DRF serializers
│   ├── views.py                # API ViewSets
│   ├── urls.py                 # API endpoints
│   ├── admin.py                # Admin configuration
│   └── migrations/
│
├── frontend/                    # Frontend files (static)
│   ├── index.html              # Main HTML page
│   ├── style.css               # Responsive CSS
│   └── app.js                  # JavaScript application
│
├── media/                       # User uploaded files
│   ├── panoramas/              # 360° images (4096x2048)
│   └── thumbnails/             # Thumbnail images (640x360)
│
├── db.sqlite3                   # SQLite database
├── manage.py                    # Django management script
├── generate_dummy_data.py       # Script untuk generate test data
└── requirements.txt             # Python dependencies
```

## 🚀 Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/ulililzam/unuyo-virtual-tour.git
cd unuyo-virtual-tour
```

### 2️⃣ Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# atau
venv\Scripts\activate     # Windows
```

### 3️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

Requirements:
- Django==5.2.7
- djangorestframework
- django-cors-headers
- Pillow
- requests

### 4️⃣ Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5️⃣ Create Superuser (Admin Access)
```bash
python manage.py createsuperuser
```
- Username: `admin`
- Email: `admin@unu.ac.id`
- Password: (your choice)

### 6️⃣ Generate Dummy Data (10 Lokasi Kampus)
```bash
python generate_dummy_data.py
```

Script ini akan:
- Download placeholder images dari picsum.photos
- Create 10 scene locations (Gerbang Utama, Rektorat, Masjid, dll)
- Generate hotspot navigations antar scene
- Populate database dengan data menarik

### 7️⃣ Run Development Server
```bash
python manage.py runserver
```

Server akan berjalan di: **http://127.0.0.1:8000**

### 8️⃣ Akses Aplikasi

| URL | Deskripsi |
|-----|-----------|
| `http://127.0.0.1:8000/admin/` | Django Admin Panel |
| `http://127.0.0.1:8000/api/scenes/` | REST API - List Scenes |
| `http://127.0.0.1:8000/api/scenes/featured/` | API - Featured Scene |
| `http://127.0.0.1:8000/api/scenes/pannellum/` | API - Pannellum Config |
| `frontend/index.html` | **Open with Live Server** |

⚠️ **Penting**: Untuk membuka frontend, gunakan **Live Server** extension di VS Code atau web server lain. Jangan buka langsung file:// karena CORS.

## 🎮 Cara Menggunakan

### Frontend (User)
1. Buka `frontend/index.html` dengan Live Server
2. Klik "Mulai Tur Virtual" pada welcome screen
3. **Navigasi Panorama:**
   - **Drag/Swipe** untuk melihat sekeliling
   - **Scroll** untuk zoom in/out
   - **Klik Hotspot** untuk pindah lokasi
4. **Tombol Kontrol:**
   - 🖼️ **Galeri** - Lihat semua lokasi
   - ℹ️ **Info** - Baca deskripsi lokasi
   - ⛶ **Fullscreen** - Mode layar penuh

### Backend (Admin)
1. Login ke: `http://127.0.0.1:8000/admin/`
2. **Tambah Scene Baru:**
   - Upload foto 360° (ratio 2:1, recommended: 4096x2048px)
   - Upload thumbnail (ratio 16:9, recommended: 640x360px)
   - Isi title, deskripsi, lokasi, tanggal
   - Set featured scene (scene pertama yang muncul)
3. **Tambah Hotspot:**
   - Buka scene yang sudah dibuat
   - Scroll ke bagian "Hotspots"
   - Pilih tipe: Scene Link atau Info Point
   - Set koordinat Pitch (-90 to 90) & Yaw (-180 to 180)
   - Untuk Scene Link: pilih tujuan scene

## 📡 API Endpoints

### List All Scenes
```
GET /api/scenes/

Response:
[
  {
    "id": 1,
    "slug": "gerbang-utama-unu",
    "title": "Gerbang Utama UNU Yogyakarta",
    "thumbnail": "/media/thumbnails/...",
    "location": "Sleman, Yogyakarta",
    "published_date": "2025-11-04",
    "is_featured": true
  },
  ...
]
```

### Get Scene Detail
```
GET /api/scenes/{slug}/

Response:
{
  "id": 1,
  "slug": "gerbang-utama-unu",
  "title": "Gerbang Utama UNU Yogyakarta",
  "description": "Selamat datang di...",
  "location": "Sleman, Yogyakarta",
  "published_date": "2025-11-04",
  "author": "Tim Virtual Tour UNU",
  "panorama_image": "/media/panoramas/...",
  "thumbnail": "/media/thumbnails/...",
  "initial_pitch": 0,
  "initial_yaw": 0,
  "initial_fov": 90,
  "is_featured": true,
  "hotspots": [
    {
      "id": 1,
      "hotspot_type": "scene",
      "to_scene_slug": "gedung-rektorat",
      "to_scene_title": "Gedung Rektorat",
      "text": "Ke Gedung Rektorat",
      "pitch": 0,
      "yaw": 45
    }
  ],
  "created_at": "2025-11-04T..."
}
```

### Get Featured Scene
```
GET /api/scenes/featured/

Response: (same as detail)
```

### Get Pannellum Config (Ready to Use)
```
GET /api/scenes/pannellum/

Response:
{
  "default": {
    "firstScene": "gerbang-utama-unu",
    "sceneFadeDuration": 1000,
    "autoLoad": true
  },
  "scenes": {
    "gerbang-utama-unu": {
      "title": "Gerbang Utama...",
      "author": "Tim Virtual Tour UNU",
      "panorama": "/media/panoramas/...",
      "pitch": 0,
      "yaw": 0,
      "hfov": 90,
      "hotSpots": [...]
    },
    ...
  }
}
```

## 🎨 Kustomisasi

### Ubah Warna Brand (CSS Variables)
Edit `frontend/style.css`:
```css
:root {
    --primary-color: #0a5f38;      /* UNU Green - Ganti sesuai brand */
    --secondary-color: #f39c12;    /* Orange accent */
    --accent-color: #e74c3c;       /* Red accent */
}
```

### Ubah API URL (Production)
Edit `frontend/app.js`:
```javascript
const CONFIG = {
    API_BASE_URL: 'https://your-production-api.com/api',
    // ...
};
```

### Tambah Lokasi Kampus Baru
1. Login ke Django Admin
2. Pergi ke "Scenes Virtual Tour"
3. Klik "Add Scene"
4. Upload images & isi data
5. Save → Scene otomatis muncul di gallery

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px (Full layout dengan sidebar)
- **Tablet**: 768px - 1024px (Compact navigation)
- **Mobile**: < 768px (Full-width panels, stacked layout)

## 🔒 Security Notes

### Development (Current Setup)
- `DEBUG = True` (disable di production!)
- `CORS_ALLOWED_ORIGINS` whitelist (localhost)
- SQLite database

### Production Recommendations
1. Set `DEBUG = False`
2. Use PostgreSQL database
3. Setup `ALLOWED_HOSTS`
4. Use environment variables for secrets
5. Setup static files serving (nginx/Apache)
6. Use CDN for media files (Cloudinary/S3)
7. Enable HTTPS

## 🚢 Deployment

### Deploy Backend (Django)
Recommended platforms:
- **Render.com** (Free tier available)
- **Railway.app**
- **PythonAnywhere**
- **Heroku**

### Deploy Frontend
Recommended platforms:
- **Netlify** (Drag & drop `frontend/` folder)
- **Vercel**
- **GitHub Pages**

### Media Files (Production)
⚠️ **Jangan upload media ke Render/Heroku** (will be deleted)

Use cloud storage:
1. **Cloudinary** (Recommended - Free 25GB)
   ```bash
   pip install django-cloudinary-storage
   ```
2. **Amazon S3**
3. **Google Cloud Storage**

## 🐛 Troubleshooting

### ❌ CORS Error di Browser
**Problem**: `Access to fetch blocked by CORS policy`

**Solution**:
1. Check `CORS_ALLOWED_ORIGINS` di `settings.py`
2. Pastikan frontend URL ada di list
3. Restart Django server

### ❌ Images Not Loading
**Problem**: Panorama atau thumbnail tidak muncul

**Solution**:
1. Check `MEDIA_URL` dan `MEDIA_ROOT` di `settings.py`
2. Pastikan file ada di folder `media/`
3. Check browser console untuk error URL

### ❌ No Scenes Found
**Problem**: "Tidak ada scene yang tersedia"

**Solution**:
```bash
python generate_dummy_data.py
```

### ❌ API 404 Not Found
**Problem**: Endpoint `/api/scenes/` return 404

**Solution**:
1. Check `tour_api` ada di `INSTALLED_APPS`
2. Check `path('api/', include('tour_api.urls'))` di `unu_tour/urls.py`
3. Restart server

## 📝 To-Do / Future Enhancements

- [ ] Add audio guide untuk setiap lokasi
- [ ] Implement map overview (2D floor plan)
- [ ] Add VR mode support (WebXR)
- [ ] Multi-language support (EN/ID)
- [ ] Add 360° video support
- [ ] Analytics & heatmap tracking
- [ ] Social sharing features
- [ ] PWA (Progressive Web App)

## 👨‍💻 Developer

**Universitas Nahdlatul Ulama Yogyakarta**  
Virtual Tour Development Team

## 📄 License

MIT License - Feel free to use for educational purposes

---

## 🙏 Credits

- **Pannellum** - 360° panorama viewer library
- **Django** - Web framework
- **Django REST Framework** - API toolkit
- **Picsum Photos** - Placeholder images (dummy data)
- **Font Awesome** - Icons
- **Google Fonts** - Typography

---

**🎓 Built for Academic Excellence**  
*Universitas Nahdlatul Ulama Yogyakarta*

⭐ **Star this repo** if you find it helpful!
