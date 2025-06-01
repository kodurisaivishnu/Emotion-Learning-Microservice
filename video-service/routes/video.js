import express from 'express';
import multer from 'multer';
import { handleUpload, likeVideo, listVideos, viewVideo } from '../controllers/videoController.js';

const router = express.Router();

// Use local disk to temporarily store the video before uploading to Cloudinary
const storage = multer.diskStorage({
  destination: 'uploads/', // temporary
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Routes
router.post('/upload', upload.single('video'), handleUpload);
router.get('/videos', listVideos); //todo:elastic-search
router.patch('/videos/:id/like', likeVideo);   // Like video
router.patch('/videos/:id/view', viewVideo);   // Count view

export default router;
