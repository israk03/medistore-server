import express from 'express';
import { register, login, getMe } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

export const AuthRoutes = router;
