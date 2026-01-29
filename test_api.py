
import os
import django
from django.conf import settings
# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'unu_tour.settings')
django.setup()

from rest_framework.test import APIClient

print("--- TESTING API ENDPOINTS ---")
client = APIClient()

endpoints = [
    '/api/scenes/',
    '/api/hotspots/',
]

for endpoint in endpoints:
    print(f"\nFetching {endpoint}...")
    print(f"\nFetching {endpoint}...")
    try:
        response = client.get(endpoint, HTTP_HOST='127.0.0.1')
        print(f"Status Code: {response.status_code}")
        if response.status_code != 200:
            print(f"Error Status: {response.status_code}")
            # Save error to file
            with open('last_500_error.html', 'wb') as f:
                f.write(response.content)
            print("Saved error details to last_500_error.html")
            print("✅ OK")
            # Print first item to check URL format
            if response.data and isinstance(response.data, list) and len(response.data) > 0:
                print(f"First item image URL: {response.data[0].get('panorama_image')}")
    except Exception as e:
        print(f"❌ CRITICAL EXCEPTION: {e}")
        import traceback
        traceback.print_exc()
