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
  points_awarded: { type: Number, default: 0 },
  co2_saved: { type: Number, default: 0 },
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

const User = mongoose.model('User', UserSchema);
const ActionLog = mongoose.model('ActionLog', ActionLogSchema);
const NeighborhoodPerformance = mongoose.model('NeighborhoodPerformance', NeighborhoodPerformanceSchema);
const Post = mongoose.model('Post', PostSchema);
const Comment = mongoose.model('Comment', CommentSchema);

module.exports = {
  connectDB,
  User,
  ActionLog,
  NeighborhoodPerformance,
  Post,
  Comment
};
