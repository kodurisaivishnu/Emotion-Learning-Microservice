import express from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import { updateUser } from '../controllers/userController.js';

const router = express.Router();

router.put('/update', verifyAuth, updateUser);

export default router;