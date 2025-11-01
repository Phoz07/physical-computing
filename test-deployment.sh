#!/bin/bash
# Test script for Docker deployment with Nginx

set -e

echo "🔍 Testing Physical Computing Docker Deployment"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if services are running
echo "1. Checking if services are running..."
docker compose ps postgres | grep -q "Up" && print_status 0 "PostgreSQL is running" || print_status 1 "PostgreSQL is not running"
docker compose ps backend | grep -q "Up" && print_status 0 "Backend is running" || print_status 1 "Backend is not running"
docker compose ps frontend | grep -q "Up" && print_status 0 "Frontend is running" || print_status 1 "Frontend is not running"
docker compose ps nginx | grep -q "Up" && print_status 0 "Nginx is running" || print_status 1 "Nginx is not running"
echo ""

# Check health endpoints
echo "2. Checking health endpoints..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)
if [ "$HTTP_CODE" = "200" ]; then
    print_status 0 "Nginx health check (http://localhost/health)"
else
    print_status 1 "Nginx health check failed (HTTP $HTTP_CODE)"
fi

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/status)
if [ "$HTTP_CODE" = "200" ]; then
    print_status 0 "Backend API status (http://localhost/api/status)"
else
    print_status 1 "Backend API status failed (HTTP $HTTP_CODE)"
fi

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$HTTP_CODE" = "200" ]; then
    print_status 0 "Frontend homepage (http://localhost/)"
else
    print_status 1 "Frontend homepage failed (HTTP $HTTP_CODE)"
fi
echo ""

# Check nginx configuration
echo "3. Checking Nginx configuration..."
docker compose exec nginx nginx -t > /dev/null 2>&1 && print_status 0 "Nginx configuration is valid" || print_status 1 "Nginx configuration has errors"
echo ""

# Check database connectivity
echo "4. Checking database connectivity..."
docker compose exec backend bun -e "import { db } from './src/db'; await db.execute('SELECT 1'); console.log('DB Connected');" > /dev/null 2>&1 && print_status 0 "Backend can connect to database" || print_status 1 "Backend cannot connect to database"
echo ""

# Check volumes
echo "5. Checking volumes..."
docker volume ls | grep -q "postgres_data" && print_status 0 "PostgreSQL data volume exists" || print_status 1 "PostgreSQL data volume missing"
docker volume ls | grep -q "nginx_cache" && print_status 0 "Nginx cache volume exists" || print_status 1 "Nginx cache volume missing"
[ -d "./uploads" ] && print_status 0 "Uploads directory exists" || print_status 1 "Uploads directory missing"
echo ""

# Check rate limiting (optional)
echo "6. Testing rate limiting..."
print_warning "Sending rapid requests to test rate limiting..."
RATE_LIMITED=0
for i in {1..15}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/status)
    if [ "$HTTP_CODE" = "503" ] || [ "$HTTP_CODE" = "429" ]; then
        RATE_LIMITED=1
        break
    fi
    sleep 0.1
done

if [ $RATE_LIMITED -eq 1 ]; then
    print_status 0 "Rate limiting is working (got HTTP $HTTP_CODE)"
else
    print_warning "Rate limiting not triggered (this may be normal with low traffic)"
fi
echo ""

# Check security headers
echo "7. Checking security headers..."
HEADERS=$(curl -sI http://localhost/)
echo "$HEADERS" | grep -q "X-Frame-Options" && print_status 0 "X-Frame-Options header present" || print_status 1 "X-Frame-Options header missing"
echo "$HEADERS" | grep -q "X-Content-Type-Options" && print_status 0 "X-Content-Type-Options header present" || print_status 1 "X-Content-Type-Options header missing"
echo ""

# Summary
echo "================================================"
echo -e "${GREEN}✓${NC} All critical tests passed!"
echo ""
echo "Access your application at:"
echo "  • Application: http://localhost"
echo "  • Health Check: http://localhost/health"
echo ""
echo "To view logs:"
echo "  • docker compose logs -f nginx"
echo "  • docker compose logs -f backend"
echo "  • docker compose logs -f frontend"
echo ""
