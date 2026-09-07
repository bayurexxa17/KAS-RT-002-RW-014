import sqlite3
import os

def update_logo():
    db_path = 'kas_rt.db'
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found!")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        # Check if settings exists
        cursor.execute("SELECT id FROM settings LIMIT 1")
        row = cursor.fetchone()
        
        logo_path = "/uploads/rtapp.png"
        
        if row:
            cursor.execute("UPDATE settings SET logo_url = ?", (logo_path,))
            print(f"Updated existing settings with logo_url: {logo_path}")
        else:
            cursor.execute("INSERT INTO settings (app_name, logo_url) VALUES (?, ?)", ("Kas RT", logo_path))
            print(f"Created new settings with logo_url: {logo_path}")
            
        conn.commit()
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    update_logo()
