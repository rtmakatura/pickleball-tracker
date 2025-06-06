#!/bin/bash

# Pickleball Tracker Initial Setup Script
# Run this once to set up your repository for the first time

echo "🏓 Pickleball Tracker Initial Setup"
echo "===================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""

# Initialize git repository if not already done
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized!"
else
    echo "✅ Git repository already exists!"
fi

# Set up GitHub remote if not already set
if ! git remote get-url origin &> /dev/null; then
    echo ""
    echo "🔗 Setting up GitHub remote..."
    echo "Enter your GitHub username:"
    read -r GITHUB_USERNAME
    echo "Enter your repository name (default: pickleball-tracker):"
    read -r REPO_NAME
    if [ -z "$REPO_NAME" ]; then
        REPO_NAME="pickleball-tracker"
    fi
    
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "✅ GitHub remote added: https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
else
    echo "✅ GitHub remote already configured!"
fi

# Install dependencies
echo ""
echo "📦 Installing npm dependencies..."
if npm install; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies. Please check your package.json file."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "🔧 Creating .env file..."
    echo "Enter your Firebase configuration values:"
    echo "REACT_APP_FIREBASE_API_KEY (from Firebase console):"
    read -r API_KEY
    echo "REACT_APP_FIREBASE_AUTH_DOMAIN (your-project.firebaseapp.com):"
    read -r AUTH_DOMAIN
    echo "REACT_APP_FIREBASE_PROJECT_ID (your project ID):"
    read -r PROJECT_ID
    echo "REACT_APP_FIREBASE_STORAGE_BUCKET (your-project.firebasestorage.app):"
    read -r STORAGE_BUCKET
    echo "REACT_APP_FIREBASE_MESSAGING_SENDER_ID (sender ID):"
    read -r SENDER_ID
    echo "REACT_APP_FIREBASE_APP_ID (app ID):"
    read -r APP_ID
    
    cat > .env << EOF
REACT_APP_FIREBASE_API_KEY=$API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=$AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=$PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$SENDER_ID
REACT_APP_FIREBASE_APP_ID=$APP_ID
EOF
    echo "✅ .env file created!"
else
    echo "✅ .env file already exists!"
fi

# Make deploy script executable
if [ -f "deploy.sh" ]; then
    chmod +x deploy.sh
    echo "✅ Made deploy.sh executable!"
fi

# Initial commit if no commits exist
if [ -z "$(git log --oneline 2>/dev/null)" ]; then
    echo ""
    echo "📝 Creating initial commit..."
    git add .
    git commit -m "Initial commit: Pickleball Tracker with full functionality"
    echo "✅ Initial commit created!"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your Firebase project is set up"
echo "2. Add your Firebase secrets to GitHub repository settings"
echo "3. Run './deploy.sh' to deploy your changes"
echo "4. Run 'npm start' to test locally"
echo ""
echo "📚 Useful commands:"
echo "  npm start          - Start development server"
echo "  npm run build      - Build for production"
echo "  ./deploy.sh        - Deploy to GitHub Pages"
echo "  git status         - Check current changes"
