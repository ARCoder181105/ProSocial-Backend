import express from 'express'
import { getProfile, login, logout, signup, updateAbout,getUserProfile } from '../controllers/user.controllers';
import { authenticateJWT } from '../middlewares/auth.middlewares.js'

const router = express.Router();
router.get('/profile', authenticateJWT, getProfile);
router.get('/:userId', authenticateJWT,getUserProfile);

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', authenticateJWT, logout)
router.put('/about', authenticateJWT, updateAbout)


export default router;