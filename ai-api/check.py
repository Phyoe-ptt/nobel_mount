import psycopg2
conn = psycopg2.connect('postgresql://postgres.vusexelcckkqncjkiuch:wENwO2e7G968rmmu@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres')
cur = conn.cursor()
cur.execute("SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name = 'documents'")
print(cur.fetchall())
