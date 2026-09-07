# 🏘️ Aplikasi Kas RT

Sistem manajemen administrasi Rukun Tetangga (RT) berbasis web yang mencakup pengelolaan data warga, tagihan iuran, keuangan, marketplace warga, dan laporan keuangan.

---

## 📋 Deskripsi

**Kas RT App** adalah aplikasi full-stack yang dirancang untuk membantu pengurus RT dalam mengelola administrasi warga secara digital. Aplikasi ini menggantikan pencatatan manual dengan sistem berbasis web yang mudah diakses oleh pengurus maupun warga.

### Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 👥 **Data Warga** | Manajemen data warga RT (NIK, nama, alamat, no. rumah, status) |
| 💰 **Tagihan Iuran** | Generate dan kelola tagihan (Keamanan, Kebersihan, dll.) per bulan |
| 📊 **Keuangan** | Pencatatan pemasukan & pengeluaran kas RT secara otomatis |
| 🛒 **Marketplace** | Warga bisa menjual produk/jasa melalui platform komunitas |
| 📄 **Laporan** | Laporan keuangan dan export PDF kwitansi pembayaran |
| ⚙️ **Pengaturan** | Konfigurasi nama RT/RW, logo, rekening bank, QRIS |
| 🔐 **Autentikasi** | Multi-role user (Admin, Bendahara, Warga) |

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** — REST API framework berbasis Python
- **SQLAlchemy** — ORM untuk interaksi database
- **SQLite** — Database lokal (bisa diganti PostgreSQL untuk produksi)
- **Pydantic** — Validasi data & schema
- **Uvicorn** — ASGI server

### Frontend
- **React 18** — UI library
- **Vite** — Build tool & dev server
- **Tailwind CSS** — Utility-first CSS framework
- **React Router v7** — Client-side routing
- **Axios** — HTTP client
- **Chart.js + react-chartjs-2** — Visualisasi grafik keuangan
- **jsPDF + jspdf-autotable** — Export laporan ke PDF
- **Lucide React** — Icon library
- **TanStack React Table** — Tabel data advanced

---

## 📁 Struktur Proyek

```
rtapp/
├── backend/
│   ├── main.py           # Entry point FastAPI + semua endpoints API
│   ├── models.py         # SQLAlchemy database models
│   ├── schemas.py        # Pydantic schemas (request/response)
│   ├── database.py       # Konfigurasi koneksi database
│   ├── requirements.txt  # Dependensi Python
│   └── seed_db.py        # Script untuk mengisi data awal
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Root component & routing
│   │   ├── Dashboard.jsx     # Halaman dashboard utama
│   │   ├── WargaPage.jsx     # Manajemen data warga
│   │   ├── TagihanPage.jsx   # Manajemen tagihan iuran
│   │   ├── FinancePage.jsx   # Pencatatan keuangan
│   │   ├── MarketplacePage.jsx # Marketplace warga
│   │   ├── LaporanPage.jsx   # Laporan & statistik
│   │   ├── KwitansiPage.jsx  # Cetak kwitansi PDF
│   │   ├── PengaturanPage.jsx # Pengaturan aplikasi
│   │   ├── LoginPage.jsx     # Halaman login
│   │   ├── RegisterPage.jsx  # Halaman registrasi warga
│   │   └── ProfilePage.jsx   # Profil user
│   ├── package.json
│   └── vite.config.js
├── init_admin.py         # Script inisialisasi akun admin
├── migrate_db.py         # Script migrasi database
├── deploy_rt.sh          # Script deployment Linux
├── DEPLOYMENT_GUIDE.md   # Panduan deployment
└── USER_GUIDE.md         # Panduan penggunaan
```

---

## ⚡ Cara Menjalankan (Development)

### Prasyarat
- Python 3.9+
- Node.js 18+
- npm atau yarn

### 1. Clone Repository

```bash
git clone https://github.com/bungrahman/rtapp.git
cd rtapp
```

### 2. Setup Backend

```bash
cd backend

# Buat virtual environment
python -m venv venv

# Aktivasi (Windows)
venv\Scripts\activate
# Aktivasi (Linux/macOS)
source venv/bin/activate

# Install dependensi
pip install -r requirements.txt

# Inisialisasi akun admin (jalankan sekali)
cd ..
python init_admin.py

# Jalankan server backend
cd backend
uvicorn main:app --reload --port 8000
```

Backend berjalan di: `http://localhost:8000`  
API Docs (Swagger): `http://localhost:8000/api/docs`

### 3. Setup Frontend

```bash
cd frontend

# Install dependensi
npm install

# Jalankan dev server
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/login` | Login user |
| `POST` | `/api/auth/register` | Registrasi warga baru |
| `GET/POST` | `/api/warga` | List & tambah warga |
| `PUT/DELETE` | `/api/warga/{id}` | Update & hapus warga |
| `GET/POST` | `/api/jenis-iuran` | Kategori iuran |
| `POST` | `/api/tagihan/generate` | Generate tagihan massal |
| `GET/PUT/DELETE` | `/api/tagihan/{id}` | Manajemen tagihan |
| `GET/POST` | `/api/transaksi` | Riwayat transaksi keuangan |
| `GET/POST` | `/api/marketplace` | Produk marketplace |
| `GET/PUT` | `/api/settings` | Pengaturan aplikasi |
| `POST` | `/api/upload` | Upload gambar |

---

## 👥 Role & Hak Akses

| Role | Hak Akses |
|---|---|
| **Admin** | Akses penuh ke semua fitur |
| **Bendahara** | Kelola keuangan, tagihan, laporan |
| **Warga** | Lihat tagihan sendiri, marketplace, profil |

---

## 🚀 Deployment

Lihat [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) untuk panduan lengkap deployment ke server Linux.

```bash
# Jalankan script deployment (Linux)
chmod +x deploy_rt.sh
./deploy_rt.sh
```

---

## 📖 Panduan Pengguna

Lihat [USER_GUIDE.md](USER_GUIDE.md) untuk panduan penggunaan aplikasi bagi pengurus RT.

---

## 🤝 Kontribusi

Pull request sangat disambut. Untuk perubahan besar, harap buka issue terlebih dahulu untuk mendiskusikan apa yang ingin diubah.

---

## 📄 Lisensi

[MIT](https://choosealicense.com/licenses/mit/)

---

> Dibuat dengan ❤️ untuk kemajuan administrasi RT Indonesia
