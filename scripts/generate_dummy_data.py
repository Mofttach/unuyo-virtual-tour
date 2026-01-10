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
BASE_DIR = Path(__file__).resolve().parent.parent
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
# Data lokasi kampus UNU Yogyakarta (2 Gedung spesifik)
# Data lokasi kampus UNU Yogyakarta (2 Gedung spesifik)
CAMPUS_LOCATIONS = [
    {
        "title": "Gedung Utama",
        "slug": "gedung-utama",
        "building": "Gedung Utama",
        "floor": 1,
        "description": "Lobby utama Gedung Kantor Pusat UNU Yogyakarta. Pusat administrasi dan layanan mahasiswa.",
        "location": "Sleman, Yogyakarta",
        "initial_yaw": 0,
        "initial_pitch": 0,
    },
    {
        "title": "Gedung MBZ CFS",
        "slug": "gedung-mbz-cfs",
        "building": "Gedung MBZ CFS",
        "floor": 1,
        "description": "Mohammed Bin Zayed College for Future Studies (MBZ CFS). Pusat studi masa depan dengan fasilitas teknologi tinggi.",
        "location": "Sleman, Yogyakarta",
        "initial_yaw": 0,
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

# Delete existing data
print("\n🗑️  Clearing existing data...")
Hotspot.objects.all().delete()
Scene.objects.all().delete()
print("   ✅ Old data deleted")

# Create scenes
print("\n📸 Creating 2 virtual tour scenes...")
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
        building=loc_data['building'],
        floor=loc_data['floor'],
        description=loc_data['description'],
        location=loc_data['location'],
        published_date=date.today(),
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

# Create hotspots
if len(scenes) >= 2:
    print("\n🔗 Linking Gedung Utama <-> Gedung MBZ CFS ...")
    
    # 1. Gedung Utama -> Gedung MBZ
    Hotspot.objects.create(
        from_scene=scenes[0], # Utama
        to_scene=scenes[1],   # MBZ
        hotspot_type='scene',
        text='Ke Gedung MBZ',
        pitch=0,
        yaw=45,
    )
    
    # 2. Gedung MBZ -> Gedung Utama
    Hotspot.objects.create(
        from_scene=scenes[1], # MBZ
        to_scene=scenes[0],   # Utama
        hotspot_type='scene',
        text='Ke Gedung Utama',
        pitch=0,
        yaw=-45,
    )
    
    # Info points
    for scene in scenes:
        Hotspot.objects.create(
            from_scene=scene,
            hotspot_type='info',
            text='ℹ️ Info Gedung',
            info_description=f"Tentang {scene.building}",
            pitch=10,
            yaw=0,
        )

print("\n" + "=" * 60)
print("🎉 DUMMY DATA (2 Buildings) GENERATION COMPLETED!")
print("=" * 60)
