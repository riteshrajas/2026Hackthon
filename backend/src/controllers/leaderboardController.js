
const { User } = require('../models/db');

const getLeaderboard = async (req, res) => {
  const { type, id } = req.params;
  
  try {
    let query = {};
    if (type === 'household') {
      query = { user_id: id };
    } else if (type === 'neighborhood') {
      query = { neighborhood_tag: id };
    } else if (type === 'squad') {
      query = { squad_id: id };
    }

    const filteredUsers = await User.find(query).sort({ current_points: -1 }).select('-password');
    
    // Rank and add top 10% badge logic for return
    const top10Threshold = Math.ceil(filteredUsers.length * 0.1);
    
    const results = filteredUsers.map((user, index) => ({
      rank: index + 1,
      user_id: user.user_id,
      name: user.name,
      points: user.current_points,
      is_top_performer: (index < top10Threshold && user.current_points > 0)
    }));

    res.json({ type, filter_id: id, rankings: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getLeaderboard };
