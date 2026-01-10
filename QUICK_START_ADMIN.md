# Quick Start Guide - Admin UI Virtual Tour

## Setup (First Time)

1. **Activate Virtual Environment**
   ```bash
   source venv/bin/activate
   ```

2. **Run Migrations** (if needed)
   ```bash
   python manage.py migrate
   ```

3. **Create Superuser** (if not exists)
   ```bash
   python manage.py createsuperuser
   ```
   - Username: admin
   - Email: admin@unu.ac.id
   - Password: [your secure password]

4. **Run Server**
   ```bash
   python manage.py runserver
   ```

## Access Admin Panel

1. Open browser: **http://127.0.0.1:8000/admin/**
2. Login with superuser credentials
3. Dashboard akan menampilkan quick actions

## Usage Guide

### Menambah Scene Baru

1. Klik **"Tambah Scene Baru"** di dashboard
2. Isi form:
   - **Title**: Nama lokasi (e.g., "Lobby Gedung Utama")
   - **Slug**: Auto-generate dari title
   - **Description**: Deskripsi lengkap
   - **Building**: Nama gedung (e.g., "Gedung Utama")
   - **Floor**: Nomor lantai (1-9) atau kosongkan untuk outdoor
   - **Location**: Kota (default: Yogyakarta)
   - **Panorama Image**: Upload foto 360° (equirectangular 2:1)
   - **Thumbnail**: Upload thumbnail (16:9 landscape)
3. Atur pengaturan kamera (opsional):
   - **Initial Pitch**: Sudut vertikal awal
   - **Initial Yaw**: Sudut horizontal awal
   - **Initial FOV**: Field of view (zoom level)
4. **Save**

### Menambah Hotspot dengan Visual Editor

1. Buka scene yang sudah ada
2. Scroll ke bagian **"Visual Hotspot Editor"**
3. **Klik pada panorama** di posisi yang diinginkan
4. Pilih tipe hotspot:
   - **Scene Navigation**: Link ke scene lain
   - **Info Point**: Popup informasi
   - **Floor Navigation**: Pindah lantai
5. Isi form:
   - **Tujuan Scene**: Pilih scene tujuan (untuk navigation)
   - **Label**: Text yang muncul di hotspot
   - **Deskripsi Info**: Detail info (untuk info point)
6. Klik **"Tambah Hotspot"**
7. Hotspot langsung muncul di viewer

### Tips Visual Editor

- **Lihat Hotspot**: Klik tombol "Lihat" untuk zoom ke hotspot
- **Hapus Hotspot**: Klik tombol "Hapus" untuk remove
- **Koordinat**: Pitch dan Yaw otomatis tersimpan saat klik
- **Preview**: Hotspot langsung tampil di viewer

### Mengatur Scene Sebagai Starting Point

1. Pergi ke **Scenes list** page
2. Pilih scene yang ingin dijadikan starting point
3. Dari dropdown **Actions**, pilih "Jadikan starting point"
4. Klik **"Go"**
5. Scene tersebut akan menjadi scene pertama yang muncul di frontend

### Mengaktifkan/Menonaktifkan Scene

1. Di **Scenes list**, centang scene yang ingin diubah
2. Pilih action:
   - **"Aktifkan scene"**: Tampilkan di virtual tour
   - **"Nonaktifkan scene"**: Sembunyikan dari virtual tour
3. Klik **"Go"**

### Filter dan Pencarian

**Filter Sidebar:**
- By status (Active/Inactive)
- By building
- By floor
- By location
- By published date

**Search:**
- Search by title, description, building, author

## UI Features

### Dashboard
- Quick access tools
- Statistics overview
- Direct links ke management

### Scene Management
- List view dengan badges (floor, status)
- Preview thumbnails
- Hotspot count indicator
- Bulk actions

### Visual Editor
- Interactive panorama viewer
- Real-time hotspot preview
- Coordinate picker
- Hotspot management table

### Styling
- Modern green & dark color scheme (UNU colors)
- Responsive design
- Professional UI/UX
- Clean typography

## Keyboard Shortcuts (in Viewer)

- **Click + Drag**: Pan view
- **Scroll**: Zoom in/out
- **Double Click**: Zoom in
- **F**: Fullscreen toggle (if enabled)

## API Testing

### Test API Endpoints

```bash
# Get all scenes
curl http://127.0.0.1:8000/api/scenes/

# Get featured scene
curl http://127.0.0.1:8000/api/scenes/featured/

# Get scene detail
curl http://127.0.0.1:8000/api/scenes/scene-slug/

# Get floors
curl http://127.0.0.1:8000/api/scenes/floors/

# Get buildings
curl http://127.0.0.1:8000/api/scenes/buildings/
```

## Troubleshooting

### Static files tidak load
```bash
python manage.py collectstatic
```

### Panorama tidak muncul di editor
- Pastikan file sudah diupload
- Check MEDIA_URL di settings.py
- Refresh page setelah save

### Port 8000 sudah digunakan
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Or run on different port
python manage.py runserver 8080
```

### Database locked (SQLite)
```bash
# Close all connections
# Restart server
python manage.py runserver
```

## Production Checklist

- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Use PostgreSQL/MySQL
- [ ] Set strong SECRET_KEY
- [ ] Configure CORS properly
- [ ] Setup HTTPS
- [ ] Collect static files
- [ ] Setup media file serving
- [ ] Configure backup
- [ ] Set up monitoring

## Next Steps

1. Upload beberapa scene test
2. Tambahkan hotspot untuk navigasi
3. Test frontend di http://127.0.0.1:8000/
4. Atur featured scene
5. Test di berbagai device

## Support

Untuk pertanyaan atau issue:
- Check ADMIN_UI_README.md untuk detail teknis
- Review Django admin documentation
- Check browser console untuk errors

---

**Selamat menggunakan Virtual Tour Admin!**
