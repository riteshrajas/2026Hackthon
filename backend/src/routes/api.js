
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const actionController = require('../controllers/actionController');
const leaderboardController = require('../controllers/leaderboardController');
const aiController = require('../controllers/aiController');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const { protect } = require('../utils/authMiddleware');

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// User Routes
router.post('/user/create', userController.createUser); // Potentially deprecated by auth/register
router.get('/user/:id', protect, userController.getUser);
router.put('/user/:id', protect, userController.updateUser);

// Action Log Route
router.post('/action/log', protect, actionController.logAction);

// Leaderboard Routes
router.get('/leaderboard/:type/:id', protect, leaderboardController.getLeaderboard);

// Post Routes
router.post('/posts', protect, postController.createPost);
router.get('/posts', protect, postController.getFeed);

// AI Suggestions
router.post('/ai/suggest', protect, aiController.suggest);

module.exports = router;
