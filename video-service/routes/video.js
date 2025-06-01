

import express from 'express';
import multer from 'multer';
import { handleUpload, likeVideo, listVideos, viewVideo } from '../controllers/videoController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Accept both 'video' and 'thumbnail'
router.post(
  '/upload',
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  handleUpload
);

router.get('/videos', listVideos);
router.patch('/videos/:id/like', likeVideo);
router.patch('/videos/:id/view', viewVideo);

export default router;
