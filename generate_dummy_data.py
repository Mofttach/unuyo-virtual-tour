"""
Script untuk generate dummy data Virtual Tour UNU Yogyakarta
Menggunakan placeholder images dari berbagai sumber
"""

import os
import sys
import django
from datetime import date, timedelta
from pathlib import Path

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'unu_tour.settings')
django.setup()

from tour_api.models import Scene, Hotspot
from django.core.files.base import ContentFile
import requests
from io import BytesIO

print("🚀 Starting Virtual Tour Data Generator...")
print("=" * 60)

# Data lokasi kampus UNU Yogyakarta yang menarik
CAMPUS_LOCATIONS = [
    {
        "title": "Gerbang Utama UNU Yogyakarta",
        "slug": "gerbang-utama-unu",
        "description": """Selamat datang di Universitas Nahdlatul Ulama (UNU) Yogyakarta! 
        
Gerbang utama ini adalah pintu masuk ke kampus yang modern dan islami. Dengan arsitektur yang memadukan unsur tradisional dan kontemporer, gerbang ini menjadi landmark pertama yang menyambut mahasiswa, dosen, dan tamu kampus.

UNU Yogyakarta berdiri sebagai institusi pendidikan tinggi yang mengedepankan nilai-nilai ke-NU-an, keilmuan, dan kebangsaan. Kampus ini menjadi wadah bagi generasi muda untuk mengembangkan potensi akademik dan spiritual mereka.

Mari jelajahi kampus kami dan rasakan atmosfer belajar yang inspiratif!""",
        "location": "Sleman, Yogyakarta",
        "initial_yaw": 0,
        "initial_pitch": 0,
    },
    {
        "title": "Gedung Rektorat UNU Yogyakarta",
        "slug": "gedung-rektorat",
        "description": """Gedung Rektorat adalah pusat administrasi dan pimpinan Universitas Nahdlatul Ulama Yogyakarta.

Di gedung megah ini, Rektor bersama jajaran pimpinan universitas merumuskan visi dan misi pengembangan kampus. Gedung ini juga menjadi tempat berlangsungnya berbagai pertemuan strategis, wisuda, dan acara penting universitas.

Arsitektur gedung ini mencerminkan nilai-nilai Islam moderat yang menjadi ciri khas UNU. Interior yang luas dan modern menciptakan suasana profesional namun tetap hangat untuk melayani sivitas akademika.

Fasilitas di gedung ini meliputi ruang kerja pimpinan, ruang rapat, aula serba guna, dan berbagai layanan administrasi mahasiswa.""",
        "location": "Sleman, Yogyakarta",
        "initial_yaw": 90,
        "initial_pitch": 5,
    },
    {
        "title": "Masjid Al-Muttaqien UNU Yogyakarta",
        "slug": "masjid-al-muttaqien",
        "description": """Masjid Al-Muttaqien adalah jantung spiritual kampus UNU Yogyakarta.

Dengan kubah megah dan menara yang menjulang, masjid ini mampu menampung ribuan jamaah. Setiap hari, mahasiswa dan dosen berkumpul di sini untuk menunaikan sholat berjamaah, kajian keislaman, dan berbagai aktivitas keagamaan.

Arsitektur masjid memadukan gaya Timur Tengah klasik dengan sentuhan Nusantara. Interior yang sejuk dengan kaligrafi indah menciptakan suasana khusyuk untuk beribadah.

Masjid ini juga menjadi pusat kajian Islam Nusantara yang rahmatan lil alamin, sejalan dengan nilai-nilai Nahdlatul Ulama. Di sini, tradisi pesantren dan modernitas universitas bertemu dalam harmoni yang indah.""",
        "location": "Sleman, Yogyakarta",
        "initial_yaw": -45,
        "initial_pitch": 10,
    },
    {
        "title": "Perpustakaan Pusat UNU Yogyakarta",
        "slug": "perpustakaan-pusat",
        "description": """Perpustakaan Pusat UNU Yogyakarta adalah surga bagi para pencari ilmu.

Dengan koleksi lebih dari 50.000 buku, jurnal ilmiah, dan sumber digital, perpustakaan ini menyediakan referensi lengkap untuk berbagai bidang keilmuan. Koleksi khusus tentang Islam Nusantara dan kajian ke-NU-an menjadi keunggulan perpustakaan ini.

Fasilitas modern meliputi ruang baca ber-AC, area diskusi, komputer akses internet, dan sistem peminjaman terintegrasi. Mahasiswa dapat belajar dengan nyaman hingga malam hari.

Perpustakaan digital kami juga menyediakan akses ke ribuan e-book dan jurnal internasional, mendukung riset berkualitas tinggi para mahasiswa dan dosen.""",
        "location": "Sleman, Yogyakarta",
        "initial_yaw": 180,
        "initial_pitch": -5,
    },
    {
        "title": "Gedung Fakultas Tarbiyah",
        "slug": "fakultas-tarbiyah",
        "description": """Fakultas Tarbiyah dan Ilmu Keguruan adalah salah satu fakultas unggulan di UNU Yogyakarta.

Gedung modern ini menjadi rumah bagi calon-calon pendidik masa depan Indonesia. Dengan berbagai program studi seperti Pendidikan Agama Islam (PAI), Pendidikan Guru Madrasah Ibtidaiyah (PGMI), dan Pendidikan Bahasa Arab, fakultas ini mencetak guru-guru berkualitas tinggi.

Fasilitas pembelajaran meliputi ruang kuliah multimedia, laboratorium micro teaching, perpustakaan fakultas, dan ruang seminar. Dosen-dosen berpengalaman membimbing mahasiswa dengan metode pembelajaran inovatif.

Lulusan Fakultas Tarbiyah UNU Yogyakarta dikenal sebagai pendidik yang tidak hanya kompeten secara akademik, tetapi juga memiliki karakter Islami yang kuat.""",
        "location": "Sleman, Yogyakarta",
        "initial_yaw": 45,
        "initial_pitch": 0,
    },
    {
        "title": "Gedung Fakultas Syariah",
        "slug": "fakultas-syariah",
        "description": """Fakultas Syariah UNU Yogyakarta adalah pusat kajian hukum Islam kontemporer.

Di gedung yang megah ini, mahasiswa mempelajari fiqh, ushul fiqh, ekonomi syariah, dan berbagai aspek hukum Islam yang relevan dengan perkembangan zaman. Program studi unggulan seperti Hukum Keluarga Islam dan Ekonomi Syariah menghasilkan lulusan yang siap menjawab tantangan zaman.

Metode pembelajaran memadukan tradisi pesantren dengan pendekatan akademik modern. Mahasiswa tidak hanya menguasai kitab-kitab klasik, tetapi juga memahami isu-isu kontemporer seperti fintech syariah dan hukum digital.

Kerjasama dengan lembaga keuangan syariah dan pengadilan agama memberikan pengalaman praktis yang berharga bagi mahasiswa.""",
        "location": "Sleman, Yogyakarta",
        "initial_yaw": -90,
        "initial_pitch": 5,
    },
    {
        "title": "Lapangan Olahraga UNU Yogyakarta",
        "slug": "lapangan-olahraga",
        "description": """Lapangan olahraga multifungsi ini adalah pusat aktivitas fisik dan rekreasi mahasiswa.

Dengan luas yang memadai, lapangan ini dapat digunakan untuk sepak bola, futsal, bola voli, basket, dan berbagai cabang olahraga lainnya. Setiap sore, mahasiswa berkumpul di sini untuk berolahraga dan mempererat persaudaraan.

Fasilitas tribun penonton, lampu penerangan, dan ruang ganti melengkapi lapangan ini. Berbagai turnamen olahraga antar fakultas dan universitas sering digelar di sini.

Kampus yang sehat adalah kampus yang aktif. UNU Yogyakarta percaya bahwa kesehatan jasmani sama pentingnya dengan kesehatan rohani dan kecerdasan intelektual.""",
        "location": "Sleman, Yogyakarta",
        "initial_yaw": 0,
        "initial_pitch": -10,
    },
    {
        "title": "Student Center & Kantin Kampus",
        "slug": "student-center",
        "description": """Student Center adalah jantung kehidupan sosial mahasiswa UNU Yogyakarta.

Di kompleks modern ini terdapat kantin dengan berbagai pilihan makanan halal dan bergizi, area berkumpul, co-working space, dan ruang organisasi mahasiswa. Mahasiswa dapat bersantai, berdiskusi, atau mengerjakan tugas kelompok di sini.

Kantin kampus menyajikan menu beragam dari soto ayam, nasi goreng, hingga kopi kekinian dengan harga terjangkau untuk kantong mahasiswa. Suasana ramah dan nyaman membuat tempat ini selalu ramai dikunjungi.

Berbagai unit kegiatan mahasiswa (UKM) juga memiliki basecamp di Student Center, menjadikannya pusat kreativitas dan pengembangan minat bakat mahasiswa.""",
        "location": "Sleman, Yogyakarta",
        "initial_yaw": 135,
        "initial_pitch": 0,
    },
    {
        "title": "Taman Kampus & Area Hijau",
        "slug": "taman-kampus",
        "description": """Taman kampus UNU Yogyakarta adalah oasis hijau di tengah kesibukan akademik.

Dengan pepohonan rindang, taman bunga yang asri, dan jalur pedestrian yang nyaman, area ini menjadi tempat favorit mahasiswa untuk bersantai dan menenangkan pikiran. Bangku-bangku taman tersebar di berbagai sudut, cocok untuk membaca atau diskusi informal.

Konsep green campus diterapkan dengan serius di UNU Yogyakarta. Area hijau ini tidak hanya indah dipandang, tetapi juga berfungsi sebagai paru-paru kampus yang menyejukkan.

Di pagi hari, burung-burung berkicau di pepohonan. Di sore hari, mahasiswa berkumpul menikmati sunset sambil ngobrol. Taman ini membuktikan bahwa kampus bukan hanya tempat belajar, tetapi juga rumah kedua yang nyaman.""",
        "location": "Sleman, Yogyakarta",
        "initial_yaw": -135,
        "initial_pitch": 0,
    },
    {
        "title": "Laboratorium Komputer & IT Center",
        "slug": "lab-komputer",
        "description": """Laboratorium Komputer UNU Yogyakarta dilengkapi dengan teknologi terkini untuk mendukung pembelajaran digital.

Dengan puluhan unit komputer berperforma tinggi, akses internet super cepat, dan software berlisensi, lab ini menjadi tempat mahasiswa mengasah keterampilan IT. Program studi Teknik Informatika dan Sistem Informasi memanfaatkan fasilitas ini untuk praktikum pemrograman, desain grafis, dan pengembangan aplikasi.

IT Center juga menyediakan layanan cloud computing, hosting, dan dukungan teknis untuk seluruh sivitas akademika. Mahasiswa dapat mengembangkan project startup digital mereka dengan bimbingan dosen dan fasilitas memadai.

Di era digital ini, UNU Yogyakarta memastikan mahasiswanya tidak hanya paham agama, tetapi juga menguasai teknologi untuk menjadi pemimpin masa depan.""",
        "location": "Sleman, Yogyakarta",
        "initial_yaw": 90,
        "initial_pitch": 0,
    }
]

