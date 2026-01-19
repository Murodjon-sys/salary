#!/bin/bash

# Alibobo deployment script for VPS
# Run this script on your VPS server

set -e

echo "🚀 Starting Alibobo deployment..."

# 1. Create projects directory
echo "📁 Creating projects directory..."
mkdir -p /root/projects
cd /root/projects

# 2. Clone repository
echo "📥 Cloning repository from GitHub..."
if [ -d "alibobo" ]; then
    echo "⚠️  Directory 'alibobo' already exists. Removing..."
    rm -rf alibobo
fi

git clone https://github.com/Murodjon-sys/alibobo.git
cd alibobo/alibobo

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 4. Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create it with your configuration."
    echo "Example .env content:"
    echo "DATABASE_URL=your_database_url"
    echo "API_KEY=your_api_key"
    exit 1
fi

# 5. Build the application
echo "🔨 Building application..."
npm run build

# 6. Stop existing PM2 processes if they exist
echo "🛑 Stopping existing alibobo processes..."
pm2 delete alibobo-backend 2>/dev/null || true
pm2 delete alibobo-frontend 2>/dev/null || true

# 7. Start backend with PM2
echo "🚀 Starting backend..."
cd server
pm2 start index.js --name "alibobo-backend"

# 8. Start frontend with PM2
echo "🚀 Starting frontend..."
cd ..
pm2 serve dist 3001 --name "alibobo-frontend" --spa

# 9. Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# 10. Show PM2 status
echo "✅ Deployment completed!"
pm2 ls

echo ""
echo "🎉 Alibobo successfully deployed!"
echo "Backend: Running on PM2 as 'alibobo-backend'"
echo "Frontend: Running on port 3001"
echo ""
echo "Next steps:"
echo "1. Configure Nginx for your domain"
echo "2. Set up SSL certificate"
echo "3. Test the application"
