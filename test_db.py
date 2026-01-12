import psycopg2
import sys

# Configuration from User
REF = "shfjorsphsknrbrtmpzo"
PASSWORD = "Xscn!Moft293721"
DB = "postgres"
USER = "postgres"

def test_conn(name, host, port, dbname, user, password):
    print(f"Testing {name} ({host}:{port})...")
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
            connect_timeout=5
        )
        print(f"  [SUCCESS] Connected to {name}!")
        conn.close()
        return True
    except Exception as e:
        print(f"  [FAILED] {name}: {e}")
        return False

# 1. Direct Connection (Likely IPv6 only)
direct_host = f"db.{REF}.supabase.co"
test_conn("DIRECT", direct_host, 5432, DB, USER, PASSWORD)

# 2. Pooler (Session Mode - Port 5432)
pooler_host = "aws-0-ap-northeast-2.pooler.supabase.com"
pooler_user = f"{USER}.{REF}"
test_conn("POOLER_SESSION", pooler_host, 5432, DB, pooler_user, PASSWORD)

# 3. Pooler (Transaction Mode - Port 6543)
test_conn("POOLER_OPTS", pooler_host, 6543, DB, pooler_user, PASSWORD)

# 4. Alias Pooler User Check (Sometimes user is just 'postgres' on pooler if aliased?)
test_conn("POOLER_SIMPLE_USER", pooler_host, 5432, DB, USER, PASSWORD)
