
const { awardEcoCredits } = require('../services/ecoService');

const logAction = async (req, res) => {
  const { user_id, action_type } = req.body;
  if (!user_id || !action_type) return res.status(400).json({ error: 'User ID and Action Type are required' });

  // SECURITY FIX: Prevent IDOR - ensure user is logging action for themselves
  if (req.userAuth && req.userAuth.user_id !== user_id) {
    return res.status(403).json({ error: 'Unauthorized: Cannot log actions for another user' });
  }

  try {
    const result = await awardEcoCredits(user_id, action_type);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { logAction };
