import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import logsRouter from './routes/logs.js';
import reportRouter from './routes/report.js';
import dotenv from 'dotenv';
import { processBatchLogs } from './batch/processLogs.js';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
await connectDB();

app.use('/api/logs', logsRouter);
app.use('/api/stats', reportRouter);

// Run batch processor every 2 min
setInterval(processBatchLogs, 2 * 60 * 1000);

app.listen(process.env.PORT, () =>
  console.log(`📊 Analytics service running on port ${process.env.PORT}`)
);
