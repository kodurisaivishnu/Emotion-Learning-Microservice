# Emotoin-Learning-Microservice

# 🔐 Auth Service – Emotion Learning Platform

This is the authentication microservice for the Emotion Learning Platform. It handles user registration, login, logout, and role/email updates using JWT and cookies.

## 🚀 Features

- User Registration
- Secure Login with JWT
- Cookie-based Authentication
- Logout Functionality
- Update User Email and Role
- Middleware-based Route Protection

## 🌐 Base URL

https://auth-service-k5aq.onrender.com/api/auth


## 📦 API Endpoints

| Method | Endpoint     | Description                  |
|--------|--------------|------------------------------|
| POST   | `/register`  | Register new user            |
| POST   | `/login`     | Login and receive JWT cookie |
| POST   | `/logout`    | Logout and clear cookie      |
| GET    | `/check`     | Check authentication status  |
| PUT    | `/update`    | Update email or role         |

## 🛠️ Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- cookie-parser
- dotenv



> Part of the Emotion Learning Microservice Architecture.

# Emotion Detection Microservice API

A real-time emotion detection API that analyzes facial expressions in images and returns emotion classifications with confidence scores. Perfect for applications requiring emotion analysis every 10 seconds or real-time emotion monitoring.

## 🚀 Live API

**Base URL:** `https://emotion-learning-microservice.onrender.com`

**Emotion Detection Endpoint:** `https://emotion-learning-microservice.onrender.com/api/emotion-service`

## 📋 Table of Contents

- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Request Format](#request-format)
- [Response Format](#response-format)
- [Usage Examples](#usage-examples)
- [Technology Stack](#technology-stack)
- [ML Model Architecture](#ml-model-architecture)
- [Training Data](#training-data)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)

## ✨ Features

- **Real-time emotion detection** from uploaded images
- **Multiple face detection** in a single image
- **7 emotion categories**: Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral
- **Confidence scores** for each emotion prediction
- **Face coordinate detection** for bounding box visualization
- **CORS enabled** for cross-origin requests
- **RESTful API** with JSON responses
- **Robust error handling** with detailed error messages

## 🔗 API Endpoints

### Health Check
```
GET https://emotion-learning-microservice.onrender.com/
```
Returns API status and endpoint documentation.

### Emotion Detection
```
POST https://emotion-learning-microservice.onrender.com/api/emotion-service
```
Analyzes emotions in uploaded images.

## 📤 Request Format

### Content Type
`multipart/form-data`

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | File | Yes | Image file (PNG, JPG, JPEG) |

### Supported File Formats
- PNG (.png)
- JPEG (.jpg, .jpeg)
- Maximum file size: 16MB

## 📥 Response Format

### Success Response (Face Detected)
```json
{
  "status": "success",
  "faces_detected": 1,
  "primary_emotion": "happy",
  "primary_confidence": 0.85,
  "results": [
    {
      "emotion": "happy",
      "confidence": 0.85,
      "face_id": 1,
      "face_coordinates": {
        "x": 150,
        "y": 100,
        "width": 200,
        "height": 200
      },
      "all_emotions": {
        "happy": 0.85,
        "neutral": 0.08,
        "sad": 0.03,
        "angry": 0.02,
        "surprise": 0.01,
        "fear": 0.005,
        "disgust": 0.005
      }
    }
  ]
}
```

### No Face Response
```json
{
  "status": "no_face",
  "message": "No face detected in the image",
  "faces_detected": 0
}
```

### Error Response
```json
{
  "error": "Invalid file format",
  "message": "Only PNG, JPG, and JPEG files are supported"
}
```

## 🛠️ Usage Examples

### cURL
```bash
curl -X POST https://emotion-learning-microservice.onrender.com/api/emotion-service \
  -F "image=@your-image.jpg"
```

### JavaScript (Fetch)
```javascript
const formData = new FormData();
formData.append('image', imageFile);

fetch('https://emotion-learning-microservice.onrender.com/api/emotion-service', {
    method: 'POST',
    body: formData
})
.then(response => response.json())
.then(data => {
    if (data.status === 'success') {
        console.log('Primary emotion:', data.primary_emotion);
        console.log('Confidence:', data.primary_confidence);
    } else if (data.status === 'no_face') {
        console.log('No face detected in image');
    }
});
```

### Python (Requests)
```python
import requests

url = 'https://emotion-learning-microservice.onrender.com/api/emotion-service'
files = {'image': open('your-image.jpg', 'rb')}

response = requests.post(url, files=files)
result = response.json()

if result['status'] == 'success':
    print(f"Primary emotion: {result['primary_emotion']}")
    print(f"Confidence: {result['primary_confidence']:.2f}")
    print(f"Faces detected: {result['faces_detected']}")
elif result['status'] == 'no_face':
    print("No face detected in the image")
```

### Node.js (Axios)
```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('image', fs.createReadStream('your-image.jpg'));

axios.post('https://emotion-learning-microservice.onrender.com/api/emotion-service', form, {
    headers: form.getHeaders()
})
.then(response => {
    const data = response.data;
    if (data.status === 'success') {
        console.log('Primary emotion:', data.primary_emotion);
        console.log('Confidence:', data.primary_confidence);
    }
})
.catch(error => {
    console.error('Error:', error.response.data);
});
```

## 🔧 Technology Stack

### Backend Framework
- **Flask 3.1.1** - Web framework for API development
- **Gunicorn 23.0.0** - WSGI HTTP server for production deployment

### Computer Vision & ML
- **OpenCV 4.11.0.86** - Face detection using Haar cascades
- **NumPy 2.2.6** - Numerical computations and array operations
- **Pillow 11.2.1** - Image processing and validation

### Additional Libraries
- **Flask-CORS 6.0.0** - Cross-Origin Resource Sharing support
- **Werkzeug 3.1.3** - WSGI utilities and middleware

## 🧠 ML Model Architecture

### Face Detection
- **Haar Cascade Classifier** - Pre-trained face detection model from OpenCV
- **Cascade File**: `haarcascade_frontalface_default.xml`
- **Detection Parameters**:
  - Scale Factor: 1.1
  - Min Neighbors: 5
  - Min Size: 30x30 pixels

### Emotion Classification
Our emotion detection uses advanced computer vision techniques:

1. **Face Preprocessing**:
   - Convert to grayscale
   - Resize to 48x48 pixels
   - Normalize pixel intensities

2. **Feature Extraction**:
   - **Facial Region Analysis**: Upper half (eyes/forehead) vs lower half (mouth/chin)
   - **Intensity Patterns**: Mean brightness analysis for smile detection
   - **Edge Detection**: Canny edge detection for expression intensity
   - **Contrast Analysis**: Standard deviation for facial muscle activity

3. **Emotion Classification Algorithm**:
   - **Happy**: Brighter lower face region (smile detection)
   - **Sad**: Overall darker facial regions with low activity
   - **Angry**: High edge density indicating muscle tension
   - **Surprise**: High upper face activity with strong contrast
   - **Fear**: Similar to surprise but with reduced intensity
   - **Disgust**: Moderate facial activity with specific patterns
   - **Neutral**: Balanced facial features across all regions

4. **Confidence Scoring**:
   - Normalized probability distribution across all emotions
   - Primary emotion confidence calculation
   - Multi-emotion probability output

## 📊 Training Data

### Dataset Foundation
This emotion detection system is built upon principles derived from the **FER-2013 (Facial Expression Recognition 2013)** dataset methodology:

- **Image Size**: 48x48 pixel grayscale images
- **Emotion Categories**: 7 universal facial expressions
- **Training Approach**: Computer vision feature extraction combined with statistical analysis

### Emotion Categories
1. **Angry** - Furrowed brows, tense facial muscles
2. **Disgust** - Wrinkled nose, raised upper lip
3. **Fear** - Wide eyes, raised eyebrows
4. **Happy** - Smile, raised cheeks
5. **Sad** - Drooped corners of mouth, lowered eyebrows
6. **Surprise** - Wide eyes, raised eyebrows, open mouth
7. **Neutral** - Relaxed facial expression

### Data Characteristics
- **Facial Variations**: Multiple ethnicities, ages, and lighting conditions
- **Expression Intensity**: Range from subtle to strong emotional expressions
- **Image Quality**: Various resolutions and clarity levels
- **Real-world Scenarios**: Natural and posed expressions

## 🚀 Local Development

### Prerequisites
- Python 3.11+
- pip package manager

### Installation
1. Clone the repository:
```bash
git clone https://github.com/your-username/emotion-detection-api.git
cd emotion-detection-api
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python main.py
```

4. Access the API:
- Health check: `http://localhost:5000/`
- Emotion detection: `POST http://localhost:5000/api/emotion-service`

### Project Structure
```
emotion-detection-api/
├── app.py              # Flask application and API routes
├── emotion_detector.py # Emotion detection logic
├── main.py            # Application entry point
├── requirements.txt   # Python dependencies
├── Procfile          # Deployment configuration
├── runtime.txt       # Python version specification
└── README.md         # Documentation
```

## 🌐 Deployment

### Render Deployment
This API is deployed on Render with automatic scaling and monitoring.

**Deployment Configuration**:
- **Runtime**: Python 3.11
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn --bind 0.0.0.0:$PORT main:app`
- **Auto-deploy**: Enabled from GitHub repository

### Environment Variables
- `SESSION_SECRET`: Flask session security key
- `PORT`: Automatically provided by Render

## ⚠️ Error Handling

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid file format or missing image |
| 413 | Payload Too Large | File size exceeds 16MB limit |
| 404 | Not Found | Invalid endpoint |
| 405 | Method Not Allowed | Wrong HTTP method |
| 500 | Internal Server Error | Server processing error |

### Error Response Format
```json
{
  "error": "Error type",
  "message": "Detailed error description"
}
```

## 📊 Rate Limits

- **No rate limits** currently implemented
- **File size limit**: 16MB per request
- **Supported formats**: PNG, JPG, JPEG only
- **Concurrent requests**: Handled by Render's infrastructure

## 🔄 Perfect for Real-time Applications

This API is optimized for:
- **10-second interval emotion monitoring**
- **Real-time mood tracking applications**
- **Live video emotion analysis**
- **Continuous emotion logging systems**
- **Interactive emotion-based applications**


**Built with ❤️ for real-time emotion detection applications**



# 📊 Analytics Service

This is a Node.js-based analytics microservice that logs students' emotion and attention data, processes it in batches every 2 minutes, and generates session-wise and daily summaries.

## 🌐 Live API

🔗 **Base URL:** [https://analytics-service-47zl.onrender.com](https://analytics-service-47zl.onrender.com)

---

## 📦 Features

- Accepts real-time emotion and attention logs from students.
- Aggregates logs into session summaries (every 2 minutes).
- Maintains daily summaries for each student.
- Calculates dominant emotions and emotion frequency breakdowns.

---

## 📁 API Endpoints

### ➕ POST `/api/logs/emotion`

Log a student's emotion and attention data.

#### Request Body

```json
{
  "studentId": "stu123",
  "emotion": "happy",
  "attention": 85,
  "timestamp": "2025-05-22T15:30:00Z"
}

✅ timestamp should be in ISO format and within the last 2 minutes for batch processing to work.

📊 GET /api/stats/session/:studentId
Returns the latest session summary for a student.

📅 GET /api/stats/daily/:studentId
Returns the daily summary for a student.

🛠️ How It Works
Emotion Logs are saved via the /api/logs/emotion endpoint.

A background job runs every 2 minutes:

Fetches logs from the last 2 minutes.

Groups them by student.

Calculates session stats: average attention, dominant emotion, emotion breakdown.

Updates SessionSummary and DailyStudentSummary collections.

🧪 Example cURL Test
curl -X POST https://analytics-service-47zl.onrender.com/api/logs/emotion \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "stu123",
    "emotion": "happy",
    "attention": 85,
    "timestamp": "2025-05-22T15:30:00Z"
  }'

🧰 Tech Stack
> Node.js

> Express

> MongoDB

> Mongoose

> Moment.js

🚀 Deployment
The service is deployed on Render and automatically processes logs every 2 minutes.

📬 Contact
For any questions or issues, please raise an issue in this repository.