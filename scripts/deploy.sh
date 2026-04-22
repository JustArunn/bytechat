#!/bin/bash

# --- CONFIGURATION ---
SERVER_USER="root"
SERVER_IP="your-server-ip"
DEPLOY_PATH="/var/www/bytechat"
# ---------------------

echo "🚀 Deploying ByteChat to $SERVER_IP..."

# 1. Sync files (excluding node_modules and target)
echo "📂 Syncing files to server..."
rsync -avz --exclude 'node_modules' --exclude 'target' --exclude '.git' ./ $SERVER_USER@$SERVER_IP:$DEPLOY_PATH

# 2. Run deployment on server
echo "🏗️ Building and starting containers on server..."
ssh $SERVER_USER@$SERVER_IP << EOF
    cd $DEPLOY_PATH
    docker-compose -f docker-compose.prod.yml up -d --build
    docker image prune -f
EOF

echo "✅ Deployment complete!"
