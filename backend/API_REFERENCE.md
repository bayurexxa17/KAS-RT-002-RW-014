# API Reference - Kas RT Digital

Sistem backend ini menggunakan FastAPI dengan dokumentasi otomatis yang dapat diakses di `/docs`. Berikut adalah ringkasan endpoint yang tersedia.

## 👥 Residents (Warga)
Kelola data warga di lingkungan RT.

- **GET `/api/warga`**: Mengambil daftar seluruh warga.
- **POST `/api/warga`**: Mendaftarkan warga baru.
- **GET `/api/warga/{id}`**: Melihat detail warga tertentu.
- **PUT `/api/warga/{id}`**: Memperbarui data warga.
- **DELETE `/api/warga/{id}`**: Menghapus data warga.

## 💳 Jenis Iuran
Konfigurasi kategori penarikan dana.

- **GET `/api/jenis-iuran`**: Daftar semua kategori iuran.
- **POST `/api/jenis-iuran`**: Buat kategori iuran baru.
- **PUT `/api/jenis-iuran/{id}`**: Ubah detail iuran.
- **DELETE `/api/jenis-iuran/{id}`**: Hapus kategori iuran.

## 📄 Tagihan
Manajemen penagihan iuran warga.

- **POST `/api/tagihan/generate`**: Membuat tagihan massal untuk semua warga.
- **GET `/api/tagihan`**: Melihat daftar tagihan (bisa filter per warga).
- **PUT `/api/tagihan/{id}`**: Update status pembayaran (Lunas/Belum).

## 💰 Finance (Keuangan)
Pencatatan buku kas RT.

- **POST `/api/transaksi`**: Catat pemasukan/pengeluaran baru.
- **GET `/api/transaksi`**: Histori seluruh transaksi kas.

## 🛒 Marketplace
Ekonomi lokal warga.

- **POST `/api/marketplace`**: Pasang iklan produk baru.
- **GET `/api/marketplace`**: Lihat semua produk yang dijual warga.

---
**Base URL:** `http://localhost:8000`
**Interactive Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
