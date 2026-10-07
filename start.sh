#!/usr/bin/env bash
echo "Starting Lumina Glass E-Commerce..."

# Start Backend in background
echo "Starting FastAPI backend on port 8000..."
cd backend
../backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd ..

# Start Frontend in background
echo "Starting Vite frontend on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "=================================================="
echo "🚀 Lumina E-Commerce is running!"
echo "✨ Frontend URL: http://localhost:3000"
echo "🔧 Backend API docs: http://localhost:8000/docs"
echo "🔑 Default Admin Login: admin@glasshop.com / admin123"
echo "=================================================="

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
