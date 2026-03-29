
const { User } = require('../models/db');
const { generateEcoSuggestion } = require('../services/aiService');

const suggest = async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'User ID is required' });

  try {
    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const suggestion = generateEcoSuggestion(user);
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { suggest };
