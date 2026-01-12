import psycopg2
import sys
import urllib.parse

def test_connection(url_name, url):
    print(f"\n--- Testing {url_name} ---")
    try:
        # Mask password for display
        parsed = urllib.parse.urlparse(url)
        masked_url = url.replace(parsed.password, "******") if parsed.password else url
        print(f"URL: {masked_url}")
        
        conn = psycopg2.connect(url)
        print("✅ SUCCESS! Connection established.")
        
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        print(f"   Server Version: {version}")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

if __name__ == "__main__":
    print("Paste your DATABASE_URL below and press Enter:")
    db_url = input().strip()
    
    if not db_url:
        print("Error: Empty URL provided.")
        sys.exit(1)

    success = test_connection("Provided URL", db_url)
    
    if not success:
        print("\nPossible fixes:")
        print("1. 'Tenant or user not found': Check username format 'postgres.[project_ref]'")
        print("2. 'Password authentication failed': Check password.")
        print("3. 'Cannot assign requested address': IPv6 issue (use Pooler URL).")
