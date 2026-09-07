# Panduan Install Backend FastAPI di VPS aaPanel (Terminal)

Ikuti langkah-langkah di bawah ini satu per satu di terminal VPS kamu.

## 1. Setup Python Environment
Pastikan posisi kamu sudah di folder `/www/wwwroot/rtappbackend`.

```bash
# Update dan install library tambahan (jika belum ada)
apt update && apt install python3-pip python3-venv -y

# Masuk ke directory (memastikan saja)
cd /www/wwwroot/rtappbackend

# Buat virtual environment bernama 'venv'
python3 -m venv venv

# Aktifkan virtual environment
source venv/bin/activate

# Install dependencies dari requirements.txt
pip install --upgrade pip
pip install -r requirements.txt
```

## 2. Test Jalan Manual
Coba jalankan sebentar untuk memastikan tidak ada error.

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```
Jika muncul pesan "Application startup complete", berarti aman. Tekan **CTRL+C** untuk stop.

## 3. Setup Auto-Start (Systemd Service)
Kita buat agar backend jalan otomatis di background (bahkan kalo VPS restart). Copy block code di bawah ini selengkapnya (dari `cat` sampai `EOF`) dan paste ke terminal:

```bash
cat <<EOF > /etc/systemd/system/rtapp-backend.service
[Unit]
Description=Gunicorn instance to serve Kas RT API
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/www/wwwroot/rtappbackend
Environment="PATH=/www/wwwroot/rtappbackend/venv/bin"
ExecStart=/www/wwwroot/rtappbackend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2

[Install]
WantedBy=multi-user.target
EOF
```

Lalu aktifkan service-nya:

```bash
# Reload configurasi systemd
systemctl daemon-reload

# Start service
systemctl start rtapp-backend

# Enable agar auto-start saat boot
systemctl enable rtapp-backend

# Cek status (harus warna hijau 'active (running)')
systemctl status rtapp-backend
```
Tekan `q` untuk keluar dari status viewer.

## 4. Setting Nginx (Reverse Proxy)
Karena kamu pake aaPanel, cara paling gampang cek file config Nginx domain kamu (biasanya di `/www/server/panel/vhost/nginx/NAMADOMAIN.conf`).

Tambahkan block ini di dalam `server { ... }`:

```nginx
location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Selesai! 🚀
