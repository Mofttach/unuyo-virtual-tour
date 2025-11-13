````markdown
# Virtual Tour UNU Yogyakarta

Virtual tour 360 derajat untuk Kampus Universitas Nahdlatul Ulama (UNU) Yogyakarta. Dibangun dengan Django REST Framework dan Pannellum.js.

## Fitur

- Panorama 360 derajat interaktif
- Navigasi antar lokasi dengan hotspot
- Info panel untuk setiap lokasi
- Gallery thumbnail
- Responsive design
- RESTful API
- Admin dashboard untuk manajemen konten

## Tech Stack

**Backend:**
- Django 5.2.7
- Django REST Framework
- SQLite (development)
- Pillow (image processing)

**Frontend:**
- Vanilla JavaScript
- Pannellum.js 2.5.6
- Tailwind CSS (CDN)
- Font Awesome 6

## Struktur Project

```
unuyo-virtual-tour/
├── unu_tour/           # Django project settings
├── tour_api/           # Django app (models, views, serializers)
├── frontend/           # Frontend files (HTML, CSS, JS)
├── media/              # Uploaded images
│   ├── panoramas/      # 360 images
│   └── thumbnails/     # Thumbnail images
├── .env                # Environment variables (lokal)
├── .env.example        # Template environment variables
└── requirements.txt    # Python dependencies
```

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/ulililzam/unuyo-virtual-tour.git
cd unuyo-virtual-tour
```

### 2. Setup Environment
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# File .env sudah siap dengan konfigurasi development default
```

### 3. Database Setup
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 4. Generate Sample Data (Optional)
```bash
python generate_dummy_data.py
```
Script ini akan membuat 10 lokasi kampus dengan gambar placeholder.

### 5. Run Server
```bash
python manage.py runserver
```

### 6. Access Application

- Backend API: http://127.0.0.1:8000/api/scenes/
- Admin Panel: http://127.0.0.1:8000/admin/
- Frontend: Buka `frontend/index.html` dengan Live Server (VS Code) atau web server lain

**Penting:** Jangan buka frontend dengan file:// karena CORS. Gunakan web server lokal.

## API Endpoints

**List all scenes:**
```
GET /api/scenes/
```

**Get scene detail:**
```
GET /api/scenes/{slug}/
```

**Get featured scene:**
```
GET /api/scenes/featured/
```

**Get Pannellum config:**
```
GET /api/scenes/pannellum/
```

## Configuration

### Environment Variables

File `.env` berisi konfigurasi penting:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_ENGINE=sqlite
DB_NAME=db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5500,...
```

Untuk production, ubah:
- `DEBUG=False`
- Generate SECRET_KEY baru
- Set ALLOWED_HOSTS dengan domain Anda
- Gunakan PostgreSQL untuk database
- Enable security settings

Dokumentasi lengkap: `ENV_SETUP.md`

### Frontend Configuration

Edit `frontend/app.js` untuk mengubah API URL:

```javascript
const CONFIG = {
    apiBaseUrl: 'http://127.0.0.1:8000/api',  // Ubah untuk production
    // ...
};
```

## Cara Menggunakan

### Admin Panel

1. Login: http://127.0.0.1:8000/admin/
2. Tambah Scene: Upload foto 360 (ratio 2:1), thumbnail, isi data
3. Tambah Hotspot: Set koordinat pitch/yaw, pilih tipe (scene link atau info)

### Frontend

1. Buka `frontend/index.html` dengan Live Server
2. Drag untuk melihat sekeliling, scroll untuk zoom
3. Klik hotspot untuk navigasi atau info
## Credits

- **Pannellum** - 360° panorama viewer library
- **Django** - Web framework
- **Django REST Framework** - API toolkit
- **Picsum Photos** - Placeholder images (dummy data)
- **Font Awesome** - Icons
- **Google Fonts** - Typography
