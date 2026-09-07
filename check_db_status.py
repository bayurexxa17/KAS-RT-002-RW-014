from backend.database import SessionLocal
from backend import models
from sqlalchemy import text

def check_counts():
    db = SessionLocal()
    try:
        warga_count = db.query(models.Warga).count()
        transaksi_count = db.query(models.Transaksi).count()
        tagihan_count = db.query(models.Tagihan).count()
        
        print(f"DEBUG_DB_STATUS: Warga={warga_count}, Transaksi={transaksi_count}, Tagihan={tagihan_count}")
        
        if transaksi_count > 0:
            last_trans = db.query(models.Transaksi).order_by(models.Transaksi.id.desc()).first()
            print(f"LAST_TRANSACTION: {last_trans.kategori} - {last_trans.jumlah} ({last_trans.tipe})")
            
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_counts()
