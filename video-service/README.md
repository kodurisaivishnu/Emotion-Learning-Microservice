# 🎥 Video Service - Emotion-Aware Learning Platform

This microservice is responsible for managing lecture video uploads, metadata storage, and retrieval within the **Emotion-Aware Learning Platform**. It allows teachers to upload videos, automatically stores them on **Cloudinary**, and saves metadata in **MongoDB Atlas**. The service also exposes APIs to list, filter, and sort videos, and track engagement through **views and likes**.

---

## 🌍 Live Deployment

🔗 **Base URL:**  
[https://video-service-w4ir.onrender.com](https://video-service-w4ir.onrender.com)

---

## 🧠 Use Case

This service supports an intelligent learning platform that tailors educational content based on **student engagement and emotion tracking**. It enables:

- Teachers to upload educational videos.
- The platform to filter/sort videos by popularity or duration.
- Tracking student interest through video views and likes.

---

## 🛠️ Tech Stack

| Component        | Technology       | Purpose                                 |
|------------------|------------------|-----------------------------------------|
| Runtime          | Node.js          | JavaScript runtime environment          |
| Server Framework | Express.js       | API routing and middleware handling     |
| Database         | MongoDB Atlas    | Stores video metadata                   |
| ORM              | Mongoose         | MongoDB schema modeling                 |
| File Upload      | Multer           | Handles incoming video file uploads     |
| Cloud Storage    | Cloudinary       | Stores video files and metadata         |
| Deployment       | Render.com       | Cloud hosting for backend               |
| Containerization | Docker           | Makes service portable and deployable   |

---

## 📦 Features

- ✅ Secure teacher-only video uploads
- ✅ Auto video duration extraction
- ✅ Upload to Cloudinary + metadata saved in MongoDB
- ✅ Video listing with filter/sort by views, likes, or duration
- ✅ Like and view tracking APIs

---

## 🔐 Environment Variables

The following environment variables are used in the service:

```env
PORT=6000
MONGODB_URI=mongodb+srv://kodurisaivishnu:0jfqSFHbqvIFRP8j@emotion-learning-platfo.dwfkusf.mongodb.net/emotionDB?retryWrites=true&w=majority&appName=Emotion-Learning-Platform
CLOUDINARY_CLOUD_NAME=dc8klavwd
CLOUDINARY_API_KEY=314556432849196
CLOUDINARY_API_SECRET=4ieY73u5hJFidcOIDjUmmc8yJGU
```

---

## 📊 Video Metadata Example (Stored in MongoDB)

```json
{
  "_id": "66591ae94a450cc7361d39b7",
  "videoUrl": "https://res.cloudinary.com/dc8klavwd/video/upload/v1717077223/videoServiceUploads/abc123.mp4",
  "videoTitle": "Intro to Trees",
  "topic": "React Basics",
  "videoType": "Frontend",
  "tags": ["dsa", "tree", "dfs", "bfs"],
  "duration": 215,
  "views": 0,
  "likes": 0,
  "email": "teacher1@example.com",
  "createdAt": "2025-06-01T10:00:00.000Z"
}
```

---

## 🚀 API Endpoints

### 1. 📤 Upload Video

**Endpoint:** `POST /api/upload`  
**Access:** Teachers only

#### Form Data Parameters

| Field        | Type     | Description               |
|--------------|----------|---------------------------|
| `video`      | File     | MP4 video file            |
| `email`      | String   | Uploader’s email          |
| `role`       | String   | Must be `"teacher"`       |
| `videoTitle` | String   | Title of the video        |
| `topic`      | String   | Subject or topic name     |
| `videoType`  | String   | Category (e.g., Frontend) |
| `tags`       | String   | Comma-separated tags      |

#### Sample cURL:

```bash
curl -X POST https://video-service-w4ir.onrender.com/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "video=@\"/path/to/video.mp4\"" \
  -F "email=teacher1@example.com" \
  -F "role=teacher" \
  -F "videoTitle=Intro to Trees" \
  -F "topic=React Basics" \
  -F "videoType=Frontend" \
  -F "tags=dsa,tree,dfs,bfs"
```

---

### 2. 📺 List All Videos

**Endpoint:** `GET /api/videos`

#### Query Parameters (optional)

| Parameter | Values                  | Description                              |
|-----------|-------------------------|------------------------------------------|
| `sortBy`  | views, likes, duration  | Sort field                               |
| `order`   | asc, desc               | Sorting order (default: `desc`)          |
| `tag`     | any tag                 | Filter by specific tag                   |

#### Examples

- List by views (descending):  
  `GET /api/videos?sortBy=views`

- List by duration (ascending) for tag `react`:  
  `GET /api/videos?sortBy=duration&order=asc&tag=react`

---

### 3. 👍 Like a Video

**Endpoint:** `PATCH /api/videos/:id/like`  
**Description:** Increments the like count of a specific video.

#### Sample cURL:

```bash
curl -X PATCH https://video-service-w4ir.onrender.com/api/videos/<VIDEO_ID>/like
```

---

### 4. 👁️ Add a View

**Endpoint:** `PATCH /api/videos/:id/view`  
**Description:** Increments the view count of a specific video.

#### Sample cURL:

```bash
curl -X PATCH https://video-service-w4ir.onrender.com/api/videos/<VIDEO_ID>/view
```

---

## 📁 Project Structure

```
video-service/
├── index.js
├── Dockerfile
├── .env
├── uploads/
├── models/
│   └── Video.js
├── controllers/
│   └── videoController.js
├── routes/
│   └── video.js
├── services/
│   └── cloudinaryService.js
```

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 6000
CMD ["node", "index.js"]
```

### Docker Compose (Optional)

```yaml
version: '3.9'
services:
  video-service:
    build: .
    ports:
      - "6000:6000"
    environment:
      - PORT=6000
      - MONGODB_URI=your_mongo_uri
      - CLOUDINARY_CLOUD_NAME=your_cloud_name
      - CLOUDINARY_API_KEY=your_api_key
      - CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📚 Future Improvements

- ✅ Add authentication middleware
- ✅ Add pagination for video listing
- ✅ Allow comments on videos
- ✅ Generate video thumbnails

---

## 👨‍💻 Author

**Koduri Sai Vishnu**  
_BTech CSE, Passionate about full-stack and intelligent systems_  
📧 [kodurisaivishnu@gmail.com](mailto:kodurisaivishnu@gmail.com)

---

> 🧩 This microservice is part of a larger **Emotion-Aware Learning Platform**.
