import express from 'express';
import { register, login,logout,checkAuth } from '../controllers/authController.js';
import { verifyAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/check',verifyAuth,checkAuth);

export default router;
