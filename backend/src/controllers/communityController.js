const { FriendRequest, User, ActionLog } = require('../models/db');
const { v4: uuidv4 } = require('uuid');

const getPendingRequests = async (req, res) => {
  try {
    const userId = req.userAuth?.user_id;
    const pending = await FriendRequest.find({ to_user_id: userId, status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const { to_user_id } = req.body;
    const user = req.user;
    if (!to_user_id) {
      return res.status(400).json({ error: 'Target user is required' });
    }

    if (to_user_id === user.user_id) {
      return res.status(400).json({ error: 'Cannot request yourself' });
    }

    const existing = await FriendRequest.findOne({
      from_user_id: user.user_id,
      to_user_id,
      status: 'pending'
    });

    if (existing) {
      return res.json(existing);
    }

    const request = new FriendRequest({
      request_id: uuidv4(),
      from_user_id: user.user_id,
      from_user_name: user.name,
      from_user_profile_picture: user.profile_picture || '',
      to_user_id,
      status: 'pending'
    });

    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const userId = req.userAuth?.user_id;
    const { status } = req.body;
    const requestId = req.params.requestId;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await FriendRequest.findOne({ request_id: requestId, to_user_id: userId });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveNinjas = async (req, res) => {
  try {
    const scope = req.query.scope || 'county';
    const value = req.query.value || '';
    const limit = Math.min(Number(req.query.limit) || 5, 20);

    let query = {};
    if (scope === 'country') {
      query.country = value || req.user?.country || 'United States';
    } else if (scope === 'global') {
      query = {};
    } else {
      query.neighborhood_tag = value || req.user?.neighborhood_tag || '';
    }

    const activeSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query.last_active_date = { $gte: activeSince };

    const users = await User.find(query)
      .sort({ last_active_date: -1 })
      .limit(limit)
      .select('user_id name profile_picture last_active_date');

    const userIds = users.map((user) => user.user_id);
    const logs = await ActionLog.find({ user_id: { $in: userIds } })
      .sort({ createdAt: -1 })
      .limit(50);

    const lastLogByUser = {};
    for (const log of logs) {
      if (!lastLogByUser[log.user_id]) {
        lastLogByUser[log.user_id] = log;
      }
    }

    const response = users.map((user) => {
      const lastLog = lastLogByUser[user.user_id];
      const label = lastLog?.action_label || lastLog?.action_type || 'Eco action';
      return {
        user_id: user.user_id,
        name: user.name,
        profile_picture: user.profile_picture || '',
        status: `"${label}"`
      };
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPendingRequests,
  createRequest,
  respondToRequest,
  getActiveNinjas
};
