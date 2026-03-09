#!/bin/bash

# EchoWrite Firebase Functions Deployment Script
# This script will guide you through deploying Firebase Functions

echo "🚀 EchoWrite Firebase Functions Deployment"
echo "=========================================="
echo ""

# Step 1: Login to Firebase
echo "📝 Step 1: Logging in to Firebase..."
echo "   This will open your browser. Please login with your Google account."
echo ""
firebase login

if [ $? -ne 0 ]; then
    echo "❌ Firebase login failed. Please try again."
    exit 1
fi

echo "✅ Firebase login successful!"
echo ""

# Step 2: Initialize Firebase project (if not already done)
echo "🔧 Step 2: Checking Firebase project configuration..."
if [ ! -f ".firebaserc" ]; then
    echo "   Creating .firebaserc file..."
    firebase use --add
else
    echo "   ✓ Firebase project already configured"
fi
echo ""

# Step 3: Set Gemini API Key as secret
echo "🔐 Step 3: Setting Gemini API Key as Firebase secret..."
echo "   This securely stores your API key for Cloud Functions to use."
echo ""
echo "   Your current GEMINI_API_KEY from .env will be used."
GEMINI_KEY=$(grep "^GEMINI_API_KEY=" .env | cut -d'=' -f2 | tr -d '"')

if [ -z "$GEMINI_KEY" ]; then
    echo "❌ GEMINI_API_KEY not found in .env file!"
    exit 1
fi

echo "   Setting secret..."
echo "$GEMINI_KEY" | firebase functions:secrets:set GEMINI_API_KEY

if [ $? -ne 0 ]; then
    echo "❌ Failed to set GEMINI_API_KEY secret"
    exit 1
fi

echo "✅ Gemini API Key stored securely!"
echo ""

# Step 4: Build and Deploy Functions
echo "🚀 Step 4: Deploying Cloud Functions..."
echo "   This may take a few minutes..."
echo ""

cd functions

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi

# Build TypeScript
echo "   Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "   ✅ Build successful!"
echo ""

# Deploy
echo "   Deploying to Firebase..."
cd ..
firebase deploy --only functions:echowrite

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "=========================================="
echo "✅ EchoWrite Cloud Functions deployed!"
echo ""
echo "Next steps:"
echo "1. Test the application by running: npm run dev"
echo "2. The app will automatically use the deployed functions"
echo "3. If functions fail, it will fallback to direct Gemini API"
echo ""
echo "To view function logs: firebase functions:log"
echo "To redeploy: firebase deploy --only functions"
echo "=========================================="
