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
const multer = require('multer');
const path = require('path');

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Auth Routes
router.post('/auth/register', upload.single('profile_picture'), authController.register);
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
