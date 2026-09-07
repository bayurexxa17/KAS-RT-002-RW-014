from backend.database import SessionLocal
from backend.models import User

try:
    db = SessionLocal()
    users = db.query(User).all()
    print(f"Total Users: {len(users)}")
    for u in users:
        print(f"ID: {u.id} | Username: {u.username} | Role: {u.role} | WargaID: {u.warga_id}")
except Exception as e:
    print(f"Error: {e}")
