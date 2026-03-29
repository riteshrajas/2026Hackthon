
const { User, ActionLog, NeighborhoodPerformance } = require('../models/db');
const { v4: uuidv4 } = require('uuid');

const ACTION_POINTS = {
  VERIFIED: { min: 50, max: 100, co2: 2.5 },
  GRID: { min: 20, max: 50, co2: 1.2 },
  EDUCATIONAL: { min: 5, max: 15, co2: 0.5 }
};

const awardEcoCredits = async (userId, actionType) => {
  const user = await User.findOne({ user_id: userId });
  if (!user) throw new Error('User not found');

  const config = ACTION_POINTS[actionType];
  if (!config) throw new Error('Invalid action type');

  // Random points in range
  let points = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
  
  // Apply Underdog Bonus if applicable
  const underdogTag = await getUnderdogNeighborhood();
  if (user.neighborhood_tag === underdogTag) {
    points = Math.floor(points * 1.5);
  }

  // Apply Streak Multiplier
  points = Math.floor(points * user.streak_multiplier);

  // Update User
  user.current_points += points;
  user.total_co2_saved += config.co2;
  user.last_active_date = new Date();
  await user.save();

  // Log Action
  const log = new ActionLog({
    user_id: userId,
    action_type: actionType,
    points_awarded: points,
    co2_saved: config.co2
  });
  await log.save();

  // Update neighborhood stats for underdog tracking
  let neighborhood = await NeighborhoodPerformance.findOne({ tag: user.neighborhood_tag });
  if (!neighborhood) {
    neighborhood = new NeighborhoodPerformance({ tag: user.neighborhood_tag, total_points: 0 });
  }
  neighborhood.total_points += points;
  await neighborhood.save();

  return { points, co2: config.co2, newTotal: user.current_points };
};

const getUnderdogNeighborhood = async () => {
  const neighborhoods = await NeighborhoodPerformance.find();
  if (neighborhoods.length === 0) return null;
  
  let minPoints = Infinity;
  let underdog = null;

  for (const n of neighborhoods) {
    if (n.total_points < minPoints) {
      minPoints = n.total_points;
      underdog = n.tag;
    }
  }
  return underdog;
};

const resetWeeklyPoints = async () => {
  const users = await User.find().sort({ current_points: -1 });
  if (users.length === 0) return;
  
  const top10PercentCount = Math.ceil(users.length * 0.1);
  const greenSentinels = users.slice(0, top10PercentCount);
  const greenSentinelIds = greenSentinels.map(u => u.user_id);

  for (const user of users) {
    // Check for Green Sentinel Badge
    if (greenSentinelIds.includes(user.user_id) && user.current_points > 0) {
      if (!user.badges.includes('Green Sentinel')) {
        user.badges.push('Green Sentinel');
      }
    }

    // Reset current points
    user.current_points = 0;
    
    // Streak logic: if not active in 2 days, reset multiplier
    const now = new Date();
    const diffDays = (now - new Date(user.last_active_date)) / (1000 * 60 * 60 * 24);
    if (diffDays > 2) {
      user.streak_multiplier = 1.0;
    } else {
      user.streak_multiplier = Math.min(2.0, user.streak_multiplier + 0.1);
    }
    
    await user.save();
  }

  // Reset neighborhood performance
  await NeighborhoodPerformance.deleteMany({});
};

module.exports = {
  awardEcoCredits,
  getUnderdogNeighborhood,
  resetWeeklyPoints,
  ACTION_POINTS
};
