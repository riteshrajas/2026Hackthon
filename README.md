# Eco-Pulse (2026 Hackathon)

Eco-Pulse is a hackathon project that helps communities share eco-wins, track actions, and discover local impact. The repo contains a Node/Express backend with MongoDB and a React + Vite frontend.

## Features

- Eco-Win feed with photos and comments
- County-based discovery filtering
- Actions, impact, and community widgets
- Events and signups
- JWT-based auth and profiles

## Tech Stack

- Frontend: React 19, Vite, TypeScript, Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose)
- Auth: JWT

## Project Structure

- backend/: Express API, MongoDB models, seed scripts
- frontend/: React + Vite app
- start-app.bat: Windows helper to start both services

## Quick Start (Windows)

1. Install dependencies:
   ```bash
   cd backend
   npm install
   cd ..\frontend
   npm install
   ```

2. Start both services:
   ```bash
   start-app.bat
   ```

The backend runs on http://localhost:3000 and the frontend on the Vite dev port (usually http://localhost:5173).

## Quick Start (Manual)

Backend:
```bash
cd backend
npm install
npm run start
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Backend (optional):
- MONGODB_URI: Mongo connection string. If missing, an in-memory MongoDB instance is used.
- JWT_SECRET: Secret for JWT signing.

Frontend:
- VITE_API_URL: Base URL for the API (default http://localhost:3000/api).

## Seed Data

The backend seeds demo users on first run. You can also run:
```bash
cd backend
npm run seed:fake
```

## API Notes

API routes are served under /api in local dev. See backend/README.md for more details.

## Frontend Notes

See frontend/README.md for the Vite and lint configuration details.

## Devpost Submission Answers

### Project Overview

- Project name: Eco-Pulse
- Elevator pitch: Eco-Pulse transforms climate anxiety into community action. By gamifying daily eco-habits, we prove that small, local actions can ripple into massive environmental impact.

### Project Story

#### Inspiration

Today, eco-anxiety is at an all-time high. We constantly see headlines about global climate disasters but feel powerless to make a difference as individuals. We noticed a devastating gap: people *want* to be sustainable, but they feel their small actions don't matter in isolation. We built Eco-Pulse to shatter that misconception. We asked ourselves: *What if we could turn climate paralysis into gamified, community-driven action?* Our inspiration was to build a localized space where every recycled bottle, carpool, or "power down" hour is celebrated, proving that localized ripples create global waves of change.

#### What it does

Eco-Pulse is a gamified social platform that bridges the gap between environmental intent and action. It lets people share "Eco-Wins," discover local impact filtered by county, and stay motivated through AI-suggested daily challenges, community leaderboards, and local green events. By blending a supportive social feed with light gamification, it makes sustainability an addictive, celebrated, and achievable daily habit.

#### How we built it

- Frontend: React + Vite + TypeScript with Tailwind CSS for the interface.
- Backend: Node.js + Express with MongoDB (Mongoose) for data storage.
- Auth: JWT-based login and protected API routes.
- AI hooks: A mock suggestion service for daily challenges and personalized tips.

#### Challenges we ran into

- Balancing real-time feedback with a clean UI for a busy feed.
- Designing data models that support both social posts and community metrics.
- Keeping the app demo-ready with seed data and a fast local setup.

#### Accomplishments that we're proud of

- A working end-to-end app with posts, events, and community features.
- A county-based discovery filter that makes local impact visible.
- A smooth setup experience with seed data and one-command startup.

#### What we learned

- Simple gamification and social proof dramatically improve engagement.
- Clear data modeling is critical when features span multiple modules.
- Shipping a clean demo matters just as much as feature depth.

#### What's next for Eco-Pulse

- Connect real AI services for tailored sustainability coaching.
- Add verification flows for eco-wins and partner integrations.
- Expand leaderboards, badges, and community challenges.

### Built With

- JavaScript, TypeScript
- React, Vite, Tailwind CSS
- Node.js, Express
- MongoDB, Mongoose
- JWT, Axios

### Additional Info (Judges and Organizers)

- Sponsor / Special Prizes (targeted): Social Good Track, Best UI/UX, AI/ML Track. MLH Gemini API and MLH ElevenLabs are planned but not live yet.
- Universities or schools: Wayne State University; Oakland Community College.
- Tech feedback: MongoDB + Mongoose made iteration fast, and the in-memory fallback kept demos reliable. Vite + React delivered fast dev cycles, and Tailwind helped us ship a clean UI quickly.
- AI tools used: OpenAI (GitHub Copilot).
- Generative AI model or API usage: Not fully integrated yet; we used a mock suggestion service and left hooks for Gemini and ElevenLabs. N/A for a live model in this build.
- Gemini Project Number: TBD

### Links and Media

- Demo link: TBD
- Video demo link: TBD
