import sqlite3

def migrate():
    conn = sqlite3.connect('kas_rt.db')
    cursor = conn.cursor()
    
    commands = [
        "ALTER TABLE warga ADD COLUMN foto_url TEXT",
        "ALTER TABLE users ADD COLUMN foto_url TEXT",
        "ALTER TABLE settings ADD COLUMN logo_url TEXT"
    ]
    
    for cmd in commands:
        try:
            print(f"Executing: {cmd}")
            cursor.execute(cmd)
            print("  Success.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("  Column already exists (Skipped).")
            else:
                print(f"  Error: {e}")
                
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
