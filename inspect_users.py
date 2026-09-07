from backend.database import SessionLocal
from backend.models import User

try:
    db = SessionLocal()
    users = db.query(User).all()
    print(f"Total Users: {len(users)}")
    print("-" * 50)
    for u in users:
        print(f"ID: {u.id}")
        print(f"Username: {u.username}")
        print(f"Role: {u.role}")
        print(f"Hashed PW: {u.hashed_password}")
        print("-" * 50)
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
