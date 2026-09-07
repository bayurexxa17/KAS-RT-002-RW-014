#!/bin/bash

# ==========================================
# RT APP AUTO DEPLOYER
# Multi-Tenant / Multi-Subdomain Generator
# ==========================================

# Cek apakah dijalankan sebagai root/sudo
if [ "$EUID" -ne 0 ]
  then echo "❌ Harap jalankan command ini sebagai root (sudo su)"
  exit
fi

# Input Parameter
APP_NAME=$1
PORT=$2

# Validasi Input
if [ -z "$APP_NAME" ] || [ -z "$PORT" ]; then
    echo "⚠️  Cara Pakai: ./deploy_rt.sh [nama_rt] [port]"
    echo "   Contoh: ./deploy_rt.sh rt05 8005"
    exit 1
fi

# Konfigurasi Path (Sesuaikan dengan server lu)
SOURCE_DIR="/www/wwwroot/rtappbackend"  # Folder master yang udah jadi & build
TARGET_BASE="/www/wwwroot"              # Tempat naruh instance baru
TARGET_DIR="$TARGET_BASE/rt_$APP_NAME"
SERVICE_NAME="rt_$APP_NAME"

echo "=========================================="
echo "🚀 Memulai Deployment untuk: $APP_NAME"
echo "📂 Target Folder: $TARGET_DIR"
echo "🔌 Port Backend: $PORT"
echo "=========================================="

# 1. Buat Folder & Copy File
if [ -d "$TARGET_DIR" ]; then
    echo "⚠️  Folder sudah ada! Menimpa isi folder..."
else
    echo "📁 Membuat folder baru..."
fi

mkdir -p "$TARGET_DIR"

# Copy Backend (Kecuali venv, logs, db lama, dan uploadan lama)
echo "📦 Copying files..."
rsync -av --exclude 'venv' --exclude 'logs' --exclude 'kas_rt.db' --exclude 'uploads' --exclude '.git' "$SOURCE_DIR/" "$TARGET_DIR/"

# Bikin folder uploads & logs kosong buat instance baru
mkdir -p "$TARGET_DIR/uploads"
mkdir -p "$TARGET_DIR/logs"

# 2. Setup Virtual Environment (Venv)
echo "🐍 Setting up Python Virtual Environment..."
cd "$TARGET_DIR"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

# 3. Buat Systemd Service Baru
echo "⚙️  Making Systemd Service ($SERVICE_NAME.service)..."

cat <<EOF > /etc/systemd/system/$SERVICE_NAME.service
[Unit]
Description=RT App Backend for $APP_NAME
After=network.target

[Service]
User=root
Group=root
WorkingDirectory=$TARGET_DIR
Environment="PATH=$TARGET_DIR/venv/bin"
ExecStart=$TARGET_DIR/venv/bin/uvicorn main:app --host 0.0.0.0 --port $PORT
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 4. Aktifkan Service
echo "🔥 Starting Service..."
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

# 5. Set Permission (PENTING BUAT UPLOAD)
echo "🔒 Setting Permissions..."
chown -R www-data:www-data "$TARGET_DIR/uploads"
chmod -R 755 "$TARGET_DIR/uploads"

# 6. Generate Nginx Config Snippet
echo ""
echo "✅ DEPLOYMENT BERHASIL!"
echo "=========================================="
echo "📝 COPY CONFIG INI KE NGINX (aaPanel -> Website -> Conf):"
echo "=========================================="
echo ""
echo "server {"
echo "    listen 80;"
echo "    server_name $APP_NAME.domainlu.com; # Ganti domainlu.com"
echo "    root $TARGET_DIR/dist; # Frontend Build"
echo "    index index.html;"
echo ""
echo "    # Backend Proxy"
echo "    location /api {"
echo "        proxy_pass http://127.0.0.1:$PORT;"
echo "        proxy_set_header Host \$host;"
echo "        proxy_set_header X-Real-IP \$remote_addr;"
echo "    }"
echo ""
echo "    # Gambar/Uploads"
echo "    location ^~ /uploads {"
echo "        alias $TARGET_DIR/uploads;"
echo "        expires 30d;"
echo "    }"
echo ""
echo "    # React Router (SPA)"
echo "    location / {"
echo "        try_files \$uri \$uri/ /index.html;"
echo "    }"
echo "}"
echo "=========================================="
echo "Jangan lupa 'systemctl boot' eh maksudnya reload nginx!"
