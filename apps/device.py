#!/usr/bin/env python3
"""
Camera Web Streaming with Helmet Detection - FastAPI
- ตรวจจับ helmet ด้วย YOLO
- ควบคุม servo
- แสดง live stream ผ่าน /stream.mjpg
เข้าดูได้ที่: http://<Pi-IP>:8000/stream.mjpg
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from picamera2 import Picamera2
from datetime import datetime
from ultralytics import YOLO
from gpiozero import Servo
from gpiozero.pins.lgpio import LGPIOFactory
from threading import Thread, Lock
import cv2
import time
import uvicorn
import requests
import io

# Configuration
MODEL_PATH = "helmet.pt"
CONF = 0.35 
IMGSZ = 320
SERVO_PIN = 18
SERVER_URL = "http://192.168.1.186:3001"  # Backend API URL (port 3001)

# Setup servo
factory = LGPIOFactory()
servo = Servo(
    SERVO_PIN, 
    min_pulse_width=0.5/1000, 
    max_pulse_width=2.5/1000, 
    pin_factory=factory
)

# FastAPI app
app = FastAPI(title="Helmet Detection Stream")

# เปิด CORS ให้ทุก origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # อนุญาตทุก origin
    allow_credentials=True,
    allow_methods=["*"],  # อนุญาตทุก HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # อนุญาตทุก headers
)

# Global variables
is_servo_open = False
has_helmet_detected = False
manual_mode = False  # โหมดควบคุมเอง
model = None
picam2 = None
current_frame = None
frame_lock = Lock()

# Pydantic model สำหรับ request body
class GateControl(BaseModel):
    action: str  # "open" หรือ "close"

def set_angle(angle):
    """แปลงมุม 0-180° เป็นค่า servo -1 ถึง +1"""
    value = (angle / 90.0) - 1.0
    value = max(-1, min(1, value))
    servo.value = value
    print(f"🔧 Servo: {angle}° (value={value:.2f})")
    time.sleep(0.5)
    servo.value = None

def get_ip():
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

def upload_image(frame):
    """Upload รูปภาพไปที่ server และคืนค่า URL"""
    try:
        # Convert frame เป็น JPEG
        ret, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
        if not ret:
            print("❌ ไม่สามารถ encode รูปภาพได้")
            return None
        
        # สร้าง file object สำหรับ upload
        files = {
            'file': ('image.jpg', io.BytesIO(jpeg.tobytes()), 'image/jpeg')
        }
        
        # POST ไปที่ server
        response = requests.post(f"{SERVER_URL}/upload", files=files, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            image_url = data.get('url') or data.get('image_url') or data.get('file_url')
            print(f"✅ Upload รูปภาพสำเร็จ: {image_url}")
            return image_url
        else:
            print(f"❌ Upload ไม่สำเร็จ: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error uploading image: {e}")
        return None

def send_log(image_url, is_open):
    """ส่ง log ไปที่ server"""
    try:
        data = {
            "image": image_url,
            "isOpen": is_open
        }
        
        response = requests.post(
            f"{SERVER_URL}/logs",
            json=data,
            timeout=5,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200 or response.status_code == 201:
            print(f"✅ ส่ง log สำเร็จ: isOpen={is_open}")
            return True
        else:
            print(f"❌ ส่ง log ไม่สำเร็จ: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error sending log: {e}")
        return False

def detection_thread():
    """Thread สำหรับการตรวจจับ helmet"""
    global is_servo_open, has_helmet_detected, model, picam2, current_frame
    
    print("📦 Loading YOLO model...")
    model = YOLO(MODEL_PATH)
    names = {i: n.lower() for i, n in model.names.items()}
    print(f"✅ Model loaded. Classes: {list(names.values())}")
    
    # เริ่มต้น servo
    set_angle(0)
    
    while True:
        try:
            # Capture frame
            frame = picam2.capture_array()
            
            # Resize สำหรับ detection
            small = cv2.resize(frame, (IMGSZ, IMGSZ), interpolation=cv2.INTER_AREA)
            
            # ตรวจจับ helmet
            res = model.predict(
                source=small, 
                imgsz=IMGSZ, 
                conf=CONF, 
                verbose=False, 
                device="cpu"
            )[0]
            
            has_helmet = any(names.get(int(b.cls), "") == "helmet" for b in res.boxes)
            has_helmet_detected = has_helmet
            
            # ควบคุม servo อัตโนมัติเฉพาะตอนไม่ได้อยู่ใน manual mode
            if not manual_mode:
                if has_helmet and not is_servo_open:
                    is_servo_open = True
                    set_angle(90)
                    
                    # 🔥 ส่ง log ไปที่ server (ทำใน background thread เพื่อไม่ให้ blocking)
                    def send_event():
                        try:
                            print("📤 กำลังส่ง event ไปที่ server...")
                            image_url = upload_image(frame.copy())
                            if image_url:
                                send_log(image_url, True)
                        except Exception as e:
                            print(f"❌ Error sending event: {e}")
                    
                    Thread(target=send_event, daemon=True).start()
                    time.sleep(3)  # เปิดค้างไว้ 3 วินาที
                    
                elif not has_helmet and is_servo_open:
                    is_servo_open = False
                    set_angle(0)
            
            # เพิ่มข้อมูลลงในภาพ
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame, timestamp, (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # แสดงสถานะ helmet
            status_text = f"HELMET={str(has_helmet).upper()}  (conf>={CONF})"
            color = (0, 200, 0) if has_helmet else (0, 0, 255)
            cv2.putText(frame, status_text, (10, 70),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
            
            # แสดงสถานะ gate
            gate_status = "OPEN" if is_servo_open else "CLOSED"
            gate_color = (0, 255, 0) if is_servo_open else (0, 0, 255)
            cv2.putText(frame, f"GATE: {gate_status}", (10, 110),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.9, gate_color, 2)
            
            # Convert frame to JPEG และเก็บใน global variable
            ret, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if ret:
                with frame_lock:
                    current_frame = jpeg.tobytes()
            
            time.sleep(0.1)  # ลด CPU usage
            
        except Exception as e:
            print(f"❌ Error in detection thread: {e}")
            time.sleep(1)

def generate_frames():
    """Generator สำหรับ stream MJPEG"""
    while True:
        with frame_lock:
            if current_frame is None:
                time.sleep(0.1)
                continue
            frame = current_frame
        
        yield (b'--FRAME\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        time.sleep(0.033)  # ~30 FPS

@app.get("/stream.mjpg")
async def stream():
    """Endpoint สำหรับ MJPEG stream"""
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=FRAME"
    )

@app.get("/status")
async def get_status():
    """Endpoint สำหรับตรวจสอบสถานะของระบบ"""
    return {
        "is_online": picam2 is not None and picam2.started,
        "gate_status": "open" if is_servo_open else "closed",
        "model_loaded": model is not None,
        "manual_mode": manual_mode,
        "confidence_threshold": CONF
    }

@app.post("/gate")
async def control_gate(gate: GateControl):
    """Endpoint สำหรับควบคุม gate ด้วยตัวเอง"""
    global is_servo_open, manual_mode
    
    if gate.action.lower() == "open":
        manual_mode = True
        is_servo_open = True
        set_angle(90)
        return {
            "success": True,
            "message": "Gate opened",
            "gate_status": "open",
            "manual_mode": True
        }
    elif gate.action.lower() == "close":
        manual_mode = False
        is_servo_open = False
        set_angle(0)
        return {
            "success": True,
            "message": "Gate closed",
            "gate_status": "closed",
            "manual_mode": False
        }
    else:
        return {
            "success": False,
            "message": "Invalid action. Use 'open' or 'close'",
            "gate_status": "open" if is_servo_open else "closed"
        }

@app.on_event("startup")
async def startup_event():
    """เริ่มต้น camera และ detection thread เมื่อ app เริ่มทำงาน"""
    global picam2
    
    print("📷 Starting camera...")
    picam2 = Picamera2()
    config = picam2.create_preview_configuration(
        main={"size": (1280, 720), "format": "RGB888"}
    )
    picam2.configure(config)
    picam2.start()
    print("✅ Camera ready")
    
    # เริ่ม detection thread
    detect_thread = Thread(target=detection_thread, daemon=True)
    detect_thread.start()
    
    ip = get_ip()
    print("=" * 60)
    print("🚀 FastAPI Helmet Detection Server")
    print("=" * 60)
    print(f"✅ Stream URL: http://{ip}:8000/stream.mjpg")
    print(f"✅ หรือใช้: http://localhost:8000/stream.mjpg")
    print("=" * 60)

@app.on_event("shutdown")
async def shutdown_event():
    """ทำความสะอาดเมื่อปิด app"""
    print("🧹 ทำความสะอาด...")
    try:
        if picam2:
            picam2.stop()
    except:
        pass
    set_angle(0)
    print("✅ ปิดโปรแกรมเรียบร้อย")

def main():
    """รัน FastAPI server ด้วย uvicorn"""
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )

if __name__ == '__main__':
    main()

