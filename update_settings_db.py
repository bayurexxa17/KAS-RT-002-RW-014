import sqlite3

def migrate():
    conn = sqlite3.connect('kas_rt.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE settings ADD COLUMN description TEXT")
        conn.commit()
        print("Successfully added 'description' column to 'settings' table.")
    except sqlite3.OperationalError as e:
        print(f"Migration skipped or failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
