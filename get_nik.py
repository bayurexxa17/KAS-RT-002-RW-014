from backend.database import SessionLocal
from backend.models import Warga

try:
    db = SessionLocal()
    warga = db.query(Warga).first()
    print(f"Name: {warga.nama} | NIK: {warga.nik}")
except Exception as e:
    print(f"Error: {e}")
