# Panduan Implementasi: Transisi rtapp ke Plugin WordPress

Dokumen ini menjelaskan struktur dan langkah-langkah untuk mengubah aplikasi **rtapp** (FastAPI + React) menjadi plugin WordPress native yang efisien dan murah secara biaya operasional.

## 📁 Struktur Folder Plugin (`rtapp-wp`)

- `rtapp-wp.php`: File utama yang menginisialisasi plugin, mengatur menu, dan memuat (enqueue) file React.
- `includes/`: Berisi logika backend PHP:
    - `class-rt-db.php`: Otomatis membuat tabel `wp_rt_warga`, `wp_rt_transaksi`, dll saat aktivasi.
    - `class-rt-api.php`: Menyediakan endpoint API (REST API) yang menggantikan tugas FastAPI.
    - `class-rt-admin.php`: Mengelola tampilan dashboard Admin di WordPress.
- `frontend/dist/`: Tempat file hasil build dari React (Hasil `npm run build`).

## 🚀 Langkah-Langkah Transisi

### 1. Penyesuaian Frontend (React)
Anda tidak perlu membuat ulang UI Dashboard. Cukup sesuaikan beberapa hal:
- **API URL**: Ubah base URL API dari `http://localhost:8000/api` menjadi menggunakan variabel global WordPress `rtappData.root_url`.
- **Build**: Lakukan build secara berkala dan pastikan file `index.js` dan `index.css` di-copy ke folder `rtapp-wp/frontend/dist/assets/`.

### 2. Autentikasi User
- Kita akan membuang sistem autentikasi manual di Python. 
- Di WordPress, kita akan menggunakan akun WordPress asli. Warga bisa didaftarkan sebagai user dengan role `Subscriber`, sedangkan pengelola sebagai `Editor` atau `Administrator`.
- Login menggunakan form standar WordPress atau integrasi form login React yang memanggil fungsi login WP.

### 3. Database MySQL
- Semua data yang sebelumnya ada di SQLite (`database.db`) akan dipindahkan ke tabel MySQL WordPress melalui skrip migrasi sederhana atau input ulang.

## 💬 Fitur WhatsApp
- **WhatsApp Gateway**: Karena menggunakan PHP, kita bisa menggunakan library `cURL` untuk menembak API Gateway (seperti Fonnte/Starsender) secara otomatis saat transaksi disimpan.
- **Direct Link**: Tombol "Kirim WA" di React akan tetap berfungsi seperti sekarang dengan membuka link `wa.me`.

## 💰 Analisis Biaya
- **Hosting**: Bisa menggunakan shared hosting WordPress apa pun (Mulai Rp 15.000 - Rp 50.000 / bulan).
- **Maintenance**: Sangat rendah karena tidak perlu mengelola server backend terpisah (FastAPI/Python VPS).
- **SSL/HTTPS**: Biasanya sudah gratis dari hosting WordPress.

---
**Status Saat Ini:** Struktur folder dasar dan file inti PHP sudah siap di folder `rtapp-wp/`. Anda bisa mulai mencoba meng-copy hasil build React ke folder `dist` untuk melihatnya muncul di Dashboard WordPress.
