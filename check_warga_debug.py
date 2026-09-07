import requests
import sqlite3
from backend.database import SessionLocal
from backend.models import Warga

# 1. Check Database directly
try:
    db = SessionLocal()
    warga_count = db.query(Warga).count()
    print(f"[DB] Total Warga in DB: {warga_count}")
    if warga_count > 0:
        first_warga = db.query(Warga).first()
        print(f"[DB] First Warga: {first_warga.nama} (ID: {first_warga.id})")
    db.close()
except Exception as e:
    print(f"[DB] Error querying DB: {e}")

# 2. Check API
try:
    response = requests.get("http://localhost:8000/api/warga")
    if response.status_code == 200:
        data = response.json()
        print(f"[API] Total Warga from API: {len(data)}")
        if len(data) > 0:
            print(f"[API] First Warga in API: {data[0]['nama']}")
    else:
        print(f"[API] Failed: {response.status_code} - {response.text}")
except Exception as e:
    print(f"[API] Error calling API: {e}")
