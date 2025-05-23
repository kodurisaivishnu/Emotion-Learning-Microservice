import mongoose from 'mongoose';

const SessionSummarySchema = new mongoose.Schema({
  studentId: String,
  sessionId: String,
  startTime: Date,
  endTime: Date,
  averageAttention: Number,
  dominantEmotion: String,
  emotionBreakdown: Object,
});

export default mongoose.model('SessionSummary', SessionSummarySchema);