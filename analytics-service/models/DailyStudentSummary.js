import mongoose from 'mongoose';

const DailyStudentSummarySchema = new mongoose.Schema({
  studentId: String,
  date: String,
  totalSessions: Number,
  totalEngagementTime: Number,
  averageAttention: Number,
  dominantEmotion: String,
  emotionBreakdown: Object,
});

export default mongoose.model('DailyStudentSummary', DailyStudentSummarySchema);
