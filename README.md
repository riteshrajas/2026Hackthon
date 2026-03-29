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
