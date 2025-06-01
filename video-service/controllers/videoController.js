import Video from '../models/Video.js';
import { uploadVideoToCloudinary } from '../services/cloudinaryService.js';

export const handleUpload = async (req, res) => {
  const { email, name, role, videoType, topic, videoTitle, tags } = req.body;

  if (role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can upload videos' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded' });
  }

  try {
    const { url, publicId, duration } = await uploadVideoToCloudinary(req.file.path);

    const newVideo = new Video({
      cloudinaryUrl: url,
      publicId,
      title: videoTitle,
      topic,
      type: videoType,
      tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
      duration,
      uploadedBy: { email, name, role }
    });

    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
};

//further add elastic-search whih is optimized thing
export const listVideos = async (req, res) => {
  const { sortBy, order = 'desc', tag } = req.query;
  const sortFields = ['duration', 'likes', 'views'];

  const filter = {};
  if (tag) {
    filter.tags = { $in: [tag.toLowerCase()] };
  }

  const sort = {};
  if (sortBy && sortFields.includes(sortBy)) {
    sort[sortBy] = order === 'asc' ? 1 : -1;
  }

  try {
    const videos = await Video.find(filter).sort(sort);
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch videos', details: err.message });
  }
};

export const likeVideo = async (req, res) => {
  const { id } = req.params;
  try {
    const video = await Video.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.status(200).json({ message: 'Like added', video });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like video', details: err.message });
  }
};

//increing the video count
export const viewVideo = async (req, res) => {
  const { id } = req.params;
  try {
    const video = await Video.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.status(200).json({ message: 'View counted', video });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count view', details: err.message });
  }
};


