import psycopg2

host = "aws-0-ap-northeast-2.pooler.supabase.com"
# Try both username formats
users = ["postgres.shfjorsphsknrbrtmpzo", "postgres"]
password = "Xscn!Moft293721" # Raw password
dbname = "postgres"
port = 5432 # Session mode

print(f"Testing connection to {host}...")

for user in users:
    print(f"\n--- User: {user} ---")
    try:
        conn = psycopg2.connect(
            host=host,
            database=dbname,
            user=user,
            password=password,
            port=port,
            connect_timeout=10,
            sslmode='require'
        )
        print("SUCCESS! Connected.")
        conn.close()
        break
    except Exception as e:
        print(f"FAILED: {e}")
