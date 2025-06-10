// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';

// import connectDB from './config/db.js';
// import authRoutes from './routes/auth.js';
// import userRoutes from './routes/user.js';

// dotenv.config();
// const app = express();
// connectDB();

// // ✅ Cookie parser
// app.use(cookieParser());

// // ✅ CORS config that supports credentials
// app.use(cors({
//   origin: (origin, callback) => {
//     callback(null, origin); // Accept all origins (or restrict with whitelist)
//   },
//   credentials: true
// }));

// // ✅ Body parser
// app.use(express.json());

// // ✅ Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);

// // ✅ Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));


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

// ✅ Use cookie parser
app.use(cookieParser());

// ✅ Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',  // Vite default
  'http://localhost:3000',  // React default
  'http://127.0.0.1:5173',
  'http://your-production-frontend-domain.com'
];

// ✅ CORS setup
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
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
app.listen(PORT, () => console.log(`🚀 Auth service running on port ${PORT}`));
