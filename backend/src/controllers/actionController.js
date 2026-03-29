
const { awardEcoCredits, ACTION_POINTS } = require('../services/ecoService');
const { ActionLog } = require('../models/db');
const { getDailyChallenge, expandDailyChallenge } = require('../services/aiService');

const logAction = async (req, res) => {
  const { user_id, action_type, action_label } = req.body;
  if (!user_id || !action_type) return res.status(400).json({ error: 'User ID and Action Type are required' });

  // SECURITY FIX: Prevent IDOR - ensure user is logging action for themselves
  if (req.userAuth && req.userAuth.user_id !== user_id) {
    return res.status(403).json({ error: 'Unauthorized: Cannot log actions for another user' });
  }

  try {
    const result = await awardEcoCredits(user_id, action_type, {
      actionLabel: action_label || action_type,
      source: 'manual'
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getActionHistory = async (req, res) => {
  try {
    const userId = req.userAuth?.user_id || req.user?.user_id;
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const history = await ActionLog.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDaily = async (req, res) => {
  const challenge = getDailyChallenge();
  const config = ACTION_POINTS[challenge.action_type];
  res.json({
    ...challenge,
    points_range: { min: config.min, max: config.max }
  });
};

const expandDaily = async (req, res) => {
  const { challenge_id } = req.body;
  const challenge = getDailyChallenge();

  if (challenge_id && challenge_id !== challenge.id) {
    return res.status(400).json({ error: 'Challenge out of date. Refresh daily challenge.' });
  }

  const expanded = expandDailyChallenge(challenge);
  res.json(expanded);
};

const completeDaily = async (req, res) => {
  const { challenge_id, expanded } = req.body;
  const challenge = getDailyChallenge();

  if (challenge_id && challenge_id !== challenge.id) {
    return res.status(400).json({ error: 'Challenge out of date. Refresh daily challenge.' });
  }

  const geminiBoost = expanded ? expandDailyChallenge(challenge) : null;
  const bonusPoints = geminiBoost?.bonus_points || 0;

  try {
    const result = await awardEcoCredits(req.userAuth?.user_id, challenge.action_type, {
      actionLabel: challenge.title,
      bonusPoints,
      source: 'daily'
    });
    res.json({
      ...result,
      action_label: challenge.title,
      bonus_points: bonusPoints,
      gemini_expansion: geminiBoost?.expanded_description || ''
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  logAction,
  getActionHistory,
  getDaily,
  expandDaily,
  completeDaily
};
