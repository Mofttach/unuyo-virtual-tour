
import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'unu_tour.settings')
django.setup()

print("--- DEBUG SETTINGS ---")
print(f"USE_LOCAL_DB: {settings.USE_LOCAL_DB}")
print(f"AWS_S3_ENDPOINT_URL: {getattr(settings, 'AWS_S3_ENDPOINT_URL', 'Not Set')}")
print(f"AWS_STORAGE_BUCKET_NAME: {getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'Not Set')}")

if hasattr(settings, 'STORAGES'):
    default_storage = settings.STORAGES.get('default', {})
    options = default_storage.get('OPTIONS', {})
    print(f"Storage Backend: {default_storage.get('BACKEND')}")
    print(f"custom_domain: {options.get('custom_domain')}")
    print(f"endpoint_url: {options.get('endpoint_url')}")

print(f"MEDIA_URL: {settings.MEDIA_URL}")
