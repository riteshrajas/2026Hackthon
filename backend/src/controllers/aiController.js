
const { User } = require('../models/db');
const { generateEcoSuggestion } = require('../services/aiService');

const suggest = async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'User ID is required' });

  // SECURITY FIX: Prevent IDOR - ensure user is requesting suggestions for themselves
  if (req.userAuth && req.userAuth.user_id !== user_id) {
    return res.status(403).json({ error: 'Unauthorized: Cannot request suggestions for another user' });
  }

  try {
    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const suggestion = await generateEcoSuggestion(user);
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { suggest };
