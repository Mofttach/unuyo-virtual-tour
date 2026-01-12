import psycopg2
import sys

pooler_host = "aws-0-ap-northeast-2.pooler.supabase.com"
user = "postgres.shfjorsphsknrbrtmpzo" # Try full ref first again
password = "Xscn!Moft293721"
dbname = "postgres"

print("--- TEST 1: postgres.ref ---")
try:
    conn = psycopg2.connect(host=pooler_host, port=6543, dbname=dbname, user=user, password=password, connect_timeout=5)
    print("SUCCESS")
    conn.close()
except Exception as e:
    print(f"FAIL: {e}")

print("--- TEST 2: postgres ---")
try:
    conn = psycopg2.connect(host=pooler_host, port=6543, dbname=dbname, user="postgres", password=password, connect_timeout=5)
    print("SUCCESS")
    conn.close()
except Exception as e:
    print(f"FAIL: {e}")
