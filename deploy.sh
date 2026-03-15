#!/bin/bash
# Script deploy lên Ubuntu server
# Chạy: chmod +x deploy.sh && ./deploy.sh

set -e

echo "=== Quản Lý Tiến Độ — Deploy ==="

# 1. Kiểm tra .env
if [ ! -f .env ]; then
  echo "Chưa có file .env. Sao chép .env.example và điền thông tin:"
  cp .env.example .env
  echo "  → Mở file .env và đổi các giá trị, sau đó chạy lại deploy.sh"
  exit 1
fi

# 2. Chạy migration trước khi start (API chạy migration tự động khi startup)
echo "[1/3] Build & start containers..."
docker compose pull db 2>/dev/null || true
docker compose up -d --build

# 3. Đợi DB healthy
echo "[2/3] Đợi SQL Server sẵn sàng..."
sleep 15

# 4. Chạy EF migration bên trong container API
echo "[3/3] Chạy database migration..."
docker compose exec api dotnet QuanLyTienDo.API.dll --migrate 2>/dev/null || true

echo ""
echo "=== Deploy xong! ==="
echo "Web: http://$(hostname -I | awk '{print $1}')"
echo "API: http://$(hostname -I | awk '{print $1}'):5015"
echo ""
echo "Logs: docker compose logs -f"
