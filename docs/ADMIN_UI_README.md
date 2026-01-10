# Admin UI Enhancement - Virtual Tour UNU Yogyakarta

## Overview
Modern admin interface dengan visual hotspot editor untuk mengelola virtual tour 360 kampus.

## Fitur Utama

### 1. Visual Hotspot Editor
- **Klik pada panorama** untuk menambahkan hotspot
- **Preview real-time** dengan Pannellum viewer
- **Drag & drop** koordinat otomatis tersimpan
- **3 Tipe hotspot**:
  - Scene Navigation: Navigasi ke scene lain
  - Info Point: Popup informasi
  - Floor Navigation: Navigasi antar lantai

### 2. Modern UI/UX
- Clean design dengan color scheme UNU (hijau & dark)
- Responsive layout
- Intuitive controls
- Professional styling

### 3. Dashboard
- Quick access ke fungsi utama
- Statistics overview
- Direct links ke management pages

## Struktur File

```
tour_api/
├── templates/admin/
│   ├── base_site.html          # Custom admin base
│   ├── index.html              # Enhanced dashboard
│   └── tour_api/
│       └── scene_change_form.html  # Visual editor
├── static/admin/
│   ├── css/
│   │   └── custom-admin.css    # Modern styling
│   └── js/
│       └── hotspot-editor.js   # Visual editor logic
├── admin.py                    # Enhanced admin classes
├── views.py                    # API endpoints for CRUD
├── serializers.py              # Read/Write serializers
└── urls.py                     # API routing

```

## Cara Menggunakan

### 1. Akses Admin
```
http://localhost:8000/admin/
```

### 2. Kelola Scene
1. Login ke admin
2. Pilih "Scenes Virtual Tour"
3. Tambah/edit scene
4. Upload panorama 360 dan thumbnail

### 3. Edit Hotspot Visual
1. Buka scene yang ingin diedit
2. Scroll ke bagian "Visual Hotspot Editor"
3. Klik pada panorama untuk pilih posisi
4. Isi form (tipe, label, tujuan)
5. Klik "Tambah Hotspot"
6. Hotspot langsung muncul di viewer

### 4. Navigasi Cepat
- **Lihat**: Klik tombol "Lihat" untuk zoom ke hotspot
- **Hapus**: Klik tombol "Hapus" untuk remove hotspot
- **Goto**: Camera otomatis pan ke posisi hotspot

## API Endpoints

### Scenes (Public)
```
GET  /api/scenes/              # List all scenes
GET  /api/scenes/{slug}/       # Scene detail
GET  /api/scenes/featured/     # Featured scene
GET  /api/scenes/floors/       # Floor list
GET  /api/scenes/buildings/    # Building list
GET  /api/scenes/pannellum/    # Full config
```

### Hotspots (Admin)
```
GET    /api/hotspots/          # List hotspots
POST   /api/hotspots/          # Create hotspot
GET    /api/hotspots/{id}/     # Hotspot detail
PUT    /api/hotspots/{id}/     # Update hotspot
DELETE /api/hotspots/{id}/     # Delete hotspot
```

## Teknologi

- **Backend**: Django 5.2.7
- **Admin**: Django Admin + Custom Templates
- **Viewer**: Pannellum.js 2.5.6
- **API**: Django REST Framework
- **Styling**: Custom CSS dengan modern design system

## Best Practices

### Security
- CSRF protection enabled
- Admin-only access untuk hotspot CRUD
- IsAuthenticatedOrReadOnly permission

### Performance
- Prefetch related untuk hotspots
- Optimized queries dengan select_related
- Efficient serialization

### UX
- Real-time preview
- Immediate feedback
- Clear error messages
- Intuitive controls

## Color Scheme

```css
--primary-color: #0a5f38    /* UNU Green */
--secondary-color: #2c3e50  /* Dark Gray */
--accent-color: #3498db     /* Blue */
--success-color: #27ae60    /* Green */
--warning-color: #f39c12    /* Orange */
--danger-color: #e74c3c     /* Red */
```

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (responsive)

## Tips

1. **Best Image Format**: Equirectangular 2:1 ratio
2. **Recommended Resolution**: 4096x2048 atau lebih
3. **File Size**: Compress untuk web performance
4. **Naming**: Gunakan slug yang SEO-friendly
5. **Featured Scene**: Set 1 scene sebagai starting point

## Troubleshooting

### Hotspot tidak muncul di viewer
- Pastikan panorama sudah diupload
- Refresh page setelah save
- Check browser console untuk errors

### Visual editor tidak load
- Pastikan static files sudah collected
- Check STATICFILES_DIRS di settings.py
- Verify Pannellum CDN accessible

### API endpoint 404
- Run migrations: `python manage.py migrate`
- Check router registration di urls.py
- Verify API prefix di main urls.py

## Future Enhancements

- [ ] Bulk hotspot import/export
- [ ] Hotspot templates
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Advanced filters
- [ ] Image optimization pipeline
