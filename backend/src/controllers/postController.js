const { Post, User } = require('../models/db');
const { v4: uuidv4 } = require('uuid');

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
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error while fetching posts' });
  }
};

module.exports = {
  createPost,
  getPosts
};
