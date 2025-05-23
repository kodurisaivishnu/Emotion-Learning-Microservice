// import express from 'express';
// import EmotionLog from '../models/EmotionLog.js';

// const router = express.Router();

// router.post('/log-emotion', async (req, res) => {
//   const { studentId, emotion, attention, timestamp } = req.body;
//   try {
//     await EmotionLog.create({ studentId, emotion, attention, timestamp });
//     res.status(201).send({ status: 'Logged' });
//   } catch (err) {
//     res.status(500).send({ error: 'Failed to log' });
//   }
// });

// export default router;


import express from 'express';
import EmotionLog from '../models/EmotionLog.js';

const router = express.Router();

router.post('/emotion', async (req, res) => {
  try {
    const { studentId, emotion, attention, timestamp } = req.body;

    const log = new EmotionLog({
      studentId,
      emotion,
      attention,
      timestamp: timestamp ? new Date(timestamp) : new Date()  // Use now if not sent
    });

    await log.save();
    res.status(201).json({ message: 'Log saved successfully' });
  } catch (err) {
    console.error('Error saving emotion log:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
