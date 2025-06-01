import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  cloudinaryUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  title: { type: String, required: true },
  topic: { type: String, required: true },
  type: { type: String, required: true },

  uploadedBy: {
    email: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['teacher'], required: true }
  },

  duration: { type: Number }, // in seconds
  thumbnailUrl: { type: String },
  tags: [String],

  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.model('Video', videoSchema);
export default Video;
