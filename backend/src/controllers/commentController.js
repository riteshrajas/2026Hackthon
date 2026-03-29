const { Comment, Post } = require('../models/db');
const { v4: uuidv4 } = require('uuid');

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post_id: postId }).sort({ timestamp: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error while fetching comments' });
  }
};

const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.userAuth?.user_id || req.user?.user_id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Not authorized, user missing' });
    }

    const post = await Post.findOne({ post_id: postId });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = new Comment({
      comment_id: uuidv4(),
      post_id: postId,
      user_id: userId,
      user_name: req.user?.name || 'Eco Member',
      user_profile_picture: req.user?.profile_picture || '',
      content,
      likes: 0,
      liked_by: [],
      timestamp: new Date()
    });

    await comment.save();
    await Post.updateOne({ post_id: postId }, { $inc: { comments_count: 1 } });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Server error while creating comment' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.userAuth?.user_id || req.user?.user_id;

    const comment = await Comment.findOne({ comment_id: commentId, post_id: postId });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (!userId || comment.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Comment.deleteOne({ comment_id: commentId, post_id: postId });
    await Post.updateOne({ post_id: postId }, { $inc: { comments_count: -1 } });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error while deleting comment' });
  }
};

const toggleLikeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.userAuth?.user_id || req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authorized, user missing' });
    }

    const comment = await Comment.findOne({ comment_id: commentId, post_id: postId });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const hasLiked = comment.liked_by.includes(userId);
    if (hasLiked) {
      comment.liked_by = comment.liked_by.filter((id) => id !== userId);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      comment.liked_by.push(userId);
      comment.likes += 1;
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Server error while liking comment' });
  }
};

module.exports = {
  getComments,
  createComment,
  deleteComment,
  toggleLikeComment
};
