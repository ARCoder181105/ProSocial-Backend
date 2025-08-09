import express from 'express';
import { createPost, getAllPosts, getPost, getUserPosts, getPostsByUserId } from '../controllers/post.controllers.js'
import { authenticateJWT } from '../middlewares/auth.middlewares.js'

const router = express.Router();

router.get('/post/:id', authenticateJWT, getPost);
router.get('/allPost', getAllPosts);
router.get('/user', authenticateJWT, getUserPosts);

router.get('/user/:userId', authenticateJWT, getPostsByUserId);
router.post('/create-post', authenticateJWT, createPost);

export default router;