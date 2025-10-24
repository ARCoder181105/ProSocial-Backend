import express from 'express';
import {
  createPost,
  getAllPosts,
  getPost,
  getUserPosts,
  getPostsByUserId,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  incrementViews,
  searchPosts,
  getPopularPosts,
  getPostsByTag,
  getAllTags,
  toggleFeatured,
  getPostBySlug
} from '../controllers/post.controllers.js';
import { authenticateJWT } from '../middlewares/auth.middlewares.js';
import { isAdmin } from '../middlewares/admin.middlewares.js';

const router = express.Router();

// Public routes
router.get('/allPost', getAllPosts);
router.get('/search', searchPosts);
router.get('/popular', getPopularPosts);
router.get('/tags', getAllTags);
router.get('/tag/:tag', getPostsByTag);
router.get('/slug/:slug', getPostBySlug);

// Protected routes
router.get('/post/:id', authenticateJWT, getPost);
router.get('/user', authenticateJWT, getUserPosts);
router.get('/user/:userId', authenticateJWT, getPostsByUserId);

// Post management
router.post('/create-post', authenticateJWT, createPost);
router.put('/update-post/:id', authenticateJWT, updatePost);
router.delete('/delete-post/:id', authenticateJWT, deletePost);

// Interactions
router.post('/like/:id', authenticateJWT, likePost);
router.post('/comment/:id', authenticateJWT, addComment);
router.delete('/comment/:id/:commentId', authenticateJWT, deleteComment);
router.post('/view/:id', incrementViews); // This can be public

// Admin routes
router.patch('/featured/:id', authenticateJWT, isAdmin, toggleFeatured);

export default router;
