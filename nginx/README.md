# Nginx Reverse Proxy Configuration

Simple HTTP reverse proxy for the Physical Computing application.

## Quick Start

```bash
# Start all services
docker compose up -d

# Access the application
open http://localhost
```

That's it! No SSL configuration needed for local development.

## What Nginx Does

### URL Routing

- `http://localhost/` → Frontend (Next.js)
- `http://localhost/api/*` → Backend API
- `http://localhost/logs` → Backend API
- `http://localhost/config` → Backend API
- `http://localhost/upload` → Backend API
- `http://localhost/uploads/*` → Backend static files
- `http://localhost/health` → Nginx health check

### Security Features

- **Rate Limiting**:
  - API endpoints: 10 requests/second (burst: 20)
  - General endpoints: 30 requests/second (burst: 50)
- **Security Headers**:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`

### Performance Features

- **Gzip compression** for text, CSS, JavaScript, JSON
- **Static file caching** (30 days for uploads)
- **Optimized timeouts** (60s standard, 120s for uploads)

## Testing

```bash
# Check nginx is running
docker compose ps nginx

# Test health endpoint
curl http://localhost/health

# Test frontend
curl -I http://localhost/

# Test backend API
curl http://localhost/api/status

# Run automated tests
./test-deployment.sh
```

## Common Commands

```bash
# View nginx logs
docker compose logs -f nginx

# Reload nginx config (after editing nginx.conf)
docker compose exec nginx nginx -s reload

# Test nginx configuration
docker compose exec nginx nginx -t

# Restart nginx
docker compose restart nginx
```

## Customization

Edit `nginx.conf` to customize:

### Adjust Rate Limits

```nginx
# Change these values as needed
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;
```

### Increase Upload Size

```nginx
client_max_body_size 50M;  # Default is 10M
```

### Adjust Timeouts

```nginx
proxy_read_timeout 300s;   # Default is 60s
proxy_send_timeout 300s;   # Default is 60s
```

After editing, reload the configuration:

```bash
docker compose exec nginx nginx -s reload
```

## Troubleshooting

### 502 Bad Gateway

Backend or frontend is not running:

```bash
# Check service status
docker compose ps

# Check logs
docker compose logs nginx
docker compose logs backend
docker compose logs frontend

# Test network connectivity
docker compose exec nginx ping backend
docker compose exec nginx ping frontend
```

### Rate Limiting Too Strict

If legitimate users are being blocked:

```bash
# Edit nginx.conf and increase rate limits
# Then reload: docker compose exec nginx nginx -s reload
```

### Port Already in Use

If port 80 is already taken:

```bash
# Check what's using port 80
sudo lsof -i :80

# Or change the port in .env file
echo "HTTP_PORT=8080" >> .env
docker compose down && docker compose up -d

# Then access at http://localhost:8080
```

## Files

- `nginx.conf` - Active HTTP configuration
- `ssl.conf.example` - HTTPS template (optional, not used by default)
- `README.md` - This file

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Compose Nginx Guide](https://docs.docker.com/samples/nginx/)
