from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime

class WargaStatus(str, enum.Enum):
    TETAP = "Tetap"
    KONTRAK = "Kontrak"
    KOST = "Kost"
    PINDAH = "Pindah"

class TransaksiType(str, enum.Enum):
    PEMASUKAN = "Pemasukan"
    PENGELUARAN = "Pengeluaran"

class RoleType(str, enum.Enum):
    ADMIN = "Admin"
    BENDAHARA = "Bendahara"
    WARGA = "Warga"

class Warga(Base):
    __tablename__ = "warga"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String, index=True)
    nik = Column(String, unique=True, index=True)
    whatsapp = Column(String)
    alamat = Column(String)
    no_rumah = Column(String)
    status = Column(Enum(WargaStatus), default=WargaStatus.TETAP)
    foto_url = Column(String, nullable=True)
    catatan = Column(Text, nullable=True)


    tagihan = relationship("Tagihan", back_populates="warga")
    products = relationship("Product", back_populates="owner")

class JenisIuran(Base):
    __tablename__ = "jenis_iuran"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String, index=True)
    nominal = Column(Float)
    deskripsi = Column(Text, nullable=True)

    tagihan = relationship("Tagihan", back_populates="jenis_iuran")

class Tagihan(Base):
    __tablename__ = "tagihan"

    id = Column(Integer, primary_key=True, index=True)
    warga_id = Column(Integer, ForeignKey("warga.id"))
    jenis_iuran_id = Column(Integer, ForeignKey("jenis_iuran.id"))
    bulan = Column(Integer)
    tahun = Column(Integer)
    status_lunas = Column(Integer, default=0) # 0: Belum, 1: Lunas
    tanggal_bayar = Column(DateTime, nullable=True)

    warga = relationship("Warga", back_populates="tagihan")
    jenis_iuran = relationship("JenisIuran", back_populates="tagihan")

class Transaksi(Base):
    __tablename__ = "transaksi"

    id = Column(Integer, primary_key=True, index=True)
    tipe = Column(Enum(TransaksiType))
    kategori = Column(String)
    jumlah = Column(Float)
    tanggal = Column(DateTime, default=datetime.utcnow)
    keterangan = Column(Text, nullable=True)
    warga_id = Column(Integer, ForeignKey("warga.id"), nullable=True)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    image_url = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("warga.id"))
    whatsapp_link = Column(String)

    owner = relationship("Warga", back_populates="products")

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    app_name = Column(String, default="Kas RT")
    rt = Column(String, default="00")
    rw = Column(String, default="00")
    struktur_organisasi = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    qris_url = Column(String, nullable=True)
    no_rekening = Column(Text, nullable=True)
    description = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(RoleType), default=RoleType.WARGA)
    foto_url = Column(String, nullable=True)
    warga_id = Column(Integer, ForeignKey("warga.id"), nullable=True)

