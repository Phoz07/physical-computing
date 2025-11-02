<div align="center">
  <img src="apps/frontend/public/full-logo.svg" alt="Helmet Detection System Logo" width="200"/>
  
  # Helmet Detection System for Automatic Door Access
  
  A full-stack application for helmet detection with automatic gate control, featuring real-time camera streaming, manual gate control, and logging system.
</div>

## 🎥 Demo Video

Watch our project demo: [Helmet Detection System Demo](https://youtu.be/oa9KFLqirXg)

## 🏗️ Project Structure

```
physical-computing/
├── apps/
│   ├── frontend/          # Next.js 16 + React 19
│   ├── backend/           # Elysia (Bun) + PostgreSQL
│   └── device.py          # Raspberry Pi - FastAPI + YOLO
├── package.json
└── turbo.json
```

### System Architecture

![System Architecture Diagram](apps/frontend/public/diagram.png)

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 16, React 19
- **UI**: shadcn/ui, Tailwind CSS
- **State Management**: TanStack Query v5
- **Runtime**: Bun

### Backend

- **Framework**: Elysia (Bun)
- **Database**: PostgreSQL (Drizzle ORM)
- **File Upload**: Static file serving

### Device (Raspberry Pi)

- **Framework**: FastAPI
- **Computer Vision**: YOLO (Ultralytics)
- **Hardware**: PiCamera2, Servo (GPIO)

## 📋 Prerequisites

- **Bun** >= 1.2.17
- **Node.js** >= 20.x
- **PostgreSQL** >= 14
- **Python** >= 3.9 (for Raspberry Pi)
- **Raspberry Pi** with camera module

## 🔧 Installation

### 1. Clone Repository

```bash
git clone https://github.com/Phoz07/physical-computing.git
cd physical-computing
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Configuration

#### Frontend (.env)

Create `apps/frontend/.env`:

```env
NEXT_PUBLIC_API_URL=https://phy-api.suwizx.dev
NEXT_PUBLIC_BASE_URL=https://phycom.suwizx.dev
```

#### Backend (.env)

Create `apps/backend/.env`:

```env
DATABASE_URL=postgres://username:password@host:5432/database
```

#### Device (device.py)

Edit `apps/device.py`:

```python
SERVER_URL = "https://phy-api.suwizx.dev"  # Your backend URL
```

### 4. Database Setup

```bash
# Run migrations
bun run db:migrate

# (Optional) Open Drizzle Studio
bun run db:studio
```

### 5. Run Development

```bash
# Run all services
bun run dev

# Or run individually
bun run dev:web      # Frontend only
bun run dev:server   # Backend only
```

### 6. Run Device (Raspberry Pi)

```bash
# Install Python dependencies
pip install fastapi uvicorn picamera2 ultralytics opencv-python gpiozero requests

# Run device server
python3 apps/device.py
```

## 🌐 Deployment

### Production Build

```bash
bun run build
```

### Docker Deployment (Optional)

```bash
docker compose up -d
```

## 📡 API Documentation

### Backend API Endpoints

#### **Base URL**: `https://phy-api.suwizx.dev`

---

### 1. Health Check

**GET** `/api/status`

**Response:**

```json
{
  "isOnline": true
}
```

---

### 2. Get Logs

**GET** `/logs`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "image": "/uploads/image.jpg",
      "isOpen": true,
      "createdAt": "2025-11-02T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### 3. Get Config

**GET** `/config`

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "webhookUrl": "http://192.168.1.100:8000"
  }
}
```

---

### 4. Create/Update Config

**POST** `/config`

**Request Body:**

```json
{
  "webhookUrl": "http://192.168.1.100:8000"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "webhookUrl": "http://192.168.1.100:8000"
  }
}
```

---

### 5. Upload Image

**POST** `/upload`

**Request Body:** `multipart/form-data`

- `file`: Image file

**Response:**

```json
{
  "success": true,
  "path": "/uploads/1730544000000-image.jpg"
}
```

---

### 6. Create Log Entry

**POST** `/logs`

**Request Body:**

```json
{
  "image": "/uploads/image.jpg",
  "isOpen": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "image": "/uploads/image.jpg",
    "isOpen": true,
    "createdAt": "2025-11-02T10:00:00Z"
  }
}
```

---

## 🤖 Device API (Raspberry Pi)

### **Base URL**: `http://<device-ip>:8000`

---

### 1. Get Device Status

**GET** `/status`

**Response:**

```json
{
  "is_online": true,
  "gate_status": "closed",
  "model_loaded": true,
  "manual_mode": false,
  "confidence_threshold": 0.35
}
```

---

### 2. Manual Gate Control

**POST** `/gate`

**Request Body:**

```json
{
  "action": "open" // or "close"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Gate opened",
  "gate_status": "open",
  "manual_mode": true
}
```

---

### 3. Camera Stream

**GET** `/stream.mjpg`

Returns MJPEG stream for real-time camera viewing.

---

## 🎯 Features

- ✅ Real-time helmet detection using YOLO
- ✅ Automatic gate control on helmet detection
- ✅ Manual gate control (open/close)
- ✅ Live camera stream (MJPEG)
- ✅ Log history with images
- ✅ Webhook configuration
- ✅ Responsive web interface
- ✅ Dark/Light theme support
- ✅ Real-time hardware status monitoring

## 🔒 Security Notes

- Change default database credentials in production
- Use HTTPS for production deployment
- Implement rate limiting for API endpoints
- Secure webhook URLs with authentication
- Keep YOLO model files secure

## 📝 Configuration

### Webhook Setup

1. Navigate to Settings (gear icon)
2. Enter your Raspberry Pi device URL (e.g., `http://192.168.1.100:8000`)
3. Click "Test Connection" to verify
4. Save configuration

### YOLO Model

Place your trained helmet detection model at:

```
apps/helmet.pt
```

## 🐛 Troubleshooting

### Frontend doesn't connect to backend

- Check `NEXT_PUBLIC_API_URL` in frontend `.env`
- Verify backend is running on correct port
- Check CORS settings

### Device stream not showing

- Verify webhook URL is configured correctly
- Check if device is accessible from frontend
- Reload webpage after updating webhook URL

### Gate control not working

- Ensure device is running and accessible
- Check servo connections (GPIO 18)
- Verify manual mode is disabled for auto detection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

### Development Team

- **นายศักดิธัช ปิ่นแก้ว** - 67070174

  - Role: Landing Page Developer
  - GitHub: [Phoz07](https://github.com/Phoz07)
  - Contribution: 25%

- **น.ส.ปุญญิศา กันจินะ** - 67070102

  - Role: Poster Designer & Documentation
  - Contribution: 25%

- **นายสุวิจักขณ์ พรหมสถิตย์** - 67070191

  - Role: Hardware & Full Stack Developer
  - GitHub: [suwizx](https://github.com/suwizx)
  - Website: [suwizx.dev](https://suwizx.dev)
  - Email: suwijak.pak@gmail.com
  - Contribution: 25%

- **นายณฐพงศ์ โสภาพล** - 67070045
  - Role: AI/ML & Software Engineer
  - Website: [nsys.site](https://nsys.site)
  - Contribution: 25%

## 🙏 Acknowledgments

- Ultralytics YOLO for object detection
- shadcn/ui for beautiful UI components
- Elysia for blazing fast backend
- FastAPI for device API framework
