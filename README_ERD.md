# ERD Generator - Virtual Tour UNU Yogyakarta

Kumpulan tools dan format untuk generate Entity Relationship Diagram (ERD) database project Virtual Tour.

## 📁 Files Tersedia

### 1. **DATABASE_ERD_WEB.html** (⭐ Recommended)
File HTML interaktif dengan multiple format ERD dan preview langsung.

**Features:**
- 🎨 Mermaid ERD preview langsung di browser
- 🔷 DBML format untuk dbdiagram.io
- ⚡ QuickDBD format 
- 💾 SQL schema dengan copy/download
- 📊 Database statistics
- ℹ️ Complete documentation

**Cara Pakai:**
```bash
# Buka di browser
open DATABASE_ERD_WEB.html
# atau
firefox DATABASE_ERD_WEB.html
```

---

### 2. **erd_schema.sql**
SQL schema lengkap dengan:
- ✅ CREATE TABLE statements
- ✅ Indexes & constraints
- ✅ Triggers untuk timestamps
- ✅ Sample data (5 scenes + hotspots)
- ✅ Validation queries

**Cara Pakai:**
```bash
# SQLite
sqlite3 db.sqlite3 < erd_schema.sql

# PostgreSQL
psql -d your_database < erd_schema.sql

# MySQL
mysql -u root -p your_database < erd_schema.sql
```

---

