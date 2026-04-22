#!/bin/bash

# ByteChat AWS EC2 Initialization Script
# This script installs Docker, Docker Compose, and prepares the environment.

echo "🚀 Starting ByteChat AWS Setup..."

# 1. Update and Upgrade
echo "🔄 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker
if ! [ -x "$(command -v docker)" ]; then
    echo "🐳 Installing Docker..."
    sudo apt-get install -y docker.io
    sudo systemctl enable --now docker
    sudo usermod -aG docker $USER
else
    echo "✅ Docker is already installed."
fi

# 3. Install Docker Compose
if ! [ -x "$(command -v docker-compose)" ]; then
    echo "🐙 Installing Docker Compose..."
    sudo apt-get install -y docker-compose
else
    echo "✅ Docker Compose is already installed."
fi

# 4. Install Git
if ! [ -x "$(command -v git)" ]; then
    echo "📂 Installing Git..."
    sudo apt-get install -y git
else
    echo "✅ Git is already installed."
fi

# 5. Create project directory
echo "📁 Creating project directory ~/bytechat..."
mkdir -p ~/bytechat

echo "----------------------------------------------------"
echo "✅ Setup Complete!"
echo "⚠️ IMPORTANT: Please log out and log back in (or run 'newgrp docker')"
echo "   to activate Docker permissions."
echo "----------------------------------------------------"
