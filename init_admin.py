import sqlite3
import os
from models import RoleType

# Simple password hashing placeholder to match main.py
def get_password_hash(password):
    return f"{password}notreallyhashed"

def init_admin():
    db_path = 'kas_rt.db'
    if not os.path.exists(db_path):
        print(f"Error: Database {db_path} not found. Run models creation first.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if admin exists
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        exists = cursor.fetchone()

        if not exists:
            hashed_pw = get_password_hash("admin123")
            role = "ADMIN" # Matches RoleType.ADMIN value in models.py
            cursor.execute(
                "INSERT INTO users (username, hashed_password, role) VALUES (?, ?, ?)",
                ("admin", hashed_pw, role)
            )
            conn.commit()
            print("✅ Admin user created successfully: admin / admin123")
        else:
            print("ℹ️ Admin user already exists.")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    init_admin()
