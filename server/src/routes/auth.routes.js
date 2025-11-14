import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import validateRequest from '../middlewares/validateRequest.js';
import { registerSchema, loginSchema } from '../validators/auth.validators.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticate, getProfile);

export default router;

