import sqlite3

try:
    conn = sqlite3.connect('kas_rt.db')
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(settings)")
    columns = cursor.fetchall()
    print("Columns in 'settings' table:")
    for col in columns:
        print(col)
    conn.close()
except Exception as e:
    print(f"Error checking DB: {e}")
