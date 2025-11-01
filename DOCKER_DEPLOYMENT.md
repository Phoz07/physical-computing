# Docker Deployment Guide

This guide explains how to deploy the Physical Computing / Helmet Detection System using Docker Compose.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose v2.0 or higher
- At least 2GB of free disk space

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` and update the following:

- `POSTGRES_PASSWORD` - Set a strong password for PostgreSQL
- `NEXT_PUBLIC_API_URL` - Update for production deployment
- `NEXT_PUBLIC_BASE_URL` - Update for production deployment

### 2. Build and Start Services

```bash
# Build all services
docker-compose build

# Start all services in detached mode
docker-compose up -d
```

### 3. Run Database Migrations

After the services are running, apply database migrations:

```bash
# Run migrations
docker-compose exec backend bun drizzle-kit push

# Or use the migration files
docker-compose exec backend bun drizzle-kit migrate
```

### 4. Access the Application

All services are accessible through Nginx reverse proxy:

- **Application**: http://localhost (port 80)
- **Health Check**: http://localhost/health
- **Backend API**: http://localhost:3001
- **API Status**: http://localhost:3001/api/status

## Service Details

### Services

1. **nginx** - Nginx reverse proxy

   - Port: 80 (HTTP)
   - Routes all traffic to backend and frontend
   - Features: Rate limiting, security headers, gzip compression

2. **postgres** - PostgreSQL 16 database

   - Port: 5432 (internal only)
   - Data persisted in `postgres_data` volume

3. **backend** - Elysia API server (Bun runtime)

   - Port: 3001 (internal only, accessed through nginx)
   - File uploads stored in `./uploads`

4. **frontend** - Next.js 16 application
   - Port: 3000 (internal only, accessed through nginx)
   - Standalone mode for optimal Docker performance

### Networks

All services run on the `app-network` bridge network for inter-service communication.

### Volumes

- `postgres_data` - Persistent PostgreSQL data
- `nginx_cache` - Nginx cache storage
- `./uploads` - Uploaded images (bind mount, shared with backend)

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nginx
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all services
docker-compose build
docker-compose up -d
```

### Access Service Shell

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# PostgreSQL shell
docker-compose exec postgres psql -U postgres -d physical_computing
```

## Database Management

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres physical_computing > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d physical_computing
```

### Reset Database

```bash
# Stop backend
docker-compose stop backend

# Connect to PostgreSQL and drop/recreate database
docker-compose exec postgres psql -U postgres -c "DROP DATABASE physical_computing;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE physical_computing;"

# Run migrations
docker-compose start backend
docker-compose exec backend bun drizzle-kit push
```

## Production Deployment

### 1. Update Environment Variables

For production, update `.env`:

```env
POSTGRES_PASSWORD=<strong-production-password>
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2. Security Hardening

- Change default PostgreSQL credentials
- Use Docker secrets for sensitive data
- Enable firewall rules
- Regular security updates: `docker-compose pull && docker-compose up -d`

## Monitoring

### Health Checks

All services have health checks configured:

```bash
# Check service health
docker-compose ps
```

### Resource Usage

```bash
# View resource usage
docker stats
```

## Troubleshooting

### Backend Can't Connect to Database

1. Check if PostgreSQL is healthy: `docker-compose ps postgres`
2. Verify DATABASE_URL in backend logs: `docker-compose logs backend`
3. Ensure network connectivity: `docker-compose exec backend ping postgres`

### Frontend Can't Connect to Backend

1. Verify NEXT_PUBLIC_API_URL is correct
2. Check backend is running: `curl http://localhost:3001/api/status`
3. Review frontend logs: `docker-compose logs frontend`

### Port Already in Use

Change ports in `.env`:

```env
FRONTEND_PORT=3001
BACKEND_PORT=3002
POSTGRES_PORT=5433
```

### Permission Issues with Uploads

```bash
# Fix upload directory permissions
sudo chown -R 1000:1000 apps/backend/uploads
```

## Scaling

### Horizontal Scaling

Scale the backend service:

```bash
docker-compose up -d --scale backend=3
```

Add a load balancer (Nginx/Traefik) to distribute traffic.

### Vertical Scaling

Update resource limits in `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          ssh user@server "cd /app && git pull && docker-compose up -d --build"
```

## Support

For issues or questions, check:

- Backend logs: `docker-compose logs backend`
- Frontend logs: `docker-compose logs frontend`
- Database logs: `docker-compose logs postgres`

## License

[Your License Here]
