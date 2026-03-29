const jwt = require('jsonwebtoken');
const { User } = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_ecopulse_key';

const protect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.userAuth = decoded; // attach user_id from token to req

      const user = await User.findOne({ user_id: decoded.user_id });
      if (!user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ error: 'Not authorized, no token' });
};

module.exports = { protect };
