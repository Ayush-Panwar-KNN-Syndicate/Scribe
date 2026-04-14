#!/bin/bash

# ============================================
# Deploy CarHP
# ============================================

echo "🚀 Deploying CarHP..."
echo ""

# Check if .env.carhp exists
if [ ! -f ".env.carhp" ]; then
  echo "❌ Error: .env.carhp not found!"
  exit 1
fi

# Copy environment file
echo "📋 Copying environment variables..."
cp .env.carhp .env
echo "✅ Environment configured for CarHP"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Seed carhp.com domain into DB + create R2 bucket
echo "🌐 Seeding CarHP domain..."
node tools/scripts/seed-carhp.js
echo ""

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma generate
npx prisma db push
echo "✅ Database migrations completed"
echo ""

# Build the application
echo "🔨 Building application..."
npm run build
echo "✅ Build completed"
echo ""

echo "✨ CarHP is ready to deploy!"
echo ""
echo "Next steps:"
echo "  1. Deploy to Vercel:"
echo "     vercel --prod"
echo ""
echo "  2. Or test locally:"
echo "     npm run dev"
echo ""
