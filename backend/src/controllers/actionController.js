
const { awardEcoCredits } = require('../services/ecoService');

const logAction = async (req, res) => {
  const { user_id, action_type } = req.body;
  if (!user_id || !action_type) return res.status(400).json({ error: 'User ID and Action Type are required' });

  try {
    const result = await awardEcoCredits(user_id, action_type);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { logAction };
