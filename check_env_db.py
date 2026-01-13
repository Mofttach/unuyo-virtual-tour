import os
import django
import psycopg2
import sys
from urllib.parse import urlparse

# Setup Django to load .env via settings or dotenv
# Assuming manage.py loads .env or we need to load it manually
# Let's try manual load for simplicity since we just want the string
from pathlib import Path

def load_env():
    env_path = Path('.') / '.env'
    if not env_path.exists():
        print("❌ .env file not found")
        return None
    
    with open(env_path, 'r') as f:
        for line in f:
            if line.strip().startswith('DATABASE_URL='):
                return line.strip().split('=', 1)[1].strip().strip('"').strip("'")
    return None

def test_connection():
    db_url = load_env()
    if not db_url:
        print("❌ DATABASE_URL not found in .env")
        return

    print(f"Testing connection with DATABASE_URL from .env...")
    try:
        conn = psycopg2.connect(db_url, connect_timeout=10)
        print("✅ SUCCESS! Connection established using .env credentials.")
        conn.close()
    except Exception as e:
        print(f"❌ FAILED: {e}")

if __name__ == "__main__":
    test_connection()
