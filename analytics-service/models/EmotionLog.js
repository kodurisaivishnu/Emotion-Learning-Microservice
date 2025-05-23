import mongoose from 'mongoose';

const EmotionLogSchema = new mongoose.Schema({
  studentId: String,
  emotion: String,
  attention: Number,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('EmotionLog', EmotionLogSchema);