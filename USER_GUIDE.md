# Panduan Penggunaan Aplikasi Kas RT (rtapp) 🏠

Selamat datang di panduan penggunaan aplikasi Kas RT. Aplikasi ini dirancang untuk mempermudah pengelolaan administrasi, keuangan, dan komunikasi antar warga di lingkungan RT.

---

## 🔐 1. Akses dan Login

### Login Pengguna
1. Buka aplikasi di browser (biasanya `http://localhost:5173` atau domain yang sudah diatur).
2. Masukkan **Username** dan **Password** Anda.
3. Klik tombol **LOG IN SEKARANG**.

### Cara Warga Mendapatkan Akun 📝
Warga yang belum memiliki akun tidak dibuatkan oleh Admin secara manual, melainkan bisa mendaftar sendiri menggunakan **NIK** yang sudah terdaftar di database RT.

**Langkah Pendaftaran Warga:**
1. Di halaman Login, klik link **Daftar sebagai Warga**.
2. Masukkan **NIK** (16 digit) sesuai KTP.
3. Klik tombol **Cari (ikon Kaca Pembesar)** untuk verifikasi.
4. Jika NIK terdaftar, nama Anda akan muncul secara otomatis.
5. **Username** akan dibuatkan secara otomatis oleh sistem (contoh: `budi1234`).
6. Masukkan **Password** baru yang ingin Anda gunakan.
7. Klik **SELESAI PENDAFTARAN**.
8. Sekarang Anda bisa login menggunakan username otomatis dan password tersebut.

---

## 🛠️ 2. Fitur Role: Admin
Admin adalah role dengan akses tertinggi (biasanya Ketua RT/RW).

*   **Dashboard**: Melihat ringkasan data warga, kas, dan aktivitas terbaru.
*   **Pengaturan Aplikasi**: 
    *   Mengubah Nama Aplikasi, Logo, dan Deskripsi.
    *   Mengatur nomor RT dan RW.
*   **User Management**:
    *   Melihat semua pengguna yang terdaftar.
    *   Mengubah role user (misal: menjadikan Warga sebagai Bendahara).
    *   Menghapus akun user atau mereset password.
*   **Data Warga**: Mengelola daftar penduduk (Tambah/Edit/Hapus).

---

## 💰 3. Fitur Role: Bendahara
Bendahara bertanggung jawab penuh atas sirkulasi keuangan.

*   **Manajemen Iuran**: Membuat kategori iuran baru (Kebersihan, Keamanan, dll) dan menentukan nominalnya.
*   **Generate Tagihan**: Membuat tagihan bulanan secara otomatis untuk seluruh atau sebagian warga.
*   **Pencatatan Transaksi**:
    *   **Pemasukan**: Mencatat uang masuk di luar tagihan (donasi, sewa gedung, dll).
    *   **Pengeluaran**: Mencatat setiap pengeluaran kas RT.
*   **Kirim WhatsApp**: Mengirimkan pengingat tagihan ke nomor WhatsApp warga yang menunggak secara kolektif atau personal.
*   **Laporan**: Melihat grafik kas dan mengunduh data laporan bulanan.

---

## 👨‍👩‍👧‍👦 4. Fitur Role: Warga
Warga dapat berinteraksi dengan layanan RT secara mandiri.

*   **Tagihan Saya**: Melihat daftar iuran yang perlu dibayar setiap bulannya.
*   **Kwitansi**: Melihat dan mencetak bukti pembayaran jika sudah melunasi iuran.
*   **Marketplace Warga**: 
    *   **Beli**: Melihat produk atau jasa yang ditawarkan oleh tetangga lain.
    *   **Jual**: Memasukkan produk dagangan sendiri (makanan, jasa service, dll) untuk dipasarkan ke lingkungan RT.
*   **Profil**: Memperbarui data diri seperti nomor WhatsApp atau alamat.

---

## 💡 Tips Penggunaan
*   **Update Logo**: Pastikan logo aplikasi diatur di menu Pengaturan untuk mempercantik tampilan brand identity RT Anda.
*   **WhatsApp**: Gunakan format nomor internasional (62xxx) agar integrasi kirim pesan berjalan lancar.

---
*Dibuat untuk memajukan kerukunan dan transparansi lingkungan.* 🍻
