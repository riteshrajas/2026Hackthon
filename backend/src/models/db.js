const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    
    // If no URI is provided, start an in-memory MongoDB server
    if (!uri) {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
        console.log('Started mongodb-memory-server');
      } catch (err) {
        // Fallback to local default if memory server fails
        uri = 'mongodb://localhost:27017/ecoPulseDB';
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const UserSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  neighborhood_tag: { type: String, required: true }, // This will be the "County"
  country: { type: String, default: 'United States' },
  profile_picture: { type: String, default: '' },
  squad_id: { type: String, default: null },
  current_points: { type: Number, default: 0 },
  total_co2_saved: { type: Number, default: 0 },
  streak_multiplier: { type: Number, default: 1.0 },
  last_active_date: { type: Date, default: Date.now },
  badges: [{ type: String }]
}, { timestamps: true });

const ActionLogSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  action_type: { type: String, required: true },
  action_label: { type: String, default: '' },
  points_awarded: { type: Number, default: 0 },
  bonus_points: { type: Number, default: 0 },
  co2_saved: { type: Number, default: 0 },
  source: { type: String, default: 'manual' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const NeighborhoodPerformanceSchema = new mongoose.Schema({
  tag: { type: String, required: true, unique: true },
  total_points: { type: Number, default: 0 },
  active_users: { type: Number, default: 0 }
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
  post_id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  user_name: { type: String, required: true },
  user_profile_picture: { type: String },
  content: { type: String, required: true },
  image_url: { type: String },
  type: { type: String, default: 'ECO-WIN' },
  likes: { type: Number, default: 0 },
  comments_count: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const CommentSchema = new mongoose.Schema({
  comment_id: { type: String, required: true, unique: true },
  post_id: { type: String, required: true, index: true },
  user_id: { type: String, required: true },
  user_name: { type: String, required: true },
  user_profile_picture: { type: String, default: '' },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  liked_by: [{ type: String }],
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const EventSchema = new mongoose.Schema({
  event_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date },
  location_name: { type: String, default: '' },
  location_address: { type: String, default: '' },
  scope: { type: String, default: 'county' },
  scope_value: { type: String, default: '' },
  capacity: { type: Number, default: null },
  signup_count: { type: Number, default: 0 },
  creator_id: { type: String, required: true },
  creator_name: { type: String, required: true },
  creator_profile_picture: { type: String, default: '' },
  organization_name: { type: String, default: '' },
  organization_url: { type: String, default: '' },
  details_url: { type: String, default: '' },
  image_url: { type: String, default: '' }
}, { timestamps: true });

const EventSignupSchema = new mongoose.Schema({
  signup_id: { type: String, required: true, unique: true },
  event_id: { type: String, required: true, index: true },
  user_id: { type: String, required: true },
  status: { type: String, default: 'going' }
}, { timestamps: true });

const FriendRequestSchema = new mongoose.Schema({
  request_id: { type: String, required: true, unique: true },
  from_user_id: { type: String, required: true },
  from_user_name: { type: String, required: true },
  from_user_profile_picture: { type: String, default: '' },
  to_user_id: { type: String, required: true },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const ActionLog = mongoose.model('ActionLog', ActionLogSchema);
const NeighborhoodPerformance = mongoose.model('NeighborhoodPerformance', NeighborhoodPerformanceSchema);
const Post = mongoose.model('Post', PostSchema);
const Comment = mongoose.model('Comment', CommentSchema);
const Event = mongoose.model('Event', EventSchema);
const EventSignup = mongoose.model('EventSignup', EventSignupSchema);
const FriendRequest = mongoose.model('FriendRequest', FriendRequestSchema);

module.exports = {
  connectDB,
  User,
  ActionLog,
  NeighborhoodPerformance,
  Post,
  Comment,
  Event,
  EventSignup,
  FriendRequest
};
