const { DisasterUpdate, User } = require('../models/db');
const { v4: uuidv4 } = require('uuid');

const normalizeScope = (scope) => {
  if (typeof scope !== 'string') return 'county';
  const normalized = scope.trim().toLowerCase();
  if (normalized === 'country' || normalized === 'global' || normalized === 'county') {
    return normalized;
  }
  return 'county';
};

const listUpdates = async (req, res) => {
  try {
    const scope = normalizeScope(req.query.scope);
    const scopeValue = typeof req.query.scope_value === 'string' ? req.query.scope_value.trim() : '';

    const filter = { status: 'active', scope };
    if (scope !== 'global' && scopeValue) {
      filter.scope_value = scopeValue;
    }

    const updates = await DisasterUpdate.find(filter)
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    return res.json(updates);
  } catch (error) {
    console.error('List disaster updates error:', error);
    return res.status(500).json({ error: 'Server error while fetching updates' });
  }
};

const createUpdate = async (req, res) => {
  try {
    const userId = req.userAuth?.user_id || req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authorized, user missing' });
    }

    const user = req.user || await User.findOne({ user_id: userId });
    if (!user) return res.status(401).json({ error: 'Not authorized, user not found' });

    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const category = typeof req.body.category === 'string' ? req.body.category.trim() : 'alert';
    const locationName = typeof req.body.location_name === 'string' ? req.body.location_name.trim() : '';
    const contactInfo = typeof req.body.contact_info === 'string' ? req.body.contact_info.trim() : '';
    const scope = normalizeScope(req.body.scope);
    let scopeValue = typeof req.body.scope_value === 'string' ? req.body.scope_value.trim() : '';

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    if (!scopeValue) {
      if (scope === 'county') scopeValue = user.neighborhood_tag || '';
      if (scope === 'country') scopeValue = user.country || 'United States';
    }

    const update = new DisasterUpdate({
      update_id: uuidv4(),
      user_id: userId,
      user_name: user.name,
      user_profile_picture: user.profile_picture || '',
      title,
      description,
      category: category || 'alert',
      location_name: locationName,
      contact_info: contactInfo,
      scope,
      scope_value: scopeValue,
      timestamp: new Date()
    });

    await update.save();
    return res.status(201).json(update);
  } catch (error) {
    console.error('Create disaster update error:', error);
    return res.status(500).json({ error: 'Server error while creating update' });
  }
};

const getAlerts = async (req, res) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(501).json({ error: 'OpenWeather API key not configured' });
    }

    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const units = req.query.units === 'imperial' ? 'imperial' : 'metric';

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return res.status(400).json({ error: 'lat and lon are required numeric values' });
    }

    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({ error: 'Failed to fetch alerts', details: body });
    }

    const data = await response.json();
    const current = data.current
      ? {
          temperature: data.current.temp,
          wind_speed: data.current.wind_speed,
          humidity: data.current.humidity,
          description: data.current.weather?.[0]?.description || ''
        }
      : null;

    return res.json({
      timezone: data.timezone,
      alerts: data.alerts || [],
      current
    });
  } catch (error) {
    console.error('Get disaster alerts error:', error);
    return res.status(500).json({ error: 'Server error while fetching alerts' });
  }
};

const geocodeLocation = async (req, res) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(501).json({ error: 'OpenWeather API key not configured' });
    }

    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text();
      return res.status(response.status).json({ error: 'Failed to geocode location', details: body });
    }

    const data = await response.json();
    const results = (data || []).map((item) => ({
      name: item.name,
      state: item.state,
      country: item.country,
      lat: item.lat,
      lon: item.lon
    }));

    return res.json(results);
  } catch (error) {
    console.error('Geocode location error:', error);
    return res.status(500).json({ error: 'Server error while geocoding location' });
  }
};

const deleteUpdate = async (req, res) => {
  try {
    const userId = req.userAuth?.user_id || req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authorized, user missing' });
    }

    const updateId = req.params.updateId;
    const update = await DisasterUpdate.findOne({ update_id: updateId });

    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    if (update.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this update' });
    }

    await DisasterUpdate.deleteOne({ update_id: updateId });
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete disaster update error:', error);
    return res.status(500).json({ error: 'Server error while deleting update' });
  }
};

module.exports = {
  listUpdates,
  createUpdate,
  getAlerts,
  geocodeLocation,
  deleteUpdate
};
