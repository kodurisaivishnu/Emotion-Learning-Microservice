import express from 'express';
import SessionSummary from '../models/SessionSummary.js';
import DailyStudentSummary from '../models/DailyStudentSummary.js';

const router = express.Router();

// Get report for a student
router.get('/report/:id', async (req, res) => {
  const studentId = req.params.id;

  try {
    const sessions = await SessionSummary.find({ studentId }).sort({ startTime: -1 }).limit(20);
    const dailySummaries = await DailyStudentSummary.find({ studentId }).sort({ date: -1 }).limit(7);

    res.send({
      studentId,
      recentSessions: sessions,
      recentDailyStats: dailySummaries
    });
  } catch (err) {
    console.error('❌ Error in /report/:id', err);
    res.status(500).send({ error: 'Could not fetch report' });
  }
});

export default router;