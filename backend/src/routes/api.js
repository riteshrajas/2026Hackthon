const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const actionController = require('../controllers/actionController');
const leaderboardController = require('../controllers/leaderboardController');
const aiController = require('../controllers/aiController');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { protect } = require('../utils/authMiddleware');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Post Routes
router.get('/posts', protect, postController.getPosts);
router.post('/posts', protect, postController.createPost);
router.get('/posts/:postId/comments', protect, commentController.getComments);
router.post('/posts/:postId/comments', protect, commentController.createComment);
router.delete('/posts/:postId/comments/:commentId', protect, commentController.deleteComment);
router.post('/posts/:postId/comments/:commentId/like', protect, commentController.toggleLikeComment);

// User Routes
router.post('/user/create', userController.createUser);
router.get('/user/:id', protect, userController.getUser);

// Action Log Route
router.post('/action/log', protect, actionController.logAction);

// Leaderboard Routes
router.get('/leaderboard/:type/:id', protect, leaderboardController.getLeaderboard);

// AI Suggestions
router.post('/ai/suggest', protect, aiController.suggest);

module.exports = router;
