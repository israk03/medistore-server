import express from 'express';
import { register, login, getMe, updateProfile } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { googleLogin } from "./auth.controller";


const router = express.Router();

router.post('/register', register);
router.post("/google", googleLogin);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);

export const AuthRoutes = router;
