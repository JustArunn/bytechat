#!/bin/bash

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n🛑 Shutting down services..."
    # Kill background jobs (frontend and backend)
    kill $(jobs -p) 2>/dev/null
    # Stop docker containers
    echo "🐳 Stopping Docker containers..."
    docker-compose down
    exit
}

trap cleanup SIGINT SIGTERM

echo "🚀 Starting ByteChat Development Environment..."

# 1. Start Database
echo "🗄️ Starting Database (Docker)..."
docker-compose up db -d

# 2. Start Backend
echo "☕ Starting Backend..."
(cd apps/backend && ./mvnw spring-boot:run) &

# 3. Wait for Backend to be ready (Port 8080)
echo "⏳ Waiting for Backend to be ready on port 8080..."
until curl -s http://localhost:8080/actuator/health > /dev/null || curl -s http://localhost:8080 > /dev/null; do
  sleep 2
  echo -n "."
done
echo -e "\n✅ Backend is UP!"

# 4. Start Frontend
echo "🌐 Starting Frontend..."
(cd apps/frontend && npm run dev) &

echo "✅ All services are running!"
echo "-----------------------------------"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8080"
echo "-----------------------------------"
echo "Press Ctrl+C to stop all services."

# Keep the script running to catch the trap
wait
