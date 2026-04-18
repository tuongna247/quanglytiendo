# SSL Wildcard Registration Guide

## Server Info

| | |
|---|---|
| **IP** | `75.119.131.225` |
| **SSH** | `ssh -i "C:\Users\tuong\.ssh\id_rsa_tour_260218" root@75.119.131.225` |
| **NPM Admin** | `http://75.119.131.225:81` |

---

## Bước 1 — Cloudflare API Token

1. Vào `dash.cloudflare.com/profile/api-tokens`
2. **Create Token** → template **"Edit zone DNS"**
3. Zone Resources: `Include → Specific zone → kinhthanhmoingay.com`
4. **Create Token** → Copy token

Test token:
```bash
curl "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer TOKEN"
```
Phải trả về `"success": true`

---

## Bước 2 — Tạo Wildcard Cert (thủ công trong NPM container)

```bash
# Tạo credentials file
docker exec nginx-proxy-manager-app-1 sh -c \
  'echo "dns_cloudflare_api_token=TOKEN" > /tmp/cf.ini && chmod 600 /tmp/cf.ini'

# Chạy certbot
docker exec nginx-proxy-manager-app-1 certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /tmp/cf.ini \
  -d "*.kinhthanhmoingay.com" \
  --non-interactive \
  --agree-tos \
  --email tuong247@gmail.com
```

Cert lưu tại: `/etc/letsencrypt/live/kinhthanhmoingay.com/`

---

## Bước 3 — Import vào NPM (Custom Certificate)

1. NPM → **SSL Certificates** → **Add SSL Certificate** → **Custom**
2. **Certificate Key**: nội dung `privkey.pem`
3. **Certificate**: nội dung `fullchain.pem`

Xem nội dung cert:
```bash
docker exec nginx-proxy-manager-app-1 cat /etc/letsencrypt/live/kinhthanhmoingay.com/fullchain.pem
docker exec nginx-proxy-manager-app-1 cat /etc/letsencrypt/live/kinhthanhmoingay.com/privkey.pem
```

---

## Bước 4 — Thêm DNS Record (Cloudflare)

`dash.cloudflare.com` → `kinhthanhmoingay.com` → **DNS** → **Add record**

| Field | Value |
|-------|-------|
| Type | `A` |
| Name | `subdomain` (vd: `tasks`, `ubkt`) |
| IPv4 | `75.119.131.225` |
| Proxy | DNS only (mây xám) |

Kiểm tra propagate:
```bash
nslookup subdomain.kinhthanhmoingay.com 1.1.1.1
```

---

## Bước 5 — Tạo Proxy Host trong NPM

1. **Hosts** → **Proxy Hosts** → **Add Proxy Host**
2. **Domain Names**: `subdomain.kinhthanhmoingay.com`
3. **Forward Hostname**: `127.0.0.1`
4. **Forward Port**: port app (vd: `3010`)
5. Tab **SSL** → chọn cert wildcard
6. Bật **Force SSL** + **HTTP/2 Support**
7. **Save**

---

## Apps đang chạy

| Domain | Port | App |
|--------|------|-----|
| `tasks.kinhthanhmoingay.com` | `3010` | QuanLyTienDo (Next.js) |

---

## Troubleshooting

```bash
# Xem log NPM
docker logs nginx-proxy-manager-app-1 2>&1 | tail -50

# Kiểm tra port bị chiếm
ss -tlnp | grep ':80'

# Kiểm tra app chạy
docker ps
curl http://127.0.0.1:3010
```
