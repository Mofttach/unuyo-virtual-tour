
from django.core.management.base import BaseCommand
from tour_api.models import Scene, Hotspot
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Seeds the database with complex hierarchical tour data (MBZ Floors, etc)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Cleaning existing data...')
        Scene.objects.all().delete()
        Hotspot.objects.all().delete()

        today = timezone.now().date()

        # Common thumbnails/panos (using placeholders or existing files if available)
        # In reality, these would be different files. We use proxies for now.
        PANO_URL = "http://localhost:8000/media/panoramas/gedung-utama-pano.jpg" 
        THUMB_URL = "http://localhost:8000/media/thumbnails/gedung-utama-thumb.jpg"

        scenes = []

        # --- GEDUNG UTAMA (Featured) ---
        utama = Scene.objects.create(
            slug="gedung-utama",
            title="Lobby Gedung Utama",
            building="Gedung Utama",
            floor=1,
            description="Pusat administrasi utama.",
            is_featured=True,
            panorama_image="panoramas/gedung-utama-pano.jpg", # Relative path in media root
            thumbnail="thumbnails/gedung-utama-thumb.jpg",
            published_date=today
        )
        self.stdout.write(f'Created: {utama.title}')

        # --- GEDUNG MBZ (Outdoor) ---
        mbz_outdoor = Scene.objects.create(
            slug="gedung-mbz-outdoor",
            title="Halaman Depan MBZ",
            building="Gedung MBZ",
            floor=None,
            floor_description="Area Luar",
            description="Tampak depan Gedung Muhammad Bin Zayed (MBZ).",
            is_featured=False,
            panorama_image="panoramas/gedung-mbz-cfs-pano.jpg",
            thumbnail="thumbnails/gedung-mbz-cfs-thumb.jpg",
            published_date=today
        )

        # --- GEDUNG MBZ - LANTAI 1 ---
        mbz_l1_lobby = Scene.objects.create(
            slug="mbz-l1-lobby",
            title="Lobby MBZ",
            building="Gedung MBZ",
            floor=1,
            description="Resepsionis dan area tunggu.",
            panorama_image="panoramas/gedung-mbz-cfs-pano.jpg", # Placeholder image
            thumbnail="thumbnails/gedung-mbz-cfs-thumb.jpg",
            published_date=today
        )

        mbz_l1_koridor = Scene.objects.create(
            slug="mbz-l1-koridor",
            title="Koridor Utama Lt 1",
            building="Gedung MBZ",
            floor=1,
            description="Akses menuju lift dan tangga.",
            panorama_image="panoramas/gedung-mbz-cfs-pano.jpg",
            thumbnail="thumbnails/gedung-mbz-cfs-thumb.jpg",
            published_date=today
        )

        # --- GEDUNG MBZ - LANTAI 5 (Complex) ---
        mbz_l5_hall = Scene.objects.create(
            slug="mbz-l5-hall",
            title="Hall Lantai 5",
            building="Gedung MBZ",
            floor=5,
            description="Area berkumpul mahasiswa.",
            panorama_image="panoramas/gedung-mbz-cfs-pano.jpg",
            thumbnail="thumbnails/gedung-mbz-cfs-thumb.jpg",
            published_date=today
        )

        mbz_l5_perpus = Scene.objects.create(
            slug="mbz-l5-perpus",
            title="Perpustakaan",
            building="Gedung MBZ",
            floor=5,
            description="Koleksi buku digital dan fisik.",
            panorama_image="panoramas/prpus.jpg", # Using existing perpus image
            thumbnail="thumbnails/gedung-utama-thumb.jpg",
            published_date=today
        )

        mbz_l5_lab = Scene.objects.create(
            slug="mbz-l5-lab-bahasa",
            title="Laboratorium Bahasa",
            building="Gedung MBZ",
            floor=5,
            description="Fasilitas pembelajaran multimedia.",
            panorama_image="panoramas/gedung-mbz-cfs-pano.jpg",
            thumbnail="thumbnails/gedung-mbz-cfs-thumb.jpg",
            published_date=today
        )

        # --- CONNECTIONS (Hotspots) ---
        
        # Utama -> MBZ Outdoor
        Hotspot.objects.create(
            from_scene=utama,
            hotspot_type='scene',
            to_scene=mbz_outdoor,
            text="Ke Gedung MBZ",
            yaw=45, pitch=0
        )

        # MBZ Outdoor -> Utama
        Hotspot.objects.create(
            from_scene=mbz_outdoor,
            hotspot_type='scene',
            to_scene=utama,
            text="Ke Gedung Utama",
            yaw=-130, pitch=0
        )

        # MBZ Outdoor -> MBZ Lobby (Enter Building)
        Hotspot.objects.create(
            from_scene=mbz_outdoor,
            hotspot_type='scene',
            to_scene=mbz_l1_lobby,
            text="Masuk Lobby",
            yaw=10, pitch=5
        )

        # MBZ Lobby -> Hall L5 (Elevator)
        Hotspot.objects.create(
            from_scene=mbz_l1_lobby,
            hotspot_type='scene',
            to_scene=mbz_l5_hall,
            text="Naik ke Lantai 5",
            yaw=90, pitch=10
        )

        # MBZ Hall L5 -> Perpus
        Hotspot.objects.create(
            from_scene=mbz_l5_hall,
            hotspot_type='scene',
            to_scene=mbz_l5_perpus,
            text="Masuk Perpustakaan",
            yaw=0, pitch=0
        )

        # MBZ Hall L5 -> Lab
        Hotspot.objects.create(
            from_scene=mbz_l5_hall,
            hotspot_type='scene',
            to_scene=mbz_l5_lab,
            text="Lab Bahasa",
            yaw=180, pitch=0
        )

        # MBZ Perpus -> Hall L5 (Exit)
        Hotspot.objects.create(
            from_scene=mbz_l5_perpus,
            hotspot_type='scene',
            to_scene=mbz_l5_hall,
            text="Keluar",
            yaw=180, pitch=0
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded complex tour data!'))
