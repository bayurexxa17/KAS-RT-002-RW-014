from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from datetime import datetime

# Simple password hashing placeholder for demo
def get_password_hash(password):
    return f"hashed_{password}"

def seed():
    # Ensure tables are created
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Create Admin User
    admin_exists = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin_exists:
        admin_user = models.User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            role=models.RoleType.ADMIN
        )
        db.add(admin_user)

    # Create Dummy Warga
    warga_data = [
        {"nama": "Budi Santoso", "nik": "1234567890123456", "whatsapp": "628123456789", "alamat": "Jl. Mawar No. 1", "no_rumah": "A1", "status": models.WargaStatus.TETAP},
        {"nama": "Siti Aminah", "nik": "1234567890123457", "whatsapp": "628123456790", "alamat": "Jl. Mawar No. 2", "no_rumah": "A2", "status": models.WargaStatus.KONTRAK},
        {"nama": "Agus Setiawan", "nik": "1234567890123458", "whatsapp": "628123456791", "alamat": "Jl. Melati No. 5", "no_rumah": "B5", "status": models.WargaStatus.TETAP},
        {"nama": "Dewi Lestari", "nik": "1234567890123459", "whatsapp": "628123456792", "alamat": "Jl. Melati No. 6", "no_rumah": "B6", "status": models.WargaStatus.KOST},
    ]

    for wd in warga_data:
        exists = db.query(models.Warga).filter(models.Warga.nik == wd["nik"]).first()
        if not exists:
            new_warga = models.Warga(**wd)
            db.add(new_warga)
    
    db.commit()

    # Create Dummy Iuran
    iuran_data = [
        {"nama": "Iuran Kebersihan", "nominal": 25000, "deskripsi": "Biaya operasional sampah bulanan"},
        {"nama": "Iuran Keamanan", "nominal": 50000, "deskripsi": "Biaya satpam dan portal"},
        {"nama": "Dana Sosial", "nominal": 10000, "deskripsi": "Dana untuk bantuan warga"},
    ]

    for idata in iuran_data:
        exists = db.query(models.JenisIuran).filter(models.JenisIuran.nama == idata["nama"]).first()
        if not exists:
            new_iuran = models.JenisIuran(**idata)
            db.add(new_iuran)
    
    db.commit()

    # Create Dummy Products
    all_warga = db.query(models.Warga).all()
    if all_warga:
        product_data = [
            {"name": "Nasi Goreng Spesial", "description": "Nasi goreng buatan rumahan dengan telur dan kerupuk.", "price": 15000, "owner_id": all_warga[0].id, "whatsapp_link": f"https://wa.me/{all_warga[0].whatsapp}"},
            {"name": "Jasa Service AC", "description": "Melayani cuci AC dan tambah freon area RT 05.", "price": 75000, "owner_id": all_warga[1].id, "whatsapp_link": f"https://wa.me/{all_warga[1].whatsapp}"},
            {"name": "Kue Kering Lebaran", "description": "Nastar dan Kastengel premium.", "price": 85000, "owner_id": all_warga[2].id, "whatsapp_link": f"https://wa.me/{all_warga[2].whatsapp}"},
        ]
        for pd in product_data:
            exists = db.query(models.Product).filter(models.Product.name == pd["name"]).first()
            if not exists:
                new_prod = models.Product(**pd)
                db.add(new_prod)
    
    db.commit()
    # Create Dummy Tagihan
    warga_list = db.query(models.Warga).all()
    iuran_list = db.query(models.JenisIuran).all()
    
    if warga_list and iuran_list:
        # Create bills for the first few residents
        for i, warga in enumerate(warga_list[:3]):
            # Pending bill for current month
            tagihan_pending = {
                "warga_id": warga.id,
                "jenis_iuran_id": iuran_list[0].id, # Kebersihan usually
                "bulan": 1, 
                "tahun": 2026, 
                "status_lunas": 0
            }
            # Paid bill for previous month
            tagihan_paid = {
                "warga_id": warga.id,
                "jenis_iuran_id": iuran_list[0].id,
                "bulan": 12, 
                "tahun": 2025, 
                "status_lunas": 1,
                "tanggal_bayar": datetime.utcnow()
            }
            
            for td in [tagihan_pending, tagihan_paid]:
                 exists = db.query(models.Tagihan).filter(
                    models.Tagihan.warga_id == td["warga_id"],
                    models.Tagihan.jenis_iuran_id == td["jenis_iuran_id"],
                    models.Tagihan.bulan == td["bulan"],
                    models.Tagihan.tahun == td["tahun"]
                 ).first()
                 if not exists:
                     new_tagihan = models.Tagihan(**td)
                     db.add(new_tagihan)
    
    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
