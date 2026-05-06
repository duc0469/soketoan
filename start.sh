#!/bin/bash

echo "========================================"
echo "  HE THONG KE TOAN TU DONG"
echo "  Starting Backend and Frontend..."
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "backend/node_modules" ]; then
    echo "⚠️  Backend dependencies not installed!"
    echo "Run: cd backend && npm install"
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  Frontend dependencies not installed!"
    echo "Run: cd frontend && npm install"
    exit 1
fi

# Start Backend
echo "[1/2] Starting Backend (Node.js)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit
sleep 3

# Start Frontend
echo "[2/2] Starting Frontend (React)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "  Servers are running!"
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
