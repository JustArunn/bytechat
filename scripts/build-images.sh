#!/bin/bash

echo "🏗️ Building ByteChat Production Images..."

# Build Backend
echo "☕ Building Backend Image..."
docker build -t bytechat-backend:latest -f docker/backend/Dockerfile.prod apps/backend

# Build Frontend
echo "🌐 Building Frontend Image..."
docker build -t bytechat-frontend:latest -f docker/frontend/Dockerfile.prod apps/frontend

echo "✅ All images built successfully!"
