
const { User } = require('../models/db');
const { v4: uuidv4 } = require('uuid');

const createUser = async (req, res) => {
  const { name, email, password, neighborhood_tag, squad_id } = req.body;
  if (!name || !neighborhood_tag || !email || !password) 
    return res.status(400).json({ error: 'Name, Email, Password, and Neighborhood Tag are required' });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const userId = uuidv4();
    const newUser = new User({
      user_id: userId,
      name,
      email,
      password, // In a real app, hash this or use authController instead
      neighborhood_tag,
      squad_id: squad_id || null,
      current_points: 0,
      total_co2_saved: 0,
      streak_multiplier: 1.0,
      last_active_date: new Date(),
      badges: []
    });

    await newUser.save();
    
    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.id }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createUser, getUser };
