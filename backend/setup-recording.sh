#!/bin/bash

# FinalCast Recording Service Setup Script
echo "🎬 Setting up FinalCast Recording Service..."

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Install required dependencies
echo "📦 Installing cloud storage dependencies..."
npm install aws-sdk@^2.1691.0 cloudinary@^2.5.0 multer@^1.4.5-lts.1 multer-s3@^3.0.1

# Create uploads directory for local storage
echo "📁 Creating uploads directory..."
mkdir -p uploads/recordings

# Copy environment template if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please configure your cloud storage settings."
else
    echo "⚠️  .env file already exists. Please update it with cloud storage settings."
fi

# Check environment configuration
echo ""
echo "🔧 Configuration Steps:"
echo "1. Edit your .env file with your preferred cloud storage provider"
echo "2. For Cloudinary (recommended): Sign up at https://cloudinary.com/users/register/free"
echo "3. For AWS S3: Create an S3 bucket and IAM user at https://console.aws.amazon.com/"
echo "4. Restart your server with: npm run dev"
echo ""
echo "📚 Full setup guide: Check CLOUD_STORAGE_SETUP.md"
echo ""
echo "✅ Setup complete! Configure your .env file and restart the server."
