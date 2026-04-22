#!/bin/bash

echo "🚀 Starting ByteChat Setup..."

# 1. Initialize .env files
if [ ! -f .env ]; then
    echo "Creating root .env..."
    cp .env.example .env
fi

if [ ! -f apps/frontend/.env ]; then
    echo "Creating frontend .env..."
    cp apps/frontend/.env.example apps/frontend/.env
fi

# 2. Install Frontend Dependencies
echo "📦 Installing frontend dependencies..."
cd apps/frontend && npm install && cd ../..

# 3. Verify Backend Environment
echo "☕ Checking Java environment..."
java -version

echo "✅ Setup complete! You can now run ./scripts/dev.sh"
