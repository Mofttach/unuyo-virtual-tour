from django.core.management.base import BaseCommand
from tour_api.models import Scene, Hotspot
from django.core.files.base import ContentFile
from datetime import date
import requests
from io import BytesIO

class Command(BaseCommand):
    help = 'Seeds the database with initial Virtual Tour data if empty'

    def handle(self, *args, **kwargs):
        if Scene.objects.exists():
            self.stdout.write(self.style.WARNING('Data already exists. Skipping seeding.'))
            return

        self.stdout.write(self.style.SUCCESS('Seeding database...'))
        
        # --- Data Generation Logic (Adapted from generate_dummy_data.py) ---
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
            seed = seed or ""
            url = f"https://picsum.photos/seed/{seed}/{width}/{height}"
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    return BytesIO(response.content)
            except Exception as e:
                print(f"   Error downloading image: {e}")
            return None

        def download_thumbnail(width=640, height=360, seed=None):
            seed = seed or ""
            url = f"https://picsum.photos/seed/{seed}/{width}/{height}"
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    return BytesIO(response.content)
            except Exception as e:
                print(f"   Error downloading thumbnail: {e}")
            return None

        scenes = []
        for idx, loc_data in enumerate(CAMPUS_LOCATIONS, start=1):
            self.stdout.write(f"Creating: {loc_data['title']}")
            
            panorama_image = download_placeholder_image(seed=f"unu-pano-{idx}")
            thumbnail_image = download_thumbnail(seed=f"unu-thumb-{idx}")
            
            if not panorama_image or not thumbnail_image:
                self.stdout.write(self.style.ERROR(f"Failed to download images for {loc_data['title']}"))
                continue
            
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
                is_featured=(idx == 1)
            )
            
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

        if len(scenes) >= 2:
            self.stdout.write("Linking scenes...")
            Hotspot.objects.create(
                from_scene=scenes[0],
                to_scene=scenes[1],
                hotspot_type='scene',
                text='Ke Gedung MBZ',
                pitch=0,
                yaw=45,
            )
            Hotspot.objects.create(
                from_scene=scenes[1],
                to_scene=scenes[0],
                hotspot_type='scene',
                text='Ke Gedung Utama',
                pitch=0,
                yaw=-45,
            )
            for scene in scenes:
                Hotspot.objects.create(
                    from_scene=scene,
                    hotspot_type='info',
                    text='ℹ️ Info Gedung',
                    info_description=f"Tentang {scene.building}",
                    pitch=10,
                    yaw=0,
                )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(scenes)} scenes!'))
