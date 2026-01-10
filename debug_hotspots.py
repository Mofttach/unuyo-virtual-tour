import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'unu_tour.settings')
django.setup()

from tour_api.models import Scene, Hotspot

try:
    scene = Scene.objects.get(slug='gedung-utama')
    print(f"Scene: {scene.title}")
    hotspots = Hotspot.objects.filter(from_scene=scene)
    print(f"Total Hotspots: {hotspots.count()}")
    for h in hotspots:
        print(f" - Type: {h.hotspot_type}, To: {h.to_scene.title if h.to_scene else 'None'}, Pitch: {h.pitch}, Yaw: {h.yaw}")

except Scene.DoesNotExist:
    print("Scene 'gedung-utama' not found!")
