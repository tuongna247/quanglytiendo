#!/bin/bash
# Script deploy lên Ubuntu server (multi-project, nginx sẵn có)
# Chạy: chmod +x deploy.sh && ./deploy.sh

set -e

echo "=== Quản Lý Tiến Độ — Deploy ==="

# 1. Kiểm tra .env
if [ ! -f .env ]; then
  echo "Chưa có file .env. Sao chép từ .env.example:"
  cp .env.example .env
  echo "  → Mở file .env, điền đúng giá trị, rồi chạy lại deploy.sh"
  exit 1
fi

# 2. Build & start containers
echo "[1/3] Build & start containers..."
docker compose up -d --build

# 3. Đợi PostgreSQL healthy
echo "[2/3] Đợi PostgreSQL sẵn sàng..."
for i in $(seq 1 30); do
  if docker compose exec -T db pg_isready -U postgres -d QuanLyTienDo &>/dev/null; then
    echo "  PostgreSQL sẵn sàng!"
    break
  fi
  echo "  Đợi... ($i/30)"
  sleep 3
done

# 4. Migration tự động trong API startup (Program.cs đã có db.Database.Migrate())
echo "[3/3] Kiểm tra migration..."
sleep 5
docker compose logs api --tail=20

echo ""
echo "=== Deploy xong! ==="
WEB_PORT=$(grep WEB_PORT .env | cut -d= -f2)
WEB_PORT=${WEB_PORT:-3010}
echo "Web chạy tại: http://localhost:${WEB_PORT}"
echo ""

# Copy nginx config nếu chưa có
NGINX_CONF="/nginx/sites-available/tasks.kinhthanhmoingay.com.conf"
if [ ! -f "$NGINX_CONF" ]; then
  echo "[Nginx] Copy config..."
  sudo cp nginx/tasks.kinhthanhmoingay.com.conf "$NGINX_CONF"
  sudo nginx -t && sudo systemctl reload nginx
  echo "[Nginx] Done — tasks.kinhthanhmoingay.com.conf đã được cài."
else
  echo "[Nginx] Config đã tồn tại tại $NGINX_CONF"
fi

echo "Logs: docker compose logs -f"
