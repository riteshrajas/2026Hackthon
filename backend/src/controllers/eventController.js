const { Event, EventSignup, User } = require('../models/db');
const { v4: uuidv4 } = require('uuid');

const listEvents = async (req, res) => {
  try {
    const scope = req.query.scope || 'county';
    const value = req.query.value || '';
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const userId = req.userAuth?.user_id;

    let query = {};
    if (scope === 'global') {
      query = { scope: 'global' };
    } else if (scope === 'country') {
      query = {
        $or: [
          { scope: 'global' },
          { scope: 'country', scope_value: value || req.user?.country || 'United States' }
        ]
      };
    } else {
      query = {
        $or: [
          { scope: 'global' },
          { scope: 'county', scope_value: value || req.user?.neighborhood_tag || '' }
        ]
      };
    }

    const events = await Event.find(query).sort({ start_time: 1 }).limit(limit);

    let signedUpIds = new Set();
    if (userId && events.length > 0) {
      const signups = await EventSignup.find({
        user_id: userId,
        event_id: { $in: events.map((event) => event.event_id) },
        status: 'going'
      });
      signedUpIds = new Set(signups.map((signup) => signup.event_id));
    }

    const response = events.map((event) => ({
      ...event.toObject(),
      is_signed_up: signedUpIds.has(event.event_id),
      is_full: event.capacity !== null && event.signup_count >= event.capacity
    }));

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      start_time,
      end_time,
      location_name,
      location_address,
      scope,
      scope_value,
      capacity,
      organization_name,
      organization_url,
      details_url,
      image_url
    } = req.body;

    if (!title || !description || !start_time) {
      return res.status(400).json({ error: 'Title, description, and start time are required' });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const event = new Event({
      event_id: uuidv4(),
      title,
      description,
      start_time: new Date(start_time),
      end_time: end_time ? new Date(end_time) : undefined,
      location_name: location_name || '',
      location_address: location_address || '',
      scope: scope || 'county',
      scope_value: scope_value || user.neighborhood_tag || '',
      capacity: Number.isFinite(Number(capacity)) ? Number(capacity) : null,
      creator_id: user.user_id,
      creator_name: user.name,
      creator_profile_picture: user.profile_picture || '',
      organization_name: organization_name || '',
      organization_url: organization_url || '',
      details_url: details_url || '',
      image_url: image_url || ''
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const signupEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.userAuth?.user_id;

    const event = await Event.findOne({ event_id: eventId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.capacity !== null && event.signup_count >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    const existing = await EventSignup.findOne({ event_id: eventId, user_id: userId });
    if (existing && existing.status === 'going') {
      return res.json({ message: 'Already signed up' });
    }

    if (existing && existing.status !== 'going') {
      existing.status = 'going';
      await existing.save();
    } else if (!existing) {
      const signup = new EventSignup({
        signup_id: uuidv4(),
        event_id: eventId,
        user_id: userId,
        status: 'going'
      });
      await signup.save();
    }

    event.signup_count += 1;
    await event.save();

    res.json({ message: 'Signed up', signup_count: event.signup_count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listEventSignups = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.userAuth?.user_id;

    const event = await Event.findOne({ event_id: eventId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.creator_id !== userId) {
      return res.status(403).json({ error: 'Only the event creator can view attendees' });
    }

    const signups = await EventSignup.find({ event_id: eventId, status: 'going' })
      .sort({ createdAt: -1 });

    const users = await User.find({ user_id: { $in: signups.map((signup) => signup.user_id) } })
      .select('user_id name email profile_picture');

    const userMap = {};
    for (const attendee of users) {
      userMap[attendee.user_id] = attendee;
    }

    const response = signups.map((signup) => {
      const attendee = userMap[signup.user_id];
      return {
        user_id: signup.user_id,
        name: attendee?.name || 'Eco Member',
        email: attendee?.email || '',
        profile_picture: attendee?.profile_picture || '',
        joined_at: signup.createdAt
      };
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listEvents,
  createEvent,
  signupEvent,
  listEventSignups
};
