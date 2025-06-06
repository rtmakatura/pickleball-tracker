#!/bin/bash

# Pickleball Tracker Deployment Script
# This script will add, commit, and push your changes to GitHub

echo "🏓 Pickleball Tracker Deployment Script"
echo "========================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run 'git init' first."
    exit 1
fi

# Get current branch
BRANCH=$(git branch --show-current)
echo "📋 Current branch: $BRANCH"

# Show current status
echo ""
echo "📊 Current git status:"
git status --short

# Add all changes
echo ""
echo "➕ Adding all changes..."
git add .

# Check if there are any changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit."
    exit 0
fi

# Get commit message from user or use default
echo ""
if [ -z "$1" ]; then
    echo "💬 Enter commit message (or press Enter for default):"
    read -r COMMIT_MESSAGE
    if [ -z "$COMMIT_MESSAGE" ]; then
        COMMIT_MESSAGE="Update Pickleball Tracker with full functionality - $(date '+%Y-%m-%d %H:%M')"
    fi
else
    COMMIT_MESSAGE="$1"
fi

# Commit changes
echo ""
echo "💾 Committing changes..."
git commit -m "$COMMIT_MESSAGE"

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
if git push origin "$BRANCH"; then
    echo ""
    echo "✅ Successfully deployed to GitHub!"
    echo "🔗 Your site will be available at: https://RMakatura.github.io/pickleball-tracker"
    echo "⏱️  GitHub Pages deployment may take a few minutes to complete."
else
    echo ""
    echo "❌ Failed to push to GitHub. Please check your connection and try again."
    exit 1
fi

# Show recent commits
echo ""
echo "📝 Recent commits:"
git log --oneline -5

echo ""
echo "🎉 Deployment complete!"
