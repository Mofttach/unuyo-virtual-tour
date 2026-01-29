
import os
import sys
import django
from django.conf import settings
from django.core.files.storage import default_storage

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'unu_tour.settings')
django.setup()

print("--- TESTING STORAGE URL GENERATION ---")
try:
    # Test valid filename
    test_url = default_storage.url('panoramas/test.jpg')
    print(f"Generated URL: {test_url}")
    
    # Check if it matches expected public format
    expected_root = "https://" + settings.STORAGES['default']['OPTIONS']['custom_domain']
    if test_url.startswith(expected_root):
        print("✅ URL format looks correct")
    else:
        print(f"❌ URL format mismatch.\nExpected start: {expected_root}\nActual: {test_url}")

except Exception as e:
    print(f"❌ CRITICAL ERROR during URL generation: {e}")
    import traceback
    traceback.print_exc()
