/@echo off
echo Starting Eco-Pulse application...

:: Start the backend in a new command prompt window
echo Starting Backend...
start cmd /k "cd backend && npm run start 2>NUL || node index.js"

:: Start the frontend in a new command prompt window
echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both services have been started in separate windows.
pause
