
import os
import django
import sys
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'unu_tour.settings')
django.setup()

from tour_api.models import Scene

print("--- TESTING DATABASE CONNECTION ---")
try:
    count = Scene.objects.count()
    print(f"✅ DB Connected Successfully! Total Scenes: {count}")
except Exception as e:
    print(f"❌ DB CONNECTION FAILED: {e}")

print("\n--- TESTING MEDIA URL ---")
test_url = "https://shfjorsphsknrbrtmpzo.supabase.co/storage/v1/object/public/media/panoramas/Depan_Kampus_UpjnfNL.jpg"
print(f"Fetching: {test_url}")
try:
    r = requests.head(test_url)
    print(f"Status Code: {r.status_code}")
    if r.status_code == 200:
        print("✅ Image URL is VALID and Accessible")
    elif r.status_code == 400:
        print("❌ 400 Bad Request - Check Bucket Name, Project ID, or File Path")
    elif r.status_code == 404:
        print("❌ 404 Not Found - File does not exist")
    else:
        print(f"❌ Error: {r.status_code}")
except Exception as e:
    print(f"❌ Request Failed: {e}")
