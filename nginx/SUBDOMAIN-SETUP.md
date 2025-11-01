# Subdomain Setup Guide

คู่มือการตั้งค่า subdomain สำหรับ Physical Computing Application

## 📋 Architecture

```
Frontend: phycom.domain.com → Nginx → frontend:3000
Backend:  phy-api.domain.com → Nginx → backend:3001
```

## 🚀 Quick Setup

### 1. เลือกใช้ Subdomain Config

แก้ `docker-compose.yml`:

```yaml
nginx:
  volumes:
    # เปลี่ยนจาก nginx.conf เป็น nginx-subdomain.conf
    - ./nginx/nginx-subdomain.conf:/etc/nginx/conf.d/default.conf:ro
    - nginx_cache:/var/cache/nginx
```

### 2. ตั้งค่า DNS Records

เพิ่ม A records ใน DNS provider ของคุณ:

```
Type    Host          Value
----    ----          -----
A       phycom        <your-server-ip>
A       phy-api       <your-server-ip>
```

หรือใช้ CNAME (ถ้ามี main domain แล้ว):

```
Type    Host          Value
----    ----          -----
CNAME   phycom        domain.com
CNAME   phy-api       domain.com
```

### 3. อัพเดท Environment Variables

แก้ไฟล์ `.env`:

```bash
# Production URLs
NEXT_PUBLIC_API_URL=http://phy-api.domain.com
NEXT_PUBLIC_BASE_URL=http://phycom.domain.com
```

**⚠️ สำคัญ**: แทน `domain.com` ด้วย domain จริงของคุณ

### 4. อัพเดท CORS ใน Nginx Config

แก้ `nginx/nginx-subdomain.conf` (ถ้าใช้ HTTPS):

```nginx
# บรรทัด 22-26
add_header Access-Control-Allow-Origin "https://phycom.yourdomain.com" always;

# และบรรทัด 39
add_header Access-Control-Allow-Origin "https://phycom.yourdomain.com" always;
```

### 5. Start Services

```bash
# Restart docker compose
docker compose down
docker compose up -d

# ตรวจสอบ logs
docker compose logs -f nginx
```

## 🧪 Testing

### Local Testing (ใช้ /etc/hosts)

ถ้ายังไม่มี DNS จริง สามารถทดสอบ local ได้:

```bash
# แก้ไฟล์ /etc/hosts (macOS/Linux)
sudo nano /etc/hosts

# เพิ่มบรรทัดนี้
127.0.0.1 phycom.domain.com
127.0.0.1 phy-api.domain.com
```

จากนั้นทดสอบ:

```bash
# Test frontend
curl -I http://phycom.domain.com/

# Test backend
curl http://phy-api.domain.com/api/status

# Test with browser
open http://phycom.domain.com
```

### Production Testing

```bash
# Test DNS resolution
nslookup phycom.domain.com
nslookup phy-api.domain.com

# Test HTTP response
curl -I http://phycom.domain.com/
curl -I http://phy-api.domain.com/api/status

# Test CORS headers
curl -I -H "Origin: http://phycom.domain.com" http://phy-api.domain.com/api/status
```

## 🔒 HTTPS Setup (Production)

### 1. สร้าง SSL Configuration สำหรับ Subdomains

```bash
# Copy template
cp nginx/ssl.conf.example nginx/nginx-subdomain-ssl.conf
```

### 2. ขอ SSL Certificates

```bash
# ใช้ Certbot
sudo certbot certonly --standalone \
  -d phycom.domain.com \
  -d phy-api.domain.com \
  --email your-email@example.com \
  --agree-tos
```

### 3. อัพเดท Nginx Config ให้ใช้ SSL

แก้ `nginx/nginx-subdomain-ssl.conf`:

```nginx
# Backend API Server
server {
    listen 443 ssl http2;
    server_name phy-api.domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # ... rest of config
}

# Frontend Server
server {
    listen 443 ssl http2;
    server_name phycom.domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # ... rest of config
}

# HTTP to HTTPS redirects
server {
    listen 80;
    server_name phy-api.domain.com phycom.domain.com;
    return 301 https://$host$request_uri;
}
```

### 4. อัพเดท docker-compose.yml

```yaml
nginx:
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/nginx-subdomain-ssl.conf:/etc/nginx/conf.d/default.conf:ro
    - ./nginx/ssl:/etc/nginx/ssl:ro
    - nginx_cache:/var/cache/nginx
```

