import psycopg2

DB_URL = "postgresql://postgres.vusexelcckkqncjkiuch:wENwO2e7G968rmmu@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Check table schema
cur.execute("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name='documents'")
print("Schema:", cur.fetchall())

# Count rows
cur.execute("SELECT COUNT(*) FROM documents")
print("Row count:", cur.fetchone())

# Check embedding dimension of existing rows
cur.execute("SELECT vector_dims(embedding) FROM documents LIMIT 1")
row = cur.fetchone()
print("Existing embedding dim:", row)

cur.close()
conn.close()
