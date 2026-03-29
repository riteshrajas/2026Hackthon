
const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    
    // If no URI is provided, start an in-memory MongoDB server
    if (!uri) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('Started mongodb-memory-server');
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
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  text: { type: String, required: true },
  image_url: { type: String, default: '' },
  likes: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const ActionLog = mongoose.model('ActionLog', ActionLogSchema);
const NeighborhoodPerformance = mongoose.model('NeighborhoodPerformance', NeighborhoodPerformanceSchema);
const Post = mongoose.model('Post', PostSchema);

module.exports = {
  connectDB,
  User,
  ActionLog,
  NeighborhoodPerformance,
  Post
};