### 5. อัพเดท .env สำหรับ HTTPS

```bash
NEXT_PUBLIC_API_URL=https://phy-api.domain.com
NEXT_PUBLIC_BASE_URL=https://phycom.domain.com
```

## 📊 URL Mapping

### Frontend (phycom.domain.com)

- `/` → Next.js homepage
- `/dashboard` → Dashboard page
- `/any-route` → Frontend routes
- `/health` → Frontend health check

### Backend (phy-api.domain.com)

- `/api/status` → API status endpoint
- `/logs` → Logs API
- `/config` → Config API
- `/upload` → Upload endpoint
- `/uploads/image.jpg` → Static files
- `/health` → Backend health check

## 🔧 Configuration Details

### CORS Headers (Backend Server)

```nginx
add_header Access-Control-Allow-Origin "https://phycom.domain.com" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
add_header Access-Control-Allow-Credentials "true" always;
```

อนุญาตให้ Frontend เรียก Backend API ได้

### Rate Limiting

- **API endpoints** (phy-api.domain.com): 10 req/s
- **Frontend** (phycom.domain.com): 30 req/s

### Timeouts

- **Standard**: 60 seconds
- **Upload endpoints**: 120 seconds

## 🐛 Troubleshooting

### DNS ไม่ resolve

```bash
# ตรวจสอบ DNS
dig phycom.domain.com
dig phy-api.domain.com

# รอ DNS propagation (อาจใช้เวลา 24-48 ชั่วโมง)
# ใช้ https://dnschecker.org/ ตรวจสอบ
```

### CORS Error

```bash
# ตรวจสอบ CORS headers
curl -I -H "Origin: http://phycom.domain.com" http://phy-api.domain.com/api/status

# ตรวจสอบว่า Access-Control-Allow-Origin ตรงกับ frontend domain
```

### 502 Bad Gateway

```bash
# ตรวจสอบ backend/frontend ทำงานหรือไม่
docker compose ps

# ตรวจสอบ logs
docker compose logs nginx
docker compose logs backend
docker compose logs frontend

# ทดสอบ internal network
docker compose exec nginx ping backend
docker compose exec nginx ping frontend
```

### SSL Certificate Error

```bash
# ตรวจสอบ certificate
openssl x509 -in nginx/ssl/fullchain.pem -text -noout

# ตรวจสอบ expiration
openssl x509 -in nginx/ssl/fullchain.pem -noout -dates

# Renew certificate
sudo certbot renew
docker compose restart nginx
```

## 📝 Checklist

- [ ] ตั้งค่า DNS records (A หรือ CNAME)
- [ ] อัพเดท `nginx-subdomain.conf` ด้วย domain จริง
- [ ] แก้ `docker-compose.yml` ให้ใช้ subdomain config
- [ ] อัพเดท `.env` ด้วย subdomain URLs
- [ ] ทดสอบ DNS resolution
- [ ] Start docker compose
- [ ] ทดสอบ frontend: `curl http://phycom.domain.com/`
- [ ] ทดสอบ backend: `curl http://phy-api.domain.com/api/status`
- [ ] ทดสอบ CORS
- [ ] (Production) ขอ SSL certificates
- [ ] (Production) อัพเดท config ใช้ HTTPS
- [ ] (Production) ทดสอบ HTTPS

## 🎯 ข้อดีของการใช้ Subdomain

✅ **แยก domain ชัดเจน** - Frontend/Backend แยกกันชัดเจน  
✅ **Security** - ตั้งค่า CORS และ security policies ได้ดีขึ้น  
✅ **Scalability** - แยก scale แต่ละส่วนได้อิสระ  
✅ **SSL/TLS** - จัดการ certificate แยกได้  
✅ **CDN Ready** - ใส่ CDN แต่ละส่วนได้ง่าย

## 📚 เปรียบเทียบ Path-based vs Subdomain

### Path-based (แบบเดิม)

```
http://localhost/          → Frontend
http://localhost/api/*     → Backend
```

**ดี**: Setup ง่าย, ใช้ domain เดียว  
**ไม่ดี**: CORS ซับซ้อน, ยากต่อการ scale

### Subdomain (แบบใหม่)

```
http://phycom.domain.com/     → Frontend
http://phy-api.domain.com/*   → Backend
```

**ดี**: แยกชัดเจน, ยืดหยุ่น, professional  
**ไม่ดี**: ต้องตั้งค่า DNS, SSL ซับซ้อนขึ้น
