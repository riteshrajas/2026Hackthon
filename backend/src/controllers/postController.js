const { Post, User, ActionLog } = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const { curateFeedWithGemini } = require('../services/geminiService');

const createPost = async (req, res) => {
  try {
    const { content, image_url, type } = req.body;
    const userId = req.userAuth?.user_id || req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authorized, user missing' });
    }

    const user = req.user || await User.findOne({ user_id: userId });
    if (!user) return res.status(401).json({ error: 'Not authorized, user not found' });

    const newPost = new Post({
      post_id: uuidv4(),
      user_id: userId,
      user_name: user.name,
      user_profile_picture: user.profile_picture || '',
      content,
      image_url: image_url || '',
      type: type || 'ECO-WIN',
      timestamp: new Date()
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error while creating post' });
  }
};

const getPosts = async (req, res) => {
  try {
    const county = typeof req.query.county === 'string' ? req.query.county.trim() : '';

    if (county) {
      const users = await User.find({ neighborhood_tag: county }).select('user_id').lean();
      const userIds = users.map((user) => user.user_id);

      if (userIds.length === 0) {
        return res.json([]);
      }

      let posts = await Post.find({ user_id: { $in: userIds } })
        .sort({ timestamp: -1 })
        .limit(20)
        .lean();

      if (req.userAuth && req.userAuth.user_id) {
        const currentUser = await User.findOne({ user_id: req.userAuth.user_id });
        if (currentUser) {
          const recentActions = await ActionLog.find({ user_id: currentUser.user_id })
            .sort({ timestamp: -1 })
            .limit(10)
            .lean();
          posts = await curateFeedWithGemini(currentUser, recentActions, posts);
        }
      }

      return res.json(posts);
    }

    let posts = await Post.find().sort({ timestamp: -1 }).limit(20).lean();
    
    if (req.userAuth && req.userAuth.user_id) {
      const currentUser = await User.findOne({ user_id: req.userAuth.user_id });
      if (currentUser) {
        const recentActions = await ActionLog.find({ user_id: currentUser.user_id })
          .sort({ timestamp: -1 })
          .limit(10)
          .lean();
        posts = await curateFeedWithGemini(currentUser, recentActions, posts);
      }
    }

    return res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error while fetching posts' });
  }
};

module.exports = {
  createPost,
  getPosts
};
