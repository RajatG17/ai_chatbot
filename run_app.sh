#!/bin/bash

# Exit immediately if any command fails
set -e

echo "Starting Django backend..."
# Run Django in background

osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && source venv/bin/activate && daphne -p 8000 backend.asgi:application"'
cd backend  # adjust if your Django project folder is named differently
BACKEND_PID=$!

# Give backend a few seconds to start
sleep 5

echo "Starting React frontend..."
cd ../frontend  # adjust if your React project folder is named differently
npm start &
FRONTEND_PID=$!

# Trap Ctrl+C to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID" INT

echo "App is running!"
echo "   Django backend: http://127.0.0.1:8000"
echo "   React frontend: http://127.0.0.1:3000"

# Wait so script doesn't exit immediately
wait