def download_placeholder_image(width=4096, height=2048, seed=None):
    """
    Download placeholder image from picsum.photos (free placeholder service)
    For 360° panorama, we need 2:1 ratio (equirectangular)
    """
    seed = seed or ""
    url = f"https://picsum.photos/seed/{seed}/{width}/{height}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return BytesIO(response.content)
    except Exception as e:
        print(f"   ⚠️  Error downloading image: {e}")
    return None

def download_thumbnail(width=640, height=360, seed=None):
    """Download thumbnail (16:9 ratio)"""
    seed = seed or ""
    url = f"https://picsum.photos/seed/{seed}/{width}/{height}"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return BytesIO(response.content)
    except Exception as e:
        print(f"   ⚠️  Error downloading thumbnail: {e}")
    return None

# Delete existing data (optional - hapus kalau mau keep data lama)
print("\n🗑️  Clearing existing data...")
Hotspot.objects.all().delete()
Scene.objects.all().delete()
print("   ✅ Old data deleted")

# Create scenes
print("\n📸 Creating 10 virtual tour scenes...")
scenes = []

for idx, loc_data in enumerate(CAMPUS_LOCATIONS, start=1):
    print(f"\n{idx}. Creating: {loc_data['title']}")
    
    # Download images
    print(f"   📥 Downloading panorama image...")
    panorama_image = download_placeholder_image(seed=f"unu-pano-{idx}")
    
    print(f"   📥 Downloading thumbnail...")
    thumbnail_image = download_thumbnail(seed=f"unu-thumb-{idx}")
    
    if not panorama_image or not thumbnail_image:
        print(f"   ❌ Failed to download images, skipping...")
        continue
    
    # Create scene
    scene = Scene(
        title=loc_data['title'],
        slug=loc_data['slug'],
        description=loc_data['description'],
        location=loc_data['location'],
        published_date=date.today() - timedelta(days=idx),
        author="Tim Virtual Tour UNU",
        initial_pitch=loc_data.get('initial_pitch', 0),
        initial_yaw=loc_data.get('initial_yaw', 0),
        initial_fov=90,
        is_active=True,
        is_featured=(idx == 1)  # First scene is featured
    )
    
    # Save images
    scene.panorama_image.save(
        f"{loc_data['slug']}-pano.jpg",
        ContentFile(panorama_image.getvalue()),
        save=False
    )
    scene.thumbnail.save(
        f"{loc_data['slug']}-thumb.jpg",
        ContentFile(thumbnail_image.getvalue()),
        save=False
    )
    
    scene.save()
    scenes.append(scene)
    print(f"   ✅ Scene created: {scene.title}")

