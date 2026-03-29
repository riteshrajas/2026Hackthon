
# ECO-PULSE Backend MVP 🌿

Modular, scalable, and demo-ready backend for the Eco-Pulse hackathon project.

## 🚀 Quick Start

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the server:**
    ```bash
    node index.js
    ```
    The server will start on `http://localhost:3000` with seed data pre-loaded.

---

## 🛠️ API Endpoints

### 👤 Users
- `POST /api/auth/register` - Create a new user
  ```json
  { "name": "Your Name", "email": "user@example.com", "password": "securepassword", "neighborhood_tag": "EcoVillage" }
  ```
- `POST /api/auth/login` - Authenticate a user
- `GET /api/user/:id` - Get user stats (Requires Auth)

### 📊 Actions & Points
- `POST /api/action/log` - Award Eco-Credits
  - Types: `VERIFIED`, `GRID`, `EDUCATIONAL`
  ```json
  { "user_id": "user_1", "action_type": "VERIFIED" }
  ```

### 🏆 Leaderboards
- `GET /api/leaderboard/neighborhood/:tag`
- `GET /api/leaderboard/squad/:id`
- `GET /api/leaderboard/household/:user_id`

### 🤖 AI (ElevenLabs Integration)
- `POST /api/ai/suggest` - Get personalized eco-suggestions
  ```json
  { "user_id": "user_1" }
  ```

### ⚙️ Admin (Demo Only)
- `POST /admin/weekly-reset` - Manually trigger the weekly reset system

---

## 🧠 Core Features Implemented

1.  **Underdog Bonus:** Automatically identifies the lowest-performing neighborhood and applies a 1.5x multiplier to their actions.
2.  **Streak Multiplier:** Users gain a +0.1 bonus for consecutive daily activity (up to 2.0x).
3.  **Weekly Reset Logic:** Resets points every week, preserves total CO2 savings, and awards the "Green Sentinel" badge to the top 10% of users.
4.  **Modular Architecture:** Clean separation of routes, controllers, and services for easy extension.
5.  **Mock AI Service:** Simulates ElevenLabs Realtime API with context-aware suggestions.
