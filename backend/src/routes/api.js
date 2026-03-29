const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const actionController = require('../controllers/actionController');
const leaderboardController = require('../controllers/leaderboardController');
const aiController = require('../controllers/aiController');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const eventController = require('../controllers/eventController');
const communityController = require('../controllers/communityController');
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
router.get('/action/history', protect, actionController.getActionHistory);
router.get('/action/daily', protect, actionController.getDaily);
router.post('/action/daily/expand', protect, actionController.expandDaily);
router.post('/action/daily/complete', protect, actionController.completeDaily);

// Leaderboard Routes
router.get('/leaderboard/:type/:id', protect, leaderboardController.getLeaderboard);

// AI Suggestions
router.post('/ai/suggest', protect, aiController.suggest);

// Events
router.get('/events', protect, eventController.listEvents);
router.post('/events', protect, eventController.createEvent);
router.post('/events/:eventId/signup', protect, eventController.signupEvent);

// Community
router.get('/community/requests', protect, communityController.getPendingRequests);
router.post('/community/requests', protect, communityController.createRequest);
router.post('/community/requests/:requestId/respond', protect, communityController.respondToRequest);
router.get('/community/active', protect, communityController.getActiveNinjas);

module.exports = router;
