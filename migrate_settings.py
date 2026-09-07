import sqlite3
import os

db_path = 'kas_rt.db'
if not os.path.exists(db_path):
    print(f"Database {db_path} not found.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if columns already exist
    cursor.execute("PRAGMA table_info(settings)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'qris_url' not in columns:
        cursor.execute('ALTER TABLE settings ADD COLUMN qris_url VARCHAR')
        print("Added column qris_url")
    else:
        print("Column qris_url already exists")
        
    if 'no_rekening' not in columns:
        cursor.execute('ALTER TABLE settings ADD COLUMN no_rekening TEXT')
        print("Added column no_rekening")
    else:
        print("Column no_rekening already exists")
        
    conn.commit()
    print("Migration successful")
except Exception as e:
    print(f"Migration error: {e}")
finally:
    conn.close()
