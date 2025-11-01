# 🚀 Quick Reference - Docker Deployment with Nginx

## Start/Stop Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart a specific service
docker compose restart nginx

# View logs
docker compose logs -f nginx
```

## Access URLs

| Service          | URL                         | Description           |
| ---------------- | --------------------------- | --------------------- |
| **Application**  | http://localhost            | Main application      |
| **Health Check** | http://localhost/health     | Nginx health endpoint |
| **API Status**   | http://localhost/api/status | Backend status        |

## Testing

```bash
# Run comprehensive tests
./test-deployment.sh

# Quick health check
curl http://localhost/health

# Test API
curl http://localhost/api/status
```

## SSL Setup (Production)

```bash
# 1. Get certificates
sudo certbot certonly --standalone -d yourdomain.com

# 2. Copy to project
sudo cp /etc/letsencrypt/live/yourdomain.com/*.pem nginx/ssl/

# 3. Enable SSL config
cp nginx/ssl.conf.example nginx/ssl.conf

# 4. Update docker-compose.yml to use ssl.conf
# 5. Restart
docker compose down && docker compose up -d
```

## Common Tasks

```bash
# Reload Nginx config
docker compose exec nginx nginx -s reload

# Test Nginx config
docker compose exec nginx nginx -t

# View active connections
docker compose exec nginx ps aux

# Clear cache
docker compose exec nginx rm -rf /var/cache/nginx/*
```

## Troubleshooting

```bash
# 502 Bad Gateway? Check services:
docker compose ps

# Check logs:
docker compose logs nginx
docker compose logs backend

# Test connectivity:
docker compose exec nginx ping backend
```

## File Locations

| File                     | Purpose                     |
| ------------------------ | --------------------------- |
| `nginx/nginx.conf`       | HTTP configuration (active) |
| `nginx/ssl.conf.example` | HTTPS template              |
| `nginx/README.md`        | Detailed SSL guide          |
| `docker-compose.yml`     | Service orchestration       |
| `test-deployment.sh`     | Test script                 |

## Rate Limits

- API endpoints: 10 req/s (burst 20)
- General: 30 req/s (burst 50)

## Documentation

- **Nginx Setup**: `nginx/README.md`
- **Deployment**: `DOCKER_DEPLOYMENT.md`
- **Implementation**: `NGINX_IMPLEMENTATION.md`
