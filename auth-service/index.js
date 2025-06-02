import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

dotenv.config();
const app = express();
connectDB();

// ✅ Cookie parser
app.use(cookieParser());

// ✅ CORS config that supports credentials
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin); // Accept all origins (or restrict with whitelist)
  },
  credentials: true
}));

// ✅ Body parser
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
