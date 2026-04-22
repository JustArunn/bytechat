#!/bin/bash

# --- CONFIGURATION ---
# Replace with your actual registry URL (e.g., 123456789.dkr.ecr.us-east-1.amazonaws.com)
REGISTRY_URL="your-registry-url"
# ---------------------

echo "🚀 Tagging and Pushing ByteChat Images to $REGISTRY_URL..."

# 1. Build images (if not already built)
./scripts/build-images.sh

# 2. Tag images
echo "🏷️ Tagging images..."
docker tag bytechat-backend:latest $REGISTRY_URL/bytechat-backend:latest
docker tag bytechat-frontend:latest $REGISTRY_URL/bytechat-frontend:latest

# 3. Push images
echo "⬆️ Pushing to registry..."
docker push $REGISTRY_URL/bytechat-backend:latest
docker push $REGISTRY_URL/bytechat-frontend:latest

echo "✅ Push complete!"
