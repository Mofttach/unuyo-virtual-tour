-- =============================================
-- ERD Database Schema - Virtual Tour UNU Yogyakarta
-- Generated: December 23, 2025
-- =============================================

-- Drop tables if exist (for clean regeneration)
DROP TABLE IF EXISTS tour_api_hotspot;
DROP TABLE IF EXISTS tour_api_scene;

-- =============================================
-- Table: tour_api_scene
-- Description: Menyimpan informasi lokasi 360° virtual tour
-- =============================================
CREATE TABLE tour_api_scene (
    -- Primary Key
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Basic Information
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    
    -- Location Details
    building VARCHAR(100) NOT NULL DEFAULT 'Gedung Utama',
    floor INTEGER CHECK(floor >= 1 AND floor <= 9),
    floor_description VARCHAR(200),
    "order" INTEGER NOT NULL DEFAULT 0,
    location VARCHAR(100) NOT NULL DEFAULT 'Yogyakarta',
    
    -- Media Files
    panorama_image VARCHAR(100) NOT NULL,
    thumbnail VARCHAR(100) NOT NULL,
    
    -- Metadata
    published_date DATE NOT NULL,
    author VARCHAR(100) NOT NULL DEFAULT 'Tim Virtual Tour UNU',
    is_active BOOLEAN NOT NULL DEFAULT 1,
    is_featured BOOLEAN NOT NULL DEFAULT 0,
    
    -- Viewer Configuration
    initial_pitch FLOAT NOT NULL DEFAULT 0,
    initial_yaw FLOAT NOT NULL DEFAULT 0,
    initial_fov FLOAT NOT NULL DEFAULT 90,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tour_api_scene
CREATE INDEX idx_scene_building_floor ON tour_api_scene(building, floor);
CREATE INDEX idx_scene_active_featured ON tour_api_scene(is_active, is_featured);
CREATE INDEX idx_scene_slug ON tour_api_scene(slug);

-- =============================================
-- Table: tour_api_hotspot
-- Description: Menyimpan hotspot navigasi dan info point
-- =============================================
CREATE TABLE tour_api_hotspot (
    -- Primary Key
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Foreign Keys
    from_scene_id INTEGER NOT NULL,
    to_scene_id INTEGER,
    
    -- Hotspot Configuration
    hotspot_type VARCHAR(10) NOT NULL DEFAULT 'scene' CHECK(hotspot_type IN ('scene', 'info', 'floor')),
    pitch FLOAT NOT NULL CHECK(pitch >= -90 AND pitch <= 90),
    yaw FLOAT NOT NULL CHECK(yaw >= -180 AND yaw <= 180),
    
    -- Content
    text VARCHAR(100) NOT NULL,
    info_description TEXT,
    
    -- Timestamp
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    FOREIGN KEY (from_scene_id) REFERENCES tour_api_scene(id) ON DELETE CASCADE,
    FOREIGN KEY (to_scene_id) REFERENCES tour_api_scene(id) ON DELETE CASCADE
);

-- Indexes for tour_api_hotspot
CREATE INDEX idx_hotspot_from_scene ON tour_api_hotspot(from_scene_id);
CREATE INDEX idx_hotspot_to_scene ON tour_api_hotspot(to_scene_id);
CREATE INDEX idx_hotspot_type ON tour_api_hotspot(hotspot_type);

-- =============================================
-- Triggers for updated_at timestamp
-- =============================================
CREATE TRIGGER update_scene_timestamp 
AFTER UPDATE ON tour_api_scene
FOR EACH ROW
BEGIN
    UPDATE tour_api_scene SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- =============================================
-- Sample Data - Scenes
-- =============================================
INSERT INTO tour_api_scene (title, slug, description, building, floor, panorama_image, thumbnail, published_date) VALUES
('Gerbang Utama UNU Yogyakarta', 'gerbang-utama-unu-yogyakarta', 'Gerbang utama kampus UNU Yogyakarta yang megah dengan arsitektur modern.', 'Outdoor', NULL, 'panoramas/gerbang-utama.jpg', 'thumbnails/gerbang-utama.jpg', '2025-01-01'),
('Gedung Rektorat - Lobby', 'gedung-rektorat-lobby', 'Lobby gedung rektorat dengan interior yang elegan dan modern.', 'Gedung Rektorat', 1, 'panoramas/rektorat-lobby.jpg', 'thumbnails/rektorat-lobby.jpg', '2025-01-02'),
('Perpustakaan - Lantai 2', 'perpustakaan-lantai-2', 'Area baca perpustakaan dengan koleksi buku lengkap dan suasana nyaman.', 'Perpustakaan', 2, 'panoramas/perpustakaan-lt2.jpg', 'thumbnails/perpustakaan-lt2.jpg', '2025-01-03'),
('Masjid Kampus', 'masjid-kampus', 'Masjid kampus yang luas dengan arsitektur islami yang indah.', 'Outdoor', NULL, 'panoramas/masjid.jpg', 'thumbnails/masjid.jpg', '2025-01-04'),
('Laboratorium Komputer', 'laboratorium-komputer', 'Laboratorium komputer dengan fasilitas hardware dan software terkini.', 'Gedung Fakultas', 3, 'panoramas/lab-komputer.jpg', 'thumbnails/lab-komputer.jpg', '2025-01-05');

-- Set featured scene (starting point)
UPDATE tour_api_scene SET is_featured = 1 WHERE slug = 'gerbang-utama-unu-yogyakarta';

-- =============================================
-- Sample Data - Hotspots
-- =============================================

-- Hotspots dari Gerbang Utama (id=1)
INSERT INTO tour_api_hotspot (from_scene_id, to_scene_id, hotspot_type, pitch, yaw, text) VALUES
(1, 2, 'scene', -5, 0, 'Menuju Gedung Rektorat'),
(1, 4, 'scene', 0, 90, 'Menuju Masjid Kampus'),
(1, NULL, 'info', 10, -45, 'Info Gerbang', 'Gerbang utama kampus UNU Yogyakarta dibangun tahun 2020 dengan arsitektur modern yang megah.');

-- Hotspots dari Gedung Rektorat (id=2)
INSERT INTO tour_api_hotspot (from_scene_id, to_scene_id, hotspot_type, pitch, yaw, text) VALUES
(2, 1, 'scene', 0, 180, 'Kembali ke Gerbang Utama'),
(2, 3, 'scene', -10, 45, 'Menuju Perpustakaan'),
(2, NULL, 'info', 5, 0, 'Tentang Rektorat', 'Gedung rektorat merupakan pusat administrasi dan manajemen kampus UNU Yogyakarta.');

-- Hotspots dari Perpustakaan (id=3)
INSERT INTO tour_api_hotspot (from_scene_id, to_scene_id, hotspot_type, pitch, yaw, text) VALUES
(3, 2, 'scene', 0, -135, 'Kembali ke Rektorat'),
(3, 5, 'scene', 0, 90, 'Menuju Lab Komputer'),
(3, NULL, 'info', 0, 0, 'Koleksi Buku', 'Perpustakaan memiliki lebih dari 10,000 koleksi buku dan jurnal ilmiah.');

-- Hotspots dari Masjid (id=4)
INSERT INTO tour_api_hotspot (from_scene_id, to_scene_id, hotspot_type, pitch, yaw, text) VALUES
(4, 1, 'scene', 0, -90, 'Kembali ke Gerbang'),
(4, NULL, 'info', 0, 45, 'Jadwal Sholat', 'Masjid kampus buka 24 jam dan menyediakan jadwal kajian rutin setiap hari Jumat.');

-- Hotspots dari Lab Komputer (id=5)
INSERT INTO tour_api_hotspot (from_scene_id, to_scene_id, hotspot_type, pitch, yaw, text) VALUES
(5, 3, 'scene', 0, 180, 'Kembali ke Perpustakaan'),
(5, NULL, 'info', 0, 0, 'Fasilitas Lab', 'Lab komputer dilengkapi dengan 50 unit PC terbaru dan koneksi internet berkecepatan tinggi.');

-- =============================================
-- Verification Queries
-- =============================================

-- Count scenes and hotspots
SELECT 'Total Scenes:' as metric, COUNT(*) as count FROM tour_api_scene
UNION ALL
SELECT 'Active Scenes:', COUNT(*) FROM tour_api_scene WHERE is_active = 1
UNION ALL
SELECT 'Featured Scene:', COUNT(*) FROM tour_api_scene WHERE is_featured = 1
UNION ALL
SELECT 'Total Hotspots:', COUNT(*) FROM tour_api_hotspot
UNION ALL
SELECT 'Navigation Hotspots:', COUNT(*) FROM tour_api_hotspot WHERE hotspot_type = 'scene'
UNION ALL
SELECT 'Info Hotspots:', COUNT(*) FROM tour_api_hotspot WHERE hotspot_type = 'info';

-- =============================================
-- Business Rules Validation
-- =============================================

-- Check: Only one featured scene should exist
-- Expected: 1
SELECT COUNT(*) as featured_count FROM tour_api_scene WHERE is_featured = 1;

-- Check: All scene-type hotspots must have to_scene_id
-- Expected: 0 (no violations)
SELECT COUNT(*) as invalid_scene_hotspots 
FROM tour_api_hotspot 
WHERE hotspot_type = 'scene' AND to_scene_id IS NULL;

-- Check: Floor values must be between 1-9 or NULL
-- Expected: 0 (no violations)
SELECT COUNT(*) as invalid_floors 
FROM tour_api_scene 
WHERE floor IS NOT NULL AND (floor < 1 OR floor > 9);
