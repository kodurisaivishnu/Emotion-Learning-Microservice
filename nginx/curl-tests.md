# API Gateway Curl Test Commands

Replace `YOUR_RENDER_URL` with your actual Render deployment URL (e.g., `https://your-service-name.onrender.com`)

## 1. Health Check
```bash
curl -X GET YOUR_RENDER_URL/health
```

## 2. Authentication Service

### Register User
```bash
curl -X POST YOUR_RENDER_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "student"
  }'
```

### Login User
```bash
curl -X POST YOUR_RENDER_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### Check Authentication Status
```bash
curl -X GET YOUR_RENDER_URL/api/auth/check
```

### Update User Info
```bash
curl -X PUT YOUR_RENDER_URL/api/auth/update \
  -H "Content-Type: application/json" \
  -d '{
    "email": "updated@example.com"
  }'
```

### Logout User
```bash
curl -X POST YOUR_RENDER_URL/api/auth/logout
```

## 3. Analytics Service

### Log Emotion Data
```bash
curl -X POST YOUR_RENDER_URL/api/logs/emotion \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "stu123",
    "emotion": "happy",
    "attention": 85,
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

## 4. Notification Service

### Send Email Notification
```bash
curl -X POST YOUR_RENDER_URL/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email from API Gateway",
    "message": "This is a test email sent through the Nginx proxy gateway."
  }'
```

## 5. Video Service

### List All Videos
```bash
curl -X GET YOUR_RENDER_URL/api/videos
```

### Upload Video
```bash
# Create a test file first
echo "This is a test video file content" > test_video.txt

# Upload the file
curl -X POST YOUR_RENDER_URL/api/upload \
  -F "video=@test_video.txt" \
  -F "title=Test Video" \
  -F "description=Test video uploaded via API gateway"
```

### Like a Video (replace VIDEO_ID with actual ID)
```bash
curl -X PATCH YOUR_RENDER_URL/api/videos/VIDEO_ID/like
```

### Add Video View (replace VIDEO_ID with actual ID)
```bash
curl -X PATCH YOUR_RENDER_URL/api/videos/VIDEO_ID/view
```

## 6. Emotion Detection Service

### Detect Emotion from Image
```bash
# Create a simple test image (1x1 pixel PNG)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGAWA0evQAAAABJRU5ErkJggg==" | base64 -d > test_image.png

# Send image for emotion detection
curl -X POST YOUR_RENDER_URL/api/emotion-service \
  -F "image=@test_image.png"
```

## 7. CORS Test

### Test CORS Preflight
```bash
curl -X OPTIONS YOUR_RENDER_URL/api/auth/login \
  -H "Origin: http://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

## Quick Test Script

Save this as `test-deployed-api.sh`:

```bash
#!/bin/bash

# Replace with your Render URL
RENDER_URL="YOUR_RENDER_URL"

echo "Testing deployed API gateway at: $RENDER_URL"

# Health check
echo "1. Health Check:"
curl -s $RENDER_URL/health | head -c 200
echo -e "\n"

# Auth register
echo "2. Register User:"
curl -s -X POST $RENDER_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","role":"student"}' | head -c 200
echo -e "\n"

# List videos
echo "3. List Videos:"
curl -s $RENDER_URL/api/videos | head -c 200
echo -e "\n"

# Log emotion
echo "4. Log Emotion:"
curl -s -X POST $RENDER_URL/api/logs/emotion \
  -H "Content-Type: application/json" \
  -d '{"studentId":"stu123","emotion":"happy","attention":85}' | head -c 200
echo -e "\n"

echo "Test completed!"
```

Make it executable:
```bash
chmod +x test-deployed-api.sh
```

Run it:
```bash
./test-deployed-api.sh
```