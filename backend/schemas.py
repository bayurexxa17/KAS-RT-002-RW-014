from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models import WargaStatus, TransaksiType, RoleType

# Warga Schemas
class WargaBase(BaseModel):
    nama: str
    nik: str
    whatsapp: str
    alamat: str
    no_rumah: str
    status: WargaStatus
    foto_url: Optional[str] = None
    catatan: Optional[str] = None

class WargaCreate(WargaBase):
    pass

class WargaUpdate(BaseModel):
    nama: Optional[str] = None
    nik: Optional[str] = None
    whatsapp: Optional[str] = None
    alamat: Optional[str] = None
    no_rumah: Optional[str] = None
    status: Optional[WargaStatus] = None
    foto_url: Optional[str] = None
    catatan: Optional[str] = None


class Warga(WargaBase):
    id: int
    class Config:
        from_attributes = True

# Jenis Iuran Schemas
class JenisIuranBase(BaseModel):
    nama: str
    nominal: float
    deskripsi: Optional[str] = None

class JenisIuranCreate(JenisIuranBase):
    pass

class JenisIuranUpdate(BaseModel):
    nama: Optional[str] = None
    nominal: Optional[float] = None
    deskripsi: Optional[str] = None

class JenisIuran(JenisIuranBase):
    id: int
    class Config:
        from_attributes = True

# Tagihan Schemas
class TagihanBase(BaseModel):
    warga_id: int
    jenis_iuran_id: int
    bulan: int
    tahun: int

class TagihanGenerateRequest(BaseModel):
    jenis_iuran_id: int
    bulan: int
    tahun: int
    warga_ids: List[int]

class TagihanCreate(TagihanBase):
    pass

class TagihanUpdate(BaseModel):
    status_lunas: int
    tanggal_bayar: Optional[datetime] = None

class Tagihan(TagihanBase):
    id: int
    status_lunas: int
    tanggal_bayar: Optional[datetime] = None
    warga_id: Optional[int] = None
    jenis_iuran_id: Optional[int] = None
    class Config:
        from_attributes = True

# Transaksi Schemas
class TransaksiBase(BaseModel):
    tipe: TransaksiType
    kategori: str
    jumlah: float
    keterangan: Optional[str] = None
    warga_id: Optional[int] = None

class TransaksiCreate(TransaksiBase):
    pass

class TransaksiUpdate(BaseModel):
    tipe: Optional[TransaksiType] = None
    kategori: Optional[str] = None
    jumlah: Optional[float] = None
    keterangan: Optional[str] = None
    warga_id: Optional[int] = None


class Transaksi(TransaksiBase):
    id: int
    tanggal: datetime
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    image_url: Optional[str] = None
    owner_id: Optional[int] = None
    whatsapp_link: Optional[str] = None


class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    owner_id: Optional[int] = None
    whatsapp_link: Optional[str] = None

class Product(ProductBase):

    id: int
    class Config:
        from_attributes = True

# Settings Schemas
class SettingsBase(BaseModel):
    app_name: str
    rt: Optional[str] = "00"
    rw: Optional[str] = "00"
    struktur_organisasi: Optional[str] = None
    logo_url: Optional[str] = None
    qris_url: Optional[str] = None
    no_rekening: Optional[str] = None
    description: Optional[str] = None

class Settings(SettingsBase):
    id: int
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    username: str
    role: RoleType
    foto_url: Optional[str] = None
    warga_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[RoleType] = None
    foto_url: Optional[str] = None
    warga_id: Optional[int] = None


class User(UserBase):
    id: int
    class Config:
        from_attributes = True

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    nik: str
    username: str
    password: str

class CheckNIKRequest(BaseModel):
    nik: str


