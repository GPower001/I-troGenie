import express from 'express';
import register from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/authmiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, authController.logout);
// Other protected routes...

export default router;