print(f"\n✨ Created {len(scenes)} scenes successfully!")

# Create hotspots to connect scenes
print("\n🔗 Creating navigation hotspots...")

# Create circular navigation (each scene points to next and previous)
hotspot_count = 0
for i, scene in enumerate(scenes):
    # Link to next scene (circular)
    next_scene = scenes[(i + 1) % len(scenes)]
    hotspot = Hotspot.objects.create(
        from_scene=scene,
        to_scene=next_scene,
        hotspot_type='scene',
        text=f'Ke {next_scene.title}',
        pitch=0,
        yaw=45,
    )
    hotspot_count += 1
    
    # Link to previous scene (circular)
    prev_scene = scenes[(i - 1) % len(scenes)]
    hotspot = Hotspot.objects.create(
        from_scene=scene,
        to_scene=prev_scene,
        hotspot_type='scene',
        text=f'Ke {prev_scene.title}',
        pitch=0,
        yaw=-45,
    )
    hotspot_count += 1
    
    # Add info hotspot
    hotspot = Hotspot.objects.create(
        from_scene=scene,
        to_scene=None,
        hotspot_type='info',
        text='ℹ️ Info Lokasi',
        info_description=f"Lokasi ini adalah {scene.title}. {scene.description[:100]}...",
        pitch=10,
        yaw=0,
    )
    hotspot_count += 1

print(f"   ✅ Created {hotspot_count} hotspots")

print("\n" + "=" * 60)
print("🎉 DUMMY DATA GENERATION COMPLETED!")
print("=" * 60)
print(f"\n📊 Summary:")
print(f"   • Total Scenes: {len(scenes)}")
print(f"   • Total Hotspots: {hotspot_count}")
print(f"   • Featured Scene: {scenes[0].title if scenes else 'None'}")
print(f"\n🔗 Next Steps:")
print(f"   1. Start Django server: python manage.py runserver")
print(f"   2. Visit admin: http://127.0.0.1:8000/admin")
print(f"   3. Check API: http://127.0.0.1:8000/api/scenes/")
print(f"   4. Test Pannellum config: http://127.0.0.1:8000/api/scenes/pannellum/")
print("\n✨ Happy coding!\n")
