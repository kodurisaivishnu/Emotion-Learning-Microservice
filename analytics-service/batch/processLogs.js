
// import EmotionLog from '../models/EmotionLog.js';
// import SessionSummary from '../models/SessionSummary.js';
// import DailyStudentSummary from '../models/DailyStudentSummary.js';
// import { getDominantEmotion, getEmotionBreakdown } from '../utils/emotionUtils.js';
// import moment from 'moment';

// export const processBatchLogs = async () => {
//   console.log("📦 Batch processing started...");

//   const since = new Date(Date.now() - 2 * 60 * 1000); // last 2 minutes
//   const logs = await EmotionLog.find({ timestamp: { $gte: since } });

//   if (!logs.length) {
//     console.log("⚠️ No logs found in the last 2 minutes.");
//     return;
//   }

//   const grouped = {};
//   for (let log of logs) {
//     if (!grouped[log.studentId]) grouped[log.studentId] = [];
//     grouped[log.studentId].push(log);
//   }

//   for (let [studentId, studentLogs] of Object.entries(grouped)) {
//     const avgAttention = studentLogs.reduce((sum, l) => sum + l.attention, 0) / studentLogs.length;
//     const domEmotion = getDominantEmotion(studentLogs);
//     const breakdown = getEmotionBreakdown(studentLogs);

//     const session = new SessionSummary({
//       studentId,
//       sessionId: `s_${Date.now()}`,
//       startTime: studentLogs[0].timestamp,
//       endTime: studentLogs[studentLogs.length - 1].timestamp,
//       averageAttention: avgAttention,
//       dominantEmotion: domEmotion,
//       emotionBreakdown: breakdown,
//     });

//     await session.save();

//     const day = moment().format('YYYY-MM-DD');
//     const duration = (new Date(session.endTime) - new Date(session.startTime)) / 1000;

//     const existing = await DailyStudentSummary.findOne({ studentId, date: day });

//     if (existing) {
//       const totalTime = existing.totalEngagementTime + duration;
//       const avg = (existing.averageAttention * existing.totalSessions + avgAttention) / (existing.totalSessions + 1);
//       const updated = {
//         totalSessions: existing.totalSessions + 1,
//         totalEngagementTime: totalTime,
//         averageAttention: avg,
//         dominantEmotion: domEmotion,
//       };
//       await DailyStudentSummary.updateOne({ studentId, date: day }, { $set: updated });
//     } else {
//       await DailyStudentSummary.create({
//         studentId,
//         date: day,
//         totalSessions: 1,
//         totalEngagementTime: duration,
//         averageAttention: avgAttention,
//         dominantEmotion: domEmotion,
//       });
//     }
//   }

//   console.log("✅ Batch processing completed.");
// };



import EmotionLog from '../models/EmotionLog.js';
import SessionSummary from '../models/SessionSummary.js';
import DailyStudentSummary from '../models/DailyStudentSummary.js';
import { getDominantEmotion, getEmotionBreakdown } from '../utils/emotionUtils.js';
import moment from 'moment';

export const processBatchLogs = async () => {
  console.log("📦 Batch processing started...");

  const since = new Date(Date.now() - 2 * 60 * 1000);
  const logs = await EmotionLog.find({ timestamp: { $gte: since } });

  if (!logs.length) {
    console.log("⚠️ No logs found in the last 2 minutes.");
    return;
  }

  const grouped = {};
  for (let log of logs) {
    if (!grouped[log.studentId]) grouped[log.studentId] = [];
    grouped[log.studentId].push(log);
  }

  for (let [studentId, studentLogs] of Object.entries(grouped)) {
    const avgAttention = studentLogs.reduce((sum, l) => sum + l.attention, 0) / studentLogs.length;
    const breakdown = getEmotionBreakdown(studentLogs);
    const domEmotion = getDominantEmotion(studentLogs);

    const session = new SessionSummary({
      studentId,
      sessionId: `s_${Date.now()}`,
      startTime: studentLogs[0].timestamp,
      endTime: studentLogs[studentLogs.length - 1].timestamp,
      averageAttention: avgAttention,
      dominantEmotion: domEmotion,
      emotionBreakdown: breakdown,
    });
    await session.save();

    const day = moment().format('YYYY-MM-DD');
    const duration = (new Date(session.endTime) - new Date(session.startTime)) / 1000;

    const existing = await DailyStudentSummary.findOne({ studentId, date: day });

    if (existing) {
      const totalTime = existing.totalEngagementTime + duration;
      const avg = (existing.averageAttention * existing.totalSessions + avgAttention) / (existing.totalSessions + 1);

      // Merge emotion breakdowns
      const updatedBreakdown = { ...existing.emotionBreakdown };
      for (const [emotion, count] of Object.entries(breakdown)) {
        updatedBreakdown[emotion] = (updatedBreakdown[emotion] || 0) + count;
      }

      const updated = {
        totalSessions: existing.totalSessions + 1,
        totalEngagementTime: totalTime,
        averageAttention: avg,
        dominantEmotion: domEmotion,
        emotionBreakdown: updatedBreakdown,
      };

      await DailyStudentSummary.updateOne({ studentId, date: day }, { $set: updated });
    } else {
      await DailyStudentSummary.create({
        studentId,
        date: day,
        totalSessions: 1,
        totalEngagementTime: duration,
        averageAttention: avgAttention,
        dominantEmotion: domEmotion,
        emotionBreakdown: breakdown,
      });
    }
  }

  console.log("✅ Batch processing completed.");
};