### 3. **erd_schema.dbml**
DBML (Database Markup Language) format untuk [dbdiagram.io](https://dbdiagram.io/d)

**Cara Pakai:**
1. Copy semua isi file `erd_schema.dbml`
2. Buka https://dbdiagram.io/d
3. Paste di panel kiri
4. ERD muncul otomatis di panel kanan
5. Export ke PNG/PDF/SQL

**Features:**
- 📝 Human-readable format
- 🎨 Instant visual preview
- 📊 Professional ERD output
- 💾 Export ke berbagai format

---

### 4. **erd_schema.quickdbd**
QuickDBD format untuk [QuickDBD](https://app.quickdatabasediagrams.com/)

**Cara Pakai:**
1. Copy semua isi file `erd_schema.quickdbd`
2. Buka https://app.quickdatabasediagrams.com/
3. Paste di panel kiri
4. Tekan Ctrl+Enter atau klik "Update Diagram"
5. Export dari menu File → Export

**Features:**
- ⚡ Simple text-based format
- 🚀 Fast rendering
- 📥 Quick export options

---

### 5. **generate_erd.py**
Python script untuk generate ERD dalam berbagai format (PNG, PDF, DOT, HTML).

**Requirements:**
```bash
pip install eralchemy2 graphviz
```

**Cara Pakai:**
```bash
# Generate semua format
python generate_erd.py

# Output files:
# - DATABASE_ERD.png
# - DATABASE_ERD.pdf
# - DATABASE_ERD.dot
# - DATABASE_ERD.html
```

---

## 🌐 Online Tools

### 1. DBDiagram.io
- **URL:** https://dbdiagram.io/d
- **Format:** DBML (erd_schema.dbml)
- **Best for:** Professional diagrams, team collaboration
- **Export:** PNG, PDF, SQL

### 2. QuickDBD
- **URL:** https://app.quickdatabasediagrams.com/
- **Format:** QuickDBD (erd_schema.quickdbd)
- **Best for:** Quick diagrams, simple format
- **Export:** PNG, PDF, SQL

### 3. Mermaid Live Editor
- **URL:** https://mermaid.live/
- **Format:** Mermaid (copy dari DATABASE_ERD_WEB.html)
- **Best for:** Markdown-friendly diagrams
- **Export:** SVG, PNG

---

## 📊 Database Schema Overview

### Tables

#### 1. **tour_api_scene** (19 fields)
Menyimpan informasi lokasi 360° virtual tour.

**Key Fields:**
- `id` - Primary key
- `title` - Nama lokasi
- `slug` - URL-friendly identifier (unique)
- `building` - Nama gedung
- `floor` - Nomor lantai (1-9 atau NULL)
- `panorama_image` - Path foto 360°
- `is_featured` - Starting point (hanya 1 yang TRUE)

#### 2. **tour_api_hotspot** (9 fields)
Menyimpan hotspot navigasi dan info point.

**Key Fields:**
- `id` - Primary key
- `from_scene_id` - FK ke scene (CASCADE)
- `to_scene_id` - FK ke scene tujuan (CASCADE, nullable)
- `hotspot_type` - scene | info | floor
- `pitch` - Sudut vertikal (-90 to 90)
- `yaw` - Sudut horizontal (-180 to 180)

### Relationships

```
Scene (1) ──────< Hotspot (N)
  ↑                   │
  └───────────────────┘
     (to_scene_id)
```

- **One-to-Many:** Scene → Hotspot (from_scene_id)
- **Self-Referencing:** Hotspot → Scene (to_scene_id)
- **Cascade Delete:** Hapus scene = hapus semua hotspotnya

---

## 🎯 Workflow Recommendations

### For Development:
1. Open `DATABASE_ERD_WEB.html` di browser
2. Review ERD diagram di tab Mermaid
3. Copy SQL dari tab SQL untuk create tables
4. Run `python generate_erd.py` untuk dokumentasi

### For Documentation:
1. Open `erd_schema.dbml` di dbdiagram.io
2. Customize styling & layout
3. Export to PNG/PDF untuk dokumentasi
4. Include di README atau presentation

### For Team Collaboration:
1. Share `DATABASE_ERD_WEB.html` via git
2. Team members bisa buka langsung di browser
3. No dependencies needed
4. Support mobile view

---

## 🛠️ Tools Comparison

| Tool | Format | Online | Offline | Export | Best For |
|------|--------|--------|---------|--------|----------|
| DATABASE_ERD_WEB.html | Multiple | ✅ | ✅ | Limited | Quick preview |
| DBDiagram.io | DBML | ✅ | ❌ | PNG/PDF/SQL | Professional |
| QuickDBD | Text | ✅ | ❌ | PNG/PDF | Simple/Fast |
| Mermaid Live | Mermaid | ✅ | ❌ | SVG/PNG | Markdown |
| generate_erd.py | SQL/Django | ❌ | ✅ | PNG/PDF/DOT | Automation |

---

## 📝 Business Rules

1. **Featured Scene:**
   - Hanya boleh ada 1 scene dengan `is_featured=TRUE`
   - Digunakan sebagai starting point

2. **Floor Validation:**
   - Field `floor` harus 1-9 atau NULL (outdoor)
   - NULL digunakan untuk area outdoor

3. **Hotspot Type:**
   - `scene`: Navigasi (to_scene_id WAJIB)
   - `info`: Info point (info_description required)
   - `floor`: Floor navigation

4. **Coordinates:**
   - `pitch`: -90° (bawah) hingga 90° (atas)
   - `yaw`: -180° hingga 180° (horizontal)

---

## 🚀 Quick Start

```bash
# 1. Lihat ERD di browser
open DATABASE_ERD_WEB.html

# 2. Generate visual ERD (optional)
pip install eralchemy2 graphviz
python generate_erd.py

# 3. Create database tables
sqlite3 db.sqlite3 < erd_schema.sql

# 4. Verify
sqlite3 db.sqlite3 "SELECT COUNT(*) FROM tour_api_scene;"
```

---

## 📞 Support

**Project:** Virtual Tour UNU Yogyakarta  
**Database:** SQLite (dev), PostgreSQL (prod)  
**Generated:** December 23, 2025

**Files:**
- `DATABASE_ERD_WEB.html` - Interactive web viewer
- `erd_schema.sql` - Complete SQL schema
- `erd_schema.dbml` - DBDiagram.io format
- `erd_schema.quickdbd` - QuickDBD format
- `generate_erd.py` - Python generator
- `README_ERD.md` - This file
