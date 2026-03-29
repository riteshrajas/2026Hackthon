
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { connectDB, User } = require('./src/models/db');
const { awardEcoCredits, resetWeeklyPoints } = require('./src/services/ecoService');
const apiRoutes = require('./src/routes/api');

app.use(cors());
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ limit: '6mb', extended: true }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to DB
connectDB().then(() => {
  // Start server after DB connection
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`ECO-PULSE Backend running on port ${PORT}`);
    seedDemoData(); // Call seedDemoData here after DB is connected
  });
});

// Routes
app.use('/api', apiRoutes);

// Mock Health/Root
app.get('/', (req, res) => res.json({ status: 'ECO-PULSE Backend Active' }));

const bcrypt = require('bcryptjs');

// SEED DATA for Demo
const seedDemoData = async () => {
  try {
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log('Seed data already exists.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('password123', salt);

    const seedUsers = [
      { id: 'user_1', email: 'alice@eco.test', name: 'Alice Green', tag: 'EcoVillage', squad: 'squad_a' },
      { id: 'user_2', email: 'bob@eco.test', name: 'Bob Solar', tag: 'EcoVillage', squad: 'squad_a' },
      { id: 'user_3', email: 'charlie@eco.test', name: 'Charlie Wind', tag: 'GreenValley', squad: 'squad_b' },
      { id: 'user_4', email: 'daisy@eco.test', name: 'Daisy Recycles', tag: 'GreenValley', squad: 'squad_b' },
      { id: 'user_5', email: 'ethan@eco.test', name: 'Ethan Underdog', tag: 'LowPerformancePark', squad: 'squad_c' }
    ];

    for (const u of seedUsers) {
      const newUser = new User({
        user_id: u.id,
        name: u.name,
        email: u.email,
        password: pass,
        neighborhood_tag: u.tag,
        country: 'United States',
        squad_id: u.squad,
        current_points: 0,
        total_co2_saved: 0,
        streak_multiplier: 1.0,
        last_active_date: new Date(),
        badges: []
      });
      await newUser.save();
      
      // Log some random actions
      await awardEcoCredits(u.id, 'EDUCATIONAL');
      await awardEcoCredits(u.id, 'GRID');
    }
    
    console.log('Seed data generated successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Weekly Reset Manual Trigger (for demo purposes)
app.post('/admin/weekly-reset', async (req, res) => {
  try {
    await resetWeeklyPoints();
    res.json({ message: 'Weekly points reset and badges awarded!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
// We start listening in the connectDB().then() block now
// app.listen(PORT, () => {
//   console.log(`ECO-PULSE Backend running on port ${PORT}`);
//   seedDemoData();
// });
