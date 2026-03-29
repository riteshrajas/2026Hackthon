const { User } = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_ecopulse_key';

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, neighborhood_tag, country } = req.body;
    let profile_picture = req.body.profile_picture || '';
    
    if (req.file) {
      const mimeType = req.file.mimetype || 'image/jpeg';
      profile_picture = `data:${mimeType};base64,${req.file.buffer.toString('base64')}`;
    }

    if (!name || !email || !password || !neighborhood_tag) {
      return res.status(400).json({ error: 'Name, email, password and neighborhood (county) are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      user_id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      neighborhood_tag,
      profile_picture: profile_picture || '',
      country: country || 'United States'
    });

    await user.save();

    if (!user.country) {
      user.country = 'United States';
      await user.save();
    }

    const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        neighborhood_tag: user.neighborhood_tag,
        profile_picture: user.profile_picture,
        country: user.country
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        neighborhood_tag: user.neighborhood_tag,
        country: user.country,
        profile_picture: user.profile_picture,
        squad_id: user.squad_id,
        current_points: user.current_points
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = {
  register,
  login
};
