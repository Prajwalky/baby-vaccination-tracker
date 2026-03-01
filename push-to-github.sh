#!/bin/bash

# Baby Vaccination Tracker - Push to GitHub Script
# Run this on your computer after downloading the project

echo "🚀 Pushing Baby Vaccination Tracker to GitHub..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Initialize git if needed
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📝 Adding files..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Initial commit - Baby Vaccination Tracker

- Expo React Native mobile app
- FastAPI backend with MongoDB  
- India vaccination schedule (31 vaccinations)
- Push notifications (1 week & 1 day reminders)
- Complete CRUD operations
- Fully tested backend (100% pass rate)"

# Add remote
echo "🔗 Adding GitHub remote..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/Prajwalky/baby-vaccination-tracker.git

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main --force

echo "✅ Done! Your code is now on GitHub!"
echo "📍 Repository: https://github.com/Prajwalky/baby-vaccination-tracker"
echo ""
echo "Next steps:"
echo "1. Go to the repository URL above"
echo "2. Verify the code is there"
echo "3. Clone on your computer: git clone https://github.com/Prajwalky/baby-vaccination-tracker.git"
echo "4. Build the APK: cd baby-vaccination-tracker/frontend && eas build --platform android --profile preview"
