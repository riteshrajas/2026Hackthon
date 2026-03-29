const { Post, User } = require('../models/db');
const { v4: uuidv4 } = require('uuid');

const createPost = async (req, res) => {
  const user_id = req.userAuth?.user_id || req.body.user_id;
  const { text, image_url } = req.body;

  if (!user_id || !text) {
    return res.status(400).json({ error: 'User ID and text are required' });
  }

  try {
    const newPost = new Post({
      id: uuidv4(),
      user_id,
      text,
      image_url: image_url || ''
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFeed = async (req, res) => {
  try {
    const posts = await Post.find().sort({ created_at: -1 });

    // Join with users
    const userIds = [...new Set(posts.map(post => post.user_id))];
    const users = await User.find({ user_id: { $in: userIds } });

    const userMap = users.reduce((acc, user) => {
      acc[user.user_id] = user;
      return acc;
    }, {});

    const populatedPosts = posts.map(post => ({
      ...post.toObject(),
      user: {
        name: userMap[post.user_id]?.name || 'Unknown User',
        profile_picture: userMap[post.user_id]?.profile_picture || ''
      }
    }));

    res.json(populatedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPost, getFeed };
