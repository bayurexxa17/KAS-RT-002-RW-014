from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import shutil
import uuid
import models, schemas, database
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kas RT API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Setup Uploads Directory
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Mount Static Files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/upload", tags=["Upload"], summary="Upload File Gambar")
async def upload_file(file: UploadFile = File(...)):
    # Validate file extension
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only images allowed.")

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return relative URL
    file_url = f"/uploads/{unique_filename}"
    return {"url": file_url}

@app.get("/")
def read_root():
    return {"message": "Kas RT API is running. Access the dashboard via the frontend URL (usually localhost:5173).", "docs": "/docs"}


# Residents (Warga)
@app.post("/api/warga", response_model=schemas.Warga, tags=["Residents"], summary="Mendaftarkan Warga Baru")
def create_warga(warga: schemas.WargaCreate, db: Session = Depends(get_db)):
    """
    Mendaftarkan warga baru ke dalam sistem Kas RT.
    Data yang diperlukan: nama, nik, whatsapp, alamat, no_rumah, status, dan catatan (opsional).
    """
    db_warga = models.Warga(**warga.model_dump())
    db.add(db_warga)
    db.commit()
    db.refresh(db_warga)
    return db_warga

@app.get("/api/warga", response_model=List[schemas.Warga], tags=["Residents"], summary="Mendapatkan Daftar Semua Warga")
def read_warga(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Mengambil daftar seluruh warga yang terdaftar dengan sistem pagination.
    """
    return db.query(models.Warga).offset(skip).limit(limit).all()

@app.get("/api/warga/{warga_id}", response_model=schemas.Warga, tags=["Residents"], summary="Mendapatkan Detail Warga")
def read_warga_single(warga_id: int, db: Session = Depends(get_db)):
    """
    Mengambil informasi detail seorang warga berdasarkan ID.
    """
    db_warga = db.query(models.Warga).filter(models.Warga.id == warga_id).first()
    if db_warga is None:
        raise HTTPException(status_code=404, detail="Warga not found")
    return db_warga

@app.put("/api/warga/{warga_id}", response_model=schemas.Warga, tags=["Residents"], summary="Memperbarui Data Warga")
def update_warga(warga_id: int, warga: schemas.WargaUpdate, db: Session = Depends(get_db)):
    """
    Memperbarui informasi warga yang sudah ada.
    """
    db_warga = db.query(models.Warga).filter(models.Warga.id == warga_id).first()
    if db_warga is None:
        raise HTTPException(status_code=404, detail="Warga not found")
    
    for key, value in warga.model_dump(exclude_unset=True).items():
        setattr(db_warga, key, value)
    
    db.commit()
    db.refresh(db_warga)
    return db_warga

@app.delete("/api/warga/{warga_id}", tags=["Residents"], summary="Menghapus Data Warga")
def delete_warga(warga_id: int, db: Session = Depends(get_db)):
    """
    Menghapus data warga dari sistem secara permanen.
    """
    db_warga = db.query(models.Warga).filter(models.Warga.id == warga_id).first()
    if db_warga is None:
        raise HTTPException(status_code=404, detail="Warga not found")
    db.delete(db_warga)
    db.commit()
    return {"message": "Warga deleted successfully"}

# Jenis Iuran
@app.post("/api/jenis-iuran", response_model=schemas.JenisIuran, tags=["Jenis Iuran"], summary="Membuat Kategori Iuran Baru")
def create_jenis_iuran(iuran: schemas.JenisIuranCreate, db: Session = Depends(get_db)):
    """
    Membuat kategori iuran baru (misal: Iuran Keamanan, Iuran Kebersihan).
    """
    db_iuran = models.JenisIuran(**iuran.model_dump())
    db.add(db_iuran)
    db.commit()
    db.refresh(db_iuran)
    return db_iuran

@app.get("/api/jenis-iuran", response_model=List[schemas.JenisIuran], tags=["Jenis Iuran"], summary="Mendapatkan Semua Kategori Iuran")
def read_jenis_iuran(db: Session = Depends(get_db)):
    """
    Mengambil semua daftar kategori iuran yang aktif.
    """
    return db.query(models.JenisIuran).all()

@app.put("/api/jenis-iuran/{iuran_id}", response_model=schemas.JenisIuran, tags=["Jenis Iuran"], summary="Memperbarui Kategori Iuran")
def update_jenis_iuran(iuran_id: int, iuran: schemas.JenisIuranUpdate, db: Session = Depends(get_db)):
    """
    Memperbarui detail kategori iuran (nama atau nominal).
    """
    db_iuran = db.query(models.JenisIuran).filter(models.JenisIuran.id == iuran_id).first()
    if db_iuran is None:
        raise HTTPException(status_code=404, detail="Jenis Iuran not found")
    
    for key, value in iuran.model_dump(exclude_unset=True).items():
        setattr(db_iuran, key, value)
    
    db.commit()
    db.refresh(db_iuran)
    return db_iuran

@app.delete("/api/jenis-iuran/{iuran_id}", tags=["Jenis Iuran"], summary="Menghapus Kategori Iuran")
def delete_jenis_iuran(iuran_id: int, db: Session = Depends(get_db)):
    """
    Menghapus kategori iuran. Hati-hati, ini mungkin berdampak pada tagihan yang terkait.
    """
    db_iuran = db.query(models.JenisIuran).filter(models.JenisIuran.id == iuran_id).first()
    if db_iuran is None:
        raise HTTPException(status_code=404, detail="Jenis Iuran not found")
    db.delete(db_iuran)
    db.commit()
    return {"message": "Jenis Iuran deleted successfully"}

# Tagihan
@app.post("/api/tagihan/generate", tags=["Tagihan"], summary="Generate Tagihan Bulanan")
def generate_tagihan(request: schemas.TagihanGenerateRequest, db: Session = Depends(get_db)):
    """
    Membuat tagihan secara massal untuk warga yang dipilih berdasarkan kategori iuran dan periode tertentu.
    """
    count = 0
    # Determine which residents to process
    if not request.warga_ids:
        # If empty list, maybe generate for all? Or return error? 
        # For safety let's require explicit IDs. 
        # But if the requirement says "checklist untuk semua warga", the frontend will just send all IDs.
        # Alternatively, we could treat empty list as "all", but explicit is better.
        return {"message": "No residents selected", "generated_count": 0}

    for input_id in request.warga_ids:
        # Check if already exists
        exists = db.query(models.Tagihan).filter(
            models.Tagihan.warga_id == input_id,
            models.Tagihan.jenis_iuran_id == request.jenis_iuran_id,
            models.Tagihan.bulan == request.bulan,
            models.Tagihan.tahun == request.tahun
        ).first()
        
        if not exists:
            new_tagihan = models.Tagihan(
                warga_id=input_id,
                jenis_iuran_id=request.jenis_iuran_id,
                bulan=request.bulan,
                tahun=request.tahun,
                status_lunas=0
            )
            db.add(new_tagihan)
            count += 1
            
    db.commit()
    return {"message": "Tagihan generated successfully", "generated_count": count}

@app.get("/api/tagihan", response_model=List[schemas.Tagihan], tags=["Tagihan"], summary="Mendapatkan Daftar Tagihan")
def read_tagihan(warga_id: int = None, db: Session = Depends(get_db)):
    """
    Mengambil daftar tagihan. Dapat difilter berdasarkan Warga ID.
    """
    query = db.query(models.Tagihan)
    if warga_id:
        query = query.filter(models.Tagihan.warga_id == warga_id)
    return query.all()

@app.put("/api/tagihan/{tagihan_id}", response_model=schemas.Tagihan, tags=["Tagihan"], summary="Update Status Pembayaran Tagihan")
def update_tagihan(tagihan_id: int, tagihan: schemas.TagihanUpdate, db: Session = Depends(get_db)):
    """
    Memperbarui status pembayaran tagihan (Lunas/Belum Lunas).
    """
    db_tagihan = db.query(models.Tagihan).filter(models.Tagihan.id == tagihan_id).first()
    if db_tagihan is None:
        raise HTTPException(status_code=404, detail="Tagihan not found")
    
    # Check if status is changing to Paid (1) fro Not Paid (0)
    if tagihan.status_lunas == 1 and db_tagihan.status_lunas == 0:
        db_tagihan.tanggal_bayar = datetime.utcnow()
        
        # Auto-create Pemasukan Transaction
        # Need to fetch related data for description
        warga = db_tagihan.warga
        jenis_iuran = db_tagihan.jenis_iuran
        
        # Format currency for description (optional, but helpful)
        nominal_str = "{:,.0f}".format(jenis_iuran.nominal) if jenis_iuran else "0"
        
        keterangan = f"Pembayaran {jenis_iuran.nama if jenis_iuran else 'Tagihan'} bulan {db_tagihan.bulan}/{db_tagihan.tahun} oleh {warga.nama if warga else 'Warga'}"
        
        new_transaksi = models.Transaksi(
            tipe=models.TransaksiType.PEMASUKAN,
            kategori=f"Tagihan {jenis_iuran.nama if jenis_iuran else ''}",
            jumlah=jenis_iuran.nominal if jenis_iuran else 0,
            tanggal=datetime.utcnow(),
            keterangan=keterangan,
            warga_id=db_tagihan.warga_id
        )
        db.add(new_transaksi)

    for key, value in tagihan.model_dump(exclude_unset=True).items():
        setattr(db_tagihan, key, value)
    
    db.commit()
    db.refresh(db_tagihan)
    return db_tagihan

@app.delete("/api/tagihan/{tagihan_id}", tags=["Tagihan"], summary="Hapus Tagihan")
def delete_tagihan(tagihan_id: int, db: Session = Depends(get_db)):
    """
    Menghapus data tagihan dari sistem.
    """
    db_tagihan = db.query(models.Tagihan).filter(models.Tagihan.id == tagihan_id).first()
    if db_tagihan is None:
        raise HTTPException(status_code=404, detail="Tagihan not found")
    
    db.delete(db_tagihan)
    db.commit()
    return {"message": "Tagihan deleted successfully"}


# Transaksi (Finance)
@app.post("/api/transaksi", response_model=schemas.Transaksi, tags=["Finance"], summary="Mencatat Transaksi Keuangan")
def create_transaksi(transaksi: schemas.TransaksiCreate, db: Session = Depends(get_db)):
    """
    Mencatat pemasukan atau pengeluaran baru ke dalam buku kas RT.
    """
    db_trans = models.Transaksi(**transaksi.model_dump())
    db.add(db_trans)
    db.commit()
    db.refresh(db_trans)
    return db_trans

@app.get("/api/transaksi", response_model=List[schemas.Transaksi], tags=["Finance"], summary="Mendapatkan Riwayat Transaksi")
def read_transaksi(tipe: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Mengambil riwayat seluruh transaksi keuangan. Dapat difilter berdasarkan tipe (Pemasukan/Pengeluaran).
    """
    query = db.query(models.Transaksi)
    if tipe:
        query = query.filter(models.Transaksi.tipe == tipe)
    return query.all()

@app.put("/api/transaksi/{transaksi_id}", response_model=schemas.Transaksi, tags=["Finance"], summary="Update Data Transaksi")
def update_transaksi(transaksi_id: int, transaksi: schemas.TransaksiUpdate, db: Session = Depends(get_db)):
    """
    Memperbarui detail transaksi yang sudah ada.
    """
    db_trans = db.query(models.Transaksi).filter(models.Transaksi.id == transaksi_id).first()
    if db_trans is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    for key, value in transaksi.model_dump(exclude_unset=True).items():
        setattr(db_trans, key, value)
    
    db.commit()
    db.refresh(db_trans)
    return db_trans

@app.delete("/api/transaksi/{transaksi_id}", tags=["Finance"], summary="Hapus Transaksi")
def delete_transaksi(transaksi_id: int, db: Session = Depends(get_db)):
    """
    Menghapus data transaksi dari sistem.
    """
    db_trans = db.query(models.Transaksi).filter(models.Transaksi.id == transaksi_id).first()
    if db_trans is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(db_trans)
    db.commit()
    return {"message": "Transaction deleted successfully"}


# Marketplace
@app.post("/api/marketplace", response_model=schemas.Product, tags=["Marketplace"], summary="Menambahkan Produk Marketplace")
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """
    Menambahkan produk baru yang ingin dijual oleh warga ke marketplace.
    """
    db_prod = models.Product(**product.model_dump())
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    return db_prod

@app.get("/api/marketplace", response_model=List[schemas.Product], tags=["Marketplace"], summary="Mendapatkan Semua Produk")
def read_products(db: Session = Depends(get_db)):
    """
    Mengambil daftar seluruh produk yang tersedia di marketplace warga.
    """
    return db.query(models.Product).all()

@app.put("/api/marketplace/{product_id}", response_model=schemas.Product, tags=["Marketplace"], summary="Update Produk Marketplace")
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    """
    Memperbarui informasi produk yang dijual.
    """
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product.model_dump(exclude_unset=True).items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/api/marketplace/{product_id}", tags=["Marketplace"], summary="Hapus Produk Marketplace")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """
    Menghapus produk dari marketplace.
    """
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}


# Settings
@app.get("/api/settings", response_model=schemas.Settings, tags=["Settings"], summary="Get Application Settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(models.Settings).first()
    if not settings:
        # Create default if not exists
        settings = models.Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@app.put("/api/settings", response_model=schemas.Settings, tags=["Settings"], summary="Update Application Settings")
def update_settings(settings: schemas.SettingsBase, db: Session = Depends(get_db)):
    db_settings = db.query(models.Settings).first()
    if not db_settings:
        db_settings = models.Settings()
        db.add(db_settings)
    
    for key, value in settings.model_dump(exclude_unset=True).items():
        setattr(db_settings, key, value)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings

# Users
@app.post("/api/users", response_model=schemas.User, tags=["Users"], summary="Create New User")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if username exists
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Simple hash for now (ideally use bcrypt)
    fake_hashed_password = user.password + "notreallyhashed"
    
    db_user = models.User(
        username=user.username,
        hashed_password=fake_hashed_password,
        role=user.role,
        warga_id=user.warga_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users", response_model=List[schemas.User], tags=["Users"], summary="List All Users")
def read_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.get("/api/users/{user_id}", response_model=schemas.User, tags=["Users"], summary="Get User by ID")
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.put("/api/users/{user_id}", response_model=schemas.User, tags=["Users"], summary="Update User")
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user.model_dump(exclude_unset=True)
    
    # Handle password hashing separately
    if 'password' in update_data:
        password = update_data.pop('password')
        update_data['hashed_password'] = password + "notreallyhashed"
        
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/api/users/{user_id}", tags=["Users"], summary="Delete User")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(db_user)
    db.commit()
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

# Auth
@app.post("/api/auth/login", response_model=schemas.User, tags=["Auth"], summary="Login User")
def login(creds: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == creds.username).first()
    if not user:
        raise HTTPException(status_code=400, detail="Username or password incorrect")
    
    # Verify password (Mock Hash)
    if user.hashed_password != creds.password + "notreallyhashed":
         raise HTTPException(status_code=400, detail="Username or password incorrect")
    
    return user

@app.post("/api/auth/register", response_model=schemas.User, tags=["Auth"], summary="Register New User via NIK")
def register(creds: schemas.RegisterRequest, db: Session = Depends(get_db)):
    # 1. Find Warga by NIK
    warga = db.query(models.Warga).filter(models.Warga.nik == creds.nik).first()
    if not warga:
        raise HTTPException(status_code=404, detail="NIK tidak terdaftar sebagai warga")
    
    # 2. Check if Warga already has a User account
    existing_user_linked = db.query(models.User).filter(models.User.warga_id == warga.id).first()
    if existing_user_linked:
         raise HTTPException(status_code=400, detail="Warga dengan NIK ini sudah memiliki akun user")

    # 3. Check if Username taken
    if db.query(models.User).filter(models.User.username == creds.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")

    # 4. Create User
    fake_hashed_password = creds.password + "notreallyhashed"
    new_user = models.User(
        username=creds.username,
        hashed_password=fake_hashed_password,
        role=models.RoleType.WARGA, # Default Role
        warga_id=warga.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/verify-nik", tags=["Auth"], summary="Cek Ketersediaan NIK")
def verify_nik(request: schemas.CheckNIKRequest, db: Session = Depends(get_db)):
    # 1. Check if NIK exists in Warga table
    warga = db.query(models.Warga).filter(models.Warga.nik == request.nik).first()
    if not warga:
        raise HTTPException(status_code=404, detail="NIK tidak ditemukan dalam database warga")
    
    # 2. Check if already has user
    user = db.query(models.User).filter(models.User.warga_id == warga.id).first()
    if user:
        raise HTTPException(status_code=400, detail=f"Warga {warga.nama} sudah memiliki akun user")
        
    return {
        "valid": True,
        "nama": warga.nama,
        "nik": warga.nik
    }

if __name__ == "__main__":


    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
