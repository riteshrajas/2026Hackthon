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
const disasterController = require('../controllers/disasterController');
const { protect } = require('../utils/authMiddleware');
const multer = require('multer');

// Multer config
const upload = multer({ storage: multer.memoryStorage() });

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
router.put('/user/:id', protect, upload.single('profile_picture'), userController.updateUser);
router.put('/user/:id/password', protect, userController.updatePassword);
router.delete('/user/:id', protect, userController.deleteUser);

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
router.get('/events/:eventId/signups', protect, eventController.listEventSignups);

// Community
router.get('/community/requests', protect, communityController.getPendingRequests);
router.post('/community/requests', protect, communityController.createRequest);
router.post('/community/requests/:requestId/respond', protect, communityController.respondToRequest);
router.get('/community/active', protect, communityController.getActiveNinjas);
router.get('/community/counties', protect, communityController.getCounties);

// Disaster Recovery
router.get('/disaster/alerts', protect, disasterController.getAlerts);
router.get('/disaster/geocode', protect, disasterController.geocodeLocation);
router.get('/disaster/updates', protect, disasterController.listUpdates);
router.post('/disaster/updates', protect, disasterController.createUpdate);

module.exports = router;
