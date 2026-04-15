#!/bin/bash

# ============================================
# Deploy Article Spectrum
# ============================================

echo "Deploying Article Spectrum..."
echo ""

# Check if .env.articlespectrum exists
if [ ! -f ".env.articlespectrum" ]; then
  echo "Error: .env.articlespectrum not found!"
  exit 1
fi

# Copy environment file
echo "Copying environment variables..."
cp .env.articlespectrum .env
echo "Environment configured for Article Spectrum"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
echo "Dependencies installed"
echo ""

# Seed domain in database
echo "Seeding domain in database..."
node tools/scripts/seed-articlespectrum.js
echo "Domain seeded"
echo ""

# Run database migrations
echo "Running database migrations..."
npx prisma generate
npx prisma db push
echo "Database migrations completed"
echo ""

# Build the application
echo "Building application..."
npm run build
echo "Build completed"
echo ""

echo "Article Spectrum is ready to deploy!"
echo ""
echo "Next steps:"
echo "  1. Deploy to Vercel:"
echo "     vercel --prod"
echo ""
echo "  2. Or test locally:"
echo "     npm run dev"
echo ""
